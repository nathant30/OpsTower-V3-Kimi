// Live Rides Page - Real-time Ride Monitoring
import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { useLiveRides, type LiveRide } from '@/features/live/hooks/useLiveRides';
import {
  Navigation,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  User,
  Phone,
  DollarSign,
  Clock,
  Star,
  AlertCircle,
  X,
  Car,
  Calendar,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  MoreVertical,
  Ban,
  UserPlus,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses', color: 'bg-blue-500' },
  { value: 'requested', label: 'Requested', color: 'bg-amber-500' },
  { value: 'accepted', label: 'Accepted', color: 'bg-cyan-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
] as const;

const SERVICE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'moto', label: 'Moto' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'car', label: 'Car' },
] as const;

const getStatusVariant = (status: string): 'active' | 'idle' | 'default' | 'alert' | 'warning' | 'busy' => {
  const variants: Record<string, 'active' | 'idle' | 'default' | 'alert' | 'warning' | 'busy'> = {
    requested: 'warning',
    accepted: 'active',
    'in-progress': 'busy',
    'arrived': 'busy',
    assigned: 'idle',
    completed: 'active',
    cancelled: 'alert',
  };
  return variants[status] || 'default';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'cancelled':
      return <Ban className="w-3.5 h-3.5" />;
    case 'in-progress':
      return <Navigation className="w-3.5 h-3.5" />;
    case 'requested':
      return <Clock className="w-3.5 h-3.5" />;
    default:
      return <Car className="w-3.5 h-3.5" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const RideCard = ({
  ride,
  isSelected,
  onClick,
}: {
  ride: LiveRide;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const isUrgent = ride.priority === 'urgent' || ride.priority === 'high';

  return (
    <XpressCard
      onClick={onClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-orange-500' : 'hover:border-gray-700'
      } ${isUrgent ? 'border-l-4 border-l-red-500' : ''}`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">{ride.rideId}</h3>
              {isUrgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(ride.timeline.requestedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(ride.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(ride.status)}
                {ride.status}
              </span>
            </Badge>
            <Badge variant="default">{ride.serviceType}</Badge>
          </div>
        </div>

        {/* Driver Info */}
        {ride.driver && (
          <div className="flex items-center gap-3 p-2.5 bg-gray-900/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{ride.driver.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  {ride.driver.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span className="truncate">{ride.driver.vehicle?.plate}</span>
              </div>
            </div>
            {ride.eta !== undefined && ride.eta > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">ETA</p>
                <p className="text-sm font-medium text-orange-400">{ride.eta}m</p>
              </div>
            )}
          </div>
        )}

        {/* Passenger Info */}
        <div className="flex items-center gap-3 p-2.5 bg-gray-900/50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{ride.passenger.name}</p>
            <p className="text-xs text-gray-500 truncate">{ride.passenger.phone}</p>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <Phone className="w-4 h-4 text-gray-500 hover:text-green-400" />
          </button>
        </div>

        {/* Route */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-500 text-xs">Pickup</p>
              <p className="text-white truncate">{ride.pickup.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-500 text-xs">Dropoff</p>
              <p className="text-white truncate">{ride.dropoff.address}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">{formatCurrency(ride.fare.total)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400 text-sm">{ride.distance} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400 text-sm">{formatDuration(ride.timeline.estimatedDuration)}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 capitalize">{ride.paymentMethod}</span>
        </div>

        {/* Notes */}
        {ride.notes && (
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">
            <span className="font-medium">Note:</span> {ride.notes}
          </div>
        )}
      </div>
    </XpressCard>
  );
};

const RideDetailPanel = ({
  ride,
  onClose,
  onCancel,
  onReassign,
  isCancelling,
}: {
  ride: LiveRide;
  onClose: () => void;
  onCancel: () => void;
  onReassign: () => void;
  isCancelling: boolean;
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const canCancel = ['requested', 'accepted', 'in-progress', 'arrived', 'assigned'].includes(ride.status);
  const canReassign = ['requested', 'accepted', 'assigned'].includes(ride.status);

  const handleCancel = () => {
    if (showCancelConfirm) {
      onCancel();
      setShowCancelConfirm(false);
    } else {
      setShowCancelConfirm(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f14] border-l border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Ride Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Badge variant={getStatusVariant(ride.status)} className="text-sm">
          {ride.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Ride ID & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Ride ID</p>
            <p className="text-white font-mono text-sm">{ride.rideId}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Priority</p>
            <p className={`text-sm font-medium capitalize ${
              ride.priority === 'urgent' ? 'text-red-400' : 
              ride.priority === 'high' ? 'text-orange-400' : 'text-white'
            }`}>
              {ride.priority}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Timeline</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Requested</span>
              <span className="text-white">{new Date(ride.timeline.requestedAt).toLocaleTimeString()}</span>
            </div>
            {ride.timeline.acceptedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Accepted</span>
                <span className="text-white">{new Date(ride.timeline.acceptedAt).toLocaleTimeString()}</span>
              </div>
            )}
            {ride.timeline.arrivedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Arrived</span>
                <span className="text-white">{new Date(ride.timeline.arrivedAt).toLocaleTimeString()}</span>
              </div>
            )}
            {ride.timeline.pickedUpAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Picked Up</span>
                <span className="text-white">{new Date(ride.timeline.pickedUpAt).toLocaleTimeString()}</span>
              </div>
            )}
            {ride.timeline.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Completed</span>
                <span className="text-white">{new Date(ride.timeline.completedAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Fare Breakdown</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Fare</span>
              <span className="text-white">{formatCurrency(ride.fare.base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Distance ({ride.distance} km)</span>
              <span className="text-white">{formatCurrency(ride.fare.distance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="text-white">{formatCurrency(ride.fare.time)}</span>
            </div>
            {ride.fare.surge > 1 && (
              <div className="flex justify-between">
                <span className="text-orange-400">Surge (×{ride.fare.surge})</span>
                <span className="text-orange-400">+{formatCurrency((ride.fare.base + ride.fare.distance + ride.fare.time) * (ride.fare.surge - 1))}</span>
              </div>
            )}
            {ride.fare.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-green-400">Discount</span>
                <span className="text-green-400">-{formatCurrency(ride.fare.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-800 flex justify-between">
              <span className="text-white font-medium">Total</span>
              <span className="text-white font-bold">{formatCurrency(ride.fare.total)}</span>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-900 rounded-lg h-40 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #333 1px, transparent 1px),
                  linear-gradient(to bottom, #333 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
          </div>
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Route map view</p>
            <p className="text-xs text-gray-600 mt-1">{ride.pickup.address} → {ride.dropoff.address}</p>
          </div>
        </div>

        {/* Notes */}
        {ride.notes && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-400 font-medium mb-1">Notes</p>
            <p className="text-sm text-amber-200">{ride.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="p-4 border-t border-gray-800 space-y-3">
          {showCancelConfirm && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Cancellation reason:</p>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Select reason...</option>
                <option value="passenger_request">Passenger requested</option>
                <option value="driver_issue">Driver issue</option>
                <option value="no_show">Passenger no-show</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            {canReassign && (
              <Button
                variant="secondary"
                onClick={onReassign}
                className="flex-1"
                icon={<UserPlus className="w-4 h-4" />}
              >
                Reassign
              </Button>
            )}
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={isCancelling || (showCancelConfirm && !cancelReason)}
              loading={isCancelling}
              className="flex-1"
              icon={<Ban className="w-4 h-4" />}
            >
              {showCancelConfirm ? 'Confirm Cancel' : 'Cancel Ride'}
            </Button>
          </div>
          {showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-full text-xs text-gray-500 hover:text-white transition-colors"
            >
              Back to details
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const LiveRides = () => {
  const {
    filteredRides,
    isLoading,
    isCancelling,
    lastUpdated,
    refresh,
    filters,
    setFilters,
    stats,
    selectedRide,
    setSelectedRide,
    cancelRide,
    reassignRide,
  } = useLiveRides(10000);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const handleCancel = async () => {
    if (selectedRide) {
      await cancelRide(selectedRide.rideId, 'Dispatcher cancellation');
    }
  };

  const handleReassign = async () => {
    if (selectedRide) {
      // In a real app, this would open a driver selection modal
      await reassignRide(selectedRide.rideId, 'DRV-NEW');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Top Bar */}
      <div className="border-b border-gray-800 bg-[#0f0f14]/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Navigation className="w-6 h-6 text-orange-500" />
              Live Rides
            </h1>
            <p className="text-sm text-gray-500">Real-time ride monitoring and management</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500">Last Update</div>
              <div className="text-sm text-white font-medium">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </div>
            </div>

            <button
              onClick={() => {
                setAutoRefresh(!autoRefresh);
                if (!autoRefresh) refresh();
              }}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh && isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <XpressKpiCard
            title="Total"
            value={stats.total}
            icon={<Car className="w-4 h-4" />}
          />
          <XpressKpiCard
            title="Requested"
            value={stats.requested}
            icon={<Clock className="w-4 h-4" />}
            badge={stats.requested > 0 ? `${stats.requested} waiting` : undefined}
          />
          <XpressKpiCard
            title="Accepted"
            value={stats.accepted}
            icon={<CheckCircle className="w-4 h-4" />}
          />
          <XpressKpiCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Navigation className="w-4 h-4" />}
          />
          <XpressKpiCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-4 h-4" />}
            subtext={`${stats.cancelled} cancelled`}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by ride ID, passenger, or driver..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-gray-900 border-gray-800 text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
            <Car className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-white">{filteredRides.length} rides</span>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800 flex flex-wrap gap-3">
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value === 'all' ? stats.total : stats[opt.value as keyof typeof stats]})
                </option>
              ))}
            </select>

            <select
              value={filters.serviceType || 'all'}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
            >
              {SERVICE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.priority || 'all'}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Rides Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Car className="w-16 h-16 text-gray-800 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No rides found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.rideId}
                  ride={ride}
                  isSelected={selectedRide?.rideId === ride.rideId}
                  onClick={() => setSelectedRide(ride)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Ride Details */}
        {selectedRide && (
          <div className="w-96">
            <RideDetailPanel
              ride={selectedRide}
              onClose={() => setSelectedRide(null)}
              onCancel={handleCancel}
              onReassign={handleReassign}
              isCancelling={isCancelling}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRides;
