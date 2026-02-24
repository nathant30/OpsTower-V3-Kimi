/**
 * useTransactions Hook
 * Hook for fetching and managing payment transactions
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import {
  getTransactions,
  getTransaction,
  PAYMENT_QUERY_KEYS,
} from '@/services/payments/payments.service';
import type {
  PaymentTransaction,
  PaymentProvider,
  PaymentStatus,
  TransactionFilters,
} from '@/features/payments/types';

interface UseTransactionsOptions {
  initialFilters?: TransactionFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { initialFilters = {}, enabled = true, refetchInterval } = options;
  const queryClient = useQueryClient();

  // Local filter state
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [pageNumber, setPageNumber] = useState(initialFilters.pageNumber || 1);
  const [pageSize, setPageSize] = useState(initialFilters.pageSize || 20);

  // Build query key based on filters
  const queryKey = useMemo(
    () => [PAYMENT_QUERY_KEYS.transactions, { ...filters, pageNumber, pageSize }],
    [filters, pageNumber, pageSize]
  );

  // Fetch transactions query
  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getTransactions({
        ...filters,
        pageNumber,
        pageSize,
      }),
    enabled,
    refetchInterval: refetchInterval || false,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Derived data
  const transactions = useMemo(() => response?.items || [], [response]);
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  // Filter by provider
  const setProviderFilter = useCallback((provider: PaymentProvider | undefined) => {
    setFilters((prev) => ({
      ...prev,
      provider,
    }));
    setPageNumber(1);
  }, []);

  // Filter by status
  const setStatusFilter = useCallback((status: PaymentStatus | undefined) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
    setPageNumber(1);
  }, []);

  // Filter by date range
  const setDateRange = useCallback((startDate?: string, endDate?: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
    setPageNumber(1);
  }, []);

  // Search filter
  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: searchQuery || undefined,
    }));
    setPageNumber(1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setPageNumber(1);
  }, []);

  // Pagination
  const goToPage = useCallback((page: number) => {
    setPageNumber(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const setPageSizeValue = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1);
  }, []);

  // Prefetch transaction detail
  const prefetchTransaction = useCallback(
    (transactionId: string) => {
      queryClient.prefetchQuery({
        queryKey: PAYMENT_QUERY_KEYS.transaction(transactionId),
        queryFn: () => getTransaction(transactionId),
        staleTime: 60 * 1000,
      });
    },
    [queryClient]
  );

  // Refresh data
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Computed stats
  const stats = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'completed');
    const pending = transactions.filter((t) => t.status === 'pending' || t.status === 'processing');
    const failed = transactions.filter((t) => t.status === 'failed');
    const refunded = transactions.filter((t) => t.status === 'refunded');

    return {
      totalCount: transactions.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      refundedCount: refunded.length,
      completedAmount: completed.reduce((sum, t) => sum + t.amount, 0),
      pendingAmount: pending.reduce((sum, t) => sum + t.amount, 0),
      failedAmount: failed.reduce((sum, t) => sum + t.amount, 0),
      refundedAmount: refunded.reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions]);

  return {
    // Data
    transactions,
    total,
    pageNumber,
    pageSize,
    totalPages,
    stats,

    // Loading states
    isLoading,
    isFetching,
    error,

    // Filters
    filters,
    setProviderFilter,
    setStatusFilter,
    setDateRange,
    setSearchQuery,
    clearFilters,

    // Pagination
    goToPage,
    nextPage,
    prevPage,
    setPageSize: setPageSizeValue,

    // Actions
    refresh,
    prefetchTransaction,
  };
}

/**
 * Hook for single transaction detail
 */
export function useTransactionDetail(transactionId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: transaction, isLoading, error, refetch } = useQuery({
    queryKey: PAYMENT_QUERY_KEYS.transaction(transactionId || ''),
    queryFn: () => getTransaction(transactionId!),
    enabled: !!transactionId,
    staleTime: 30 * 1000,
  });

  const invalidate = useCallback(() => {
    if (transactionId) {
      queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEYS.transaction(transactionId),
      });
    }
  }, [queryClient, transactionId]);

  return {
    transaction,
    isLoading,
    error,
    refetch,
    invalidate,
  };
}
