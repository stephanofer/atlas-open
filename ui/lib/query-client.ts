import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // SIMPLE CONFIG - No caching, always fresh data
      staleTime: 0, // Data is immediately stale
      gcTime: 0, // Don't keep unused data in cache
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: true, // Refetch when component mounts
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // 1 second delay before retry
    },
    mutations: {
      retry: false, // Don't retry mutations
    },
  },
});
