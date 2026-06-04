#!/usr/bin/env python3
"""
Normalize legacy pipeline names in the database.

Old pipeline log entries used inconsistent casing (e.g. chipSeq, dnaSeq).
This script updates those rows to the canonical PascalCase names used by
current GenPipes versions, so they aggregate correctly in the stats UI.

Usage:
    PIPES_DB=/path/to/pipes_stats.db python3 normalize-pipelines.py

    Or with --dry-run to preview changes without applying them:
    PIPES_DB=/path/to/pipes_stats.db python3 normalize-pipelines.py --dry-run
"""
import os
import sys
import sqlite3

PIPELINE_NAMES = {
    'chipseq':              'ChipSeq',
    'chipseq1':             'ChipSeq',
    'dnaseq':               'DnaSeq',
    'episeq':               'EpiSeq',
    'pacbioassembly':       'PacBioAssembly',
    'rnaseq':               'RnaSeq',
    'rnaseqdenovoassembly': 'RnaSeqDeNovoAssembly',
}

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

    for old_lower, canonical in PIPELINE_NAMES.items():
        cur.execute(
            'SELECT pipeline, COUNT(*) FROM logs WHERE LOWER(pipeline) = ? GROUP BY pipeline',
            (old_lower,)
        )
        rows = cur.fetchall()
        for (actual_name, count) in rows:
            if actual_name == canonical:
                continue
            print(f"  {'[DRY RUN] ' if dry_run else ''}UPDATE {count} rows: '{actual_name}' -> '{canonical}'")
            if not dry_run:
                cur.execute(
                    'UPDATE logs SET pipeline = ? WHERE pipeline = ?',
                    (canonical, actual_name)
                )
            total_changed += count

    if total_changed == 0:
        print('No changes needed — pipeline names are already normalized.')
        return

    if dry_run:
        print(f'\n{total_changed} rows would be updated. Run without --dry-run to apply.')
    else:
        con.commit()
        print(f'\n{total_changed} rows updated and committed.')

    con.close()

if __name__ == '__main__':
    main()
