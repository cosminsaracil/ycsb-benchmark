export const SQL_METRICS = {
  throughput_ops_sec: {
    label: "Throughput",
    field: "throughput_ops_sec",
    unit: "ops/sec",
    higher: true,
  },
  avg_latency_us: {
    label: "Average Latency",
    field: "avg_latency_us",
    unit: "μs",
    higher: false,
  },
  p95_latency_us: {
    label: "95th Percentile Latency",
    field: "p95_latency_us",
    unit: "μs",
    higher: false,
  },
  p99_latency_us: {
    label: "99th Percentile Latency",
    field: "p99_latency_us",
    unit: "μs",
    higher: false,
  },
};

export const SQL_WORKLOADS = ["W1", "W2", "W3", "W4"];

export const SQL_WORKLOAD_INFO = {
  W1: { name: "Join-Heavy", desc: "Join-heavy operations" },
  W2: { name: "Aggregation-Heavy", desc: "Aggregation-heavy operations" },
  W3: { name: "Transaction-Heavy", desc: "Transaction-heavy operations" },
  W4: {
    name: "Mixed OLTP+OLAP",
    desc: "Mixed online transaction processing and online analytical processing",
  },
};

export const INFO_SECTION_SQL_METRICS = {
  throughput_ops_sec: {
    label: "Throughput",
    unit: "ops/sec",
    description:
      "Total number of SQL operations (queries, updates) completed per second",
    interpretation: "Higher is better",
    badge: "Performance",
  },
  avg_latency_us: {
    label: "Average Latency",
    unit: "μs",
    description:
      "Average time taken to complete a SQL operation from submission to completion",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  p95_latency_us: {
    label: "95th Percentile Latency",
    unit: "μs",
    description: "95% of SQL operations complete faster than this time",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  p99_latency_us: {
    label: "99th Percentile Latency",
    unit: "μs",
    description:
      "99% of SQL operations complete faster than this time - represents tail latency",
    interpretation: "Lower is better",
    badge: "Latency",
  },
};
