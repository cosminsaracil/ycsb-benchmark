import { QueryClient } from "@tanstack/react-query";
import { fetchYCSBResults } from "@/hooks/api/services/ycsb";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Dashboard from "@/components/features/dashboard";
import { QUERY_KEYS } from "@/constants/api";

export default async function HomePage() {
  const queryClient = new QueryClient();

  // Prefetch the results data - BOTH
  await queryClient.prefetchQuery({
    queryKey: [...QUERY_KEYS.ycsbResults, "latest"],
    queryFn: () => fetchYCSBResults(),
  });
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Dashboard />
      </HydrationBoundary>
    </div>
  );
}

// TODO: Add some sort of control. Something like: YCSB benchmark - finished, results - ready, last run - 1h ago
