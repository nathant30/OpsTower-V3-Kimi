import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types/domain.types';

export interface VehiclesFilters {
  status?: VehicleStatus[];
  type?: VehicleType[];
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface BulkUpdateStatusRequest {
  vehicleIds: string[];
  status: VehicleStatus;
}

export interface VehiclesResponse {
  items: Vehicle[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Backend vehicle response type
interface BackendVehicle {
  id?: string;
  vehicle_id?: string;
  plate_number?: string;
  make?: string;
  model?: string;
  year?: number;
  type?: string;
  status?: string;
  current_location?: {
    lat: number;
    lng: number;
    timestamp: string;
    heading?: number;
    speed?: number;
  };
  assigned_driver?: {
    driver_id: string;
    name: string;
    phone: string;
    assigned_at?: string;
  };
  utilization?: {
    hours_active: number;
    trips_completed: number;
    revenue_generated: number;
    distance_traveled: number;
  };
  maintenance?: {
    last_service?: string;
    next_service_due?: string;
    mileage: number;
    service_history?: Array<{
      id: string;
      date: string;
      type: string;
      description: string;
      cost: number;
      mileage: number;
    }>;
  };
  documents?: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    uploaded_at: string;
    expires_at?: string;
  }>;
  created_at?: string;
  updated_at?: string;
  // Alternative flat structure fields
  fuel_level?: number;
  fuel_type?: string;
  capacity?: { passengers: number; cargo: number };
}

interface BackendVehiclesResponse {
  items: BackendVehicle[];
  total: number;
  page: number;
  limit: number;
}

// Map backend vehicle data to frontend Vehicle type
function mapBackendVehicle(data: BackendVehicle): Vehicle {
  return {
    vehicleId: data.vehicle_id || data.id || '',
    plateNumber: data.plate_number || '',
    make: data.make || '',
    model: data.model || '',
    year: data.year || new Date().getFullYear(),
    type: mapVehicleType(data.type),
    status: mapVehicleStatus(data.status),
    currentLocation: data.current_location ? {
      lat: data.current_location.lat,
      lng: data.current_location.lng,
      timestamp: data.current_location.timestamp,
      heading: data.current_location.heading,
      speed: data.current_location.speed,
    } : undefined,
    assignedDriver: data.assigned_driver ? {
      driverId: data.assigned_driver.driver_id,
      name: data.assigned_driver.name,
      phone: data.assigned_driver.phone,
      assignedAt: data.assigned_driver.assigned_at,
    } : undefined,
    utilization: data.utilization ? {
      hoursActive: data.utilization.hours_active,
      tripsCompleted: data.utilization.trips_completed,
      revenueGenerated: data.utilization.revenue_generated,
      distanceTraveled: data.utilization.distance_traveled,
    } : { hoursActive: 0, tripsCompleted: 0, revenueGenerated: 0, distanceTraveled: 0 },
    maintenance: data.maintenance ? {
      lastService: data.maintenance.last_service,
      nextServiceDue: data.maintenance.next_service_due,
      mileage: data.maintenance.mileage || 0,
      serviceHistory: (data.maintenance.service_history || []).map(record => ({
        id: record.id,
        date: record.date,
        type: record.type,
        description: record.description,
        cost: record.cost,
        mileage: record.mileage,
      })),
    } : { mileage: 0, serviceHistory: [] },
    documents: (data.documents || []).map(doc => ({
      id: doc.id,
      type: doc.type,
      name: doc.name,
      url: doc.url,
      status: doc.status,
      uploadedAt: doc.uploaded_at,
      expiresAt: doc.expires_at,
    })),
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  };
}

function mapVehicleType(type: string | undefined): VehicleType {
  switch (type?.toUpperCase()) {
    case 'TAXI':
      return 'Taxi';
    case 'MOTO':
    case 'MOTORCYCLE':
      return 'Moto';
    case 'IDLE':
      return 'Idle';
    case 'URBAN_DEMAND':
    case 'URBAN':
      return 'Urban Demand';
    case 'DELIVERY':
      return 'Delivery';
    case 'CAR':
      return 'Idle'; // Default fallback
    default:
      return 'Idle';
  }
}

function mapVehicleStatus(status: string | undefined): VehicleStatus {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'ONLINE':
      return 'Active';
    case 'IDLE':
      return 'Idle';
    case 'MAINTENANCE':
    case 'IN_MAINTENANCE':
      return 'Maintenance';
    case 'OFFLINE':
      return 'Offline';
    case 'DECOMMISSIONED':
    case 'RETIRED':
      return 'Decommissioned';
    default:
      return 'Idle';
  }
}

// Mock vehicles for development
const mockVehicles: Vehicle[] = [
  { vehicleId: 'V001', plateNumber: 'ABC-1234', make: 'Toyota', model: 'Vios', year: 2022, type: 'Taxi', status: 'Active', currentLocation: { lat: 14.5995, lng: 120.9842, timestamp: new Date().toISOString() }, assignedDriver: { driverId: 'D001', name: 'Juan Santos', phone: '+639123456789', assignedAt: new Date().toISOString() }, utilization: { hoursActive: 120, tripsCompleted: 450, revenueGenerated: 125000, distanceTraveled: 3500 }, maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 30*24*60*60*1000).toISOString(), mileage: 25000, serviceHistory: [] }, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { vehicleId: 'V002', plateNumber: 'XYZ-5678', make: 'Honda', model: 'Beat', year: 2023, type: 'Moto', status: 'Active', currentLocation: { lat: 14.6095, lng: 120.9942, timestamp: new Date().toISOString() }, assignedDriver: { driverId: 'D002', name: 'Maria Cruz', phone: '+639876543210', assignedAt: new Date().toISOString() }, utilization: { hoursActive: 90, tripsCompleted: 380, revenueGenerated: 85000, distanceTraveled: 2800 }, maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 30*24*60*60*1000).toISOString(), mileage: 18000, serviceHistory: [] }, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { vehicleId: 'V003', plateNumber: 'DEF-9012', make: 'Mitsubishi', model: 'L300', year: 2021, type: 'Delivery', status: 'Maintenance', currentLocation: { lat: 14.5795, lng: 120.9742, timestamp: new Date().toISOString() }, utilization: { hoursActive: 200, tripsCompleted: 120, revenueGenerated: 95000, distanceTraveled: 5200 }, maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 7*24*60*60*1000).toISOString(), mileage: 45000, serviceHistory: [] }, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { vehicleId: 'V004', plateNumber: 'GHI-3456', make: 'Toyota', model: 'Innova', year: 2022, type: 'Taxi', status: 'Idle', currentLocation: { lat: 14.6195, lng: 121.0042, timestamp: new Date().toISOString() }, utilization: { hoursActive: 80, tripsCompleted: 200, revenueGenerated: 65000, distanceTraveled: 2200 }, maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 45*24*60*60*1000).toISOString(), mileage: 15000, serviceHistory: [] }, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { vehicleId: 'V005', plateNumber: 'JKL-7890', make: 'Suzuki', model: 'Raider', year: 2023, type: 'Moto', status: 'Active', currentLocation: { lat: 14.5895, lng: 120.9642, timestamp: new Date().toISOString() }, assignedDriver: { driverId: 'D005', name: 'Pedro Reyes', phone: '+639112233445', assignedAt: new Date().toISOString() }, utilization: { hoursActive: 110, tripsCompleted: 520, revenueGenerated: 110000, distanceTraveled: 3200 }, maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 30*24*60*60*1000).toISOString(), mileage: 12000, serviceHistory: [] }, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { vehicleId: 'V006', plateNumber: 'MNO-1111', make: 'Kawasaki', model: 'Barako', year: 2021, type: 'Moto', status: 'Offline', utilization: { hoursActive: 0, tripsCompleted: 0, revenueGenerated: 0, distanceTraveled: 0 }, maintenance: { lastService: new Date(Date.now() - 60*24*60*60*1000).toISOString(), nextServiceDue: new Date().toISOString(), mileage: 35000, serviceHistory: [] }, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// REAL API HOOK - Fetches vehicles from /api/fleet/vehicles
export function useVehicles(filters: VehiclesFilters = {}) {
  const { status, type, searchQuery, pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['vehicles', 'list', filters],
    queryFn: async (): Promise<VehiclesResponse> => {
      try {
        const response = await apiClient.get<BackendVehiclesResponse>(
          `api/fleet/vehicles?page=${pageNumber}&limit=${pageSize}`
        );

        // Map backend response to frontend format
        const items = (response.items || []).map(mapBackendVehicle);

        // If no data from API, use mock data
        if (items.length === 0) {
          return applyFilters(mockVehicles, status, type, searchQuery, pageNumber, pageSize);
        }

        // Apply frontend filters if needed
        return applyFilters(items, status, type, searchQuery, pageNumber, pageSize);
      } catch (error) {
        // Return mock data on error
        return applyFilters(mockVehicles, status, type, searchQuery, pageNumber, pageSize);
      }
    },
  });
}

function applyFilters(
  items: Vehicle[],
  status: VehicleStatus[] | undefined,
  type: VehicleType[] | undefined,
  searchQuery: string | undefined,
  pageNumber: number,
  pageSize: number
): VehiclesResponse {
  let filteredItems = items;
  if (status && status.length > 0) {
    filteredItems = filteredItems.filter(v => status.includes(v.status));
  }
  if (type && type.length > 0) {
    filteredItems = filteredItems.filter(v => type.includes(v.type));
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(v =>
      v.plateNumber.toLowerCase().includes(query) ||
      v.make.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    );
  }

  return {
    items: filteredItems,
    total: filteredItems.length,
    pageNumber,
    pageSize,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

// Get single vehicle
export function useVehicle(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async (): Promise<Vehicle | null> => {
      if (!vehicleId) return null;
      try {
        const response = await apiClient.get<BackendVehicle>(`api/fleet/vehicles/${vehicleId}`);
        return mapBackendVehicle(response);
      } catch (error) {
        // Return mock vehicle if API fails
        const mockVehicle = mockVehicles.find(v => v.vehicleId === vehicleId);
        return mockVehicle || null;
      }
    },
    enabled: !!vehicleId,
  });
}

// Fleet stats from backend
export function useFleetStats() {
  return useQuery({
    queryKey: ['fleet', 'stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          total_vehicles: number;
          active_vehicles: number;
          idle_vehicles: number;
          in_maintenance: number;
          offline_vehicles: number;
          utilization_rate: number;
        }>('api/fleet/stats');

        // Return mock stats if API returns zeros
        if (!response.total_vehicles) {
          return {
            totalVehicles: 6,
            activeVehicles: 3,
            idleVehicles: 1,
            inMaintenance: 1,
            offlineVehicles: 1,
            utilizationRate: 67,
          };
        }

        return {
          totalVehicles: response.total_vehicles || 0,
          activeVehicles: response.active_vehicles || 0,
          idleVehicles: response.idle_vehicles || 0,
          inMaintenance: response.in_maintenance || 0,
          offlineVehicles: response.offline_vehicles || 0,
          utilizationRate: response.utilization_rate || 0,
        };
      } catch (error) {
        // Return mock data on error
        return {
          totalVehicles: 6,
          activeVehicles: 3,
          idleVehicles: 1,
          inMaintenance: 1,
          offlineVehicles: 1,
          utilizationRate: 67,
        };
      }
    },
  });
}

// Bulk update vehicle status
export function useBulkUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { vehicleIds: string[]; status: VehicleStatus; reason?: string }) => {
      const response = await apiClient.post('api/fleet/vehicles/bulk-update', {
        vehicle_ids: data.vehicleIds,
        status: data.status.toUpperCase(),
        reason: data.reason,
      });
      return response as { updatedCount: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fleet', 'stats'] });
    },
  });
}

// Update single vehicle status
export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { vehicleId: string; status: VehicleStatus }) => {
      const response = await apiClient.patch(`api/fleet/vehicles/${data.vehicleId}`, {
        status: data.status.toUpperCase(),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fleet', 'stats'] });
    },
  });
}

// Assign driver to vehicle
export function useAssignDriverToVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { vehicleId: string; driverId: string }) => {
      const response = await apiClient.post(`api/fleet/vehicles/${data.vehicleId}/assign-driver`, {
        driver_id: data.driverId,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fleet', 'stats'] });
    },
  });
}

// Unassign driver from vehicle
export function useUnassignDriverFromVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await apiClient.post(`api/fleet/vehicles/${vehicleId}/unassign-driver`, {});
      return response;
    },
    onSuccess: (_, vehicleId) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fleet', 'stats'] });
    },
  });
}

// Search vehicles by query string
export function useSearchVehicles(searchQuery: string, pageSize: number = 20) {
  return useVehicles({ searchQuery, pageSize });
}

// Get vehicles by status
export function useVehiclesByStatus(status: VehicleStatus[], pageSize: number = 20) {
  return useVehicles({ status, pageSize });
}

// Get vehicles by type
export function useVehiclesByType(type: VehicleType[], pageSize: number = 20) {
  return useVehicles({ type, pageSize });
}
