import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Transaction, TransactionType, TransactionStatus } from '@/types/domain.types';

export interface TransactionsFilters {
  type?: TransactionType[];
  status?: TransactionStatus[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface TransactionsResponse {
  items: Transaction[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Backend transaction response type
interface BackendTransaction {
  id?: string;
  transaction_id?: string;
  type?: string;
  amount?: number;
  currency?: string;
  status?: string;
  order?: {
    order_id: string;
    service_type: string;
  };
  parties?: {
    from: {
      id: string;
      type: string;
      name: string;
    };
    to: {
      id: string;
      type: string;
      name: string;
    };
  };
  breakdown?: {
    base_fare: number;
    distance_fare: number;
    time_fare: number;
    surge: number;
    discount: number;
    commission: number;
    driver_earnings: number;
    fees: number;
  };
  payment?: {
    method: string;
    gateway?: string;
    reference_number?: string;
  };
  metadata?: {
    source_system: string;
    audit_log: Array<{
      timestamp: string;
      user_id: string;
      action: string;
      details: string;
    }>;
    notes?: string;
  };
  timestamps?: {
    initiated_at: string;
    completed_at?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface BackendTransactionsResponse {
  items: BackendTransaction[];
  total: number;
  page: number;
  limit: number;
}

// Map backend transaction data to frontend Transaction type
function mapBackendTransaction(data: BackendTransaction): Transaction {
  return {
    transactionId: data.transaction_id || data.id || '',
    type: mapTransactionType(data.type),
    amount: data.amount || 0,
    currency: (data.currency?.toUpperCase() as 'PHP') || 'PHP',
    status: mapTransactionStatus(data.status),
    order: data.order ? {
      orderId: data.order.order_id,
      serviceType: data.order.service_type,
    } : undefined,
    parties: data.parties ? {
      from: {
        id: data.parties.from.id,
        type: mapPartyType(data.parties.from.type),
        name: data.parties.from.name,
      },
      to: {
        id: data.parties.to.id,
        type: mapPartyType(data.parties.to.type),
        name: data.parties.to.name,
      },
    } : { from: { id: '', type: 'Platform', name: '' }, to: { id: '', type: 'Platform', name: '' } },
    breakdown: data.breakdown ? {
      baseFare: data.breakdown.base_fare || 0,
      distanceFare: data.breakdown.distance_fare || 0,
      timeFare: data.breakdown.time_fare || 0,
      surge: data.breakdown.surge || 0,
      discount: data.breakdown.discount || 0,
      commission: data.breakdown.commission || 0,
      driverEarnings: data.breakdown.driver_earnings || 0,
      fees: data.breakdown.fees || 0,
    } : { baseFare: 0, distanceFare: 0, timeFare: 0, surge: 0, discount: 0, commission: 0, driverEarnings: 0, fees: 0 },
    payment: data.payment ? {
      method: mapPaymentMethod(data.payment.method),
      gateway: data.payment.gateway,
      referenceNumber: data.payment.reference_number,
    } : { method: 'Cash' },
    metadata: data.metadata ? {
      sourceSystem: data.metadata.source_system,
      auditLog: (data.metadata.audit_log || []).map(entry => ({
        timestamp: entry.timestamp,
        userId: entry.user_id,
        action: entry.action,
        details: entry.details,
      })),
      notes: data.metadata.notes,
    } : { sourceSystem: 'unknown', auditLog: [] },
    timestamps: data.timestamps ? {
      initiatedAt: data.timestamps.initiated_at,
      completedAt: data.timestamps.completed_at,
    } : { initiatedAt: data.created_at || new Date().toISOString() },
  };
}

function mapTransactionType(type: string | undefined): TransactionType {
  switch (type?.toUpperCase()) {
    case 'ORDER_PAYMENT':
      return 'OrderPayment';
    case 'DRIVER_EARNINGS':
      return 'DriverEarnings';
    case 'COMMISSION':
      return 'Commission';
    case 'PAYOUT':
      return 'Payout';
    case 'TOP_UP':
      return 'TopUp';
    case 'REFUND':
      return 'Refund';
    case 'ADJUSTMENT':
      return 'Adjustment';
    case 'FEE':
      return 'Fee';
    default:
      return 'Fee';
  }
}

function mapTransactionStatus(status: string | undefined): TransactionStatus {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Pending';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'REVERSED':
      return 'Reversed';
    default:
      return 'Pending';
  }
}

function mapPartyType(type: string | undefined): 'Customer' | 'Driver' | 'Platform' | 'Partner' {
  switch (type?.toUpperCase()) {
    case 'CUSTOMER':
      return 'Customer';
    case 'DRIVER':
      return 'Driver';
    case 'PLATFORM':
      return 'Platform';
    case 'PARTNER':
      return 'Partner';
    default:
      return 'Platform';
  }
}

function mapPaymentMethod(method: string | undefined): 'Cash' | 'Card' | 'Wallet' | 'GCash' | 'Maya' {
  switch (method?.toUpperCase()) {
    case 'CASH':
      return 'Cash';
    case 'CARD':
    case 'CREDIT_CARD':
    case 'DEBIT_CARD':
      return 'Card';
    case 'WALLET':
      return 'Wallet';
    case 'GCASH':
      return 'GCash';
    case 'MAYA':
      return 'Maya';
    default:
      return 'Cash';
  }
}

// REAL API HOOK - Fetches transactions from /api/finance/transactions
export function useTransactions(filters: TransactionsFilters = {}) {
  const { type, status, startDate, endDate, searchQuery, pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['transactions', 'list', filters],
    queryFn: async (): Promise<TransactionsResponse> => {
      const params = new URLSearchParams();
      params.append('page', pageNumber.toString());
      params.append('limit', pageSize.toString());
      if (type?.length) params.append('type', type.map(t => t.toUpperCase()).join(','));
      if (status?.length) params.append('status', status.map(s => s.toUpperCase()).join(','));
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiClient.get<BackendTransactionsResponse>(
        `api/finance/transactions?${params.toString()}`
      );

      // Map backend response to frontend format
      const items = (response.items || []).map(mapBackendTransaction);

      return {
        items,
        total: response.total || items.length,
        pageNumber,
        pageSize,
        totalPages: Math.ceil((response.total || items.length) / pageSize),
      };
    },
  });
}

// Get single transaction
export function useTransaction(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async (): Promise<Transaction | null> => {
      if (!transactionId) return null;
      const response = await apiClient.get<BackendTransaction>(`api/finance/transactions/${transactionId}`);
      return mapBackendTransaction(response);
    },
    enabled: !!transactionId,
  });
}

// Get transaction summary from backend
export function useTransactionSummary() {
  return useQuery({
    queryKey: ['transactions', 'summary'],
    queryFn: async () => {
      const response = await apiClient.get<{
        total_revenue: number;
        total_transactions: number;
        pending_withdrawals: number;
        average_order_value: number;
        total_commission: number;
        total_driver_earnings: number;
      }>('api/finance/summary');

      return {
        totalRevenue: response.total_revenue || 0,
        totalTransactions: response.total_transactions || 0,
        pendingWithdrawals: response.pending_withdrawals || 0,
        averageOrderValue: response.average_order_value || 0,
        totalCommission: response.total_commission || 0,
        totalDriverEarnings: response.total_driver_earnings || 0,
      };
    },
  });
}

// Create transaction (for manual adjustments)
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      const response = await apiClient.post('api/finance/transactions', {
        type: data.type?.toUpperCase(),
        amount: data.amount,
        currency: data.currency,
        parties: data.parties,
        breakdown: data.breakdown ? {
          base_fare: data.breakdown.baseFare,
          distance_fare: data.breakdown.distanceFare,
          time_fare: data.breakdown.timeFare,
          surge: data.breakdown.surge,
          discount: data.breakdown.discount,
          commission: data.breakdown.commission,
          driver_earnings: data.breakdown.driverEarnings,
          fees: data.breakdown.fees,
        } : undefined,
        payment: data.payment,
        metadata: data.metadata ? {
          notes: data.metadata.notes,
        } : undefined,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'summary'] });
    },
  });
}

// Process refund
export function useProcessRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { transactionId: string; reason: string; amount?: number }) => {
      const response = await apiClient.post(`api/finance/transactions/${data.transactionId}/refund`, {
        reason: data.reason,
        amount: data.amount,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'summary'] });
    },
  });
}

// Export transactions (CSV/Excel)
export function useExportTransactions() {
  return useMutation({
    mutationFn: async (filters: TransactionsFilters) => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.type?.length) params.append('type', filters.type.map(t => t.toUpperCase()).join(','));
      if (filters.status?.length) params.append('status', filters.status.map(s => s.toUpperCase()).join(','));

      const response = await apiClient.get<Blob>(
        `api/finance/transactions/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response;
    },
  });
}
