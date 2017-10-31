#!/usr/bin/python
from __future__ import print_function
import os
import sys
import json
import cgi
import re
import dateutil.parser
from dateutil.relativedelta import relativedelta
from datetime import date, datetime
from utils import db, fetchOne, printJSON, printError
from models import k, keys, queries

def main():
  args = cgi.FieldStorage()

  dateFrom = get(args, 'from') or fetchOne('SELECT MIN(date) FROM logs;')[0]
  dateTo   = get(args, 'to')   or fetchOne('SELECT MAX(date) FROM logs;')[0]
  merge    = True if get(args, 'merge') is 'true' else False

  (query, values) = createQuery(dateFrom, dateTo, merge)

  cursor = db.cursor()
  cursor.execute(query, values)

  rows = cursor.fetchall()

  stats = generateStats(rows)

  # printJSON({ 'ok': True, 'query': query, 'values': values })
  printJSON({
    'ok': True,
    'query': query,
    'values': values,
    'dateFrom': dateFrom,
    'dateTo': dateTo,
    'data': stats
    # 'data': map(lambda t: list(t), rows)
  })

def createQuery(dateFrom, dateTo, merge):
  """
  Creates the SQL query and values to from given parameters
  """
  clauses = ['1 = 1']
  values = []

  if dateFrom != None:
    clauses.append("date >= datetime(?)")
    values.append(dateFrom)

  if dateTo != None:
    clauses.append("date <= datetime(?)")
    values.append(dateTo)


  query = (queries.selectAll if not merge else queries.selectAllMerged) % (' AND '.join(clauses))

  return (query, tuple(values))


def generateStats(records):
  """
  Generate stats by pipeline by month for given records
  """
  statsByPipeline = {}
  minDate = dateutil.parser.parse(records[0][k.date])
  maxDate = dateutil.parser.parse(records[0][k.date])

  # First, split records by pipeline

  recordsByPipeline = {}
  for record in records:
    pipeline = record[k.pipeline]

    if pipeline not in recordsByPipeline:
      recordsByPipeline[pipeline] = []

    recordsByPipeline[pipeline].append(record)

    # Also keep in memory the extreme dates

    date = dateutil.parser.parse(record[k.date])

    if date < minDate:
      minDate = date
    if date > maxDate:
      maxDate = date


  # Then, split each pipeline records by month

  indexByMonth = getMonthsInRange(minDate, maxDate)

  for pipeline in recordsByPipeline.keys():
    records = recordsByPipeline[pipeline]

    totalSamples = 0
    totalSubmissions = len(records)

    statsByMonth = sorted(
      map(lambda m: { 'month': m, 'samples': 0, 'submissions': 0 }, indexByMonth.keys()),
      lambda a, b: indexByMonth[a['month']] - indexByMonth[b['month']]
    )

    # printJSON({ 'map': indexByMonth, 'stats': statsByMonth })

    for record in records:
      month = getMonthYear(record[k.date])
      index = indexByMonth[month]

      currentStats = statsByMonth[index]
      currentStats['samples'] += record[k.nb_samples]
      currentStats['submissions'] += 1
      totalSamples += record[k.nb_samples]

    statsByPipeline[pipeline] = {
      'samples': totalSamples,
      'submissions': totalSubmissions,
      'average': float(totalSamples) / totalSubmissions,
      'months': statsByMonth
    }

  return statsByPipeline


def getMonthYear(date):
  if type(date) != datetime:
    date = dateutil.parser.parse(date)
  return str(date.year) + '-' + str(date.month).rjust(2, '0')

def getMonthsInRange(start, end):
  if start > end:
    (end, start) = (start, end)

  months = {}

  i = 0
  current = start + relativedelta(months=i)
  while current < end:
    months[getMonthYear(current)] = i - 1
    current = start + relativedelta(months=i)
    i = i + 1

  return months

def get(args, key):
  if key in args:
    return args[key].value
  return None




if __name__ == "__main__":
  main()
