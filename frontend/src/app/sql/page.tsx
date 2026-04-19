import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import SQLResults from "@/components/features/sql-results";
import { fetchSQLResults } from "@/utils/hooks/api/sql/useGetAllResults";

export default async function SQLPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["sql-results"],
    queryFn: fetchSQLResults,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SQLResults />
    </HydrationBoundary>
  );
}
