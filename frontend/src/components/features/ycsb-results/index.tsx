"use client";
import { useState } from "react";
import { useGetAllResults } from "@/utils/hooks/api/ycsb/useGetAllResults";
import { METRICS } from "@/utils/constants";
import Statistics from "./components/Statistics";
import { Chart } from "./components/Chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const metricToFieldMap: Record<string, string> = {
  "Throughput(ops/sec)": "throughput",
  "AverageLatency(us)": "read_avg",
  "95thPercentileLatency(us)": "read_95th",
  "99thPercentileLatency(us)": "read_99th",
};

export default function YCSBResults() {
  const [selectedMetric, setSelectedMetric] = useState<string>(METRICS[0]);
  const { data: results = [], isError, error } = useGetAllResults();

  const metrics = METRICS;

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {(error as Error)?.message || "Error loading results"}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <h1 className="text-4xl font-bold mb-8">YCSB Benchmark Results</h1>
      <Select value={selectedMetric} onValueChange={setSelectedMetric}>
        <SelectTrigger className="w-[280px] mb-8">
          <SelectValue placeholder="Select a metric" />
        </SelectTrigger>
        <SelectContent>
          {metrics.map((metric) => (
            <SelectItem key={metric} value={metric}>
              {metric}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Chart
        results={results}
        selectedMetric={selectedMetric}
        metricToFieldMap={metricToFieldMap}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-6xl">
        {["A", "B", "C", "D", "E", "F"].map((workload) => (
          <Statistics
            key={workload}
            workload={workload}
            results={results}
            selectedMetric={selectedMetric}
            metricToFieldMap={metricToFieldMap}
          />
        ))}
      </div>
    </main>
  );
}
