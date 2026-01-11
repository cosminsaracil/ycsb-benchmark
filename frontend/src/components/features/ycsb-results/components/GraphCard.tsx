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

export const GraphCard = ({
  currentTheme,
  chartType,
  chartData,
  metricInfo,
  formatNumber,
  lineData,
}: {
  currentTheme: string;
  chartType: "bar" | "line";
  chartData: Record<string, string | number>[];
  metricInfo: {
    label: string;
    field: string;
    unit: string;
    higher: boolean;
  };
  formatNumber: (num: number, decimals?: number) => string;
  lineData: {
    id: string;
    color: string;
    data: {
      x: string;
      y: number;
    }[];
  }[];
}) => {
  const NIVO_THEME =
    currentTheme === "dark" ? NIVO_THEME_DARK : NIVO_THEME_LIGHT;
  return (
    <Card
      className={cn(
        "shadow-sm",
        currentTheme === "dark" ? "border-gray-800/60" : "border-gray-200/60",
        currentTheme === "dark"
          ? "bg-gradient-to-br from-gray-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
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
        <div style={{ height: 480 }}>
          {chartType === "bar" ? (
            <ResponsiveBar
              data={chartData}
              keys={["redis", "mongodb"]}
              indexBy="workload"
              margin={{ top: 50, right: 140, bottom: 70, left: 90 }}
              padding={0.25}
              groupMode="grouped"
              colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
              theme={NIVO_THEME}
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
              tooltip={({ id, value, indexValue }) => (
                <div
                  style={{
                    padding: "10px 14px",
                    background: currentTheme === "dark" ? "#1f2937" : "#ffffff",
                    border: `1px solid ${
                      currentTheme === "dark" ? "#374151" : "#e5e7eb"
                    }`,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {indexValue}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor:
                          DB_COLORS[id as keyof typeof DB_COLORS],
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
                      {id}:
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {formatNumber(value as number, 2)} {metricInfo?.unit}
                    </span>
                  </div>
                </div>
              )}
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
              colors={({ id }) => DB_COLORS[id as keyof typeof DB_COLORS]}
              theme={NIVO_THEME}
              pointSize={11}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea={true}
              areaOpacity={0.08}
              lineWidth={3}
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
              tooltip={({ point }) => (
                <div
                  style={{
                    padding: "10px 14px",
                    background: currentTheme === "dark" ? "#1f2937" : "#ffffff",
                    border: `1px solid ${
                      currentTheme === "dark" ? "#374151" : "#e5e7eb"
                    }`,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {point.data.x}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: point.seriesColor,
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
                      {point.seriesId}:
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {formatNumber(point.data.y as number, 2)}{" "}
                      {metricInfo?.unit}
                    </span>
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
