
# pipes-stats

This is a simple portal to see the usage stats of mugqic pipelines.

The portal lives here:
https://bigbrother.c3g-app.sd4h.ca


## Installation

Just run the conttainer found here: 
https://quay.io/repository/c3genomics/pipes_stats
The server run on port 8081
two files, `pipes_stats.db` and `mugqic_pipelines.log` need to be in the conatainers `/data` folder

run:

```
podman run --rm -it  -p 8888:8081 -v <path to data data on host>:/data:Z   quay.io/c3genomics/pipes_stats
```



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

#### Development

In development, you'd run `npm start`. The `.proxy` field in `package.json` indicates
to the webpack-dev-server to proxy API requests to the running apache server, make sure
to adjust it if apache is running on a different port than `8080` on your local setup.
This only applies for development. In production, apache serves both the CGI scripts
and the frontend files in `./build`.
