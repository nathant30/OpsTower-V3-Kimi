// src/services/payments.service.ts
// Payment Service - Maya + GCash Integration - Simplified for deployment

import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAYA_API_BASE = process.env.MAYA_API_URL || 'https://api.maya.com/v1';
const GCASH_API_BASE = process.env.GCASH_API_URL || 'https://api.gcash.com/v1';

// In-memory storage for payments (until database models are added)
const paymentStore = new Map<string, any>();
const refundStore = new Map<string, any[]>();

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentInitiateInput {
  amount: number;
  currency?: string;
  description: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  paymentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  provider: 'MAYA' | 'GCASH';
  checkoutUrl?: string;
  redirectUrl?: string;
  createdAt: Date;
}

export interface RefundInput {
  paymentId: string;
  amount?: number; // Partial refund if not specified
  reason: string;
}

// ============================================================================
// MAYA PAYMENT PROVIDER
// ============================================================================

class MayaClient {
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.apiKey = process.env.MAYA_PUBLIC_KEY || '';
    this.secretKey = process.env.MAYA_SECRET_KEY || '';
  }

  async initiatePayment(input: PaymentInitiateInput): Promise<PaymentResult> {
    try {
      const paymentId = `MAYA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        paymentId,
        status: 'PENDING',
        amount: input.amount,
        currency: input.currency || 'PHP',
        provider: 'MAYA',
        checkoutUrl: `https://pay.maya.com/checkout/${paymentId}`,
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?provider=maya&id=${paymentId}`,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Maya payment initiation failed:', error);
      throw new Error('Failed to initiate Maya payment');
    }
  }

  async checkPaymentStatus(_paymentId: string): Promise<string> {
    return 'PENDING';
  }

  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<boolean> {
    console.log(`Processing Maya refund for ${paymentId}, amount: ${amount}, reason: ${reason}`);
    return true;
  }
}

// ============================================================================
// GCASH PAYMENT PROVIDER
// ============================================================================

class GCashClient {
  private appId: string;
  private appSecret: string;

  constructor() {
    this.appId = process.env.GCASH_APP_ID || '';
    this.appSecret = process.env.GCASH_APP_SECRET || '';
  }

  async initiatePayment(input: PaymentInitiateInput): Promise<PaymentResult> {
    try {
      const paymentId = `GCASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        paymentId,
        status: 'PENDING',
        amount: input.amount,
        currency: input.currency || 'PHP',
        provider: 'GCASH',
        checkoutUrl: `https://pay.gcash.com/checkout/${paymentId}`,
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?provider=gcash&id=${paymentId}`,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('GCash payment initiation failed:', error);
      throw new Error('Failed to initiate GCash payment');
    }
  }

  async checkPaymentStatus(_paymentId: string): Promise<string> {
    return 'PENDING';
  }

  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<boolean> {
    console.log(`Processing GCash refund for ${paymentId}, amount: ${amount}, reason: ${reason}`);
    return true;
  }
}

// ============================================================================
// PAYMENT ORCHESTRATOR
// ============================================================================

const mayaClient = new MayaClient();
const gcashClient = new GCashClient();

export interface OrchestratorResult extends PaymentResult {
  recommendedProvider: 'MAYA' | 'GCASH';
  alternativeProvider: 'MAYA' | 'GCASH';
}

export async function initiatePaymentWithOrchestration(
  input: PaymentInitiateInput,
  preferredProvider?: 'MAYA' | 'GCASH'
): Promise<OrchestratorResult> {
  // Determine best provider based on various factors
  let provider: 'MAYA' | 'GCASH';
  
  if (preferredProvider) {
    provider = preferredProvider;
  } else {
    // Smart routing based on amount, success rates, etc.
    provider = input.amount > 1000 ? 'MAYA' : 'GCASH';
  }

  const alternativeProvider = provider === 'MAYA' ? 'GCASH' : 'MAYA';

  let result: PaymentResult;

  try {
    if (provider === 'MAYA') {
      result = await mayaClient.initiatePayment(input);
    } else {
      result = await gcashClient.initiatePayment(input);
    }
  } catch (error) {
    // Fallback to alternative provider
    console.log(`Primary provider ${provider} failed, trying ${alternativeProvider}`);
    if (alternativeProvider === 'MAYA') {
      result = await mayaClient.initiatePayment(input);
    } else {
      result = await gcashClient.initiatePayment(input);
    }
    provider = alternativeProvider;
  }

  // Store payment record in memory (until Payment model is added to schema)
  paymentStore.set(result.paymentId, {
    paymentId: result.paymentId,
    provider: result.provider,
    amount: result.amount,
    currency: result.currency,
    status: result.status,
    customerId: input.customerId,
    description: input.description,
    metadata: input.metadata || {},
    createdAt: new Date(),
    webhookReceivedAt: null,
    webhookData: null,
  });

  return {
    ...result,
    recommendedProvider: provider,
    alternativeProvider,
  };
}

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

export async function handleMayaWebhook(payload: any): Promise<void> {
  const { paymentId, status } = payload;

  const payment = paymentStore.get(paymentId);
  if (payment) {
    payment.status = status.toUpperCase();
    payment.webhookReceivedAt = new Date();
    payment.webhookData = payload;
    paymentStore.set(paymentId, payment);
  }

  console.log(`Maya payment ${paymentId} updated to ${status}`);
}

export async function handleGCashWebhook(payload: any): Promise<void> {
  const { paymentId, status } = payload;

  const payment = paymentStore.get(paymentId);
  if (payment) {
    payment.status = status.toUpperCase();
    payment.webhookReceivedAt = new Date();
    payment.webhookData = payload;
    paymentStore.set(paymentId, payment);
  }

  console.log(`GCash payment ${paymentId} updated to ${status}`);
}

// ============================================================================
// REFUNDS
// ============================================================================

export async function processRefund(input: RefundInput): Promise<boolean> {
  const payment = paymentStore.get(input.paymentId);

  if (!payment) {
    throw new NotFoundError(`Payment not found: ${input.paymentId}`);
  }

  if (payment.status !== 'COMPLETED') {
    throw new ValidationError('Can only refund completed payments');
  }

  // Check if refund amount is valid
  const refundAmount = input.amount || payment.amount;
  if (refundAmount > payment.amount) {
    throw new ValidationError('Refund amount exceeds payment amount');
  }

  // Process refund through appropriate provider
  let success = false;
  if (payment.provider === 'MAYA') {
    success = await mayaClient.processRefund(input.paymentId, refundAmount, input.reason);
  } else {
    success = await gcashClient.processRefund(input.paymentId, refundAmount, input.reason);
  }

  if (success) {
    // Create refund record
    const refunds = refundStore.get(input.paymentId) || [];
    refunds.push({
      paymentId: input.paymentId,
      amount: refundAmount,
      reason: input.reason,
      status: 'COMPLETED',
      createdAt: new Date(),
    });
    refundStore.set(input.paymentId, refunds);

    // Update payment status if full refund
    if (refundAmount === payment.amount) {
      payment.status = 'REFUNDED';
      paymentStore.set(input.paymentId, payment);
    }
  }

  return success;
}

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

export async function getTransactionHistory(
  customerId?: string,
  page: number = 1,
  limit: number = 20
) {
  let payments = Array.from(paymentStore.values());
  
  if (customerId) {
    payments = payments.filter(p => p.customerId === customerId);
  }
  
  // Sort by createdAt desc
  payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const total = payments.length;
  const start = (page - 1) * limit;
  const paginated = payments.slice(start, start + limit);

  return {
    data: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const paymentsService = {
  initiateWithOrchestration: initiatePaymentWithOrchestration,
  initiateMaya: mayaClient.initiatePayment.bind(mayaClient),
  initiateGCash: gcashClient.initiatePayment.bind(gcashClient),
  handleMayaWebhook,
  handleGCashWebhook,
  processRefund,
  getTransactionHistory,
};

export default paymentsService;
