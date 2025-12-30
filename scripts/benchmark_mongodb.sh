#!/bin/bash
echo "Starting MongoDB YCSB Benchmark..."

# Configuration  
RECORD_COUNT=100000
OPERATION_COUNT=100000
THREADS=10

# Wait for MongoDB
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongodb 27017 > /dev/null 2>&1; do
  echo "MongoDB not ready, waiting..."
  sleep 2
done
sleep 3
echo "MongoDB is ready!"

mkdir -p /ycsb/results/mongodb

# SOLUTION: Use Python to clear MongoDB (pymongo should be available)
echo "Clearing MongoDB database..."
python3 << 'PYTHON_CLEAR'
try:
    from pymongo import MongoClient
    client = MongoClient('mongodb://mongodb:27017/', serverSelectionTimeoutMS=5000)
    client.drop_database('ycsb')
    print("  ✓ Database dropped successfully using pymongo")
except ImportError:
    print("  ! pymongo not available, will rely on YCSB to handle")
except Exception as e:
    print(f"  ! Could not drop database: {e}")
    print("  ! Will proceed - YCSB should handle conflicts")
PYTHON_CLEAR

sleep 2

# Load initial dataset with proper parameters
echo "Loading initial dataset..."
ycsb.sh load mongodb -s \
    -P workloads/workloada \
    -p mongodb.url=mongodb://mongodb:27017/ycsb \
    -p recordcount=$RECORD_COUNT \
    -p threadcount=$THREADS \
    -p mongodb.upsert=true \
    -p core_workload_insertion_retry_limit=10 \
    > /ycsb/results/mongodb/initial_load.txt 2>&1

# Check if load succeeded
if grep -q "INSERT.*Operations, 0" /ycsb/results/mongodb/initial_load.txt; then
    echo "ERROR: No records inserted!"
    echo ""
    echo "Last 30 lines of error log:"
    tail -30 /ycsb/results/mongodb/initial_load.txt
    echo ""
    echo "This usually means:"
    echo "1. MongoDB database wasn't cleared properly"
    echo "2. There's a connection issue"
    echo ""
    echo "SOLUTION: Restart MongoDB container and try again:"
    echo "  docker-compose restart mongodb"
    echo "  sleep 10"
    echo "  ./scripts/benchmark_mongodb.sh"
    exit 1
fi

# Check for successful inserts
insert_count=$(grep "\[INSERT\], Operations," /ycsb/results/mongodb/initial_load.txt | grep -o "[0-9]*$" | head -1)
if [ ! -z "$insert_count" ] && [ "$insert_count" -gt 0 ]; then
    echo "Initial load completed ($insert_count records)"
else
    echo "WARNING: Could not verify insert count"
fi

# Run ALL workloads sequentially
for workload in a b c d e f; do
    echo "Running MongoDB workload $workload..."
    if [ "$workload" == "e" ]; then
        echo "  (Workload E may take 2-3 minutes)"
    fi
    
    ycsb.sh run mongodb -s \
        -P workloads/workload$workload \
        -p mongodb.url=mongodb://mongodb:27017/ycsb \
        -p recordcount=$RECORD_COUNT \
        -p operationcount=$OPERATION_COUNT \
        -p threadcount=$THREADS \
        > /ycsb/results/mongodb/run_workload_${workload}.txt 2>&1
    
    if grep -q "Return=ERROR" /ycsb/results/mongodb/run_workload_${workload}.txt; then
        echo "  WARNING: Workload $workload had errors"
    else
        echo "  ✓ Completed"
    fi
done

echo "MongoDB benchmark completed!"