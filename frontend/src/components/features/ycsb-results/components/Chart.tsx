import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { BenchmarkData, BenchmarkResult, BenchmarkChartProps } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function Chart({
  results,
  selectedMetric,
  metricToFieldMap,
  workloads = ["A", "B", "C", "D", "E", "F"],
  databases = [
    {
      name: "mongodb",
      label: "MongoDB",
      backgroundColor: "rgba(54, 162, 235, 0.5)",
      borderColor: "rgba(54, 162, 235, 1)",
    },
    {
      name: "redis",
      label: "Redis",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
      borderColor: "rgba(255, 99, 132, 1)",
    },
  ],
  width = "1000px",
  height = "600px",
}: BenchmarkChartProps) {
  const chartData = {
    labels: workloads.map((w) => `Workload ${w}`),
    datasets: databases.map((db) => ({
      label: db.label,
      data: workloads.map((workload) => {
        const workloadData = results
          .flatMap((r: BenchmarkResult) => r.data)
          .find(
            (d: BenchmarkData) =>
              d.database === db.name && d.workload === workload
          );
        const metricField = metricToFieldMap[selectedMetric];
        return workloadData?.[metricField] ?? 0;
      }),
      backgroundColor: db.backgroundColor,
      borderColor: db.borderColor,
      borderWidth: 1,
    })),
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      title: {
        display: true,
        text: `${selectedMetric} by Workload`,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: selectedMetric,
          font: {
            size: 12,
            weight: 500,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Workloads",
          font: {
            size: 12,
            weight: 500,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ width, height }} className="mx-auto">
      <Bar options={chartOptions} data={chartData} />
    </div>
  );
}
