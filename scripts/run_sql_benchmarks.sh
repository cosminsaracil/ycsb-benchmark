#!/bin/bash
set -e

echo "Starting SQL Tier 2 Benchmark Suite..."
echo "This will benchmark PostgreSQL and MySQL with SQL-specific workloads"
echo "Estimated time: 10-30 minutes depending on your system"
echo ""

SQL_OPERATION_COUNT=${SQL_OPERATION_COUNT:-2000}
SQL_THREADS=${SQL_THREADS:-8}
SQL_USERS=${SQL_USERS:-10000}
SQL_PRODUCTS=${SQL_PRODUCTS:-1000}
SQL_ORDERS=${SQL_ORDERS:-10000}
SQL_DATASET_NAME=${SQL_DATASET_NAME:-ycsb}

wait_for_service() {
  local host="$1"
  local port="$2"
  local label="$3"

  echo "Waiting for $label to be ready..."
  while ! nc -z "$host" "$port" > /dev/null 2>&1; do
    echo "$label not ready, waiting..."
    sleep 2
  done
  sleep 2
  echo "$label is ready!"
}

wait_for_service postgres 5432 PostgreSQL
wait_for_service mysql 3306 MySQL

run_database() {
  local database="$1"
  local host="$2"
  local port="$3"
  local phase_label="$4"

  echo "==================================================================="
  echo "$phase_label"
  echo "==================================================================="

  for workload in sql_w1 sql_w2 sql_w3 sql_w4; do
    echo ""
    echo "Running workload ${workload}"
    python3 scripts/sql_benchmark.py \
      --database "$database" \
      --host "$host" \
      --port "$port" \
      --user ycsb \
      --password ycsb \
      --database-name "$SQL_DATASET_NAME" \
      --results-dir "/ycsb/results/sql/$database" \
      --workload "$workload" \
      --operations "$SQL_OPERATION_COUNT" \
      --threads "$SQL_THREADS" \
      --users "$SQL_USERS" \
      --products "$SQL_PRODUCTS" \
      --orders "$SQL_ORDERS" \
      > "/ycsb/results/sql/${database}/run_${workload}.txt" 2>&1

    if grep -q "completed successfully" "/ycsb/results/sql/${database}/run_${workload}.txt"; then
      echo "  ✓ ${workload} completed successfully"
    else
      echo "  ⚠ ${workload} completed with warnings"
    fi
  done
}

mkdir -p /ycsb/results/sql/postgres /ycsb/results/sql/mysql

run_database postgres postgres 5432 "PHASE 1: PostgreSQL SQL Benchmarks"
sleep 10
run_database mysql mysql 3306 "PHASE 2: MySQL SQL Benchmarks"

echo ""
echo "==================================================================="
echo "SQL benchmarks completed!"
echo "==================================================================="
echo ""
echo "Results are available in:"
echo "  - /ycsb/results/sql/postgres/"
echo "  - /ycsb/results/sql/mysql/"
echo ""
echo "Use the analysis script to generate the SQL summary report:"
echo "  python3 scripts/analyze_sql_results.py"
echo ""
