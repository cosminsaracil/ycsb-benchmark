export const SQL_BENCHMARK_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const toNumber = (value: string | number | null | undefined) =>
  Number(value ?? 0);

export const formatBenchmarkNumber = (value: string | number, decimals = 2) => {
  const numericValue = toNumber(value);
  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
