import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDateTime } from '@/lib/utils/date';
import type { Transaction, TransactionType, TransactionStatus } from '@/types/domain.types';
import { Badge } from '@/components/ui/Badge';
import { 
  CreditCard, 
  Truck, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  MinusCircle, 
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
  className?: string;
}

const transactionTypeConfig: Record<TransactionType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  OrderPayment: { 
    icon: <CreditCard className="w-5 h-5" />, 
    label: 'Order Payment', 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  DriverEarnings: { 
    icon: <Truck className="w-5 h-5" />, 
    label: 'Driver Earnings', 
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  Commission: { 
    icon: <FileText className="w-5 h-5" />, 
    label: 'Commission', 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  Payout: { 
    icon: <ArrowUpRight className="w-5 h-5" />, 
    label: 'Payout', 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  TopUp: { 
    icon: <ArrowDownLeft className="w-5 h-5" />, 
    label: 'Top Up', 
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
  Refund: { 
    icon: <RefreshCcw className="w-5 h-5" />, 
    label: 'Refund', 
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
  Adjustment: { 
    icon: <MinusCircle className="w-5 h-5" />, 
    label: 'Adjustment', 
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10'
  },
  Fee: { 
    icon: <DollarSign className="w-5 h-5" />, 
    label: 'Fee', 
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10'
  },
};

const statusVariantMap: Record<TransactionStatus, 'active' | 'idle' | 'alert' | 'warning'> = {
  Completed: 'active',
  Pending: 'idle',
  Failed: 'alert',
  Reversed: 'warning',
};

export function TransactionCard({ transaction, onClick, className }: TransactionCardProps) {
  const typeConfig = transactionTypeConfig[transaction.type];
  const isCredit = ['TopUp', 'Refund', 'DriverEarnings'].includes(transaction.type);
  const isDebit = ['Payout', 'Commission', 'Fee'].includes(transaction.type);
  
  const getAmountColor = () => {
    if (isCredit) return 'text-green-400';
    if (isDebit) return 'text-red-400';
    return 'text-white';
  };

  const getAmountPrefix = () => {
    if (isCredit) return '+';
    if (isDebit) return '-';
    return '';
  };

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={cn(
        "group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 cursor-pointer",
        "hover:border-white/20 hover:from-white/10 hover:to-white/5 transition-all duration-200",
        className
      )}
    >
      {/* Background glow on hover */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity" />
      
      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
          typeConfig.bgColor,
          typeConfig.color
        )}>
          {typeConfig.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-white truncate">
                {typeConfig.label}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {transaction.transactionId}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("font-bold text-lg", getAmountColor())}>
                {getAmountPrefix()}{formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span className="truncate">{transaction.parties.from.name}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{transaction.parties.to.name}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <Badge variant={statusVariantMap[transaction.status]}>
              {transaction.status}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatDateTime(transaction.timestamps.initiatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionCard;
