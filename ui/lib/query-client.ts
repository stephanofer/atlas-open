import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { debugQuery, queryTracker } from "@/ui/lib/debug";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes - garbage collect after this
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent refetch on every mount (uses cache)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        const err = error as { status?: number; message?: string };
        if (err.status && err.status >= 400 && err.status < 500) {
          debugQuery.warn(`Not retrying - client error (${err.status})`, err.message);
          return false;
        }
        // Retry up to 2 times for other errors
        const shouldRetry = failureCount < 2;
        if (shouldRetry) {
          debugQuery.log(`Retrying query (attempt ${failureCount + 1}/2)`);
        }
        return shouldRetry;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s
        const delay = Math.min(1000 * Math.pow(2, attemptIndex), 2000);
        debugQuery.log(`Retry delay: ${delay}ms`);
        return delay;
      },
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const err = error as { message?: string; code?: string };
      const queryKey = JSON.stringify(query.queryKey);
      debugQuery.error(`Query error [${queryKey}]`, {
        message: err.message,
        code: err.code,
      });
      queryTracker.end(queryKey, 'error', error);
    },
    onSuccess: (_, query) => {
      const queryKey = JSON.stringify(query.queryKey);
      queryTracker.end(queryKey, 'success');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, _context, mutation) => {
      const err = error as { message?: string; code?: string };
      const mutationKey = mutation.options.mutationKey 
        ? JSON.stringify(mutation.options.mutationKey) 
        : 'anonymous';
      debugQuery.error(`Mutation error [${mutationKey}]`, {
        message: err.message,
        code: err.code,
        variables,
      });
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      const mutationKey = mutation.options.mutationKey 
        ? JSON.stringify(mutation.options.mutationKey) 
        : 'anonymous';
      debugQuery.success(`Mutation success [${mutationKey}]`);
    },
  }),
});

// Log when queries start (for debugging)
const originalFetch = queryClient.fetchQuery.bind(queryClient);
queryClient.fetchQuery = function(...args) {
  const queryKey = JSON.stringify(args[0]?.queryKey || args[0]);
  queryTracker.start(queryKey);
  return originalFetch(...args);
};
