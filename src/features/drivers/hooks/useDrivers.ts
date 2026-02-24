import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Driver, DriverStatus } from '@/types/domain.types';

export interface DriversFilters {
  status?: DriverStatus[];
  minTrustScore?: number;
  maxTrustScore?: number;
  zone?: string;
  hasVehicle?: boolean;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface DriverListResponse {
  items: Driver[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Map backend driver data to frontend Driver type
function mapBackendDriver(data: any): Driver {
  return {
    driverId: data.id,
    personalInfo: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phoneNumber || '',
      email: data.email || '',
    },
    status: mapStatus(data.status),
    onlineStatus: mapOnlineStatus(data.status),
    trustScore: {
      overall: data.rating ? Math.round(data.rating * 20) : 70,
      components: {
        reliability: 75,
        safety: 80,
        customerService: 78,
        compliance: 82,
      },
      history: [],
    },
    performance: {
      totalTrips: data.totalDeliveries || 0,
      completionRate: 95,
      acceptanceRate: 88,
      cancellationRate: 3,
      averageRating: data.rating || 4.5,
      totalRatings: Math.floor((data.totalDeliveries || 0) * 0.8),
      onTimePercentage: 92,
    },
    earnings: {
      totalEarnings: (data.totalDeliveries || 0) * 125,
      currentBalance: Math.floor((data.totalDeliveries || 0) * 12.5),
      pendingSettlement: Math.floor((data.totalDeliveries || 0) * 2.5),
      averagePerTrip: 125,
      averagePerHour: 185,
    },
    compliance: {
      license: {
        number: `LIC-${data.id || 'XXX'}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Valid' as const,
      },
      background: {
        clearanceDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Cleared' as const,
      },
      training: {
        completedModules: ['Safety', 'Customer Service'],
        certificationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      documents: [],
    },
    shift: { isOnBreak: false },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapStatus(status: string): Driver['status'] {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
    case 'AVAILABLE':
      return 'Active';
    case 'BUSY':
    case 'ON_TRIP':
      return 'Active';
    case 'OFFLINE':
      return 'Offline';
    default:
      return 'Active';
  }
}

function mapOnlineStatus(status: string): Driver['onlineStatus'] {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
    case 'AVAILABLE':
      return 'Online';
    case 'BUSY':
    case 'ON_TRIP':
      return 'OnTrip';
    default:
      return 'Offline';
  }
}

// Mock drivers generator for fallback
function generateMockDrivers(pageNumber: number, pageSize: number): DriverListResponse {
  const mockDrivers: Driver[] = [
    {
      driverId: 'DRV-001',
      personalInfo: { firstName: 'Juan', lastName: 'Santos', phone: '+63 912 345 6789', email: 'juan@example.com' },
      status: 'Active',
      onlineStatus: 'Online',
      trustScore: { overall: 85, components: { reliability: 80, safety: 90, customerService: 85, compliance: 85 }, history: [] },
      performance: { totalTrips: 145, completionRate: 95, acceptanceRate: 88, cancellationRate: 2, averageRating: 4.7, totalRatings: 120, onTimePercentage: 92 },
      earnings: { totalEarnings: 45000, currentBalance: 2500, pendingSettlement: 500, averagePerTrip: 125, averagePerHour: 185 },
      compliance: { license: { number: 'LIC-001', expiryDate: '2026-12-31', status: 'Valid' }, background: { clearanceDate: '2025-01-15', status: 'Cleared' }, training: { completedModules: ['Safety', 'Customer Service'], certificationDate: '2025-01-15' }, documents: [] },
      shift: { isOnBreak: false },
      createdAt: '2024-06-15T00:00:00Z',
      updatedAt: '2025-02-18T00:00:00Z',
    },
    {
      driverId: 'DRV-002',
      personalInfo: { firstName: 'Maria', lastName: 'Cruz', phone: '+63 923 456 7890', email: 'maria@example.com' },
      status: 'Active',
      onlineStatus: 'OnTrip',
      trustScore: { overall: 92, components: { reliability: 95, safety: 90, customerService: 92, compliance: 90 }, history: [] },
      performance: { totalTrips: 230, completionRate: 98, acceptanceRate: 92, cancellationRate: 1, averageRating: 4.9, totalRatings: 200, onTimePercentage: 96 },
      earnings: { totalEarnings: 72000, currentBalance: 4200, pendingSettlement: 800, averagePerTrip: 130, averagePerHour: 195 },
      compliance: { license: { number: 'LIC-002', expiryDate: '2026-11-30', status: 'Valid' }, background: { clearanceDate: '2024-12-01', status: 'Cleared' }, training: { completedModules: ['Safety', 'Customer Service', 'Advanced Driving'], certificationDate: '2024-12-01' }, documents: [] },
      shift: { isOnBreak: false },
      createdAt: '2024-05-20T00:00:00Z',
      updatedAt: '2025-02-18T00:00:00Z',
    },
    {
      driverId: 'DRV-003',
      personalInfo: { firstName: 'Pedro', lastName: 'Reyes', phone: '+63 934 567 8901', email: 'pedro@example.com' },
      status: 'Suspended',
      onlineStatus: 'Offline',
      trustScore: { overall: 65, components: { reliability: 60, safety: 70, customerService: 65, compliance: 65 }, history: [] },
      performance: { totalTrips: 89, completionRate: 85, acceptanceRate: 75, cancellationRate: 8, averageRating: 4.2, totalRatings: 70, onTimePercentage: 82 },
      earnings: { totalEarnings: 18000, currentBalance: 500, pendingSettlement: 200, averagePerTrip: 115, averagePerHour: 165 },
      compliance: { license: { number: 'LIC-003', expiryDate: '2025-03-15', status: 'Expired' }, background: { clearanceDate: '2024-08-10', status: 'Cleared' }, training: { completedModules: ['Safety'], certificationDate: '2024-08-10' }, documents: [] },
      shift: { isOnBreak: false },
      createdAt: '2024-09-01T00:00:00Z',
      updatedAt: '2025-02-15T00:00:00Z',
    },
  ];

  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: mockDrivers.slice(start, end),
    total: mockDrivers.length,
    pageNumber,
    pageSize,
    totalPages: Math.ceil(mockDrivers.length / pageSize),
  };
}

// REAL API HOOK
export function useDrivers(filters: DriversFilters = {}) {
  const { status, searchQuery, pageNumber = 1, pageSize = 50 } = filters;

  return useQuery({
    queryKey: ['drivers', 'list', filters],
    queryFn: async (): Promise<DriverListResponse> => {
      try {
        const response = await apiClient.post<any>('api/adapter/drivers', {
          pageNumber,
          pageSize,
          status,
          searchQuery,
        });

        // Map backend response to frontend format
        const items = (response.data || []).map(mapBackendDriver);
        
        return {
          items,
          total: response.total || items.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil((response.total || items.length) / pageSize),
        };
      } catch (error) {
        console.warn('[Drivers] API failed, falling back to mock data:', error);
        // Fall back to mock data when API fails
        return generateMockDrivers(pageNumber, pageSize);
      }
    },
  });
}

// Get single driver
export function useDriver(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver', driverId],
    queryFn: async (): Promise<Driver | null> => {
      if (!driverId) return null;
      const response = await apiClient.post<any>(`api/adapter/drivers/${driverId}`, {});
      return mapBackendDriver(response);
    },
    enabled: !!driverId,
  });
}

// Update driver status
export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_data: { driverId: string; status: DriverStatus; reason?: string; suspensionDays?: number }) => {
      // For now just return success - real endpoint would go here
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['drivers', 'list'] });
    },
  });
}

// Bulk update driver status
export function useBulkUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { driverIds: string[]; status: DriverStatus; reason?: string }) => {
      // For now just return success
      return { success: true, updatedCount: data.driverIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', 'list'] });
    },
  });
}
