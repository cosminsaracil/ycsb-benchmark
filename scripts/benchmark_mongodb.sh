#!/bin/bash
echo "Starting MongoDB YCSB Benchmark..."

# Configuration
RECORD_COUNT=100000
OPERATION_COUNT=100000
THREADS=10
MONGO_URL="mongodb://mongodb:27017/ycsb"
RESULTS_DIR="/ycsb/results/mongodb"

mkdir -p "$RESULTS_DIR"

# Wait for MongoDB
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongodb 27017 > /dev/null 2>&1; do
  echo "MongoDB not ready, waiting..."
  sleep 2
done
sleep 3
echo "MongoDB is ready!"

# Function to drop DB
drop_db() {
python3 << 'PYTHON_CLEAR'
from pymongo import MongoClient
client = MongoClient('mongodb://mongodb:27017/', serverSelectionTimeoutMS=5000)
client.drop_database('ycsb')
print("  ✓ MongoDB database dropped")
PYTHON_CLEAR
}

# Loop through workloads
for workload in a b c d e f; do
    echo ""
    echo "=============================="
    echo "Running workload $workload"
    echo "=============================="

    echo "Step 1/3: Dropping database..."
    drop_db
    sleep 2

    echo "Step 2/3: Loading data..."
    ycsb.sh load mongodb -s \
        -P workloads/workloada \
        -p mongodb.url=$MONGO_URL \
        -p recordcount=$RECORD_COUNT \
        -p threadcount=$THREADS \
        -p mongodb.upsert=true \
        -p core_workload_insertion_retry_limit=10 \
        > "$RESULTS_DIR/load_workload_${workload}.txt" 2>&1

    if grep -q "INSERT.*Operations, 0" "$RESULTS_DIR/load_workload_${workload}.txt"; then
        echo "ERROR: No records inserted during load for workload $workload"
        tail -30 "$RESULTS_DIR/load_workload_${workload}.txt"
        exit 1
    fi

    echo "  ✓ Initial load for workload $workload completed successfully"

    echo "Step 3/3: Running workload $workload..."
    if [ "$workload" == "e" ]; then
        echo "  (Workload E is scan-heavy and may take longer)"
    fi

    ycsb.sh run mongodb -s \
        -P workloads/workload$workload \
        -p mongodb.url=$MONGO_URL \
        -p recordcount=$RECORD_COUNT \
        -p operationcount=$OPERATION_COUNT \
        -p threadcount=$THREADS \
        > "$RESULTS_DIR/run_workload_${workload}.txt" 2>&1

    if grep -q "Return=ERROR" "$RESULTS_DIR/run_workload_${workload}.txt"; then
        echo "WARNING: Workload $workload completed with errors"
    else
        echo "  ✓ Workload $workload completed successfully"
    fi
done

echo ""
echo "MongoDB YCSB benchmark completed successfully!"
