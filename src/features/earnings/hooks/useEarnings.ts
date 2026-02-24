/**
 * Earnings Hooks
 * React Query hooks for earnings data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EARNINGS_QUERY_KEYS,
  getEarningsKPIs,
  getDailyEarnings,
  getEarningsByTripType,
  getDriverLeaderboard,
  getPayoutHistory,
  getDeductionsSummary,
  exportEarningsReport,
  processPayout,
  retryFailedPayout,
  type EarningsFilters,
  type PayoutFilters,
  type ExportEarningsRequest,
  type ProcessPayoutRequest,
  type EarningsKPIs,
  type DailyEarnings,
  type EarningsByTripType,
  type DriverEarningsEntry,
  type PayoutEntry,
  type DeductionsSummary,
} from '@/services/earnings/earnings.service';

// ==================== QUERIES ====================

/**
 * Hook to fetch earnings KPIs
 */
export function useEarningsKPIs(filters?: EarningsFilters) {
  return useQuery<EarningsKPIs>({
    queryKey: [EARNINGS_QUERY_KEYS.kpis, filters],
    queryFn: () => getEarningsKPIs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch daily earnings data
 */
export function useDailyEarnings(filters?: EarningsFilters) {
  return useQuery<DailyEarnings[]>({
    queryKey: [EARNINGS_QUERY_KEYS.breakdown, 'daily', filters],
    queryFn: () => getDailyEarnings(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch earnings by trip type
 */
export function useEarningsByTripType(filters?: EarningsFilters) {
  return useQuery<EarningsByTripType[]>({
    queryKey: [EARNINGS_QUERY_KEYS.breakdown, 'tripType', filters],
    queryFn: () => getEarningsByTripType(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch driver earnings leaderboard
 */
export function useDriverLeaderboard(filters?: EarningsFilters) {
  return useQuery<{ items: DriverEarningsEntry[]; total: number }>({
    queryKey: [EARNINGS_QUERY_KEYS.leaderboard, filters],
    queryFn: () => getDriverLeaderboard(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch payout history
 */
export function usePayoutHistory(filters?: PayoutFilters) {
  return useQuery<{ items: PayoutEntry[]; total: number }>({
    queryKey: [EARNINGS_QUERY_KEYS.payouts, filters],
    queryFn: () => getPayoutHistory(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch deductions summary
 */
export function useDeductionsSummary(filters?: EarningsFilters) {
  return useQuery<DeductionsSummary>({
    queryKey: [EARNINGS_QUERY_KEYS.deductions, filters],
    queryFn: () => getDeductionsSummary(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook to export earnings report
 */
export function useExportEarningsReport() {
  return useMutation<Blob, Error, ExportEarningsRequest>({
    mutationFn: exportEarningsReport,
  });
}

/**
 * Hook to process driver payouts
 */
export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; processedCount: number },
    Error,
    ProcessPayoutRequest
  >({
    mutationFn: processPayout,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [EARNINGS_QUERY_KEYS.payouts] });
      queryClient.invalidateQueries({ queryKey: [EARNINGS_QUERY_KEYS.kpis] });
      queryClient.invalidateQueries({ queryKey: [EARNINGS_QUERY_KEYS.leaderboard] });
    },
  });
}

/**
 * Hook to retry a failed payout
 */
export function useRetryPayout() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: retryFailedPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EARNINGS_QUERY_KEYS.payouts] });
    },
  });
}

// ==================== UTILITIES ====================

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-PH').format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get trend color based on value
 */
export function getTrendColor(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Get trend icon indicator
 */
export function getTrendIndicator(value: number): string {
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
}

/**
 * Get payout status color
 */
export function getPayoutStatusColor(status: PayoutEntry['status']): string {
  switch (status) {
    case 'Completed':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'Pending':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'Processing':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'Failed':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

/**
 * Get payout method display name
 */
export function getPayoutMethodLabel(method: PayoutEntry['method']): string {
  switch (method) {
    case 'BankTransfer':
      return 'Bank Transfer';
    case 'GCash':
      return 'GCash';
    case 'Maya':
      return 'Maya';
    case 'Cash':
      return 'Cash';
    default:
      return method;
  }
}

/**
 * Get deduction type display name
 */
export function getDeductionTypeLabel(type: string): string {
  switch (type) {
    case 'PlatformFee':
      return 'Platform Fee';
    case 'Tax':
      return 'Tax';
    case 'Penalty':
      return 'Penalty';
    case 'Adjustment':
      return 'Adjustment';
    case 'Insurance':
      return 'Insurance';
    case 'Bond':
      return 'Bond';
    default:
      return type;
  }
}

// Re-export types
export type {
  EarningsFilters,
  PayoutFilters,
  ExportEarningsRequest,
  ProcessPayoutRequest,
  EarningsKPIs,
  DailyEarnings,
  EarningsByTripType,
  DriverEarningsEntry,
  PayoutEntry,
  DeductionsSummary,
};
