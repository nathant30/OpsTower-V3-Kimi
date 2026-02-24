/**
 * Payment Types
 * Type definitions for Maya & GCash payment integration
 */

// Payment provider types
export type PaymentProvider = 'maya' | 'gcash';

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled' | 'expired';

// Transaction type for payments
export interface PaymentTransaction {
  id: string;
  transactionId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  metadata?: PaymentMetadata;
}

// Payment metadata
export interface PaymentMetadata {
  gateway?: string;
  gatewayReference?: string;
  webhookReceivedAt?: string;
  webhookData?: Record<string, unknown>;
  refundReason?: string;
  refundAmount?: number;
  refundedAt?: string;
  notes?: string;
}

// Payment method configuration
export interface PaymentMethodConfig {
  provider: PaymentProvider;
  name: string;
  enabled: boolean;
  sandboxMode: boolean;
  webhookUrl?: string;
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  icon?: string;
}

// Payment initiation request
export interface PaymentInitRequest {
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  description: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

// Payment initiation response
export interface PaymentInitResponse {
  success: boolean;
  transactionId: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  reference: string;
  status: PaymentStatus;
  message?: string;
}

// Refund request
export interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason: string;
}

// Refund response
export interface RefundResponse {
  success: boolean;
  refundId: string;
  status: PaymentStatus;
  amount: number;
  message?: string;
}

// Webhook payload
export interface PaymentWebhookPayload {
  event: string;
  data: {
    transactionId: string;
    reference: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    paidAt?: string;
    failureReason?: string;
    [key: string]: unknown;
  };
  timestamp: string;
  signature: string;
}

// Payment verification response
export interface PaymentVerifyResponse {
  success: boolean;
  transaction: PaymentTransaction;
  verified: boolean;
}

// Transaction filters
export interface TransactionFilters {
  provider?: PaymentProvider;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Transaction list response
export interface TransactionListResponse {
  items: PaymentTransaction[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Payment stats
export interface PaymentStats {
  totalProcessed: number;
  totalAmount: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
  byProvider: Record<PaymentProvider, {
    count: number;
    amount: number;
  }>;
}
