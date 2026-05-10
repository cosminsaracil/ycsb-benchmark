#!/usr/bin/env python3

from __future__ import annotations

import csv
import datetime
import json
import shutil
from pathlib import Path

import pandas as pd

RESULTS_ROOT = Path("/ycsb/results")
SQL_RESULTS_DIR = RESULTS_ROOT / "sql"
RUNS_ROOT = RESULTS_ROOT / "runs" / "sql"


def save_run_snapshot(summary_csv: Path) -> Path:
    """Copy the latest SQL summary (and per-database raw outputs) into a
    timestamped subfolder under results/runs/sql/. Returns the run directory."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    run_dir = RUNS_ROOT / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)

    if summary_csv.exists():
        shutil.copy2(summary_csv, run_dir / "summary.csv")

    if SQL_RESULTS_DIR.exists() and SQL_RESULTS_DIR.is_dir():
        for db_dir in SQL_RESULTS_DIR.iterdir():
            if db_dir.is_dir():
                shutil.copytree(db_dir, run_dir / db_dir.name, dirs_exist_ok=True)

    print(f"Run snapshot saved to: {run_dir}")
    return run_dir


def analyze_results() -> pd.DataFrame | None:
    results_dir = Path("/ycsb/results/sql")
    if not results_dir.exists():
        print("SQL results directory not found. Please run SQL benchmarks first.")
        return None

    rows: list[dict] = []
    for database_dir in sorted(results_dir.iterdir()):
        if not database_dir.is_dir():
            continue
        for json_file in sorted(database_dir.glob("*.json")):
            with json_file.open("r", encoding="utf-8") as handle:
                row = json.load(handle)
            row["database"] = row.get("database", database_dir.name)
            rows.append(row)

    if not rows:
        print("No SQL results found. Please run SQL benchmarks first.")
        return None

    df = pd.DataFrame(rows)
    df = df.sort_values(["database", "workload"]).reset_index(drop=True)

    output_file = RESULTS_ROOT / "sql_benchmark_summary.csv"
    df.to_csv(output_file, index=False, quoting=csv.QUOTE_MINIMAL)

    print("SQL Benchmark Results Summary")
    print("=" * 50)
    print(df[["database", "workload", "throughput_ops_sec", "avg_latency_us", "p95_latency_us", "p99_latency_us"]].round(2))
    print()
    print(f"Detailed SQL results saved to: {output_file}")

    save_run_snapshot(output_file)

    return df


if __name__ == "__main__":
    analyze_results()
