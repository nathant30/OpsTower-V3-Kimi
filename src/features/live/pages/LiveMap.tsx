// Live Map Page - Real-time Driver Tracking
import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { useLiveDrivers } from '@/features/live/hooks/useLiveDrivers';
import type { LiveDriver } from '@/features/live/hooks/useLiveDrivers';
import {
  Search,
  Filter,
  RefreshCw,
  Map as MapIcon,
  Users,
  Navigation,
  Car,
  Phone,
  Star,
  MapPin,
  Gauge,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Drivers', color: 'bg-blue-500' },
  { value: 'available', label: 'Available', color: 'bg-green-500' },
  { value: 'on-trip', label: 'On Trip', color: 'bg-yellow-500' },
  { value: 'idle', label: 'Idle', color: 'bg-gray-500' },
  { value: 'offline', label: 'Offline', color: 'bg-red-500' },
] as const;

const SERVICE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'moto', label: 'Moto' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'car', label: 'Car' },
] as const;

const DriverMarker = ({
  driver,
  isSelected,
  onClick,
  style,
}: {
  driver: LiveDriver;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}) => {
  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    'on-trip': 'bg-yellow-500',
    idle: 'bg-gray-500',
    offline: 'bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-125 ${
        isSelected ? 'ring-3 ring-orange-500 scale-125 z-20' : 'z-10'
      } ${statusColors[driver.status] || 'bg-gray-500'}`}
      style={style}
      title={`${driver.driverName} (${driver.status})`}
    >
      {driver.currentRideId && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white" />
      )}
    </button>
  );
};

const DriverInfoCard = ({
  driver,
  onClose,
}: {
  driver: LiveDriver;
  onClose: () => void;
}) => {
  const statusVariants: Record<string, 'active' | 'idle' | 'default' | 'alert' | 'busy'> = {
    available: 'active',
    'on-trip': 'busy',
    idle: 'default',
    offline: 'alert',
  };

  return (
    <XpressCard className="w-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
              {driver.driverName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{driver.driverName}</h3>
              <p className="text-xs text-gray-500">{driver.driverId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariants[driver.status]}>
              {driver.status}
            </Badge>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Star className="w-3.5 h-3.5" />
              <span className="text-xs">Rating</span>
            </div>
            <p className="text-white font-medium">{driver.rating.toFixed(1)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Trust Score</span>
            </div>
            <p className="text-white font-medium">{driver.trustScore}%</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Car className="w-3.5 h-3.5" />
              <span className="text-xs">Trips</span>
            </div>
            <p className="text-white font-medium">{driver.totalTrips.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Gauge className="w-3.5 h-3.5" />
              <span className="text-xs">Speed</span>
            </div>
            <p className="text-white font-medium">{driver.speed} km/h</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Car className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wide">Vehicle</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{driver.vehicle.type}</p>
              <p className="text-gray-500 text-xs">{driver.vehicle.plate}</p>
            </div>
            <Badge variant="default">{driver.serviceType}</Badge>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wide">Location</span>
          </div>
          <p className="text-white text-sm font-mono">
            {driver.latitude.toFixed(4)}°, {driver.longitude.toFixed(4)}°
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Last updated: {new Date(driver.lastUpdated).toLocaleTimeString()}
          </p>
        </div>

        {/* Current Ride */}
        {driver.currentRide && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Navigation className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-wide font-medium">Current Ride</span>
            </div>
            <div className="space-y-1">
              <p className="text-white text-sm">{driver.currentRideId}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-green-400">→</span> {driver.currentRide.pickup}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-orange-400">→</span> {driver.currentRide.dropoff}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-500/20">
                <span className="text-xs text-gray-500">Passenger: {driver.currentRide.passengerName}</span>
                <span className="text-xs text-orange-400 font-medium">ETA: {driver.currentRide.eta} min</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
            Contact
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors">
            <Navigation className="w-4 h-4" />
            Track
          </button>
        </div>
      </div>
    </XpressCard>
  );
};

const LiveMap = () => {
  const {
    filteredDrivers,
    isLoading,
    lastUpdated,
    refresh,
    filters,
    setFilters,
    stats,
    selectedDriver,
    setSelectedDriver,
  } = useLiveDrivers(10000);

  const [autoRefresh, setAutoRefresh] = useState(true);

  // Calculate marker positions based on geographic coordinates
  // In a real implementation, this would use a map library like Mapbox or Google Maps
  const getMarkerStyle = (driver: LiveDriver, index: number): React.CSSProperties => {
    // Mock conversion - in reality this would be map projection
    const baseLat = 14.55;
    const baseLng = 120.95;
    const latRange = 0.12;
    const lngRange = 0.10;
    
    const top = 100 - ((driver.latitude - baseLat) / latRange) * 100;
    const left = ((driver.longitude - baseLng) / lngRange) * 100;
    
    return {
      top: `${Math.max(5, Math.min(95, top))}%`,
      left: `${Math.max(5, Math.min(95, left))}%`,
    };
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Top Bar */}
      <div className="border-b border-gray-800 bg-[#0f0f14]/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-orange-500" />
              Live Map
            </h1>
            <p className="text-sm text-gray-500">Real-time driver tracking and monitoring</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <XpressKpiCard
            title="Active Drivers"
            value={stats.total}
            icon={<Users className="w-4 h-4" />}
            trend={{ value: 5, isPositive: true }}
          />
          <XpressKpiCard
            title="On Trip"
            value={stats.onTrip}
            icon={<Navigation className="w-4 h-4" />}
            subtext={`${Math.round((stats.onTrip / stats.total) * 100)}% of fleet`}
          />
          <XpressKpiCard
            title="Available"
            value={stats.available}
            icon={<CheckCircle className="w-4 h-4" />}
            subtext="Ready for pickup"
          />
          <XpressKpiCard
            title="Offline"
            value={stats.offline}
            icon={<WifiOff className="w-4 h-4" />}
            trend={{ value: 2, isPositive: false }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by driver name, ID, or plate..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value === 'all' ? stats.total : stats[opt.value as keyof typeof stats]})
                </option>
              ))}
            </select>
          </div>

          <select
            value={filters.serviceType || 'all'}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
          >
            {SERVICE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-white">
              {filteredDrivers.length} visible
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-hidden flex">
        {/* Map Simulation */}
        <div className="flex-1 relative bg-[#0a0a0f] overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #333 1px, transparent 1px),
                  linear-gradient(to bottom, #333 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Concentric Circles for Effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full border border-gray-800/50" />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-gray-800/50" />
            <div className="absolute w-[200px] h-[200px] rounded-full border border-gray-800/50" />
          </div>

          {/* Metro Manila Label */}
          <div className="absolute top-4 left-4 bg-[#12121a]/95 border border-gray-800 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-orange-500" />
              <span className="text-white font-medium">Metro Manila</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Philippines • 14.5995° N, 120.9842° E</p>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-[#12121a]/95 border border-gray-800 px-4 py-3 rounded-lg shadow-lg">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Driver Status</p>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.filter(s => s.value !== 'all').map((status) => (
                <div key={status.value} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
                  <span className="text-xs text-gray-400">{status.label}</span>
                  <span className="text-xs text-gray-600 ml-auto">
                    {stats[status.value as keyof typeof stats]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Markers */}
          {filteredDrivers.map((driver, index) => (
            <DriverMarker
              key={driver.driverId}
              driver={driver}
              isSelected={selectedDriver?.driverId === driver.driverId}
              onClick={() => setSelectedDriver(driver)}
              style={getMarkerStyle(driver, index)}
            />
          ))}

          {/* Selected Driver Info Panel */}
          {selectedDriver && (
            <div className="absolute top-4 right-4 w-80 z-30">
              <DriverInfoCard
                driver={selectedDriver}
                onClose={() => setSelectedDriver(null)}
              />
            </div>
          )}
        </div>

        {/* Driver List Sidebar */}
        <div className="w-80 bg-[#0f0f14] border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Drivers
              </h2>
              <Badge variant="default">{filteredDrivers.length}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.available} available • {stats.onTrip} on trip
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredDrivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Users className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">No drivers found</p>
                <p className="text-gray-600 text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredDrivers.map((driver) => {
                  const statusColors: Record<string, string> = {
                    available: 'bg-green-500',
                    'on-trip': 'bg-yellow-500',
                    idle: 'bg-gray-500',
                    offline: 'bg-red-500',
                  };

                  return (
                    <button
                      key={driver.driverId}
                      onClick={() => setSelectedDriver(driver)}
                      className={`w-full p-4 text-left hover:bg-gray-900/50 transition-colors ${
                        selectedDriver?.driverId === driver.driverId ? 'bg-gray-900' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-medium">
                            {driver.driverName.charAt(0)}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f0f14] ${
                              statusColors[driver.status]
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {driver.driverName}
                          </p>
                          <p className="text-xs text-gray-500">{driver.driverId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              {driver.vehicle.plate}
                            </span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-600">
                              {driver.serviceType}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            {driver.rating.toFixed(1)}
                          </div>
                          {driver.speed > 0 && (
                            <p className="text-xs text-gray-500 mt-1">{driver.speed} km/h</p>
                          )}
                        </div>
                      </div>

                      {driver.currentRide && (
                        <div className="mt-2 p-2 bg-yellow-500/10 rounded text-xs">
                          <p className="text-yellow-400 font-medium">On ride: {driver.currentRideId}</p>
                          <p className="text-gray-500 mt-0.5 truncate">
                            {driver.currentRide.pickup} → {driver.currentRide.dropoff}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Auto-refresh</span>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>10s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
