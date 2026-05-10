import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  INFO_SECTION_WORKLOAD,
  INFO_SECTION_METRICS,
} from "@/utils/ycsb-constants";
import { BenchmarkInfoCard } from "@/components/features/shared/BenchmarkInfoCard";

type Props = { currentTheme: string };

const Workloads = ({ currentTheme }: Props) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Object.entries(INFO_SECTION_WORKLOAD).map(([key, info]) => {
      const Icon = info.icon;
      return (
        <div
          key={key}
          className={cn(
            "p-5 rounded-lg border transition-all hover:shadow-md",
            currentTheme === "dark"
              ? "bg-gray-800/30 border-gray-700/60 hover:bg-gray-800/50"
              : "bg-gray-50/50 border-gray-200/60 hover:bg-gray-50",
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                currentTheme === "dark"
                  ? "bg-primary/20 text-primary"
                  : "bg-primary/10 text-primary",
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="font-bold text-xl">Workload {key}</div>
          </div>
          <div className="text-sm font-semibold text-primary mb-2">
            {info.name}
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {info.desc}
          </div>
        </div>
      );
    })}
  </div>
);

const Metrics = ({ currentTheme }: Props) => (
  <div className="space-y-4">
    {Object.entries(INFO_SECTION_METRICS).map(([key, info]) => (
      <div
        key={key}
        className={cn(
          "p-5 rounded-lg border transition-all",
          currentTheme === "dark"
            ? "bg-gray-800/30 border-gray-700/60"
            : "bg-gray-50/50 border-gray-200/60",
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-semibold">{info.label}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  info.badge === "Performance"
                    ? currentTheme === "dark"
                      ? "bg-green-950/30 text-green-400 border-green-800/60"
                      : "bg-green-50 text-green-700 border-green-200"
                    : currentTheme === "dark"
                      ? "bg-blue-950/30 text-blue-400 border-blue-800/60"
                      : "bg-blue-50 text-blue-700 border-blue-200",
                )}
              >
                {info.badge}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {info.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Unit:
            </span>
            <code
              className={cn(
                "px-2 py-0.5 rounded text-xs font-mono",
                currentTheme === "dark"
                  ? "bg-gray-900 text-gray-300"
                  : "bg-gray-100 text-gray-700",
              )}
            >
              {info.unit}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Interpretation:
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                info.interpretation.includes("Higher")
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400",
              )}
            >
              {info.interpretation}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const About = ({ currentTheme }: Props) => (
  <Card
    className={cn(
      "shadow-sm",
      currentTheme === "dark" ? "border-gray-800/60" : "border-gray-200/60",
      currentTheme === "dark"
        ? "bg-gradient-to-br from-gray-950 to-gray-900"
        : "bg-gradient-to-br from-gray-50 to-gray-100",
    )}
  >
    <CardHeader className="pb-4">
      <CardTitle className="text-base font-semibold">
        About YCSB Benchmarks
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          The Yahoo! Cloud Serving Benchmark (YCSB) is a framework for
          evaluating the performance of different database systems under various
          workload scenarios.
        </p>
        <p>
          Each workload (A-F) represents a different mix of operations that
          simulate real-world usage patterns. The benchmark measures both
          throughput (operations per second) and latency (time per operation)
          across different operation types like reads, updates, inserts, and
          scans.
        </p>
        <p>
          <strong>Note:</strong> Latency is measured in microseconds (μs), where
          1 millisecond = 1,000 microseconds. Percentile metrics (95th, 99th)
          help identify tail latency and ensure consistent performance for most
          users.
        </p>
      </div>
    </CardContent>
  </Card>
);

export const InformationSection = ({ currentTheme }: Props) => (
  <BenchmarkInfoCard
    currentTheme={currentTheme}
    title="YCSB Benchmark Information"
    description="Understanding workload characteristics and performance metrics"
    workloadsContent={<Workloads currentTheme={currentTheme} />}
    metricsContent={<Metrics currentTheme={currentTheme} />}
    footer={<About currentTheme={currentTheme} />}
  />
);
