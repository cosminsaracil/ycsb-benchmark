#!/bin/bash

echo "Starting Complete YCSB Benchmark Suite..."
echo "This will benchmark both Redis and MongoDB with all workloads"
echo "Estimated time: 10-30 minutes depending on your system"
echo ""

# Run Redis benchmarks
./scripts/benchmark_redis.sh

echo ""
echo "Waiting 30 seconds before MongoDB benchmark..."
sleep 30

# Run MongoDB benchmarks  
./scripts/benchmark_mongodb.sh

echo ""
echo "All benchmarks completed!"
echo "Results are available in:"
echo "  - /ycsb/results/redis/"
echo "  - /ycsb/results/mongodb/"
echo ""
echo "Use the analysis script to generate comparison reports:"
echo "  python3 scripts/analyze_results.py"