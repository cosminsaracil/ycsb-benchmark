#!/usr/bin/python3

import os
import re
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

def parse_ycsb_output(file_path):
    """Parse YCSB output file and extract metrics"""
    metrics = {}
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract throughput
    throughput_match = re.search(r'\[OVERALL\], Throughput\(ops/sec\), ([\d.]+)', content)
    if throughput_match:
        metrics['throughput'] = float(throughput_match.group(1))
    
    # Extract latencies
    latency_patterns = {
        'read_avg': r'\[READ\], AverageLatency\(us\), ([\d.]+)',
        'read_95th': r'\[READ\], 95thPercentileLatency\(us\), ([\d.]+)',
        'read_99th': r'\[READ\], 99thPercentileLatency\(us\), ([\d.]+)',
        'update_avg': r'\[UPDATE\], AverageLatency\(us\), ([\d.]+)',
        'update_95th': r'\[UPDATE\], 95thPercentileLatency\(us\), ([\d.]+)',
        'update_99th': r'\[UPDATE\], 99thPercentileLatency\(us\), ([\d.]+)',
        'insert_avg': r'\[INSERT\], AverageLatency\(us\), ([\d.]+)',
        'insert_95th': r'\[INSERT\], 95thPercentileLatency\(us\), ([\d.]+)',
        'scan_avg': r'\[SCAN\], AverageLatency\(us\), ([\d.]+)',
    }
    
    for metric, pattern in latency_patterns.items():
        match = re.search(pattern, content)
        if match:
            metrics[metric] = float(match.group(1))
    
    return metrics

def analyze_results():
    """Analyze YCSB benchmark results"""
    results_dir = Path('/ycsb/results')
    
    if not results_dir.exists():
        print("Results directory not found. Please run benchmarks first.")
        return
    
    # Collect results
    all_results = []
    workloads = ['a', 'b', 'c', 'd', 'e', 'f']
    databases = ['redis', 'mongodb']
    
    for db in databases:
        db_dir = results_dir / db
        if not db_dir.exists():
            continue
            
        for workload in workloads:
            run_file = db_dir / f'run_workload_{workload}.txt'
            if run_file.exists():
                metrics = parse_ycsb_output(run_file)
                if metrics:
                    metrics['database'] = db
                    metrics['workload'] = workload.upper()
                    all_results.append(metrics)
    
    if not all_results:
        print("No results found. Please run benchmarks first.")
        return
    
    # Create DataFrame
    df = pd.DataFrame(all_results)
    
    # Print summary
    print("YCSB Benchmark Results Summary")
    print("=" * 50)
    print()
    
    if 'throughput' in df.columns:
        print("Throughput (ops/sec) by Workload:")
        throughput_pivot = df.pivot(index='workload', columns='database', values='throughput')
        print(throughput_pivot.round(2))
        print()
    
    # Generate plots
    generate_plots(df)
    
    # Save detailed results
    df.to_csv('/ycsb/results/benchmark_summary.csv', index=False)
    print("Detailed results saved to: /ycsb/results/benchmark_summary.csv")
    
    return df

def generate_plots(df):
    """Generate comparison plots"""
    if df.empty:
        return
    
    plt.style.use('default')
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('YCSB Benchmark Comparison: Redis vs MongoDB', fontsize=16)
    
    # Throughput comparison
    if 'throughput' in df.columns:
        throughput_pivot = df.pivot(index='workload', columns='database', values='throughput')
        throughput_pivot.plot(kind='bar', ax=axes[0,0], rot=0)
        axes[0,0].set_title('Throughput (ops/sec)')
        axes[0,0].set_ylabel('Operations per Second')
        axes[0,0].legend()
    
    # Read latency comparison
    if 'read_avg' in df.columns:
        read_pivot = df.pivot(index='workload', columns='database', values='read_avg')
        read_pivot.plot(kind='bar', ax=axes[0,1], rot=0)
        axes[0,1].set_title('Average Read Latency (μs)')
        axes[0,1].set_ylabel('Microseconds')
        axes[0,1].legend()
    
    # Update latency comparison
    if 'update_avg' in df.columns:
        update_pivot = df.pivot(index='workload', columns='database', values='update_avg')
        update_pivot.plot(kind='bar', ax=axes[1,0], rot=0)
        axes[1,0].set_title('Average Update Latency (μs)')
        axes[1,0].set_ylabel('Microseconds')
        axes[1,0].legend()
    
    # 95th percentile read latency
    if 'read_95th' in df.columns:
        read95_pivot = df.pivot(index='workload', columns='database', values='read_95th')
        read95_pivot.plot(kind='bar', ax=axes[1,1], rot=0)
        axes[1,1].set_title('95th Percentile Read Latency (μs)')
        axes[1,1].set_ylabel('Microseconds')
        axes[1,1].legend()
    
    plt.tight_layout()
    plt.savefig('/ycsb/results/benchmark_comparison.png', dpi=300, bbox_inches='tight')
    print("Comparison plots saved to: /ycsb/results/benchmark_comparison.png")

def print_workload_info():
    """Print information about YCSB workloads"""
    workloads = {
        'A': 'Update heavy workload (50% read, 50% update)',
        'B': 'Read mostly workload (95% read, 5% update)',
        'C': 'Read only workload (100% read)',
        'D': 'Read latest workload (95% read, 5% insert, reads follow inserts)',
        'E': 'Short ranges workload (95% scan, 5% insert)',
        'F': 'Read-modify-write workload (50% read, 50% read-modify-write)'
    }
    
    print("YCSB Workload Descriptions:")
    print("=" * 40)
    for workload, description in workloads.items():
        print(f"Workload {workload}: {description}")
    print()

if __name__ == "__main__":
    print_workload_info()
    analyze_results()