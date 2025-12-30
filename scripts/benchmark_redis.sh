#!/bin/bash
set -e

echo "Starting Redis YCSB Benchmark..."

# Configuration
RECORD_COUNT=100000
OPERATION_COUNT=100000
THREADS=10
REDIS_HOST=redis
REDIS_PORT=6379
RESULTS_DIR="/ycsb/results/redis"

mkdir -p "$RESULTS_DIR"

# Wait for Redis
echo "Waiting for Redis to be ready..."
while ! nc -z $REDIS_HOST $REDIS_PORT > /dev/null 2>&1; do
  echo "Redis not ready, waiting..."
  sleep 2
done
sleep 2
echo "Redis is ready!"

# Function to reset Redis
reset_redis() {
  redis-cli -h $REDIS_HOST -p $REDIS_PORT FLUSHALL > /dev/null
  echo "  ✓ Redis database flushed"
}

# Loop through workloads
for workload in a b c d e f; do
    echo ""
    echo "=============================="
    echo "Running workload $workload"
    echo "=============================="

    echo "Step 1/3: Resetting Redis..."
    reset_redis
    sleep 1

    echo "Step 2/3: Loading initial dataset..."
    ycsb.sh load redis -s \
        -P workloads/workloada \
        -p redis.host=$REDIS_HOST \
        -p redis.port=$REDIS_PORT \
        -p recordcount=$RECORD_COUNT \
        -p threadcount=$THREADS \
        > "$RESULTS_DIR/load_workload_${workload}.txt" 2>&1

    if grep -q "Return=ERROR" "$RESULTS_DIR/load_workload_${workload}.txt"; then
        echo "ERROR: Load failed for workload $workload"
        tail -30 "$RESULTS_DIR/load_workload_${workload}.txt"
        exit 1
    fi

    echo "  ✓ Initial load completed successfully"

    echo "Step 3/3: Running workload $workload (measured)..."
    if [ "$workload" == "e" ]; then
        echo "  (Workload E is scan-heavy and may take longer)"
    fi

    ycsb.sh run redis -s \
        -P workloads/workload$workload \
        -p redis.host=$REDIS_HOST \
        -p redis.port=$REDIS_PORT \
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
echo "Redis YCSB benchmark completed successfully!"