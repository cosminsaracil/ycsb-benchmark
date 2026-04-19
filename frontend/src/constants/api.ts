export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const QUERY_KEYS = {
  ycsbResults: ["ycsb-results"] as const,
  sqlResults: ["sql-results"] as const,
  dbStatusConnections: ["db-status-connections"] as const,
  ycsbBenchmarkStatus: ["ycsb-benchmark-status"] as const,
  sqlBenchmarkStatus: ["sql-benchmark-status"] as const,
} as const;

export const DEFAULT_STATUS_POLL_INTERVAL = 2000;

export const CACHED_SQL_SUMMARY = `This benchmark evaluated the performance of PostgreSQL and MySQL across four distinct SQL workloads (SQL-W1 through SQL-W4). The results clearly indicate PostgreSQL as the superior performer in this comparison.

PostgreSQL emerged as the overall leader, demonstrating significantly higher throughput and lower latency. It achieved an average throughput of 1506.91 operations per second, which is more than four times that of MySQL's 357.67 ops/sec. Furthermore, PostgreSQL exhibited substantially lower average latency at 10030.84 μs compared to MySQL's 48138.55 μs. This translates to PostgreSQL handling more requests per second with each request being processed much faster. The winner also displayed superior tail latency consistency, with P95 latency at 21285.77 μs and P99 latency at 28114.19 μs for PostgreSQL, versus MySQL's P95 of 108168.88 μs and P99 of 144771.61 μs. This indicates that PostgreSQL provides a more predictable and consistent user experience, even for the slowest 5% and 1% of transactions, whereas MySQL struggles with significantly higher latency for these demanding scenarios.

While PostgreSQL is the clear performance winner, MySQL's results, though considerably lower, might still be acceptable for applications with very low transaction volumes or where cost of ownership and ease of management are paramount over raw speed. However, for any workload demanding high concurrency, responsiveness, and predictable performance, PostgreSQL has demonstrated a distinct advantage based on the measured throughput and latency metrics. In conclusion, PostgreSQL significantly outperforms MySQL in this benchmark, offering a compelling solution for performance-sensitive SQL applications.`;
