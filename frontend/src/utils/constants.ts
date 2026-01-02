// export const METRICS = [
//   "Throughput(ops/sec)",
//   "AverageLatency(us)",
//   "95thPercentileLatency(us)",
//   "99thPercentileLatency(us)",
// ];

export const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// -------------------------------
//  NiVO Dark Theme
// -------------------------------
export const NIVO_THEME_DARK = {
  background: "#111827", // gray-900
  textColor: "#f3f4f6", // gray-100
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: "#555",
      },
    },
    ticks: {
      line: {
        stroke: "#777",
        strokeWidth: 1,
      },
      text: {
        fill: "#ddd",
      },
    },
    legend: {
      text: {
        fill: "#ddd",
      },
    },
  },
  grid: {
    line: {
      stroke: "#333",
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: "#ddd",
    },
  },
  tooltip: {
    container: {
      background: "#1f2937", // gray-800
      color: "#f3f4f6",
      fontSize: 12,
      borderRadius: 6,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      border: "1px solid #374151", // gray-700
    },
  },
  labels: {
    text: {
      fill: "#f3f4f6",
    },
  },
};

// -------------------------------
//  NiVO Light Theme
// -------------------------------
export const NIVO_THEME_LIGHT = {
  background: "#ffffff",
  textColor: "#111827", // gray-900
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: "#ccc",
      },
    },
    ticks: {
      line: {
        stroke: "#ddd",
        strokeWidth: 1,
      },
      text: {
        fill: "#555",
      },
    },
    legend: {
      text: {
        fill: "#444",
      },
    },
  },
  grid: {
    line: {
      stroke: "#e5e7eb", // gray-200
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: "#444",
    },
  },
  tooltip: {
    container: {
      background: "#ffffff",
      color: "#111827",
      fontSize: 12,
      borderRadius: 6,
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      border: "1px solid #e5e7eb",
    },
  },
  labels: {
    text: {
      fill: "#111827",
    },
  },
};

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
  insert_avg: {
    label: "Avg Insert Latency",
    field: "insert_avg",
    unit: "μs",
    higher: false,
  },
  scan_avg: {
    label: "Avg Scan Latency",
    field: "scan_avg",
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
  F: { name: "Read-Modify-Write", desc: "50% reads, 50% RMW" },
};

export const WORKLOADS = ["A", "B", "C", "D", "E", "F"];

export const DB_COLORS = {
  redis: "#ef4444",
  mongodb: "#3b82f6",
};
