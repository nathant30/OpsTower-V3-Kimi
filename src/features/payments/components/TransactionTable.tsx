/**
 * TransactionTable Component
 * Displays payment transactions with sorting and filtering
 */

import { useState, useMemo } from 'react';
import { ArrowUpDown, ExternalLink, CreditCard, Smartphone } from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type {
  PaymentTransaction,
  PaymentProvider,
  PaymentStatus,
} from '@/features/payments/types';

interface TransactionTableProps {
  transactions: PaymentTransaction[];
  loading?: boolean;
  onTransactionClick?: (transaction: PaymentTransaction) => void;
  onRefundClick?: (transaction: PaymentTransaction) => void;
  onVerifyClick?: (transaction: PaymentTransaction) => void;
  showActions?: boolean;
}

type SortField = 'createdAt' | 'amount';
type SortDirection = 'asc' | 'desc';

export function TransactionTable({
  transactions,
  loading = false,
  onTransactionClick,
  onRefundClick,
  onVerifyClick,
  showActions = true,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Format currency amount
  const formatAmount = (value: number, currency: string = 'PHP') => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: PaymentStatus) => {
    const variantMap: Record<PaymentStatus, 'default' | 'active' | 'warning' | 'alert' | 'success' | 'idle'> = {
      completed: 'success',
      pending: 'warning',
      processing: 'warning',
      failed: 'alert',
      refunded: 'idle',
      cancelled: 'default',
      expired: 'default',
    };
    return variantMap[status] || 'default';
  };

  // Get provider badge styles
  const getProviderBadgeStyles = (provider: PaymentProvider) => {
    if (provider === 'maya') {
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  };

  // Get provider icon
  const ProviderIcon = ({ provider }: { provider: PaymentProvider }) => {
    if (provider === 'maya') {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-blue-400" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
        <Smartphone className="w-4 h-4 text-green-400" />
      </div>
    );
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'amount') {
        return (a.amount - b.amount) * multiplier;
      }
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        multiplier
      );
    });
  }, [transactions, sortField, sortDirection]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-gray-800 rounded-lg p-4 animate-pulse bg-[#12121a]"
          >
            <div className="h-4 w-1/4 bg-gray-800 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-[#12121a] border border-gray-800 rounded-xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <XpressCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Transaction
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  aria-label="Sort by date"
                >
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  aria-label="Sort by amount"
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Provider
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Description
              </th>
              {showActions && (
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <ProviderIcon provider={transaction.provider} />
                    <div>
                      <span className="font-mono text-sm text-white block">
                        {transaction.transactionId}
                      </span>
                      <span className="text-xs text-gray-500">
                        Ref: {transaction.reference}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-white">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getProviderBadgeStyles(
                      transaction.provider
                    )}`}
                  >
                    {transaction.provider.charAt(0).toUpperCase() +
                      transaction.provider.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400 max-w-xs truncate">
                  {transaction.description}
                </td>
                {showActions && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onVerifyClick &&
                        (transaction.status === 'pending' ||
                          transaction.status === 'processing') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onVerifyClick(transaction)}
                          >
                            Verify
                          </Button>
                        )}
                      {onRefundClick &&
                        transaction.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRefundClick(transaction)}
                          >
                            Refund
                          </Button>
                        )}
                      {onTransactionClick && (
                        <button
                          onClick={() => onTransactionClick(transaction)}
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-sm"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </XpressCard>
  );
}

export default TransactionTable;
