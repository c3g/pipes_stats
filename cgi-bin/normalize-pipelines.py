#!/usr/bin/env python3
"""
Normalize legacy pipeline names in the database.

Maintenance script for the live DB. generate-database.py already applies
normalize_pipeline() and split_pipeline_version() at generation time, so
this script is only needed to fix entries that arrived between two full
DB regenerations.

Handles two legacy patterns:
  1. Inconsistent casing:  chipSeq  -> ChipSeq
  2. Embedded version:     chipSeq-1.3-beta -> pipeline=ChipSeq, version=1.3-beta

Usage:
    PIPES_DB=/path/to/pipes_stats.db python3 normalize-pipelines.py
    PIPES_DB=/path/to/pipes_stats.db python3 normalize-pipelines.py --dry-run
"""
import os
import sys
import sqlite3
from pipelines import normalize_pipeline, split_pipeline_version

def main():
    dry_run = '--dry-run' in sys.argv

    db_path = os.getenv('PIPES_DB')
    if not db_path:
        print('ERROR: PIPES_DB environment variable not set.', file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(db_path):
        print(f'ERROR: database not found: {db_path}', file=sys.stderr)
        sys.exit(1)

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    total_changed = 0

    cur.execute('SELECT id, pipeline, version FROM logs')
    for (row_id, pipeline, version) in cur.fetchall():
        base, embedded_ver = split_pipeline_version(pipeline)
        canonical = normalize_pipeline(base)
        new_version = version or embedded_ver or ''

        if canonical == pipeline and new_version == (version or ''):
            continue

        print(f"  {'[DRY RUN] ' if dry_run else ''}"
              f"id={row_id}: pipeline '{pipeline}' -> '{canonical}'"
              + (f", version '' -> '{new_version}'" if new_version != (version or '') else ''))
        if not dry_run:
            cur.execute(
                'UPDATE logs SET pipeline = ?, version = ? WHERE id = ?',
                (canonical, new_version, row_id)
            )
        total_changed += 1

    if total_changed == 0:
        print('No changes needed — pipeline names are already normalized.')
    elif dry_run:
        print(f'\n{total_changed} rows would be updated. Run without --dry-run to apply.')
    else:
        con.commit()
        print(f'\n{total_changed} rows updated and committed.')

    con.close()

if __name__ == '__main__':
    main()
