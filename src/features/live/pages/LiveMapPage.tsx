/**
 * Live Map Page
 * 
 * Real-time map showing driver locations with live updates via WebSocket.
 * Updates positions when websocket receives driver-location updates.
 * Shows driver status, heading, and vehicle type on the map.
 */

import { useState, useCallback, useMemo } from 'react';
import { useLiveDrivers } from '../hooks/useLiveDrivers';
import { ConnectionStatus } from '@/components/realtime';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Activity, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Filter,
  Car,
  Bike,
  Truck
} from 'lucide-react';

// Vehicle type icons mapping
const vehicleIcons: Record<string, React.ReactNode> = {
  Taxi: <Car className="w-4 h-4" />,
  Moto: <Bike className="w-4 h-4" />,
  Delivery: <Truck className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
};

// Status color mapping
const statusColors: Record<string, string> = {
  Online: 'bg-green-500',
  Offline: 'bg-gray-500',
  OnTrip: 'bg-blue-500',
  OnBreak: 'bg-yellow-500',
};

// Mock map component - in real implementation, this would use Google Maps, Mapbox, etc.
const LiveMap = ({
  drivers,
  selectedDriver,
  onDriverSelect,
}: {
  drivers: ReturnType<typeof useLiveDrivers>['drivers'];
  selectedDriver: string | null;
  onDriverSelect: (driverId: string | null) => void;
}) => {
  // In a real implementation, this would render an actual map
  // For now, we'll show a visual representation
  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Map placeholder background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Driver markers */}
        {drivers.map((driver, index) => {
          // Generate pseudo-random positions based on driver ID for demo
          // In real implementation, use actual lat/lng
          const left = 10 + ((driver.driverId.charCodeAt(0) % 80));
          const top = 10 + ((driver.driverId.charCodeAt(1) || 0) % 80);
          const isSelected = selectedDriver === driver.driverId;
          
          return (
            <button
              key={driver.driverId}
              onClick={() => onDriverSelect(isSelected ? null : driver.driverId)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isSelected ? 'scale-125 z-10' : 'hover:scale-110'
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className={`
                relative flex items-center justify-center w-8 h-8 rounded-full 
                border-2 border-white shadow-lg
                ${statusColors[driver.status] || 'bg-gray-500'}
              `}>
                {vehicleIcons[driver.vehicleType] || vehicleIcons.Car}
                
                {/* Heading indicator */}
                {driver.heading !== undefined && (
                  <div 
                    className="absolute -top-1 w-0.5 h-2 bg-white rounded-full origin-bottom"
                    style={{ transform: `rotate(${driver.heading}deg) translateY(-4px)` }}
                  />
                )}
              </div>
              
              {/* Driver name tooltip */}
              <div className={`
                absolute top-full mt-1 left-1/2 -translate-x-1/2
                px-2 py-0.5 bg-black/80 text-white text-xs rounded
                whitespace-nowrap opacity-0 transition-opacity
                ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}
              `}>
                {driver.name}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          className="p-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-colors"
          title="Center map"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium text-gray-400 mb-2">Driver Status</div>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 text-xs text-gray-300">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Driver list sidebar component
const DriverList = ({
  drivers,
  selectedDriver,
  onDriverSelect,
  isConnected,
}: {
  drivers: ReturnType<typeof useLiveDrivers>['drivers'];
  selectedDriver: string | null;
  onDriverSelect: (driverId: string | null) => void;
  isConnected: boolean;
}) => {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredDrivers = useMemo(() => {
    if (filter === 'all') return drivers;
    return drivers.filter((d) => d.status.toLowerCase() === filter.toLowerCase());
  }, [drivers, filter]);

  const onlineCount = drivers.filter((d) => d.status === 'Online').length;
  const onTripCount = drivers.filter((d) => d.status === 'OnTrip').length;
  const offlineCount = drivers.filter((d) => d.status === 'Offline').length;

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Drivers
            <span className="text-sm font-normal text-gray-400">
              ({drivers.length})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" title="Real-time updates active" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" title="Real-time updates offline" />
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-green-500/10 rounded px-2 py-1 text-center">
            <div className="text-green-400 font-medium">{onlineCount}</div>
            <div className="text-gray-500">Online</div>
          </div>
          <div className="bg-blue-500/10 rounded px-2 py-1 text-center">
            <div className="text-blue-400 font-medium">{onTripCount}</div>
            <div className="text-gray-500">On Trip</div>
          </div>
          <div className="bg-gray-500/10 rounded px-2 py-1 text-center">
            <div className="text-gray-400 font-medium">{offlineCount}</div>
            <div className="text-gray-500">Offline</div>
          </div>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex gap-1 p-2 border-b border-gray-700 overflow-x-auto">
        {['all', 'online', 'ontrip', 'offline'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {f === 'all' ? 'All' : f === 'ontrip' ? 'On Trip' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Driver list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No drivers found
          </div>
        ) : (
          filteredDrivers.map((driver) => (
            <button
              key={driver.driverId}
              onClick={() => onDriverSelect(
                selectedDriver === driver.driverId ? null : driver.driverId
              )}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedDriver === driver.driverId
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    {driver.name}
                    <span className={`w-2 h-2 rounded-full ${statusColors[driver.status]}`} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {driver.vehicleType} • Trust: {driver.trustScore}%
                  </div>
                </div>
                {driver.currentOrderId && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                    On Order
                  </span>
                )}
              </div>
              
              {driver.speed !== undefined && driver.speed > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {Math.round(driver.speed)} km/h • Last update: {new Date(driver.lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// Main page component
export function LiveMapPage(): React.JSX.Element {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  
  const { 
    drivers, 
    isConnected, 
    error, 
    refresh 
  } = useLiveDrivers({
    enabled: true,
    onLocationUpdate: (driver) => {
      console.log('[LiveMap] Driver location updated:', driver.driverId);
    },
    onStatusChange: (driverId, status, previousStatus) => {
      console.log('[LiveMap] Driver status changed:', driverId, status, previousStatus);
    },
  });

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Live Map</h1>
              <p className="text-xs text-gray-400">
                Real-time driver locations
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <ConnectionStatus showLabel={false} size="sm" />
            
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {error.message}
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className="flex-1 p-4">
          <LiveMap
            drivers={drivers}
            selectedDriver={selectedDriver}
            onDriverSelect={setSelectedDriver}
          />
        </div>
        
        {/* Sidebar */}
        <div className="w-80 p-4 pl-0">
          <DriverList
            drivers={drivers}
            selectedDriver={selectedDriver}
            onDriverSelect={setSelectedDriver}
            isConnected={isConnected}
          />
        </div>
      </div>
      
      {/* Status bar */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {isConnected ? 'Real-time updates active' : 'Offline mode'}
            </span>
            <span>{drivers.length} drivers tracked</span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LiveMapPage;
