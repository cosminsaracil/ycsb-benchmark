# #!/bin/bash

# echo "Starting MongoDB YCSB Benchmark..."

# # Configuration
# RECORD_COUNT=100000
# OPERATION_COUNT=100000
# THREADS=10

# # Wait for MongoDB to be ready
# echo "Waiting for MongoDB to be ready..."
# while ! nc -z mongodb 27017 > /dev/null 2>&1; do
#   echo "MongoDB not ready, waiting..."
#   sleep 2
# done
# sleep 2  # Give MongoDB a moment to fully initialize
# echo "MongoDB is ready!"

# # Create results directory
# mkdir -p /ycsb/results/mongodb

# # Test different workloads
# for workload in a b c d e f; do
#     echo "Running MongoDB Workload $workload..."
    
#     # Load phase
#     echo "Loading data for workload $workload..."
#     ycsb load mongodb -s \
#         -P workloads/workload$workload \
#         -p mongodb.url=mongodb://mongodb:27017/ycsb \
#         -p recordcount=$RECORD_COUNT \
#         -p threadcount=$THREADS \
#         > /ycsb/results/mongodb/load_workload_${workload}.txt 2>&1
    
#     # Run phase
#     echo "Running workload $workload..."
#     ycsb run mongodb -s \
#         -P workloads/workload$workload \
#         -p mongodb.url=mongodb://mongodb:27017/ycsb \
#         -p recordcount=$RECORD_COUNT \
#         -p operationcount=$OPERATION_COUNT \
#         -p threadcount=$THREADS \
#         > /ycsb/results/mongodb/run_workload_${workload}.txt 2>&1
    
#     echo "Workload $workload completed"
#     echo "------------------------"
# done

# echo "MongoDB benchmark completed! Results saved in /ycsb/results/mongodb/"


#!/bin/bash
echo "Starting MongoDB YCSB Benchmark..."

# Configuration  
RECORD_COUNT=100000
OPERATION_COUNT=100000
THREADS=10

# Wait for MongoDB...
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongodb 27017 > /dev/null 2>&1; do
  echo "MongoDB not ready, waiting..."
  sleep 2
done
sleep 2
echo "MongoDB is ready!"

# Create results directory
mkdir -p /ycsb/results/mongodb

# Load data ONCE using workload A
echo "Loading initial dataset..."
ycsb load mongodb -s \
    -P workloads/workloada \
    -p mongodb.url=mongodb://mongodb:27017/ycsb \
    -p recordcount=$RECORD_COUNT \
    -p threadcount=$THREADS \
    > /ycsb/results/mongodb/initial_load.txt 2>&1

# Now run all workloads (no loading phase)
for workload in a b c d e f; do
    echo "Running MongoDB Workload $workload..."
    
    ycsb run mongodb -s \
        -P workloads/workload$workload \
        -p mongodb.url=mongodb://mongodb:27017/ycsb \
        -p recordcount=$RECORD_COUNT \
        -p operationcount=$OPERATION_COUNT \
        -p threadcount=$THREADS \
        > /ycsb/results/mongodb/run_workload_${workload}.txt 2>&1
   
    echo "Workload $workload completed"
    echo "------------------------"
done

echo "MongoDB benchmark completed! Results saved in /ycsb/results/mongodb/"