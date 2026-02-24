import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from './client';
import { DASHBOARD_QUERY_KEYS } from '@/services/dashboard.service';

/**
 * Global React Query client configuration
 * Optimized for real-time fleet management data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data freshness settings
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (formerly cacheTime)
      
      // Refetch behavior
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Retry logic
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Error handling
      throwOnError: false,
    },
    mutations: {
      retry: false,
      throwOnError: false,
    },
  },
  
  // Global cache handlers
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`[Query Error] ${query.queryKey}:`, error);
    },
  }),
  
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(`[Mutation Error] ${mutation.options.mutationKey}:`, error);
    },
  }),
});

/**
 * Query prefetching helper for common data
 */
export function prefetchDashboardData() {
  // Prefetch dashboard stats
  queryClient.prefetchQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.stats],
    staleTime: 30000,
  });
}

/**
 * Invalidate all dashboard-related queries
 */
export function invalidateDashboardQueries() {
  // Invalidate all dashboard query keys
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.stats],
  });
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.driverStats],
  });
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.incidents],
  });
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.recentIncidents],
  });
}

/**
 * Invalidate driver-related dashboard queries
 */
export function invalidateDriverStatsQueries() {
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.driverStats],
  });
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.tierDistribution],
  });
}

/**
 * Invalidate incident-related dashboard queries
 */
export function invalidateIncidentQueries() {
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.incidents],
  });
  queryClient.invalidateQueries({
    queryKey: [DASHBOARD_QUERY_KEYS.recentIncidents],
  });
}

/**
 * Invalidate all order-related queries
 */
export function invalidateOrderQueries() {
  queryClient.invalidateQueries({
    queryKey: ['orders'],
  });
}

/**
 * Set query data optimistically
 */
export function optimisticUpdate<T>(queryKey: string[], updater: (old: T | undefined) => T) {
  queryClient.setQueryData(queryKey, updater);
}
