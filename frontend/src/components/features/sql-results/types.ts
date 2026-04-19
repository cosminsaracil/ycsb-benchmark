export interface SQLSummaryStats {
  avg: number;
  min: number;
  max: number;
}

export interface SQLGraphConfigurationProps {
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  selectedWorkloads: string[];
  setSelectedWorkloads: (workloads: string[]) => void;
  chartType: "bar" | "line";
  setChartType: (type: "bar" | "line") => void;
  currentTheme: string;
  postgresWins: boolean;
}

export interface SQLSummaryCardsProps {
  summaryStats: {
    postgres: SQLSummaryStats;
    mysql: SQLSummaryStats;
  } | null;
  postgresWins: boolean;
  currentTheme: string;
  formatNumber: (value: number, decimals?: number) => string;
  metricLabel: string;
  metricUnit: string;
}

export interface SQLInformationSectionProps {
  currentTheme: string;
}

export interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}
