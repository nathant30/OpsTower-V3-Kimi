// useAnalytics hook - For fetching analytics data
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// Types
export interface AnalyticsKPIs {
  totalRevenue: number;
  revenueChange: number;
  activeUsers: number;
  usersChange: number;
  ordersToday: number;
  ordersChange: number;
  completionRate: number;
  completionChange: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface UserActivityData {
  day: string;
  active: number;
  new: number;
}

export interface OrderDistributionData {
  status: string;
  count: number;
  color: string;
}

export interface TopRoute {
  id: string;
  origin: string;
  destination: string;
  rides: number;
  revenue: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  revenueChart: RevenueChartData[];
  userActivity: UserActivityData[];
  orderDistribution: OrderDistributionData[];
  topRoutes: TopRoute[];
}

// Mock data for development
const mockAnalyticsData: AnalyticsData = {
  kpis: {
    totalRevenue: 2847500,
    revenueChange: 12.5,
    activeUsers: 3247,
    usersChange: 8.3,
    ordersToday: 847,
    ordersChange: -2.1,
    completionRate: 94.5,
    completionChange: 3.2,
  },
  revenueChart: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    revenue: 80000 + Math.random() * 40000,
  })),
  userActivity: Array.from({ length: 7 }, (_, i) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      day: days[i],
      active: 1500 + Math.floor(Math.random() * 1000),
      new: 200 + Math.floor(Math.random() * 300),
    };
  }),
  orderDistribution: [
    { status: 'Completed', count: 650, color: '#22c55e' },
    { status: 'Pending', count: 125, color: '#f59e0b' },
    { status: 'Cancelled', count: 45, color: '#ef4444' },
    { status: 'Processing', count: 27, color: '#3b82f6' },
  ],
  topRoutes: [
    { id: '1', origin: 'Makati CBD', destination: 'BGC', rides: 1245, revenue: 45000 },
    { id: '2', origin: 'Quezon City', destination: 'Ortigas', rides: 982, revenue: 38000 },
    { id: '3', origin: 'Manila', destination: 'Makati CBD', rides: 876, revenue: 32000 },
    { id: '4', origin: 'BGC', destination: 'Airport', rides: 654, revenue: 52000 },
    { id: '5', origin: 'Pasig', destination: 'Mandaluyong', rides: 543, revenue: 21000 },
  ],
};

// Hook for fetching analytics overview
export function useAnalytics(dateRange: string = '30') {
  return useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        // Try to fetch from API
        const response = await apiClient.get<AnalyticsData>(
          `api/analytics/overview?range=${dateRange}`
        );
        return response;
      } catch {
        // Return mock data if API fails
        return mockAnalyticsData;
      }
    },
  });
}

// Hook for fetching revenue data
export function useRevenueData(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'revenue', days],
    queryFn: async (): Promise<RevenueChartData[]> => {
      try {
        const response = await apiClient.get<{ data: RevenueChartData[] }>(
          `api/analytics/revenue?days=${days}`
        );
        return response.data;
      } catch (error) {
        return mockAnalyticsData.revenueChart.slice(-days);
      }
    },
  });
}

// Hook for fetching user activity
export function useUserActivity(days: number = 7) {
  return useQuery({
    queryKey: ['analytics', 'user-activity', days],
    queryFn: async (): Promise<UserActivityData[]> => {
      try {
        const response = await apiClient.get<{ data: UserActivityData[] }>(
          `api/analytics/user-activity?days=${days}`
        );
        return response.data;
      } catch (error) {
        return mockAnalyticsData.userActivity;
      }
    },
  });
}

// Hook for fetching order distribution
export function useOrderDistribution() {
  return useQuery({
    queryKey: ['analytics', 'order-distribution'],
    queryFn: async (): Promise<OrderDistributionData[]> => {
      try {
        const response = await apiClient.get<{ data: OrderDistributionData[] }>(
          'api/analytics/order-distribution'
        );
        return response.data;
      } catch (error) {
        return mockAnalyticsData.orderDistribution;
      }
    },
  });
}

// Hook for fetching top routes
export function useTopRoutes(limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'top-routes', limit],
    queryFn: async (): Promise<TopRoute[]> => {
      try {
        const response = await apiClient.get<{ data: TopRoute[] }>(
          `api/analytics/top-routes?limit=${limit}`
        );
        return response.data;
      } catch (error) {
        return mockAnalyticsData.topRoutes.slice(0, limit);
      }
    },
  });
}

// Hook for exporting analytics data
export function useExportAnalytics() {
  return useMutation({
    mutationFn: async (params: {
      format: 'pdf' | 'excel' | 'csv';
      dateRange: { start: string; end: string };
      sections: string[];
    }) => {
      const response = await apiClient.post<{ downloadUrl: string }>(
        'api/analytics/export',
        params
      );
      return response;
    },
  });
}

export default useAnalytics;
