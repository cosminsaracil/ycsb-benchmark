import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import YCSBResults from "@/components/features/ycsb-results";
import { fetchYCSBResults } from "@/utils/hooks/api/ycsb/useGetAllResults";

export default async function YCSB() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["resultsYCSB"],
    queryFn: fetchYCSBResults,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <YCSBResults />
    </HydrationBoundary>
  );
}
