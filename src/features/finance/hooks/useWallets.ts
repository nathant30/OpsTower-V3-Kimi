import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { Wallet } from '@/types/domain.types';

export interface WalletFilters {
  userId?: string;
  userType?: 'Driver' | 'Customer';
  pageNumber?: number;
  pageSize?: number;
}

export interface WalletTransaction {
  transactionId: string;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
  balanceAfter: number;
  timestamp: string;
}

export interface WalletDetail extends Wallet {
  transactions: WalletTransaction[];
  stats: {
    totalCredited: number;
    totalDebited: number;
    transactionCount: number;
    lastActivity: string;
  };
}

/**
 * Hook to fetch wallet list
 */
export function useWallets(filters: WalletFilters = {}) {
  return useQuery({
    queryKey: ['wallets', filters],
    queryFn: () => apiClient.post<{ items: Wallet[]; total: number }>(ENDPOINTS.riders.wallet, {
      pageNumber: 1,
      pageSize: 50,
      ...filters,
    }),
  });
}

/**
 * Hook to fetch a specific wallet by user ID
 */
export function useWallet(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.riders.wallet(userId)],
    queryFn: () => apiClient.post<{ items: Wallet[] }>(ENDPOINTS.riders.wallet, {
      userId,
      pageNumber: 1,
      pageSize: 1,
    }),
    enabled: !!userId,
    select: (data) => data.items?.[0] || null,
  });
}

/**
 * Hook to fetch wallet transaction history
 */
export function useWalletTransactions(userId: string, filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['walletTransactions', userId, filters],
    queryFn: () => apiClient.post<{ items: WalletTransaction[]; total: number }>(ENDPOINTS.riders.wallet, {
      userId,
      includeTransactions: true,
      pageNumber: 1,
      pageSize: 50,
      ...filters,
    }),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch wallet summary stats
 */
export function useWalletStats() {
  return useQuery({
    queryKey: ['walletStats'],
    queryFn: () => apiClient.post<{
      totalWallets: number;
      totalAvailable: number;
      totalPending: number;
      totalHeld: number;
      activeToday: number;
    }>('AdminDeliveryOrder/GetWalletStats', {}),
  });
}

/**
 * Hook to adjust wallet balance (admin adjustment)
 */
export function useAdjustWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      userId: string;
      amount: number;
      reason: string;
      type: 'Credit' | 'Debit';
    }) => apiClient.post('AdminDeliveryOrder/AdjustWallet', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.riders.wallet(variables.userId)] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletStats'] });
    },
  });
}

/**
 * Hook to release held funds
 */
export function useReleaseHeldFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      userId: string;
      amount?: number; // if undefined, releases all held
      reason: string;
    }) => apiClient.post('AdminDeliveryOrder/ReleaseHeldFunds', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.riders.wallet(variables.userId)] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

/**
 * Hook to freeze/unfreeze wallet
 */
export function useToggleWalletFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      userId: string;
      frozen: boolean;
      reason: string;
    }) => apiClient.post('AdminDeliveryOrder/ToggleWalletFreeze', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.riders.wallet(variables.userId)] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
