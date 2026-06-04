#! /usr/bin/env python3
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2017 rgregoir <rgregoir@LAURIER>
#
# Distributed under terms of the MIT license.

import os
import json
import sqlite3

db = sqlite3.connect(os.getenv('PIPES_DB'))

# Migrate: add protocol column if the DB was created before it was introduced
try:
    db.execute('ALTER TABLE logs ADD COLUMN protocol varchar(100) NULL')
    db.commit()
except sqlite3.OperationalError:
    pass


def fetchOne(query, values = None):
    cursor = db.cursor()
    if values:
        cursor.execute(query, values)
    else:
        cursor.execute(query)
    return cursor.fetchone()

def fetchAll(query, values = None):
    cursor = db.cursor()
    if values:
        cursor.execute(query, values)
    else:
        cursor.execute(query)
    return cursor.fetchall()

def printJSON(data):
    res = { 'ok': True, 'data': data }
    print('Content-Type: application/json')
    print('')
    print(json.dumps(res, indent=2, sort_keys=True))
    exit()

def printError(message):
    printJSON({ 'ok': False, 'message': message })

class dotdict(dict):
    """dot.notation access to dictionary attributes"""
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__
