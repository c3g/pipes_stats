
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

## Database maintenance

The database is built from the log file (`mugqic_pipelines.log`) by `generate-database.py`. This script drops and recreates the entire `pipes_stats.db` from scratch, so it should be run:

- **On first deployment**, before the app is used, to seed the database from an existing log file.
- **After log rotation or log file replacement**, to sync the database with the new log contents.
- **If the database becomes corrupt or out of sync** with the log file.

It does not need to run on a schedule — `pipeline.cgi` appends new entries to the log in real time, and the database is updated immediately on each submission.

For security reasons `generate-database.py` is restricted to localhost. To trigger a rebuild, SSH into the server and run:

```bash
curl http://localhost:8081/cgi-bin/generate-database.py
```

Or, if running via the container directly:

```bash
podman exec <container-name> curl http://localhost:8081/cgi-bin/generate-database.py
```

### Pipeline name normalization

Early versions of the pipeline logger used inconsistent casing for pipeline names (e.g. `chipSeq`, `dnaSeq`, `rnaSeq`). Current versions use PascalCase (`ChipSeq`, `DnaSeq`, `RnaSeq`). The `generate-database.py` script normalizes names on ingestion, but existing production databases built from old logs may still contain the legacy names as separate entries.

Run `normalize-pipelines.py` once on the production database to merge those legacy entries into their canonical equivalents:

```bash
# Preview changes without applying them
PIPES_DB=/data/pipes_stats.db python3 /path/to/cgi-bin/normalize-pipelines.py --dry-run

# Apply
PIPES_DB=/data/pipes_stats.db python3 /path/to/cgi-bin/normalize-pipelines.py
```

Or inside the container:

```bash
podman exec <container-name> sh -c 'PIPES_DB=/data/pipes_stats.db python3 /app/cgi-bin/normalize-pipelines.py --dry-run'
podman exec <container-name> sh -c 'PIPES_DB=/data/pipes_stats.db python3 /app/cgi-bin/normalize-pipelines.py'
```

This is a one-time operation. After running it, `generate-database.py` will keep names normalized for all future rebuilds.

### Removing empty-pipeline entries

Some old log entries were recorded without a pipeline name. These entries cannot be attributed to any pipeline and should be removed:

```bash
# Preview changes without applying them
PIPES_DB=/data/pipes_stats.db python3 /path/to/cgi-bin/clean-empty-pipelines.py --dry-run

# Apply
PIPES_DB=/data/pipes_stats.db python3 /path/to/cgi-bin/clean-empty-pipelines.py
```

Or inside the container:

```bash
podman exec <container-name> sh -c 'PIPES_DB=/data/pipes_stats.db python3 /app/cgi-bin/clean-empty-pipelines.py --dry-run'
podman exec <container-name> sh -c 'PIPES_DB=/data/pipes_stats.db python3 /app/cgi-bin/clean-empty-pipelines.py'
```

This is a one-time cleanup. New entries from `pipeline.cgi` always include a pipeline name.

## Commands

Run:  `npm run start`
Build `npm run build`

#### Development

In development, you'd run `npm start`. The `.proxy` field in `package.json` indicates
to the webpack-dev-server to proxy API requests to the running apache server, make sure
to adjust it if apache is running on a different port than `8080` on your local setup.
This only applies for development. In production, apache serves both the CGI scripts
and the frontend files in `./build`.
