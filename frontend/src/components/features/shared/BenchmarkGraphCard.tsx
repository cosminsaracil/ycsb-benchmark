"use client";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  NIVO_THEME_DARK,
  NIVO_THEME_LIGHT,
  DB_COLORS,
} from "@/utils/constants";

export type MetricInfo = {
  label: string;
  field: string;
  unit: string;
  higher: boolean;
};

type LineSeries = {
  id: string;
  color: string;
  data: { x: string; y: number }[];
};

type Props = {
  currentTheme: string;
  chartType: "bar" | "line";
  chartData: Record<string, string | number>[];
  lineData: LineSeries[];
  keys: string[];
  indexBy: string;
  metricInfo: MetricInfo;
  formatNumber: (num: number, decimals?: number) => string;
  height?: number;
};

const renderTooltip = (
  currentTheme: string,
  title: string,
  seriesLabel: string,
  seriesColor: string,
  value: number,
  formatNumber: (num: number, decimals?: number) => string,
  unit: string,
) => (
  <div
    style={{
      padding: "10px 14px",
      background: currentTheme === "dark" ? "#1f2937" : "#ffffff",
      border: `1px solid ${currentTheme === "dark" ? "#374151" : "#e5e7eb"}`,
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{title}</div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: seriesColor,
          marginRight: 8,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {seriesLabel}:
      </span>
      <span
        style={{
          marginLeft: 8,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "monospace",
        }}
      >
        {formatNumber(value, 2)} {unit}
      </span>
    </div>
  </div>
);

export const BenchmarkGraphCard = ({
  currentTheme,
  chartType,
  chartData,
  lineData,
  keys,
  indexBy,
  metricInfo,
  formatNumber,
  height = 480,
}: Props) => {
  const theme = currentTheme === "dark" ? NIVO_THEME_DARK : NIVO_THEME_LIGHT;
  const colorFor = (id: string) =>
    DB_COLORS[id as keyof typeof DB_COLORS] ?? "#6b7280";

  return (
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              {metricInfo?.label} Comparison
            </CardTitle>
            <CardDescription className="mt-1.5">
              {metricInfo.higher
                ? "Higher values indicate better performance"
                : "Lower values indicate better performance"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height }}>
          {chartType === "bar" ? (
            <ResponsiveBar
              data={chartData}
              keys={keys}
              indexBy={indexBy}
              margin={{ top: 50, right: 140, bottom: 70, left: 90 }}
              padding={0.25}
              groupMode="grouped"
              colors={({ id }) => colorFor(String(id))}
              theme={theme}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                legend: "Workload",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                legend: metricInfo?.unit,
                legendPosition: "middle",
                legendOffset: -70,
                format: (value) => formatNumber(value, 0),
              }}
              labelSkipWidth={16}
              labelSkipHeight={16}
              labelTextColor="#ffffff"
              label={(d) => formatNumber(d.value as number, 2)}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  translateX: 130,
                  translateY: 0,
                  itemsSpacing: 8,
                  itemWidth: 100,
                  itemHeight: 24,
                  symbolSize: 18,
                  itemDirection: "left-to-right",
                },
              ]}
              tooltip={({ id, value, indexValue }) =>
                renderTooltip(
                  currentTheme,
                  String(indexValue),
                  String(id),
                  colorFor(String(id)),
                  Number(value ?? 0),
                  formatNumber,
                  metricInfo?.unit,
                )
              }
              animate={true}
              motionConfig="gentle"
            />
          ) : (
            <ResponsiveLine
              data={lineData}
              margin={{ top: 50, right: 140, bottom: 70, left: 90 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                legend: "Workload",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                legend: metricInfo?.unit,
                legendPosition: "middle",
                legendOffset: -70,
                format: (value) => formatNumber(value, 0),
              }}
              colors={({ id }) => colorFor(String(id))}
              theme={theme}
              pointSize={11}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea={true}
              areaOpacity={0.08}
              lineWidth={3}
              useMesh={true}
              legends={[
                {
                  anchor: "bottom-right",
                  direction: "column",
                  translateX: 130,
                  translateY: 0,
                  itemsSpacing: 8,
                  itemWidth: 100,
                  itemHeight: 24,
                  symbolSize: 18,
                },
              ]}
              tooltip={({ point }) =>
                renderTooltip(
                  currentTheme,
                  String(point.data.x),
                  String(point.seriesId),
                  point.seriesColor,
                  Number(point.data.y),
                  formatNumber,
                  metricInfo?.unit,
                )
              }
              animate={true}
              motionConfig="gentle"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
