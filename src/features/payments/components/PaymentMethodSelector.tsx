/**
 * PaymentMethodSelector Component
 * Maya/GCash payment method selection with configuration
 */

import { useState } from 'react';
import { CreditCard, Smartphone, Settings, CheckCircle } from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { PaymentProvider, PaymentMethodConfig } from '@/features/payments/types';

interface PaymentMethodSelectorProps {
  selectedProvider: PaymentProvider | null;
  onSelect: (provider: PaymentProvider) => void;
  methods?: PaymentMethodConfig[];
  disabled?: boolean;
  showConfig?: boolean;
  onConfigUpdate?: (provider: PaymentProvider, config: Partial<PaymentMethodConfig>) => void;
}

export function PaymentMethodSelector({
  selectedProvider,
  onSelect,
  methods = [],
  disabled = false,
  showConfig = false,
  onConfigUpdate,
}: PaymentMethodSelectorProps) {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [activeConfigProvider, setActiveConfigProvider] = useState<PaymentProvider | null>(null);

  const mayaConfig = methods.find((m) => m.provider === 'maya');
  const gcashConfig = methods.find((m) => m.provider === 'gcash');

  const isMayaEnabled = mayaConfig?.enabled ?? true;
  const isGCashEnabled = gcashConfig?.enabled ?? true;

  const openConfig = (provider: PaymentProvider) => {
    setActiveConfigProvider(provider);
    setConfigModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Maya Option */}
      <button
        onClick={() => isMayaEnabled && onSelect('maya')}
        disabled={disabled || !isMayaEnabled}
        className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
          selectedProvider === 'maya'
            ? 'border-blue-500 bg-blue-500/10'
            : isMayaEnabled
            ? 'border-gray-800 hover:border-gray-700 bg-[#12121a]'
            : 'border-gray-800/50 bg-gray-900/50 opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Maya</h3>
                {!isMayaEnabled && (
                  <Badge variant="offline">Disabled</Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">E-wallet & Card payments</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="active">Popular</Badge>
                {mayaConfig?.sandboxMode && (
                  <Badge variant="warning">Sandbox</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedProvider === 'maya' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
            {showConfig && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfig('maya');
                }}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </button>

      {/* GCash Option */}
      <button
        onClick={() => isGCashEnabled && onSelect('gcash')}
        disabled={disabled || !isGCashEnabled}
        className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
          selectedProvider === 'gcash'
            ? 'border-green-500 bg-green-500/10'
            : isGCashEnabled
            ? 'border-gray-800 hover:border-gray-700 bg-[#12121a]'
            : 'border-gray-800/50 bg-gray-900/50 opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">GCash</h3>
                {!isGCashEnabled && (
                  <Badge variant="offline">Disabled</Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">Mobile wallet payments</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success">Instant</Badge>
                {gcashConfig?.sandboxMode && (
                  <Badge variant="warning">Sandbox</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedProvider === 'gcash' && (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
            {showConfig && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfig('gcash');
                }}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </button>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setActiveConfigProvider(null);
        }}
        provider={activeConfigProvider}
        config={activeConfigProvider === 'maya' ? mayaConfig : gcashConfig}
        onSave={onConfigUpdate}
      />
    </div>
  );
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: PaymentProvider | null;
  config?: PaymentMethodConfig;
  onSave?: (provider: PaymentProvider, config: Partial<PaymentMethodConfig>) => void;
}

function ConfigModal({ isOpen, onClose, provider, config, onSave }: ConfigModalProps) {
  const [enabled, setEnabled] = useState(config?.enabled ?? true);
  const [sandboxMode, setSandboxMode] = useState(config?.sandboxMode ?? true);
  const [minAmount, setMinAmount] = useState(config?.minAmount ?? 1);
  const [maxAmount, setMaxAmount] = useState(config?.maxAmount ?? 100000);

  if (!provider) return null;

  const handleSave = () => {
    onSave?.(provider, {
      enabled,
      sandboxMode,
      minAmount,
      maxAmount,
    });
    onClose();
  };

  const isMaya = provider === 'maya';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isMaya ? 'Maya' : 'GCash'} Configuration`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Enabled Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
          <div>
            <p className="text-sm font-medium text-white">Enabled</p>
            <p className="text-xs text-gray-400">Allow payments via this method</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              enabled ? 'bg-blue-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Sandbox Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
          <div>
            <p className="text-sm font-medium text-white">Sandbox Mode</p>
            <p className="text-xs text-gray-400">Use test environment</p>
          </div>
          <button
            onClick={() => setSandboxMode(!sandboxMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              sandboxMode ? 'bg-amber-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                sandboxMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Amount Limits */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Min Amount (₱)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Max Amount (₱)
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        {/* Webhook URL (display only) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Webhook URL
          </label>
          <input
            type="text"
            value={config?.webhookUrl || `https://api.example.com/webhooks/${provider}`}
            readOnly
            className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-gray-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Configure this URL in your {isMaya ? 'Maya' : 'GCash'} dashboard
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentMethodSelector;
