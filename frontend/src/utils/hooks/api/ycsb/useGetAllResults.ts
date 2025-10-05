import { useQuery } from "@tanstack/react-query";

export const fetchResults = async () => {
  const baseUrl = "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/results`);
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
};

export const useGetAllResults = () =>
  useQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
  });
