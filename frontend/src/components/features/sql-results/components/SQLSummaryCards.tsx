import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { DB_COLORS } from "@/utils/constants";
import type { SQLSummaryCardsProps } from "../types";

export const SQLSummaryCards = ({
  summaryStats,
  postgresWins,
  currentTheme,
  formatNumber,
  metricLabel,
  metricUnit,
}: SQLSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        {
          db: "postgres",
          label: "PostgreSQL",
          stats: summaryStats?.postgres,
        },
        {
          db: "mysql",
          label: "MySQL",
          stats: summaryStats?.mysql,
        },
      ].map(({ db, label, stats }) => {
        const isWinner =
          (db === "postgres" && postgresWins) ||
          (db === "mysql" && !postgresWins);

        return (
          <Card
            key={db}
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
                    style={{
                      backgroundColor: DB_COLORS[db as keyof typeof DB_COLORS],
                    }}
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
                  Average {metricLabel}
                </div>
                <div
                  className="text-4xl font-bold tabular-nums"
                  style={{
                    color: DB_COLORS[db as keyof typeof DB_COLORS],
                  }}
                >
                  {formatNumber(stats?.avg || 0)}
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
                    {formatNumber(stats?.min || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Maximum
                  </div>
                  <div className="text-xl font-semibold tabular-nums">
                    {formatNumber(stats?.max || 0)}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between gap-3 text-xs pt-2 border-t",
                  currentTheme === "dark"
                    ? "border-gray-800/60 text-muted-foreground"
                    : "border-gray-200/60 text-muted-foreground",
                )}
              >
                <span>Unit</span>
                <span className="font-mono">{metricUnit}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
