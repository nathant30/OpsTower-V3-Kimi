import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Passenger, PassengerStatus } from '@/services/passengers/passengers.service';
import { Search, Filter, X, User, MoreHorizontal, Eye, Ban, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PassengerTableProps {
  passengers: Passenger[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: PassengerStatus) => void;
}

interface FiltersState {
  status: PassengerStatus[];
  minTrustScore?: number;
  maxTrustScore?: number;
}

export function PassengerTable({
  passengers,
  isLoading = false,
  onStatusChange,
}: PassengerTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    status: [],
  });

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    return passengers.filter((passenger) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${passenger.firstName} ${passenger.lastName}`.toLowerCase();
        const phone = passenger.phone.toLowerCase();
        const email = passenger.email.toLowerCase();
        const passengerId = passenger.id.toLowerCase();

        if (
          !fullName.includes(query) &&
          !phone.includes(query) &&
          !email.includes(query) &&
          !passengerId.includes(query)
        ) {
          return false;
        }
      }

      if (filters.status.length > 0 && !filters.status.includes(passenger.status)) {
        return false;
      }

      if (filters.minTrustScore !== undefined && passenger.trustScore < filters.minTrustScore) {
        return false;
      }

      if (filters.maxTrustScore !== undefined && passenger.trustScore > filters.maxTrustScore) {
        return false;
      }

      return true;
    });
  }, [passengers, searchQuery, filters]);

  // Table columns
  const columns: Column<Passenger>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Passenger',
        accessor: (row) => `${row.firstName} ${row.lastName}`,
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
              <span className="text-sm font-bold text-orange-400">
                {row.firstName[0]}{row.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">{String(value)}</p>
              <p className="text-xs text-gray-500">{row.id}</p>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'contact',
        header: 'Contact Info',
        accessor: (row) => row.email,
        render: (_, row) => (
          <div className="space-y-0.5">
            <p className="text-sm text-white">{row.email}</p>
            <p className="text-xs text-gray-500">{row.phone}</p>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: (row) => row.status,
        render: (value) => <StatusBadge status={String(value) as PassengerStatus} />,
        sortable: true,
        width: '110px',
      },
      {
        key: 'trustScore',
        header: 'Trust Score',
        accessor: (row) => row.trustScore,
        render: (value) => (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  Number(value) >= 80 ? 'bg-green-500' :
                  Number(value) >= 60 ? 'bg-yellow-500' :
                  Number(value) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                )}
                style={{ width: `${Number(value)}%` }}
              />
            </div>
            <span className={cn(
              'text-xs font-medium',
              Number(value) >= 80 ? 'text-green-400' :
              Number(value) >= 60 ? 'text-yellow-400' :
              Number(value) >= 40 ? 'text-orange-400' : 'text-red-400'
            )}>
              {Number(value)}
            </span>
          </div>
        ),
        sortable: true,
        width: '120px',
      },
      {
        key: 'rating',
        header: 'Rating',
        accessor: (row) => row.rating,
        render: (value) => (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white font-medium">{Number(value).toFixed(1)}</span>
          </div>
        ),
        sortable: true,
        width: '90px',
      },
      {
        key: 'trips',
        header: 'Trips',
        accessor: (row) => row.totalRides,
        render: (value) => (
          <span className="text-white">{Number(value).toLocaleString()}</span>
        ),
        align: 'center',
        sortable: true,
        width: '80px',
      },
      {
        key: 'joined',
        header: 'Joined',
        accessor: (row) => row.joinedAt,
        render: (value) => (
          <span className="text-gray-400 text-sm">
            {new Date(String(value)).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
        sortable: true,
        width: '110px',
      },
      {
        key: 'actions',
        header: 'Actions',
        accessor: (row) => row.id,
        render: (_, row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/passengers/${row.id}`);
              }}
              title="View Profile"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {row.status === 'active' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(row.id, 'suspended');
                  }}
                  title="Suspend"
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  <PauseCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(row.id, 'banned');
                  }}
                  title="Ban"
                  className="text-red-500 hover:text-red-400"
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </>
            )}
            {(row.status === 'suspended' || row.status === 'banned') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(row.id, 'active');
                }}
                title="Reactivate"
                className="text-green-500 hover:text-green-400"
              >
                <PauseCircle className="w-4 h-4 rotate-90" />
              </Button>
            )}
          </div>
        ),
        align: 'right',
        width: '120px',
      },
    ],
    [navigate, onStatusChange]
  );

  const handleRowClick = (passenger: Passenger) => {
    navigate(`/passengers/${passenger.id}`);
  };

  const activeFiltersCount =
    filters.status.length +
    (filters.minTrustScore !== undefined ? 1 : 0) +
    (filters.maxTrustScore !== undefined ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search passengers by name, email, phone, or ID..."
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
        <div className="bg-[#12121a] border border-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-400">Filters</h4>
            <button
              onClick={() => setFilters({ status: [] })}
              className="text-xs text-orange-400 hover:underline"
            >
              Reset all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(['active', 'inactive', 'suspended', 'banned'] as PassengerStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        status: prev.status.includes(status)
                          ? prev.status.filter((s) => s !== status)
                          : [...prev.status, status],
                      }));
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors capitalize',
                      filters.status.includes(status)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Score Filter */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Min Trust Score</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minTrustScore ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFilters((prev) => ({
                      ...prev,
                      minTrustScore: value > 0 ? value : undefined,
                    }));
                  }}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-xs text-white w-8">{filters.minTrustScore ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-500">
          Showing <span className="text-white font-medium">{filteredPassengers.length}</span> of{' '}
          <span className="text-white font-medium">{passengers.length}</span> passengers
        </p>
      </div>

      {/* Table */}
      <div className="bg-[#12121a] border border-gray-800 rounded-xl overflow-hidden">
        <Table
          data={filteredPassengers}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          emptyMessage="No passengers found matching your criteria"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PassengerStatus }) {
  const variants: Record<PassengerStatus, 'active' | 'idle' | 'alert' | 'warning'> = {
    active: 'active',
    inactive: 'idle',
    suspended: 'warning',
    banned: 'alert',
  };

  const labels: Record<PassengerStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    banned: 'Banned',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export default PassengerTable;
