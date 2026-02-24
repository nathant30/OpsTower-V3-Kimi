/**
 * Live Drivers Hook
 * Real-time driver tracking with location updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { liveService } from '@/services/live/live.service';

export type DriverStatus = 'available' | 'on-trip' | 'offline' | 'idle';

export interface LiveDriver {
  driverId: string;
  driverName: string;
  status: DriverStatus;
  serviceType: 'taxi' | 'moto' | 'delivery' | 'car';
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  rating: number;
  avatar?: string;
  vehicle: {
    type: string;
    plate: string;
    color?: string;
  };
  currentRideId?: string;
  currentRide?: {
    pickup: string;
    dropoff: string;
    passengerName: string;
    eta: number;
  };
  lastUpdated: string;
  trustScore: number;
  totalTrips: number;
}

export interface DriversFilters {
  status?: DriverStatus | 'all';
  serviceType?: string | 'all';
  searchQuery?: string;
}

export interface UseLiveDriversReturn {
  drivers: LiveDriver[];
  filteredDrivers: LiveDriver[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  filters: DriversFilters;
  setFilters: (filters: DriversFilters) => void;
  stats: {
    total: number;
    available: number;
    onTrip: number;
    offline: number;
    idle: number;
  };
  selectedDriver: LiveDriver | null;
  setSelectedDriver: (driver: LiveDriver | null) => void;
}

const MOCK_DRIVERS: LiveDriver[] = [
  {
    driverId: 'DRV-001',
    driverName: 'Juan Santos',
    status: 'on-trip',
    serviceType: 'taxi',
    latitude: 14.5995,
    longitude: 120.9842,
    speed: 25,
    heading: 45,
    rating: 4.8,
    vehicle: { type: 'Toyota Vios', plate: 'ABC-123', color: 'White' },
    currentRideId: 'RID-001',
    currentRide: {
      pickup: 'Makati CBD',
      dropoff: 'BGC, Taguig',
      passengerName: 'Maria Cruz',
      eta: 8,
    },
    lastUpdated: new Date().toISOString(),
    trustScore: 92,
    totalTrips: 1250,
  },
  {
    driverId: 'DRV-002',
    driverName: 'Pedro Reyes',
    status: 'on-trip',
    serviceType: 'moto',
    latitude: 14.6095,
    longitude: 120.9942,
    speed: 35,
    heading: 90,
    rating: 4.5,
    vehicle: { type: 'Honda Click', plate: 'XYZ-789', color: 'Red' },
    currentRideId: 'RID-002',
    currentRide: {
      pickup: 'Quezon City',
      dropoff: 'Ortigas, Pasig',
      passengerName: 'Ana Lopez',
      eta: 5,
    },
    lastUpdated: new Date().toISOString(),
    trustScore: 85,
    totalTrips: 890,
  },
  {
    driverId: 'DRV-003',
    driverName: 'Miguel Torres',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.5895,
    longitude: 120.9742,
    speed: 0,
    heading: 0,
    rating: 4.9,
    vehicle: { type: 'Toyota Vios', plate: 'DEF-456', color: 'Silver' },
    lastUpdated: new Date().toISOString(),
    trustScore: 96,
    totalTrips: 2100,
  },
  {
    driverId: 'DRV-004',
    driverName: 'Ricardo Lim',
    status: 'on-trip',
    serviceType: 'taxi',
    latitude: 14.6195,
    longitude: 121.0042,
    speed: 18,
    heading: 180,
    rating: 4.7,
    vehicle: { type: 'Honda City', plate: 'GHI-789', color: 'Black' },
    currentRideId: 'RID-005',
    currentRide: {
      pickup: 'BGC, Taguig',
      dropoff: 'Ortigas, Pasig',
      passengerName: 'Isabella Cruz',
      eta: 12,
    },
    lastUpdated: new Date().toISOString(),
    trustScore: 88,
    totalTrips: 1500,
  },
  {
    driverId: 'DRV-005',
    driverName: 'Carlos Mendez',
    status: 'idle',
    serviceType: 'delivery',
    latitude: 14.5795,
    longitude: 120.9642,
    speed: 0,
    heading: 0,
    rating: 4.6,
    vehicle: { type: 'Motorcycle', plate: 'JKL-012', color: 'Blue' },
    lastUpdated: new Date().toISOString(),
    trustScore: 82,
    totalTrips: 650,
  },
  {
    driverId: 'DRV-006',
    driverName: 'Fernando Cruz',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.6295,
    longitude: 120.9942,
    speed: 15,
    heading: 270,
    rating: 4.8,
    vehicle: { type: 'Hyundai Accent', plate: 'MNO-345', color: 'Gray' },
    lastUpdated: new Date().toISOString(),
    trustScore: 90,
    totalTrips: 1800,
  },
  {
    driverId: 'DRV-007',
    driverName: 'Roberto Garcia',
    status: 'offline',
    serviceType: 'moto',
    latitude: 14.5595,
    longitude: 120.9542,
    speed: 0,
    heading: 0,
    rating: 4.3,
    vehicle: { type: 'Yamaha Mio', plate: 'PQR-678', color: 'Black' },
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    trustScore: 75,
    totalTrips: 420,
  },
  {
    driverId: 'DRV-008',
    driverName: 'Alberto Flores',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.6395,
    longitude: 121.0142,
    speed: 42,
    heading: 135,
    rating: 4.9,
    vehicle: { type: 'Toyota Vios', plate: 'STU-901', color: 'White' },
    lastUpdated: new Date().toISOString(),
    trustScore: 94,
    totalTrips: 2300,
  },
  {
    driverId: 'DRV-009',
    driverName: 'Diego Ramos',
    status: 'available',
    serviceType: 'moto',
    latitude: 14.5695,
    longitude: 120.9742,
    speed: 28,
    heading: 60,
    rating: 4.7,
    vehicle: { type: 'Honda Beat', plate: 'VWX-234', color: 'Red' },
    lastUpdated: new Date().toISOString(),
    trustScore: 87,
    totalTrips: 780,
  },
  {
    driverId: 'DRV-010',
    driverName: 'Eduardo Santos',
    status: 'on-trip',
    serviceType: 'delivery',
    latitude: 14.6495,
    longitude: 120.9642,
    speed: 30,
    heading: 315,
    rating: 4.6,
    vehicle: { type: 'Motorcycle', plate: 'YZA-567', color: 'Blue' },
    currentRideId: 'RID-008',
    currentRide: {
      pickup: 'Manila City Hall',
      dropoff: 'Binondo, Manila',
      passengerName: 'Carlos Mendoza',
      eta: 15,
    },
    lastUpdated: new Date().toISOString(),
    trustScore: 83,
    totalTrips: 540,
  },
  {
    driverId: 'DRV-011',
    driverName: 'Jose Martinez',
    status: 'offline',
    serviceType: 'taxi',
    latitude: 14.5495,
    longitude: 121.0242,
    speed: 0,
    heading: 0,
    rating: 4.4,
    vehicle: { type: 'Toyota Innova', plate: 'BCD-890', color: 'Silver' },
    lastUpdated: new Date(Date.now() - 7200000).toISOString(),
    trustScore: 79,
    totalTrips: 320,
  },
  {
    driverId: 'DRV-012',
    driverName: 'Luis Hernandez',
    status: 'available',
    serviceType: 'car',
    latitude: 14.6095,
    longitude: 120.9542,
    speed: 0,
    heading: 0,
    rating: 4.8,
    vehicle: { type: 'Honda Civic', plate: 'EFG-123', color: 'Black' },
    lastUpdated: new Date().toISOString(),
    trustScore: 91,
    totalTrips: 1650,
  },
];

// Simulate driver movement
function simulateDriverMovement(drivers: LiveDriver[]): LiveDriver[] {
  return drivers.map((driver) => {
    if (driver.status === 'offline' || driver.speed === 0) return driver;

    // Small random movement based on speed and heading
    const speedFactor = driver.speed * 0.0001;
    const headingRad = (driver.heading * Math.PI) / 180;
    
    const latChange = Math.cos(headingRad) * speedFactor * (0.8 + Math.random() * 0.4);
    const lngChange = Math.sin(headingRad) * speedFactor * (0.8 + Math.random() * 0.4);

    return {
      ...driver,
      latitude: driver.latitude + latChange,
      longitude: driver.longitude + lngChange,
      lastUpdated: new Date().toISOString(),
    };
  });
}

export function useLiveDrivers(
  autoRefreshInterval = 10000
): UseLiveDriversReturn {
  const [drivers, setDrivers] = useState<LiveDriver[]>(MOCK_DRIVERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [filters, setFilters] = useState<DriversFilters>({
    status: 'all',
    serviceType: 'all',
    searchQuery: '',
  });
  const [selectedDriver, setSelectedDriver] = useState<LiveDriver | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch drivers
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, this would call the real service
      // const data = await liveService.getDrivers();
      
      // Simulate API call with movement
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDrivers((prev) => simulateDriverMovement(prev));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch drivers'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, refresh]);

  // WebSocket simulation for real-time updates
  useEffect(() => {
    // Simulate WebSocket connection
    const simulateWebSocket = () => {
      const interval = setInterval(() => {
        // Randomly update a driver's status
        setDrivers((prev) => {
          const idx = Math.floor(Math.random() * prev.length);
          const driver = prev[idx];
          
          // 10% chance to change status
          if (Math.random() < 0.1) {
            const statuses: DriverStatus[] = ['available', 'on-trip', 'offline', 'idle'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            const updated = [...prev];
            updated[idx] = { 
              ...driver, 
              status: newStatus,
              lastUpdated: new Date().toISOString(),
            };
            return updated;
          }
          return prev;
        });
      }, 5000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateWebSocket();
    return cleanup;
  }, []);

  // Filter drivers
  const filteredDrivers = drivers.filter((driver) => {
    if (filters.status && filters.status !== 'all' && driver.status !== filters.status) {
      return false;
    }
    if (filters.serviceType && filters.serviceType !== 'all' && driver.serviceType !== filters.serviceType) {
      return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = driver.driverName.toLowerCase().includes(query);
      const matchesId = driver.driverId.toLowerCase().includes(query);
      const matchesPlate = driver.vehicle.plate.toLowerCase().includes(query);
      if (!matchesName && !matchesId && !matchesPlate) return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: drivers.length,
    available: drivers.filter((d) => d.status === 'available').length,
    onTrip: drivers.filter((d) => d.status === 'on-trip').length,
    offline: drivers.filter((d) => d.status === 'offline').length,
    idle: drivers.filter((d) => d.status === 'idle').length,
  };

  return {
    drivers,
    filteredDrivers,
    isLoading,
    error,
    lastUpdated,
    refresh,
    filters,
    setFilters,
    stats,
    selectedDriver,
    setSelectedDriver,
  };
}

export default useLiveDrivers;
