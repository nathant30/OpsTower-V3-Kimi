import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VehicleTable } from '@/features/fleet/components/VehicleTable';
import { BulkActions } from '@/features/fleet/components/BulkActions';
import { VehicleCard } from '@/features/fleet/components/VehicleCard';
import { XpressButton, XpressInput } from '@/components/ui';
import { useVehicles, useBulkUpdateVehicleStatus } from '@/features/fleet/hooks/useVehicles';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { useKeyboardShortcuts, CommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { VehicleFiltersState } from '@/features/fleet/components/VehicleFilters';
import type { Vehicle, VehicleStatus } from '@/types/domain.types';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  HelpCircle, 
  Search,
  Car,
  CheckCircle2,
  Wrench,
  PowerOff,
  User,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';
import { showSuccess, showError, showInfo } from '@/lib/stores/ui.store';
import { cn } from '@/lib/utils/cn';
import { TacticalMap } from '@/features/dashboard/components/TacticalMap';

// ==================== Types ====================
type FleetTab = 'all' | 'active' | 'maintenance' | 'offline';

// ==================== KPI Card Component ====================
interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  isLoading?: boolean;
}

function KpiCard({ title, value, subtext, icon, color, isLoading }: KpiCardProps) {
  const colorStyles = {
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-orange-500/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
  };

  if (isLoading) {
    return (
      <div className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div className={cn(
      "relative h-24 rounded-xl border bg-gradient-to-br p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg bg-current/10 shrink-0",
          color === 'green' && 'text-green-400',
          color === 'blue' && 'text-blue-400',
          color === 'amber' && 'text-amber-400',
          color === 'red' && 'text-red-400',
          color === 'purple' && 'text-purple-400'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ==================== Pagination Component ====================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#12121a] border-t border-white/10">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-[#0a0a0f] border border-white/10 rounded-lg px-2 py-1 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <XpressButton
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </XpressButton>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                  currentPage === pageNum 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <XpressButton
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </XpressButton>
      </div>
    </div>
  );
}

// ==================== Help Modal ====================
function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-[#12121a] border border-white/10 rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Keyboard Shortcuts
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">Search</span>
            <kbd className="px-2 py-1 bg-white/5 rounded text-gray-300">Ctrl+K</kbd>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">Select All</span>
            <kbd className="px-2 py-1 bg-white/5 rounded text-gray-300">Ctrl+A</kbd>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">Deselect All</span>
            <kbd className="px-2 py-1 bg-white/5 rounded text-gray-300">Ctrl+D</kbd>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">Close / Cancel</span>
            <kbd className="px-2 py-1 bg-white/5 rounded text-gray-300">Esc</kbd>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Help</span>
            <kbd className="px-2 py-1 bg-white/5 rounded text-gray-300">?</kbd>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
          <XpressButton variant="primary" onClick={onClose}>Got it</XpressButton>
        </div>
      </div>
    </div>
  );
}

// ==================== Time Ago Helper ====================
function useTimeAgo(timestamp: number): string {
  const [now, setNow] = useState(() => Date.now());
  
  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  return useMemo(() => {
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [now, timestamp]);
}

// ==================== Main Fleet Page ====================
export default function FleetPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FleetTab>('all');
  const [filters, setFilters] = useState<VehicleFiltersState>({
    searchQuery: '',
    status: [],
    type: [],
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(() => Date.now());

  // Compute status filter from active tab
  const statusFilter = useMemo((): VehicleStatus[] | undefined => {
    switch (activeTab) {
      case 'active':
        return ['Active'];
      case 'maintenance':
        return ['Maintenance'];
      case 'offline':
        return ['Offline'];
      default:
        return undefined;
    }
  }, [activeTab]);

  // Fetch vehicles with filters
  const { data: vehiclesData, isLoading, refetch, isFetching } = useVehicles({
    searchQuery: filters.searchQuery || undefined,
    status: statusFilter,
    type: filters.type.length > 0 ? filters.type : undefined,
    pageNumber: currentPage,
    pageSize,
  });

  const vehicles = vehiclesData?.items || [];
  const totalVehicles = vehiclesData?.total || 0;
  const totalPages = vehiclesData?.totalPages || 1;

  // Calculate stats from current data
  const stats = useMemo(() => {
    return {
      total: totalVehicles,
      active: vehicles.filter(v => v.status === 'Active').length,
      maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
      offline: vehicles.filter(v => v.status === 'Offline').length,
      unassigned: vehicles.filter(v => !v.assignedDriver).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiclesData, totalVehicles]);

  // Time ago for refresh indicator
  const lastUpdatedText = useTimeAgo(lastRefreshTime);

  // Batch selection hook
  const selection = useBatchSelection({
    items: vehicles,
    getItemId: (vehicle) => vehicle.vehicleId,
  });

  // Bulk update mutation
  const { mutate: bulkUpdateStatus, isPending: isUpdating } = useBulkUpdateVehicleStatus();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setLastRefreshTime(Date.now());
    await refetch();
  }, [refetch]);

  // Handle bulk status update
  const handleBulkStatusUpdate = useCallback((vehicleIds: string[], status: VehicleStatus, reason?: string) => {
    bulkUpdateStatus(
      { vehicleIds, status, reason },
      {
        onSuccess: (data) => {
          showSuccess(`Successfully updated ${data.updatedCount} vehicle(s) to ${status}`);
          selection.deselectAll();
          refetch();
        },
        onError: (error) => {
          showError(`Failed to update vehicle status: ${error.message}`);
        },
      }
    );
  }, [bulkUpdateStatus, selection, refetch]);

  // Handle row click / card click
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    navigate(`/fleet/${vehicle.vehicleId}`);
  }, [navigate]);

  // Handle view on map
  const handleViewMap = useCallback((vehicle: Vehicle) => {
    showInfo(`Viewing ${vehicle.plateNumber} on map - Feature coming soon`);
    // View on map clicked
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      CommonShortcuts.search(() => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }),
      CommonShortcuts.help(() => setShowHelp(true)),
      CommonShortcuts.selectAll(() => selection.selectAll()),
      CommonShortcuts.deselectAll(() => selection.deselectAll()),
      {
        key: 'r',
        handler: handleRefresh,
      },
      {
        key: 'Escape',
        handler: () => {
          if (showHelp) {
            setShowHelp(false);
          } else if (selection.hasSelection) {
            selection.deselectAll();
          }
        },
        allowInInput: true,
      },
    ],
  });

  // Tab configuration
  const tabs = [
    { id: 'all' as FleetTab, label: 'All', count: stats.total },
    { id: 'active' as FleetTab, label: 'Active', count: stats.active },
    { id: 'maintenance' as FleetTab, label: 'Maintenance', count: stats.maintenance },
    { id: 'offline' as FleetTab, label: 'Offline', count: stats.offline },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-xpress-text-primary">Fleet Management</h1>
          <p className="text-sm text-xpress-text-muted">
            Manage vehicles and assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Last updated indicator */}
          <div className="flex items-center gap-2 text-sm text-xpress-text-muted">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdatedText}</span>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              'bg-xpress-bg-tertiary border border-xpress-border',
              'text-xpress-text-secondary hover:text-xpress-text-primary',
              'transition-colors disabled:opacity-50',
              isFetching && 'cursor-wait'
            )}
            title="Refresh data (R)"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Vehicle Button */}
          <XpressButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {/* Add vehicle clicked */}}
          >
            Add Vehicle
          </XpressButton>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          title="Total Vehicles"
          value={stats.total}
          subtext={`${((stats.active / stats.total) * 100 || 0).toFixed(0)}% utilization`}
          icon={<Car className="w-5 h-5" />}
          color="blue"
          isLoading={isLoading}
        />
        <KpiCard
          title="Active"
          value={stats.active}
          subtext="Online and available"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
          isLoading={isLoading}
        />
        <KpiCard
          title="In Maintenance"
          value={stats.maintenance}
          subtext="Service required"
          icon={<Wrench className="w-5 h-5" />}
          color="red"
          isLoading={isLoading}
        />
        <KpiCard
          title="Offline/Idle"
          value={stats.offline}
          subtext="Not in operation"
          icon={<PowerOff className="w-5 h-5" />}
          color="amber"
          isLoading={isLoading}
        />
        <KpiCard
          title="Unassigned"
          value={stats.unassigned}
          subtext="No driver assigned"
          icon={<User className="w-5 h-5" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Loading indicator for background refresh */}
      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-xpress-text-muted animate-pulse">
          <div className="w-2 h-2 bg-xpress-accent-blue rounded-full" />
          <span>Syncing data...</span>
        </div>
      )}

      {/* Main Content: Responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: Full width on mobile, 60% on desktop */}
        <div className="w-full lg:w-[60%] flex flex-col min-h-0 overflow-hidden bg-[#12121a] rounded-xl border border-white/10">
          {/* Tab Navigation */}
          <div className="border-b border-white/10 px-4">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    activeTab === tab.id 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-white/10 text-gray-500'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <div className="flex-1 max-w-sm">
              <XpressInput
                placeholder="Search vehicles..."
                leftIcon={<Search className="w-4 h-4" />}
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>
            
            <XpressButton
              variant="secondary"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => {/* Filter clicked */}}
            >
              Filters
            </XpressButton>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0a0a0f] rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Help Button */}
            <XpressButton
              variant="ghost"
              size="sm"
              icon={<HelpCircle className="w-4 h-4" />}
              onClick={() => setShowHelp(true)}
            >
              Help
            </XpressButton>
          </div>

          {/* Vehicle Content */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
                  ))
                ) : vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.vehicleId}
                      vehicle={vehicle}
                      onClick={() => handleVehicleClick(vehicle)}
                      onViewMap={() => handleViewMap(vehicle)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Car className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No vehicles found</p>
                    <XpressButton
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => setFilters({ searchQuery: '', status: [], type: [] })}
                    >
                      Clear Filters
                    </XpressButton>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div className="bg-[#0a0a0f] rounded-xl border border-white/10 overflow-hidden">
                <VehicleTable
                  vehicles={vehicles}
                  selectedIds={selection.selectedIds}
                  onSelectionChange={(ids) => {
                    if (typeof ids === 'string') {
                      selection.toggleSelection(ids);
                    } else if (Array.isArray(ids)) {
                      const currentIds = new Set(selection.selectedIds);
                      const newIds = new Set(ids);
                      
                      currentIds.forEach(id => {
                        if (!newIds.has(id)) {
                          selection.deselect(id);
                        }
                      });
                      
                      newIds.forEach(id => {
                        if (!currentIds.has(id)) {
                          selection.select(id);
                        }
                      });
                    }
                  }}
                  onRowClick={handleVehicleClick}
                  loading={isLoading}
                  onViewMap={handleViewMap}
                  onViewDetails={handleVehicleClick}
                />
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalVehicles}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Hidden on mobile, 40% on desktop */}
        <div className="hidden lg:flex w-[40%] flex-col min-h-0 overflow-hidden bg-[#12121a] rounded-xl border border-white/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-xpress-text-primary">Vehicle Locations</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-xpress-text-muted">
              <Activity className="w-3 h-3" />
              <span>Live tracking</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-4">
            <TacticalMap />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selection.hasSelection && (
        <BulkActions
          selectedIds={selection.selectedIds}
          onClearSelection={selection.deselectAll}
          onSelectAll={selection.selectAll}
          isAllSelected={selection.isAllSelected}
          totalCount={vehicles.length}
          onStatusUpdate={handleBulkStatusUpdate}
          isLoading={isUpdating}
        />
      )}

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
