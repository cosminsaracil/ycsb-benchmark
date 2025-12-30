#!/bin/bash
echo "Starting Redis YCSB Benchmark..."

# Configuration
RECORD_COUNT=100000
OPERATION_COUNT=100000
THREADS=10

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379 > /dev/null 2>&1; do
  echo "Redis not ready, waiting..."
  sleep 2
done
sleep 2
echo "Redis is ready!"

mkdir -p /ycsb/results/redis

# Strategy: Load once, run all workloads
# Workloads D and E will insert NEW keys that don't conflict
echo "Clearing Redis and loading initial data..."
redis-cli -h redis -p 6379 FLUSHALL > /dev/null 2>&1 || true
sleep 1

ycsb.sh load redis -s \
    -P workloads/workloada \
    -p redis.host=redis \
    -p redis.port=6379 \
    -p recordcount=$RECORD_COUNT \
    -p threadcount=$THREADS \
    > /ycsb/results/redis/initial_load.txt 2>&1

if grep -q "Return=ERROR" /ycsb/results/redis/initial_load.txt; then
    echo "ERROR: Initial load failed!"
    exit 1
fi
echo "Initial load completed (loaded $RECORD_COUNT records)"

# Run ALL workloads sequentially on the same dataset
for workload in a b c d e f; do
    echo "Running Redis workload $workload..."
    
    ycsb.sh run redis -s \
        -P workloads/workload$workload \
        -p redis.host=redis \
        -p redis.port=6379 \
        -p recordcount=$RECORD_COUNT \
        -p operationcount=$OPERATION_COUNT \
        -p threadcount=$THREADS \
        > /ycsb/results/redis/run_workload_${workload}.txt 2>&1
    
    # Check results
    if grep -q "Return=ERROR" /ycsb/results/redis/run_workload_${workload}.txt; then
        error_count=$(grep -c "Return=ERROR" /ycsb/results/redis/run_workload_${workload}.txt || echo "0")
        echo "  WARNING: Workload $workload had $error_count errors!"
        echo "  Check /ycsb/results/redis/run_workload_${workload}.txt for details"
    else
        echo "  ✓ Workload $workload completed successfully"
    fi
    
    # Show progress
    if [ -f /ycsb/results/redis/run_workload_${workload}.txt ]; then
        throughput=$(grep "Throughput(ops/sec)" /ycsb/results/redis/run_workload_${workload}.txt | grep -o '[0-9.]*' | head -1)
        if [ ! -z "$throughput" ]; then
            echo "  Throughput: $throughput ops/sec"
        fi
    fi
    echo "------------------------"
done

echo ""
echo "Redis benchmark completed! Results saved in /ycsb/results/redis/"