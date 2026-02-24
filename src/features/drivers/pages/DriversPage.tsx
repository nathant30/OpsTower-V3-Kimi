import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DriversBatchActions } from '@/components/batch';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { useKeyboardShortcuts, CommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useDrivers, useBulkUpdateDriverStatus, type DriversFilters } from '@/features/drivers/hooks/useDrivers';
import { TrustScoreBadge } from '@/features/drivers/components/TrustScoreCard';
import type { Driver, DriverStatus } from '@/types/domain.types';
import { showSuccess, showError, showInfo } from '@/lib/stores/ui.store';
import { cn } from '@/lib/utils/cn';
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  RefreshCw,
  X,
  Users,
  Car,
  TrendingUp,
  AlertCircle,
  Phone,
  Award,
  TrendingDown,
  Clock,
  MapPin,
  Activity,
} from 'lucide-react';

// ==================== STATUS CONFIGURATION ====================

const STATUS_CONFIG: Record<DriverStatus, { color: string; bgColor: string; label: string; dotColor: string }> = {
  Active: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20', 
    label: 'Active',
    dotColor: 'bg-green-500'
  },
  Idle: { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/20', 
    label: 'Idle',
    dotColor: 'bg-amber-500'
  },
  Offline: { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-500/20', 
    label: 'Offline',
    dotColor: 'bg-gray-500'
  },
  Suspended: { 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/20', 
    label: 'Suspended',
    dotColor: 'bg-red-500'
  },
  Deactivated: { 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-600/20', 
    label: 'Deactivated',
    dotColor: 'bg-gray-600'
  },
  Pending: { 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20', 
    label: 'Pending',
    dotColor: 'bg-orange-500'
  },
};

const ONLINE_STATUS_CONFIG: Record<string, { dotColor: string; label: string }> = {
  Online: { dotColor: 'bg-green-500', label: 'Online' },
  OnTrip: { dotColor: 'bg-blue-500', label: 'On Trip' },
  OnBreak: { dotColor: 'bg-amber-500', label: 'On Break' },
  Offline: { dotColor: 'bg-gray-500', label: 'Offline' },
};

// ==================== KPI RIBBON COMPONENT ====================

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  isLoading?: boolean;
}

function KpiCard({ title, value, subtext, trend, icon, color, isLoading }: KpiCardProps) {
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
      "relative h-24 rounded-xl border bg-gradient-to-br p-3 sm:p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{subtext}</p>
          )}
          {trend !== undefined && (
            <p className={cn(
              "text-[10px] sm:text-xs mt-1 font-medium",
              trend >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {trend >= 0 ? '+' : ''}{trend}% <span className="text-gray-500">vs yesterday</span>
            </p>
          )}
        </div>
        
        <div className={cn(
          "p-2 sm:p-2.5 rounded-lg bg-current/10 shrink-0",
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

interface KpiRibbonProps {
  stats: {
    total: number;
    online: number;
    onTrip: number;
    idleOffline: number;
    suspended: number;
  };
  isLoading?: boolean;
}

function KpiRibbon({ stats, isLoading }: KpiRibbonProps) {
  const kpiData = [
    {
      title: 'Total',
      fullTitle: 'Total Drivers',
      value: stats.total,
      subtext: `${stats.online} online`,
      fullSubtext: `${stats.online} currently online`,
      trend: 5.2,
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Active',
      fullTitle: 'Online/Active',
      value: stats.online,
      subtext: `${stats.onTrip} on trip`,
      fullSubtext: `${stats.onTrip} on trip`,
      trend: 8.1,
      icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'green' as const,
    },
    {
      title: 'On Trip',
      fullTitle: 'On Trip',
      value: stats.onTrip,
      subtext: 'Active',
      fullSubtext: 'Active deliveries',
      icon: <Car className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'purple' as const,
    },
    {
      title: 'Idle',
      fullTitle: 'Idle/Offline',
      value: stats.idleOffline,
      subtext: 'Inactive',
      fullSubtext: 'Not currently active',
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'amber' as const,
    },
    {
      title: 'Suspended',
      fullTitle: 'Suspended',
      value: stats.suspended,
      subtext: 'Attention',
      fullSubtext: 'Require attention',
      trend: -12.5,
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'red' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard 
          key={index} 
          {...kpi} 
          title={kpi.title}
          subtext={kpi.subtext}
          isLoading={isLoading} 
        />
      ))}
    </div>
  );
}

// ==================== DRIVER CARD COMPONENT ====================

interface DriverCardProps {
  driver: Driver;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  rank?: number;
}

function DriverCard({ driver, onClick, isSelected, onSelect, rank }: DriverCardProps) {
  const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`;
  const statusConfig = STATUS_CONFIG[driver.status];
  const onlineConfig = ONLINE_STATUS_CONFIG[driver.onlineStatus] || ONLINE_STATUS_CONFIG.Offline;
  
  // Get trend based on trust score (mock logic)
  const trend = driver.trustScore.overall >= 85 ? 'up' : driver.trustScore.overall < 70 ? 'down' : 'stable';
  
  // Rank colors for top 3
  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-gray-300',
    3: 'text-amber-600',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking checkbox
    if ((e.target as HTMLElement).closest('.driver-checkbox')) {
      return;
    }
    onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative bg-[#12121a] border border-white/10 rounded-xl p-3 sm:p-4 cursor-pointer",
        "transition-all duration-200 group hover:border-white/20 hover:bg-white/[0.02]",
        isSelected && "border-blue-500/50 bg-blue-500/5"
      )}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="driver-checkbox absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 min-w-[16px] min-h-[16px] rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
          />
        </div>
      )}

      {/* Header - Avatar and Basic Info */}
      <div className="flex items-start gap-3 pl-7">
        {/* Avatar with Rank */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            {driver.personalInfo.avatar || fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          {/* Online Status Dot */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-[#12121a]",
            onlineConfig.dotColor
          )} />
          
          {/* Rank Badge (if provided) */}
          {rank && rank <= 3 && (
            <div className={cn(
              "absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center",
              rankColors[rank]
            )}>
              <Award className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Name and ID */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {fullName}
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 font-mono">{driver.driverId}</p>
          
          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
            <span className={cn(
              "px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-medium",
              statusConfig.bgColor,
              statusConfig.color
            )}>
              {driver.status}
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:inline">
              {onlineConfig.label}
            </span>
          </div>
        </div>

        {/* Trust Score */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <TrustScoreBadge score={driver.trustScore.overall} showLabel={false} />
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 hidden sm:block">Trust</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-3 sm:mt-4 pt-3 border-t border-white/5">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold text-white">
            ₱{Math.round(driver.earnings.averagePerHour)}
          </p>
          <p className="text-[10px] text-gray-500">/hr</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-xs sm:text-sm font-semibold text-white">
            {driver.performance.totalTrips.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500">Trips</p>
        </div>
        <div className="text-center border-l border-white/5">
          <div className="flex items-center justify-center gap-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            <p className="text-xs sm:text-sm font-semibold text-yellow-400">
              {driver.performance.averageRating.toFixed(1)}★
            </p>
          </div>
          <p className="text-[10px] text-gray-500">Rating</p>
        </div>
      </div>

      {/* Hover Actions - Always visible on mobile, hover on desktop */}
      <div className={cn(
        "inset-x-0 bottom-0 flex gap-1 p-2 rounded-b-xl",
        "sm:opacity-0 sm:group-hover:opacity-100 sm:absolute sm:bg-gradient-to-t sm:from-black/80 sm:to-transparent",
        "opacity-100 relative mt-2 sm:mt-0"
      )}>
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="flex-1 px-2 py-2 sm:py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors min-h-[36px] sm:min-h-0"
        >
          <span className="hidden sm:inline">View Profile</span>
          <span className="sm:hidden">View</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="px-2 py-2 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded transition-colors min-h-[36px] sm:min-h-0 min-w-[44px] flex items-center justify-center"
          aria-label="Call driver"
        >
          <Phone className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ==================== EMPTY STATE COMPONENT ====================

function EmptyState({ 
  searchQuery, 
  onClearFilters 
}: { 
  searchQuery: string; 
  onClearFilters: () => void;
}) {
  return (
    <div className="col-span-full py-16 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
        {searchQuery ? 'No drivers found' : 'No drivers available'}
      </h3>
      <p className="text-sm text-gray-500 mb-4 px-4">
        {searchQuery 
          ? `No drivers match "${searchQuery}". Try adjusting your filters.`
          : 'Get started by adding your first driver to the fleet.'
        }
      </p>
      {searchQuery && (
        <Button variant="secondary" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

// ==================== LOADING SKELETON ====================

function DriverCardSkeleton() {
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 sm:p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-5 bg-white/10 rounded w-16" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
        <div className="h-6 bg-white/10 rounded" />
        <div className="h-6 bg-white/10 rounded" />
        <div className="h-6 bg-white/10 rounded" />
      </div>
    </div>
  );
}

// ==================== MAP PLACEHOLDER ====================

function DriverLocationsMap() {
  return (
    <div className="h-full bg-[#12121a] border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="p-3 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-xpress-text-primary">Driver Locations</h3>
          <p className="text-xs text-xpress-text-muted">Real-time fleet positions</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-400">On Trip</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-xs text-gray-400">Offline</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative bg-gradient-to-br from-[#1a1a2e] to-[#12121a] min-h-[200px]">
        {/* Map placeholder content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Map view coming soon</p>
            <p className="text-xs text-gray-600 mt-1">Track driver locations in real-time</p>
          </div>
        </div>
        {/* Simulated driver dots on map */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30 animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-gray-500" />
        <div className="absolute bottom-1/4 right-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function DriversPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_viewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters state
  const [filters, setFilters] = useState<DriversFilters>({});

  // Fetch drivers
  const { data: driversResponse, isLoading, error, refetch, isFetching } = useDrivers(filters);
  const drivers = driversResponse?.items ?? [];
  
  // Bulk update mutation
  const bulkUpdateMutation = useBulkUpdateDriverStatus();

  // Filter drivers by search query
  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    const query = searchQuery.toLowerCase();
    return drivers.filter((driver: Driver) => {
      const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`.toLowerCase();
      const phone = driver.personalInfo.phone;
      const driverId = driver.driverId.toLowerCase();
      
      return fullName.includes(query) || 
             phone.includes(query) || 
             driverId.includes(query);
    });
  }, [drivers, searchQuery]);

  // Batch selection hook
  const selection = useBatchSelection({
    items: filteredDrivers,
    getItemId: (driver) => driver.driverId,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      CommonShortcuts.search(() => {
        searchInputRef.current?.focus();
      }),
      CommonShortcuts.refresh(() => {
        handleRefresh();
      }),
      CommonShortcuts.help(() => {
        setShowHelp(true);
      }),
      CommonShortcuts.selectAll(() => {
        selection.selectAll();
      }),
      CommonShortcuts.deselectAll(() => {
        selection.deselectAll();
      }),
      {
        key: '/',
        handler: () => {
          searchInputRef.current?.focus();
        },
        allowInInput: false,
      },
      {
        key: 'Escape',
        handler: () => {
          if (showHelp) {
            setShowHelp(false);
          } else if (showMessageModal) {
            setShowMessageModal(false);
          } else if (selection.hasSelection) {
            selection.deselectAll();
          } else if (searchQuery) {
            setSearchQuery('');
          }
        },
        allowInInput: true,
      },
    ],
  });

  // Stats for KPI ribbon
  const stats = useMemo(() => {
    const total = drivers.length;
    const online = drivers.filter((d: Driver) => d.onlineStatus === 'Online' || d.onlineStatus === 'OnTrip').length;
    const onTrip = drivers.filter((d: Driver) => d.onlineStatus === 'OnTrip').length;
    const idleOffline = drivers.filter((d: Driver) => d.onlineStatus === 'Offline' || d.onlineStatus === 'OnBreak').length;
    const suspended = drivers.filter((d: Driver) => d.status === 'Suspended').length;
    
    return { total, online, onTrip, idleOffline, suspended };
  }, [drivers]);

  const activeFiltersCount = useMemo(() => 
    (filters.status?.length || 0) + 
    (filters.minTrustScore !== undefined ? 1 : 0) +
    (filters.zone ? 1 : 0) +
    (filters.hasVehicle !== undefined ? 1 : 0),
  [filters]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastUpdated(new Date());
    showInfo('Refreshing drivers...');
  }, [refetch]);

  // Format last updated time
  const lastUpdatedText = useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }, [lastUpdated]);

  // Batch action handlers
  const handleBulkSuspend = useCallback(async () => {
    try {
      await bulkUpdateMutation.mutateAsync({
        driverIds: selection.selectedIds,
        status: 'Suspended',
        reason: 'Bulk suspension from admin panel',
      });
      showSuccess(`Suspended ${selection.selectedCount} drivers`);
      selection.deselectAll();
    } catch (error) {
      showError('Failed to suspend drivers');
    }
  }, [selection, bulkUpdateMutation]);

  const handleBulkMessage = useCallback(() => {
    setShowMessageModal(true);
  }, [selection]);

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    showSuccess(`Message sent to ${selection.selectedCount} driver(s)`);
    setShowMessageModal(false);
    setMessageText('');
    selection.deselectAll();
  }, [selection, messageText]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 px-4">
        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">Failed to load drivers</h2>
        <p className="text-gray-400 mb-4 text-center">There was an error loading the driver data.</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-xpress-text-primary">Driver Management</h1>
          <p className="text-sm text-xpress-text-muted">
            Manage drivers and performance
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Last updated indicator - hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-xpress-text-muted">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdatedText}</span>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              'flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm',
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

          {/* Add Driver button */}
          <Button 
            variant="primary" 
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/drivers/new')}
            className="min-h-[44px]"
          >
            <span className="hidden sm:inline">Add Driver</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* KPI Ribbon - 5 cards */}
      <KpiRibbon stats={stats} isLoading={isLoading} />

      {/* Loading indicator for background refresh */}
      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-xpress-text-muted animate-pulse">
          <div className="w-2 h-2 bg-xpress-accent-blue rounded-full" />
          <span>Syncing data...</span>
        </div>
      )}

      {/* Main Content: Responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: Search, Filters, Driver Grid (full width on mobile, 60% on desktop) */}
        <div className="w-full lg:w-[60%] flex flex-col min-h-0 overflow-hidden gap-4">
          {/* Search and Filters Toolbar */}
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder="Search drivers... (Press / to focus)"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="bg-[#12121a] border-white/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Chips and Actions Row - Scrollable on mobile */}
            <div className="flex items-center gap-2">
              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 scrollbar-thin scrollbar-thumb-xpress-border scrollbar-track-transparent">
                {(['Active', 'Idle', 'Offline', 'Suspended', 'Pending'] as DriverStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        status: prev.status?.includes(status)
                          ? prev.status.filter(s => s !== status)
                          : [...(prev.status || []), status],
                      }));
                    }}
                    className={cn(
                      'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap min-h-[32px]',
                      filters.status?.includes(status)
                        ? STATUS_CONFIG[status].bgColor + ' ' + STATUS_CONFIG[status].color + ' ring-1 ring-current'
                        : 'bg-[#12121a] border border-white/10 text-gray-400 hover:border-white/20'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Filters Button */}
              <Button
                variant={showFilters ? 'primary' : 'secondary'}
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0 min-h-[36px]"
              >
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500/20 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Help Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm bg-[#12121a] border border-white/10 text-gray-400 hover:text-white transition-colors min-h-[36px] min-w-[36px]"
                title="Keyboard shortcuts (?)"
              >
                ?
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 sm:p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Advanced Filters</h4>
                <button
                  onClick={() => setFilters({})}
                  className="text-xs text-blue-400 hover:text-blue-300 min-h-[32px] px-2"
                >
                  Reset all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Trust Score Filter */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">
                    Min Trust Score: <span className="text-white">{filters.minTrustScore ?? 0}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minTrustScore ?? 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFilters(prev => ({
                        ...prev,
                        minTrustScore: value > 0 ? value : undefined,
                      }));
                    }}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Zone Filter */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Zone</label>
                  <select
                    value={filters.zone || ''}
                    onChange={(e) => {
                      setFilters(prev => ({
                        ...prev,
                        zone: e.target.value || undefined,
                      }));
                    }}
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 min-h-[40px]"
                  >
                    <option value="" className="bg-[#12121a]">All Zones</option>
                    <option value="Makati" className="bg-[#12121a]">Makati</option>
                    <option value="Manila" className="bg-[#12121a]">Manila</option>
                    <option value="Quezon City" className="bg-[#12121a]">Quezon City</option>
                    <option value="Taguig" className="bg-[#12121a]">Taguig</option>
                    <option value="Pasig" className="bg-[#12121a]">Pasig</option>
                  </select>
                </div>

                {/* Vehicle Filter */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Vehicle Assignment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          hasVehicle: prev.hasVehicle === true ? undefined : true,
                        }));
                      }}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px]',
                        filters.hasVehicle === true
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-black/20 border border-white/10 text-gray-400 hover:border-white/20'
                      )}
                    >
                      Assigned
                    </button>
                    <button
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          hasVehicle: prev.hasVehicle === false ? undefined : false,
                        }));
                      }}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px]',
                        filters.hasVehicle === false
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-black/20 border border-white/10 text-gray-400 hover:border-white/20'
                      )}
                    >
                      Unassigned
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400">
              Showing <span className="text-white font-medium">{filteredDrivers.length}</span> of{' '}
              <span className="text-white font-medium">{drivers.length}</span> drivers
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 min-h-[32px] px-2"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>

          {/* Driver Grid */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DriverCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <EmptyState searchQuery={searchQuery} onClearFilters={clearAllFilters} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {filteredDrivers.map((driver, index) => (
                  <DriverCard
                    key={driver.driverId}
                    driver={driver}
                    rank={index < 3 ? index + 1 : undefined}
                    isSelected={selection.isSelected(driver.driverId)}
                    onSelect={() => selection.toggleSelection(driver.driverId)}
                    onClick={() => navigate(`/drivers/${driver.driverId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Map (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:flex w-[40%] flex-col min-h-0 overflow-hidden">
          <DriverLocationsMap />
        </div>
      </div>

      {/* Batch Action Bar */}
      {selection.hasSelection && (
        <DriversBatchActions
          selectedCount={selection.selectedCount}
          totalCount={filteredDrivers.length}
          isAllSelected={selection.isAllSelected}
          onClear={selection.deselectAll}
          onSelectAll={selection.selectAll}
          onBulkSuspend={handleBulkSuspend}
          onBulkMessage={handleBulkMessage}
          isLoading={bulkUpdateMutation.isPending}
        />
      )}

      {/* Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Send Message"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Sending to <span className="text-white font-medium">{selection.selectedCount}</span> driver(s)
          </p>
          <textarea
            className="w-full h-32 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Enter your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowMessageModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              Send Message
            </Button>
          </div>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Keyboard Shortcuts"
        size="sm"
      >
        <div className="space-y-2 text-sm">
          <ShortcutItem keyName="/" description="Focus search" />
          <ShortcutItem keyName="R" description="Refresh data" />
          <ShortcutItem keyName="Ctrl + A" description="Select all visible" />
          <ShortcutItem keyName="Ctrl + D" description="Deselect all" />
          <ShortcutItem keyName="Esc" description="Close / Cancel / Clear" />
          <ShortcutItem keyName="?" description="Show this help" />
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Tip: Hold Shift and click to select a range of drivers
          </p>
        </div>
      </Modal>
    </div>
  );
}

// Helper component for keyboard shortcuts
function ShortcutItem({ keyName, description }: { keyName: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono min-w-[80px] text-center">
        {keyName}
      </kbd>
      <span className="text-gray-400">{description}</span>
    </div>
  );
}
