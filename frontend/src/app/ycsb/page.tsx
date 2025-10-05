import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import YCSBResults from "@/components/features/ycsb-results";
import { fetchResults } from "@/utils/hooks/api/ycsb/useGetAllResults";

export default async function YCSB() {
  const queryClient = new QueryClient();

  // Prefetch the results data
  await queryClient.prefetchQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <YCSBResults />
    </HydrationBoundary>
  );
}
