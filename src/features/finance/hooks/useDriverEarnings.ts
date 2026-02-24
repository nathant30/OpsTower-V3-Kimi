import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/config/api.config';

export interface DriverEarning {
  driverId: string;
  driverName: string;
  phone: string;
  avatar?: string;
  earnings: {
    totalEarnings: number;
    tripEarnings: number;
    bonuses: number;
    adjustments: number;
    fees: number;
  };
  trips: {
    total: number;
    completed: number;
    cancelled: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface GuaranteedPayItem {
  driverId: string;
  driverName: string;
  date: string;
  guaranteedAmount: number;
  actualEarnings: number;
  topUpAmount: number;
  status: 'Pending' | 'Paid' | 'Skipped';
}

export interface GuaranteedPayResponse {
  items: GuaranteedPayItem[];
  total: number;
  summary: {
    totalGuaranteed: number;
    totalTopUps: number;
    pendingCount: number;
  };
}

export interface DriverEarningsFilters {
  driverId?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Hook to fetch driver earnings
 */
export function useDriverEarnings(filters: DriverEarningsFilters = {}) {
  return useQuery({
    queryKey: ['driverEarnings', filters],
    queryFn: () => apiClient.post<{ items: DriverEarning[]; total: number }>(ENDPOINTS.finance.guaranteedPay, {
      pageNumber: 1,
      pageSize: 50,
      ...filters,
    }),
  });
}

/**
 * Hook to fetch guaranteed pay/top-ups for drivers
 */
export function useGuaranteedPay(driverId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['guaranteedPay', driverId, startDate, endDate],
    queryFn: () => apiClient.post<GuaranteedPayResponse>(ENDPOINTS.finance.guaranteedPay, {
      pageNumber: 1,
      pageSize: 50,
      driverId,
      startDate,
      endDate,
    }),
    enabled: !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch single driver earning details
 */
export function useDriverEarningDetail(driverId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['driverEarning', driverId, startDate, endDate],
    queryFn: () => apiClient.post<{ items: DriverEarning[] }>(ENDPOINTS.finance.guaranteedPay, {
      pageNumber: 1,
      pageSize: 1,
      driverId,
      startDate,
      endDate,
    }),
    enabled: !!driverId,
    select: (data) => data.items?.[0] || null,
  });
}

/**
 * Hook to process driver payouts for payroll
 */
export function useProcessDriverPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      driverIds: string[];
      periodStart: string;
      periodEnd: string;
      payoutMethod: 'BankTransfer' | 'GCash' | 'Maya' | 'Cash';
    }) => apiClient.post('AdminPartnerFinance/ProcessDriverPayout', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverEarnings'] });
      queryClient.invalidateQueries({ queryKey: ['guaranteedPay'] });
    },
  });
}

/**
 * Hook to export driver earnings for payroll
 */
export function useExportDriverEarnings() {
  return useMutation({
    mutationFn: (data: { 
      format: 'Excel' | 'CSV';
      startDate: string;
      endDate: string;
      driverIds?: string[];
    }) => apiClient.post('AdminPartnerFinance/ExportDriverEarnings', data),
  });
}
