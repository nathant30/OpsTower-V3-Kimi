import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { OrderStatus, ServiceType } from '@/types/domain.types';
import { Search, Filter, X, Calendar, ChevronDown } from 'lucide-react';
import { formatDate, startOfDay, endOfDay, startOfWeek, startOfMonth } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

export interface OrderFiltersState {
  searchQuery: string;
  statuses: OrderStatus[];
  serviceTypes: ServiceType[];
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom' | null;
  startDate: string;
  endDate: string;
  priority: ('Normal' | 'High' | 'Urgent')[];
}

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFiltersChange: (filters: OrderFiltersState) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  resultCount?: number;
}

const allStatuses: OrderStatus[] = [
  'Searching',
  'Assigned',
  'Accepted',
  'EnRoute',
  'Arrived',
  'OnTrip',
  'Completed',
  'Cancelled',
  'Scheduled',
  'Pending',
];

const allServiceTypes: ServiceType[] = ['Taxi', 'Moto', 'Delivery', 'Car'];

const allPriorities = ['Normal', 'High', 'Urgent'] as const;

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
] as const;

export function OrderFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  resultCount,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  }, [filters, onFiltersChange]);

  const handleStatusToggle = useCallback((status: OrderStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  }, [filters, onFiltersChange]);

  const handleServiceTypeToggle = useCallback((type: ServiceType) => {
    const newTypes = filters.serviceTypes.includes(type)
      ? filters.serviceTypes.filter((t) => t !== type)
      : [...filters.serviceTypes, type];
    onFiltersChange({ ...filters, serviceTypes: newTypes });
  }, [filters, onFiltersChange]);

  const handlePriorityToggle = useCallback((priority: typeof allPriorities[number]) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    onFiltersChange({ ...filters, priority: newPriorities });
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((range: typeof dateRangeOptions[number]['value']) => {
    let startDate = '';
    let endDate = '';

    const now = new Date();

    switch (range) {
      case 'today':
        startDate = formatDate(startOfDay(now));
        endDate = formatDate(endOfDay(now));
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = formatDate(startOfDay(yesterday));
        endDate = formatDate(endOfDay(yesterday));
        break;
      case 'week':
        startDate = formatDate(startOfWeek(now));
        endDate = formatDate(endOfDay(now));
        break;
      case 'month':
        startDate = formatDate(startOfMonth(now));
        endDate = formatDate(endOfDay(now));
        break;
      case 'custom':
        // Keep existing dates or set defaults
        startDate = filters.startDate || formatDate(startOfDay(now));
        endDate = filters.endDate || formatDate(endOfDay(now));
        break;
    }

    onFiltersChange({
      ...filters,
      dateRange: range,
      startDate,
      endDate,
    });
  }, [filters, onFiltersChange]);

  const activeFiltersCount =
    filters.statuses.length +
    filters.serviceTypes.length +
    filters.priority.length +
    (filters.dateRange ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0 || filters.searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-xl">
          <Input
            placeholder="Search by Order ID, Customer, or Driver..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onApplyFilters();
              }
            }}
          />
        </div>
        <Button
          variant={isExpanded ? 'secondary' : 'ghost'}
          icon={<Filter className="w-4 h-4" />}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="active" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={cn('w-4 h-4 ml-1 transition-transform', isExpanded && 'rotate-180')} />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" icon={<X className="w-4 h-4" />} onClick={onResetFilters}>
            Clear
          </Button>
        )}
        <Button variant="primary" onClick={onApplyFilters}>
          Apply Filters
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="xpress-card p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Order Status</h4>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    filters.statuses.includes(status)
                      ? 'bg-xpress-accent-blue text-white'
                      : 'bg-xpress-bg-secondary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Service Type Filter */}
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Service Type</h4>
            <div className="flex flex-wrap gap-2">
              {allServiceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleServiceTypeToggle(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    filters.serviceTypes.includes(type)
                      ? 'bg-xpress-accent-cyan text-white'
                      : 'bg-xpress-bg-secondary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Priority</h4>
            <div className="flex flex-wrap gap-2">
              {allPriorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityToggle(priority)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    filters.priority.includes(priority)
                      ? priority === 'Urgent'
                        ? 'bg-xpress-status-alert text-white'
                        : priority === 'High'
                        ? 'bg-xpress-status-warning text-white'
                        : 'bg-xpress-status-idle text-white'
                      : 'bg-xpress-bg-secondary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
                  )}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Date Range</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDateRangeChange(option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    filters.dateRange === option.value
                      ? 'bg-xpress-accent-purple text-white'
                      : 'bg-xpress-bg-secondary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs */}
            {filters.dateRange === 'custom' && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1">
                  <label className="text-xs text-xpress-text-muted mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </div>
                <span className="text-xpress-text-muted pt-5">to</span>
                <div className="flex-1">
                  <label className="text-xs text-xpress-text-muted mb-1 block">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Result Count */}
          {resultCount !== undefined && (
            <div className="pt-3 border-t border-xpress-border">
              <p className="text-sm text-xpress-text-muted">
                Showing <span className="text-xpress-text-primary font-medium">{resultCount}</span> orders
                {activeFiltersCount > 0 && (
                  <span> with {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.searchQuery && (
            <Badge variant="default" className="flex items-center gap-1">
              Search: {filters.searchQuery}
              <button onClick={() => handleSearchChange('')} className="hover:text-xpress-accent-red">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.statuses.map((status) => (
            <Badge key={status} variant="default" className="flex items-center gap-1">
              {status}
              <button onClick={() => handleStatusToggle(status)} className="hover:text-xpress-accent-red">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.serviceTypes.map((type) => (
            <Badge key={type} variant="default" className="flex items-center gap-1">
              {type}
              <button onClick={() => handleServiceTypeToggle(type)} className="hover:text-xpress-accent-red">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.priority.map((priority) => (
            <Badge key={priority} variant={priority === 'Urgent' ? 'alert' : priority === 'High' ? 'warning' : 'idle'} className="flex items-center gap-1">
              {priority}
              <button onClick={() => handlePriorityToggle(priority)} className="hover:text-xpress-accent-red">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.dateRange && (
            <Badge variant="default" className="flex items-center gap-1">
              {dateRangeOptions.find((o) => o.value === filters.dateRange)?.label}
              <button onClick={() => onFiltersChange({ ...filters, dateRange: null, startDate: '', endDate: '' })} className="hover:text-xpress-accent-red">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderFilters;
