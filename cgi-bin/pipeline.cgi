#!/usr/bin/env python3
import cgi
import os
from datetime import datetime, timezone, timedelta

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
md5        = param('md5')

print('Content-Type: text/plain')
print()

log_path = os.getenv('PIPES_LOG', '/data/mugqic_pipelines.log')
with open(log_path, 'a') as f:
    f.write('\t'.join([
        timestamp,
        f'request_ip={os.environ.get("REMOTE_ADDR", "")}',
        f'request_method={os.environ.get("REQUEST_METHOD", "")}',
        f'http_user_agent={os.environ.get("HTTP_USER_AGENT", "")}',
        f'hostname={hostname}',
        f'host_ip={ip}',
        f'pipeline={pipeline}',
        f'version={version}',
        f'protocol={protocol}',
        f'steps={steps}',
        f'nb_samples={samples}',
        f'md5={md5}',
    ]) + '\n')
