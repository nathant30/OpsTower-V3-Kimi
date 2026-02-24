import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { VehicleStatus, VehicleType } from '@/types/domain.types';
import { 
  Search, 
  Filter, 
  X, 
  Car, 
  Bike, 
  Package, 
  Check
} from 'lucide-react';

export interface VehicleFiltersState {
  searchQuery: string;
  status: VehicleStatus[];
  type: VehicleType[];
}

export interface VehicleFiltersProps {
  filters: VehicleFiltersState;
  onFiltersChange: (filters: VehicleFiltersState) => void;
}

const statusOptions: { value: VehicleStatus; label: string; color: string }[] = [
  { value: 'Active', label: 'Active', color: 'bg-emerald-500' },
  { value: 'Idle', label: 'Idle', color: 'bg-amber-500' },
  { value: 'Maintenance', label: 'Maintenance', color: 'bg-red-500' },
  { value: 'Offline', label: 'Offline', color: 'bg-gray-500' },
  { value: 'Decommissioned', label: 'Decommissioned', color: 'bg-purple-500' },
];

const typeOptions: { value: VehicleType; label: string; icon: React.ReactNode }[] = [
  { value: 'Taxi', label: 'Taxi', icon: <Car className="w-4 h-4" /> },
  { value: 'Moto', label: 'Motorcycle', icon: <Bike className="w-4 h-4" /> },
  { value: 'Delivery', label: 'Delivery', icon: <Package className="w-4 h-4" /> },
  { value: 'Idle', label: 'Idle', icon: <Car className="w-4 h-4" /> },
  { value: 'Urban Demand', label: 'Urban Demand', icon: <Car className="w-4 h-4" /> },
];

export function VehicleFilters({ filters, onFiltersChange }: VehicleFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onFiltersChange({ ...filters, searchQuery: value });
  }, [filters, onFiltersChange]);

  const toggleStatus = useCallback((status: VehicleStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  }, [filters, onFiltersChange]);

  const toggleType = useCallback((type: VehicleType) => {
    const newType = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    onFiltersChange({ ...filters, type: newType });
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setLocalSearch('');
    onFiltersChange({
      searchQuery: '',
      status: [],
      type: [],
    });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0 || filters.searchQuery;
  const activeFilterCount = filters.status.length + filters.type.length;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by plate, make, or model..."
            value={localSearch}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" />}
            fullWidth
          />
        </div>
        <Button 
          variant={showFilters ? 'primary' : 'secondary'}
          icon={<Filter className="w-4 h-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-xpress-accent-blue/20 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            icon={<X className="w-4 h-4" />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="xpress-card p-4 space-y-4 animate-in fade-in duration-200">
          {/* Status Filters */}
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">
              Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isSelected = filters.status.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleStatus(option.value)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-200 border
                      ${isSelected 
                        ? 'bg-xpress-accent-blue/20 border-xpress-accent-blue text-xpress-accent-blue' 
                        : 'bg-xpress-bg-secondary border-xpress-border text-xpress-text-secondary hover:border-xpress-text-muted'}
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full ${option.color}`} />
                    {option.label}
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filters */}
          <div>
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">
              Vehicle Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => {
                const isSelected = filters.type.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleType(option.value)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-200 border
                      ${isSelected 
                        ? 'bg-xpress-accent-blue/20 border-xpress-accent-blue text-xpress-accent-blue' 
                        : 'bg-xpress-bg-secondary border-xpress-border text-xpress-text-secondary hover:border-xpress-text-muted'}
                    `}
                  >
                    {option.icon}
                    {option.label}
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-xpress-text-muted">Active filters:</span>
          {filters.status.map((status) => {
            const option = statusOptions.find(o => o.value === status);
            return (
              <span 
                key={status}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-xpress-accent-blue/10 text-xpress-accent-blue rounded-full text-xs"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${option?.color}`} />
                {option?.label}
                <button 
                  onClick={() => toggleStatus(status)}
                  className="hover:text-xpress-accent-blue/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          {filters.type.map((type) => {
            const option = typeOptions.find(o => o.value === type);
            return (
              <span 
                key={type}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-xpress-accent-blue/10 text-xpress-accent-blue rounded-full text-xs"
              >
                {option?.icon}
                {option?.label}
                <button 
                  onClick={() => toggleType(type)}
                  className="hover:text-xpress-accent-blue/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-xpress-bg-elevated text-xpress-text-secondary rounded-full text-xs">
              Search: "{filters.searchQuery}"
              <button 
                onClick={() => {
                  setLocalSearch('');
                  onFiltersChange({ ...filters, searchQuery: '' });
                }}
                className="hover:text-xpress-text-primary"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default VehicleFilters;
