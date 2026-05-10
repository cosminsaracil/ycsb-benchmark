import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import SQLResults from "@/components/features/sql-results";
import { fetchSQLResults } from "@/hooks/api/services/sql";
import { QUERY_KEYS } from "@/constants/api";

export default async function SQLPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [...QUERY_KEYS.sqlResults, "latest"],
    queryFn: () => fetchSQLResults(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SQLResults />
    </HydrationBoundary>
  );
}
