import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { SQL_WORKLOADS, SQL_METRICS } from "@/utils/constants";

interface SQLGraphConfigurationProps {
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  selectedWorkloads: string[];
  setSelectedWorkloads: (workloads: string[]) => void;
  chartType: "bar" | "line";
  setChartType: (type: "bar" | "line") => void;
  currentTheme: string;
  postgresWins: boolean;
}

export const SQLGraphConfiguration = ({
  selectedMetric,
  setSelectedMetric,
  selectedWorkloads,
  setSelectedWorkloads,
  chartType,
  setChartType,
  currentTheme,
  postgresWins,
}: SQLGraphConfigurationProps) => {
  return (
    <Card
      className={cn(
        "p-8",
        currentTheme === "dark"
          ? "bg-gradient-to-br from-gray-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 to-gray-100",
        "shadow-sm",
        currentTheme === "dark" ? "border-gray-800/60" : "border-gray-200/60",
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-primary" />
              Configuration
            </CardTitle>
            <CardDescription className="mt-1.5">
              Customize your SQL benchmark view and analysis parameters
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Performance Metric */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Performance Metric
            </label>
            <Select
              placeholder="Select a metric"
              value={selectedMetric}
              onChange={(value) => setSelectedMetric(value)}
              options={Object.entries(SQL_METRICS).map(([key, { label }]) => ({
                value: key,
                label: label,
              }))}
              fullWidth
            />
          </div>

          {/* Workload Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Workload Selection
            </label>
            <Select
              value={selectedWorkloads.join(",")}
              onChange={(value) => setSelectedWorkloads(value.split(","))}
              options={[
                { value: SQL_WORKLOADS.join(","), label: "All Workloads" },
                { value: "W1,W2", label: "W1, W2" },
                { value: "W3,W4", label: "W3, W4" },
                ...SQL_WORKLOADS.map((w) => ({
                  value: w,
                  label: `${w}`,
                })),
              ]}
              fullWidth
            />
          </div>

          {/* Visualization Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Visualization Type
            </label>
            <Select
              value={chartType}
              onChange={(value) => setChartType(value as "bar" | "line")}
              options={[
                { value: "bar", label: "Bar Chart" },
                { value: "line", label: "Line Chart" },
              ]}
              fullWidth
            />
          </div>

          {/* Performance Leader */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Performance Leader
            </label>
            <div
              className={cn(
                "h-9 flex items-center px-3.5 rounded-lg border",
                currentTheme === "dark"
                  ? "border-gray-800/60 bg-muted/20"
                  : "border-gray-200/60 bg-muted/30",
              )}
            >
              <Badge
                variant={postgresWins ? "destructive" : "default"}
                className="font-medium text-xs px-2.5 py-0.5"
              >
                {postgresWins ? "PostgreSQL" : "MySQL"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
