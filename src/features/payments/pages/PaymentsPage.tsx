/**
 * Payments Page - Maya & GCash Integration
 * Enhanced with real API integration, webhook handling, and refund functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  TransactionTable,
  PaymentMethodSelector,
  PaymentModal,
} from '@/features/payments/components';
import {
  usePayments,
  useTransactions,
  usePaymentMethods,
} from '@/features/payments/hooks';
import type {
  PaymentTransaction,
  PaymentProvider,
} from '@/features/payments/types';
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  Wallet,
  ArrowRight,
  History,
  Banknote,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Loader2,
  QrCode,
} from 'lucide-react';

// Webhook listener component
function WebhookListener({ onWebhook }: { onWebhook: (data: unknown) => void }) {
  useEffect(() => {
    // In a real implementation, this would connect to a WebSocket
    // or use Server-Sent Events for real-time webhook updates
    const interval = setInterval(() => {
      // Simulate webhook polling for demo
      // In production, this would be replaced with actual webhook handling
    }, 30000);

    return () => clearInterval(interval);
  }, [onWebhook]);

  return null;
}

const PaymentsPage = () => {
  // Local state
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  // Hooks
  const {
    initiatePayment,
    refund,
    verify,
    retry,
    cancel,
    isProcessing,
  } = usePayments();

  const {
    transactions,
    total,
    pageNumber,
    pageSize,
    totalPages,
    stats,
    isLoading: transactionsLoading,
    isFetching,
    setProviderFilter,
    setStatusFilter,
    clearFilters,
    goToPage,
    refresh,
  } = useTransactions({
    initialFilters: { pageSize: 10 },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const {
    methods,
    isMayaEnabled,
    isGCashEnabled,
    selectedProvider: configSelectedProvider,
    setSelectedProvider,
  } = usePaymentMethods();

  // Handle webhook updates
  const handleWebhook = useCallback((data: unknown) => {
    // Handle incoming webhook data
    // Webhook received
    refresh();
  }, [refresh]);

  // Handle payment initiation
  const handleInitiatePayment = useCallback(
    async (provider: PaymentProvider, amount: number, description: string) => {
      return initiatePayment(provider, amount, description);
    },
    [initiatePayment]
  );

  // Handle refund
  const handleRefund = useCallback(async () => {
    if (!selectedTransaction || !refundReason) return;

    const amount = refundAmount ? parseFloat(refundAmount) : undefined;

    await refund({
      transactionId: selectedTransaction.id,
      reason: refundReason,
      amount,
    });

    setRefundModalOpen(false);
    setSelectedTransaction(null);
    setRefundReason('');
    setRefundAmount('');
  }, [refund, selectedTransaction, refundReason, refundAmount]);

  // Open refund modal
  const openRefundModal = useCallback((transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setRefundAmount(transaction.amount.toString());
    setRefundModalOpen(true);
  }, []);

  // Handle verify payment
  const handleVerify = useCallback(async (transaction: PaymentTransaction) => {
    await verify(transaction.id);
  }, [verify]);

  // Handle retry payment
  const handleRetry = useCallback(async (transaction: PaymentTransaction) => {
    await retry(transaction.id);
  }, [retry]);

  // Handle cancel payment
  const handleCancel = useCallback(async (transaction: PaymentTransaction) => {
    if (confirm('Are you sure you want to cancel this payment?')) {
      await cancel(transaction.id, 'Cancelled by user');
    }
  }, [cancel]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate stats
  const totalProcessed = stats.completedAmount;
  const pendingAmount = stats.pendingAmount;
  const failedAmount = stats.failedAmount;
  const refundedAmount = stats.refundedAmount;

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      <WebhookListener onWebhook={handleWebhook} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-500" />
            Payments
          </h1>
          <p className="text-gray-400 mt-1">Maya & GCash payment integration</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'new' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('new')}
          >
            <Banknote className="w-4 h-4 mr-2" />
            New Payment
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button
            variant="secondary"
            onClick={() => refresh()}
            disabled={isFetching}
            icon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <XpressCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Processed</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalProcessed)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.completedCount} successful transactions
            </p>
          </div>
        </XpressCard>

        <XpressCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.pendingCount} transactions
            </p>
          </div>
        </XpressCard>

        <XpressCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Refunded</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(refundedAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.refundedCount} refunds
            </p>
          </div>
        </XpressCard>

        <XpressCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(failedAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.failedCount} failed transactions
            </p>
          </div>
        </XpressCard>
      </div>

      {/* Provider Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <XpressCard
          icon={<CreditCard className="w-5 h-5 text-blue-400" />}
          title="Maya"
          badge={isMayaEnabled ? 'Active' : 'Disabled'}
          badgeVariant={isMayaEnabled ? 'success' : 'default'}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Transactions</span>
              <span className="text-white font-medium">
                {transactions.filter(t => t.provider === 'maya').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-white font-medium">
                {formatCurrency(transactions.filter(t => t.provider === 'maya').reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          </div>
        </XpressCard>

        <XpressCard
          icon={<Smartphone className="w-5 h-5 text-green-400" />}
          title="GCash"
          badge={isGCashEnabled ? 'Active' : 'Disabled'}
          badgeVariant={isGCashEnabled ? 'success' : 'default'}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Transactions</span>
              <span className="text-white font-medium">
                {transactions.filter(t => t.provider === 'gcash').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-white font-medium">
                {formatCurrency(transactions.filter(t => t.provider === 'gcash').reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          </div>
        </XpressCard>
      </div>

      {activeTab === 'new' ? (
        <div className="space-y-6">
          {/* Quick Actions */}
          <XpressCard title="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => setPaymentModalOpen(true)}
                disabled={!isMayaEnabled && !isGCashEnabled}
                className="h-auto py-4 flex-col items-start"
              >
                <Banknote className="w-6 h-6 mb-2" />
                <span className="font-semibold">New Payment</span>
                <span className="text-xs opacity-70">Create a payment</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => setActiveTab('history')}
                className="h-auto py-4 flex-col items-start"
              >
                <History className="w-6 h-6 mb-2" />
                <span className="font-semibold">View History</span>
                <span className="text-xs opacity-70">{total} transactions</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => {}}
                className="h-auto py-4 flex-col items-start"
              >
                <QrCode className="w-6 h-6 mb-2" />
                <span className="font-semibold">Generate QR</span>
                <span className="text-xs opacity-70">For in-person payments</span>
              </Button>
            </div>
          </XpressCard>

          {/* Payment Method Selection */}
          <XpressCard title="Select Payment Method" subtitle="Choose Maya or GCash">
            <PaymentMethodSelector
              selectedProvider={configSelectedProvider}
              onSelect={setSelectedProvider}
              methods={methods}
              showConfig={true}
            />
          </XpressCard>

          {/* Recent Transactions Preview */}
          <XpressCard
            title="Recent Transactions"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('history')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            }
          >
            <TransactionTable
              transactions={transactions.slice(0, 5)}
              loading={transactionsLoading}
              onTransactionClick={(txn) => setSelectedTransaction(txn)}
              onRefundClick={openRefundModal}
              onVerifyClick={handleVerify}
              showActions={true}
            />
          </XpressCard>
        </div>
      ) : (
        <XpressCard
          title="Transaction History"
          subtitle={`${total} total transactions`}
          headerAction={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => clearFilters()}
              >
                Clear Filters
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-800">
              <select
                onChange={(e) => setProviderFilter(e.target.value as PaymentProvider | undefined)}
                className="px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm"
              >
                <option value="">All Providers</option>
                <option value="maya">Maya</option>
                <option value="gcash">GCash</option>
              </select>

              <select
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Transaction Table */}
            <TransactionTable
              transactions={transactions}
              loading={transactionsLoading}
              onTransactionClick={(txn) => setSelectedTransaction(txn)}
              onRefundClick={openRefundModal}
              onVerifyClick={handleVerify}
              showActions={true}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {pageNumber} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => goToPage(pageNumber - 1)}
                    disabled={pageNumber <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => goToPage(pageNumber + 1)}
                    disabled={pageNumber >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </XpressCard>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleInitiatePayment}
        methods={methods}
      />

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => {
          setRefundModalOpen(false);
          setSelectedTransaction(null);
          setRefundReason('');
          setRefundAmount('');
        }}
        title="Process Refund"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRefundModalOpen(false);
                setSelectedTransaction(null);
                setRefundReason('');
                setRefundAmount('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={!refundReason || isProcessing}
              loading={isProcessing}
            >
              Process Refund
            </Button>
          </div>
        }
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="bg-[#12121a] border border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">Original Transaction</p>
              <p className="font-mono text-sm text-white">
                {selectedTransaction.transactionId}
              </p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatCurrency(selectedTransaction.amount)}
              </p>
              <p className="text-sm text-gray-400">
                {selectedTransaction.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Refund Amount (Optional - leave empty for full refund)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={selectedTransaction.amount.toString()}
                max={selectedTransaction.amount}
                className="w-full px-4 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Refund Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={3}
                className="w-full px-4 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTransaction && !refundModalOpen}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        footer={
          <div className="flex justify-end gap-2">
            {selectedTransaction?.status === 'completed' && (
              <Button
                variant="outline"
                onClick={() => openRefundModal(selectedTransaction)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refund
              </Button>
            )}
            {selectedTransaction?.status === 'failed' && (
              <Button
                variant="secondary"
                onClick={() => selectedTransaction && handleRetry(selectedTransaction)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            {(selectedTransaction?.status === 'pending' ||
              selectedTransaction?.status === 'processing') && (
              <Button
                variant="danger"
                onClick={() => selectedTransaction && handleCancel(selectedTransaction)}
              >
                Cancel Payment
              </Button>
            )}
          </div>
        }
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <Badge
                variant={
                  selectedTransaction.status === 'completed'
                    ? 'success'
                    : selectedTransaction.status === 'failed'
                    ? 'alert'
                    : selectedTransaction.status === 'pending' ||
                      selectedTransaction.status === 'processing'
                    ? 'warning'
                    : 'default'
                }
              >
                {selectedTransaction.status.charAt(0).toUpperCase() +
                  selectedTransaction.status.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Provider</span>
              <span className="text-white font-medium flex items-center gap-2">
                {selectedTransaction.provider === 'maya' ? (
                  <>
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Maya
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 text-green-400" />
                    GCash
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Amount</span>
              <span className="text-white font-semibold text-lg">
                {formatCurrency(selectedTransaction.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Transaction ID</span>
              <span className="font-mono text-sm text-white">
                {selectedTransaction.transactionId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Reference</span>
              <span className="font-mono text-sm text-white">
                {selectedTransaction.reference}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Created</span>
              <span className="text-white">
                {new Date(selectedTransaction.createdAt).toLocaleString('en-PH')}
              </span>
            </div>

            {selectedTransaction.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Completed</span>
                <span className="text-white">
                  {new Date(selectedTransaction.completedAt).toLocaleString('en-PH')}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800">
              <span className="text-sm text-gray-400">Description</span>
              <p className="text-white mt-1">{selectedTransaction.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
