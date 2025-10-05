"use client";

import { useState } from "react";
import { useGetAllResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { METRICS } from "@/utils/constants";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BenchmarkData, BenchmarkResult } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const metricToFieldMap: Record<string, string> = {
  "Throughput(ops/sec)": "throughput",
  "AverageLatency(us)": "read_avg",
  "95thPercentileLatency(us)": "read_95th",
  "99thPercentileLatency(us)": "read_99th",
};

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string>(METRICS[0]);
  const { data: results = [], isLoading, isError, error } = useGetAllResults();

  const metrics = METRICS;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {(error as Error)?.message || "Error loading results"}
      </div>
    );
  }

  const chartData = {
    labels: ["A", "B", "C", "D", "E", "F"].map((w) => `Workload ${w}`),
    datasets: [
      {
        label: "MongoDB",
        data: ["A", "B", "C", "D", "E", "F"].map((workload) => {
          const workloadData = results
            .flatMap((r: BenchmarkResult) => r.data)
            .find(
              (d: BenchmarkData) =>
                d.database === "mongodb" && d.workload === workload
            );
          const metricField = metricToFieldMap[selectedMetric];
          return workloadData?.[metricField] ?? 0;
        }),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Redis",
        data: ["A", "B", "C", "D", "E", "F"].map((workload) => {
          const workloadData = results
            .flatMap((r: BenchmarkResult) => r.data)
            .find(
              (d: BenchmarkData) =>
                d.database === "redis" && d.workload === workload
            );
          const metricField = metricToFieldMap[selectedMetric];
          return workloadData?.[metricField] ?? 0;
        }),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `${selectedMetric} by Workload` },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: selectedMetric } },
      x: { title: { display: true, text: "Workloads" } },
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">YCSB Benchmark Results</h1>
      <select
        className="mb-4 p-2 border rounded"
        value={selectedMetric}
        onChange={(e) => setSelectedMetric(e.target.value)}
      >
        {metrics.map((metric) => (
          <option key={metric} value={metric}>
            {metric}
          </option>
        ))}
      </select>
      <div className="w-[1000px] h-[600px]">
        <Bar options={chartOptions} data={chartData} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-8">
        {["A", "B", "C", "D", "E", "F"].map((workload) => (
          <div key={workload} className="p-4 border rounded shadow">
            <h3 className="font-bold mb-2">Workload {workload}</h3>
            {["mongodb", "redis"].map((db) => {
              const data: BenchmarkData | undefined = results
                .flatMap((r: BenchmarkResult) => r.data)
                .find(
                  (d: BenchmarkData) =>
                    d.database === db && d.workload === workload
                );
              return (
                <div key={db} className="flex justify-between">
                  <span className="capitalize">{db}:</span>
                  <span>
                    {data
                      ? typeof data[metricToFieldMap[selectedMetric]] ===
                        "number"
                        ? (
                            data[metricToFieldMap[selectedMetric]] as number
                          ).toFixed(2)
                        : data[metricToFieldMap[selectedMetric]]
                      : "N/A"}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
