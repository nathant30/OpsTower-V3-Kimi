/**
 * Payments Service
 * Handles Maya & GCash payment operations
 */

import { backendApi } from '../backend.api';
import {
  BACKEND_ENDPOINTS,
  BACKEND_QUERY_KEYS,
} from '@/config/backend.config';
import type {
  PaymentProvider,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentTransaction,
  PaymentVerifyResponse,
  RefundRequest,
  RefundResponse,
  TransactionFilters,
  TransactionListResponse,
  PaymentStats,
  PaymentMethodConfig,
  PaymentWebhookPayload,
} from '@/features/payments/types';

// Payment endpoints
const PAYMENT_ENDPOINTS = {
  // Maya payments
  initMaya: '/api/payments/maya/initiate',
  verifyMaya: (id: string) => `/api/payments/maya/verify/${id}`,
  
  // GCash payments
  initGCash: '/api/payments/gcash/initiate',
  verifyGCash: (id: string) => `/api/payments/gcash/verify/${id}`,
  
  // Common endpoints
  transactions: '/api/payments/transactions',
  transaction: (id: string) => `/api/payments/transactions/${id}`,
  refund: (id: string) => `/api/payments/transactions/${id}/refund`,
  webhook: '/api/payments/webhook',
  stats: '/api/payments/stats',
  methods: '/api/payments/methods',
};

// Query keys for payments
export const PAYMENT_QUERY_KEYS = {
  transactions: 'paymentTransactions',
  transaction: (id: string) => ['paymentTransaction', id],
  stats: 'paymentStats',
  methods: 'paymentMethods',
};

/**
 * Initialize Maya payment
 */
export async function initMayaPayment(
  amount: number,
  description: string,
  metadata?: Record<string, unknown>
): Promise<PaymentInitResponse> {
  const request: PaymentInitRequest = {
    provider: 'maya',
    amount,
    currency: 'PHP',
    description,
    metadata,
  };

  const response = await backendApi.post<PaymentInitResponse>(
    PAYMENT_ENDPOINTS.initMaya,
    request
  );

  return response;
}

/**
 * Initialize GCash payment
 */
export async function initGCashPayment(
  amount: number,
  description: string,
  metadata?: Record<string, unknown>
): Promise<PaymentInitResponse> {
  const request: PaymentInitRequest = {
    provider: 'gcash',
    amount,
    currency: 'PHP',
    description,
    metadata,
  };

  const response = await backendApi.post<PaymentInitResponse>(
    PAYMENT_ENDPOINTS.initGCash,
    request
  );

  return response;
}

/**
 * Get transaction list with filters
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionListResponse> {
  const {
    provider,
    status,
    startDate,
    endDate,
    searchQuery,
    pageNumber = 1,
    pageSize = 20,
  } = filters;

  const params = new URLSearchParams();
  params.append('page', pageNumber.toString());
  params.append('limit', pageSize.toString());
  
  if (provider) params.append('provider', provider);
  if (status) params.append('status', status);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (searchQuery) params.append('search', searchQuery);

  const response = await backendApi.get<{
    items: PaymentTransaction[];
    total: number;
    page: number;
    limit: number;
  }>(`${PAYMENT_ENDPOINTS.transactions}?${params.toString()}`);

  return {
    items: response.items || [],
    total: response.total || 0,
    pageNumber,
    pageSize,
    totalPages: Math.ceil((response.total || 0) / pageSize),
  };
}

/**
 * Get single transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<PaymentTransaction | null> {
  try {
    const response = await backendApi.get<PaymentTransaction>(
      PAYMENT_ENDPOINTS.transaction(transactionId)
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return null;
  }
}

/**
 * Process refund
 */
export async function processRefund(
  request: RefundRequest
): Promise<RefundResponse> {
  const response = await backendApi.post<RefundResponse>(
    PAYMENT_ENDPOINTS.refund(request.transactionId),
    {
      amount: request.amount,
      reason: request.reason,
    }
  );

  return response;
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  transactionId: string
): Promise<PaymentVerifyResponse> {
  const response = await backendApi.get<PaymentVerifyResponse>(
    PAYMENT_ENDPOINTS.transaction(transactionId)
  );

  return response;
}

/**
 * Verify Maya payment specifically
 */
export async function verifyMayaPayment(
  transactionId: string
): Promise<PaymentVerifyResponse> {
  const response = await backendApi.get<PaymentVerifyResponse>(
    PAYMENT_ENDPOINTS.verifyMaya(transactionId)
  );

  return response;
}

/**
 * Verify GCash payment specifically
 */
export async function verifyGCashPayment(
  transactionId: string
): Promise<PaymentVerifyResponse> {
  const response = await backendApi.get<PaymentVerifyResponse>(
    PAYMENT_ENDPOINTS.verifyGCash(transactionId)
  );

  return response;
}

/**
 * Handle webhook payload
 */
export async function handleWebhook(
  payload: PaymentWebhookPayload
): Promise<{ success: boolean }> {
  const response = await backendApi.post<{ success: boolean }>(
    PAYMENT_ENDPOINTS.webhook,
    payload
  );

  return response;
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  const response = await backendApi.get<PaymentStats>(
    PAYMENT_ENDPOINTS.stats
  );

  return response;
}

/**
 * Get payment method configurations
 */
export async function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  const response = await backendApi.get<PaymentMethodConfig[]>(
    PAYMENT_ENDPOINTS.methods
  );

  return response || [];
}

/**
 * Update payment method configuration
 */
export async function updatePaymentMethod(
  provider: PaymentProvider,
  config: Partial<PaymentMethodConfig>
): Promise<PaymentMethodConfig> {
  const response = await backendApi.patch<PaymentMethodConfig>(
    `${PAYMENT_ENDPOINTS.methods}/${provider}`,
    config
  );

  return response;
}

/**
 * Retry failed payment
 */
export async function retryPayment(
  transactionId: string
): Promise<PaymentInitResponse> {
  const response = await backendApi.post<PaymentInitResponse>(
    `${PAYMENT_ENDPOINTS.transaction(transactionId)}/retry`,
    {}
  );

  return response;
}

/**
 * Cancel pending payment
 */
export async function cancelPayment(
  transactionId: string,
  reason?: string
): Promise<{ success: boolean }> {
  const response = await backendApi.post<{ success: boolean }>(
    `${PAYMENT_ENDPOINTS.transaction(transactionId)}/cancel`,
    { reason }
  );

  return response;
}
