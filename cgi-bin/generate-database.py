#!/usr/bin/env python2
from __future__ import print_function
import os
import re
from utils import db, printJSON
from models import queries

logFile = os.getenv('PIPES_LOG')

with open(logFile) as f:
    logs = f.readlines()


def main():
    db.execute(queries.dropTable)
    db.execute(queries.createTable)

    values = map(logToTuple, logs)

    db.executemany(queries.insertLog, values)
    db.commit()

    printJSON({})


def logToTuple(line):
    """
    Returns a tuple from a log line
    """

    tokens = line.rstrip('\n').split('\t')

    if len(tokens) < 9:
        printJSON({'ok': False,
                   'message': 'Error while converting line to tokens: not enough tokens.',
                   'tokens': tokens,
                   'line': line})

    date            = tokens[0]
    request_ip      = removeKeyName(tokens[1])
    request_method  = removeKeyName(tokens[2])
    http_user_agent = removeKeyName(tokens[3])
    hostname        = removeKeyName(tokens[4])
    host_ip         = removeKeyName(tokens[5])
    steps           = removeKeyName(tokens[7])
    nb_samples      = parseInt(removeKeyName(tokens[8]))
    md5             = removeKeyName(tokens[9], None) if len(tokens) >= 10 else None


    pipelineAndVersion = removeKeyName(tokens[6])
    pipeline = match('^[^-]*', pipelineAndVersion)
    version  = match('(?<=-).*', pipelineAndVersion)

    return (
        date,
        request_ip,
        request_method,
        http_user_agent,
        hostname,
        host_ip,
        pipeline,
        version,
        steps,
        nb_samples,
        md5
    )

def match(pattern, string):
    m = re.search(pattern, string)
    if m:
        return m.group(0)
    return ''

def removeKeyName(token, defaultValue=''):
    result = re.sub('^\w+=', '', token)
    if result == '':
        return defaultValue
    return result

def parseInt(string):
    try:
        return int(string)
    except:
        return 0


if __name__ == "__main__":
    main()
