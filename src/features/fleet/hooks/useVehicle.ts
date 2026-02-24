import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { 
  Vehicle, 
  ServiceRecord, 
  VehicleUtilization,
  Location,
  VehicleStatus 
} from '@/types/domain.types';

export interface VehicleDetailResponse extends Vehicle {
  // Additional detail fields that might be returned by the API
  maintenanceAlerts?: MaintenanceAlert[];
  utilizationTrend?: UtilizationDataPoint[];
  tripHistory?: TripSummary[];
}

export interface MaintenanceAlert {
  id: string;
  type: 'service_due' | 'mileage_threshold' | 'document_expiry';
  severity: 'low' | 'medium' | 'high';
  message: string;
  dueDate?: string;
  mileageThreshold?: number;
}

export interface UtilizationDataPoint {
  date: string;
  hoursActive: number;
  tripsCompleted: number;
  revenueGenerated: number;
}

export interface TripSummary {
  tripId: string;
  date: string;
  distance: number;
  duration: number;
  revenue: number;
  driverName: string;
  status: 'completed' | 'cancelled' | 'ongoing';
}

export interface MaintenanceHistoryResponse {
  records: ServiceRecord[];
  totalCost: number;
  nextServiceDue?: string;
  overdueServices: number;
}

export interface VehicleLocationHistory {
  locations: Location[];
  totalDistance: number;
}

// Mock vehicle data for development
const mockVehicleDetails: Record<string, VehicleDetailResponse> = {
  'V001': {
    vehicleId: 'V001',
    plateNumber: 'ABC-1234',
    make: 'Toyota',
    model: 'Vios',
    year: 2022,
    type: 'Taxi',
    status: 'Active',
    currentLocation: { lat: 14.5995, lng: 120.9842, timestamp: new Date().toISOString() },
    assignedDriver: { driverId: 'D001', name: 'Juan Santos', phone: '+639123456789', assignedAt: new Date().toISOString() },
    utilization: { hoursActive: 120, tripsCompleted: 450, revenueGenerated: 125000, distanceTraveled: 3500 },
    maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 30*24*60*60*1000).toISOString(), mileage: 25000, serviceHistory: [] },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'V002': {
    vehicleId: 'V002',
    plateNumber: 'XYZ-5678',
    make: 'Honda',
    model: 'Beat',
    year: 2023,
    type: 'Moto',
    status: 'Active',
    currentLocation: { lat: 14.6095, lng: 120.9942, timestamp: new Date().toISOString() },
    assignedDriver: { driverId: 'D002', name: 'Maria Cruz', phone: '+639876543210', assignedAt: new Date().toISOString() },
    utilization: { hoursActive: 90, tripsCompleted: 380, revenueGenerated: 85000, distanceTraveled: 2800 },
    maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 30*24*60*60*1000).toISOString(), mileage: 18000, serviceHistory: [] },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'V003': {
    vehicleId: 'V003',
    plateNumber: 'DEF-9012',
    make: 'Mitsubishi',
    model: 'L300',
    year: 2021,
    type: 'Delivery',
    status: 'Maintenance',
    currentLocation: { lat: 14.5795, lng: 120.9742, timestamp: new Date().toISOString() },
    utilization: { hoursActive: 200, tripsCompleted: 120, revenueGenerated: 95000, distanceTraveled: 5200 },
    maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 7*24*60*60*1000).toISOString(), mileage: 45000, serviceHistory: [] },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'V004': {
    vehicleId: 'V004',
    plateNumber: 'GHI-3456',
    make: 'Toyota',
    model: 'Innova',
    year: 2022,
    type: 'Taxi',
    status: 'Idle',
    currentLocation: { lat: 14.6195, lng: 121.0042, timestamp: new Date().toISOString() },
    utilization: { hoursActive: 80, tripsCompleted: 200, revenueGenerated: 65000, distanceTraveled: 2200 },
    maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 45*24*60*60*1000).toISOString(), mileage: 15000, serviceHistory: [] },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'V005': {
    vehicleId: 'V005',
    plateNumber: 'JKL-7890',
    make: 'Suzuki',
    model: 'Raider',
    year: 2023,
    type: 'Moto',
    status: 'Active',
    currentLocation: { lat: 14.5895, lng: 120.9642, timestamp: new Date().toISOString() },
    assignedDriver: { driverId: 'D005', name: 'Pedro Reyes', phone: '+639112233445', assignedAt: new Date().toISOString() },
    utilization: { hoursActive: 110, tripsCompleted: 520, revenueGenerated: 110000, distanceTraveled: 3200 },
    maintenance: { lastService: new Date().toISOString(), nextServiceDue: new Date(Date.now() + 30*24*60*60*1000).toISOString(), mileage: 12000, serviceHistory: [] },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'V006': {
    vehicleId: 'V006',
    plateNumber: 'MNO-1111',
    make: 'Kawasaki',
    model: 'Barako',
    year: 2021,
    type: 'Moto',
    status: 'Offline',
    utilization: { hoursActive: 0, tripsCompleted: 0, revenueGenerated: 0, distanceTraveled: 0 },
    maintenance: { lastService: new Date(Date.now() - 60*24*60*60*1000).toISOString(), nextServiceDue: new Date().toISOString(), mileage: 35000, serviceHistory: [] },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Hook to fetch detailed vehicle information
 */
export function useVehicle(vehicleId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.fleet?.detail?.(vehicleId) || ['vehicle', vehicleId]],
    queryFn: async () => {
      try {
        const response = await apiClient.post<VehicleDetailResponse>(
          ENDPOINTS.fleet?.detail || 'AdminXpressOperator/GetVehicleDetail',
          { vehicleId }
        );
        return response;
      } catch (error) {
        // Return mock data if API fails
        const mockVehicle = mockVehicleDetails[vehicleId];
        if (mockVehicle) {
          return mockVehicle;
        }
        throw error;
      }
    },
    enabled: !!vehicleId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch vehicle maintenance history
 */
export function useVehicleMaintenanceHistory(vehicleId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.fleet?.maintenance?.(vehicleId) || ['vehicle', vehicleId, 'maintenance']],
    queryFn: async () => {
      const response = await apiClient.post<MaintenanceHistoryResponse>(
        ENDPOINTS.fleet?.maintenance || 'AdminXpressOperator/GetVehicleMaintenanceHistory',
        { vehicleId }
      );
      return response;
    },
    enabled: !!vehicleId,
  });
}

/**
 * Hook to fetch vehicle utilization metrics
 */
export function useVehicleUtilization(
  vehicleId: string, 
  startDate?: string, 
  endDate?: string
) {
  return useQuery({
    queryKey: [
      QUERY_KEYS.fleet?.utilization?.(vehicleId) || ['vehicle', vehicleId, 'utilization'],
      { startDate, endDate }
    ],
    queryFn: async () => {
      const response = await apiClient.post<{
        current: VehicleUtilization;
        trend: UtilizationDataPoint[];
        comparison: {
          vsLastWeek: number;
          vsLastMonth: number;
          vsFleetAverage: number;
        };
      }>(
        ENDPOINTS.fleet?.utilization || 'AdminXpressOperator/GetVehicleUtilization',
        { 
          vehicleId,
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: endDate || new Date().toISOString(),
        }
      );
      return response;
    },
    enabled: !!vehicleId,
  });
}

/**
 * Hook to fetch vehicle location history
 */
export function useVehicleLocationHistory(
  vehicleId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: [
      QUERY_KEYS.fleet?.location?.(vehicleId) || ['vehicle', vehicleId, 'location'],
      { startDate, endDate }
    ],
    queryFn: async () => {
      const response = await apiClient.post<VehicleLocationHistory>(
        ENDPOINTS.fleet?.locationHistory || 'AdminXpressOperator/GetVehicleLocationHistory',
        { 
          vehicleId,
          startDate: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: endDate || new Date().toISOString(),
        }
      );
      return response;
    },
    enabled: !!vehicleId,
  });
}

/**
 * Hook to fetch vehicle trip history
 */
export function useVehicleTripHistory(
  vehicleId: string,
  pageNumber = 1,
  pageSize = 20
) {
  return useQuery({
    queryKey: [
      QUERY_KEYS.fleet?.trips?.(vehicleId) || ['vehicle', vehicleId, 'trips'],
      { pageNumber, pageSize }
    ],
    queryFn: async () => {
      const response = await apiClient.post<{
        trips: TripSummary[];
        total: number;
      }>(
        ENDPOINTS.fleet?.trips || 'AdminXpressOperator/GetVehicleTripHistory',
        { vehicleId, pageNumber, pageSize }
      );
      return response;
    },
    enabled: !!vehicleId,
  });
}

/**
 * Mutation hook to add maintenance record
 */
export function useAddMaintenanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vehicleId: string;
      type: string;
      description: string;
      cost: number;
      mileage: number;
      date?: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; recordId: string }>(
        ENDPOINTS.fleet?.addMaintenance || 'AdminXpressOperator/AddMaintenanceRecord',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.fleet?.maintenance?.(variables.vehicleId) || ['vehicle', variables.vehicleId, 'maintenance']] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.fleet?.detail?.(variables.vehicleId) || ['vehicle', variables.vehicleId]] 
      });
    },
  });
}

/**
 * Mutation hook to update vehicle information
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vehicleId: string;
      make?: string;
      model?: string;
      year?: number;
      type?: string;
      plateNumber?: string;
    }) => {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.fleet?.update || 'AdminXpressOperator/UpdateVehicle',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.fleet?.detail?.(variables.vehicleId) || ['vehicle', variables.vehicleId]] 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.fleet?.list || 'vehicles'] });
    },
  });
}

/**
 * Mutation hook to update single vehicle status
 */
export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { vehicleId: string; status: VehicleStatus; reason?: string }) => {
      const response = await apiClient.post<{ success: boolean }>(
        ENDPOINTS.fleet?.updateStatus || 'AdminXpressOperator/UpdateVehicleStatus',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.fleet?.detail?.(variables.vehicleId) || ['vehicle', variables.vehicleId]] 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.fleet?.list || 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.fleet?.stats || 'fleetStats'] });
    },
  });
}

/**
 * Mutation hook to schedule vehicle maintenance
 */
export function useScheduleMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vehicleId: string;
      scheduledDate: string;
      serviceType: string;
      notes?: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; scheduleId: string }>(
        ENDPOINTS.fleet?.scheduleMaintenance || 'AdminXpressOperator/ScheduleMaintenance',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.fleet?.detail?.(variables.vehicleId) || ['vehicle', variables.vehicleId]] 
      });
    },
  });
}
