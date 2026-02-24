// src/features/shifts/hooks/useShifts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ShiftType, ShiftStatus } from '@/types/domain.types';
export type { ShiftType, ShiftStatus };

// Shift entity type
export interface Shift {
  id: string;
  shiftId: string;
  driverId: string;
  driverName: string;
  driver?: {
    driverId: string;
    firstName: string;
    lastName: string;
    phone: string;
    photoUrl?: string;
  };
  asset?: {
    vehicleId: string;
    plateNumber: string;
    type: string;
  };
  shiftType: string;
  status: string;
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  clockInLat?: number;
  clockInLng?: number;
  duration?: number;
  revenue?: number;
  totalRevenue?: number;
  trips?: number;
  tripCount?: number;
  utilizedMinutes?: number;
  breakCount?: number;
  breakStart?: string;
  breakMinutes?: number;
  isLate?: boolean;
  minutesLate?: number;
  isUnderworking?: boolean;
  underworkingMinutes?: number;
  hasIncident?: boolean;
}

export interface ShiftFilters {
  status?: ShiftStatus | ShiftStatus[];
  shiftType?: ShiftType;
  date?: Date;
  driverId?: string;
  hasIncident?: boolean;
  underWorking?: boolean;
  lateArrival?: boolean;
}

export interface CreateShiftInput {
  driverId: string;
  assetId?: string;
  shiftType: ShiftType;
  scheduledStart: Date;
  scheduledEnd?: Date;
  geofenceId?: string;
}

export interface RollCallEntry {
  driverId: string;
  driverName: string;
  shiftId: string;
  arrivedAt: Date | null;
  isLate: boolean;
  canStart: boolean;
  blockReason?: string;
}

export interface RollCallData {
  shiftType: ShiftType;
  scheduledStart: Date;
  entries: RollCallEntry[];
  stats: {
    total: number;
    arrived: number;
    notArrived: number;
    canStart: number;
    blocked: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  driverId: string;
  driverName: string;
  revenuePerHour: number;
  totalRevenue: number;
  tripCount: number;
  utilizationPercent: number;
}

// Mock shift data
const mockShifts = {
  data: [
    { id: 'S001', shiftId: 'S001', driverId: 'D001', driverName: 'Juan Santos', shiftType: 'AM', status: 'Completed', scheduledStart: new Date(Date.now() - 8*60*60*1000).toISOString(), scheduledEnd: new Date(Date.now() - 2*60*60*1000).toISOString(), actualStart: new Date(Date.now() - 7.9*60*60*1000).toISOString(), actualEnd: new Date(Date.now() - 2.1*60*60*1000).toISOString(), duration: 360, revenue: 2850, trips: 18, hasIncident: false, isLate: false },
    { id: 'S002', shiftId: 'S002', driverId: 'D002', driverName: 'Maria Cruz', shiftType: 'AM', status: 'Active', scheduledStart: new Date(Date.now() - 4*60*60*1000).toISOString(), scheduledEnd: new Date(Date.now() + 2*60*60*1000).toISOString(), actualStart: new Date(Date.now() - 4.1*60*60*1000).toISOString(), duration: 240, revenue: 1920, trips: 12, hasIncident: false, isLate: true },
    { id: 'S003', shiftId: 'S003', driverId: 'D005', driverName: 'Pedro Reyes', shiftType: 'PM', status: 'Scheduled', scheduledStart: new Date(Date.now() + 1*60*60*1000).toISOString(), scheduledEnd: new Date(Date.now() + 9*60*60*1000).toISOString(), hasIncident: false, isLate: false },
    { id: 'S004', shiftId: 'S004', driverId: 'D007', driverName: 'Ana Lopez', shiftType: 'PM', status: 'Active', scheduledStart: new Date(Date.now() - 2*60*60*1000).toISOString(), scheduledEnd: new Date(Date.now() + 6*60*60*1000).toISOString(), actualStart: new Date(Date.now() - 2*60*60*1000).toISOString(), duration: 120, revenue: 980, trips: 7, hasIncident: true, isLate: false },
  ],
  total: 4,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const mockRollCall: RollCallData = {
  shiftType: 'AM',
  scheduledStart: new Date(),
  entries: [
    { driverId: 'D001', driverName: 'Juan Santos', shiftId: 'S001', arrivedAt: new Date(Date.now() - 8.2*60*60*1000), isLate: false, canStart: true },
    { driverId: 'D002', driverName: 'Maria Cruz', shiftId: 'S002', arrivedAt: new Date(Date.now() - 4.2*60*60*1000), isLate: true, canStart: true },
    { driverId: 'D005', driverName: 'Pedro Reyes', shiftId: 'S003', arrivedAt: null, isLate: false, canStart: false, blockReason: 'Bond below threshold' },
  ],
  stats: { total: 3, arrived: 2, notArrived: 1, canStart: 2, blocked: 1 },
};

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, driverId: 'D001', driverName: 'Juan Santos', revenuePerHour: 475, totalRevenue: 2850, tripCount: 18, utilizationPercent: 92 },
  { rank: 2, driverId: 'D007', driverName: 'Ana Lopez', revenuePerHour: 490, totalRevenue: 1960, tripCount: 14, utilizationPercent: 89 },
  { rank: 3, driverId: 'D002', driverName: 'Maria Cruz', revenuePerHour: 480, totalRevenue: 1920, tripCount: 12, utilizationPercent: 85 },
];

// List shifts with filters
export function useShifts(filters: ShiftFilters = {}, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['shifts', filters, page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status as string);
        if (filters.shiftType) params.append('shiftType', filters.shiftType);
        if (filters.driverId) params.append('driverId', filters.driverId);
        if (filters.date) params.append('date', filters.date.toISOString());
        if (filters.hasIncident !== undefined) params.append('hasIncident', String(filters.hasIncident));
        if (filters.underWorking !== undefined) params.append('underWorking', String(filters.underWorking));
        if (filters.lateArrival !== undefined) params.append('lateArrival', String(filters.lateArrival));
        params.append('page', String(page));
        params.append('limit', String(limit));

        const response = await apiClient.get<{data: Shift[]; total: number; page: number; limit: number; totalPages: number}>(`/shifts?${params.toString()}`);
        // Return mock if empty
        if (!response?.data || response.data.length === 0) {
          return mockShifts;
        }
        return response;
      } catch (error) {
        return mockShifts;
      }
    },
  });
}

// Get shift by ID
export function useShift(shiftId: string) {
  return useQuery<Shift>({
    queryKey: ['shift', shiftId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Shift>(`/shifts/${shiftId}`);
        if (response) return response;
      } catch (error) {
        // Return mock data for development
      }
      // Return mock shift matching the ID or default
      const mockShift = mockShifts.data.find(s => s.shiftId === shiftId || s.id === shiftId);
      if (mockShift) {
        return {
          ...mockShift,
          id: mockShift.shiftId,
        } as Shift;
      }
      // Return first mock shift as fallback
      return {
        ...mockShifts.data[0],
        id: mockShifts.data[0].shiftId,
      } as Shift;
    },
    enabled: !!shiftId,
  });
}

// Create shift
export function useCreateShift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateShiftInput) => {
      const response = await apiClient.post('/shifts', input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

// Get roll call data
export function useRollCall(shiftType: ShiftType, date?: Date) {
  return useQuery({
    queryKey: ['rollCall', shiftType, date],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('shiftType', shiftType);
        if (date) params.append('date', date.toISOString());

        const response = await apiClient.get(`/shifts/roll-call?${params.toString()}`);
        return (response as RollCallData) || mockRollCall;
      } catch (error) {
        return mockRollCall;
      }
    },
  });
}

// Get leaderboard
export function useLeaderboard(date: Date, shiftType?: ShiftType, limit: number = 10) {
  return useQuery({
    queryKey: ['leaderboard', date, shiftType, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('date', date.toISOString());
        if (shiftType) params.append('shiftType', shiftType);
        params.append('limit', String(limit));

        const response = await apiClient.get(`/shifts/leaderboard?${params.toString()}`);
        return (response as LeaderboardEntry[]) || mockLeaderboard.slice(0, limit);
      } catch (error) {
        return mockLeaderboard.slice(0, limit);
      }
    },
  });
}

// Cancel shift
export function useCancelShift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shiftId: string) => {
      const response = await apiClient.patch(`/shifts/${shiftId}/cancel`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}
