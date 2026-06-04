#!/usr/bin/env python3
"""
Remove log entries with empty pipeline names from the database.

Some old log entries were recorded without a pipeline name (pipeline = '').
These entries cannot be attributed to any pipeline and skew the stats UI.
This script deletes them.

Usage:
    PIPES_DB=/path/to/pipes_stats.db python3 clean-empty-pipelines.py

    Or with --dry-run to preview changes without applying them:
    PIPES_DB=/path/to/pipes_stats.db python3 clean-empty-pipelines.py --dry-run
"""
import os
import sys
import sqlite3

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

    cur.execute("SELECT COUNT(*) FROM logs WHERE pipeline = '' OR pipeline IS NULL")
    (count,) = cur.fetchone()

    if count == 0:
        print('No empty-pipeline entries found — nothing to do.')
        con.close()
        return

    print(f"{'[DRY RUN] ' if dry_run else ''}DELETE {count} rows with empty pipeline name")

    if not dry_run:
        cur.execute("DELETE FROM logs WHERE pipeline = '' OR pipeline IS NULL")
        con.commit()
        print(f'\n{count} rows deleted and committed.')
    else:
        print(f'\n{count} rows would be deleted. Run without --dry-run to apply.')

    con.close()

if __name__ == '__main__':
    main()
