"use client";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
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
      padding: "8px 12px",
      background: currentTheme === "dark" ? "#0a0a0a" : "#ffffff",
      border: `1px solid ${currentTheme === "dark" ? "#262626" : "#e5e5e5"}`,
      borderRadius: 8,
      boxShadow:
        currentTheme === "dark"
          ? "0 4px 12px rgba(0,0,0,0.4)"
          : "0 4px 12px rgba(0,0,0,0.08)",
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: currentTheme === "dark" ? "#737373" : "#737373",
        marginBottom: 6,
      }}
    >
      {title}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: seriesColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          textTransform: "capitalize",
          color: currentTheme === "dark" ? "#e5e5e5" : "#171717",
        }}
      >
        {seriesLabel}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 13,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontVariantNumeric: "tabular-nums",
          color: currentTheme === "dark" ? "#fafafa" : "#0a0a0a",
        }}
      >
        {formatNumber(value, 2)}{" "}
        <span
          style={{ color: currentTheme === "dark" ? "#737373" : "#a3a3a3" }}
        >
          {unit}
        </span>
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
    DB_COLORS[id as keyof typeof DB_COLORS] ?? "#737373";

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="px-6 pt-5 pb-4">
        <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
          {metricInfo.higher
            ? "Higher is better"
            : "Lower is better"}
        </div>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {metricInfo?.label}
        </h3>
      </div>
      <div className="px-2 pb-4">
        <div style={{ height }}>
          {chartType === "bar" ? (
            <ResponsiveBar
              data={chartData}
              keys={keys}
              indexBy={indexBy}
              margin={{ top: 24, right: 140, bottom: 60, left: 80 }}
              padding={0.3}
              groupMode="grouped"
              colors={({ id }) => colorFor(String(id))}
              theme={theme}
              borderRadius={4}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                legend: "Workload",
                legendPosition: "middle",
                legendOffset: 44,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                legend: metricInfo?.unit,
                legendPosition: "middle",
                legendOffset: -64,
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
                  itemHeight: 22,
                  symbolSize: 10,
                  symbolShape: "circle",
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
              margin={{ top: 24, right: 140, bottom: 60, left: 80 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                legend: "Workload",
                legendPosition: "middle",
                legendOffset: 44,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                legend: metricInfo?.unit,
                legendPosition: "middle",
                legendOffset: -64,
                format: (value) => formatNumber(value, 0),
              }}
              colors={({ id }) => colorFor(String(id))}
              theme={theme}
              pointSize={9}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea={true}
              areaOpacity={0.06}
              lineWidth={2}
              useMesh={true}
              legends={[
                {
                  anchor: "bottom-right",
                  direction: "column",
                  translateX: 130,
                  translateY: 0,
                  itemsSpacing: 8,
                  itemWidth: 100,
                  itemHeight: 22,
                  symbolSize: 10,
                  symbolShape: "circle",
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
      </div>
    </div>
  );
};
