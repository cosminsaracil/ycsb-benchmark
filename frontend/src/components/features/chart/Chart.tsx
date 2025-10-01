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
import { ChartProps } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Database Performance Comparison",
    },
  },
};

export default function Chart({ data }: ChartProps) {
  if (!data) return null;

  const chartData = {
    labels: [
      "Workload A",
      "Workload B",
      "Workload C",
      "Workload D",
      "Workload F",
    ],
    datasets: [
      {
        label: "MongoDB",
        data: [
          data.mongodb?.workloadA?.throughput || 0,
          data.mongodb?.workloadB?.throughput || 0,
          data.mongodb?.workloadC?.throughput || 0,
          data.mongodb?.workloadD?.throughput || 0,
          data.mongodb?.workloadF?.throughput || 0,
        ],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Redis",
        data: [
          data.redis?.workloadA?.throughput || 0,
          data.redis?.workloadB?.throughput || 0,
          data.redis?.workloadC?.throughput || 0,
          data.redis?.workloadD?.throughput || 0,
          data.redis?.workloadF?.throughput || 0,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
}
