import { useQuery } from "@tanstack/react-query";

export const fetchYCSBResults = async () => {
  const baseUrl = "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/results`);
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
};

export const useGetAllYCSBResults = () =>
  useQuery({
    queryKey: ["results"],
    queryFn: fetchYCSBResults,
  });
