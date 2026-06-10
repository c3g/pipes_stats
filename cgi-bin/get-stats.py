#!/usr/bin/env python3
import os
import sys
import json
import cgi
import re
from time import time
from dateutil.relativedelta import relativedelta
from datetime import date, datetime, timedelta
from utils import db, fetchOne, printJSON, printError
from models import k, keys, queries

def main():
  args = cgi.FieldStorage()


  dateFrom    = get(args, 'from') or fetchOne('SELECT MIN(date) FROM logs;')[0]
  dateTo      = get(args, 'to')   or fetchOne('SELECT MAX(date) FROM logs;')[0]
  merge       = True if get(args, 'merge') == 'true' else False
  cluster     = get(args, 'cluster') or None
  granularity = get(args, 'granularity') or 'month'
  if granularity not in ('week', 'month'):
    granularity = 'month'

  (query, values) = createQuery(dateFrom, dateTo, merge)

  cursor = db.cursor()
  cursor.execute(query, values)

  rows = cursor.fetchall()

  stats = generateStats(rows, cluster_filter=cluster, granularity=granularity)

  params = {
    'from': dateFrom,
    'to': dateTo,
    'merge': merge,
    'granularity': granularity,
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

def generateStats(records, cluster_filter=None, granularity='month'):
  """
  Generate stats by pipeline by month for given records.
  submissionsByCluster always reflects ALL records; byPipeline is filtered by cluster_filter.
  """
  if not records:
    return {
      'samples': 0, 'submissions': 0, 'average': 0.0, 'steps': 0,
      'byPipeline': {}, 'submissionsByCluster': {}, 'uniqueUsersByCluster': {}
    }

  statsByPipeline = {}
  submissionsByCluster = {}
  usersByCluster = {}

  # Cluster summary from ALL records regardless of filter
  for record in records:
    cluster = getCluster(record[k.hostname])
    submissionsByCluster[cluster] = submissionsByCluster.get(cluster, 0) + 1
    user_hash = record[k.user_hash]
    if user_hash:
      usersByCluster.setdefault(cluster, set()).add(user_hash)

  uniqueUsersByCluster = {cluster: len(users) for cluster, users in usersByCluster.items()}

  # Apply cluster filter only for pipeline stats
  pipeline_records = [r for r in records if getCluster(r[k.hostname]) == cluster_filter] \
    if cluster_filter else records

  if not pipeline_records:
    return {
      'samples': 0, 'submissions': 0, 'average': 0.0, 'steps': 0,
      'byPipeline': {}, 'submissionsByCluster': submissionsByCluster,
      'uniqueUsersByCluster': uniqueUsersByCluster
    }

  minDate = parseDate(pipeline_records[0][k.date])
  maxDate = parseDate(pipeline_records[0][k.date])

  totalSamples = 0
  totalSubmissions = len(pipeline_records)
  totalSteps = 0

  recordsByPipeline = {}
  for record in pipeline_records:
    pipeline = record[k.pipeline]
    if pipeline not in recordsByPipeline:
      recordsByPipeline[pipeline] = []
    recordsByPipeline[pipeline].append(record)

    date = parseDate(record[k.date])
    if date < minDate:
      minDate = date
    if date > maxDate:
      maxDate = date

  if granularity == 'week':
    indexByPeriod = getWeeksInRange(minDate, maxDate)
    getPeriodKey = lambda d: getISOWeekKey(parseDate(d))
  else:
    indexByPeriod = getMonthsInRange(minDate, maxDate)
    getPeriodKey = getMonthYear

  for pipeline in recordsByPipeline.keys():
    recs = recordsByPipeline[pipeline]
    pipelineSamples = 0
    pipelineSubmissions = len(recs)
    pipelineSteps = 0
    stat_per_period = {key: 0 for key in indexByPeriod.keys()}
    clusterBreakdown = {}

    for record in recs:
      period = getPeriodKey(record[k.date])
      stat_per_period[period] += record[k.nb_samples]
      pipelineSamples += record[k.nb_samples]
      pipelineSteps += countSteps(record[k.steps])
      cluster = getCluster(record[k.hostname])
      clusterBreakdown[cluster] = clusterBreakdown.get(cluster, 0) + 1

    totalSamples += pipelineSamples
    totalSteps += pipelineSteps

    statsByPipeline[pipeline] = {
      'samples': pipelineSamples,
      'submissions': pipelineSubmissions,
      'average': round(float(pipelineSamples) / pipelineSubmissions),
      'steps': pipelineSteps,
      'months':  [{'samples': val, 'month': key} for key, val in sorted(stat_per_period.items())],
      'clusterBreakdown': clusterBreakdown,
    }

  return {
    'samples': totalSamples,
    'submissions': totalSubmissions,
    'average': round(float(totalSamples) / totalSubmissions) if totalSubmissions else 0,
    'steps': totalSteps,
    'byPipeline': statsByPipeline,
    'submissionsByCluster': submissionsByCluster,
    'uniqueUsersByCluster': uniqueUsersByCluster
  }


def countSteps(steps_str):
  if not steps_str:
    return 0
  m = re.match(r'^\d+-(\d+)$', steps_str)
  if m:
    return int(m.group(1))
  return len(steps_str.split(','))

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

def getISOWeekKey(date_obj):
  iso_year, iso_week, _ = date_obj.isocalendar()
  return f"{iso_year}-W{iso_week:02d}"

def getWeeksInRange(start, end):
  monday = start - timedelta(days=start.weekday())
  weeks = {}
  i = 0
  while monday <= end:
    weeks[getISOWeekKey(monday)] = i
    monday += timedelta(weeks=1)
    i += 1
  return weeks

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
  if hostname.startswith('abacus') or 'ferrier.genome.mcgill.ca' in hostname or re.match(r'^f[349]', hostname):
    return 'Abacus'
  if re.match(r'^f[bc]\d', hostname):
    return 'Fir'
  if hostname.startswith('qlogin') or 'sickkids' in hostname:
    return 'Sick Kids'
  if hostname.startswith('ip'):
    return 'Mammouth'
  if hostname.startswith('lg-'):
    return 'Guillimin'
  if hostname.startswith('narval') or hostname.startswith('nc'):
    return 'Narval'
  if hostname.startswith('beluga') or hostname.startswith('blg') or hostname.startswith('bc'):
    return 'Beluga'
  if hostname.startswith('cedar') or hostname.startswith('cdr'):
    return 'Cedar'
  if hostname.startswith('Graham') or hostname.startswith('gra'):
    return 'Graham'
  if hostname.startswith('briaree'):
    return 'Briaree'
  if hostname.startswith('colosse'):
    return 'Colosse'
  if hostname.startswith('rorqual'):
    return 'Rorqual'
  if hostname.startswith('cardinal'):
    return 'Cardinal'
  if 'iric' in hostname:
    return 'IRIC'
  if 'nibi' in hostname:
    return 'Nibi'
  if 'ulaval' in hostname:
    return 'ULaval'
  if 'inspq' in hostname:
    return 'INSPQ'
  return 'Other'

if __name__ == "__main__":
  main()
