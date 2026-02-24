/**
 * usePaymentMethods Hook
 * Hook for managing payment method configurations (Maya, GCash)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { toast } from '@/components/auth/ToastProvider';
import {
  getPaymentMethods,
  updatePaymentMethod,
  PAYMENT_QUERY_KEYS,
} from '@/services/payments/payments.service';
import type {
  PaymentProvider,
  PaymentMethodConfig,
} from '@/features/payments/types';

interface UsePaymentMethodsOptions {
  enabled?: boolean;
}

export function usePaymentMethods(options: UsePaymentMethodsOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

  // Fetch payment methods
  const {
    data: methods,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [PAYMENT_QUERY_KEYS.methods],
    queryFn: getPaymentMethods,
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });

  // Update payment method mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      provider,
      config,
    }: {
      provider: PaymentProvider;
      config: Partial<PaymentMethodConfig>;
    }) => {
      return updatePaymentMethod(provider, config);
    },
    onSuccess: () => {
      toast.success('Payment method updated');
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.methods] });
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  // Derived data
  const mayaConfig = useMemo(
    () => methods?.find((m) => m.provider === 'maya'),
    [methods]
  );

  const gcashConfig = useMemo(
    () => methods?.find((m) => m.provider === 'gcash'),
    [methods]
  );

  const enabledMethods = useMemo(
    () => methods?.filter((m) => m.enabled) || [],
    [methods]
  );

  const isMayaEnabled = mayaConfig?.enabled ?? false;
  const isGCashEnabled = gcashConfig?.enabled ?? false;

  // Enable/disable methods
  const toggleMethod = useCallback(
    async (provider: PaymentProvider, enabled: boolean) => {
      return updateMutation.mutateAsync({ provider, config: { enabled } });
    },
    [updateMutation]
  );

  const enableMaya = useCallback(() => {
    if (mayaConfig) {
      return toggleMethod('maya', true);
    }
  }, [mayaConfig, toggleMethod]);

  const disableMaya = useCallback(() => {
    if (mayaConfig) {
      return toggleMethod('maya', false);
    }
  }, [mayaConfig, toggleMethod]);

  const enableGCash = useCallback(() => {
    if (gcashConfig) {
      return toggleMethod('gcash', true);
    }
  }, [gcashConfig, toggleMethod]);

  const disableGCash = useCallback(() => {
    if (gcashConfig) {
      return toggleMethod('gcash', false);
    }
  }, [gcashConfig, toggleMethod]);

  // Update sandbox mode
  const setSandboxMode = useCallback(
    async (provider: PaymentProvider, sandboxMode: boolean) => {
      return updateMutation.mutateAsync({ provider, config: { sandboxMode } });
    },
    [updateMutation]
  );

  // Update webhook URL
  const setWebhookUrl = useCallback(
    async (provider: PaymentProvider, webhookUrl: string) => {
      return updateMutation.mutateAsync({ provider, config: { webhookUrl } });
    },
    [updateMutation]
  );

  // Update amount limits
  const setAmountLimits = useCallback(
    async (provider: PaymentProvider, minAmount: number, maxAmount: number) => {
      return updateMutation.mutateAsync({
        provider,
        config: { minAmount, maxAmount },
      });
    },
    [updateMutation]
  );

  // Check if amount is within limits
  const isAmountValid = useCallback(
    (provider: PaymentProvider, amount: number): boolean => {
      const config = provider === 'maya' ? mayaConfig : gcashConfig;
      if (!config) return false;
      return amount >= config.minAmount && amount <= config.maxAmount;
    },
    [mayaConfig, gcashConfig]
  );

  // Get amount limits
  const getAmountLimits = useCallback(
    (provider: PaymentProvider): { min: number; max: number } | null => {
      const config = provider === 'maya' ? mayaConfig : gcashConfig;
      if (!config) return null;
      return { min: config.minAmount, max: config.maxAmount };
    },
    [mayaConfig, gcashConfig]
  );

  // Refresh methods
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Data
    methods: methods || [],
    mayaConfig,
    gcashConfig,
    enabledMethods,

    // States
    isMayaEnabled,
    isGCashEnabled,
    selectedProvider,

    // Loading states
    isLoading,
    isUpdating: updateMutation.isPending,
    error,

    // Selection
    setSelectedProvider,

    // Actions
    toggleMethod,
    enableMaya,
    disableMaya,
    enableGCash,
    disableGCash,
    setSandboxMode,
    setWebhookUrl,
    setAmountLimits,
    refresh,

    // Validation
    isAmountValid,
    getAmountLimits,
  };
}
