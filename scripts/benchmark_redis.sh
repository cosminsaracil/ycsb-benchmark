# #!/bin/bash

# echo "Starting Redis YCSB Benchmark..."

# # Configuration
# RECORD_COUNT=100000
# OPERATION_COUNT=100000
# THREADS=10

# # Wait for Redis to be ready
# echo "Waiting for Redis to be ready..."
# while ! nc -z redis 6379 > /dev/null 2>&1; do
#   echo "Redis not ready, waiting..."
#   sleep 2
# done
# sleep 2  # Give Redis a moment to fully initialize
# echo "Redis is ready!"

# # Create results directory
# mkdir -p /ycsb/results/redis

# # Test different workloads
# for workload in a b c d e f; do
#     echo "Running Redis Workload $workload..."
    
#     # Load phase
#     echo "Loading data for workload $workload..."
#     ycsb load redis -s \
#         -P workloads/workload$workload \
#         -p redis.host=redis \
#         -p redis.port=6379 \
#         -p recordcount=$RECORD_COUNT \
#         -p threadcount=$THREADS \
#         > /ycsb/results/redis/load_workload_${workload}.txt 2>&1
    
#     # Run phase
#     echo "Running workload $workload..."
#     ycsb run redis -s \
#         -P workloads/workload$workload \
#         -p redis.host=redis \
#         -p redis.port=6379 \
#         -p recordcount=$RECORD_COUNT \
#         -p operationcount=$OPERATION_COUNT \
#         -p threadcount=$THREADS \
#         > /ycsb/results/redis/run_workload_${workload}.txt 2>&1
    
#     echo "Workload $workload completed"
#     echo "------------------------"
# done

# echo "Redis benchmark completed! Results saved in /ycsb/results/redis/"


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
sleep 2  # Give Redis a moment to fully initialize
echo "Redis is ready!"

# Create results directory
mkdir -p /ycsb/results/redis

# Clear Redis first
echo "Clearing Redis database..."
redis-cli -h redis -p 6379 FLUSHALL > /dev/null 2>&1 || \
docker-compose exec redis redis-cli FLUSHALL > /dev/null 2>&1 || true
sleep 1

# Load data once using workload A
echo "Loading initial data using workload A..."
ycsb load redis -s \
    -P workloads/workloada \
    -p redis.host=redis \
    -p redis.port=6379 \
    -p recordcount=$RECORD_COUNT \
    -p threadcount=$THREADS \
    > /ycsb/results/redis/initial_load.txt 2>&1

# Check if initial load was successful
if grep -q "Return=ERROR" /ycsb/results/redis/initial_load.txt; then
    echo "ERROR: Initial data load failed! Check /ycsb/results/redis/initial_load.txt"
    exit 1
else
    echo "Initial data load completed successfully"
    # Show Redis stats
    echo "Redis contains $(redis-cli -h redis -p 6379 DBSIZE 2>/dev/null || echo 'N/A') keys"
fi

# Run all workloads against the same dataset
for workload in a b c d e f; do
    echo "Running Redis Workload $workload..."
    
    # Run phase only (data already loaded)
    echo "Running workload $workload..."
    ycsb run redis -s \
        -P workloads/workload$workload \
        -p redis.host=redis \
        -p redis.port=6379 \
        -p recordcount=$RECORD_COUNT \
        -p operationcount=$OPERATION_COUNT \
        -p threadcount=$THREADS \
        > /ycsb/results/redis/run_workload_${workload}.txt 2>&1
    
    # Check if run was successful
    if grep -q "Return=ERROR" /ycsb/results/redis/run_workload_${workload}.txt; then
        echo "WARNING: Run phase for workload $workload had errors!"
        echo "Check /ycsb/results/redis/run_workload_${workload}.txt for details"
    else
        echo "Run phase for workload $workload completed successfully"
    fi
    
    echo "Workload $workload completed"
    echo "------------------------"
done

echo "Redis benchmark completed! Results saved in /ycsb/results/redis/"