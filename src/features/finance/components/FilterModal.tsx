import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { TransactionType, TransactionStatus } from '@/types/domain.types';
import { 
  Calendar, 
  CreditCard, 
  Truck, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  MinusCircle, 
  DollarSign,
  X,
  RotateCcw,
  Filter
} from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export interface FilterState {
  transactionTypes: TransactionType[];
  statuses: TransactionStatus[];
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

const transactionTypes: Array<{ value: TransactionType; label: string; icon: React.ReactNode; color: string }> = [
  { value: 'OrderPayment', label: 'Order Payment', icon: <CreditCard className="w-4 h-4" />, color: 'text-blue-400' },
  { value: 'DriverEarnings', label: 'Driver Earnings', icon: <Truck className="w-4 h-4" />, color: 'text-green-400' },
  { value: 'Commission', label: 'Commission', icon: <FileText className="w-4 h-4" />, color: 'text-purple-400' },
  { value: 'Payout', label: 'Payout', icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-amber-400' },
  { value: 'TopUp', label: 'Top Up', icon: <ArrowDownLeft className="w-4 h-4" />, color: 'text-cyan-400' },
  { value: 'Refund', label: 'Refund', icon: <RefreshCcw className="w-4 h-4" />, color: 'text-red-400' },
  { value: 'Adjustment', label: 'Adjustment', icon: <MinusCircle className="w-4 h-4" />, color: 'text-gray-400' },
  { value: 'Fee', label: 'Fee', icon: <DollarSign className="w-4 h-4" />, color: 'text-gray-500' },
];

const statusOptions: Array<{ value: TransactionStatus; label: string; variant: 'active' | 'idle' | 'alert' | 'warning' }> = [
  { value: 'Completed', label: 'Completed', variant: 'active' },
  { value: 'Pending', label: 'Pending', variant: 'idle' },
  { value: 'Failed', label: 'Failed', variant: 'alert' },
  { value: 'Reversed', label: 'Reversed', variant: 'warning' },
];

const presetRanges = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', days: -1 },
];

export function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    transactionTypes: initialFilters?.transactionTypes || [],
    statuses: initialFilters?.statuses || [],
    startDate: initialFilters?.startDate || '',
    endDate: initialFilters?.endDate || '',
    minAmount: initialFilters?.minAmount || '',
    maxAmount: initialFilters?.maxAmount || '',
  });

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen && initialFilters) {
      setFilters({
        transactionTypes: initialFilters.transactionTypes || [],
        statuses: initialFilters.statuses || [],
        startDate: initialFilters.startDate || '',
        endDate: initialFilters.endDate || '',
        minAmount: initialFilters.minAmount || '',
        maxAmount: initialFilters.maxAmount || '',
      });
    }
  }, [isOpen, initialFilters]);

  const toggleType = (type: TransactionType) => {
    setFilters(prev => ({
      ...prev,
      transactionTypes: prev.transactionTypes.includes(type)
        ? prev.transactionTypes.filter(t => t !== type)
        : [...prev.transactionTypes, type]
    }));
  };

  const toggleStatus = (status: TransactionStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  const handlePresetRange = (days: number) => {
    const end = new Date();
    let start: Date;
    
    if (days === -1) {
      // This month
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else {
      start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    }

    setFilters(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  };

  const handleClear = () => {
    setFilters({
      transactionTypes: [],
      statuses: [],
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.transactionTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <span>Filter Transactions</span>
          {activeCount > 0 && (
            <Badge variant="default" className="ml-2">
              {activeCount} active
            </Badge>
          )}
        </div>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="ghost" 
            onClick={handleClear}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {presetRanges.map(range => (
              <button
                key={range.label}
                onClick={() => handlePresetRange(range.days)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Transaction Types */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-3 block">
            Transaction Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {transactionTypes.map(type => (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                  filters.transactionTypes.includes(type.value)
                    ? "bg-blue-500/20 border border-blue-500/30 text-white"
                    : "bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className={type.color}>{type.icon}</span>
                <span>{type.label}</span>
                {filters.transactionTypes.includes(type.value) && (
                  <X className="w-3 h-3 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-3 block">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => toggleStatus(status.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                  filters.statuses.includes(status.value)
                    ? "bg-white/10 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
                {filters.statuses.includes(status.value) && (
                  <X className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-3 block">
            Amount Range (₱)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
              <Input
                type="number"
                placeholder="∞"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default FilterModal;
