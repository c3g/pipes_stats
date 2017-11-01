#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2017 rgregoir <rgregoir@LAURIER>
#
# Distributed under terms of the MIT license.

from utils import dotdict

keys = [
    'id'
  , 'date'
  , 'request_ip'
  , 'request_method'
  , 'http_user_agent'
  , 'hostname'
  , 'host_ip'
  , 'pipeline'
  , 'version'
  , 'steps'
  , 'nb_samples'
]

k = dotdict({})
k.id              = 0
k.date            = 1
k.request_ip      = 2
k.request_method  = 3
k.http_user_agent = 4
k.hostname        = 5
k.host_ip         = 6
k.pipeline        = 7
k.version         = 8
k.steps           = 9
k.nb_samples      = 10

queries = dotdict({})

queries.dropTable = '''
    DROP TABLE IF EXISTS logs;
'''

queries.createTable = '''
    CREATE TABLE logs (
        id              integer      primary key autoincrement
      , date            datetime     not null
      , request_ip      varchar(46)  not null
      , request_method  varchar(10)  not null
      , http_user_agent varchar(150) not null
      , hostname        varchar(100) not null
      , host_ip         varchar(46)  not null
      , pipeline        varchar(100) not null
      , version         varchar(100) null
      , steps           text         not null
      , nb_samples      integer      not null
    );
'''

queries.insertLog = '''
    INSERT INTO logs (
        date
      , request_ip
      , request_method
      , http_user_agent
      , hostname
      , host_ip
      , pipeline
      , version
      , steps
      , nb_samples
    )
    VALUES (? , ? , ?, ? , ? , ? , ? , ? , ?, ?);
'''

queries.selectAllMerged = '''
    SELECT id
         , date
         , request_ip
         , request_method
         , http_user_agent
         , hostname
         , host_ip
         , pipeline
         , version
         , steps
         , nb_samples
      FROM logs
     WHERE %s
    ;
'''

queries.selectAll = '''
    SELECT id
         , date
         , request_ip
         , request_method
         , http_user_agent
         , hostname
         , host_ip
         , pipeline || '-' || version as pipeline
         , version
         , steps
         , nb_samples
      FROM logs
     WHERE %s
    ;
'''
