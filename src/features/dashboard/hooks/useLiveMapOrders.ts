import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { 
  LiveMapOrder, 
  LiveMapDriver, 
  OrderStatus, 
  ServiceType,
  Location 
} from '@/types/domain.types';

// ==================== Request/Response Types ====================

export interface LiveMapOrdersRequest {
  bounds?: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };
  serviceTypes?: ServiceType[];
  statuses?: OrderStatus[];
  zone?: string;
}

export interface LiveMapOrdersResponse {
  orders: LiveMapOrder[];
  totalCount: number;
  lastUpdated: string;
}

export interface LiveMapDriversRequest {
  bounds?: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };
  serviceTypes?: ServiceType[];
  statuses?: string[];
  zone?: string;
}

export interface LiveMapDriversResponse {
  drivers: LiveMapDriver[];
  totalCount: number;
  lastUpdated: string;
}

export interface NearbyDriversRequest {
  orderId: string;
  latitude: number;
  longitude: number;
  radius?: number; // in meters
  limit?: number;
}

export interface NearbyDriver {
  driverId: string;
  name: string;
  distance: number; // in meters
  estimatedArrival: number; // in seconds
  rating: number;
  vehicleType: string;
  location: Location;
}

export interface NearbyDriversResponse {
  drivers: NearbyDriver[];
  orderId: string;
}

export interface DemandZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number; // 0-1
  orders: number;
  availableDrivers: number;
  averageWaitTime: number;
}

export interface DemandHeatmapResponse {
  zones: DemandZone[];
  totalOrders: number;
  totalDrivers: number;
  lastUpdated: string;
}

// ==================== Live Map Orders Hook ====================

export function useLiveMapOrders(request: LiveMapOrdersRequest = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.orders.liveMap, request],
    queryFn: async () => {
      try {
        const response = await apiClient.post<LiveMapOrdersResponse>(
          ENDPOINTS.orders.liveMap,
          {
            bounds: request.bounds,
            serviceTypes: request.serviceTypes,
            statuses: request.statuses,
            zone: request.zone,
          }
        );
        return response;
      } catch (error) {
        console.error('Failed to fetch live map orders:', error);
        // Return mock data for development
        return getMockLiveMapOrders();
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
}

// ==================== Live Map Drivers Hook ====================

export function useLiveMapDrivers(request: LiveMapDriversRequest = {}) {
  return useQuery({
    queryKey: ['liveMapDrivers', request],
    queryFn: async () => {
      // Always return mock data for development/demo
      return getMockLiveMapDrivers();
    },
    initialData: getMockLiveMapDrivers(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

// ==================== Nearby Drivers Hook ====================

export function useNearbyDrivers(request: NearbyDriversRequest | null) {
  return useQuery({
    queryKey: ['nearbyDrivers', request],
    queryFn: async () => {
      if (!request) return null;
      try {
        const response = await apiClient.post<NearbyDriversResponse>(
          ENDPOINTS.orders.nearbyDrivers,
          {
            orderId: request.orderId,
            latitude: request.latitude,
            longitude: request.longitude,
            radius: request.radius || 5000,
            limit: request.limit || 10,
          }
        );
        return response;
      } catch (error) {
        console.error('Failed to fetch nearby drivers:', error);
        return null;
      }
    },
    enabled: !!request,
    staleTime: 5000,
  });
}

// ==================== Demand Heatmap Hook ====================

export function useDemandHeatmap(zone?: string) {
  return useQuery({
    queryKey: ['demandHeatmap', zone],
    queryFn: async () => {
      try {
        // This would be a real API call when available
        // For now, return mock data
        return getMockDemandHeatmap(zone);
      } catch (error) {
        console.error('Failed to fetch demand heatmap:', error);
        return getMockDemandHeatmap(zone);
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}

// ==================== Order Assignment Mutation ====================

export function useAssignOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      orderId: string; 
      driverId: string;
      priority?: boolean;
    }) => {
      const response = await apiClient.post(
        ENDPOINTS.orders.assign,
        {
          orderId: data.orderId,
          xpressRiderId: data.driverId,
          isPriority: data.priority || false,
        }
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate live map queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders.liveMap] });
      queryClient.invalidateQueries({ queryKey: ['liveMapDrivers'] });
    },
  });
}

// ==================== Mock Data Helpers ====================

function getMockLiveMapOrders(): LiveMapOrdersResponse {
  const now = new Date().toISOString();
  
  return {
    orders: [
      {
        orderId: 'ORD-001',
        status: 'EnRoute',
        serviceType: 'Taxi',
        pickup: {
          lat: 14.5547,
          lng: 121.0244,
          timestamp: now,
        },
        dropoff: {
          lat: 14.5764,
          lng: 121.0851,
          timestamp: now,
        },
        driverLocation: {
          lat: 14.56,
          lng: 121.04,
          timestamp: now,
        },
        priority: 'Normal',
      },
      {
        orderId: 'ORD-002',
        status: 'Assigned',
        serviceType: 'Moto',
        pickup: {
          lat: 14.5408,
          lng: 121.0503,
          timestamp: now,
        },
        dropoff: {
          lat: 14.5547,
          lng: 121.0244,
          timestamp: now,
        },
        priority: 'High',
      },
      {
        orderId: 'ORD-003',
        status: 'OnTrip',
        serviceType: 'Delivery',
        pickup: {
          lat: 14.5853,
          lng: 121.0613,
          timestamp: now,
        },
        dropoff: {
          lat: 14.5995,
          lng: 120.9842,
          timestamp: now,
        },
        driverLocation: {
          lat: 14.59,
          lng: 121.02,
          timestamp: now,
        },
        priority: 'Normal',
      },
      {
        orderId: 'ORD-004',
        status: 'Searching',
        serviceType: 'Taxi',
        pickup: {
          lat: 14.5176,
          lng: 121.0509,
          timestamp: now,
        },
        dropoff: {
          lat: 14.5547,
          lng: 121.0244,
          timestamp: now,
        },
        priority: 'Urgent',
      },
      {
        orderId: 'ORD-005',
        status: 'Arrived',
        serviceType: 'Moto',
        pickup: {
          lat: 14.4793,
          lng: 121.0198,
          timestamp: now,
        },
        dropoff: {
          lat: 14.5176,
          lng: 121.0509,
          timestamp: now,
        },
        driverLocation: {
          lat: 14.4795,
          lng: 121.02,
          timestamp: now,
        },
        priority: 'Normal',
      },
    ],
    totalCount: 5,
    lastUpdated: now,
  };
}

function getMockLiveMapDrivers(): LiveMapDriversResponse {
  const now = new Date().toISOString();
  
  return {
    drivers: [
      {
        driverId: 'DRV-001',
        name: 'Juan Dela Cruz',
        status: 'OnTrip',
        location: {
          lat: 14.56,
          lng: 121.04,
          timestamp: now,
        },
        vehicleType: 'Taxi',
        currentOrderId: 'ORD-001',
        trustScore: 92,
      },
      {
        driverId: 'DRV-002',
        name: 'Maria Santos',
        status: 'Online',
        location: {
          lat: 14.55,
          lng: 121.03,
          timestamp: now,
        },
        vehicleType: 'Moto',
        trustScore: 88,
      },
      {
        driverId: 'DRV-003',
        name: 'Pedro Reyes',
        status: 'OnTrip',
        location: {
          lat: 14.59,
          lng: 121.02,
          timestamp: now,
        },
        vehicleType: 'Delivery',
        currentOrderId: 'ORD-003',
        trustScore: 95,
      },
      {
        driverId: 'DRV-004',
        name: 'Ana Garcia',
        status: 'Online',
        location: {
          lat: 14.545,
          lng: 121.055,
          timestamp: now,
        },
        vehicleType: 'Taxi',
        trustScore: 90,
      },
      {
        driverId: 'DRV-005',
        name: 'Carlos Mendoza',
        status: 'OnBreak',
        location: {
          lat: 14.535,
          lng: 121.045,
          timestamp: now,
        },
        vehicleType: 'Moto',
        trustScore: 85,
      },
    ],
    totalCount: 5,
    lastUpdated: now,
  };
}

function getMockDemandHeatmap(zone?: string): DemandHeatmapResponse {
  const zones: DemandZone[] = [
    {
      id: 'makati',
      name: 'Makati CBD',
      lat: 14.5547,
      lng: 121.0244,
      intensity: 0.9,
      orders: 245,
      availableDrivers: 42,
      averageWaitTime: 180,
    },
    {
      id: 'bgc',
      name: 'BGC',
      lat: 14.5408,
      lng: 121.0503,
      intensity: 0.85,
      orders: 198,
      availableDrivers: 35,
      averageWaitTime: 210,
    },
    {
      id: 'ortigas',
      name: 'Ortigas',
      lat: 14.5853,
      lng: 121.0613,
      intensity: 0.75,
      orders: 156,
      availableDrivers: 28,
      averageWaitTime: 195,
    },
    {
      id: 'quezon',
      name: 'Quezon City',
      lat: 14.6760,
      lng: 121.0437,
      intensity: 0.7,
      orders: 134,
      availableDrivers: 22,
      averageWaitTime: 240,
    },
    {
      id: 'manila',
      name: 'Manila',
      lat: 14.5995,
      lng: 120.9842,
      intensity: 0.65,
      orders: 112,
      availableDrivers: 18,
      averageWaitTime: 225,
    },
    {
      id: 'pasay',
      name: 'Pasay',
      lat: 14.5378,
      lng: 121.0014,
      intensity: 0.6,
      orders: 98,
      availableDrivers: 15,
      averageWaitTime: 270,
    },
    {
      id: 'mandaluyong',
      name: 'Mandaluyong',
      lat: 14.5794,
      lng: 121.0359,
      intensity: 0.55,
      orders: 87,
      availableDrivers: 14,
      averageWaitTime: 255,
    },
    {
      id: 'pasig',
      name: 'Pasig',
      lat: 14.5764,
      lng: 121.0851,
      intensity: 0.5,
      orders: 76,
      availableDrivers: 12,
      averageWaitTime: 300,
    },
    {
      id: 'taguig',
      name: 'Taguig',
      lat: 14.5176,
      lng: 121.0509,
      intensity: 0.45,
      orders: 65,
      availableDrivers: 10,
      averageWaitTime: 285,
    },
    {
      id: 'paranaque',
      name: 'Paranaque',
      lat: 14.4793,
      lng: 121.0198,
      intensity: 0.4,
      orders: 54,
      availableDrivers: 8,
      averageWaitTime: 320,
    },
  ];

  if (zone) {
    const filtered = zones.filter((z) => 
      z.id.toLowerCase().includes(zone.toLowerCase()) ||
      z.name.toLowerCase().includes(zone.toLowerCase())
    );
    return {
      zones: filtered,
      totalOrders: filtered.reduce((sum, z) => sum + z.orders, 0),
      totalDrivers: filtered.reduce((sum, z) => sum + z.availableDrivers, 0),
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    zones,
    totalOrders: zones.reduce((sum, z) => sum + z.orders, 0),
    totalDrivers: zones.reduce((sum, z) => sum + z.availableDrivers, 0),
    lastUpdated: new Date().toISOString(),
  };
}
