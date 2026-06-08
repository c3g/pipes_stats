#!/usr/bin/env python3
import os
import re
import hashlib
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

    date = tokens[0]

    kv = {}
    for token in tokens[1:]:
        m = re.match(r'^(\w+)=(.*)', token)
        if m:
            kv[m.group(1)] = m.group(2)

    request_ip      = kv.get('request_ip', '')
    request_method  = kv.get('request_method', '')
    http_user_agent = kv.get('http_user_agent', '')
    hostname        = kv.get('hostname', '')
    host_ip         = kv.get('host_ip', '')
    pipeline        = normalize_pipeline(kv.get('pipeline', ''))
    version         = kv.get('version', '')
    protocol        = kv.get('protocol', '')
    steps           = kv.get('steps', '')
    nb_samples      = parseInt(kv.get('nb_samples', '0'))
    md5             = parseMd5(kv.get('md5', ''))
    user            = kv.get('user', '')
    user_hash       = hashlib.sha256(user.encode()).hexdigest() if user else None

    return (
        date,
        request_ip,
        request_method,
        http_user_agent,
        hostname,
        host_ip,
        pipeline,
        version,
        protocol,
        steps,
        nb_samples,
        md5,
        user_hash
    )

PIPELINE_NAMES = {
    'chipseq':              'ChipSeq',
    'chipseq1':             'ChipSeq',
    'dnaseq':               'DnaSeq',
    'episeq':               'EpiSeq',
    'pacbioassembly':       'PacBioAssembly',
    'rnaseq':               'RnaSeq',
    'rnaseqdenovoassembly': 'RnaSeqDeNovoAssembly',
}

def normalize_pipeline(name):
    return PIPELINE_NAMES.get(name.lower(), name)

def parseInt(string):
    try:
        return int(string)
    except:
        return 0

def parseMd5(string):
    return string if re.fullmatch(r'[0-9a-fA-F]{32}', string) else None


if __name__ == "__main__":
    main()
