/**
 * PaymentModal Component
 * Modal for initiating payments with Maya/GCash
 */

import { useState, useCallback } from 'react';
import { CreditCard, Smartphone, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { XpressCard } from '@/components/ui/XpressCard';
import type {
  PaymentProvider,
  PaymentMethodConfig,
  PaymentInitResponse,
} from '@/features/payments/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    provider: PaymentProvider,
    amount: number,
    description: string
  ) => Promise<PaymentInitResponse>;
  methods?: PaymentMethodConfig[];
  defaultProvider?: PaymentProvider;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  methods = [],
  defaultProvider,
}: PaymentModalProps) {
  const [step, setStep] = useState<'provider' | 'details' | 'processing' | 'success' | 'error'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(defaultProvider || null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentInitResponse | null>(null);

  const mayaConfig = methods.find((m) => m.provider === 'maya');
  const gcashConfig = methods.find((m) => m.provider === 'gcash');

  const isMayaEnabled = mayaConfig?.enabled ?? true;
  const isGCashEnabled = gcashConfig?.enabled ?? true;

  // Reset state when modal opens/closes
  const handleClose = useCallback(() => {
    setStep('provider');
    setSelectedProvider(defaultProvider || null);
    setAmount('');
    setDescription('');
    setError(null);
    setResult(null);
    onClose();
  }, [onClose, defaultProvider]);

  // Handle provider selection
  const selectProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setStep('details');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedProvider || !amount || parseFloat(amount) <= 0) return;

    setStep('processing');
    setError(null);

    try {
      const response = await onSubmit(
        selectedProvider,
        parseFloat(amount),
        description || `${selectedProvider === 'maya' ? 'Maya' : 'GCash'} payment`
      );

      if (response.success) {
        setResult(response);
        setStep('success');
      } else {
        setError(response.message || 'Payment initiation failed');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStep('error');
    }
  };

  // Validate amount against provider limits
  const validateAmount = (value: string): string | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return 'Please enter a valid amount';
    }

    const config = selectedProvider === 'maya' ? mayaConfig : gcashConfig;
    if (config) {
      if (num < config.minAmount) {
        return `Minimum amount is ₱${config.minAmount.toLocaleString()}`;
      }
      if (num > config.maxAmount) {
        return `Maximum amount is ₱${config.maxAmount.toLocaleString()}`;
      }
    }

    return null;
  };

  const amountError = amount ? validateAmount(amount) : null;
  const canSubmit = selectedProvider && amount && !amountError && description;

  // Provider selection step
  const renderProviderStep = () => (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Select your preferred payment method</p>
      
      {/* Maya Option */}
      <button
        onClick={() => isMayaEnabled && selectProvider('maya')}
        disabled={!isMayaEnabled}
        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
          !isMayaEnabled
            ? 'border-gray-800/50 bg-gray-900/50 opacity-50 cursor-not-allowed'
            : 'border-gray-800 hover:border-blue-500/50 bg-[#12121a] hover:bg-blue-500/5'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Maya</h3>
              <Badge variant="active">Popular</Badge>
            </div>
            <p className="text-sm text-gray-400">Credit/debit cards and e-wallet</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </div>
      </button>

      {/* GCash Option */}
      <button
        onClick={() => isGCashEnabled && selectProvider('gcash')}
        disabled={!isGCashEnabled}
        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
          !isGCashEnabled
            ? 'border-gray-800/50 bg-gray-900/50 opacity-50 cursor-not-allowed'
            : 'border-gray-800 hover:border-green-500/50 bg-[#12121a] hover:bg-green-500/5'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">GCash</h3>
              <Badge variant="success">Instant</Badge>
            </div>
            <p className="text-sm text-gray-400">Mobile wallet payment</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </div>
      </button>
    </div>
  );

  // Payment details step
  const renderDetailsStep = () => (
    <div className="space-y-4">
      {/* Selected Provider */}
      <XpressCard className="bg-opacity-50">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedProvider === 'maya'
                ? 'bg-blue-500/20'
                : 'bg-green-500/20'
            }`}
          >
            {selectedProvider === 'maya' ? (
              <CreditCard className="w-5 h-5 text-blue-400" />
            ) : (
              <Smartphone className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400">Paying with</p>
            <p className="font-medium text-white">
              {selectedProvider === 'maya' ? 'Maya' : 'GCash'}
            </p>
          </div>
          <button
            onClick={() => setStep('provider')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Change
          </button>
        </div>
      </XpressCard>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Amount (₱)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            ₱
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full pl-8 pr-4 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        {amountError && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {amountError}
          </p>
        )}
        {selectedProvider && (
          <p className="text-xs text-gray-500 mt-1">
            Min: ₱
            {(selectedProvider === 'maya' ? mayaConfig?.minAmount : gcashConfig?.minAmount) || 1} - Max: ₱
            {(selectedProvider === 'maya' ? mayaConfig?.maxAmount : gcashConfig?.maxAmount) || 100000}
          </p>
        )}
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Driver payout, Customer refund..."
          className="w-full px-4 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={false}
        className="w-full"
      >
        Proceed to Payment
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  // Processing step
  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Processing Payment
      </h3>
      <p className="text-gray-400">
        Please wait while we initiate your {selectedProvider === 'maya' ? 'Maya' : 'GCash'} payment...
      </p>
    </div>
  );

  // Success step
  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Payment Initiated!
      </h3>
      <p className="text-gray-400 mb-4">
        Your payment of ₱{parseFloat(amount).toLocaleString()} has been initiated.
      </p>
      {result?.reference && (
        <div className="bg-[#0f0f14] border border-gray-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500">Reference</p>
          <p className="font-mono text-sm text-white">{result.reference}</p>
        </div>
      )}
      <Button onClick={handleClose} variant="secondary" className="w-full">
        Close
      </Button>
    </div>
  );

  // Error step
  const renderErrorStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Payment Failed
      </h3>
      <p className="text-gray-400 mb-4">{error}</p>
      <div className="flex gap-2">
        <Button onClick={() => setStep('details')} variant="secondary" className="flex-1">
          Try Again
        </Button>
        <Button onClick={handleClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );

  // Step titles
  const stepTitles: Record<string, string> = {
    provider: 'New Payment',
    details: 'Payment Details',
    processing: 'Processing',
    success: 'Success',
    error: 'Error',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'processing' ? () => {} : handleClose}
      title={stepTitles[step]}
      size="md"
      showCloseButton={step !== 'processing'}
    >
      {step === 'provider' && renderProviderStep()}
      {step === 'details' && renderDetailsStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'success' && renderSuccessStep()}
      {step === 'error' && renderErrorStep()}
    </Modal>
  );
}

export default PaymentModal;
