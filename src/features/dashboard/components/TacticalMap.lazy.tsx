/**
 * TacticalMap - Lazy Loaded Version
 * Dynamically imports mapbox-gl to reduce initial bundle size
 */

import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { useUIStore } from '@/lib/stores/ui.store';
import { useQuery } from '@tanstack/react-query';
import { mockLiveMapDrivers } from '@/lib/mocks/data';
import { Layers, Sun, Moon, Navigation, AlertCircle } from 'lucide-react';
import type { LiveMapDriver } from '@/types/domain.types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v12',
};

const STATUS_COLORS: Record<string, string> = {
  Online: '#22c55e',
  OnTrip: '#3b82f6',
  OnBreak: '#f59e0b',
  Offline: '#6b7280',
};

// Loading state for map
function MapLoadingState() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  );
}

// Error state for map
function MapErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-center p-6">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Map Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function TacticalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'dark' | 'light' | 'satellite' | 'streets'>('dark');
  const [showControls, setShowControls] = useState(false);
  
  const { sidebarCollapsed } = useUIStore();
  
  // Fetch live map drivers
  const { data: liveDrivers = [] } = useQuery({
    queryKey: ['liveMapDrivers'],
    queryFn: async () => mockLiveMapDrivers,
    initialData: mockLiveMapDrivers,
  });

  // Dynamic import of mapbox-gl
  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      setMapError('Mapbox token not configured');
      return;
    }

    let map: mapboxgl.Map | null = null;
    let markers: Map<string, mapboxgl.Marker> = new Map();

    const initMap = async () => {
      try {
        // Dynamic import reduces initial bundle size
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        mapboxgl.default.accessToken = MAPBOX_TOKEN;
        
        map = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: MAP_STYLES[currentStyle],
          center: [121.0244, 14.5547],
          zoom: 11,
        });

        map.addControl(new mapboxgl.default.NavigationControl(), 'bottom-right');

        map.on('load', () => {
          setMapReady(true);
        });

        map.on('error', (e: any) => {
          if (e.error?.message?.includes('token')) {
            setMapError('Invalid Mapbox token');
          }
        });

      } catch (err) {
        setMapError('Failed to load map');
      }
    };

    initMap();

    return () => {
      map?.remove();
      markers.forEach(marker => marker.remove());
    };
  }, [currentStyle]);

  // Update markers when drivers change
  useEffect(() => {
    if (!mapReady) return;
    
    // Marker update logic here when map is ready
  }, [liveDrivers, mapReady]);

  if (mapError) {
    return <MapErrorState error={mapError} />;
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Loading State */}
      {!mapReady && <MapLoadingState />}
      
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2 bg-gray-800 rounded-lg shadow-lg text-white hover:bg-gray-700"
        >
          <Layers className="w-5 h-5" />
        </button>
        
        {showControls && (
          <div className="mt-2 p-2 bg-gray-800 rounded-lg shadow-lg space-y-2">
            <button
              onClick={() => setCurrentStyle('dark')}
              className={`flex items-center gap-2 w-full p-2 rounded ${currentStyle === 'dark' ? 'bg-orange-500' : 'hover:bg-gray-700'}`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-sm text-white">Dark</span>
            </button>
            <button
              onClick={() => setCurrentStyle('light')}
              className={`flex items-center gap-2 w-full p-2 rounded ${currentStyle === 'light' ? 'bg-orange-500' : 'hover:bg-gray-700'}`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-sm text-white">Light</span>
            </button>
            <button
              onClick={() => setCurrentStyle('satellite')}
              className={`flex items-center gap-2 w-full p-2 rounded ${currentStyle === 'satellite' ? 'bg-orange-500' : 'hover:bg-gray-700'}`}
            >
              <Navigation className="w-4 h-4" />
              <span className="text-sm text-white">Satellite</span>
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 p-3 bg-gray-800/90 rounded-lg shadow-lg">
        <h4 className="text-sm font-medium text-white mb-2">Driver Status</h4>
        <div className="space-y-1">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-300">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TacticalMap;
