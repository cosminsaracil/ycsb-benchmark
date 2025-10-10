# YCSB Benchmark

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

- `docker-compose build –no-cache`

Then access the client:

- `docker exec -it ycsb-client bash`

Once inside, run the scripts:

- `chmod +x /ycsb/scripts/*.sh`
- `./scripts/run_all_benchmarks.sh`

This will trigger the testing workloads for both db's:

- A – intensive workload in update: (50% read, 50% update)
- B – read heavy (95% read)
- C – read only (100% read)
- D – read latest (simulate timelines)
- E – short scans and inserts
- F – read-modify-write

- Then you can manipulate them with /scripts folder and extract results from /results folder where a complete report of throughput, latencies and other metrics will be available in .csv format.

## For frontend

cd inside frontend which will run on 3000

use `npm run dev`

## For backend

backend runs on 8000

cd inside node-be and then `npm run dev` will start on port 8000 the server.
