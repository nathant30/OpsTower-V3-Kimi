/**
 * Payout History Component
 * Displays payout history table with status and actions
 */

import { useState } from 'react';
import { 
  RotateCcw, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2,
  CreditCard,
} from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  usePayoutHistory, 
  useRetryPayout,
  formatCurrency,
  getPayoutStatusColor,
  getPayoutMethodLabel,
  type PayoutEntry,
  type PayoutFilters,
} from '../hooks/useEarnings';

interface PayoutHistoryProps {
  filters?: PayoutFilters;
  showActions?: boolean;
  className?: string;
}

// Status badge component
function StatusBadge({ status }: { status: PayoutEntry['status'] }) {
  const classes = getPayoutStatusColor(status);
  const icons = {
    Completed: CheckCircle,
    Pending: Clock,
    Processing: Loader2,
    Failed: XCircle,
  };
  const Icon = icons[status];

  return (
    <Badge 
      variant="default"
      className={`${classes} border inline-flex items-center gap-1.5`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'Processing' ? 'animate-spin' : ''}`} />
      {status}
    </Badge>
  );
}

// Payout method icon
function MethodIcon({ method }: { method: PayoutEntry['method'] }) {
  const icons: Record<string, string> = {
    BankTransfer: '🏦',
    GCash: '💳',
    Maya: '💰',
    Cash: '💵',
  };
  
  return (
    <span className="text-lg" title={getPayoutMethodLabel(method)}>
      {icons[method] || <CreditCard className="w-4 h-4" />}
    </span>
  );
}

// Single payout row
function PayoutRow({ 
  payout, 
  onRetry,
  isRetrying,
  showActions,
}: { 
  payout: PayoutEntry; 
  onRetry?: (id: string) => void;
  isRetrying?: boolean;
  showActions: boolean;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium text-white">{payout.driverName}</div>
        <div className="text-xs text-gray-500">{payout.driverId}</div>
      </td>
      <td className="py-3 px-4">
        <div className="font-semibold text-green-400">
          {formatCurrency(payout.amount)}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <MethodIcon method={payout.method} />
          <span className="text-sm text-gray-300">
            {getPayoutMethodLabel(payout.method)}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={payout.status} />
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-400">
          {formatDate(payout.requestedAt)}
        </div>
        {payout.processedAt && (
          <div className="text-xs text-gray-600">
            Processed: {formatDate(payout.processedAt)}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="text-xs text-gray-500 font-mono">
          {payout.reference || '-'}
        </div>
        {payout.failureReason && (
          <div className="text-xs text-red-400 mt-1">
            {payout.failureReason}
          </div>
        )}
      </td>
      {showActions && (
        <td className="py-3 px-4">
          {payout.status === 'Failed' && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => onRetry(payout.id)}
              loading={isRetrying}
            >
              Retry
            </Button>
          )}
        </td>
      )}
    </tr>
  );
}

// Main Component
export function PayoutHistory({ 
  filters, 
  showActions = true,
  className 
}: PayoutHistoryProps) {
  const [selectedPayout, setSelectedPayout] = useState<PayoutEntry | null>(null);
  
  const { data, isLoading, error } = usePayoutHistory(filters);
  const retryMutation = useRetryPayout();

  const handleRetry = async (payoutId: string) => {
    try {
      await retryMutation.mutateAsync(payoutId);
    } catch (err) {
      console.error('Failed to retry payout:', err);
    }
  };

  const handleExport = () => {
    if (!data?.items) return;
    
    const csvContent = [
      ['ID', 'Driver', 'Amount', 'Method', 'Status', 'Requested At', 'Reference'].join(','),
      ...data.items.map(p => [
        p.id,
        p.driverName,
        p.amount,
        p.method,
        p.status,
        p.requestedAt,
        p.reference || '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <XpressCard title="Payout History" className={className}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </XpressCard>
    );
  }

  if (error) {
    return (
      <XpressCard title="Payout History" className={className}>
        <div className="flex items-center justify-center h-64 text-red-400">
          Failed to load payout history
        </div>
      </XpressCard>
    );
  }

  const payouts = data?.items || [];

  return (
    <XpressCard 
      title="Payout History" 
      subtitle={`${payouts.length} payouts`}
      className={className}
      headerAction={
        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Export
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Driver</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Amount</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Method</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Date</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Reference</th>
              {showActions && <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <PayoutRow
                key={payout.id}
                payout={payout}
                onRetry={handleRetry}
                isRetrying={retryMutation.isPending}
                showActions={showActions}
              />
            ))}
            {payouts.length === 0 && (
              <tr>
                <td 
                  colSpan={showActions ? 7 : 6} 
                  className="py-8 text-center text-gray-500"
                >
                  No payouts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payout Detail Modal */}
      <Modal
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        title="Payout Details"
        size="md"
      >
        {selectedPayout && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Driver</div>
                <div className="text-white font-medium">{selectedPayout.driverName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-green-400 font-semibold">
                  {formatCurrency(selectedPayout.amount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Method</div>
                <div className="text-white">{getPayoutMethodLabel(selectedPayout.method)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <StatusBadge status={selectedPayout.status} />
              </div>
            </div>
            {selectedPayout.failureReason && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-sm text-red-400">
                  Failure Reason: {selectedPayout.failureReason}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </XpressCard>
  );
}

// Compact version for dashboards
export function PayoutHistoryCompact({ 
  limit = 5,
  className 
}: { 
  limit?: number;
  className?: string;
}) {
  const { data, isLoading } = usePayoutHistory({ pageSize: limit });

  if (isLoading) {
    return (
      <XpressCard title="Recent Payouts" className={className}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </XpressCard>
    );
  }

  const payouts = data?.items?.slice(0, limit) || [];

  return (
    <XpressCard title="Recent Payouts" className={className}>
      <div className="space-y-3">
        {payouts.map((payout) => (
          <div 
            key={payout.id}
            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <MethodIcon method={payout.method} />
              <div>
                <div className="text-sm font-medium text-white">{payout.driverName}</div>
                <div className="text-xs text-gray-500">
                  {new Date(payout.requestedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-green-400">
                {formatCurrency(payout.amount)}
              </div>
              <StatusBadge status={payout.status} />
            </div>
          </div>
        ))}
        {payouts.length === 0 && (
          <div className="text-center text-gray-500 py-4">No recent payouts</div>
        )}
      </div>
    </XpressCard>
  );
}

export default PayoutHistory;
