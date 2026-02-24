/**
 * useDashboardData Hook
 * React Query hooks for fetching real dashboard data from backend
 */

import { useQuery } from '@tanstack/react-query';
import {
  DASHBOARD_QUERY_KEYS,
  getDashboardStats,
  getDriverStats,
  getRecentIncidents,
  getIncidentCounts,
} from '@/services/dashboard.service';
import type { DashboardStats, DashboardDriverStats, DashboardIncident } from '@/services/dashboard.service';

// ==================== QUERIES ====================

/**
 * Hook to fetch complete dashboard stats
 * Includes drivers, incidents, and tier distribution
 */
export function useDashboardData() {
  return useQuery<DashboardStats>({
    queryKey: [DASHBOARD_QUERY_KEYS.stats],
    queryFn: getDashboardStats,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Auto-refresh every minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch driver stats only
 * Includes tier distribution and driver counts
 */
export function useDashboardDriverStats() {
  return useQuery<DashboardDriverStats>({
    queryKey: [DASHBOARD_QUERY_KEYS.driverStats],
    queryFn: getDriverStats,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Hook to fetch recent incidents
 * @param limit Number of incidents to fetch (default: 5)
 */
export function useDashboardRecentIncidents(limit: number = 5) {
  return useQuery<DashboardIncident[]>({
    queryKey: [DASHBOARD_QUERY_KEYS.recentIncidents, limit],
    queryFn: () => getRecentIncidents(limit),
    staleTime: 15000, // 15 seconds - incidents change frequently
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to fetch incident counts
 * Returns total, active, and critical counts
 */
export function useDashboardIncidentCounts() {
  return useQuery<{
    total: number;
    active: number;
    critical: number;
  }>({
    queryKey: [DASHBOARD_QUERY_KEYS.incidents],
    queryFn: getIncidentCounts,
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

// ==================== EXPORTS ====================

export {
  DASHBOARD_QUERY_KEYS,
  getDashboardStats,
  getDriverStats,
  getRecentIncidents,
  getIncidentCounts,
};

export type {
  DashboardStats,
  DashboardDriverStats,
  DashboardIncident,
};
