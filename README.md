# YCSB Benchmark

YCSB has three main phases:

- Connection test / client initialization

When you run ycsb shell or ycsb run/load, YCSB first connects to the database (Redis, MongoDB, Cassandra, etc.) and checks if it’s reachable.
</br>
This is what you see in logs as connection_test. It ensures the client can talk to the database before running anything.

- Load phase (ycsb load)

YCSB populates the database with initial data.
You specify parameters like:

`recordcount` → number of records to insert </br>
`workload` → workload file (A-F)

Each record has a key (like user12345) and some fields (field0, field1, …).
This phase inserts records only, unless you explicitly re-run it — it doesn’t delete anything by default.

- Run phase (ycsb run)

Executes operations defined in the workload: </br>
`read`, `update`, `insert`, `scan`, etc.

Uses the data already loaded.

If the workload has insert operations, it adds new keys with unique IDs (or sometimes duplicates if misconfigured).
It does not automatically reload the initial dataset for each workload; you control that in your scripts. </br>

Data is loaded once, using workload A. The data inserted in load is reused by all workloads. Workloads do not delete or reset the data unless you flush the DB manually (Redis: FLUSHALL). </br>
Some workloads may insert additional data (like workload E or F), so the dataset grows. </br>

Before executing each YCSB workload, the target database was reset and reloaded with the initial dataset. This step was necessary to avoid key collisions in insert-heavy workloads (D and E) and to ensure that all operations completed successfully, producing uncontaminated throughput and latency measurements

`for workload in a b c d e f; do
  DROP DB
  LOAD
  RUN workload
done`

- Consistent starting state for each workload
- No data pollution from previous workloads
- Accurate performance measurements without interference
- No duplicate key errors (each workload gets clean data)

YCSB never includes the load phase in workload metrics. The measured benchmark is only the run phase. </br>

Note: The original ycsb CLI script (bin/ycsb) was written for Python 2 syntax.
You must call ycsb.sh which is the Java launcher instead of the Python wrapper.
ycsb.sh calls java -cp ... site.ycsb.CommandLine → fully Java-based
Java client works fine for Redis, MongoDB, Cassandra, etc., without Python

First, the containers have to be running so: ycsb client, mongo and redis.
So:

- `mkdir ycsb-benchmark`
- `cd ycsb-benchmark`
- `code .`

Then, you have to make the docker-compose.yml file and then run `docker-compose up -d`.
Check the containers with `docker ps`. You should see both db's up and running:

- `docker exec -it redis-ycsb redis-cli ping` :: expected output: PONG
- `docker exec -it mongo-ycsb mongosh` :: expected output: MongoDB shell

Dockerfile.ycsb is the common network bridge for ycsb-network which will allow the communication between containers the 3 containers.

- `docker-compose build --no-cache ycsb`
- `docker-compose up -d`

  Then access the client:

- `docker-compose exec ycsb bash`

Once inside, run the scripts:

Make scripts executable (first time)

- `chmod +x /ycsb/scripts/*.sh`
  Ensures all your .sh scripts are runnable inside the container. Only needed once per container build

  And then run the full benchmark suite

- `./scripts/run_all_benchmarks.sh`

This will trigger the testing workloads for both db's:

- A – intensive workload in update: (50% read, 50% update)
- B – read heavy (95% read)
- C – read only (100% read)
- D – read latest (simulate timelines)
- E – short scans and inserts
- F – read-modify-write

- Then you can manipulate them with /scripts folder and extract results from /results folder where a complete report of throughput, latencies and other metrics will be available in .csv format.

Your current setup

Benchmark scripts: /scripts/benchmark_redis.sh and /scripts/benchmark_mongodb.sh

Master script: /scripts/run_all_benchmarks.sh → sequentially runs Redis then MongoDB

Analysis script: /scripts/analyze_results.py → parses /ycsb/results

Docker-compose mounts:

volumes:

- ./results:/ycsb/results
- ./scripts:/ycsb/scripts

/results on the host maps to /ycsb/results in the container ✅

## How the scripts save results

### Redis

`mkdir -p /ycsb/results/redis`
`ycsb.sh load redis ... > /ycsb/results/redis/initial_load.txt`
`ycsb.sh run redis ... > /ycsb/results/redis/run_workload_${workload}.txt`

### MongoDB

`mkdir -p /ycsb/results/mongodb`
`ycsb.sh load mongodb ... > /ycsb/results/mongodb/initial_load.txt`
`ycsb.sh run mongodb ... > /ycsb/results/mongodb/run_workload_${workload}.txt`

/results/

- redis/
  - initial_load.txt
  - run_workload_a.txt
  - run_workload_b.txt
  - ...
- mongodb/
  - initial_load.txt
  - run_workload_a.txt
  - run_workload_b.txt
  - ...

## For frontend

cd inside frontend which will run on 3000

use `npm run dev`

## For backend

backend runs on 8000

cd inside node-be and then `npm run dev` will start on port 8000 the server.

This app is essentially a backend API that:

- Reads the benchmark results (benchmark_summary.csv) generated by YCSB.
- Cleans the data (removes NaN/Infinity).
- Provides API endpoints for the frontend to fetch:
  - The benchmark results.
  - The status of MongoDB and Redis connections.
