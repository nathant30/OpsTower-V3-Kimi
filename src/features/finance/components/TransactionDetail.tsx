import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateTime } from '@/lib/utils/date';
import type { Transaction, TransactionType, TransactionStatus } from '@/types/domain.types';
import { 
  CreditCard, 
  Truck, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  MinusCircle, 
  DollarSign,
  Package,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  ExternalLink
} from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onReverse?: (transaction: Transaction) => void;
}

const transactionTypeConfig: Record<TransactionType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  OrderPayment: { 
    icon: <CreditCard className="w-6 h-6" />, 
    label: 'Order Payment', 
    color: 'text-xpress-accent-blue',
    bgColor: 'bg-xpress-accent-blue/10'
  },
  DriverEarnings: { 
    icon: <Truck className="w-6 h-6" />, 
    label: 'Driver Earnings', 
    color: 'text-xpress-accent-green',
    bgColor: 'bg-xpress-accent-green/10'
  },
  Commission: { 
    icon: <FileText className="w-6 h-6" />, 
    label: 'Commission', 
    color: 'text-xpress-accent-purple',
    bgColor: 'bg-xpress-accent-purple/10'
  },
  Payout: { 
    icon: <ArrowUpRight className="w-6 h-6" />, 
    label: 'Payout', 
    color: 'text-xpress-accent-amber',
    bgColor: 'bg-xpress-accent-amber/10'
  },
  TopUp: { 
    icon: <ArrowDownLeft className="w-6 h-6" />, 
    label: 'Top Up', 
    color: 'text-xpress-accent-cyan',
    bgColor: 'bg-xpress-accent-cyan/10'
  },
  Refund: { 
    icon: <RefreshCcw className="w-6 h-6" />, 
    label: 'Refund', 
    color: 'text-xpress-accent-red',
    bgColor: 'bg-xpress-accent-red/10'
  },
  Adjustment: { 
    icon: <MinusCircle className="w-6 h-6" />, 
    label: 'Adjustment', 
    color: 'text-xpress-text-secondary',
    bgColor: 'bg-xpress-bg-elevated'
  },
  Fee: { 
    icon: <DollarSign className="w-6 h-6" />, 
    label: 'Fee', 
    color: 'text-xpress-text-muted',
    bgColor: 'bg-xpress-bg-tertiary'
  },
};

const statusConfig: Record<TransactionStatus, { icon: React.ReactNode; variant: 'active' | 'idle' | 'alert' | 'warning' | 'default'; label: string }> = {
  Completed: { icon: <CheckCircle className="w-4 h-4" />, variant: 'active', label: 'Completed' },
  Pending: { icon: <Clock className="w-4 h-4" />, variant: 'idle', label: 'Pending' },
  Failed: { icon: <XCircle className="w-4 h-4" />, variant: 'alert', label: 'Failed' },
  Reversed: { icon: <AlertCircle className="w-4 h-4" />, variant: 'warning', label: 'Reversed' },
};

export function TransactionDetail({ transaction, isOpen, onClose, onReverse }: TransactionDetailProps) {
  if (!transaction) return null;

  const typeConfig = transactionTypeConfig[transaction.type];
  const statusConfig_item = statusConfig[transaction.status];

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" onClick={onClose}>
        Close
      </Button>
      <div className="flex gap-2">
        {transaction.status !== 'Reversed' && transaction.status !== 'Failed' && onReverse && (
          <Button 
            variant="danger" 
            onClick={() => onReverse(transaction)}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reverse Transaction
          </Button>
        )}
        {transaction.order && (
          <Button variant="primary">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Order
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Header with Type and Amount */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${typeConfig.bgColor} ${typeConfig.color}`}>
              {typeConfig.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-xpress-text-primary">
                {typeConfig.label}
              </h3>
              <p className="font-mono text-sm text-xpress-text-muted">
                {transaction.transactionId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-xpress-text-primary">
              {formatCurrency(transaction.amount)}
            </p>
            <Badge variant={statusConfig_item.variant} className="mt-1">
              <span className="flex items-center gap-1">
                {statusConfig_item.icon}
                {statusConfig_item.label}
              </span>
            </Badge>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-xpress-bg-secondary rounded-lg">
          <div>
            <p className="text-xs text-xpress-text-muted uppercase tracking-wider mb-2">From</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-xpress-bg-elevated flex items-center justify-center">
                {transaction.parties.from.type === 'Customer' ? (
                  <User className="w-5 h-5 text-xpress-text-secondary" />
                ) : (
                  <Building className="w-5 h-5 text-xpress-text-secondary" />
                )}
              </div>
              <div>
                <p className="font-medium text-xpress-text-primary">{transaction.parties.from.name}</p>
                <p className="text-sm text-xpress-text-muted">{transaction.parties.from.type}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-xpress-text-muted uppercase tracking-wider mb-2">To</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-xpress-bg-elevated flex items-center justify-center">
                {transaction.parties.to.type === 'Driver' ? (
                  <Truck className="w-5 h-5 text-xpress-text-secondary" />
                ) : (
                  <Building className="w-5 h-5 text-xpress-text-secondary" />
                )}
              </div>
              <div>
                <p className="font-medium text-xpress-text-primary">{transaction.parties.to.name}</p>
                <p className="text-sm text-xpress-text-muted">{transaction.parties.to.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Reference (if applicable) */}
        {transaction.order && (
          <div className="p-4 border border-xpress-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-xpress-accent-blue" />
                <div>
                  <p className="text-sm text-xpress-text-muted">Related Order</p>
                  <p className="font-medium text-xpress-text-primary">{transaction.order.orderId}</p>
                </div>
              </div>
              <Badge variant="default">{transaction.order.serviceType}</Badge>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div>
          <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Payment Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-xpress-border">
              <span className="text-xpress-text-muted">Method</span>
              <span className="text-xpress-text-primary">{transaction.payment.method}</span>
            </div>
            {transaction.payment.gateway && (
              <div className="flex justify-between py-2 border-b border-xpress-border">
                <span className="text-xpress-text-muted">Gateway</span>
                <span className="text-xpress-text-primary">{transaction.payment.gateway}</span>
              </div>
            )}
            {transaction.payment.referenceNumber && (
              <div className="flex justify-between py-2 border-b border-xpress-border">
                <span className="text-xpress-text-muted">Reference</span>
                <span className="font-mono text-xpress-text-primary">{transaction.payment.referenceNumber}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-xpress-border">
              <span className="text-xpress-text-muted">Currency</span>
              <span className="text-xpress-text-primary">{transaction.currency}</span>
            </div>
          </div>
        </div>

        {/* Amount Breakdown (for order-related transactions) */}
        {(transaction.type === 'OrderPayment' || transaction.type === 'DriverEarnings' || transaction.type === 'Commission') && (
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Amount Breakdown</h4>
            <div className="bg-xpress-bg-secondary rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-xpress-text-muted">Base Fare</span>
                <span className="text-xpress-text-primary">{formatCurrency(transaction.breakdown.baseFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-xpress-text-muted">Distance Fare</span>
                <span className="text-xpress-text-primary">{formatCurrency(transaction.breakdown.distanceFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-xpress-text-muted">Time Fare</span>
                <span className="text-xpress-text-primary">{formatCurrency(transaction.breakdown.timeFare)}</span>
              </div>
              {transaction.breakdown.surge > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-xpress-text-muted">Surge ({transaction.breakdown.surge}x)</span>
                  <span className="text-xpress-accent-amber">
                    +{formatCurrency((transaction.breakdown.baseFare + transaction.breakdown.distanceFare + transaction.breakdown.timeFare) * (transaction.breakdown.surge - 1))}
                  </span>
                </div>
              )}
              {transaction.breakdown.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-xpress-text-muted">Discount</span>
                  <span className="text-xpress-accent-green">-{formatCurrency(transaction.breakdown.discount)}</span>
                </div>
              )}
              {transaction.breakdown.commission > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-xpress-text-muted">Commission</span>
                  <span className="text-xpress-accent-purple">-{formatCurrency(transaction.breakdown.commission)}</span>
                </div>
              )}
              {transaction.breakdown.fees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-xpress-text-muted">Fees</span>
                  <span className="text-xpress-text-muted">-{formatCurrency(transaction.breakdown.fees)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-xpress-border">
                <span className="font-medium text-xpress-text-primary">Net Amount</span>
                <span className="font-semibold text-xpress-accent-blue">{formatCurrency(transaction.amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div>
          <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-xpress-text-muted" />
              <div className="flex-1 flex justify-between text-sm">
                <span className="text-xpress-text-muted">Initiated</span>
                <span className="text-xpress-text-primary">{formatDateTime(transaction.timestamps.initiatedAt)}</span>
              </div>
            </div>
            {transaction.timestamps.completedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-xpress-accent-green" />
                <div className="flex-1 flex justify-between text-sm">
                  <span className="text-xpress-text-muted">Completed</span>
                  <span className="text-xpress-text-primary">{formatDateTime(transaction.timestamps.completedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log */}
        {transaction.metadata.auditLog.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Log
            </h4>
            <div className="bg-xpress-bg-secondary rounded-lg p-4 space-y-2">
              {transaction.metadata.auditLog.map((entry, index) => (
                <div key={index} className="text-sm border-b border-xpress-border last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium text-xpress-text-primary">{entry.action}</span>
                    <span className="text-xpress-text-muted">{formatDateTime(entry.timestamp)}</span>
                  </div>
                  <p className="text-xpress-text-secondary mt-1">{entry.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {transaction.metadata.notes && (
          <div className="p-4 bg-xpress-bg-secondary rounded-lg">
            <p className="text-xs text-xpress-text-muted uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-xpress-text-primary">{transaction.metadata.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TransactionDetail;
