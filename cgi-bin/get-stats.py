#!/usr/bin/env python2
from __future__ import print_function
import os
import sys
import json
import cgi
import re
from time import time
from dateutil.relativedelta import relativedelta
from datetime import date, datetime
from utils import db, fetchOne, printJSON, printError
from models import k, keys, queries

def main():
  args = cgi.FieldStorage()


  dateFrom  = get(args, 'from') or fetchOne('SELECT MIN(date) FROM logs;')[0]
  dateTo    = get(args, 'to')   or fetchOne('SELECT MAX(date) FROM logs;')[0]
  merge     = True if get(args, 'merge') == 'true' else False

  (query, values) = createQuery(dateFrom, dateTo, merge)

  cursor = db.cursor()
  cursor.execute(query, values)

  rows = cursor.fetchall()

  stats = generateStats(rows)

  params = {
    'from': dateFrom,
    'to': dateTo,
    'merge': merge,
    'minDate': fetchOne('SELECT MIN(date) FROM logs;')[0],
    'maxDate': fetchOne('SELECT MAX(date) FROM logs;')[0]
  }

  printJSON({
    # 'query': query,
    # 'values': values,
    'params': params,
    'stats': stats
  })

def createQuery(dateFrom, dateTo, merge):
  """
  Creates the SQL query and values to from given parameters
  """
  clauses = ['1 = 1']
  values = []

  if dateFrom != None:
    clauses.append('date >= datetime(?)')
    values.append(dateFrom)

  if dateTo != None:
    clauses.append('date <= datetime(?)')
    values.append(dateTo)

  query = (queries.selectAll if not merge else queries.selectAllMerged) % (' AND '.join(clauses))

  return (query, tuple(values))

def generateStats(records):
  """
  Generate stats by pipeline by month for given records
  """
  statsByPipeline = {}
  submissionsByCluster = {}
  minDate = parseDate(records[0][k.date])
  maxDate = parseDate(records[0][k.date])

  totalSamples = 0
  totalSubmissions = len(records)

  # First, split records by pipeline

  recordsByPipeline = {}
  for record in records:
    pipeline = record[k.pipeline]

    if pipeline not in recordsByPipeline:
      recordsByPipeline[pipeline] = []

    recordsByPipeline[pipeline].append(record)

    # Also keep in memory the extreme dates

    date = parseDate(record[k.date])

    if date < minDate:
      minDate = date
    if date > maxDate:
      maxDate = date

  # Then, split each pipeline records by month

  indexByMonth = getMonthsInRange(minDate, maxDate)

  for pipeline in recordsByPipeline.keys():
    records = recordsByPipeline[pipeline]

    pipelineSamples = 0
    pipelineSubmissions = len(records)

    stat_per_month = {key: 0 for key in indexByMonth.keys()}

    for record in records:
      month = getMonthYear(record[k.date])

      stat_per_month[month] += record[k.nb_samples]
      pipelineSamples += record[k.nb_samples]
      cluster = getCluster(record[k.hostname])

      submissionsByCluster[cluster] = submissionsByCluster.get(cluster, 0)
      submissionsByCluster[cluster] += 1

    statsByPipeline[pipeline] = {
      'samples': pipelineSamples,
      'submissions': pipelineSubmissions,
      'average': float(pipelineSamples) / pipelineSubmissions,
      'months':  [{'samples': val, 'month': key} for key, val in sorted(stat_per_month.items())]
    }

  return {
    'samples': totalSamples,
    'submissions': totalSubmissions,
    'average': float(totalSamples) / totalSubmissions,
    'byPipeline': statsByPipeline,
    'submissionsByCluster': submissionsByCluster
  }


def getMonthYear(date):
  if type(date) != datetime:
    return date[0:4] + '-' + date[5:7].rjust(2, '0')
  return str(date.year) + '-' + str(date.month).rjust(2, '0')

def getMonthsInRange(start, end):
  if start > end:
    (end, start) = (start, end)

  months = {}

  i = 0
  current = start
  while current < end:
    months[getMonthYear(current)] = i - 1
    current = start + relativedelta(months=i)
    i = i + 1
  months[getMonthYear(current)] = i - 1

  return months

def get(args, key):
  if key in args:
    return args[key].value
  return None

def parseDate(date):
  """
  Parses a datetime in format "2017-10-31T12:22:30-04:00"
  """
  year  = int(date[0:4])
  month = int(date[5:7])
  day   = int(date[8:10])
  return datetime(year, month, day)

def getCluster(hostname):
  if hostname.startswith('abacus'):
    return 'Abacus'
  if hostname.startswith('qlogin'):
    return 'Sick Kids'
  if hostname.startswith('ip'):
    return 'Mammouth'
  if hostname.startswith('lg-'):
    return 'Guillimin'
  if hostname.startswith('beluga') or hostname.startswith('blg'):
    return 'Beluga'
  if hostname.startswith('cedar') or hostname.startswith('cdr'):
    return 'Cedar'
  if hostname.startswith('Graham') or hostname.startswith('gra'):
    return 'Graham'
  if hostname.startswith('briaree'):
    return 'Briaree'
  if hostname.startswith('colosse'):
    return 'Colosse'
  return 'Other'

if __name__ == "__main__":
  main()
