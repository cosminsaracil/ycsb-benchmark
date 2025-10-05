export interface BenchmarkData {
  throughput: number;
  read_avg: number;
  read_95th: number;
  read_99th: number;
  database: string;
  workload: string;
  [key: string]: string | number;
}

export interface BenchmarkResult {
  filename: string;
  database: string;
  data: BenchmarkData[];
}

export interface ChartOptions {
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
