import { WorkloadGridProps } from "./types";
export default function WorkloadGrid({ data }: WorkloadGridProps) {
  if (!data) return null;

  const workloads = [
    "workloadA",
    "workloadB",
    "workloadC",
    "workloadD",
    "workloadF",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {workloads.map((workload) => (
        <div key={workload} className="p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{`Workload ${workload.slice(
            -1
          )}`}</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">MongoDB: </span>
              {data.mongodb?.[workload]?.throughput.toFixed(2) || "N/A"} ops/sec
            </div>
            <div>
              <span className="font-medium">Redis: </span>
              {data.redis?.[workload]?.throughput.toFixed(2) || "N/A"} ops/sec
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
