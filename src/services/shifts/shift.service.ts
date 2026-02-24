/**
 * Shift Service
 * Handles all shift-related API calls including clock in/out and break management
 */

import { backendApi } from '../backend.api';
import { BACKEND_ENDPOINTS } from '../../config/backend.config';
import type { 
  Shift, 
  ShiftFilters, 
  CreateShiftData, 
  ClockInData, 
  ClockOutData, 
  StartBreakData 
} from '../../features/shifts/types';

export interface ShiftsListResponse {
  data: Shift[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get shifts list with filters
 */
export async function getShifts(filters: ShiftFilters = {}, page: number = 1, limit: number = 20): Promise<ShiftsListResponse> {
  const params: Record<string, any> = { page, limit };
  
  if (filters.status) {
    params.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
  }
  if (filters.shiftType) params.shiftType = filters.shiftType;
  if (filters.driverId) params.driverId = filters.driverId;
  if (filters.date) params.date = filters.date.toISOString();
  if (filters.hasIncident !== undefined) params.hasIncident = filters.hasIncident;
  if (filters.underWorking !== undefined) params.underWorking = filters.underWorking;
  if (filters.lateArrival !== undefined) params.lateArrival = filters.lateArrival;

  return backendApi.get<ShiftsListResponse>(BACKEND_ENDPOINTS.shifts.list, params);
}

/**
 * Get a single shift by ID
 */
export async function getShiftById(id: string): Promise<Shift> {
  return backendApi.get<Shift>(BACKEND_ENDPOINTS.shifts.detail(id));
}

/**
 * Create a new shift
 */
export async function createShift(data: CreateShiftData): Promise<Shift> {
  const payload = {
    ...data,
    scheduledStart: data.scheduledStart instanceof Date ? data.scheduledStart.toISOString() : data.scheduledStart,
    scheduledEnd: data.scheduledEnd instanceof Date ? data.scheduledEnd.toISOString() : data.scheduledEnd,
  };
  return backendApi.post<Shift>(BACKEND_ENDPOINTS.shifts.create, payload);
}

/**
 * Clock in to a shift
 */
export async function clockIn(id: string, data: ClockInData = {}): Promise<Shift> {
  return backendApi.post<Shift>(BACKEND_ENDPOINTS.shifts.clockIn(id), data);
}

/**
 * Clock out of a shift
 */
export async function clockOut(id: string, data: ClockOutData = {}): Promise<Shift> {
  return backendApi.post<Shift>(BACKEND_ENDPOINTS.shifts.clockOut(id), data);
}

/**
 * Start a break during a shift
 */
export async function startBreak(id: string, data: StartBreakData = {}): Promise<Shift> {
  return backendApi.post<Shift>(BACKEND_ENDPOINTS.shifts.startBreak(id), data);
}

/**
 * End a break during a shift
 */
export async function endBreak(id: string): Promise<Shift> {
  return backendApi.post<Shift>(BACKEND_ENDPOINTS.shifts.endBreak(id), {});
}

/**
 * Get shifts for a specific driver
 */
export async function getDriverShifts(driverId: string, page: number = 1, limit: number = 20): Promise<ShiftsListResponse> {
  return backendApi.get<ShiftsListResponse>(BACKEND_ENDPOINTS.shifts.driverShifts(driverId), { page, limit });
}

/**
 * Cancel a shift
 */
export async function cancelShift(id: string): Promise<Shift> {
  return backendApi.patch<Shift>(`${BACKEND_ENDPOINTS.shifts.detail(id)}/cancel`, {});
}

// Default export for convenience
export const shiftService = {
  getShifts,
  getShiftById,
  createShift,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getDriverShifts,
  cancelShift,
};

export default shiftService;
