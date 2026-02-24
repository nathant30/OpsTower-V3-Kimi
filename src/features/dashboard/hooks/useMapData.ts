/**
 * Custom hook for managing live map data
 * Provides mock driver positions, order locations, heatmap data, and zone information
 * Updates positions every 10 seconds to simulate live tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockDrivers, mockOrders } from '@/lib/mocks/data';
import type { LiveMapDriver, LiveMapOrder } from '@/types/domain.types';

// Metro Manila bounds for random position generation
const MM_BOUNDS = {
  lat: { min: 14.35, max: 14.75 },
  lng: { min: 120.95, max: 121.15 },
};

// Predefined zones for Metro Manila
const ZONES = [
  { id: 'makati', name: 'Makati CBD', lat: 14.5547, lng: 121.0244, radius: 0.015 },
  { id: 'bgc', name: 'Bonifacio Global City', lat: 14.5408, lng: 121.0503, radius: 0.012 },
  { id: 'ortigas', name: 'Ortigas Center', lat: 14.5853, lng: 121.0613, radius: 0.012 },
  { id: 'quezon-ave', name: 'Quezon Avenue', lat: 14.6450, lng: 121.0300, radius: 0.020 },
  { id: 'manila', name: 'Manila City', lat: 14.5995, lng: 120.9842, radius: 0.025 },
  { id: 'pasay', name: 'Pasay City', lat: 14.5378, lng: 121.0014, radius: 0.020 },
  { id: 'mandaluyong', name: 'Mandaluyong', lat: 14.5794, lng: 121.0359, radius: 0.015 },
  { id: 'pasig', name: 'Pasig City', lat: 14.5764, lng: 121.0851, radius: 0.020 },
  { id: 'taguig', name: 'Taguig City', lat: 14.5176, lng: 121.0509, radius: 0.020 },
  { id: 'paranaque', name: 'Paranaque City', lat: 14.4793, lng: 121.0198, radius: 0.020 },
  { id: 'san-juan', name: 'San Juan City', lat: 14.6050, lng: 121.0300, radius: 0.010 },
  { id: 'marikina', name: 'Marikina City', lat: 14.6500, lng: 121.1000, radius: 0.018 },
];

// Heat map data points
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface ZoneInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeOrders: number;
  nearbyDrivers: number;
}

interface UseMapDataReturn {
  drivers: LiveMapDriver[];
  orders: LiveMapOrder[];
  heatmapData: HeatmapPoint[];
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshData: () => void;
  getZoneAtLocation: (lat: number, lng: number) => ZoneInfo | null;
}

const randomFloat = (min: number, max: number, decimals = 6): number => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Generate initial driver positions from mock data
const generateInitialDrivers = (): LiveMapDriver[] => {
  return mockDrivers
    .filter(d => d.onlineStatus === 'Online' || d.onlineStatus === 'OnTrip')
    .map(driver => {
      // Start with a position near their home zone or random
      const baseLat = driver.personalInfo.address?.coordinates?.lat || randomFloat(MM_BOUNDS.lat.min, MM_BOUNDS.lat.max);
      const baseLng = driver.personalInfo.address?.coordinates?.lng || randomFloat(MM_BOUNDS.lng.min, MM_BOUNDS.lng.max);
      
      return {
        driverId: driver.driverId,
        name: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
        status: driver.onlineStatus,
        location: {
          lat: baseLat,
          lng: baseLng,
          timestamp: new Date().toISOString(),
        },
        vehicleType: driver.vehicle ? 'Taxi' : 'Moto',
        currentOrderId: driver.onlineStatus === 'OnTrip' 
          ? mockOrders.find(o => o.driver?.driverId === driver.driverId)?.orderId 
          : undefined,
        trustScore: driver.trustScore.overall,
      };
    });
};

// Generate active orders from mock data
const generateActiveOrders = (): LiveMapOrder[] => {
  const activeStatuses = ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'];
  
  return mockOrders
    .filter(o => activeStatuses.includes(o.status))
    .map(order => {
      const driver = order.driver ? mockDrivers.find(d => d.driverId === order.driver?.driverId) : null;
      
      return {
        orderId: order.orderId,
        status: order.status,
        serviceType: order.serviceType,
        pickup: {
          lat: order.route.pickup.lat,
          lng: order.route.pickup.lng,
          timestamp: new Date().toISOString(),
        },
        dropoff: {
          lat: order.route.dropoff.lat,
          lng: order.route.dropoff.lng,
          timestamp: new Date().toISOString(),
        },
        driverLocation: driver ? {
          lat: driver.personalInfo.address?.coordinates?.lat || order.route.pickup.lat,
          lng: driver.personalInfo.address?.coordinates?.lng || order.route.pickup.lng,
          timestamp: new Date().toISOString(),
        } : undefined,
        priority: order.priority,
      };
    });
};

// Generate heatmap data around high-demand zones
const generateHeatmapData = (): HeatmapPoint[] => {
  const points: HeatmapPoint[] = [];
  
  // Generate points around each zone with varying intensity
  ZONES.forEach(zone => {
    const baseIntensity = Math.random();
    const numPoints = Math.floor(baseIntensity * 20) + 5;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * zone.radius;
      
      points.push({
        lat: zone.lat + Math.sin(angle) * distance,
        lng: zone.lng + Math.cos(angle) * distance,
        intensity: Math.max(0.1, baseIntensity + (Math.random() - 0.5) * 0.4),
      });
    }
  });
  
  return points;
};

// Find nearest zone to a location
const findNearestZone = (lat: number, lng: number) => {
  let nearest = ZONES[0];
  let minDistance = Infinity;
  
  ZONES.forEach(zone => {
    const distance = Math.sqrt(
      Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = zone;
    }
  });
  
  return { zone: nearest, distance: minDistance };
};

export function useMapData(): UseMapDataReturn {
  const [drivers, setDrivers] = useState<LiveMapDriver[]>([]);
  const [orders, setOrders] = useState<LiveMapOrder[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const driversRef = useRef<LiveMapDriver[]>([]);
  useEffect(() => {
    driversRef.current = drivers;
  }, [drivers]);
  
  // Initialize data
  useEffect(() => {
    setDrivers(generateInitialDrivers());
    setOrders(generateActiveOrders());
    setHeatmapData(generateHeatmapData());
    setIsLoading(false);
    setLastUpdated(new Date());
  }, []);
  
  // Update driver positions every 10 seconds
  useEffect(() => {
    const updatePositions = () => {
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => {
          // Small random movement (simulating driving)
          const moveLat = (Math.random() - 0.5) * 0.003;
          const moveLng = (Math.random() - 0.5) * 0.003;
          
          const newLat = Math.max(
            MM_BOUNDS.lat.min,
            Math.min(MM_BOUNDS.lat.max, driver.location.lat + moveLat)
          );
          const newLng = Math.max(
            MM_BOUNDS.lng.min,
            Math.min(MM_BOUNDS.lng.max, driver.location.lng + moveLng)
          );
          
          return {
            ...driver,
            location: {
              lat: newLat,
              lng: newLng,
              timestamp: new Date().toISOString(),
            },
          };
        })
      );
      
      // Occasionally update heatmap data
      if (Math.random() > 0.7) {
        setHeatmapData(generateHeatmapData());
      }
      
      setLastUpdated(new Date());
    };
    
    const interval = setInterval(updatePositions, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Get zone info at a location
  const getZoneAtLocation = useCallback((lat: number, lng: number): ZoneInfo | null => {
    const { zone } = findNearestZone(lat, lng);
    
    // Count active orders near this location
    const nearbyOrders = orders.filter(o => {
      const distance = Math.sqrt(
        Math.pow(o.pickup.lat - lat, 2) + Math.pow(o.pickup.lng - lng, 2)
      );
      return distance < 0.02; // ~2km radius
    });
    
    // Count nearby drivers
    const nearbyDrivers = drivers.filter(d => {
      const distance = Math.sqrt(
        Math.pow(d.location.lat - lat, 2) + Math.pow(d.location.lng - lng, 2)
      );
      return distance < 0.02;
    });
    
    return {
      id: zone.id,
      name: zone.name,
      lat,
      lng,
      activeOrders: nearbyOrders.length,
      nearbyDrivers: nearbyDrivers.length,
    };
  }, [drivers, orders]);
  
  // Manual refresh function
  const refreshData = useCallback(() => {
    setDrivers(generateInitialDrivers());
    setOrders(generateActiveOrders());
    setHeatmapData(generateHeatmapData());
    setLastUpdated(new Date());
  }, []);
  
  return {
    drivers,
    orders,
    heatmapData,
    isLoading,
    lastUpdated,
    refreshData,
    getZoneAtLocation,
  };
}

export type { HeatmapPoint, ZoneInfo };
