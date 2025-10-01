type WorkloadData = {
  throughput?: number;
};

type DatabaseData = {
  workloadA?: WorkloadData;
  workloadB?: WorkloadData;
  workloadC?: WorkloadData;
  workloadD?: WorkloadData;
  workloadF?: WorkloadData;
};

export type ChartProps = {
  data: {
    mongodb?: DatabaseData;
    redis?: DatabaseData;
  };
};
