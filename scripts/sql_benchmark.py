#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import random
import statistics
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable

try:
    import psycopg2  # type: ignore[import-not-found]
except ImportError:  # pragma: no cover - handled at runtime
    psycopg2 = None
 
try:
    import pymysql  # type: ignore[import-not-found]
except ImportError:  # pragma: no cover - handled at runtime
    pymysql = None

SQL_CATEGORIES = ["Electronics", "Clothing", "Books", "Food", "Sports"]
WORKLOAD_LABELS = {
    "sql_w1": "SQL-W1",
    "sql_w2": "SQL-W2",
    "sql_w3": "SQL-W3",
    "sql_w4": "SQL-W4",
}
WORKLOAD_DESCRIPTIONS = {
    "sql_w1": "Join heavy",
    "sql_w2": "Aggregation heavy",
    "sql_w3": "Transaction heavy",
    "sql_w4": "Mixed OLTP + OLAP",
}
DEFAULT_COUNTS = {
    "users": 10_000,
    "products": 1_000,
    "orders": 10_000,
}
DEFAULT_OPERATION_COUNT = 2_000
DEFAULT_THREADS = 8


@dataclass
class BenchmarkResult:
    database: str
    workload: str
    description: str
    throughput_ops_sec: float
    avg_latency_us: float
    p95_latency_us: float
    p99_latency_us: float
    operations_requested: int
    operations_succeeded: int
    operations_failed: int
    thread_count: int
    seed: int


# Small wrapper around the Postgres / MySQL drivers so the rest of the script
# doesn't have to care which database it's talking to. Each method papers over
# one dialect difference (how you connect, how you wipe state, how you load
# the schema).
class DatabaseClient:
    def __init__(self, args: argparse.Namespace):
        self.args = args

    @property
    def is_postgres(self) -> bool:
        return self.args.database == "postgres"

    def connect(self, database_name: str):
        if self.is_postgres:
            if psycopg2 is None:
                raise RuntimeError("psycopg2-binary is not installed")
            return psycopg2.connect(
                host=self.args.host,
                port=self.args.port,
                user=self.args.user,
                password=self.args.password,
                dbname=database_name,
            )

        if pymysql is None:
            raise RuntimeError("pymysql is not installed")
        return pymysql.connect(
            host=self.args.host,
            port=self.args.port,
            user=self.args.user,
            password=self.args.password,
            database=database_name,
            autocommit=False,
            charset="utf8mb4",
        )

    def ensure_database(self, database_name: str) -> None:
        return

    def reset_database(self, connection) -> None:
        cursor = connection.cursor()
        if self.is_postgres:
            connection.autocommit = True
            cursor.execute("DROP SCHEMA public CASCADE")
            cursor.execute("CREATE SCHEMA public")
            cursor.execute("GRANT ALL ON SCHEMA public TO CURRENT_USER")
            connection.autocommit = False
        else:
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()")
            for (table_name,) in cursor.fetchall():
                cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        connection.commit()

    def execute_schema(self, connection, schema_path: Path) -> None:
        schema_sql = schema_path.read_text(encoding="utf-8")
        statements = [
            statement.strip()
            for statement in schema_sql.split(";")
            if statement.strip() and not statement.strip().startswith("--")
        ]
        cursor = connection.cursor()
        for statement in statements:
            cursor.execute(statement)
        connection.commit()


def chunked(rows: list[tuple], size: int) -> Iterable[list[tuple]]:
    for index in range(0, len(rows), size):
        yield rows[index : index + size]


def make_order_timestamp(index: int):
    base_seconds = 1_700_000_000 + index
    return time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(base_seconds))


def bulk_insert(connection, sql: str, rows: list[tuple], batch_size: int = 1000) -> None:
    cursor = connection.cursor()
    for batch in chunked(rows, batch_size):
        cursor.executemany(sql, batch)
    connection.commit()


# Builds a fresh dataset (users, products, orders, order_items) and bulk-loads
# it. Same seed always produces the same data, which is what keeps the
# Postgres vs MySQL comparison fair. This runs before timing starts, so the
# insert cost never shows up in the throughput numbers.
def seed_database(connection, args: argparse.Namespace, rng: random.Random) -> None:
    users = []
    for user_id in range(1, args.users + 1):
        users.append(
            (
                user_id,
                f"User {user_id}",
                f"user{user_id}@example.com",
                1000.00,
                make_order_timestamp(user_id),
            )
        )

    products = []
    for product_id in range(1, args.products + 1):
        category = SQL_CATEGORIES[(product_id - 1) % len(SQL_CATEGORIES)]
        price = round(rng.uniform(5.0, 500.0), 2)
        products.append(
            (
                product_id,
                f"Product {product_id}",
                category,
                price,
                1000,
                make_order_timestamp(product_id + args.users),
            )
        )

    orders = []
    order_items = []
    order_item_id = 1
    for order_id in range(1, args.orders + 1):
        user_id = rng.randint(1, args.users)
        status = rng.choice(["pending", "paid", "completed"])
        created_at = make_order_timestamp(order_id + args.users + args.products)
        item_count = rng.randint(1, 4)
        total = 0.0
        chosen_items = []
        for _ in range(item_count):
            product_id = rng.randint(1, args.products)
            quantity = rng.randint(1, 4)
            price = products[product_id - 1][3]
            total += price * quantity
            chosen_items.append((product_id, quantity, price))
        orders.append((order_id, user_id, status, round(total, 2), created_at))
        for product_id, quantity, unit_price in chosen_items:
            order_items.append((order_item_id, order_id, product_id, quantity, unit_price))
            order_item_id += 1

    print(f"  Seeding {len(users)} users, {len(products)} products, {len(orders)} orders...")
    bulk_insert(
        connection,
        "INSERT INTO users (id, name, email, balance, created_at) VALUES (%s, %s, %s, %s, %s)",
        users,
    )
    bulk_insert(
        connection,
        "INSERT INTO products (id, name, category, price, stock, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
        products,
    )
    bulk_insert(
        connection,
        "INSERT INTO orders (id, user_id, status, total, created_at) VALUES (%s, %s, %s, %s, %s)",
        orders,
    )
    bulk_insert(
        connection,
        "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (%s, %s, %s, %s, %s)",
        order_items,
    )


def sync_sequences(connection, dialect: str) -> None:
    cursor = connection.cursor()
    if dialect == "postgres":
        for table_name in ["users", "products", "orders", "order_items"]:
            cursor.execute(
                f"SELECT setval(pg_get_serial_sequence(%s, 'id'), COALESCE((SELECT MAX(id) FROM {table_name}), 1), true)",
                (table_name,),
            )
    connection.commit()


def fetch_one(cursor, query: str, params: tuple | None = None):
    cursor.execute(query, params or ())
    return cursor.fetchone()


def insert_generated_row(connection, dialect: str, table: str, values_sql: str, values: tuple):
    cursor = connection.cursor()
    if dialect == "postgres":
        cursor.execute(f"INSERT INTO {table} {values_sql} RETURNING id", values)
        row = cursor.fetchone()
        return row[0]

    cursor.execute(f"INSERT INTO {table} {values_sql}", values)
    return cursor.lastrowid


# Each workload below represents one "operation". The harness calls one of
# these in a tight loop across N threads and measures how long each call
# takes — that's where the throughput and latency numbers come from.

# W1 — join-heavy. Pulls a random order back together by joining four tables
# (orders, users, order_items, products). Cheap per row, but the planner has
# real work to do.
def run_join_heavy(connection, dialect: str, rng: random.Random, counts: dict[str, int]) -> None:
    cursor = connection.cursor()
    order_id = rng.randint(1, counts["orders"])
    query = (
        "SELECT u.name, o.created_at, p.name, oi.quantity "
        "FROM orders o "
        "JOIN users u ON o.user_id = u.id "
        "JOIN order_items oi ON oi.order_id = o.id "
        "JOIN products p ON oi.product_id = p.id "
        "WHERE o.id = %s "
        "ORDER BY oi.id"
    )
    cursor.execute(query, (order_id,))
    cursor.fetchall()


# W2 — aggregation-heavy. Most of the time it does a big GROUP BY to compute
# revenue per category (OLAP style). One in five calls instead writes a new
# order, just so it's not purely read-only.
def run_aggregation_heavy(connection, dialect: str, rng: random.Random, counts: dict[str, int]) -> None:
    cursor = connection.cursor()
    if rng.random() < 0.8:
        query = (
            "SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue "
            "FROM order_items oi "
            "JOIN products p ON oi.product_id = p.id "
            "GROUP BY p.category "
            "ORDER BY revenue DESC"
        )
        cursor.execute(query)
        cursor.fetchall()
    else:
        user_id = rng.randint(1, counts["users"])
        product_id = rng.randint(1, counts["products"])
        quantity = rng.randint(1, 3)
        cursor.execute("SELECT price FROM products WHERE id = %s", (product_id,))
        product_price = float(cursor.fetchone()[0])
        total = round(product_price * quantity, 2)
        order_id = insert_generated_row(
            connection,
            dialect,
            "orders",
            "(user_id, status, total, created_at) VALUES (%s, %s, %s, CURRENT_TIMESTAMP)",
            (user_id, "pending", total),
        )
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (%s, %s, %s, %s)",
            (order_id, product_id, quantity, product_price),
        )


# W3 — transactional. Simulates "buy a product": find one in stock, decrement
# its stock, create the order and its line item, and debit the buyer's
# balance. All four writes go in a single committed transaction, so this is
# really measuring commit cost as much as anything else.
def run_transaction_heavy(connection, dialect: str, rng: random.Random, counts: dict[str, int]) -> None:
    cursor = connection.cursor()
    user_id = rng.randint(1, counts["users"])
    quantity = rng.randint(1, 4)

    if dialect == "postgres":
        cursor.execute(
            "SELECT id, stock, price FROM products WHERE stock >= %s ORDER BY RANDOM() LIMIT 1",
            (quantity,),
        )
    else:
        cursor.execute(
            "SELECT id, stock, price FROM products WHERE stock >= %s ORDER BY RAND() LIMIT 1",
            (quantity,),
        )

    product_row = cursor.fetchone()
    if product_row is None:
        raise RuntimeError("No products with enough stock available")

    product_id, stock, product_price = product_row
    product_price = float(product_price)
    total = round(product_price * quantity, 2)

    cursor.execute(
        "UPDATE products SET stock = stock - %s WHERE id = %s",
        (quantity, product_id),
    )

    order_id = insert_generated_row(
        connection,
        dialect,
        "orders",
        "(user_id, status, total, created_at) VALUES (%s, %s, %s, CURRENT_TIMESTAMP)",
        (user_id, "completed", total),
    )

    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (%s, %s, %s, %s)",
        (order_id, product_id, quantity, product_price),
    )
    cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (total, user_id))


# W4 — the mixed one. Rolls a die per call: mostly joins, sometimes an
# aggregation, occasionally a full transaction. Closer to what a real
# application's traffic shape tends to look like.
def run_mixed_workload(connection, dialect: str, rng: random.Random, counts: dict[str, int]) -> None:
    roll = rng.random()
    if roll < 0.55:
        run_join_heavy(connection, dialect, rng, counts)
    elif roll < 0.8:
        run_aggregation_heavy(connection, dialect, rng, counts)
    else:
        run_transaction_heavy(connection, dialect, rng, counts)


WORKLOAD_FUNCTIONS: dict[str, Callable[[object, str, random.Random, dict[str, int]], None]] = {
    "sql_w1": run_join_heavy,
    "sql_w2": run_aggregation_heavy,
    "sql_w3": run_transaction_heavy,
    "sql_w4": run_mixed_workload,
}


# Stats helper. We time every operation in nanoseconds and convert to
# microseconds, then later report the mean plus P95/P99 — the percentiles
# matter more than the average for understanding tail behaviour. Throughput
# is just successful ops divided by wall-clock time across all threads.
def percentile(values: list[float], ratio: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(int(round((len(ordered) - 1) * ratio)), len(ordered) - 1)
    return float(ordered[index])


def run_thread(
    connection_factory: Callable[[], object],
    dialect: str,
    workload: str,
    operations: int,
    seed: int,
    counts: dict[str, int],
    results: dict,
    lock: threading.Lock,
) -> None:
    rng = random.Random(seed)
    connection = connection_factory()
    latencies: list[float] = []
    successes = 0
    failures = 0
    operation = WORKLOAD_FUNCTIONS[workload]

    try:
        for _ in range(operations):
            started = time.perf_counter_ns()
            try:
                operation(connection, dialect, rng, counts)
                connection.commit()
                successes += 1
            except Exception:
                connection.rollback()
                failures += 1
            finally:
                elapsed_us = (time.perf_counter_ns() - started) / 1000.0
                latencies.append(elapsed_us)
    finally:
        connection.close()

    with lock:
        results["latencies"].extend(latencies)
        results["successes"] += successes
        results["failures"] += failures


def run_workload(client: DatabaseClient, args: argparse.Namespace, workload: str) -> BenchmarkResult:
    workload_label = WORKLOAD_LABELS[workload]
    description = WORKLOAD_DESCRIPTIONS[workload]
    database_name = args.database_name

    print("===========================================================")
    print(f"Running workload {workload_label} ({description})")
    print("===========================================================")
    print("Step 1/2: Preparing schema and seed data...")

    connection = client.connect(database_name)
    try:
        client.reset_database(connection)
        client.execute_schema(connection, Path(__file__).with_name("sql") / "schema.sql")
        seed_database(connection, args, random.Random(args.seed))
        sync_sequences(connection, args.database)
    finally:
        connection.close()

    print("  ✓ Schema ready and seed data loaded")
    print("Step 2/2: Running measured workload...")

    operations_per_thread = args.operations // args.threads
    remainder = args.operations % args.threads
    lock = threading.Lock()
    shared_results = {"latencies": [], "successes": 0, "failures": 0}
    counts = {"users": args.users, "products": args.products, "orders": args.orders}

    start = time.perf_counter()
    threads: list[threading.Thread] = []
    for index in range(args.threads):
        thread_operations = operations_per_thread + (1 if index < remainder else 0)
        thread_seed = args.seed + index + (hash(workload) % 1000)
        thread = threading.Thread(
            target=run_thread,
            args=(
                lambda: client.connect(database_name),
                args.database,
                workload,
                thread_operations,
                thread_seed,
                counts,
                shared_results,
                lock,
            ),
        )
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    duration_seconds = max(time.perf_counter() - start, 1e-9)
    latencies = shared_results["latencies"]
    throughput = shared_results["successes"] / duration_seconds
    average_latency = statistics.mean(latencies) if latencies else 0.0
    p95_latency = percentile(latencies, 0.95)
    p99_latency = percentile(latencies, 0.99)

    result = BenchmarkResult(
        database=args.database,
        workload=workload_label,
        description=description,
        throughput_ops_sec=throughput,
        avg_latency_us=average_latency,
        p95_latency_us=p95_latency,
        p99_latency_us=p99_latency,
        operations_requested=args.operations,
        operations_succeeded=shared_results["successes"],
        operations_failed=shared_results["failures"],
        thread_count=args.threads,
        seed=args.seed,
    )

    print(f"  ✓ {workload_label} completed successfully")
    print(
        f"  Throughput: {result.throughput_ops_sec:.2f} ops/sec | "
        f"Avg latency: {result.avg_latency_us:.2f} μs | "
        f"P95: {result.p95_latency_us:.2f} μs | P99: {result.p99_latency_us:.2f} μs"
    )
    return result


# Dumps one JSON file per workload into --results-dir (sql_w1.json, etc).
# These are the raw artifacts; analyze_sql_results.py reads them afterwards
# and turns them into the summary CSV the frontend graphs.
def write_result_artifacts(results: list[BenchmarkResult], output_dir: Path, database: str) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for result in results:
        json_path = output_dir / f"{result.workload.lower().replace('-', '_')}.json"
        with json_path.open("w", encoding="utf-8") as handle:
            json.dump(result.__dict__, handle, indent=2)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run SQL Tier 2 benchmarks")
    parser.add_argument("--database", choices=["postgres", "mysql"], required=True)
    parser.add_argument("--host", required=True)
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--database-name", default="benchmark_sql")
    parser.add_argument("--results-dir", required=True)
    parser.add_argument("--workload", choices=list(WORKLOAD_LABELS.keys()))
    parser.add_argument("--operations", type=int, default=DEFAULT_OPERATION_COUNT)
    parser.add_argument("--threads", type=int, default=DEFAULT_THREADS)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--users", type=int, default=DEFAULT_COUNTS["users"])
    parser.add_argument("--products", type=int, default=DEFAULT_COUNTS["products"])
    parser.add_argument("--orders", type=int, default=DEFAULT_COUNTS["orders"])
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    client = DatabaseClient(args)
    results_dir = Path(args.results_dir)
    results_dir.mkdir(parents=True, exist_ok=True)

    workload_ids = [args.workload] if args.workload else list(WORKLOAD_LABELS.keys())
    run_results: list[BenchmarkResult] = []

    print(f"Starting SQL benchmark for {args.database} on {args.host}:{args.port}")
    for workload in workload_ids:
        run_results.append(run_workload(client, args, workload))

    write_result_artifacts(run_results, results_dir, args.database)
    print(f"SQL benchmark completed successfully for {args.database}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
