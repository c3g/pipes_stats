
# pipes-stats

This is a simple portal to see the usage stats of mugqic pipelines.

## Installation

#### Backend

Install `apache` with `./pipes.conf` as configuration. Make sure to adjust the paths.
`./cgi-bin/` must be the CGI scripts directory, and the environment variables:

 - `PIPES_LOG` must point to the log file  
 - `PIPES_DB` must point to be the db filename  

#### Frontend
```
npm install
```

## Commands

Run:  `npm run start`
Build `npm run build`
