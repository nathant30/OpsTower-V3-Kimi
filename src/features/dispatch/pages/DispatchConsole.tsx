// Dispatch Console - Ride Assignment Interface
import { useState, useEffect, useCallback } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { useDispatch, type DispatchRide, type DispatchDriver, type Assignment } from '@/features/dispatch/hooks/useDispatch';
import {
  Radio,
  Search,
  MapPin,
  User,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Navigation,
  Car,
  Package,
  Zap,
  Users,
  CheckSquare,
  X,
  RefreshCw,
  History,
  Target,
  ArrowUpRight,
  Phone,
  DollarSign,
  Calendar,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  taxi: <Car className="w-4 h-4" />,
  moto: <Zap className="w-4 h-4" />,
  delivery: <Package className="w-4 h-4" />,
  car: <Car className="w-4 h-4" />,
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'high':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const RideCard = ({
  ride,
  isSelected,
  onClick,
}: {
  ride: DispatchRide;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <XpressCard
      onClick={onClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-orange-500 border-orange-500/50' : 'hover:border-gray-700'
      } ${ride.priority !== 'normal' ? 'border-l-4' : ''} ${
        ride.priority === 'urgent' ? 'border-l-red-500' : 
        ride.priority === 'high' ? 'border-l-orange-500' : ''
      }`}
    >
      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{ride.rideId}</span>
              {ride.priority !== 'normal' && (
                <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(ride.priority)}`}>
                  {ride.priority}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatTimeAgo(ride.requestedAt)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-orange-400">
            {SERVICE_ICONS[ride.serviceType]}
            <span className="text-xs capitalize">{ride.serviceType}</span>
          </div>
        </div>

        {/* Passenger */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-white">{ride.passenger.name}</span>
        </div>

        {/* Route */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400 truncate">{ride.pickup.address}</p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400 truncate">{ride.dropoff.address}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <span className="text-sm font-medium text-green-400">{formatCurrency(ride.fare)}</span>
          <span className="text-xs text-gray-500 capitalize">{ride.paymentMethod}</span>
        </div>

        {/* Notes */}
        {ride.notes && (
          <p className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
            {ride.notes}
          </p>
        )}
      </div>
    </XpressCard>
  );
};

const DriverCard = ({
  driver,
  ride,
  isSelected,
  isRecommended,
  onClick,
}: {
  driver: DispatchDriver;
  ride: DispatchRide | null;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}) => {
  const distance = ride
    ? ((d: DispatchDriver) => {
        const R = 6371;
        const dLat = ((ride.pickup.lat - d.latitude) * Math.PI) / 180;
        const dLng = ((ride.pickup.lng - d.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((d.latitude * Math.PI) / 180) *
            Math.cos((ride.pickup.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      })(driver)
    : null;

  const eta = distance ? Math.ceil(distance * 2.5) : null;

  return (
    <XpressCard
      onClick={onClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-orange-500 border-orange-500/50' : 'hover:border-gray-700'
      } ${isRecommended ? 'border-l-4 border-l-green-500' : ''}`}
    >
      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{driver.driverName}</p>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-400">{driver.rating.toFixed(1)}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{driver.trustScore}%</span>
              </div>
            </div>
          </div>
          <Badge variant={driver.status === 'available' ? 'active' : 'default'}>
            {driver.status}
          </Badge>
        </div>

        {/* Vehicle & Type */}
        {driver.vehicle && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{driver.vehicle.type}</span>
            <span className="text-gray-700">•</span>
            <span>{driver.vehicle.plate}</span>
            <span className="text-gray-700">•</span>
            <span className="capitalize">{driver.serviceType}</span>
          </div>
        )}

        {/* Distance to Pickup */}
        {distance !== null && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">To pickup</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-orange-400">{distance.toFixed(1)} km</p>
              {eta && <p className="text-xs text-gray-500">~{eta} min</p>}
            </div>
          </div>
        )}

        {/* Recommended Badge */}
        {isRecommended && (
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Best match</span>
          </div>
        )}
      </div>
    </XpressCard>
  );
};

const AssignmentPanel = ({
  selectedRide,
  selectedDriver,
  onAssign,
  isAssigning,
  onAutoSuggest,
}: {
  selectedRide: DispatchRide | null;
  selectedDriver: DispatchDriver | null;
  onAssign: () => void;
  isAssigning: boolean;
  onAutoSuggest: () => void;
}) => {
  if (!selectedRide) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <ArrowRight className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Select a Ride</h3>
        <p className="text-sm text-gray-500">Choose a pending ride request to begin assignment</p>
      </div>
    );
  }

  if (!selectedDriver) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a Driver</h3>
          <p className="text-sm text-gray-500 mb-4">Choose from available drivers on the right</p>
          <Button
            variant="secondary"
            onClick={onAutoSuggest}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Auto-Suggest Driver
          </Button>
        </div>

        {/* Selected Ride Summary */}
        <div className="mt-auto p-4 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Selected Ride</p>
          <p className="text-white font-medium mb-1">{selectedRide.rideId}</p>
          <p className="text-sm text-gray-400 mb-2">{selectedRide.passenger.name}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-400">{formatCurrency(selectedRide.fare)}</span>
            <span className="text-gray-500 capitalize">{selectedRide.serviceType}</span>
          </div>
        </div>
      </div>
    );
  }

  const distance = ((d: DispatchDriver, r: DispatchRide) => {
    const R = 6371;
    const dLat = ((r.pickup.lat - d.latitude) * Math.PI) / 180;
    const dLng = ((r.pickup.lng - d.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((d.latitude * Math.PI) / 180) *
        Math.cos((r.pickup.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  })(selectedDriver, selectedRide);

  const eta = Math.ceil(distance * 2.5);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-4">
          <ArrowUpRight className="w-10 h-10 text-orange-400" />
        </div>
        
        <h3 className="text-lg font-bold text-white mb-1">Ready to Assign</h3>
        <p className="text-sm text-gray-500 mb-6">Review the assignment details below</p>

        {/* Assignment Summary */}
        <div className="w-full space-y-3">
          <div className="p-3 bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Ride</p>
            <p className="text-white font-medium text-sm">{selectedRide.rideId}</p>
            <p className="text-xs text-gray-400 truncate">{selectedRide.pickup.address}</p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </div>

          <div className="p-3 bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Driver</p>
            <p className="text-white font-medium text-sm">{selectedDriver.driverName}</p>
            <p className="text-xs text-gray-400">{selectedDriver.vehicle?.plate}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Distance</p>
              <p className="text-white font-medium">{distance.toFixed(1)} km</p>
            </div>
            <div className="p-3 bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Est. ETA</p>
              <p className="text-white font-medium">{eta} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-2">
        <Button
          onClick={onAssign}
          disabled={isAssigning}
          loading={isAssigning}
          className="w-full"
          icon={<CheckSquare className="w-4 h-4" />}
        >
          Confirm Assignment
        </Button>
        <button
          onClick={() => {}}
          className="w-full py-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
          Cancel selection
        </button>
      </div>
    </div>
  );
};

const AssignmentHistoryItem = ({ assignment }: { assignment: Assignment }) => {
  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    accepted: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    completed: 'text-blue-400 bg-blue-400/10',
    cancelled: 'text-gray-400 bg-gray-400/10',
  };

  return (
    <div className="p-3 bg-gray-900 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white">{assignment.id}</p>
          <p className="text-xs text-gray-500">{formatTimeAgo(assignment.assignedAt)}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[assignment.status]}`}>
          {assignment.status}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Ride:</span>
          <span className="text-white">{assignment.rideId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Driver:</span>
          <span className="text-white">{assignment.driverName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Distance:</span>
          <span className="text-orange-400">{assignment.distance.toFixed(1)} km</span>
        </div>
      </div>
    </div>
  );
};

const DispatchConsole = () => {
  const {
    filteredRides,
    filteredDrivers,
    assignments,
    isLoadingRides,
    isLoadingDrivers,
    isAssigning,
    selectedRide,
    selectedDriver,
    setSelectedRide,
    setSelectedDriver,
    assignRide,
    rideSearchQuery,
    setRideSearchQuery,
    driverSearchQuery,
    setDriverSearchQuery,
    stats,
    autoSuggestDriver,
    refresh,
  } = useDispatch();

  const [showHistory, setShowHistory] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  // Auto-refresh toggle
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const handleAssign = async () => {
    if (!selectedRide || !selectedDriver) return;
    
    await assignRide(selectedRide.rideId, selectedDriver.driverId);
    setAssignmentSuccess(`Assigned ${selectedRide.rideId} to ${selectedDriver.driverName}`);
    
    setTimeout(() => setAssignmentSuccess(null), 3000);
  };

  const handleAutoSuggest = () => {
    if (!selectedRide) return;
    const suggested = autoSuggestDriver(selectedRide.rideId);
    if (suggested) {
      setSelectedDriver(suggested);
    }
  };

  const handleRideSelect = (ride: DispatchRide) => {
    setSelectedRide(ride);
    setSelectedDriver(null);
  };

  // Get recommended drivers for the selected ride
  const recommendedDrivers = (() => {
    if (!selectedRide) return [];
    return filteredDrivers
      .filter((d) => d.status === 'available' || d.status === 'idle')
      .map((d) => {
        const R = 6371;
        const dLat = ((selectedRide.pickup.lat - d.latitude) * Math.PI) / 180;
        const dLng = ((selectedRide.pickup.lng - d.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((d.latitude * Math.PI) / 180) *
            Math.cos((selectedRide.pickup.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...d, distance: R * c };
      })
      .sort((a, b) => (a as any).distance - (b as any).distance)
      .slice(0, 3)
      .map((d) => d.driverId);
  })();

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Top Bar */}
      <div className="border-b border-gray-800 bg-[#0f0f14]/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-orange-500" />
              Dispatch Console
            </h1>
            <p className="text-sm text-gray-500">Assign drivers to pending ride requests</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span className="text-sm">Auto</span>
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showHistory
                  ? 'bg-gray-800 text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm">History</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <XpressKpiCard
            title="Pending Rides"
            value={stats.pendingCount}
            icon={<Clock className="w-4 h-4" />}
            badge={stats.pendingCount > 0 ? 'Needs attention' : undefined}
          />
          <XpressKpiCard
            title="Available Drivers"
            value={stats.availableCount}
            icon={<Users className="w-4 h-4" />}
            subtext="Ready for assignment"
          />
          <XpressKpiCard
            title="Assigned Today"
            value={stats.assignedToday}
            icon={<CheckSquare className="w-4 h-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <XpressKpiCard
            title="Avg Assignment"
            value={`${stats.avgAssignmentTime}s`}
            icon={<Target className="w-4 h-4" />}
            subtext="Response time"
          />
        </div>
      </div>

      {/* Success Notification */}
      {assignmentSuccess && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20">
          <p className="text-sm text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {assignmentSuccess}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Pending Rides - Left Panel */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Pending Rides
              </h2>
              <Badge variant="warning">{filteredRides.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search rides..."
                value={rideSearchQuery}
                onChange={(e) => setRideSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingRides ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-6 h-6 text-gray-600 animate-spin" />
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">All caught up!</h3>
                <p className="text-xs text-gray-500">No pending rides at the moment</p>
              </div>
            ) : (
              filteredRides.map((ride) => (
                <RideCard
                  key={ride.rideId}
                  ride={ride}
                  isSelected={selectedRide?.rideId === ride.rideId}
                  onClick={() => handleRideSelect(ride)}
                />
              ))
            )}
          </div>
        </div>

        {/* Assignment Action - Center */}
        <div className="w-72 bg-[#0f0f14] border-r border-gray-800">
          <AssignmentPanel
            selectedRide={selectedRide}
            selectedDriver={selectedDriver}
            onAssign={handleAssign}
            isAssigning={isAssigning}
            onAutoSuggest={handleAutoSuggest}
          />
        </div>

        {/* Available Drivers - Right Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Available Drivers
              </h2>
              <Badge variant="active">{filteredDrivers.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {isLoadingDrivers ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-6 h-6 text-gray-600 animate-spin" />
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <AlertCircle className="w-12 h-12 text-gray-600 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">No drivers available</h3>
                <p className="text-xs text-gray-500">All drivers are currently busy or offline</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {filteredDrivers.map((driver) => (
                  <DriverCard
                    key={driver.driverId}
                    driver={driver}
                    ride={selectedRide}
                    isSelected={selectedDriver?.driverId === driver.driverId}
                    isRecommended={recommendedDrivers.includes(driver.driverId)}
                    onClick={() => setSelectedDriver(driver)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignment History - Optional Panel */}
        {showHistory && (
          <div className="w-80 border-l border-gray-800 bg-[#0f0f14] flex flex-col">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-orange-500" />
                  Recent Assignments
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {assignments.map((assignment) => (
                <AssignmentHistoryItem key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchConsole;
