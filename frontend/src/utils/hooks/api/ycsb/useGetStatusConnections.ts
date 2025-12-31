import { useQuery } from "@tanstack/react-query";

export const fetchDBStatusConnections = async () => {
  const baseUrl = "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/check-connection`);
  if (!response.ok) {
    throw new Error("Failed to fetch DB connections");
  }
  return response.json();
};

export const useGetDBStatusConnections = () =>
  useQuery({
    queryKey: ["db-status-connections"],
    queryFn: fetchDBStatusConnections,
  });
