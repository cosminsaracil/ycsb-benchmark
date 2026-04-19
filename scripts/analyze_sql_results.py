#!/usr/bin/env python3

from __future__ import annotations

import csv
import json
from pathlib import Path

import pandas as pd


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

    output_file = Path("/ycsb/results/sql_benchmark_summary.csv")
    df.to_csv(output_file, index=False, quoting=csv.QUOTE_MINIMAL)

    print("SQL Benchmark Results Summary")
    print("=" * 50)
    print(df[["database", "workload", "throughput_ops_sec", "avg_latency_us", "p95_latency_us", "p99_latency_us"]].round(2))
    print()
    print(f"Detailed SQL results saved to: {output_file}")
    return df


if __name__ == "__main__":
    analyze_results()
