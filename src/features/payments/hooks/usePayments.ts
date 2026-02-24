/**
 * usePayments Hook
 * Hook for payment operations (initiate, refund, verify)
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/auth/ToastProvider';
import {
  initMayaPayment,
  initGCashPayment,
  processRefund,
  verifyPayment,
  retryPayment,
  cancelPayment,
  verifyMayaPayment,
  verifyGCashPayment,
} from '@/services/payments/payments.service';
import { PAYMENT_QUERY_KEYS } from '@/services/payments/payments.service';
import type {
  PaymentProvider,
  PaymentInitResponse,
  RefundRequest,
  RefundResponse,
  PaymentVerifyResponse,
} from '@/features/payments/types';

interface InitiatePaymentOptions {
  onSuccess?: (response: PaymentInitResponse) => void;
  onError?: (error: Error) => void;
}

interface RefundOptions {
  onSuccess?: (response: RefundResponse) => void;
  onError?: (error: Error) => void;
}

interface VerifyOptions {
  onSuccess?: (response: PaymentVerifyResponse) => void;
  onError?: (error: Error) => void;
}

export function usePayments() {
  const queryClient = useQueryClient();
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);

  // Initiate Maya payment
  const mayaMutation = useMutation({
    mutationFn: async ({
      amount,
      description,
      metadata,
    }: {
      amount: number;
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      return initMayaPayment(amount, description, metadata);
    },
    onSuccess: (data) => {
      if (data.transactionId) {
        setActiveTransactionId(data.transactionId);
      }
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.stats] });
    },
  });

  // Initiate GCash payment
  const gcashMutation = useMutation({
    mutationFn: async ({
      amount,
      description,
      metadata,
    }: {
      amount: number;
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      return initGCashPayment(amount, description, metadata);
    },
    onSuccess: (data) => {
      if (data.transactionId) {
        setActiveTransactionId(data.transactionId);
      }
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.stats] });
    },
  });

  // Process refund
  const refundMutation = useMutation({
    mutationFn: async (request: RefundRequest) => {
      return processRefund(request);
    },
    onSuccess: (_, variables) => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEYS.transaction(variables.transactionId),
      });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.stats] });
    },
    onError: (error) => {
      toast.error(`Refund failed: ${error.message}`);
    },
  });

  // Verify payment
  const verifyMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return verifyPayment(transactionId);
    },
    onSuccess: (data, transactionId) => {
      queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEYS.transaction(transactionId),
      });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.transactions] });
    },
  });

  // Retry payment
  const retryMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return retryPayment(transactionId);
    },
    onSuccess: () => {
      toast.success('Payment retry initiated');
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.stats] });
    },
    onError: (error) => {
      toast.error(`Retry failed: ${error.message}`);
    },
  });

  // Cancel payment
  const cancelMutation = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason?: string }) => {
      return cancelPayment(transactionId, reason);
    },
    onSuccess: (_, variables) => {
      toast.success('Payment cancelled');
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEYS.transaction(variables.transactionId),
      });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.stats] });
    },
    onError: (error) => {
      toast.error(`Cancellation failed: ${error.message}`);
    },
  });

  // Helper to initiate payment based on provider
  const initiatePayment = useCallback(
    async (
      provider: PaymentProvider,
      amount: number,
      description: string,
      metadata?: Record<string, unknown>,
      options?: InitiatePaymentOptions
    ) => {
      try {
        let response: PaymentInitResponse;

        if (provider === 'maya') {
          response = await mayaMutation.mutateAsync({ amount, description, metadata });
        } else {
          response = await gcashMutation.mutateAsync({ amount, description, metadata });
        }

        if (response.success) {
          toast.success(`Payment initiated with ${provider === 'maya' ? 'Maya' : 'GCash'}`);
          options?.onSuccess?.(response);
        } else {
          throw new Error(response.message || 'Payment initiation failed');
        }

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        toast.error(`Payment failed: ${err.message}`);
        options?.onError?.(err);
        throw err;
      }
    },
    [mayaMutation, gcashMutation]
  );

  // Helper to process refund
  const refund = useCallback(
    async (request: RefundRequest, options?: RefundOptions) => {
      try {
        const response = await refundMutation.mutateAsync(request);
        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        options?.onError?.(err);
        throw err;
      }
    },
    [refundMutation]
  );

  // Helper to verify payment
  const verify = useCallback(
    async (transactionId: string, options?: VerifyOptions) => {
      try {
        const response = await verifyMutation.mutateAsync(transactionId);
        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        options?.onError?.(err);
        throw err;
      }
    },
    [verifyMutation]
  );

  // Helper to retry payment
  const retry = useCallback(
    async (transactionId: string) => {
      return retryMutation.mutateAsync(transactionId);
    },
    [retryMutation]
  );

  // Helper to cancel payment
  const cancel = useCallback(
    async (transactionId: string, reason?: string) => {
      return cancelMutation.mutateAsync({ transactionId, reason });
    },
    [cancelMutation]
  );

  // Check if any mutation is pending
  const isProcessing =
    mayaMutation.isPending ||
    gcashMutation.isPending ||
    refundMutation.isPending ||
    verifyMutation.isPending ||
    retryMutation.isPending ||
    cancelMutation.isPending;

  return {
    // Actions
    initiatePayment,
    refund,
    verify,
    retry,
    cancel,

    // State
    isProcessing,
    activeTransactionId,
    setActiveTransactionId,

    // Individual mutation states
    mayaPayment: {
      mutate: mayaMutation.mutate,
      isPending: mayaMutation.isPending,
      error: mayaMutation.error,
    },
    gcashPayment: {
      mutate: gcashMutation.mutate,
      isPending: gcashMutation.isPending,
      error: gcashMutation.error,
    },
    processRefund: {
      mutate: refundMutation.mutate,
      isPending: refundMutation.isPending,
      error: refundMutation.error,
    },
  };
}
