export type GraphConfigurationProps = {
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  selectedWorkloads: string[];
  setSelectedWorkloads: (workloads: string[]) => void;
  chartType: "bar" | "line";
  setChartType: (chartType: "bar" | "line") => void;
  currentTheme: string;
  redisWins: boolean;
};

export type SummaryCardsProps = {
  summaryStats: {
    redis: {
      avg: number;
      min: number;
      max: number;
    };
    mongodb: {
      avg: number;
      min: number;
      max: number;
    };
  } | null;
  redisWins: boolean;
  currentTheme: string;
  formatNumber: (num: number) => string;
  metricInfo: {
    label: string;
    field: string;
    unit: string;
    higher: boolean;
  };
};
