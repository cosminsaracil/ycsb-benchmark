import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { DB_COLORS } from "@/utils/constants";

export type SummaryStats = { avg: number; min: number; max: number };

export type BenchmarkSummaryEntry = {
  key: keyof typeof DB_COLORS | string;
  label: string;
  stats: SummaryStats | undefined;
  isWinner: boolean;
};

type Props = {
  entries: BenchmarkSummaryEntry[];
  currentTheme: string;
  formatNumber: (num: number, decimals?: number) => string;
  metricLabel?: string;
  metricUnit?: string;
};

export const BenchmarkSummaryCards = ({
  entries,
  currentTheme,
  formatNumber,
  metricLabel,
  metricUnit,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entries.map(({ key, label, stats, isWinner }) => {
        const color =
          DB_COLORS[key as keyof typeof DB_COLORS] ?? "var(--primary)";
        return (
          <Card
            key={key}
            className={cn(
              "shadow-sm transition-all hover:shadow-md",
              currentTheme === "dark"
                ? "border-gray-800/60"
                : "border-gray-200/60",
              isWinner && currentTheme === "dark"
                ? "ring-1 ring-green-500/30"
                : isWinner
                  ? "ring-1 ring-green-500/20"
                  : "",
              currentTheme === "dark"
                ? "bg-gradient-to-br from-gray-950 to-gray-900"
                : "bg-gradient-to-br from-gray-50 to-gray-100",
            )}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div
                    className="w-3 h-8 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </CardTitle>
                {isWinner && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-green-200 dark:border-green-800/60",
                      currentTheme === "dark"
                        ? "bg-green-950/30 text-green-400"
                        : "bg-green-50 text-green-700",
                    )}
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    Leader
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  {metricLabel ? `Average ${metricLabel}` : "Average"}
                </div>
                <div
                  className="text-4xl font-bold tabular-nums"
                  style={{ color }}
                >
                  {formatNumber(stats?.avg ?? 0)}
                </div>
              </div>
              <div
                className={cn(
                  "grid grid-cols-2 gap-4 pt-3 border-t",
                  currentTheme === "dark"
                    ? "border-gray-800/60"
                    : "border-gray-200/60",
                )}
              >
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Minimum
                  </div>
                  <div className="text-xl font-semibold tabular-nums">
                    {formatNumber(stats?.min ?? 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Maximum
                  </div>
                  <div className="text-xl font-semibold tabular-nums">
                    {formatNumber(stats?.max ?? 0)}
                  </div>
                </div>
              </div>
              {metricUnit && (
                <div
                  className={cn(
                    "text-xs text-muted-foreground pt-2 border-t",
                    currentTheme === "dark"
                      ? "border-gray-800/60"
                      : "border-gray-200/60",
                  )}
                >
                  Unit: <span className="font-mono">{metricUnit}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
