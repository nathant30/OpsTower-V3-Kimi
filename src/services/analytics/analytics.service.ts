/**
 * Analytics Service
 * Manages analytics data, reports, and system monitoring through custom backend
 */

import { apiClient } from '@/lib/api/client';

// ============ Types ============

export interface AnalyticsOverview {
  kpis: {
    totalRevenue: number;
    revenueChange: number;
    activeUsers: number;
    usersChange: number;
    ordersToday: number;
    ordersChange: number;
    completionRate: number;
    completionChange: number;
  };
  revenueChart: Array<{ date: string; revenue: number }>;
  userActivity: Array<{ day: string; active: number; new: number }>;
  orderDistribution: Array<{ status: string; count: number; color: string }>;
  topRoutes: Array<{
    id: string;
    origin: string;
    destination: string;
    rides: number;
    revenue: number;
  }>;
}

export type ReportType = 'Operations' | 'Financial' | 'Fleet' | 'Drivers' | 'Incidents';
export type ReportStatus = 'completed' | 'pending' | 'failed';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface Report {
  id: string;
  type: ReportType;
  dateRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
  generatedBy?: string;
  status: ReportStatus;
  downloadUrl?: string;
  data?: {
    summary: Record<string, number | string>;
  };
}

export type ServiceStatusType = 'healthy' | 'degraded' | 'down';

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
  severity: 'error' | 'warning';
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

// ============ Analytics Service ============

export const analyticsService = {
  // ============ Analytics Overview ============

  /**
   * Get analytics overview with KPIs and charts
   */
  async getAnalyticsOverview(dateRange: string = '30'): Promise<AnalyticsOverview> {
    return apiClient.get(`api/analytics/overview?range=${dateRange}`);
  },

  /**
   * Get revenue data for charting
   */
  async getRevenueData(days: number = 30): Promise<Array<{ date: string; revenue: number }>> {
    const response = await apiClient.get<{ data: Array<{ date: string; revenue: number }> }>(
      `api/analytics/revenue?days=${days}`
    );
    return response.data;
  },

  /**
   * Get user activity data
   */
  async getUserActivity(days: number = 7): Promise<Array<{ day: string; active: number; new: number }>> {
    const response = await apiClient.get<{ data: Array<{ day: string; active: number; new: number }> }>(
      `api/analytics/user-activity?days=${days}`
    );
    return response.data;
  },

  /**
   * Get order distribution by status
   */
  async getOrderDistribution(): Promise<Array<{ status: string; count: number; color: string }>> {
    const response = await apiClient.get<{ data: Array<{ status: string; count: number; color: string }> }>(
      'api/analytics/order-distribution'
    );
    return response.data;
  },

  /**
   * Get top routes
   */
  async getTopRoutes(limit: number = 5): Promise<
    Array<{ id: string; origin: string; destination: string; rides: number; revenue: number }>
  > {
    const response = await apiClient.get<{
      data: Array<{ id: string; origin: string; destination: string; rides: number; revenue: number }>;
    }>(`api/analytics/top-routes?limit=${limit}`);
    return response.data;
  },

  // ============ Reports ============

  /**
   * Generate a new report
   */
  async generateReport(type: ReportType, dateRange: { start: string; end: string }): Promise<Report> {
    return apiClient.post('api/reports/generate', { type, dateRange });
  },

  /**
   * Get report history
   */
  async getReportHistory(limit: number = 20): Promise<Report[]> {
    const response = await apiClient.get<{ reports: Report[] }>(`api/reports/history?limit=${limit}`);
    return response.reports;
  },

  /**
   * Download a report
   */
  async downloadReport(reportId: string, format: ExportFormat): Promise<string> {
    const response = await apiClient.post<{ downloadUrl: string }>(
      `api/reports/${reportId}/download`,
      { format }
    );
    return response.downloadUrl;
  },

  /**
   * Export analytics data
   */
  async exportAnalytics(params: {
    format: ExportFormat;
    dateRange: { start: string; end: string };
    sections: string[];
  }): Promise<string> {
    const response = await apiClient.post<{ downloadUrl: string }>('api/analytics/export', params);
    return response.downloadUrl;
  },

  /**
   * Schedule a recurring report
   */
  async scheduleReport(params: {
    type: ReportType;
    frequency: 'daily' | 'weekly' | 'monthly';
    email: string;
  }): Promise<{ scheduledReportId: string }> {
    return apiClient.post('api/reports/schedule', params);
  },

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<unknown[]> {
    const response = await apiClient.get<{ scheduled: unknown[] }>('api/reports/scheduled');
    return response.scheduled;
  },

  // ============ System Health ============

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get('api/monitoring/health');
  },

  /**
   * Get system metrics only
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get<{ metrics: SystemMetrics }>('api/monitoring/metrics');
    return response.metrics;
  },

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<ServiceStatus[]> {
    const response = await apiClient.get<{ services: ServiceStatus[] }>('api/monitoring/services');
    return response.services;
  },

  /**
   * Get error logs
   */
  async getErrorLogs(limit: number = 50): Promise<SystemError[]> {
    const response = await apiClient.get<{ errors: SystemError[] }>(
      `api/monitoring/errors?limit=${limit}`
    );
    return response.errors;
  },

  /**
   * Refresh system health data
   */
  async refreshSystemHealth(): Promise<void> {
    await apiClient.post('api/monitoring/refresh', {});
  },

  /**
   * Acknowledge an error
   */
  async acknowledgeError(errorId: string): Promise<void> {
    await apiClient.post(`api/monitoring/errors/${errorId}/acknowledge`, {});
  },

  /**
   * Get response time history
   */
  async getResponseTimeHistory(minutes: number = 60): Promise<Array<{ time: string; latency: number }>> {
    const response = await apiClient.get<{ data: Array<{ time: string; latency: number }> }>(
      `api/monitoring/response-times?minutes=${minutes}`
    );
    return response.data;
  },
};

// ============ Helper Functions ============

/**
 * Get date range for report generation
 */
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  return { start, end };
}

/**
 * Check if all services are healthy
 */
export function isSystemHealthy(services: ServiceStatus[]): boolean {
  return services.every((s) => s.status === 'healthy');
}

/**
 * Get overall system status
 */
export function getSystemStatus(services: ServiceStatus[]): ServiceStatusType {
  if (services.some((s) => s.status === 'down')) return 'down';
  if (services.some((s) => s.status === 'degraded')) return 'degraded';
  return 'healthy';
}

/**
 * Format uptime percentage
 */
export function formatUptime(uptime: number): string {
  return `${uptime.toFixed(2)}%`;
}

/**
 * Format response time
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default analyticsService;
