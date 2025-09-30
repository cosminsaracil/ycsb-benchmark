"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BenchmarkData {
  throughput: number;
  read_avg: number;
  read_95th: number;
  read_99th: number;
  database: string;
  workload: string;
}

interface BenchmarkResult {
  filename: string;
  database: string;
  data: BenchmarkData[];
}

interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: {
      position: "top";
    };
    title: {
      display: true;
      text: string;
    };
  };
  scales: {
    y: {
      beginAtZero: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
    x: {
      title: {
        display: boolean;
        text: string;
      };
    };
  };
}

const metricToFieldMap: { [key: string]: string } = {
  "Throughput(ops/sec)": "throughput",
  "AverageLatency(us)": "read_avg",
  "95thPercentileLatency(us)": "read_95th",
  "99thPercentileLatency(us)": "read_99th",
};

export default function Home() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = "http://localhost:8000";

        console.log("Fetching data from:", baseUrl);

        const fetchWithDebug = async (url: string) => {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log(`Response from ${url}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: (() => {
              const headersObj: Record<string, string> = {};
              response.headers.forEach((value, key) => {
                headersObj[key] = value;
              });
              return headersObj;
            })(),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        };

        const [resultsRes, metricsRes] = await Promise.all([
          fetchWithDebug(`${baseUrl}/api/results`),
          fetchWithDebug(`${baseUrl}/api/metrics`),
        ]);

        const resultsData = await resultsRes.json();
        const metricsData = await metricsRes.json();

        console.log("Results data:", resultsData);
        console.log("Metrics data:", metricsData);

        setResults(resultsData);
        setMetrics(metricsData.metrics);
        setSelectedMetric(metricsData.metrics[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ["A", "B", "C", "D", "E", "F"].map((w) => `Workload ${w}`),
    datasets: [
      {
        label: "MongoDB",
        data: ["A", "B", "C", "D", "E", "F"].map((workload) => {
          const workloadData = results
            .flatMap((r) => r.data)
            .find(
              (d): d is BenchmarkData =>
                d.database === "mongodb" && d.workload === workload
            );
          const metricField = metricToFieldMap[selectedMetric];
          return workloadData && metricField
            ? workloadData[metricField] || 0
            : 0;
        }),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Redis",
        data: ["A", "B", "C", "D", "E", "F"].map((workload) => {
          const workloadData = results
            .flatMap((r) => r.data)
            .find(
              (d): d is BenchmarkData =>
                d.database === "redis" && d.workload === workload
            );
          const metricField = metricToFieldMap[selectedMetric];
          return workloadData && metricField
            ? workloadData[metricField] || 0
            : 0;
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
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${selectedMetric} by Workload`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: selectedMetric,
        },
      },
      x: {
        title: {
          display: true,
          text: "Workloads",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

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
              const data = results
                .flatMap((r) => r.data)
                .find((d) => d.database === db && d.workload === workload);
              return (
                <div key={db} className="flex justify-between">
                  <span className="capitalize">{db}:</span>
                  <span>
                    {data
                      ? data[metricToFieldMap[selectedMetric]]?.toFixed(2)
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
