import { QueryClient, focusManager } from "@tanstack/react-query";

// CRITICAL: Disable focus detection completely
// This prevents issues when switching tabs/apps and returning
// TanStack Query will always think the window is focused
focusManager.setFocused(true);

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
      // Don't refetch when component remounts if data exists
      refetchOnMount: true,
      // Retry once on network failures
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
