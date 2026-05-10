import { Activity, Database, FileText, TrendingUp } from "lucide-react";

export const METRICS = {
  throughput: {
    label: "Throughput",
    field: "throughput",
    unit: "ops/sec",
    higher: true,
  },
  read_avg: {
    label: "Avg Read Latency",
    field: "read_avg",
    unit: "μs",
    higher: false,
  },
  read_95th: {
    label: "95th Read",
    field: "read_95th",
    unit: "μs",
    higher: false,
  },
  read_99th: {
    label: "99th Read",
    field: "read_99th",
    unit: "μs",
    higher: false,
  },
  update_avg: {
    label: "Avg Update Latency",
    field: "update_avg",
    unit: "μs",
    higher: false,
  },
  update_95th: {
    label: "95th Update",
    field: "update_95th",
    unit: "μs",
    higher: false,
  },
  update_99th: {
    label: "99th Update",
    field: "update_99th",
    unit: "μs",
    higher: false,
  },
  insert_avg: {
    label: "Avg Insert Latency",
    field: "insert_avg",
    unit: "μs",
    higher: false,
  },
  insert_95th: {
    label: "95th Insert",
    field: "insert_95th",
    unit: "μs",
    higher: false,
  },
  insert_99th: {
    label: "99th Insert",
    field: "insert_99th",
    unit: "μs",
    higher: false,
  },
  scan_avg: {
    label: "Avg Scan Latency",
    field: "scan_avg",
    unit: "μs",
    higher: false,
  },
  scan_95th: {
    label: "95th Scan",
    field: "scan_95th",
    unit: "μs",
    higher: false,
  },
  scan_99th: {
    label: "99th Scan",
    field: "scan_99th",
    unit: "μs",
    higher: false,
  },
};

export const WORKLOAD_INFO = {
  A: { name: "Update Heavy", desc: "50% reads, 50% updates" },
  B: { name: "Read Heavy", desc: "95% reads, 5% updates" },
  C: { name: "Read Only", desc: "100% reads" },
  D: { name: "Read Latest", desc: "95% reads, 5% inserts" },
  E: { name: "Scan Heavy", desc: "95% scans, 5% inserts" },
  F: {
    name: "Read-Modify-Write",
    desc: "50% reads, 50% RMW (read-modify-write)",
  },
};

export const WORKLOADS = ["A", "B", "C", "D", "E", "F"];

export const INFO_SECTION_WORKLOAD = {
  A: { name: "Update Heavy", desc: "50% reads, 50% updates", icon: Activity },
  B: { name: "Read Heavy", desc: "95% reads, 5% updates", icon: FileText },
  C: { name: "Read Only", desc: "100% reads", icon: FileText },
  D: { name: "Read Latest", desc: "95% reads, 5% inserts", icon: TrendingUp },
  E: { name: "Scan Heavy", desc: "95% scans, 5% inserts", icon: Database },
  F: {
    name: "Read-Modify-Write",
    desc: "50% reads, 50% RMW (read-modify-write)",
    icon: Activity,
  },
};

export const INFO_SECTION_METRICS = {
  throughput: {
    label: "Throughput",
    unit: "ops/sec",
    description:
      "Total number of operations completed per second across all operation types",
    interpretation: "Higher is better",
    badge: "Performance",
  },
  read_avg: {
    label: "Avg Read Latency",
    unit: "μs",
    description:
      "Average time taken to complete a read operation from the database",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  read_95th: {
    label: "95th Percentile Read",
    unit: "μs",
    description: "95% of read operations complete faster than this time",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  read_99th: {
    label: "99th Percentile Read",
    unit: "μs",
    description:
      "99% of read operations complete faster than this time - represents tail latency",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  update_avg: {
    label: "Avg Update Latency",
    unit: "μs",
    description:
      "Average time taken to update an existing record in the database",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  update_95th: {
    label: "95th Percentile Update",
    unit: "μs",
    description: "95% of update operations complete faster than this time",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  update_99th: {
    label: "99th Percentile Update",
    unit: "μs",
    description:
      "99% of update operations complete faster than this time - represents tail latency",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  insert_avg: {
    label: "Avg Insert Latency",
    unit: "μs",
    description: "Average time taken to insert a new record into the database",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  insert_95th: {
    label: "95th Percentile Insert",
    unit: "μs",
    description: "95% of insert operations complete faster than this time",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  insert_99th: {
    label: "99th Percentile Insert",
    unit: "μs",
    description:
      "99% of insert operations complete faster than this time - represents tail latency",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  scan_avg: {
    label: "Avg Scan Latency",
    unit: "μs",
    description:
      "Average time taken to scan a range of records from the database",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  scan_95th: {
    label: "95th Percentile Scan",
    unit: "μs",
    description: "95% of scan operations complete faster than this time",
    interpretation: "Lower is better",
    badge: "Latency",
  },
  scan_99th: {
    label: "99th Percentile Scan",
    unit: "μs",
    description:
      "99% of scan operations complete faster than this time - represents tail latency",
    interpretation: "Lower is better",
    badge: "Latency",
  },
};
