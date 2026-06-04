#!/usr/bin/env python3
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

    cur.execute('PRAGMA table_info(logs)')
    columns = [row[1] for row in cur.fetchall()]
    if 'user_hash' in columns:
        print('user_hash column already exists — nothing to do.')
        con.close()
        return

    print(f"{'[DRY RUN] ' if dry_run else ''}ALTER TABLE logs ADD COLUMN user_hash varchar(64) null")
    if not dry_run:
        cur.execute('ALTER TABLE logs ADD COLUMN user_hash varchar(64) null')
        con.commit()
        print('Column added. Existing rows will have user_hash = NULL until the DB is regenerated from the log.')
    else:
        print('\nRun without --dry-run to apply.')

    con.close()


if __name__ == '__main__':
    main()
