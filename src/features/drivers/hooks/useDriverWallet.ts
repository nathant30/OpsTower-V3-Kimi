import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';

// ==================== TYPES ====================

export interface DriverWalletInfo {
  walletId: string;
  driverId: string;
  balance: {
    available: number;
    pending: number;
    held: number;
    total: number;
  };
  limits: {
    maxBalance: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyWithdrawal: number;
    remainingDaily: number;
  };
  lastTransaction?: {
    transactionId: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    timestamp: string;
  };
  stats: {
    totalEarned: number;
    totalWithdrawn: number;
    thisWeekEarnings: number;
    thisMonthEarnings: number;
  };
}

export interface WalletTransaction {
  transactionId: string;
  type: 'TripEarnings' | 'Bonus' | 'Adjustment' | 'Withdrawal' | 'Fee' | 'Refund';
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed' | 'Reversed';
  description: string;
  orderId?: string;
  timestamp: string;
  balanceAfter: number;
}

export interface EarningsBreakdown {
  driverId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTrips: number;
    totalEarnings: number;
    averagePerTrip: number;
    averagePerHour: number;
    onlineHours: number;
  };
  breakdown: {
    tripEarnings: number;
    surgeEarnings: number;
    incentives: number;
    adjustments: number;
    deductions: number;
    netEarnings: number;
  };
  byServiceType: {
    serviceType: string;
    trips: number;
    earnings: number;
  }[];
  byDay: {
    date: string;
    trips: number;
    earnings: number;
    onlineHours: number;
  }[];
}

export interface WithdrawalRequest {
  driverId: string;
  amount: number;
  method: 'BankTransfer' | 'GCash' | 'Maya' | 'Cash';
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
  };
}

// ==================== HOOKS ====================

/**
 * Hook to fetch driver wallet information
 */
export function useDriverWallet(driverId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.riders.wallet(driverId || ''),
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<DriverWalletInfo>(
        ENDPOINTS.riders.wallet,
        { xpressRiderId: driverId }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch wallet transactions
 */
export function useWalletTransactions(
  driverId: string | undefined,
  options: { page?: number; limit?: number; type?: string } = {}
) {
  const { page = 1, limit = 20, type } = options;
  
  return useQuery({
    queryKey: ['walletTransactions', driverId, page, limit, type],
    queryFn: async () => {
      if (!driverId) return { items: [], total: 0 };
      const response = await apiClient.post<{ items: WalletTransaction[]; total: number }>(
        'AdminDeliveryOrder/GetRiderWalletTransactions',
        {
          xpressRiderId: driverId,
          page,
          limit,
          type,
        }
      );
      return response || { items: [], total: 0 };
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch earnings breakdown
 */
export function useEarningsBreakdown(
  driverId: string | undefined,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['earningsBreakdown', driverId, startDate, endDate],
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<EarningsBreakdown>(
        'AdminXpressRider/GetRiderEarningsBreakdown',
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
 * Hook to fetch weekly earnings summary
 */
export function useWeeklyEarnings(driverId: string | undefined) {
  return useQuery({
    queryKey: ['weeklyEarnings', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      const now = new Date();
      const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      const startDate = weekStart.toISOString();
      const endDate = now.toISOString();
      
      const response = await apiClient.post<EarningsBreakdown>(
        'AdminXpressRider/GetRiderEarningsBreakdown',
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
 * Hook to process withdrawal (admin only)
 */
export function useProcessWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      driverId: string;
      amount: number;
      referenceNumber: string;
    }) => {
      const response = await apiClient.post(
        'AdminDeliveryOrder/ProcessWithdrawal',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.riders.wallet(variables.driverId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['walletTransactions', variables.driverId] 
      });
    },
  });
}

/**
 * Hook to adjust driver balance (admin only)
 */
export function useAdjustDriverBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      driverId: string;
      amount: number;
      type: 'credit' | 'debit';
      reason: string;
    }) => {
      const response = await apiClient.post(
        'AdminDeliveryOrder/AdjustDriverBalance',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.riders.wallet(variables.driverId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['walletTransactions', variables.driverId] 
      });
    },
  });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format wallet balance for display
 */
export function formatWalletBalance(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get transaction type color
 */
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'TripEarnings':
      return 'text-xpress-status-active';
    case 'Bonus':
    case 'Incentive':
      return 'text-xpress-accent-blue';
    case 'Withdrawal':
    case 'Fee':
    case 'Deduction':
      return 'text-xpress-status-alert';
    case 'Adjustment':
      return 'text-xpress-status-idle';
    case 'Refund':
      return 'text-xpress-accent-purple';
    default:
      return 'text-xpress-text-secondary';
  }
}

/**
 * Get transaction status badge variant
 */
export function getTransactionStatusVariant(status: string): 'active' | 'idle' | 'alert' | 'warning' | 'default' {
  switch (status) {
    case 'Completed':
      return 'active';
    case 'Pending':
      return 'idle';
    case 'Failed':
      return 'alert';
    case 'Reversed':
      return 'warning';
    default:
      return 'default';
  }
}
