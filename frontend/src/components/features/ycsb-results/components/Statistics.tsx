import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BenchmarkData, BenchmarkResult, ResultsCardProps } from "../types";

const Statistics = ({
  workload,
  results,
  selectedMetric,
  metricToFieldMap,
}: ResultsCardProps) => {
  const databases = ["mongodb", "redis"];

  const getDatabaseData = (db: string) => {
    return results
      .flatMap((r: BenchmarkResult) => r.data)
      .find((d: BenchmarkData) => d.database === db && d.workload === workload);
  };

  const formatValue = (data: BenchmarkData | undefined) => {
    if (!data) return "N/A";

    const value = data[metricToFieldMap[selectedMetric]];
    console.log(value);
    return typeof value === "string" ? Number(value).toFixed(3) : value;
  };

  const getDatabaseColor = (db: string) => {
    return db === "mongodb"
      ? "text-blue-600 dark:text-blue-400"
      : "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Workload {workload}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {databases.map((db) => {
          const data = getDatabaseData(db);
          return (
            <div
              key={db}
              className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <span
                className={`font-medium capitalize ${getDatabaseColor(db)}`}
              >
                {db}
              </span>
              <span className="font-mono text-sm font-semibold">
                {formatValue(data)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Statistics;
