// useReports hook - For report generation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// Types
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

export interface GenerateReportInput {
  type: ReportType;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock report history
const mockReportHistory: Report[] = [
  {
    id: '1',
    type: 'Operations',
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    generatedAt: '2024-02-01T10:30:00Z',
    generatedBy: 'Admin User',
    status: 'completed',
    data: { summary: { totalTrips: 12547, revenue: 2847500, avgRating: 4.7 } },
  },
  {
    id: '2',
    type: 'Financial',
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    generatedAt: '2024-02-01T09:15:00Z',
    generatedBy: 'Finance Team',
    status: 'completed',
    data: { summary: { totalRevenue: 2847500, expenses: 1250000, profit: 1597500 } },
  },
  {
    id: '3',
    type: 'Fleet',
    dateRange: { start: '2024-01-15', end: '2024-01-31' },
    generatedAt: '2024-02-01T08:00:00Z',
    generatedBy: 'Fleet Manager',
    status: 'completed',
    data: { summary: { totalVehicles: 156, activeVehicles: 142, maintenance: 14 } },
  },
];

// Hook for fetching report history
export function useReportHistory(limit: number = 20) {
  return useQuery({
    queryKey: ['reports', 'history', limit],
    queryFn: async (): Promise<Report[]> => {
      try {
        const response = await apiClient.get<{ reports: Report[] }>(
          `api/reports/history?limit=${limit}`
        );
        return response.reports;
      } catch {
        return mockReportHistory;
      }
    },
  });
}

// Hook for generating a report
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateReportInput): Promise<Report> => {
      try {
        const response = await apiClient.post<Report>('api/reports/generate', input);
        return response;
      } catch {
        // Simulate report generation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
          id: Math.random().toString(36).substr(2, 9),
          type: input.type,
          dateRange: input.dateRange,
          generatedAt: new Date().toISOString(),
          generatedBy: 'Current User',
          status: 'completed',
          data: {
            summary: {
              totalRecords: Math.floor(Math.random() * 10000) + 1000,
              totalAmount: Math.floor(Math.random() * 1000000) + 500000,
              avgValue: (Math.random() * 100 + 50).toFixed(2),
            },
          },
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
  });
}

// Hook for downloading a report
export function useDownloadReport() {
  return useMutation({
    mutationFn: async (params: {
      reportId: string;
      format: ExportFormat;
    }): Promise<string> => {
      const response = await apiClient.post<{ downloadUrl: string }>(
        `api/reports/${params.reportId}/download`,
        { format: params.format }
      );
      return response.downloadUrl;
    },
  });
}

// Hook for exporting a report
export function useExportReport() {
  return useMutation({
    mutationFn: async (params: {
      reportId: string;
      format: ExportFormat;
    }): Promise<void> => {
      const downloadUrl = await apiClient.post<string>(
        `api/reports/${params.reportId}/export`,
        { format: params.format }
      );
      
      // Trigger download
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `report-${params.reportId}.${params.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
}

// Hook for scheduling a report
export function useScheduleReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      type: ReportType;
      frequency: 'daily' | 'weekly' | 'monthly';
      email: string;
    }) => {
      const response = await apiClient.post<{ scheduledReportId: string }>(
        'api/reports/schedule',
        params
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
}

// Hook for fetching scheduled reports
export function useScheduledReports() {
  return useQuery({
    queryKey: ['reports', 'scheduled'],
    queryFn: async () => {
      const response = await apiClient.get('api/reports/scheduled');
      return response;
    },
  });
}

// Helper function to get date range
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  return { start, end };
}

export default useReportHistory;
