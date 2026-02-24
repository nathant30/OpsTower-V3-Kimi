// useSystemHealth hook - For monitoring data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// Types
export type ServiceStatusType = 'healthy' | 'degraded' | 'down';
export type ErrorSeverity = 'error' | 'warning';

export interface ServiceStatus {
  name: string;
  status: ServiceStatusType;
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

export interface SystemError {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  stack: string;
  service?: string;
}

export interface SystemMetrics {
  activeConnections: number;
  requestsPerMin: number;
  errorRate: number;
  avgLatency: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface SystemHealth {
  metrics: SystemMetrics;
  services: ServiceStatus[];
  errors: SystemError[];
  lastUpdated: string;
}

// Mock system health data
const mockSystemHealth: SystemHealth = {
  metrics: {
    activeConnections: 2847,
    requestsPerMin: 12543,
    errorRate: 0.42,
    avgLatency: 156,
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    diskUsage: 38.5,
  },
  services: [
    { name: 'REST API', status: 'healthy', uptime: 99.98, responseTime: 145, lastChecked: new Date().toISOString() },
    { name: 'Database', status: 'healthy', uptime: 99.95, responseTime: 23, lastChecked: new Date().toISOString() },
    { name: 'SignalR Hub', status: 'healthy', uptime: 99.92, responseTime: 89, lastChecked: new Date().toISOString() },
    { name: 'Payment Gateway', status: 'healthy', uptime: 99.99, responseTime: 234, lastChecked: new Date().toISOString() },
    { name: 'Auth Service', status: 'healthy', uptime: 99.97, responseTime: 67, lastChecked: new Date().toISOString() },
    { name: 'Notification Service', status: 'degraded', uptime: 98.45, responseTime: 456, lastChecked: new Date().toISOString() },
  ],
  errors: [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      severity: 'error',
      message: 'Database connection timeout',
      stack: 'at Database.connect (/src/db/connection.ts:45)',
      service: 'Database',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      severity: 'warning',
      message: 'High memory usage detected',
      stack: 'at Monitor.checkMemory (/src/monitor.ts:23)',
      service: 'System',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      severity: 'warning',
      message: 'API rate limit approaching',
      stack: 'at RateLimiter.check (/src/rate-limiter.ts:78)',
      service: 'REST API',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 58 * 60000).toISOString(),
      severity: 'error',
      message: 'Failed to send push notification',
      stack: 'at NotificationService.send (/src/notifications.ts:112)',
      service: 'Notification Service',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// Hook for fetching system health
export function useSystemHealth(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      try {
        const response = await apiClient.get<SystemHealth>('api/monitoring/health');
        return response;
      } catch {
        return mockSystemHealth;
      }
    },
    refetchInterval: options?.refetchInterval ?? 30000, // Default 30 seconds
  });
}

// Hook for fetching system metrics only
export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-health', 'metrics'],
    queryFn: async (): Promise<SystemMetrics> => {
      try {
        const response = await apiClient.get<{ metrics: SystemMetrics }>('api/monitoring/metrics');
        return response.metrics;
      } catch {
        return mockSystemHealth.metrics;
      }
    },
    refetchInterval: 30000,
  });
}

// Hook for fetching service status
export function useServiceStatus() {
  return useQuery({
    queryKey: ['system-health', 'services'],
    queryFn: async (): Promise<ServiceStatus[]> => {
      try {
        const response = await apiClient.get<{ services: ServiceStatus[] }>('api/monitoring/services');
        return response.services;
      } catch {
        return mockSystemHealth.services;
      }
    },
    refetchInterval: 30000,
  });
}

// Hook for fetching error logs
export function useErrorLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['system-health', 'errors', limit],
    queryFn: async (): Promise<SystemError[]> => {
      try {
        const response = await apiClient.get<{ errors: SystemError[] }>(
          `api/monitoring/errors?limit=${limit}`
        );
        return response.errors;
      } catch {
        return mockSystemHealth.errors;
      }
    },
  });
}

// Hook for refreshing system health
export function useRefreshSystemHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('api/monitoring/refresh', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
    },
  });
}

// Hook for acknowledging an error
export function useAcknowledgeError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (errorId: string) => {
      await apiClient.post(`api/monitoring/errors/${errorId}/acknowledge`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-health', 'errors'] });
    },
  });
}

// Hook for fetching response time history
export function useResponseTimeHistory(minutes: number = 60) {
  return useQuery({
    queryKey: ['system-health', 'response-times', minutes],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ data: Array<{ time: string; latency: number }> }>(
          `api/monitoring/response-times?minutes=${minutes}`
        );
        return response.data;
      } catch {
        // Generate mock data
        return Array.from({ length: minutes }, (_, i) => ({
          time: `${minutes - 1 - i}m`,
          latency: 150 + (i % 5) * 20 + (i % 3) * 10,
        })).reverse();
      }
    },
    refetchInterval: 30000,
  });
}

// Helper function to check if all services are healthy
export function isSystemHealthy(services: ServiceStatus[]): boolean {
  return services.every((s) => s.status === 'healthy');
}

// Helper function to get overall system status
export function getSystemStatus(services: ServiceStatus[]): ServiceStatusType {
  if (services.some((s) => s.status === 'down')) return 'down';
  if (services.some((s) => s.status === 'degraded')) return 'degraded';
  return 'healthy';
}

export default useSystemHealth;
