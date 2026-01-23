import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection to clean stale cache
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on Supabase errors (auth, RLS, not found, permission)
        const message = error instanceof Error ? error.message : "";
        if (
          message.includes("PGRST") ||
          message.includes("JWT") ||
          message.includes("permission") ||
          message.includes("row-level security")
        ) {
          return false;
        }
        // Max 2 retries for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      // Never retry mutations - they should succeed or fail once
      retry: false,
    },
  },
});
