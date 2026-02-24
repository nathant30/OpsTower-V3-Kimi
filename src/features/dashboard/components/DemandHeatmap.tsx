import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDemandHeatmap, useLiveMapOrders, useLiveMapDrivers } from '@/features/dashboard/hooks/useLiveMapOrders';
import { formatDuration } from '@/lib/utils/date';
import type { DemandZone } from '@/features/dashboard/hooks/useLiveMapOrders';
import { 
  Map, 
  Maximize2,
  Minimize2,
  RefreshCw,
  MapPin,
  Package,
  Users,
  TrendingUp,
  Navigation
} from 'lucide-react';

// Set Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapLayerToggleProps {
  activeLayer: 'demand' | 'drivers' | 'traffic';
  onChange: (layer: 'demand' | 'drivers' | 'traffic') => void;
}

function MapLayerToggle({ activeLayer, onChange }: MapLayerToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-xpress-bg-secondary rounded-lg p-1">
      <button
        onClick={() => onChange('demand')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
          activeLayer === 'demand'
            ? 'bg-xpress-accent-blue text-white'
            : 'text-xpress-text-secondary hover:text-xpress-text-primary'
        )}
      >
        <TrendingUp className="w-3 h-3" />
        Demand
      </button>
      <button
        onClick={() => onChange('drivers')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
          activeLayer === 'drivers'
            ? 'bg-xpress-accent-blue text-white'
            : 'text-xpress-text-secondary hover:text-xpress-text-primary'
        )}
      >
        <Users className="w-3 h-3" />
        Drivers
      </button>
      <button
        onClick={() => onChange('traffic')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
          activeLayer === 'traffic'
            ? 'bg-xpress-accent-blue text-white'
            : 'text-xpress-text-secondary hover:text-xpress-text-primary'
        )}
      >
        <Navigation className="w-3 h-3" />
        Traffic
      </button>
    </div>
  );
}

export function DemandHeatmap() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'demand' | 'drivers' | 'traffic'>('demand');
  const [showDriverCount, setShowDriverCount] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch real data
  const { data: heatmapData, isLoading: isLoadingHeatmap, refetch: refetchHeatmap } = useDemandHeatmap();
  const { data: ordersData, isLoading: isLoadingOrders, refetch: refetchOrders } = useLiveMapOrders();
  const { data: driversData, isLoading: isLoadingDrivers, refetch: refetchDrivers } = useLiveMapDrivers();

  const zones = heatmapData?.zones || [];
  const totalOrders = heatmapData?.totalOrders || 0;

  // Check token before initializing map
  useEffect(() => {
    if (!mapboxgl.accessToken || mapboxgl.accessToken.includes('demo_token')) {
      // Use timeout to avoid setState during render
      const timer = setTimeout(() => {
        setMapError('Mapbox token not configured - showing fallback view');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (mapError) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [121.0244, 14.5547], // Makati CBD
        zoom: 11,
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map tiles');
      });

    } catch (err) {
      console.error('Failed to initialize map:', err);
      setMapError('Failed to initialize map');
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add zone markers to map
  useEffect(() => {
    if (!map.current || zones.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each zone
    zones.forEach((zone) => {
      const getColor = (intensity: number) => {
        if (intensity >= 0.8) return '#ef4444'; // red
        if (intensity >= 0.6) return '#f97316'; // orange
        if (intensity >= 0.4) return '#eab308'; // yellow
        return '#3b82f6'; // blue
      };

      const getSize = (intensity: number) => {
        if (intensity >= 0.8) return 32;
        if (intensity >= 0.6) return 24;
        if (intensity >= 0.4) return 20;
        return 16;
      };

      const color = getColor(zone.intensity);
      const size = getSize(zone.intensity);

      // Create marker element
      const el = document.createElement('div');
      el.className = 'zone-marker';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = color;
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontSize = size > 24 ? '10px' : '8px';
      el.style.fontWeight = 'bold';
      el.innerText = zone.orders.toString();

      // Add pulse animation for high intensity
      if (zone.intensity >= 0.8) {
        el.style.animation = 'pulse 2s infinite';
      }

      if (!map.current) return;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([zone.lng, zone.lat])
        .addTo(map.current);

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedZone(zone.id === selectedZone ? null : zone.id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all zones
    if (zones.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      zones.forEach(zone => bounds.extend([zone.lng, zone.lat]));
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [zones, selectedZone]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchHeatmap(),
      refetchOrders(),
      refetchDrivers(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const selectedZoneData = zones.find(z => z.id === selectedZone);

  const getSupplyDemandRatio = (zone: DemandZone) => {
    if (zone.orders === 0) return 0;
    return zone.availableDrivers / zone.orders;
  };

  const isLoading = isLoadingHeatmap || isLoadingOrders || isLoadingDrivers;

  return (
    <div className={cn(
      'xpress-card flex flex-col transition-all duration-300',
      isExpanded ? 'fixed inset-4 z-50' : 'h-full'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-xpress-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-xpress-accent-blue/10 rounded-lg">
            <Map className="w-5 h-5 text-xpress-accent-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-xpress-text-primary">Demand Heatmap</h3>
            <p className="text-xs text-xpress-text-secondary">
              {isLoading ? 'Loading...' : `${totalOrders} orders across ${zones?.length ?? 0} zones`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <MapLayerToggle activeLayer={activeLayer} onChange={setActiveLayer} />
          
          <button
            onClick={() => setShowDriverCount(!showDriverCount)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showDriverCount 
                ? 'bg-xpress-accent-blue/20 text-xpress-accent-blue' 
                : 'text-xpress-text-muted hover:text-xpress-text-primary'
            )}
            title="Toggle driver count display"
          >
            <Users className="w-4 h-4" />
          </button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          />
          
          <Button
            variant="ghost"
            size="sm"
            icon={isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {mapError ? (
          // Fallback view when Mapbox token is not configured
          <div className="absolute inset-0 bg-xpress-bg-secondary">
            <FallbackMapView 
              zones={zones} 
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              showDriverCount={showDriverCount}
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-xpress-bg-tertiary/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xs text-xpress-status-warning">⚠️ {mapError}</p>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0" />
        )}

        {/* Zone Labels - Top 3 High Demand */}
        <div className="absolute top-4 left-4 space-y-2 max-w-[200px] z-10">
          <p className="text-xs font-medium text-xpress-text-muted uppercase tracking-wider mb-2">
            High Demand Zones
          </p>
          {zones.slice(0, 3).map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id === selectedZone ? null : zone.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors w-full',
                selectedZone === zone.id
                  ? 'bg-xpress-accent-blue/20 text-xpress-accent-blue'
                  : 'bg-xpress-bg-tertiary/90 text-xpress-text-secondary hover:text-xpress-text-primary'
              )}
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{zone.name}</span>
              <Badge 
                variant={zone.intensity >= 0.8 ? 'alert' : zone.intensity >= 0.6 ? 'warning' : 'default'}
                className="ml-auto shrink-0"
              >
                {zone.orders}
              </Badge>
            </button>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-xpress-bg-primary/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-xpress-text-secondary">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading map data...</span>
            </div>
          </div>
        )}

        {/* Active Orders Count Overlay */}
        {ordersData?.orders && (
          <div className="absolute top-4 right-4 bg-xpress-bg-tertiary/90 backdrop-blur-sm rounded-lg p-3 z-10">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-xpress-text-primary">{ordersData.orders?.length ?? 0}</p>
                <p className="text-xs text-xpress-text-muted">Active Orders</p>
              </div>
              {driversData?.drivers && (
                <div className="text-center border-l border-xpress-border pl-4">
                  <p className="text-lg font-bold text-xpress-accent-blue">{driversData.drivers?.length ?? 0}</p>
                  <p className="text-xs text-xpress-text-muted">Live Drivers</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-xpress-bg-tertiary/90 backdrop-blur-sm rounded-lg p-3 z-10">
          <p className="text-xs font-medium text-xpress-text-secondary mb-2">
            {activeLayer === 'demand' ? 'Demand Intensity' : 
             activeLayer === 'drivers' ? 'Driver Density' : 'Traffic Level'}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="text-xs text-xpress-text-muted">Critical (200+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/80" />
              <span className="text-xs text-xpress-text-muted">High (100-199)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="text-xs text-xpress-text-muted">Medium (50-99)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/60" />
              <span className="text-xs text-xpress-text-muted">Low (&lt;50)</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Details */}
        {selectedZoneData && (
          <div className="absolute bottom-4 left-4 bg-xpress-bg-tertiary/90 backdrop-blur-sm rounded-lg p-4 max-w-xs z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-xpress-text-primary">{selectedZoneData.name}</h4>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-xpress-text-muted hover:text-xpress-text-primary text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-xpress-text-secondary">Active Orders:</span>
                <span className="font-medium text-xpress-text-primary">{selectedZoneData.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xpress-text-secondary">Available Drivers:</span>
                <span className="font-medium text-xpress-accent-blue">{selectedZoneData.availableDrivers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xpress-text-secondary">Supply/Demand:</span>
                <span className={cn(
                  'font-medium',
                  getSupplyDemandRatio(selectedZoneData) >= 0.5 ? 'text-xpress-status-active' :
                  getSupplyDemandRatio(selectedZoneData) >= 0.3 ? 'text-xpress-status-idle' :
                  'text-xpress-status-alert'
                )}>
                  {(getSupplyDemandRatio(selectedZoneData) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xpress-text-secondary">Avg Wait Time:</span>
                <span className="font-medium text-xpress-text-primary">
                  {formatDuration(selectedZoneData.averageWaitTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xpress-text-secondary">Demand Level:</span>
                <span className={cn(
                  'font-medium',
                  selectedZoneData.intensity >= 0.8 ? 'text-xpress-status-alert' :
                  selectedZoneData.intensity >= 0.6 ? 'text-xpress-status-warning' :
                  'text-xpress-status-active'
                )}>
                  {selectedZoneData.intensity >= 0.8 ? 'Critical' :
                   selectedZoneData.intensity >= 0.6 ? 'High' :
                   selectedZoneData.intensity >= 0.4 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 text-xs">
                <Navigation className="w-3 h-3 mr-1" />
                Deploy Drivers
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 text-xs">
                <Package className="w-3 h-3 mr-1" />
                View Orders
              </Button>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {heatmapData?.lastUpdated && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-xpress-text-muted z-10 bg-xpress-bg-tertiary/80 px-2 py-1 rounded">
            Last updated: {new Date(heatmapData.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .zone-marker {
          transition: transform 0.2s ease;
        }
        .zone-marker:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}

// Fallback map view when Mapbox token is not available
interface FallbackMapViewProps {
  zones: DemandZone[];
  selectedZone: string | null;
  setSelectedZone: (id: string | null) => void;
  showDriverCount: boolean;
}

function FallbackMapView({ zones, selectedZone, setSelectedZone, showDriverCount }: FallbackMapViewProps) {
  const getColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500/80';
    if (intensity >= 0.6) return 'bg-orange-500/80';
    if (intensity >= 0.4) return 'bg-yellow-500/80';
    return 'bg-blue-500/60';
  };

  const getSize = (intensity: number) => {
    if (intensity >= 0.8) return 'w-16 h-16';
    if (intensity >= 0.6) return 'w-12 h-12';
    if (intensity >= 0.4) return 'w-10 h-10';
    return 'w-8 h-8';
  };

  const getPosition = (lat: number, lng: number) => {
    const latRange = { min: 14.4, max: 14.7 };
    const lngRange = { min: 120.9, max: 121.2 };
    
    const top = ((lat - latRange.min) / (latRange.max - latRange.min)) * 100;
    const left = ((lng - lngRange.min) / (lngRange.max - lngRange.min)) * 100;
    
    return { top: `${100 - top}%`, left: `${left}%` };
  };

  return (
    <div className="absolute inset-0">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-xpress-border" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Zone Markers */}
      {zones.map((zone) => {
        const position = getPosition(zone.lat, zone.lng);
        return (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id === selectedZone ? null : zone.id)}
            className={cn(
              'absolute rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-110',
              getColor(zone.intensity),
              getSize(zone.intensity),
              zone.intensity >= 0.8 && 'animate-pulse',
              selectedZone === zone.id && 'ring-4 ring-white/30 scale-110 z-10'
            )}
            style={position}
          >
            <span className="text-white text-xs font-bold leading-none">{zone.orders}</span>
            {showDriverCount && (
              <span className="text-white/80 text-[10px] leading-none mt-0.5">
                {zone.availableDrivers}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default DemandHeatmap;
