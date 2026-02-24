/**
 * Dispatch Hook
 * Ride assignment and dispatch management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { dispatchService } from '@/services/dispatch/dispatch.service';

export type RideStatus = 'requested' | 'assigned' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
export type DriverStatus = 'available' | 'on-trip' | 'offline' | 'idle';

export interface DispatchRide {
  rideId: string;
  status: RideStatus;
  serviceType: 'taxi' | 'moto' | 'delivery' | 'car';
  priority: 'normal' | 'high' | 'urgent';
  passenger: {
    passengerId: string;
    name: string;
    phone: string;
  };
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
  };
  fare: number;
  paymentMethod: string;
  requestedAt: string;
  notes?: string;
}

export interface DispatchDriver {
  driverId: string;
  driverName: string;
  status: DriverStatus;
  serviceType: string;
  latitude: number;
  longitude: number;
  rating: number;
  trustScore: number;
  totalTrips: number;
  vehicle?: {
    type: string;
    plate: string;
    color?: string;
  };
  currentRideId?: string;
  lastAssignmentAt?: string;
}

export interface Assignment {
  id: string;
  rideId: string;
  ridePickup: string;
  rideDropoff: string;
  driverId: string;
  driverName: string;
  assignedAt: string;
  assignedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  distance: number;
  estimatedEta: number;
}

export interface UseDispatchReturn {
  // Data
  pendingRides: DispatchRide[];
  availableDrivers: DispatchDriver[];
  assignments: Assignment[];
  
  // Loading states
  isLoadingRides: boolean;
  isLoadingDrivers: boolean;
  isAssigning: boolean;
  
  // Error states
  error: Error | null;
  
  // Selection
  selectedRide: DispatchRide | null;
  selectedDriver: DispatchDriver | null;
  setSelectedRide: (ride: DispatchRide | null) => void;
  setSelectedDriver: (driver: DispatchDriver | null) => void;
  
  // Actions
  assignRide: (rideId: string, driverId: string) => Promise<void>;
  cancelAssignment: (assignmentId: string) => Promise<void>;
  refresh: () => Promise<void>;
  autoSuggestDriver: (rideId: string) => DispatchDriver | null;
  
  // Search
  rideSearchQuery: string;
  setRideSearchQuery: (query: string) => void;
  driverSearchQuery: string;
  setDriverSearchQuery: (query: string) => void;
  
  // Filters
  filteredRides: DispatchRide[];
  filteredDrivers: DispatchDriver[];
  
  // Stats
  stats: {
    pendingCount: number;
    availableCount: number;
    assignedToday: number;
    avgAssignmentTime: number;
  };
  
  // Utility
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  getDriverDistanceToPickup: (driver: DispatchDriver, ride: DispatchRide) => number;
  getRecommendedDrivers: (ride: DispatchRide) => DispatchDriver[];
}

// Mock data
const MOCK_PENDING_RIDES: DispatchRide[] = [
  {
    rideId: 'RID-101',
    status: 'requested',
    serviceType: 'taxi',
    priority: 'normal',
    passenger: { passengerId: 'PAS-101', name: 'Maria Cruz', phone: '+63 917 123 4567' },
    pickup: { address: 'Makati CBD, Metro Manila', lat: 14.5995, lng: 120.9842 },
    dropoff: { address: 'BGC, Taguig', lat: 14.5509, lng: 121.0505 },
    fare: 285.5,
    paymentMethod: 'gcash',
    requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    rideId: 'RID-102',
    status: 'requested',
    serviceType: 'moto',
    priority: 'high',
    passenger: { passengerId: 'PAS-102', name: 'Ana Lopez', phone: '+63 919 876 5432' },
    pickup: { address: 'Quezon City, Metro Manila', lat: 14.6095, lng: 120.9942 },
    dropoff: { address: 'Ortigas, Pasig', lat: 14.5853, lng: 121.0614 },
    fare: 125.0,
    paymentMethod: 'maya',
    requestedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    rideId: 'RID-103',
    status: 'requested',
    serviceType: 'delivery',
    priority: 'urgent',
    passenger: { passengerId: 'PAS-103', name: 'Carlos Mendoza', phone: '+63 915 234 5678' },
    pickup: { address: 'Manila City Hall', lat: 14.5895, lng: 120.9742 },
    dropoff: { address: 'Binondo, Manila', lat: 14.6006, lng: 120.9695 },
    fare: 180.0,
    paymentMethod: 'cash',
    requestedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    notes: 'Urgent document delivery',
  },
  {
    rideId: 'RID-104',
    status: 'requested',
    serviceType: 'taxi',
    priority: 'normal',
    passenger: { passengerId: 'PAS-104', name: 'Sofia Garcia', phone: '+63 916 345 6789' },
    pickup: { address: 'Mandaluyong City', lat: 14.5794, lng: 121.0359 },
    dropoff: { address: 'San Juan City', lat: 14.5995, lng: 121.0348 },
    fare: 145.0,
    paymentMethod: 'card',
    requestedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    rideId: 'RID-105',
    status: 'requested',
    serviceType: 'car',
    priority: 'normal',
    passenger: { passengerId: 'PAS-105', name: 'Miguel Santos', phone: '+63 918 456 7890' },
    pickup: { address: 'Pasay City', lat: 14.5378, lng: 121.0014 },
    dropoff: { address: 'Makati CBD', lat: 14.5547, lng: 121.0244 },
    fare: 220.0,
    paymentMethod: 'gcash',
    requestedAt: new Date(Date.now() - 30 * 1000).toISOString(),
  },
];

const MOCK_AVAILABLE_DRIVERS: DispatchDriver[] = [
  {
    driverId: 'DRV-001',
    driverName: 'Juan Santos',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.598,
    longitude: 120.983,
    rating: 4.8,
    trustScore: 92,
    totalTrips: 1250,
    vehicle: { type: 'Toyota Vios', plate: 'ABC-123', color: 'White' },
    lastAssignmentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-002',
    driverName: 'Pedro Reyes',
    status: 'available',
    serviceType: 'moto',
    latitude: 14.61,
    longitude: 120.995,
    rating: 4.5,
    trustScore: 85,
    totalTrips: 890,
    vehicle: { type: 'Honda Click', plate: 'XYZ-789', color: 'Red' },
    lastAssignmentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-003',
    driverName: 'Miguel Torres',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.6,
    longitude: 120.985,
    rating: 4.9,
    trustScore: 96,
    totalTrips: 2100,
    vehicle: { type: 'Toyota Vios', plate: 'DEF-456', color: 'Silver' },
    lastAssignmentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-005',
    driverName: 'Carlos Mendez',
    status: 'idle',
    serviceType: 'delivery',
    latitude: 14.59,
    longitude: 120.975,
    rating: 4.6,
    trustScore: 82,
    totalTrips: 650,
    vehicle: { type: 'Motorcycle', plate: 'JKL-012', color: 'Blue' },
    lastAssignmentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-006',
    driverName: 'Fernando Cruz',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.629,
    longitude: 120.994,
    rating: 4.8,
    trustScore: 90,
    totalTrips: 1800,
    vehicle: { type: 'Hyundai Accent', plate: 'MNO-345', color: 'Gray' },
    lastAssignmentAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-008',
    driverName: 'Alberto Flores',
    status: 'available',
    serviceType: 'taxi',
    latitude: 14.639,
    longitude: 121.014,
    rating: 4.9,
    trustScore: 94,
    totalTrips: 2300,
    vehicle: { type: 'Toyota Vios', plate: 'STU-901', color: 'White' },
    lastAssignmentAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-009',
    driverName: 'Diego Ramos',
    status: 'available',
    serviceType: 'moto',
    latitude: 14.569,
    longitude: 120.974,
    rating: 4.7,
    trustScore: 87,
    totalTrips: 780,
    vehicle: { type: 'Honda Beat', plate: 'VWX-234', color: 'Red' },
    lastAssignmentAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    driverId: 'DRV-012',
    driverName: 'Luis Hernandez',
    status: 'available',
    serviceType: 'car',
    latitude: 14.609,
    longitude: 120.954,
    rating: 4.8,
    trustScore: 91,
    totalTrips: 1650,
    vehicle: { type: 'Honda Civic', plate: 'EFG-123', color: 'Black' },
    lastAssignmentAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ASN-001',
    rideId: 'RID-201',
    ridePickup: 'Makati CBD',
    rideDropoff: 'BGC',
    driverId: 'DRV-001',
    driverName: 'Juan Santos',
    assignedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    assignedBy: 'System',
    status: 'completed',
    distance: 2.5,
    estimatedEta: 8,
  },
  {
    id: 'ASN-002',
    rideId: 'RID-202',
    ridePickup: 'Quezon City',
    rideDropoff: 'Ortigas',
    driverId: 'DRV-002',
    driverName: 'Pedro Reyes',
    assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignedBy: 'Admin',
    status: 'completed',
    distance: 3.8,
    estimatedEta: 12,
  },
  {
    id: 'ASN-003',
    rideId: 'RID-203',
    ridePickup: 'Manila City Hall',
    rideDropoff: 'Binondo',
    driverId: 'DRV-003',
    driverName: 'Miguel Torres',
    assignedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    assignedBy: 'System',
    status: 'accepted',
    distance: 1.8,
    estimatedEta: 6,
  },
];

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useDispatch(): UseDispatchReturn {
  const [pendingRides, setPendingRides] = useState<DispatchRide[]>(MOCK_PENDING_RIDES);
  const [availableDrivers, setAvailableDrivers] = useState<DispatchDriver[]>(MOCK_AVAILABLE_DRIVERS);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedRide, setSelectedRide] = useState<DispatchRide | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DispatchDriver | null>(null);
  const [rideSearchQuery, setRideSearchQuery] = useState('');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');

  // Refresh data
  const refresh = useCallback(async () => {
    setIsLoadingRides(true);
    setIsLoadingDrivers(true);
    setError(null);
    
    try {
      // In production, these would call real services
      // const rides = await dispatchService.getPendingRides();
      // const drivers = await dispatchService.getAvailableDrivers();
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simulate small location changes for drivers
      setAvailableDrivers((prev) =>
        prev.map((driver) => ({
          ...driver,
          latitude: driver.latitude + (Math.random() - 0.5) * 0.001,
          longitude: driver.longitude + (Math.random() - 0.5) * 0.001,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setIsLoadingRides(false);
      setIsLoadingDrivers(false);
    }
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [refresh]);

  // Assign ride to driver
  const assignRide = useCallback(async (rideId: string, driverId: string) => {
    setIsAssigning(true);
    
    try {
      // In production: await dispatchService.assignRide(rideId, driverId);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const ride = pendingRides.find((r) => r.rideId === rideId);
      const driver = availableDrivers.find((d) => d.driverId === driverId);
      
      if (!ride || !driver) throw new Error('Ride or driver not found');
      
      const distance = calculateDistance(
        driver.latitude,
        driver.longitude,
        ride.pickup.lat,
        ride.pickup.lng
      );
      
      const newAssignment: Assignment = {
        id: `ASN-${Date.now()}`,
        rideId,
        ridePickup: ride.pickup.address,
        rideDropoff: ride.dropoff.address,
        driverId,
        driverName: driver.driverName,
        assignedAt: new Date().toISOString(),
        assignedBy: 'Dispatcher',
        status: 'pending',
        distance,
        estimatedEta: Math.ceil(distance * 2),
      };
      
      setAssignments((prev) => [newAssignment, ...prev]);
      setPendingRides((prev) => prev.filter((r) => r.rideId !== rideId));
      setSelectedRide(null);
      setSelectedDriver(null);
    } finally {
      setIsAssigning(false);
    }
  }, [pendingRides, availableDrivers]);

  // Cancel assignment
  const cancelAssignment = useCallback(async (assignmentId: string) => {
    // In production: await dispatchService.cancelAssignment(assignmentId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, status: 'cancelled' } : a))
    );
  }, []);

  // Get driver distance to pickup
  const getDriverDistanceToPickup = useCallback(
    (driver: DispatchDriver, ride: DispatchRide): number => {
      return calculateDistance(
        driver.latitude,
        driver.longitude,
        ride.pickup.lat,
        ride.pickup.lng
      );
    },
    []
  );

  // Get recommended drivers for a ride
  const getRecommendedDrivers = useCallback(
    (ride: DispatchRide): DispatchDriver[] => {
      return availableDrivers
        .filter((d) => d.status === 'available' || d.status === 'idle')
        .map((driver) => ({
          ...driver,
          distance: getDriverDistanceToPickup(driver, ride),
        }))
        .sort((a, b) => {
          // Sort by distance, then by rating, then by trust score
          const distA = (a as any).distance;
          const distB = (b as any).distance;
          if (Math.abs(distA - distB) > 0.5) return distA - distB;
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.trustScore - a.trustScore;
        });
    },
    [availableDrivers, getDriverDistanceToPickup]
  );

  // Auto-suggest nearest driver
  const autoSuggestDriver = useCallback(
    (rideId: string): DispatchDriver | null => {
      const ride = pendingRides.find((r) => r.rideId === rideId);
      if (!ride) return null;
      
      const recommended = getRecommendedDrivers(ride);
      return recommended[0] || null;
    },
    [pendingRides, getRecommendedDrivers]
  );

  // Filter rides
  const filteredRides = useMemo(() => {
    if (!rideSearchQuery) return pendingRides;
    const query = rideSearchQuery.toLowerCase();
    return pendingRides.filter(
      (ride) =>
        ride.rideId.toLowerCase().includes(query) ||
        ride.passenger.name.toLowerCase().includes(query) ||
        ride.pickup.address.toLowerCase().includes(query) ||
        ride.dropoff.address.toLowerCase().includes(query)
    );
  }, [pendingRides, rideSearchQuery]);

  // Filter drivers
  const filteredDrivers = useMemo(() => {
    let drivers = availableDrivers;
    
    // Filter by service type if a ride is selected
    if (selectedRide) {
      drivers = drivers.filter(
        (d) =>
          d.serviceType === selectedRide.serviceType ||
          (selectedRide.serviceType === 'taxi' && d.serviceType === 'car')
      );
    }
    
    // Filter by search query
    if (driverSearchQuery) {
      const query = driverSearchQuery.toLowerCase();
      drivers = drivers.filter(
        (driver) =>
          driver.driverId.toLowerCase().includes(query) ||
          driver.driverName.toLowerCase().includes(query) ||
          driver.vehicle?.plate.toLowerCase().includes(query)
      );
    }
    
    // Sort by distance if ride is selected
    if (selectedRide) {
      drivers = [...drivers].sort(
        (a, b) =>
          getDriverDistanceToPickup(a, selectedRide) -
          getDriverDistanceToPickup(b, selectedRide)
      );
    }
    
    return drivers;
  }, [availableDrivers, driverSearchQuery, selectedRide, getDriverDistanceToPickup]);

  // Stats
  const stats = useMemo(
    () => ({
      pendingCount: pendingRides.length,
      availableCount: availableDrivers.filter((d) => d.status === 'available').length,
      assignedToday: assignments.filter(
        (a) => new Date(a.assignedAt).toDateString() === new Date().toDateString()
      ).length,
      avgAssignmentTime: 45, // seconds
    }),
    [pendingRides, availableDrivers, assignments]
  );

  return {
    pendingRides,
    availableDrivers,
    assignments,
    isLoadingRides,
    isLoadingDrivers,
    isAssigning,
    error,
    selectedRide,
    selectedDriver,
    setSelectedRide,
    setSelectedDriver,
    assignRide,
    cancelAssignment,
    refresh,
    autoSuggestDriver,
    rideSearchQuery,
    setRideSearchQuery,
    driverSearchQuery,
    setDriverSearchQuery,
    filteredRides,
    filteredDrivers,
    stats,
    calculateDistance,
    getDriverDistanceToPickup,
    getRecommendedDrivers,
  };
}

export default useDispatch;
