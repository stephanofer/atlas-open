import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes - garbage collect after this
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent refetch on every mount (uses cache)
      retry: 1, // Limit retries to prevent infinite loops on errors
    },
  },
});
