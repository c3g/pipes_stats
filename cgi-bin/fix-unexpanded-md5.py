#!/usr/bin/env python3
"""
Null out md5 values that were stored as the unexpanded shell literal '$LOG_MD5'.

Maintenance script for the live DB. generate-database.py already rejects
non-hex md5 values (including '$LOG_MD5') via parseMd5() at generation time,
so this script is only needed to fix entries that arrived between two full
DB regenerations.

A bug in the GenPipes pipeline reporter caused the shell variable $LOG_MD5 to
be passed verbatim to the endpoint instead of the actual hash. These rows have
md5 = '$LOG_MD5' in the database, which collides on the UNIQUE constraint and
causes rows to be silently dropped on DB rebuilds.

This script sets those md5 values to NULL so each row is preserved as a
distinct entry.

Usage:
    PIPES_DB=/path/to/pipes_stats.db python3 fix-unexpanded-md5.py

    Or with --dry-run to preview changes without applying them:
    PIPES_DB=/path/to/pipes_stats.db python3 fix-unexpanded-md5.py --dry-run
"""
import os
import sys
import sqlite3

UNEXPANDED_VALUE = '$LOG_MD5'

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

    cur.execute("SELECT COUNT(*) FROM logs WHERE md5 = ?", (UNEXPANDED_VALUE,))
    (count,) = cur.fetchone()

    if count == 0:
        print("No entries with md5 = '$LOG_MD5' found — nothing to do.")
        con.close()
        return

    print(f"{'[DRY RUN] ' if dry_run else ''}UPDATE {count} rows: set md5 = NULL where md5 = '{UNEXPANDED_VALUE}'")

    if not dry_run:
        cur.execute("UPDATE logs SET md5 = NULL WHERE md5 = ?", (UNEXPANDED_VALUE,))
        con.commit()
        print(f'\n{count} rows updated and committed.')
    else:
        print(f'\n{count} rows would be updated. Run without --dry-run to apply.')

    con.close()

if __name__ == '__main__':
    main()
