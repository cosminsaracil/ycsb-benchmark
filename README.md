# YCSB Benchmark

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
