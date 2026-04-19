import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import YCSBResults from "@/components/features/ycsb-results";
import { fetchYCSBResults } from "@/hooks/api/services/ycsb";
import { QUERY_KEYS } from "@/constants/api";

export default async function YCSB() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.ycsbResults,
    queryFn: fetchYCSBResults,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <YCSBResults />
    </HydrationBoundary>
  );
}
