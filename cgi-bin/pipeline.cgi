#!/usr/bin/env python3
import cgi
import hashlib
import os
import re
import sqlite3
import time
from datetime import datetime, timezone
from pipelines import normalize_pipeline

RATE_LIMIT = 20   # max requests per IP
RATE_WINDOW = 60  # seconds

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

pipeline_normalized = normalize_pipeline(pipeline)
user_hash = hashlib.sha256(user.encode()).hexdigest() if user else None

request_ip      = os.environ.get('REMOTE_ADDR', '')
request_method  = os.environ.get('REQUEST_METHOD', '')
http_user_agent = os.environ.get('HTTP_USER_AGENT', '')

db_path = os.getenv('PIPES_DB', '/data/pipes_stats.db')
db = sqlite3.connect(db_path)
db.execute('''
    CREATE TABLE IF NOT EXISTS rate_limit (ip TEXT NOT NULL, ts INTEGER NOT NULL)
''')
now_ts = int(time.time())
window_start = now_ts - RATE_WINDOW
db.execute('DELETE FROM rate_limit WHERE ts < ?', (window_start,))
count = db.execute(
    'SELECT COUNT(*) FROM rate_limit WHERE ip = ? AND ts >= ?',
    (request_ip, window_start)
).fetchone()[0]
if count >= RATE_LIMIT:
    db.close()
    print('Status: 429 Too Many Requests')
    print('Content-Type: text/plain')
    print()
    print('Rate limit exceeded')
    raise SystemExit
db.execute('INSERT INTO rate_limit (ip, ts) VALUES (?, ?)', (request_ip, now_ts))
db.commit()

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
