export const formatBenchmarkNumber = (
  value: number | string | null | undefined,
  decimals = 2,
): string => {
  if (value === null || value === undefined || value === "") return "0";
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(n) || n === 0) return "0";
  if (n >= 1000) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }
  return n.toFixed(decimals);
};
