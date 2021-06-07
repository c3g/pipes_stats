
# pipes-stats

This is a simple portal to see the usage stats of mugqic pipelines.

## Installation

#### Backend

Install `apache` with `./pipes.conf` as configuration. Make sure to adjust the paths.
`./cgi-bin/` must be the CGI scripts directory, and the `./build` directory (created
in the frontend step below) must be the document root of the apache server.

And for the environment variables:

 - `PIPES_LOG` must point to the log file  
 - `PIPES_DB` must point to be the sqlite db path (managed by the app, just need to be read/writeable)  

#### Frontend
```
npm install
npm run build
```

## Commands

Run:  `npm run start`
Build `npm run build`
