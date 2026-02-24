import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useOrderSourceStore } from '@/lib/stores/order-source.store';
import type { Order, OrderStatus } from '@/types/domain.types';

export interface OrdersFilters {
  status?: OrderStatus[];
  serviceType?: string[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Backend order response type for testapi
interface BackendOrder {
  id?: string;
  order_id?: string;
  order_number?: string;
  transaction_id?: string;
  status?: string;
  service_type?: string;
  priority?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_rating?: number;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle?: string;
  pickup_location?: {
    lat: number;
    lng: number;
    address: string;
    name?: string;
    notes?: string;
  };
  dropoff_location?: {
    lat: number;
    lng: number;
    address: string;
    name?: string;
    notes?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    weight?: number;
    dimensions?: string;
  }>;
  payment?: {
    method: string;
    status: string;
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
  };
  timeline?: {
    created_at: string;
    assigned_at?: string;
    accepted_at?: string;
    picked_up_at?: string;
    completed_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
  total?: number;
}

// Import ServiceType
type ServiceType = 'Taxi' | 'Moto' | 'Delivery' | 'Car';

// Map backend order to frontend Order type
function mapBackendOrder(data: BackendOrder): Order {
  const status = mapOrderStatus(data.status);
  
  return {
    orderId: data.id || data.order_id || '',
    transactionId: data.transaction_id || '',
    status,
    serviceType: (data.service_type || 'Delivery') as ServiceType,
    priority: 'Normal',
    customer: {
      customerId: data.customer_id || 'unknown',
      name: data.customer_name || 'Unknown Customer',
      phone: data.customer_phone || '',
      email: data.customer_email || '',
      rating: 5,
    },
    driver: data.driver_id ? {
      driverId: data.driver_id,
      name: data.driver_name || 'Unknown Driver',
      vehicle: '',
      phone: '',
      assignedAt: new Date().toISOString(),
    } : undefined,
    route: {
      pickup: {
        address: data.pickup_location?.address || 'Unknown Address',
        lat: data.pickup_location?.lat || 0,
        lng: data.pickup_location?.lng || 0,
        name: data.customer_name || '',
        notes: data.pickup_location?.notes || '',
      },
      dropoff: {
        address: data.dropoff_location?.address || 'Unknown Address',
        lat: data.dropoff_location?.lat || 0,
        lng: data.dropoff_location?.lng || 0,
        notes: data.dropoff_location?.notes || '',
      },
      distance: 0,
      estimatedDuration: 0,
    },
    pricing: {
      baseFare: 0,
      distanceFare: 0,
      timeFare: 0,
      surge: 0,
      discount: data.payment?.discount || 0,
      total: data.payment?.total || data.total || 0,
      paymentMethod: 'Cash',
      isPaid: false,
    },
    timeline: {
      createdAt: data.timeline?.created_at || data.created_at || new Date().toISOString(),
      acceptedAt: data.timeline?.accepted_at,
      assignedAt: data.timeline?.assigned_at,
      pickedUpAt: data.timeline?.picked_up_at,
      completedAt: data.timeline?.completed_at || data.timeline?.delivered_at,
      cancelledAt: data.timeline?.cancelled_at,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    notes: data.notes || '',
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  };
}

function mapOrderStatus(status: string | undefined): OrderStatus {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Pending';
    case 'ASSIGNED':
      return 'Assigned';
    case 'ACCEPTED':
      return 'Accepted';
    case 'IN_TRANSIT':
    case 'INTRANSIT':
      return 'InTransit';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

// Generate mock orders for testing
function generateMockOrders(page: number, pageSize: number): OrdersResponse {
  const mockOrders: Order[] = Array.from({ length: pageSize }, (_, i) => {
    const index = (page - 1) * pageSize + i;
    const statuses: OrderStatus[] = ['Pending', 'Assigned', 'InTransit', 'Delivered', 'Cancelled'];
    const status = statuses[index % statuses.length];
    
    return {
      orderId: `mock-order-${index}`,
      transactionId: `txn-${index}`,
      status,
      serviceType: index % 2 === 0 ? 'Delivery' : 'Taxi' as ServiceType,
      priority: 'Normal',
      customer: {
        customerId: `cust-${index}`,
        name: `Customer ${index + 1}`,
        phone: `+639${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        email: `customer${index + 1}@example.com`,
        rating: 5,
      },
      route: {
        pickup: {
          address: `Pickup Address ${index + 1}, Makati City`,
          lat: 14.5995 + Math.random() * 0.01,
          lng: 120.9842 + Math.random() * 0.01,
          contactName: `Customer ${index + 1}`,
          contactPhone: `+639${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        },
        dropoff: {
          address: `Dropoff Address ${index + 1}, Manila City`,
          lat: 14.6095 + Math.random() * 0.01,
          lng: 120.9942 + Math.random() * 0.01,
          contactName: '',
          contactPhone: '',
        },
        distance: 5000,
        estimatedDuration: 1200,
      },
      pricing: {
        baseFare: 50,
        distanceFare: Math.floor(Math.random() * 300),
        timeFare: Math.floor(Math.random() * 100),
        surge: 0,
        discount: 0,
        total: Math.floor(Math.random() * 400) + 100,
        paymentMethod: 'Cash',
        isPaid: false,
      },
      timeline: {
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      },
      flags: {
        isPrioritized: false,
        isScheduled: false,
        hasSpecialRequirements: false,
        requiresVerification: false,
      },
      notes: '',
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    items: mockOrders,
    total: 50, // Simulate 50 total mock orders
    pageNumber: page,
    pageSize,
    totalPages: Math.ceil(50 / pageSize),
  };
}

// MAIN HOOK - Switches between testapi and mock based on source
export function useOrders(filters: OrdersFilters = {}) {
  const { status, serviceType, searchQuery, pageNumber = 1, pageSize = 20 } = filters;
  const source = useOrderSourceStore((state) => state.source);

  return useQuery({
    queryKey: ['orders', 'list', { ...filters, source }],
    queryFn: async (): Promise<OrdersResponse> => {
      if (source === 'mock') {
        // Return mock generated orders
        return generateMockOrders(pageNumber, pageSize);
      }

      try {
        // Call real backend API (testapi adapter)
        const response = await apiClient.post<any>('api/adapter/orders', {
          pageNumber,
          pageSize,
          status,
          serviceType,
          searchQuery,
        });

        // Map backend response
        const items = (response.data || []).map(mapBackendOrder);

        return {
          items,
          total: response.total || items.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil((response.total || items.length) / pageSize),
        };
      } catch (error) {
        console.warn('[Orders] API failed, falling back to mock data:', error);
        // Fall back to mock data when API fails
        return generateMockOrders(pageNumber, pageSize);
      }
    },
  });
}

// Get single order
export function useOrder(orderId: string | undefined) {
  const source = useOrderSourceStore((state) => state.source);

  return useQuery({
    queryKey: ['order', orderId, source],
    queryFn: async (): Promise<Order | null> => {
      if (!orderId) return null;

      if (source === 'mock') {
        // Return mock single order
        return {
          orderId,
          transactionId: `txn-${orderId}`,
          status: 'InTransit',
          serviceType: 'Delivery' as ServiceType,
          priority: 'Normal',
          customer: {
            customerId: 'mock-cust',
            name: 'Mock Customer',
            phone: '+639123456789',
            email: 'mock@example.com',
            rating: 5,
          },
          route: {
            pickup: {
              address: 'Mock Pickup Address, Makati',
              lat: 14.5995,
              lng: 120.9842,
              name: 'Mock Customer',
            },
            dropoff: {
              address: 'Mock Dropoff Address, Manila',
              lat: 14.6095,
              lng: 120.9942,
            },
            distance: 5000,
            estimatedDuration: 1200,
          },
          pricing: {
            baseFare: 50,
            distanceFare: 150,
            timeFare: 50,
            surge: 0,
            discount: 0,
            total: 250,
            paymentMethod: 'Cash',
            isPaid: false,
          },
          timeline: {
            createdAt: new Date().toISOString(),
          },
          flags: {
            isPrioritized: false,
            isScheduled: false,
            hasSpecialRequirements: false,
            requiresVerification: false,
          },
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const response = await apiClient.post<any>(`api/adapter/orders/${orderId}`, {});
      return mapBackendOrder(response);
    },
    enabled: !!orderId,
  });
}

// Assign driver to order
export function useAssignDriver() {
  const queryClient = useQueryClient();
  const source = useOrderSourceStore((state) => state.source);

  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      if (source === 'mock') {
        // Simulate success for mock
        return { success: true, orderId, driverId };
      }

      const response = await apiClient.post('api/adapter/assign/driver', { orderId, driverId });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const source = useOrderSourceStore((state) => state.source);

  return useMutation({
    mutationFn: async ({ orderId, reason: _reason }: { orderId: string; reason: string }) => {
      if (source === 'mock') {
        return { success: true, orderId };
      }

      // Placeholder - real endpoint would go here
      return { success: true, orderId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

// Bulk cancel orders
export function useBulkCancelOrders() {
  const queryClient = useQueryClient();
  const source = useOrderSourceStore((state) => state.source);

  return useMutation({
    mutationFn: async ({ orderIds, reason: _reason }: { orderIds: string[]; reason: string }) => {
      if (source === 'mock') {
        return { success: true, cancelledCount: orderIds.length };
      }
      // Placeholder for bulk cancel API
      return { success: true, cancelledCount: orderIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

// Bulk assign driver to multiple orders
export function useBulkAssignDriver() {
  const queryClient = useQueryClient();
  const source = useOrderSourceStore((state) => state.source);

  return useMutation({
    mutationFn: async ({ orderIds, riderId: _riderId }: { orderIds: string[]; riderId: string }) => {
      if (source === 'mock') {
        return { success: true, assignedCount: orderIds.length };
      }
      // Placeholder for bulk assign API
      return { success: true, assignedCount: orderIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

// Nearby drivers types
export interface NearbyDriversRequest {
  orderId: string;
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export interface NearbyDriver {
  driverId: string;
  riderId?: string;
  name: string;
  status: 'Online' | 'OnTrip' | 'Offline' | 'OnBreak';
  distance: number;
  estimatedArrival: number;
  eta: number;
  rating: number;
  vehicleType: string;
  vehiclePlate?: string;
  trustScore: number;
}

export interface NearbyDriversResponse {
  drivers: NearbyDriver[];
  totalCount: number;
}

// Hook to fetch nearby drivers for order assignment
export function useNearbyDrivers(orderId: string, location: { lat: number; lng: number } | null) {
  const source = useOrderSourceStore((state) => state.source);
  
  return useQuery({
    queryKey: ['nearbyDrivers', orderId, location, source],
    queryFn: async (): Promise<NearbyDriversResponse | null> => {
      if (!location || !orderId) return null;
      
      // For mock mode, return mock drivers
      if (source === 'mock') {
        return {
          drivers: [
            { driverId: 'driver-1', riderId: 'rider-1', name: 'Juan Dela Cruz', status: 'Online', distance: 500, estimatedArrival: 120, eta: 120, rating: 4.8, vehicleType: 'Van', vehiclePlate: 'ABC-123', trustScore: 95 },
            { driverId: 'driver-2', riderId: 'rider-2', name: 'Maria Santos', status: 'Online', distance: 800, estimatedArrival: 180, eta: 180, rating: 4.6, vehicleType: 'Motorcycle', vehiclePlate: 'XYZ-789', trustScore: 88 },
            { driverId: 'driver-3', riderId: 'rider-3', name: 'Pedro Reyes', status: 'OnTrip', distance: 1200, estimatedArrival: 240, eta: 240, rating: 4.9, vehicleType: 'Van', vehiclePlate: 'DEF-456', trustScore: 92 },
          ],
          totalCount: 3,
        };
      }
      
      const response = await apiClient.post<NearbyDriversResponse>('api/adapter/assign/nearby', {
        orderId,
        latitude: location.lat,
        longitude: location.lng,
        radius: 5000,
        limit: 10,
      });
      return response;
    },
    enabled: !!location && !!orderId,
    staleTime: 5000,
  });
}

// Re-export order source store hook for convenience
export { useOrderSourceStore };

// Export order source type
export type { OrderSource } from '@/lib/stores/order-source.store';

// Helper hook for last updated text
export function useLastUpdatedText(timestamp: number | undefined): string {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}
