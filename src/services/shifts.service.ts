/**
 * Shifts Service
 * Manages shifts through custom backend
 */

import { backendApi } from './backend.api';
import { BACKEND_ENDPOINTS } from '../config/backend.config';

export interface CreateShiftInput {
  driverId: string;
  assetId?: string;
  shiftType: 'AM' | 'PM' | 'NIGHT';
  scheduledStart: string;
  scheduledEnd?: string;
  geofenceId?: string;
}

export interface ClockInInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ClockOutInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
  odometerReading?: number;
}

export const shiftsService = {
  async list(params: {
    driverId?: string;
    status?: string;
    shiftType?: string;
    page?: number;
    limit?: number;
  } = {}) {
    return backendApi.get(BACKEND_ENDPOINTS.shifts.list, params);
  },

  async create(input: CreateShiftInput) {
    return backendApi.post(BACKEND_ENDPOINTS.shifts.create, input);
  },

  async getById(id: string) {
    return backendApi.get(BACKEND_ENDPOINTS.shifts.detail(id));
  },

  async clockIn(id: string, input: ClockInInput) {
    return backendApi.post(BACKEND_ENDPOINTS.shifts.clockIn(id), input);
  },

  async clockOut(id: string, input: ClockOutInput) {
    return backendApi.post(BACKEND_ENDPOINTS.shifts.clockOut(id), input);
  },

  async startBreak(id: string, reason?: string) {
    return backendApi.post(BACKEND_ENDPOINTS.shifts.startBreak(id), { reason });
  },

  async endBreak(id: string) {
    return backendApi.post(BACKEND_ENDPOINTS.shifts.endBreak(id), {});
  },

  async getDriverShifts(driverId: string, params: { page?: number; limit?: number } = {}) {
    return backendApi.get(BACKEND_ENDPOINTS.shifts.driverShifts(driverId), params);
  },
};

export default shiftsService;
