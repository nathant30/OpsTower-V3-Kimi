// src/services/shift.service.ts
// Shift Service - Full lifecycle with geofence, bond check, and roll call

import { Shift, ShiftType, ShiftStatus, Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { prisma } from '../models/db.js';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// ============================================================================
// CONSTANTS
// ============================================================================

const SHIFT_TIMES = {
  AM: { start: '06:00', end: '14:00' },
  PM: { start: '14:00', end: '22:00' },
  NIGHT: { start: '22:00', end: '06:00' },
};

const GEOFENCE_RADIUS_METERS = 100;
const EARLY_ARRIVAL_MINUTES = 20;
const GRACE_PERIOD_MINUTES = 5;
const MAX_BREAK_MINUTES = 30;
const MAX_BREAKS_PER_SHIFT = 2;
const MAX_EARLY_START_MINUTES = 60;

// ============================================================================
// TYPES
// ============================================================================

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

export interface BreakInput {
  reason?: string;
}

export interface PreShiftChecklist {
  vehicleCondition?: string;
  dashcamCheck?: boolean;
  gpsCheck?: boolean;
  cleanlinessCheck?: boolean;
  notes?: string;
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function isWithinGeofence(
  userLat: number,
  userLng: number,
  geofenceLat: number,
  geofenceLng: number,
  radiusMeters: number = GEOFENCE_RADIUS_METERS
): boolean {
  const distance = calculateDistance(userLat, userLng, geofenceLat, geofenceLng);
  return distance <= radiusMeters;
}

function getDefaultShiftTimes(shiftType: ShiftType, date: Date) {
  const baseDate = dayjs(date).format('YYYY-MM-DD');
  
  switch (shiftType) {
    case 'AM':
      return {
        start: dayjs(`${baseDate}T${SHIFT_TIMES.AM.start}`).toDate(),
        end: dayjs(`${baseDate}T${SHIFT_TIMES.AM.end}`).toDate(),
      };
    case 'PM':
      return {
        start: dayjs(`${baseDate}T${SHIFT_TIMES.PM.start}`).toDate(),
        end: dayjs(`${baseDate}T${SHIFT_TIMES.PM.end}`).toDate(),
      };
    // NIGHT shift type not supported in current schema
    // Only AM and PM are valid ShiftTypes
    default:
      throw new ValidationError(`Invalid shift type: ${shiftType}`);
  }
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function createShift(input: CreateShiftInput): Promise<Shift> {
  const driver = await prisma.driver.findUnique({
    where: { id: input.driverId },
  });

  if (!driver) {
    throw new NotFoundError(`Driver not found: ${input.driverId}`);
  }

  let scheduledStart = input.scheduledStart;
  let scheduledEnd = input.scheduledEnd;

  if (!scheduledEnd) {
    const times = getDefaultShiftTimes(input.shiftType, scheduledStart);
    scheduledStart = times.start;
    scheduledEnd = times.end;
  }

  // Check for overlapping shifts
  const existingShift = await prisma.shift.findFirst({
    where: {
      driverId: input.driverId,
      scheduledStart: { lte: scheduledEnd },
      scheduledEnd: { gte: scheduledStart },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
  });

  if (existingShift) {
    throw new ConflictError('Driver has an overlapping shift');
  }

  // Note: Shift model requires assetId and shiftDate
  if (!input.assetId) {
    throw new ValidationError('Asset ID is required to create a shift');
  }

  const shift = await prisma.shift.create({
    data: {
      driverId: input.driverId,
      assetId: input.assetId,
      shiftType: input.shiftType,
      shiftDate: scheduledStart,
      scheduledStart,
      scheduledEnd,
      status: 'SCHEDULED',
      geofenceId: input.geofenceId,
    } as any,
  });

  return shift;
}

export async function getShiftById(id: string): Promise<Shift & { driver?: any; asset?: any }> {
  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      asset: true,
      clockInGeofence: true,
    },
  });

  if (!shift) {
    throw new NotFoundError(`Shift not found: ${id}`);
  }

  return shift;
}

export async function listShifts(
  filters: ShiftFilters,
  page: number = 1,
  limit: number = 20
) {
  const where: any = {};

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      where.status = { in: filters.status };
    } else {
      where.status = filters.status;
    }
  }

  if (filters.shiftType) where.shiftType = filters.shiftType;
  if (filters.driverId) where.driverId = filters.driverId;
  if (filters.hasIncident !== undefined) where.hasIncident = filters.hasIncident;
  // Note: underWorking and lateArrival flags not in current schema

  if (filters.date) {
    const startOfDay = dayjs(filters.date).startOf('day').toDate();
    const endOfDay = dayjs(filters.date).endOf('day').toDate();
    where.scheduledStart = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const [shifts, total] = await Promise.all([
    prisma.shift.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledStart: 'desc' },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phonePrimary: true,
            currentTier: true,
            securityBondBalance: true,
            securityBondRequired: true,
          },
        },
        asset: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
          },
        },
        _count: {
          select: {
            trips: true,
            incidents: true,
          },
        },
      },
    }),
    prisma.shift.count({ where }),
  ]);

  return {
    data: shifts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getActiveByDriver(driverId: string): Promise<Shift | null> {
  return prisma.shift.findFirst({
    where: {
      driverId,
      status: { in: ['CLOCKED_IN', 'ACTIVE', 'ON_BREAK'] },
    },
  });
}

// ============================================================================
// ROLL CALL
// ============================================================================

export async function getRollCall(
  shiftType: ShiftType,
  date?: Date
): Promise<RollCallData> {
  const targetDate = date ? dayjs(date).startOf('day') : dayjs().startOf('day');
  
  // Get all scheduled shifts for this type and date
  const shifts = await prisma.shift.findMany({
    where: {
      shiftType,
      shiftDate: targetDate.toDate(),
      status: { notIn: ['CANCELLED'] },
    },
    include: {
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          securityBondBalance: true,
          securityBondRequired: true,
        },
      },
    },
    orderBy: [{ driverId: 'asc' }],
  });

  const entries: RollCallEntry[] = shifts.map((shift) => {
    const arrivedAt = shift.clockInTime;
    const scheduledStart = dayjs(shift.scheduledStart);
    const requiredArrival = scheduledStart.subtract(EARLY_ARRIVAL_MINUTES, 'minute');
    const isLate = arrivedAt ? dayjs(arrivedAt).isAfter(requiredArrival.add(GRACE_PERIOD_MINUTES, 'minute')) : false;
    // Note: lateArrivalFlag stored separately if needed

    // Check bond status
    const bondPercent = (Number(shift.driver.securityBondBalance) / Number(shift.driver.securityBondRequired)) * 100;
    const canStart = bondPercent >= 100;
    const blockReason = canStart ? undefined : 'Bond insufficient';

    return {
      driverId: shift.driver.id,
      driverName: `${shift.driver.firstName} ${shift.driver.lastName}`,
      shiftId: shift.id,
      arrivedAt,
      isLate,
      canStart,
      blockReason,
    };
  });

  return {
    shiftType,
    scheduledStart: shifts[0]?.scheduledStart || targetDate.toDate(),
    entries,
    stats: {
      total: entries.length,
      arrived: entries.filter((e) => e.arrivedAt !== null).length,
      notArrived: entries.filter((e) => e.arrivedAt === null).length,
      canStart: entries.filter((e) => e.canStart).length,
      blocked: entries.filter((e) => !e.canStart).length,
    },
  };
}

// ============================================================================
// CLOCK IN/OUT
// ============================================================================

export async function clockIn(
  shiftId: string,
  input: ClockInInput,
  checklist?: PreShiftChecklist
): Promise<Shift> {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shift.findUnique({
      where: { id: shiftId },
      include: { 
        driver: true, 
        clockInGeofence: true,
      },
    });

    if (!shift) {
      throw new NotFoundError(`Shift not found: ${shiftId}`);
    }

    if (shift.status !== 'SCHEDULED') {
      throw new ConflictError(`Cannot clock in: shift is ${shift.status}`);
    }

    // Check GPS accuracy
    if (input.accuracy && input.accuracy > 50) {
      throw new ValidationError('GPS accuracy too low. Please move to an open area.');
    }

    // Check geofence
    if (shift.clockInGeofence) {
      const withinGeofence = isWithinGeofence(
        input.latitude,
        input.longitude,
        shift.clockInGeofence.centerLat.toNumber(),
        shift.clockInGeofence.centerLng.toNumber(),
        shift.clockInGeofence.radiusMeters
      );

      if (!withinGeofence) {
        throw new ValidationError('You must be within the designated shift location to clock in');
      }
    }

    // Check bond status (BOND LOCK)
    const bondPercent = (Number(shift.driver.securityBondBalance) / Number(shift.driver.securityBondRequired)) * 100;
    if (bondPercent < 100) {
      throw new ValidationError(`Cannot start shift: Bond is ${bondPercent.toFixed(1)}% (100% required)`);
    }

    // Calculate if late
    const scheduledStart = dayjs(shift.scheduledStart);
    const clockInTime = dayjs();
    const gracePeriodEnd = scheduledStart.add(GRACE_PERIOD_MINUTES, 'minute');
    const isLate = clockInTime.isAfter(gracePeriodEnd);
    const minutesLate = isLate ? clockInTime.diff(scheduledStart, 'minute') : 0;

    // Update shift
    const updated = await tx.shift.update({
      where: { id: shiftId },
      data: {
        status: 'CLOCKED_IN',
        clockInTime: clockInTime.toDate(),
        clockInLat: input.latitude,
        clockInLng: input.longitude,
        // Note: clockInAccuracy, isLate, minutesLate, preShiftChecklist not in current schema
      },
    });

    return updated;
  });
}

export async function clockOut(
  shiftId: string,
  input: ClockOutInput
): Promise<Shift> {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { driver: true, clockOutGeofence: true },
  });

  if (!shift) {
    throw new NotFoundError(`Shift not found: ${shiftId}`);
  }

  if (shift.status !== 'ACTIVE' && shift.status !== 'ON_BREAK' && shift.status !== 'CLOCKED_IN') {
    throw new ConflictError(`Cannot clock out: shift is ${shift.status}`);
  }

  // Check geofence
  if (shift.clockOutGeofence) {
    const withinGeofence = isWithinGeofence(
      input.latitude,
      input.longitude,
      shift.clockOutGeofence.centerLat.toNumber(),
      shift.clockOutGeofence.centerLng.toNumber(),
      shift.clockOutGeofence.radiusMeters
    );

    if (!withinGeofence) {
      throw new ValidationError('You must be within the designated location to clock out');
    }
  }

  const clockOutTime = dayjs();
  const clockInTime = shift.clockInTime ? dayjs(shift.clockInTime) : dayjs(shift.scheduledStart);
  const durationMinutes = clockOutTime.diff(clockInTime, 'minute');

  // Calculate if underworking
  const scheduledEnd = dayjs(shift.scheduledEnd);
  const scheduledStart = dayjs(shift.scheduledStart);
  const scheduledDuration = scheduledEnd.diff(scheduledStart, 'minute');
  // Note: underworking detection would require actualStart field in schema
  const isUnderworking = durationMinutes < scheduledDuration * 0.9;

  const updated = await prisma.shift.update({
    where: { id: shiftId },
    data: {
      status: 'COMPLETED',
      clockOutTime: clockOutTime.toDate(),
      clockOutLat: input.latitude,
      clockOutLng: input.longitude,
      // Note: clockOutAccuracy, odometerEnd, isUnderworking, underworkingMinutes not in current schema
    },
  });

  return updated;
}

// ============================================================================
// BREAK MANAGEMENT
// ============================================================================

export async function startBreak(shiftId: string, input: BreakInput): Promise<Shift> {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
  });

  if (!shift) {
    throw new NotFoundError(`Shift not found: ${shiftId}`);
  }

  if (shift.status !== 'ACTIVE' && shift.status !== 'CLOCKED_IN') {
    throw new ConflictError(`Cannot start break: shift is ${shift.status}`);
  }

  // Note: breakCount field not in schema
  // Break management would require schema changes (breakCount, breakStart, breakEnd, breakMinutes)

  const updated = await prisma.shift.update({
    where: { id: shiftId },
    data: {
      status: 'ON_BREAK',
    },
  });

  return updated;
}

export async function endBreak(shiftId: string): Promise<Shift> {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
  });

  if (!shift) {
    throw new NotFoundError(`Shift not found: ${shiftId}`);
  }

  if (shift.status !== 'ON_BREAK') {
    throw new ConflictError(`Cannot end break: shift is ${shift.status}`);
  }

  // Note: break tracking fields (breakStart, breakEnd, breakMinutes) not in schema

  const updated = await prisma.shift.update({
    where: { id: shiftId },
    data: {
      status: 'ACTIVE',
    },
  });

  return updated;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export async function getLeaderboard(
  date: Date,
  shiftType?: ShiftType,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const targetDate = dayjs(date).startOf('day').toDate();

  const where: Prisma.ShiftWhereInput = {
    shiftDate: targetDate,
    status: 'COMPLETED',
  };

  if (shiftType) {
    where.shiftType = shiftType;
  }

  const shifts = await prisma.shift.findMany({
    where,
    include: {
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      totalRevenue: 'desc',
    },
    take: limit,
  });

  return shifts.map((shift, index) => {
    // Note: utilizedMinutes, actualStart, actualEnd not in current schema
    // Using onlineMinutes as approximation
    const revenuePerHour = shift.onlineMinutes > 0
      ? (Number(shift.totalRevenue) / shift.onlineMinutes) * 60
      : 0;

    const totalMinutes = shift.onlineMinutes;
    // Note: utilizedMinutes not in schema
    const utilizationPercent = totalMinutes > 0
      ? (shift.onlineMinutes / totalMinutes) * 100
      : 0;

    return {
      rank: index + 1,
      driverId: shift.driver.id,
      driverName: `${shift.driver.firstName} ${shift.driver.lastName}`,
      revenuePerHour: Math.round(revenuePerHour * 100) / 100,
      totalRevenue: Number(shift.totalRevenue),
      tripCount: shift.tripCount,
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
    };
  });
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const shiftService = {
  create: createShift,
  getById: getShiftById,
  list: listShifts,
  getActiveByDriver,
  getRollCall,
  getLeaderboard,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
};

export default shiftService;
