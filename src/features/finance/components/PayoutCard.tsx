import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate } from '@/lib/utils/date';
import type { Settlement } from '@/types/domain.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  User, 
  Wallet, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Banknote,
  Check,
  X
} from 'lucide-react';

interface PayoutCardProps {
  settlement: Settlement;
  onApprove?: (settlement: Settlement) => void;
  onHold?: (settlement: Settlement) => void;
  className?: string;
}

const statusConfig: Record<Settlement['status'], { 
  icon: React.ReactNode; 
  variant: 'active' | 'idle' | 'alert' | 'warning'; 
  label: string;
  color: string;
  bgColor: string;
}> = {
  Pending: { 
    icon: <Clock className="w-4 h-4" />, 
    variant: 'idle', 
    label: 'Pending',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  Approved: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    variant: 'warning', 
    label: 'Approved',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  Processing: { 
    icon: <RefreshCw className="w-4 h-4" />, 
    variant: 'warning', 
    label: 'Processing',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  Completed: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    variant: 'active', 
    label: 'Completed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  Failed: { 
    icon: <AlertCircle className="w-4 h-4" />, 
    variant: 'alert', 
    label: 'Failed',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
};

export function PayoutCard({ settlement, onApprove, onHold, className }: PayoutCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = statusConfig[settlement.status];
  const isActionable = settlement.status === 'Pending' || settlement.status === 'Approved';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4",
        "hover:border-white/20 hover:from-white/10 hover:to-white/5 transition-all duration-200",
        className
      )}
    >
      {/* Status indicator stripe */}
      <div className={cn(
        "absolute left-0 top-4 bottom-4 w-1 rounded-full",
        config.bgColor.replace('/10', '')
      )} />

      <div className="pl-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">
                {settlement.driverId}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {settlement.settlementId}
              </p>
            </div>
          </div>
          <Badge variant={config.variant} className={cn("flex items-center gap-1", config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        </div>

        {/* Amount */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">
              {formatCurrency(settlement.totals.netPayable)}
            </span>
            <span className="text-sm text-gray-500">net payable</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <span>Gross: {formatCurrency(settlement.totals.grossEarnings)}</span>
            <span className="text-red-400">- {formatCurrency(settlement.totals.deductions)}</span>
          </div>
        </div>

        {/* Period & Payout Info */}
        <div className="grid grid-cols-2 gap-3 mt-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">
              {formatDate(settlement.period.startDate)} - {formatDate(settlement.period.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">
              {settlement.payout.method}
            </span>
          </div>
          {settlement.payout.account && (
            <div className="flex items-center gap-2 text-sm">
              <Banknote className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400 font-mono">
                {settlement.payout.account}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">
              Scheduled: {formatDate(settlement.payout.scheduledDate)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {isActionable && isHovered && (
          <div className="flex items-center gap-2 mt-4 animate-in fade-in duration-200">
            <Button
              variant="primary"
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={() => onApprove?.(settlement)}
              className="flex-1"
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={() => onHold?.(settlement)}
              className="flex-1"
            >
              Hold
            </Button>
          </div>
        )}

        {/* Completed info */}
        {settlement.status === 'Completed' && settlement.payout.completedDate && (
          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>Completed: {formatDate(settlement.payout.completedDate)}</span>
              {settlement.payout.referenceNumber && (
                <span className="font-mono">{settlement.payout.referenceNumber}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PayoutCard;
