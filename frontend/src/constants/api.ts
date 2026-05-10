export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const QUERY_KEYS = {
  ycsbResults: ["ycsb-results"] as const,
  sqlResults: ["sql-results"] as const,
  dbStatusConnections: ["db-status-connections"] as const,
  ycsbBenchmarkStatus: ["ycsb-benchmark-status"] as const,
  sqlBenchmarkStatus: ["sql-benchmark-status"] as const,
  ycsbRuns: ["ycsb-runs"] as const,
  sqlRuns: ["sql-runs"] as const,
} as const;

export const DEFAULT_STATUS_POLL_INTERVAL = 2000;

export const CACHED_SQL_SUMMARY = `This benchmark evaluated the performance of PostgreSQL and MySQL across four distinct SQL workloads (SQL-W1 through SQL-W4). The results clearly indicate PostgreSQL as the superior performer in this comparison.

PostgreSQL emerged as the overall leader, demonstrating significantly higher throughput and lower latency. It achieved an average throughput of 1506.91 operations per second, which is more than four times that of MySQL's 357.67 ops/sec. Furthermore, PostgreSQL exhibited substantially lower average latency at 10030.84 μs compared to MySQL's 48138.55 μs. This translates to PostgreSQL handling more requests per second with each request being processed much faster. The winner also displayed superior tail latency consistency, with P95 latency at 21285.77 μs and P99 latency at 28114.19 μs for PostgreSQL, versus MySQL's P95 of 108168.88 μs and P99 of 144771.61 μs. This indicates that PostgreSQL provides a more predictable and consistent user experience, even for the slowest 5% and 1% of transactions, whereas MySQL struggles with significantly higher latency for these demanding scenarios.

While PostgreSQL is the clear performance winner, MySQL's results, though considerably lower, might still be acceptable for applications with very low transaction volumes or where cost of ownership and ease of management are paramount over raw speed. However, for any workload demanding high concurrency, responsiveness, and predictable performance, PostgreSQL has demonstrated a distinct advantage based on the measured throughput and latency metrics. In conclusion, PostgreSQL significantly outperforms MySQL in this benchmark, offering a compelling solution for performance-sensitive SQL applications.`;

export const CACHED_YCSB_SUMMARY = `This YCSB benchmark evaluated Redis (in-memory key-value store) against MongoDB (document store) across the standard YCSB workload mix: A (50/50 read/update), B (95/5 read/update), C (read-only), D (read-latest with inserts), E (short-range scans with inserts), and F (read-modify-write). The results show Redis as the overall performance leader, with the notable exception of scan-heavy workloads.

Redis dominated throughput on every CRUD-style workload, sustaining 25,000–30,000 ops/sec on workloads A–D and F, compared to MongoDB's roughly 15,000–24,000 ops/sec on the same set. Average read latency was also lower on Redis (~360 μs vs ~381 μs), and tail latencies stayed tighter — Redis's P95 read latency stayed mostly below 750 μs while MongoDB regularly exceeded 800 μs and crossed 2,000 μs in workload F. Update latency followed the same pattern, with Redis offering both lower averages and more predictable P99 behavior. The reason is structural: Redis serves these point operations entirely from memory through a single-threaded event loop, while MongoDB pays for document parsing, BSON serialization, and (by default) journaled writes.

The clear exception is workload E (short-range scans). Here MongoDB handled around 8,180 ops/sec versus Redis's 553 ops/sec, because Redis is not optimized for range queries against the YCSB data layout. So while Redis is the winner for caching, session storage, and high-throughput key-value access, MongoDB remains the better choice when the workload is dominated by range scans, secondary-index queries, or ad-hoc document filtering. In conclusion, choose Redis for raw point-access speed and predictable tail latency, and MongoDB when query flexibility and range access matter more than peak ops/sec.`;
