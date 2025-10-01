type WorkloadData = {
  mongodb?: Record<string, { throughput: number }>;
  redis?: Record<string, { throughput: number }>;
};

export type WorkloadGridProps = {
  data: WorkloadData | undefined;
};
