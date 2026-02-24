import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { DriverPerformance } from '@/types/domain.types';

// ==================== TYPES ====================

export interface PerformanceTrend {
  date: string;
  completionRate: number;
  acceptanceRate: number;
  onTimePercentage: number;
  trips: number;
  rating: number;
}

export interface PerformanceComparison {
  driverId: string;
  period: 'week' | 'month' | 'quarter';
  current: DriverPerformance & { startDate: string; endDate: string };
  previous: DriverPerformance & { startDate: string; endDate: string };
  change: {
    completionRate: number;
    acceptanceRate: number;
    cancellationRate: number;
    averageRating: number;
    onTimePercentage: number;
    totalTrips: number;
  };
}

export interface PerformanceRanking {
  driverId: string;
  rank: number;
  totalDrivers: number;
  percentile: number;
  category: 'top' | 'good' | 'average' | 'below_average' | 'needs_improvement';
}

export interface DetailedPerformanceMetrics {
  driverId: string;
  summary: DriverPerformance;
  trends: PerformanceTrend[];
  hourlyActivity: {
    hour: number;
    trips: number;
    earnings: number;
  }[];
  dailyActivity: {
    day: string;
    trips: number;
    earnings: number;
    onlineHours: number;
  }[];
  serviceTypeBreakdown: {
    serviceType: string;
    trips: number;
    earnings: number;
    averageRating: number;
  }[];
}

// ==================== HOOKS ====================

/**
 * Hook to fetch comprehensive performance data for a driver
 */
export function useDriverPerformance(
  driverId: string | undefined,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: QUERY_KEYS.riders.performance(driverId || ''),
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<DriverPerformance>(
        ENDPOINTS.riders.performance,
        {
          driverId,
          startDate,
          endDate,
        }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch performance trends over time
 */
export function useDriverPerformanceTrends(
  driverId: string | undefined,
  days: number = 30
) {
  return useQuery({
    queryKey: ['driverPerformanceTrends', driverId, days],
    queryFn: async () => {
      if (!driverId) return [];
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await apiClient.post<{ trends: PerformanceTrend[] }>(
        'AdminXpressRider/GetRiderPerformanceTrends',
        {
          driverId,
          startDate,
          endDate,
        }
      );
      return response?.trends || [];
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch performance comparison (current vs previous period)
 */
export function useDriverPerformanceComparison(
  driverId: string | undefined,
  period: 'week' | 'month' | 'quarter' = 'month'
) {
  return useQuery({
    queryKey: ['driverPerformanceComparison', driverId, period],
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<PerformanceComparison>(
        'AdminXpressRider/GetRiderPerformanceComparison',
        {
          driverId,
          period,
        }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch driver's performance ranking
 */
export function useDriverPerformanceRanking(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driverPerformanceRanking', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<PerformanceRanking>(
        'AdminXpressRider/GetRiderPerformanceRanking',
        { driverId }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch detailed performance metrics with breakdowns
 */
export function useDetailedPerformanceMetrics(
  driverId: string | undefined,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['detailedPerformanceMetrics', driverId, startDate, endDate],
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<DetailedPerformanceMetrics>(
        'AdminXpressRider/GetDetailedPerformanceMetrics',
        {
          driverId,
          startDate,
          endDate,
        }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch hourly activity patterns
 */
export function useDriverHourlyActivity(
  driverId: string | undefined,
  days: number = 7
) {
  return useQuery({
    queryKey: ['driverHourlyActivity', driverId, days],
    queryFn: async () => {
      if (!driverId) return [];
      const response = await apiClient.post<{ hourly: { hour: number; trips: number; earnings: number }[] }>(
        'AdminXpressRider/GetRiderHourlyActivity',
        { driverId, days }
      );
      return response?.hourly || [];
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Helper function to get performance rating color
 */
export function getPerformanceColor(value: number, type: 'rate' | 'rating' = 'rate'): string {
  if (type === 'rating') {
    // For ratings (0-5 scale)
    if (value >= 4.5) return 'text-xpress-status-active';
    if (value >= 4.0) return 'text-xpress-accent-blue';
    if (value >= 3.5) return 'text-xpress-status-idle';
    if (value >= 3.0) return 'text-xpress-status-warning';
    return 'text-xpress-status-alert';
  }
  
  // For rates (0-100 scale)
  if (value >= 90) return 'text-xpress-status-active';
  if (value >= 75) return 'text-xpress-accent-blue';
  if (value >= 60) return 'text-xpress-status-idle';
  if (value >= 40) return 'text-xpress-status-warning';
  return 'text-xpress-status-alert';
}

/**
 * Helper function to get performance rating label
 */
export function getPerformanceLabel(value: number, type: 'rate' | 'rating' = 'rate'): string {
  if (type === 'rating') {
    if (value >= 4.5) return 'Excellent';
    if (value >= 4.0) return 'Very Good';
    if (value >= 3.5) return 'Good';
    if (value >= 3.0) return 'Fair';
    return 'Needs Improvement';
  }
  
  if (value >= 90) return 'Excellent';
  if (value >= 75) return 'Very Good';
  if (value >= 60) return 'Good';
  if (value >= 40) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Helper function to format percentage change
 */
export function formatChange(value: number): { text: string; positive: boolean; color: string } {
  const positive = value >= 0;
  return {
    text: `${positive ? '+' : ''}${value.toFixed(1)}%`,
    positive,
    color: positive ? 'text-xpress-status-active' : 'text-xpress-status-alert',
  };
}
