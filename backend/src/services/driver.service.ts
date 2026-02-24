// src/services/driver.service.ts
// Driver Service - Tiers, Performance, and Operations

import { Driver, DriverTier, Prisma } from '@prisma/client';
import { prisma } from '../models/db.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

// ============================================================================
// TIER THRESHOLDS
// ============================================================================

interface TierThreshold {
  tier: DriverTier;
  minTrips: number;
  minRating: number;
  maxCancellationRate: number;
  earningsBonus: number;
}

const TIER_THRESHOLDS: TierThreshold[] = [
  {
    tier: 'BRONZE',
    minTrips: 0,
    minRating: 0,
    maxCancellationRate: 100,
    earningsBonus: 0,
  },
  {
    tier: 'SILVER',
    minTrips: 50,
    minRating: 4.5,
    maxCancellationRate: 5,
    earningsBonus: 5,
  },
  {
    tier: 'GOLD',
    minTrips: 150,
    minRating: 4.7,
    maxCancellationRate: 3,
    earningsBonus: 10,
  },
  {
    tier: 'PLATINUM',
    minTrips: 500,
    minRating: 4.8,
    maxCancellationRate: 2,
    earningsBonus: 15,
  },
];

// 28-day rolling window configuration
const TIER_CALCULATION = {
  rollingWindowDays: 28,
  maxShiftsInWindow: 20,
  trainingPeriodShifts: 5,
};

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface DriverFilters {
  status?: string | string[];
  tier?: string | string[];
  serviceSegment?: string;
  assignedOverwatchId?: string;
  search?: string;
}

export interface CreateDriverInput {
  employeeId: string;
  firstName: string;
  lastName: string;
  phonePrimary: string;
  email?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  serviceSegment: string;
  securityBondRequired?: number;
  hireDate?: Date;
}

export interface UpdateDriverInput {
  licenseNumber?: string;
  licenseExpiry?: Date;
  status?: string;
  serviceSegment?: string;
  securityBondRequired?: number;
  assignedOverwatchId?: string;
  assignedSectorId?: string;
}

export interface BondStatus {
  balance: number;
  required: number;
  percent: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
  canStartShift: boolean;
}

export interface DriverMetrics {
  shiftsCompleted: number;
  avgRevenuePerHour: number;
  cancellationRate: number;
  totalRevenue: number;
  totalTrips: number;
}

export interface ComplianceStatus {
  isCompliant: boolean;
  issues: ComplianceIssue[];
}

export type ComplianceIssue = 
  | 'LICENSE_EXPIRED'
  | 'LICENSE_EXPIRING_SOON'
  | 'NBI_EXPIRED'
  | 'DRUG_TEST_EXPIRED'
  | 'BOND_BELOW_REQUIRED';

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get driver by ID with relations
 */
export async function getDriverById(id: string): Promise<Driver & {
  user?: any;
  _count?: any;
}> {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      // Note: Driver model doesn't have user relation - fields are on Driver directly
      currentAsset: true,
      _count: {
        select: {
          trips: true,
          shifts: true,
          incidents: true,
        },
      },
    },
  });

  if (!driver) {
    throw new NotFoundError(`Driver not found: ${id}`);
  }

  return driver;
}

/**
 * List drivers with filters and pagination
 */
export async function listDrivers(
  filters: DriverFilters = {},
  page: number = 1,
  limit: number = 20,
  userId?: string,
  userRole?: string
) {
  const where: Prisma.DriverWhereInput = {};

  // Status filter
  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status as any }
      : (filters.status as any);
  }

  // Tier filter
  if (filters.tier) {
    where.currentTier = Array.isArray(filters.tier)
      ? { in: filters.tier as any }
      : (filters.tier as any);
  }

  // Service segment filter
  if (filters.serviceSegment) {
    where.serviceSegment = filters.serviceSegment as any;
  }

  // OVERWATCH_STAFF restriction - only see assigned drivers
  if (userRole === 'OVERWATCH_STAFF' && userId) {
    where.assignedOverwatchId = userId;
  } else if (filters.assignedOverwatchId) {
    where.assignedOverwatchId = filters.assignedOverwatchId;
  }

  // Search by name, phone
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { phonePrimary: { contains: filters.search } },
      { employeeId: { contains: filters.search } },
    ];
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: {
            trips: true,
            shifts: true,
          },
        },
      },
    }),
    prisma.driver.count({ where }),
  ]);

  return {
    data: drivers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Create a new driver
 */
export async function createDriver(
  data: CreateDriverInput,
  createdById?: string
): Promise<Driver> {
  // Create driver - Driver model is standalone (no user relation)
  const driver = await prisma.driver.create({
    data: {
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      phonePrimary: data.phonePrimary,
      email: data.email,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      serviceSegment: data.serviceSegment as any,
      status: 'TRAINING',
      currentTier: 'UNRANKED',
      securityBondBalance: 0,
      securityBondRequired: data.securityBondRequired || 5000,
      hireDate: data.hireDate || new Date(),
      createdById,
    },
  });

  return driver;
}

/**
 * Update a driver
 */
export async function updateDriver(
  id: string,
  data: UpdateDriverInput
): Promise<Driver> {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Driver not found: ${id}`);
  }

  const updateData: Prisma.DriverUpdateInput = {};

  if (data.licenseNumber) updateData.licenseNumber = data.licenseNumber;
  if (data.licenseExpiry) updateData.licenseExpiry = data.licenseExpiry;
  if (data.status) updateData.status = data.status as any;
  if (data.serviceSegment) updateData.serviceSegment = data.serviceSegment as any;
  if (data.securityBondRequired) updateData.securityBondRequired = data.securityBondRequired;
  if (data.assignedOverwatchId) updateData.assignedOverwatch = { connect: { id: data.assignedOverwatchId } };
  if (data.assignedSectorId) updateData.assignedSector = { connect: { id: data.assignedSectorId } };

  const driver = await prisma.driver.update({
    where: { id },
    data: updateData,
  });

  return driver;
}

/**
 * Assign overwatch to driver
 */
export async function assignOverwatch(
  driverId: string,
  overwatchId: string
): Promise<void> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const overwatch = await prisma.user.findUnique({ where: { id: overwatchId } });
  if (!overwatch) {
    throw new NotFoundError(`User not found: ${overwatchId}`);
  }

  // Check allocation
  if (overwatch.currentAllocation >= overwatch.maxDriverAllocation) {
    throw new ValidationError('Overwatch has reached maximum driver allocation');
  }

  const previousOverwatchId = driver.assignedOverwatchId;

  // Update driver
  await prisma.driver.update({
    where: { id: driverId },
    data: { assignedOverwatchId: overwatchId },
  });

  // Update allocations
  await prisma.user.update({
    where: { id: overwatchId },
    data: { currentAllocation: { increment: 1 } },
  });

  if (previousOverwatchId) {
    await prisma.user.update({
      where: { id: previousOverwatchId },
      data: { currentAllocation: { decrement: 1 } },
    });
  }
}

/**
 * Assign sector to driver
 */
export async function assignSector(
  driverId: string,
  sectorId: string
): Promise<void> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const sector = await prisma.geofence.findUnique({ where: { id: sectorId } });
  if (!sector) {
    throw new NotFoundError(`Geofence not found: ${sectorId}`);
  }

  await prisma.driver.update({
    where: { id: driverId },
    data: { assignedSectorId: sectorId },
  });
}

// ============================================================================
// 28-DAY ROLLING METRICS & TIER CALCULATION
// ============================================================================

/**
 * Get 28-day rolling metrics for driver
 */
export async function get28DayMetrics(driverId: string): Promise<DriverMetrics> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - TIER_CALCULATION.rollingWindowDays);

  // Get shifts in rolling window (exclude CANCELLED)
  const shifts = await prisma.shift.findMany({
    where: {
      driverId,
      shiftDate: { gte: windowStart },
      status: { in: ['COMPLETED', 'NO_SHOW'] },
    },
    orderBy: { shiftDate: 'desc' },
    take: TIER_CALCULATION.maxShiftsInWindow,
  });

  // Calculate metrics
  let totalRevenue = 0;
  let totalUtilizedMinutes = 0;
  let totalTrips = 0;
  let cancellations = 0;

  for (const shift of shifts) {
    // NO_SHOW shifts count as ₱0 (Denominator Rule)
    if (shift.status === 'NO_SHOW') {
      totalRevenue += 0;
      totalUtilizedMinutes += 0;
      totalTrips += 0;
    } else {
      totalRevenue += Number(shift.totalRevenue || 0);
      totalUtilizedMinutes += shift.utilizedMinutes || 0;
      totalTrips += shift.tripCount || 0;
      cancellations += shift.cancellationCount || 0;
    }
  }

  // Calculate average revenue per hour
  const avgRevenuePerHour = totalUtilizedMinutes > 0
    ? (totalRevenue / totalUtilizedMinutes) * 60
    : 0;

  // Calculate cancellation rate
  const cancellationRate = totalTrips > 0
    ? (cancellations / totalTrips) * 100
    : 0;

  return {
    shiftsCompleted: shifts.length,
    avgRevenuePerHour,
    cancellationRate,
    totalRevenue,
    totalTrips,
  };
}

/**
 * Calculate driver tier based on 28-day metrics
 */
export async function calculateTier(driverId: string): Promise<DriverTier> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const metrics = await get28DayMetrics(driverId);

  // Training period: less than 5 completed shifts
  if (metrics.shiftsCompleted < TIER_CALCULATION.trainingPeriodShifts) {
    return 'UNRANKED';
  }

  // Get tier thresholds for service segment (using default if not found)
  const segmentKey = driver.serviceSegment as keyof typeof TIER_THRESHOLDS;
  
  // Determine tier based on avg revenue per hour
  const { avgRevenuePerHour } = metrics;

  // Use revenue-based thresholds (configurable per segment)
  if (avgRevenuePerHour >= 400) return 'PLATINUM';
  if (avgRevenuePerHour >= 300) return 'GOLD';
  if (avgRevenuePerHour >= 200) return 'SILVER';
  if (avgRevenuePerHour >= 100) return 'BRONZE';

  return 'UNRANKED';
}

/**
 * Update driver tier and record history
 */
export async function updateTier(driverId: string): Promise<{
  previousTier: DriverTier;
  newTier: DriverTier;
  changed: boolean;
}> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const newTier = await calculateTier(driverId);
  const metrics = await get28DayMetrics(driverId);

  // Only update if tier changed
  if (newTier !== driver.currentTier) {
    await prisma.$transaction([
      // Update driver tier
      prisma.driver.update({
        where: { id: driverId },
        data: {
          currentTier: newTier,
          tierUpdatedAt: new Date(),
        },
      }),

      // Record tier history
      prisma.driverTierHistory.create({
        data: {
          driverId,
          previousTier: driver.currentTier === 'UNRANKED' ? null : driver.currentTier,
          newTier,
          revenue4WeekAvg: metrics.avgRevenuePerHour,
          calculationDetails: {
            shiftsCompleted: metrics.shiftsCompleted,
            totalRevenue: metrics.totalRevenue,
            avgRevenuePerHour: metrics.avgRevenuePerHour,
          },
          changedBy: 'SYSTEM',
        },
      }),
    ]);

    return {
      previousTier: driver.currentTier,
      newTier,
      changed: true,
    };
  }

  return {
    previousTier: driver.currentTier,
    newTier,
    changed: false,
  };
}

// ============================================================================
// TIER OPERATIONS (Legacy API Compatibility)
// ============================================================================

/**
 * Get driver's current tier with history
 */
export async function getDriverTier(driverId: string): Promise<{
  tier: DriverTier;
  history: any[];
  metrics: DriverMetrics;
}> {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      tierHistory: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const metrics = await get28DayMetrics(driverId);

  return {
    tier: driver.currentTier,
    history: driver.tierHistory,
    metrics,
  };
}

/**
 * Evaluate driver for tier promotion (legacy compatibility)
 */
export async function evaluateDriverTier(driverId: string): Promise<{
  currentTier: DriverTier;
  promotedTo?: DriverTier;
  reason?: string;
}> {
  const result = await updateTier(driverId);

  if (result.changed) {
    return {
      currentTier: result.previousTier,
      promotedTo: result.newTier,
      reason: `Promoted to ${result.newTier} based on 28-day performance metrics`,
    };
  }

  return {
    currentTier: result.newTier,
    reason: 'No promotion: Current tier is appropriate for metrics',
  };
}

/**
 * Get all tier thresholds
 */
export function getTierThresholds() {
  return TIER_THRESHOLDS;
}

/**
 * Get tier distribution (analytics)
 */
export async function getTierDistribution() {
  const distribution = await prisma.driver.groupBy({
    by: ['currentTier'],
    _count: {
      currentTier: true,
    },
  });

  return distribution.map(d => ({
    tier: d.currentTier,
    count: d._count.currentTier,
  }));
}

// ============================================================================
// COMPLIANCE
// ============================================================================

/**
 * Get compliance status for driver
 */
export async function getComplianceStatus(
  driverId: string
): Promise<ComplianceStatus> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const issues: ComplianceIssue[] = [];
  const now = new Date();

  // Check license expiry
  const licenseExpiry = new Date(driver.licenseExpiry);
  const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (licenseExpiry < now) {
    issues.push('LICENSE_EXPIRED');
  } else if (daysUntilExpiry <= 30) {
    issues.push('LICENSE_EXPIRING_SOON');
  }

  // Check bond balance
  const bondPercent = (Number(driver.securityBondBalance) / Number(driver.securityBondRequired)) * 100;
  if (bondPercent < 100) {
    issues.push('BOND_BELOW_REQUIRED');
  }

  return {
    isCompliant: issues.length === 0,
    issues,
  };
}

// ============================================================================
// BOND MANAGEMENT
// ============================================================================

/**
 * Get bond status for driver
 */
export async function getBondStatus(driverId: string): Promise<BondStatus> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  const balance = Number(driver.securityBondBalance);
  const required = Number(driver.securityBondRequired);
  const percent = (balance / required) * 100;

  let status: 'OK' | 'LOW' | 'CRITICAL';
  if (percent >= 100) {
    status = 'OK';
  } else if (percent >= 50) {
    status = 'LOW';
  } else {
    status = 'CRITICAL';
  }

  return {
    balance,
    required,
    percent,
    status,
    canStartShift: percent >= 100, // Bond Lock: Must be 100%
  };
}

/**
 * Update bond balance
 */
export async function updateBondBalance(
  driverId: string,
  newBalance: number
): Promise<void> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  await prisma.driver.update({
    where: { id: driverId },
    data: { securityBondBalance: newBalance },
  });
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const driverService = {
  // CRUD
  getById: getDriverById,
  list: listDrivers,
  create: createDriver,
  update: updateDriver,
  
  // Assignment
  assignOverwatch,
  assignSector,
  
  // Tiers
  getTier: getDriverTier,
  evaluateTier: evaluateDriverTier,
  getTierThresholds,
  getTierDistribution,
  calculateTier,
  updateTier,
  
  // Metrics
  get28DayMetrics,
  
  // Compliance & Bond
  getComplianceStatus,
  getBondStatus,
  updateBondBalance,
};

export default driverService;
