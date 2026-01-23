import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";

// ============================================================================
// CRITICAL: Disable automatic refetch triggers
// ============================================================================
// These settings prevent issues when switching tabs/apps and returning.
// Without these, TanStack Query will refetch/pause queries on focus/network changes.

// 1. Disable focus detection completely
// TanStack Query will always think the window is focused
focusManager.setFocused(true);

// 2. Disable online detection completely
// TanStack Query will always think we're online
// This prevents queries from being "paused" when switching tabs/apps
onlineManager.setOnline(true);

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
      // Don't refetch when network reconnects
      refetchOnReconnect: false,
      // Don't refetch when component remounts if data exists
      refetchOnMount: true,
      // CRITICAL: networkMode 'always' ensures queries run even if browser
      // reports being offline (which can happen when switching tabs/apps)
      networkMode: "always",
      // Retry once on network failures
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
      // Same for mutations - always run regardless of network status
      networkMode: "always",
    },
  },
});
