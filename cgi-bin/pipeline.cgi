#!/usr/bin/env python3
import cgi
import hashlib
import os
import re
import sqlite3
from datetime import datetime, timezone

query = cgi.FieldStorage()

def param(name, default=''):
    return query[name].value if name in query else default

now = datetime.now(timezone.utc).astimezone()
offset = now.utcoffset()
total_seconds = int(offset.total_seconds())
sign = '+' if total_seconds >= 0 else '-'
hours, remainder = divmod(abs(total_seconds), 3600)
minutes = remainder // 60
tz = f'{sign}{hours:02d}:{minutes:02d}'
timestamp = now.strftime('%Y-%m-%dT%H:%M:%S') + tz

hostname   = param('hostname')
ip         = param('ip')
pipeline   = param('pipeline')
version    = param('version')
protocol   = param('protocol')
steps      = param('steps')
samples    = param('samples')
md5        = param('md5') if re.fullmatch(r'[0-9a-fA-F]{32}', param('md5')) else None
user       = param('user')

PIPELINE_NAMES = {
    'chipseq':              'ChipSeq',
    'chipseq1':             'ChipSeq',
    'dnaseq':               'DnaSeq',
    'episeq':               'EpiSeq',
    'pacbioassembly':       'PacBioAssembly',
    'rnaseq':               'RnaSeq',
    'covseq':               'CoVSeq',
    'rnaseq-du':            'RnaSeqDeNovoAssembly',
    'rnaseqdenovoassembly': 'RnaSeqDeNovoAssembly',
}

pipeline_normalized = PIPELINE_NAMES.get(pipeline.lower(), pipeline)
user_hash = hashlib.sha256(user.encode()).hexdigest() if user else None

request_ip      = os.environ.get('REMOTE_ADDR', '')
request_method  = os.environ.get('REQUEST_METHOD', '')
http_user_agent = os.environ.get('HTTP_USER_AGENT', '')

print('Content-Type: text/plain')
print()

log_path = os.getenv('PIPES_LOG', '/data/mugqic_pipelines.log')
with open(log_path, 'a') as f:
    f.write('\t'.join([
        timestamp,
        f'request_ip={request_ip}',
        f'request_method={request_method}',
        f'http_user_agent={http_user_agent}',
        f'hostname={hostname}',
        f'host_ip={ip}',
        f'pipeline={pipeline}',
        f'version={version}',
        f'protocol={protocol}',
        f'steps={steps}',
        f'nb_samples={samples}',
        f'md5={md5 or ""}',
        f'user={user}',
    ]) + '\n')

db_path = os.getenv('PIPES_DB', '/data/pipes_stats.db')
db = sqlite3.connect(db_path)
db.execute('''
    INSERT OR IGNORE INTO logs (
        date, request_ip, request_method, http_user_agent,
        hostname, host_ip, pipeline, version, protocol,
        steps, nb_samples, md5, user_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', (
    timestamp, request_ip, request_method, http_user_agent,
    hostname, ip, pipeline_normalized, version, protocol,
    steps, int(samples) if samples.isdigit() else 0, md5, user_hash,
))
db.commit()
db.close()
