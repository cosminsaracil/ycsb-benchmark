import type { ReactNode } from "react";
import { Select } from "@/components/ui/Select";

export type SelectOption = { value: string; label: string };

type Props = {
  description?: string;
  metricOptions: SelectOption[];
  workloadOptions: SelectOption[];
  selectedMetric: string;
  setSelectedMetric: (value: string) => void;
  selectedWorkloads: string[];
  setSelectedWorkloads: (workloads: string[]) => void;
  chartType: "bar" | "line";
  setChartType: (chartType: "bar" | "line") => void;
  currentTheme?: string;
  leaderLabel: string;
  leaderTone?: "default" | "destructive";
  /** Slot rendered in the top-right of the header (e.g. RunSelector). */
  headerRight?: ReactNode;
};

export const BenchmarkGraphConfiguration = ({
  description = "Customize your benchmark view and analysis parameters",
  metricOptions,
  workloadOptions,
  selectedMetric,
  setSelectedMetric,
  selectedWorkloads,
  setSelectedWorkloads,
  chartType,
  setChartType,
  leaderLabel,
  headerRight,
}: Props) => {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="px-6 pt-5 pb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
            Configuration
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-prose">
            {description}
          </p>
        </div>
        {headerRight && (
          <div className="md:pl-6 md:border-l md:border-neutral-200 md:dark:border-neutral-800">
            {headerRight}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Metric">
          <Select
            placeholder="Select a metric"
            value={selectedMetric}
            onChange={(value) => setSelectedMetric(value)}
            options={metricOptions}
            fullWidth
          />
        </Field>

        <Field label="Workload">
          <Select
            value={selectedWorkloads.join(",")}
            onChange={(value) => setSelectedWorkloads(value.split(","))}
            options={workloadOptions}
            fullWidth
          />
        </Field>

        <Field label="Chart type">
          <Select
            value={chartType}
            onChange={(value) => setChartType(value as "bar" | "line")}
            options={[
              { value: "bar", label: "Bar" },
              { value: "line", label: "Line" },
            ]}
            fullWidth
          />
        </Field>

        <Field label="Leader">
          <div className="h-9 flex items-center px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {leaderLabel}
            </span>
          </div>
        </Field>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
      {label}
    </label>
    {children}
  </div>
);
