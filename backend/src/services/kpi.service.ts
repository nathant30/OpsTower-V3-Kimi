// src/services/kpi.service.ts
// KPI Calculation Service

import { prisma } from '../models/db.js';
import dayjs from 'dayjs';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardKPIs {
  activeOrders: number;
  activeDrivers: number;
  availableDrivers: number;
  revenueToday: number;
  revenuePerHour: number;
  utilizationRate: number;
  completedOrdersToday: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
}

export interface DriverKPIs {
  driverId: string;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  rating: number;
  revenue: number;
  averageDeliveryTime: number;
  onTimeRate: number;
  performanceScore: number;
}

export interface FleetKPIs {
  totalDrivers: number;
  activeDrivers: number;
  utilizationRate: number;
  totalRevenue: number;
  averageTripsPerDriver: number;
}

// ============================================================================
// DASHBOARD KPIs
// ============================================================================

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const today = dayjs().startOf('day').toDate();
  const now = new Date();

  // Active orders (from testapi - mock for now)
  const activeOrders = 12;

  // Active drivers
  const activeDrivers = await prisma.driver.count({
    where: { status: 'ACTIVE' },
  });

  // Available drivers (not on shift or on shift but not busy)
  const availableDrivers = await prisma.driver.count({
    where: {
      status: 'ACTIVE',
      shifts: {
        none: {
          status: { in: ['CLOCKED_IN', 'ACTIVE', 'ON_BREAK'] },
          scheduledStart: { lte: now },
          scheduledEnd: { gte: now },
        },
      },
    },
  });

  // Revenue calculations would come from trips/orders
  // Mock data for now
  const revenueToday = 15420.50;
  const revenuePerHour = revenueToday / (dayjs().hour() + 1);

  // Utilization rate
  const totalDrivers = await prisma.driver.count();
  const utilizationRate = totalDrivers > 0 ? (activeDrivers / totalDrivers) * 100 : 0;

  return {
    activeOrders,
    activeDrivers,
    availableDrivers,
    revenueToday,
    revenuePerHour: parseFloat(revenuePerHour.toFixed(2)),
    utilizationRate: parseFloat(utilizationRate.toFixed(1)),
    completedOrdersToday: 45,
    onTimeDeliveryRate: 92.3,
    averageDeliveryTime: 28,
  };
}

// ============================================================================
// DRIVER KPIs
// ============================================================================

export async function getDriverKPIs(driverId: string): Promise<DriverKPIs | null> {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) return null;

  // Get trip metrics
  const trips = await prisma.trip.findMany({
    where: { driverId },
  });

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const cancelledTrips = trips.filter(t => 
    ['CANCELLED_DRIVER', 'CANCELLED_PASSENGER', 'NO_SHOW_PASSENGER'].includes(t.status)
  ).length;

  // Calculate metrics
  // Note: Driver rating not available in schema, using placeholder
  const rating = 4.5;
  const revenue = trips
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.totalRevenue?.toNumber() || 0), 0);

  const completedTripData = trips.filter(t => t.status === 'COMPLETED');
  const avgDeliveryTime = completedTripData.length > 0
    ? completedTripData.reduce((sum, t) => {
        if (t.tripStartedAt && t.tripEndedAt) {
          return sum + dayjs(t.tripEndedAt).diff(dayjs(t.tripStartedAt), 'minute');
        }
        return sum;
      }, 0) / completedTripData.length
    : 0;

  // On-time rate (mock calculation)
  const onTimeRate = completedTrips > 0 ? 92 : 0;

  // Performance score formula
  // score = (rating * 0.4) + ((1 - cancellation_rate) * 0.3) + (on_time_rate * 0.3)
  const cancellationRate = totalTrips > 0 ? cancelledTrips / totalTrips : 0;
  const performanceScore = 
    (rating * 0.4) + 
    ((1 - cancellationRate) * 100 * 0.3) + 
    (onTimeRate * 0.3);

  return {
    driverId,
    totalTrips,
    completedTrips,
    cancelledTrips,
    rating,
    revenue: parseFloat(revenue.toFixed(2)),
    averageDeliveryTime: parseFloat(avgDeliveryTime.toFixed(1)),
    onTimeRate,
    performanceScore: parseFloat(performanceScore.toFixed(1)),
  };
}

// ============================================================================
// FLEET KPIs
// ============================================================================

export async function getFleetKPIs(): Promise<FleetKPIs> {
  const totalDrivers = await prisma.driver.count();
  const activeDrivers = await prisma.driver.count({
    where: { status: 'ACTIVE' },
  });

  const utilizationRate = totalDrivers > 0 ? (activeDrivers / totalDrivers) * 100 : 0;

  // Mock fleet revenue
  const totalRevenue = 125000;

  // Average trips per driver
  const totalTrips = await prisma.trip.count();
  const averageTripsPerDriver = totalDrivers > 0 ? totalTrips / totalDrivers : 0;

  return {
    totalDrivers,
    activeDrivers,
    utilizationRate: parseFloat(utilizationRate.toFixed(1)),
    totalRevenue,
    averageTripsPerDriver: parseFloat(averageTripsPerDriver.toFixed(1)),
  };
}

// ============================================================================
// SHIFT COMPLIANCE KPIs
// ============================================================================

export async function getShiftComplianceKPIs(date?: Date) {
  const targetDate = date ? dayjs(date) : dayjs();
  const startOfDay = targetDate.startOf('day').toDate();
  const endOfDay = targetDate.endOf('day').toDate();

  const shifts = await prisma.shift.findMany({
    where: {
      scheduledStart: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const totalShifts = shifts.length;
  const completedShifts = shifts.filter(s => s.status === 'COMPLETED').length;
  const noShowShifts = shifts.filter(s => s.status === 'NO_SHOW').length;
  // Note: isLate and isUnderworking not in schema
  const lateArrivals = 0;
  const underworking = 0;

  const completionRate = totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;

  return {
    totalShifts,
    completedShifts,
    noShowShifts,
    lateArrivals,
    underworking,
    completionRate: parseFloat(completionRate.toFixed(1)),
  };
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const kpiService = {
  getDashboardKPIs,
  getDriverKPIs,
  getFleetKPIs,
  getShiftComplianceKPIs,
};

export default kpiService;
