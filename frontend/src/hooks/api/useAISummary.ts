import { useCallback, useState } from "react";

type Requester<T> = (results: T) => Promise<{ summary: string }>;

export const useAISummary = <T,>(
  requester: Requester<T>,
  cachedFallback: string,
) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const generateSummary = useCallback(
    async (results: T) => {
      setIsLoading(true);
      setError(null);
      setSummary(null);
      setIsFromCache(false);

      try {
        const data = await requester(results);
        setSummary(data.summary);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setSummary(cachedFallback);
        setIsFromCache(true);
        console.error("Error generating AI summary, using cached text:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [requester, cachedFallback],
  );

  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
    setIsFromCache(false);
  }, []);

  return {
    summary,
    isLoading,
    error,
    isFromCache,
    generateSummary,
    clearSummary,
  };
};
