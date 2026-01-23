import { QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is immediately stale, so refetch on mount
      staleTime: 0,
      // Keep data in cache for 5 minutes after unmount
      // CRITICAL: gcTime > 0 prevents data loss when switching tabs/apps
      gcTime: 1000 * 60 * 5,
      // Don't refetch when window regains focus - we handle this manually
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Don't refetch when component remounts if data exists
      refetchOnMount: false,
      // Retry once on network failures
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
