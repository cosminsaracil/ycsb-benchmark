import { useMemo } from "react";
import { DB_COLORS } from "@/utils/constants";

type Row = Record<string, string | number>;

export type SummaryStats = { avg: number; min: number; max: number };

type Args<TKey extends string> = {
  rows: Row[] | undefined;
  databases: TKey[];
  workloads: string[];
  metricField: string;
  workloadField?: string;
  databaseField?: string;
  workloadLabel?: (workload: string) => string;
  /** Allows transforming the workload identifier when matching rows (e.g. SQL prefixes). */
  matchWorkload?: (rowWorkload: string, workload: string) => boolean;
};

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isNaN(n) ? 0 : n;
};

export function useBenchmarkChartData<TKey extends string>({
  rows,
  databases,
  workloads,
  metricField,
  workloadField = "workload",
  databaseField = "database",
  workloadLabel = (w) => `Workload ${w}`,
  matchWorkload = (rowWorkload, workload) => rowWorkload === workload,
}: Args<TKey>) {
  const chartData = useMemo(() => {
    if (!rows) return [] as Record<string, string | number>[];
    return workloads.map((workload) => {
      const out: Record<string, string | number> = {
        workload: workloadLabel(workload),
      };
      databases.forEach((db) => {
        const entry = rows.find(
          (r) =>
            r[databaseField] === db &&
            matchWorkload(String(r[workloadField] ?? ""), workload),
        );
        out[db] = entry ? toNumber(entry[metricField]) : 0;
      });
      return out;
    });
  }, [
    rows,
    workloads,
    databases,
    metricField,
    workloadField,
    databaseField,
    workloadLabel,
    matchWorkload,
  ]);

  const lineData = useMemo(() => {
    if (!rows) return [];
    return databases.map((db) => ({
      id: db,
      color: DB_COLORS[db as keyof typeof DB_COLORS] ?? "#6b7280",
      data: workloads.map((workload) => {
        const entry = rows.find(
          (r) =>
            r[databaseField] === db &&
            matchWorkload(String(r[workloadField] ?? ""), workload),
        );
        return {
          x: workloadLabel(workload),
          y: entry ? toNumber(entry[metricField]) : 0,
        };
      }),
    }));
  }, [
    rows,
    workloads,
    databases,
    metricField,
    workloadField,
    databaseField,
    workloadLabel,
    matchWorkload,
  ]);

  const summaryStats = useMemo(() => {
    const out = {} as Record<TKey, SummaryStats>;
    if (!rows) {
      databases.forEach((db) => {
        out[db] = { avg: 0, min: 0, max: 0 };
      });
      return out;
    }
    databases.forEach((db) => {
      const values = rows
        .filter(
          (r) =>
            r[databaseField] === db &&
            workloads.some((w) =>
              matchWorkload(String(r[workloadField] ?? ""), w),
            ),
        )
        .map((r) => toNumber(r[metricField]))
        .filter((v) => v > 0);
      out[db] =
        values.length === 0
          ? { avg: 0, min: 0, max: 0 }
          : {
              avg: values.reduce((a, b) => a + b, 0) / values.length,
              min: Math.min(...values),
              max: Math.max(...values),
            };
    });
    return out;
  }, [rows, databases, workloads, metricField, workloadField, databaseField, matchWorkload]);

  return { chartData, lineData, summaryStats };
}
