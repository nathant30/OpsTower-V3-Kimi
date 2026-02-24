/**
 * Live Rides Hook
 * Real-time ride monitoring and management
 */

import { useState, useEffect, useCallback } from 'react';
import { liveService } from '@/services/live/live.service';

export type RideStatus = 
  | 'requested' 
  | 'accepted' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'arrived' 
  | 'assigned';

export interface RideDriver {
  driverId: string;
  name: string;
  phone: string;
  rating: number;
  avatar?: string;
  vehicle?: {
    type: string;
    plate: string;
    color?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
}

export interface RidePassenger {
  passengerId: string;
  name: string;
  phone: string;
  rating: number;
  avatar?: string;
}

export interface RideLocation {
  address: string;
  lat: number;
  lng: number;
  name?: string;
}

export interface LiveRide {
  rideId: string;
  status: RideStatus;
  serviceType: 'taxi' | 'moto' | 'delivery' | 'car';
  priority: 'normal' | 'high' | 'urgent';
  passenger: RidePassenger;
  driver?: RideDriver;
  pickup: RideLocation;
  dropoff: RideLocation;
  fare: {
    base: number;
    distance: number;
    time: number;
    surge: number;
    discount: number;
    total: number;
    currency: string;
  };
  timeline: {
    requestedAt: string;
    acceptedAt?: string;
    arrivedAt?: string;
    pickedUpAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    estimatedDuration: number;
    actualDuration?: number;
  };
  paymentMethod: 'cash' | 'gcash' | 'maya' | 'card' | 'wallet';
  distance: number;
  eta?: number;
  notes?: string;
  isEmergency?: boolean;
}

export interface RidesFilters {
  status?: RideStatus | 'all';
  serviceType?: string | 'all';
  priority?: string | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  } | null;
  searchQuery?: string;
}

export interface UseLiveRidesReturn {
  rides: LiveRide[];
  filteredRides: LiveRide[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  filters: RidesFilters;
  setFilters: (filters: RidesFilters) => void;
  stats: {
    total: number;
    requested: number;
    accepted: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  selectedRide: LiveRide | null;
  setSelectedRide: (ride: LiveRide | null) => void;
  cancelRide: (rideId: string, reason: string) => Promise<void>;
  reassignRide: (rideId: string, newDriverId: string) => void;
  isCancelling: boolean;
  isReassigning: boolean;
}

const MOCK_RIDES: LiveRide[] = [
  {
    rideId: 'RID-001',
    status: 'in-progress',
    serviceType: 'taxi',
    priority: 'normal',
    driver: {
      driverId: 'DRV-001',
      name: 'Juan Santos',
      phone: '+63 912 345 6789',
      rating: 4.8,
      vehicle: { type: 'Toyota Vios', plate: 'ABC-123', color: 'White' },
      location: { lat: 14.5995, lng: 120.9842 },
    },
    passenger: {
      passengerId: 'PAS-001',
      name: 'Maria Cruz',
      phone: '+63 917 123 4567',
      rating: 4.9,
    },
    pickup: {
      address: 'Makati CBD, Metro Manila',
      lat: 14.5547,
      lng: 121.0244,
      name: 'Ayala Tower One',
    },
    dropoff: {
      address: 'BGC, Taguig',
      lat: 14.5509,
      lng: 121.0505,
      name: 'Market! Market!',
    },
    fare: {
      base: 45,
      distance: 156.50,
      time: 45,
      surge: 1.2,
      discount: 0,
      total: 285.50,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
      arrivedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      pickedUpAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      estimatedDuration: 25,
      actualDuration: 15,
    },
    paymentMethod: 'gcash',
    distance: 5.2,
    eta: 8,
  },
  {
    rideId: 'RID-002',
    status: 'accepted',
    serviceType: 'moto',
    priority: 'normal',
    driver: {
      driverId: 'DRV-002',
      name: 'Pedro Reyes',
      phone: '+63 918 765 4321',
      rating: 4.5,
      vehicle: { type: 'Honda Click', plate: 'XYZ-789', color: 'Red' },
      location: { lat: 14.6095, lng: 120.9942 },
    },
    passenger: {
      passengerId: 'PAS-002',
      name: 'Ana Lopez',
      phone: '+63 919 876 5432',
      rating: 4.7,
    },
    pickup: {
      address: 'Quezon City, Metro Manila',
      lat: 14.6760,
      lng: 121.0437,
      name: 'SM North EDSA',
    },
    dropoff: {
      address: 'Ortigas, Pasig',
      lat: 14.5853,
      lng: 121.0614,
      name: 'Ortigas Center',
    },
    fare: {
      base: 30,
      distance: 62.50,
      time: 25,
      surge: 1.0,
      discount: 0,
      total: 125.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      estimatedDuration: 18,
    },
    paymentMethod: 'maya',
    distance: 3.8,
    eta: 3,
  },
  {
    rideId: 'RID-003',
    status: 'requested',
    serviceType: 'delivery',
    priority: 'high',
    passenger: {
      passengerId: 'PAS-003',
      name: 'Carlos Mendoza',
      phone: '+63 915 234 5678',
      rating: 4.6,
    },
    pickup: {
      address: 'Manila City Hall',
      lat: 14.5895,
      lng: 120.9742,
      name: 'Manila City Hall',
    },
    dropoff: {
      address: 'Binondo, Manila',
      lat: 14.6006,
      lng: 120.9695,
      name: 'Binondo Church',
    },
    fare: {
      base: 50,
      distance: 87.50,
      time: 30,
      surge: 1.1,
      discount: 0,
      total: 180.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      estimatedDuration: 22,
    },
    paymentMethod: 'cash',
    distance: 4.1,
    notes: 'Fragile items - handle with care',
  },
  {
    rideId: 'RID-004',
    status: 'completed',
    serviceType: 'taxi',
    priority: 'normal',
    driver: {
      driverId: 'DRV-003',
      name: 'Miguel Torres',
      phone: '+63 913 456 7890',
      rating: 4.9,
      vehicle: { type: 'Toyota Vios', plate: 'DEF-456', color: 'Silver' },
    },
    passenger: {
      passengerId: 'PAS-004',
      name: 'Sofia Garcia',
      phone: '+63 916 345 6789',
      rating: 4.8,
    },
    pickup: {
      address: 'Airport, Pasay',
      lat: 14.5086,
      lng: 121.0194,
      name: 'NAIA Terminal 3',
    },
    dropoff: {
      address: 'Makati CBD',
      lat: 14.5547,
      lng: 121.0244,
      name: 'Greenbelt',
    },
    fare: {
      base: 60,
      distance: 270,
      time: 75,
      surge: 1.0,
      discount: 15,
      total: 450.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 53 * 60 * 1000).toISOString(),
      arrivedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      pickedUpAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      estimatedDuration: 35,
      actualDuration: 35,
    },
    paymentMethod: 'gcash',
    distance: 8.5,
  },
  {
    rideId: 'RID-005',
    status: 'in-progress',
    serviceType: 'taxi',
    priority: 'urgent',
    driver: {
      driverId: 'DRV-004',
      name: 'Ricardo Lim',
      phone: '+63 914 567 8901',
      rating: 4.7,
      vehicle: { type: 'Honda City', plate: 'GHI-789', color: 'Black' },
      location: { lat: 14.6195, lng: 121.0042 },
    },
    passenger: {
      passengerId: 'PAS-005',
      name: 'Isabella Cruz',
      phone: '+63 917 678 9012',
      rating: 4.5,
    },
    pickup: {
      address: 'BGC, Taguig',
      lat: 14.5509,
      lng: 121.0505,
      name: 'High Street',
    },
    dropoff: {
      address: 'Ortigas, Pasig',
      lat: 14.5853,
      lng: 121.0614,
      name: 'Robinsons Galleria',
    },
    fare: {
      base: 45,
      distance: 112.50,
      time: 30,
      surge: 1.3,
      discount: 0,
      total: 195.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      arrivedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
      pickedUpAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      estimatedDuration: 20,
      actualDuration: 20,
    },
    paymentMethod: 'maya',
    distance: 4.5,
    eta: 12,
    isEmergency: true,
  },
  {
    rideId: 'RID-006',
    status: 'cancelled',
    serviceType: 'moto',
    priority: 'normal',
    driver: {
      driverId: 'DRV-005',
      name: 'Carlos Mendez',
      phone: '+63 915 678 9012',
      rating: 4.6,
    },
    passenger: {
      passengerId: 'PAS-006',
      name: 'Roberto Tan',
      phone: '+63 918 901 2345',
      rating: 4.3,
    },
    pickup: {
      address: 'Cubao, Quezon City',
      lat: 14.6195,
      lng: 121.0590,
      name: 'Araneta City',
    },
    dropoff: {
      address: 'Marikina City',
      lat: 14.6507,
      lng: 121.1029,
      name: 'Marikina Sports Center',
    },
    fare: {
      base: 30,
      distance: 87.50,
      time: 35,
      surge: 1.0,
      discount: 0,
      total: 155.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 118 * 60 * 1000).toISOString(),
      cancelledAt: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
      estimatedDuration: 28,
    },
    paymentMethod: 'cash',
    distance: 5.5,
  },
  {
    rideId: 'RID-007',
    status: 'arrived',
    serviceType: 'taxi',
    priority: 'normal',
    driver: {
      driverId: 'DRV-008',
      name: 'Alberto Flores',
      phone: '+63 919 012 3456',
      rating: 4.9,
      vehicle: { type: 'Toyota Vios', plate: 'STU-901', color: 'White' },
      location: { lat: 14.6395, lng: 121.0142 },
    },
    passenger: {
      passengerId: 'PAS-007',
      name: 'Patricia Reyes',
      phone: '+63 917 123 7890',
      rating: 4.8,
    },
    pickup: {
      address: 'Mandaluyong City',
      lat: 14.5794,
      lng: 121.0359,
      name: 'SM Megamall',
    },
    dropoff: {
      address: 'San Juan City',
      lat: 14.5995,
      lng: 121.0348,
      name: 'Greenhills Shopping Center',
    },
    fare: {
      base: 45,
      distance: 75,
      time: 25,
      surge: 1.0,
      discount: 0,
      total: 145.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      arrivedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      estimatedDuration: 18,
    },
    paymentMethod: 'card',
    distance: 3.2,
    eta: 0,
  },
  {
    rideId: 'RID-008',
    status: 'assigned',
    serviceType: 'delivery',
    priority: 'high',
    driver: {
      driverId: 'DRV-010',
      name: 'Eduardo Santos',
      phone: '+63 916 789 0123',
      rating: 4.6,
    },
    passenger: {
      passengerId: 'PAS-008',
      name: 'Linda Wong',
      phone: '+63 918 345 6789',
      rating: 4.9,
    },
    pickup: {
      address: 'Manila City Hall',
      lat: 14.5895,
      lng: 120.9742,
      name: 'Manila City Hall',
    },
    dropoff: {
      address: 'Binondo, Manila',
      lat: 14.6006,
      lng: 120.9695,
      name: 'Lucky Chinatown Mall',
    },
    fare: {
      base: 55,
      distance: 100,
      time: 35,
      surge: 1.15,
      discount: 0,
      total: 210.00,
      currency: 'PHP',
    },
    timeline: {
      requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      estimatedDuration: 25,
    },
    paymentMethod: 'gcash',
    distance: 4.8,
    eta: 15,
    notes: 'Urgent document delivery',
  },
];

export function useLiveRides(
  autoRefreshInterval = 10000
): UseLiveRidesReturn {
  const [rides, setRides] = useState<LiveRide[]>(MOCK_RIDES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [filters, setFilters] = useState<RidesFilters>({
    status: 'all',
    serviceType: 'all',
    priority: 'all',
    dateRange: null,
    searchQuery: '',
  });
  const [selectedRide, setSelectedRide] = useState<LiveRide | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  // Refresh rides
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, this would call the real service
      // const data = await liveService.getRides();
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simulate random status updates
      setRides((prev) => {
        return prev.map((ride) => {
          // 5% chance to update ETA or status
          if (Math.random() < 0.05 && ride.eta && ride.eta > 0) {
            return { ...ride, eta: Math.max(0, ride.eta - 1) };
          }
          return ride;
        });
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rides'));
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

  // Cancel ride
  const cancelRide = useCallback(async (rideId: string, reason: string) => {
    setIsCancelling(true);
    
    try {
      // In production: await liveService.cancelRide(rideId, reason);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setRides((prev) =>
        prev.map((ride) =>
          ride.rideId === rideId
            ? {
                ...ride,
                status: 'cancelled',
                timeline: {
                  ...ride.timeline,
                  cancelledAt: new Date().toISOString(),
                },
              }
            : ride
        )
      );
      
      if (selectedRide?.rideId === rideId) {
        setSelectedRide((prev) =>
          prev
            ? {
                ...prev,
                status: 'cancelled',
                timeline: {
                  ...prev.timeline,
                  cancelledAt: new Date().toISOString(),
                },
              }
            : null
        );
      }
    } finally {
      setIsCancelling(false);
    }
  }, [selectedRide]);

  // Reassign ride
  const reassignRide = useCallback(async (rideId: string, newDriverId: string) => {
    setIsReassigning(true);
    
    try {
      // In production: await liveService.reassignRide(rideId, newDriverId);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // This would update the ride with new driver info
      setRides((prev) =>
        prev.map((ride) =>
          ride.rideId === rideId
            ? {
                ...ride,
                status: 'assigned',
                driver: {
                  ...(ride.driver || {
                    driverId: '',
                    name: '',
                    phone: '',
                    rating: 0,
                  }),
                  driverId: newDriverId,
                  name: 'New Driver (Reassigned)',
                },
              }
            : ride
        )
      );
    } finally {
      setIsReassigning(false);
    }
  }, []);

  // Filter rides
  const filteredRides = rides.filter((ride) => {
    if (filters.status && filters.status !== 'all' && ride.status !== filters.status) {
      return false;
    }
    if (filters.serviceType && filters.serviceType !== 'all' && ride.serviceType !== filters.serviceType) {
      return false;
    }
    if (filters.priority && filters.priority !== 'all' && ride.priority !== filters.priority) {
      return false;
    }
    if (filters.dateRange) {
      const rideDate = new Date(ride.timeline.requestedAt);
      if (rideDate < filters.dateRange.start || rideDate > filters.dateRange.end) {
        return false;
      }
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesId = ride.rideId.toLowerCase().includes(query);
      const matchesPassenger = ride.passenger.name.toLowerCase().includes(query);
      const matchesDriver = ride.driver?.name.toLowerCase().includes(query);
      const matchesPickup = ride.pickup.address.toLowerCase().includes(query);
      if (!matchesId && !matchesPassenger && !matchesDriver && !matchesPickup) return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: rides.length,
    requested: rides.filter((r) => r.status === 'requested').length,
    accepted: rides.filter((r) => r.status === 'accepted' || r.status === 'assigned').length,
    inProgress: rides.filter((r) => r.status === 'in-progress' || r.status === 'arrived').length,
    completed: rides.filter((r) => r.status === 'completed').length,
    cancelled: rides.filter((r) => r.status === 'cancelled').length,
  };

  return {
    rides,
    filteredRides,
    isLoading,
    error,
    lastUpdated,
    refresh,
    filters,
    setFilters,
    stats,
    selectedRide,
    setSelectedRide,
    cancelRide,
    reassignRide,
    isCancelling,
    isReassigning,
  };
}

export default useLiveRides;
