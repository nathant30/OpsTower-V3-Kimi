import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUIStore } from '@/lib/stores/ui.store';
import { useWebSocket } from '@/lib/ws/useWebSocket';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mockLiveMapDrivers } from '@/lib/mocks/data';
import { Layers, Sun, Moon, Navigation } from 'lucide-react';
import type { LiveMapDriver } from '@/types/domain.types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v12',
};

// Status colors for driver markers
const STATUS_COLORS: Record<string, string> = {
  Online: '#22c55e',
  OnTrip: '#3b82f6',
  OnBreak: '#f59e0b',
  Offline: '#6b7280',
};

export function TacticalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const { sidebarCollapsed } = useUIStore();
  const queryClient = useQueryClient();
  
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'dark' | 'light' | 'satellite' | 'streets'>('dark');
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Fetch live map drivers
  const { data: liveDrivers = [] } = useQuery({
    queryKey: ['liveMapDrivers'],
    queryFn: async () => {
      // Return mock data for demo
      return mockLiveMapDrivers;
    },
    initialData: mockLiveMapDrivers,
  });

  // Check token on mount
  useEffect(() => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      setMapError('Mapbox token not configured');
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapError) return;
    
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured');
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLES.dark,
        center: [121.0244, 14.5547],
        zoom: 11,
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map.current.on('load', () => {
        // Mapbox loaded
        setMapReady(true);
      });

      map.current.on('error', (e: any) => {
        console.error('❌ Mapbox error:', e);
        if (e.error && e.error.message && e.error.message.includes('token')) {
          setMapError('Invalid Mapbox token');
        }
      });

      return () => {
        map.current?.remove();
        map.current = null;
      };
    } catch (err: any) {
      console.error('Map init error:', err);
      setMapError('Failed to initialize map');
    }
  }, [mapError]);

  // Handle resize when sidebar changes
  useEffect(() => {
    if (map.current && mapReady) {
      const timer = setTimeout(() => {
        map.current?.resize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sidebarCollapsed, mapReady]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      map.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create or update driver markers
  const updateDriverMarkers = useCallback((drivers: LiveMapDriver[]) => {
    if (!map.current) return;

    drivers.forEach((driver) => {
      const marker = driverMarkers.current.get(driver.driverId);
      const color = STATUS_COLORS[driver.status] || STATUS_COLORS.Offline;

      if (marker) {
        // Update existing marker position with smooth transition
        // Marker position will be updated below
        const targetLngLat: [number, number] = [driver.location.lng, driver.location.lat];
        
        // Simple animation using requestAnimationFrame would go here
        // For now, we'll just update the position
        marker.setLngLat(targetLngLat);
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'driver-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundColor = color;
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'driver-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 4px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
        `;
        tooltip.textContent = `${driver.name} (${driver.status})`;
        el.appendChild(tooltip);

        // Show tooltip on hover
        el.addEventListener('mouseenter', () => {
          tooltip.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
          tooltip.style.opacity = '0';
        });

        const newMarker = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([driver.location.lng, driver.location.lat])
          .addTo(map.current!);

        // Add click handler
        newMarker.getElement().addEventListener('click', () => {
          window.location.href = `/drivers/${driver.driverId}`;
        });

        driverMarkers.current.set(driver.driverId, newMarker);
      }
    });

    // Remove markers for drivers no longer in the list
    driverMarkers.current.forEach((marker, driverId) => {
      if (!drivers.find(d => d.driverId === driverId)) {
        marker.remove();
        driverMarkers.current.delete(driverId);
      }
    });
  }, []);

  // Update markers when drivers change
  useEffect(() => {
    if (mapReady && liveDrivers.length > 0) {
      updateDriverMarkers(liveDrivers);
    }
  }, [mapReady, liveDrivers, updateDriverMarkers]);

  // Listen for WebSocket driver location updates
  useWebSocket('driver.location.updated', (event) => {
    // Update the query cache with new location
    queryClient.setQueryData<LiveMapDriver[]>(['liveMapDrivers'], (old) => {
      if (!old) return old;
      return old.map((driver) =>
        driver.driverId === event.driverId
          ? {
              ...driver,
              location: {
                lat: event.lat,
                lng: event.lng,
                heading: event.heading,
                speed: event.speed,
                timestamp: event.timestamp,
              },
            }
          : driver
      );
    });
  });

  // Simulate driver movement every 5 seconds
  useEffect(() => {
    if (!mapReady) return;

    const simulateMovement = () => {
      queryClient.setQueryData<LiveMapDriver[]>(['liveMapDrivers'], (old) => {
        if (!old) return old;
        return old.map((driver) => {
          // Only move online drivers
          if (driver.status === 'Offline') return driver;

          // Random movement within ~50 meters
          const latChange = (Math.random() - 0.5) * 0.001;
          const lngChange = (Math.random() - 0.5) * 0.001;

          return {
            ...driver,
            location: {
              ...driver.location,
              lat: driver.location.lat + latChange,
              lng: driver.location.lng + lngChange,
              timestamp: new Date().toISOString(),
            },
          };
        });
      });
    };

    const interval = setInterval(simulateMovement, 5000);
    return () => clearInterval(interval);
  }, [mapReady, queryClient]);

  // Change map style
  const changeStyle = useCallback((style: 'dark' | 'light' | 'satellite' | 'streets') => {
    if (!map.current || !mapReady) return;
    
    try {
      // Remove traffic before style change
      if (map.current.getLayer('traffic')) {
        map.current.removeLayer('traffic');
      }
      if (map.current.getSource('traffic')) {
        map.current.removeSource('traffic');
      }
      
      map.current.setStyle(MAP_STYLES[style]);
      setCurrentStyle(style);
      setTrafficEnabled(false); // Reset traffic state
      
    } catch (err) {
      console.error('Style change error:', err);
    }
  }, [mapReady]);

  // Toggle traffic
  const toggleTraffic = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    if (trafficEnabled) {
      // Remove traffic
      try {
        if (map.current.getLayer('traffic')) {
          map.current.removeLayer('traffic');
        }
        if (map.current.getSource('traffic')) {
          map.current.removeSource('traffic');
        }
        setTrafficEnabled(false);
      } catch (err) {
        console.error('Remove traffic error:', err);
      }
    } else {
      // Add traffic - check if style is loaded
      try {
        const style = map.current.getStyle();
        if (!style) {
          console.warn('Map style not ready');
          return;
        }
        
        // Remove existing if any
        if (map.current.getLayer('traffic')) {
          map.current.removeLayer('traffic');
        }
        if (map.current.getSource('traffic')) {
          map.current.removeSource('traffic');
        }
        
        // Add traffic source
        map.current.addSource('traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        });
        
        // Add traffic layer
        map.current.addLayer({
          id: 'traffic',
          type: 'line',
          source: 'traffic',
          'source-layer': 'traffic',
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'congestion'], 'low'], '#4ade80',
              ['==', ['get', 'congestion'], 'moderate'], '#facc15',
              ['==', ['get', 'congestion'], 'heavy'], '#fb923c',
              ['==', ['get', 'congestion'], 'severe'], '#ef4444',
              '#9ca3af'
            ],
            'line-width': 2,
            'line-opacity': 0.8
          }
        }, 'road-label');
        
        setTrafficEnabled(true);
      } catch (err) {
        console.error('Add traffic error:', err);
        // Don't crash the map on traffic error
      }
    }
  }, [mapReady, trafficEnabled]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (mapError) {
    return (
      <div className="h-full w-full bg-[#0a0a0f] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-medium">⚠️ {mapError}</p>
          <p className="text-gray-500 text-sm mt-2">Please configure Mapbox token</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full rounded-xl overflow-hidden border border-white/10" />
      
      {/* Loading State */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] rounded-xl">
          <p className="text-gray-500">Loading Mapbox...</p>
        </div>
      )}

      {/* Driver Count Badge */}
      {mapReady && liveDrivers.length > 0 && (
        <div className="absolute top-3 left-3 z-40 bg-[#1a1a2e]/90 border border-white/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div
                  key={status}
                  className="w-3 h-3 rounded-full border-2 border-[#1a1a2e]"
                  style={{ backgroundColor: color }}
                  title={status}
                />
              ))}
            </div>
            <span className="text-xs text-gray-300">
              {liveDrivers.length} drivers online
            </span>
          </div>
        </div>
      )}

      {/* Map Controls - Always Visible */}
      {mapReady && (
        <div className="absolute top-3 right-3 z-50">
          {/* Toggle Button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="bg-[#1a1a2e] border border-white/20 rounded-lg p-2 text-white shadow-lg hover:bg-[#252545] transition-colors"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Controls Panel */}
          {showControls && (
            <div 
              className="absolute top-10 right-0 bg-[#1a1a2e] border border-white/20 rounded-xl p-3 shadow-xl min-w-[160px]"
              style={{ marginTop: '8px' }}
            >
              {/* Style Selector */}
              <div className="mb-3">
                <p className="text-[10px] text-gray-400 uppercase mb-2">Map Style</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => changeStyle('dark')}
                    className={`flex-1 p-2 rounded border ${
                      currentStyle === 'dark' 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-[#252545] border-white/10 text-gray-300 hover:text-white'
                    }`}
                    title="Dark"
                  >
                    <Moon className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => changeStyle('light')}
                    className={`flex-1 p-2 rounded border ${
                      currentStyle === 'light' 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-[#252545] border-white/10 text-gray-300 hover:text-white'
                    }`}
                    title="Light"
                  >
                    <Sun className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => changeStyle('satellite')}
                    className={`flex-1 p-2 rounded border ${
                      currentStyle === 'satellite' 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-[#252545] border-white/10 text-gray-300 hover:text-white'
                    }`}
                    title="Satellite"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Traffic Toggle */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-2">Traffic</p>
                <button
                  onClick={toggleTraffic}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded border text-xs ${
                    trafficEnabled 
                      ? 'bg-green-600/20 border-green-500/50 text-green-400' 
                      : 'bg-[#252545] border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>{trafficEnabled ? 'On' : 'Off'}</span>
                </button>
              </div>

              {/* Traffic Legend */}
              {trafficEnabled && (
                <div className="mt-3 pt-2 border-t border-white/10">
                  <p className="text-[9px] text-gray-400 uppercase mb-1">Traffic</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 rounded bg-green-400" />
                      <span className="text-[10px] text-gray-400">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 rounded bg-yellow-400" />
                      <span className="text-[10px] text-gray-400">Mod</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 rounded bg-orange-400" />
                      <span className="text-[10px] text-gray-400">Heavy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 rounded bg-red-400" />
                      <span className="text-[10px] text-gray-400">Severe</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TacticalMap;
