import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { 
  Calendar, 
  ChevronDown,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

export type DateRange = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange, startDate?: string, endDate?: string) => void;
  className?: string;
}

interface DateRangeOption {
  value: DateRange;
  label: string;
  icon?: React.ReactNode;
}

const dateRangeOptions: DateRangeOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days', icon: <CalendarDays className="w-4 h-4" /> },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month', icon: <CalendarRange className="w-4 h-4" /> },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

export function DateRangeSelector({ value, onChange, className }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const selectedLabel = dateRangeOptions.find(o => o.value === value)?.label || 'Select Range';

  const handleSelect = (range: DateRange) => {
    if (range === 'custom') {
      // Don't close dropdown for custom
      return;
    }
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange('custom', customStart, customEnd);
      setIsOpen(false);
    }
  };

  const getRangeDescription = () => {
    const today = new Date();
    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    switch (value) {
      case 'today':
        return format(today);
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return format(yesterday);
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return `${format(sevenDaysAgo)} - ${format(today)}`;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return `${format(thirtyDaysAgo)} - ${format(today)}`;
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return `${format(startOfMonth)} - ${format(today)}`;
      case 'lastMonth':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return `${format(startOfLastMonth)} - ${format(endOfLastMonth)}`;
      case 'custom':
        if (customStart && customEnd) {
          return `${format(new Date(customStart))} - ${format(new Date(customEnd))}`;
        }
        return 'Custom range';
      default:
        return '';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
          "bg-white/5 border border-white/10 hover:border-white/20 text-white",
          isOpen && "border-blue-500/50 bg-blue-500/10"
        )}
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span>{selectedLabel}</span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400">{getRangeDescription()}</span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            {dateRangeOptions.map((option) => (
              <div key={option.value}>
                <button
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                    value === option.value
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-300 hover:bg-white/5"
                  )}
                >
                  {option.icon || <Calendar className="w-4 h-4 text-gray-500" />}
                  <span>{option.label}</span>
                  {value === option.value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </button>

                {/* Custom range inputs */}
                {option.value === 'custom' && value === 'custom' && isOpen && (
                  <div className="px-4 pb-3 space-y-2 bg-white/5">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">From</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">To</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                      onClick={handleCustomApply}
                      disabled={!customStart || !customEnd}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DateRangeSelector;
