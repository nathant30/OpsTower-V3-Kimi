import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TrustScoreBadge } from './TrustScoreCard';
import type { Driver, DriverStatus } from '@/types/domain.types';
import { Search, Filter, X, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ==================== TYPES ====================

interface DriversTableProps {
  drivers: Driver[];
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (driver: Driver) => void;
}

interface FiltersState {
  status: DriverStatus[];
  minTrustScore?: number;
  maxTrustScore?: number;
  zone?: string;
  hasVehicle?: boolean;
}

// ==================== TABLE COMPONENT ====================

export function DriversTable({
  drivers,
  isLoading = false,
  selectable = true,
  selectedIds,
  onSelectionChange,
  onRowClick,
}: DriversTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    status: [],
  });

  // Filter drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`.toLowerCase();
        const phone = driver.personalInfo.phone;
        const driverId = driver.driverId.toLowerCase();
        
        if (!fullName.includes(query) && 
            !phone.includes(query) && 
            !driverId.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(driver.status)) {
        return false;
      }

      // Trust score filter
      if (filters.minTrustScore !== undefined && 
          driver.trustScore.overall < filters.minTrustScore) {
        return false;
      }
      if (filters.maxTrustScore !== undefined && 
          driver.trustScore.overall > filters.maxTrustScore) {
        return false;
      }

      // Zone filter
      if (filters.zone && 
          driver.geofence?.homeZone !== filters.zone &&
          !driver.geofence?.allowedZones?.includes(filters.zone)) {
        return false;
      }

      // Vehicle filter
      if (filters.hasVehicle !== undefined) {
        const hasVehicle = !!driver.vehicle;
        if (hasVehicle !== filters.hasVehicle) {
          return false;
        }
      }

      return true;
    });
  }, [drivers, searchQuery, filters]);

  // Table columns
  const columns: Column<Driver>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Driver',
      accessor: (row) => `${row.personalInfo.firstName} ${row.personalInfo.lastName}`,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.personalInfo.avatar ? (
            <img
              src={row.personalInfo.avatar}
              alt={String(value)}
              className="w-8 h-8 rounded-full bg-xpress-bg-tertiary"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-xpress-bg-tertiary flex items-center justify-center">
              <User className="w-4 h-4 text-xpress-text-muted" />
            </div>
          )}
          <div>
            <p className="font-medium text-xpress-text-primary">{String(value)}</p>
            <p className="text-xs text-xpress-text-muted">{row.driverId}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Contact',
      accessor: (row) => row.personalInfo.phone,
      render: (value, row) => (
        <div>
          <p className="text-xpress-text-primary">{String(value)}</p>
          <p className="text-xs text-xpress-text-muted truncate max-w-[150px]">
            {row.personalInfo.email}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (value) => <StatusBadge status={String(value) as DriverStatus} />,
      sortable: true,
      width: '120px',
    },
    {
      key: 'onlineStatus',
      header: 'Online',
      accessor: (row) => row.onlineStatus,
      render: (value) => <OnlineStatusBadge status={String(value)} />,
      sortable: true,
      width: '100px',
    },
    {
      key: 'trustScore',
      header: 'Trust Score',
      accessor: (row) => row.trustScore.overall,
      render: (value) => (
        <TrustScoreBadge score={Number(value)} showLabel={false} />
      ),
      align: 'center',
      sortable: true,
      width: '100px',
    },
    {
      key: 'trips',
      header: 'Trips',
      accessor: (row) => row.performance.totalTrips,
      render: (value) => (
        <span className="text-xpress-text-primary">
          {Number(value).toLocaleString()}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '80px',
    },
    {
      key: 'rating',
      header: 'Rating',
      accessor: (row) => row.performance.averageRating,
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <span className="text-xpress-status-idle">★</span>
          <span className={getRatingColor(Number(value))}>
            {Number(value).toFixed(1)}
          </span>
        </div>
      ),
      align: 'center',
      sortable: true,
      width: '80px',
    },
    {
      key: 'earnings',
      header: 'Earnings',
      accessor: (row) => row.earnings.totalEarnings,
      render: (value) => (
        <span className="text-xpress-text-primary">
          ₱{Number(value).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '120px',
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      accessor: (row) => row.vehicle?.plateNumber || '-',
      render: (value) => (
        value !== '-' ? (
          <Badge variant="default">{String(value)}</Badge>
        ) : (
          <span className="text-xpress-text-muted">-</span>
        )
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'zone',
      header: 'Zone',
      accessor: (row) => row.geofence?.homeZone || '-',
      render: (value) => (
        <span className="text-xs text-xpress-text-secondary truncate max-w-[100px] block">
          {String(value)}
        </span>
      ),
      sortable: true,
      width: '100px',
    },
  ], []);

  const handleRowClick = (driver: Driver) => {
    if (onRowClick) {
      onRowClick(driver);
    } else {
      navigate(`/drivers/${driver.driverId}`);
    }
  };

  // Get unique zones for filter
  const zones = useMemo(() => {
    const zoneSet = new Set<string>();
    drivers.forEach(d => {
      if (d.geofence?.homeZone) zoneSet.add(d.geofence.homeZone);
      d.geofence?.allowedZones?.forEach(z => zoneSet.add(z));
    });
    return Array.from(zoneSet).sort();
  }, [drivers]);

  const activeFiltersCount = filters.status.length + 
    (filters.minTrustScore !== undefined ? 1 : 0) +
    (filters.zone ? 1 : 0) +
    (filters.hasVehicle !== undefined ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search drivers by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          size="sm"
          icon={<Filter className="w-4 h-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-xpress-accent-blue/20 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {(searchQuery || activeFiltersCount > 0) && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={() => {
              setSearchQuery('');
              setFilters({ status: [] });
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-xpress-bg-secondary rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-xpress-text-secondary">Filters</h4>
            <button
              onClick={() => setFilters({ status: [] })}
              className="text-xs text-xpress-accent-blue hover:underline"
            >
              Reset all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs text-xpress-text-muted block mb-2">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(['Active', 'Idle', 'Offline', 'Suspended', 'Pending'] as DriverStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        status: prev.status.includes(status)
                          ? prev.status.filter(s => s !== status)
                          : [...prev.status, status],
                      }));
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors',
                      filters.status.includes(status)
                        ? 'bg-xpress-accent-blue text-white'
                        : 'bg-xpress-bg-tertiary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Score Filter */}
            <div>
              <label className="text-xs text-xpress-text-muted block mb-2">Min Trust Score</label>
              <div className="flex items-center gap-2">
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
                  className="flex-1 accent-xpress-accent-blue"
                />
                <span className="text-xs text-xpress-text-primary w-8">
                  {filters.minTrustScore ?? 0}%
                </span>
              </div>
            </div>

            {/* Zone Filter */}
            {zones.length > 0 && (
              <div>
                <label className="text-xs text-xpress-text-muted block mb-2">Zone</label>
                <select
                  value={filters.zone || ''}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      zone: e.target.value || undefined,
                    }));
                  }}
                  className="w-full px-3 py-1.5 bg-xpress-bg-tertiary border border-xpress-border rounded text-sm text-xpress-text-primary focus:outline-none focus:border-xpress-accent-blue"
                >
                  <option value="">All Zones</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Vehicle Filter */}
            <div>
              <label className="text-xs text-xpress-text-muted block mb-2">Vehicle</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      hasVehicle: prev.hasVehicle === true ? undefined : true,
                    }));
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1',
                    filters.hasVehicle === true
                      ? 'bg-xpress-accent-blue text-white'
                      : 'bg-xpress-bg-tertiary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
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
                    'px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1',
                    filters.hasVehicle === false
                      ? 'bg-xpress-accent-blue text-white'
                      : 'bg-xpress-bg-tertiary text-xpress-text-secondary hover:bg-xpress-bg-elevated'
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
        <p className="text-xpress-text-muted">
          Showing {filteredDrivers.length} of {drivers.length} drivers
        </p>
      </div>

      {/* Table */}
      <div className="xpress-card overflow-hidden">
        <Table
          data={filteredDrivers}
          columns={columns}
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          loading={isLoading}
          getRowId={(row) => row.driverId}
          onRowClick={handleRowClick}
          emptyMessage="No drivers found matching your criteria"
        />
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatusBadge({ status }: { status: DriverStatus }) {
  const variants: Record<DriverStatus, 'active' | 'idle' | 'offline' | 'alert' | 'warning'> = {
    Active: 'active',
    Idle: 'idle',
    Offline: 'offline',
    Suspended: 'alert',
    Deactivated: 'offline',
    Pending: 'warning',
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {status}
    </Badge>
  );
}

function OnlineStatusBadge({ status }: { status: string }) {
  const dotColors: Record<string, string> = {
    Online: 'bg-xpress-status-active',
    OnTrip: 'bg-xpress-accent-blue',
    OnBreak: 'bg-xpress-status-idle',
    Offline: 'bg-xpress-text-muted',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', dotColors[status] || 'bg-xpress-text-muted')} />
      <span className="text-xs text-xpress-text-secondary">{status}</span>
    </div>
  );
}

function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-xpress-status-active';
  if (rating >= 4.0) return 'text-xpress-accent-blue';
  if (rating >= 3.5) return 'text-xpress-status-idle';
  if (rating >= 3.0) return 'text-xpress-status-warning';
  return 'text-xpress-status-alert';
}

export default DriversTable;
