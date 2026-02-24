// src/services/incident.service.ts
// Incidents Service - Full workflow with AUDIT_FAIL, SLA, and deductions

import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../models/db.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import type { Incident, IncidentType, IncidentStatus } from '@prisma/client';
import type { Pagination, PaginatedResult, IntegrityAlertData } from '../types/index.js';
import dayjs from 'dayjs';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateIncidentInput {
  driverId: string;
  shiftId?: string;
  tripId?: string;
  assetId?: string;
  incidentType: IncidentType;
  severity?: number;
  occurredAt: Date;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  description: string;
  thirdPartyName?: string;
  thirdPartyContact?: string;
  thirdPartyPlate?: string;
  thirdPartyInsurance?: string;
  photoUrls?: string[];
  dashcamFootageUrl?: string;
  createdById?: string;
  source?: string;
}

export interface UpdateIncidentInput {
  status?: IncidentStatus;
  severity?: number;
  description?: string;
  thirdPartyName?: string;
  thirdPartyContact?: string;
  thirdPartyPlate?: string;
  thirdPartyInsurance?: string;
  dashcamFootageUrl?: string;
  sabotageConfirmed?: boolean;
  resolutionNotes?: string;
}

export interface IncidentFilters {
  driverId?: string;
  shiftId?: string;
  status?: IncidentStatus;
  incidentType?: IncidentType;
  severity?: number;
  dateFrom?: Date;
  dateTo?: Date;
  assignedToId?: string;
}

export interface ResolutionInput {
  notes: string;
  resolvedById: string;
}

export interface EvidenceInput {
  photoUrls?: string[];
  dashcamFootageUrl?: string;
  addedById?: string;
}

export interface IncidentDeduction {
  incidentId: string;
  incidentNumber: string;
  incidentType: IncidentType;
  occurredAt: Date;
  amount: number;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SLA_HOURS = {
  1: 1,  // CRITICAL: P99 < 60 min
  2: 4,  // HIGH
  3: 24, // MEDIUM
  4: 72, // LOW
};

const INTEGRITY_ALERT_SUSPENSION_THRESHOLD = 3; // 3+ alerts in 30 days = suspension
const DEDUCTIBLE_AMOUNT_ACCIDENT = 1000; // ₱1,000 for accidents without 3rd party insurance

// ============================================================================
// CORE CRUD OPERATIONS
// ============================================================================

/**
 * Generate unique incident number (INC-YYYYMMDD-XXXX)
 */
async function generateIncidentNumber(): Promise<string> {
  const today = dayjs().format('YYYYMMDD');
  const prefix = `INC-${today}-`;

  const count = await prisma.incident.count({
    where: {
      incidentNumber: { startsWith: prefix },
    },
  });

  const sequence = (count + 1).toString().padStart(4, '0');
  return `${prefix}${sequence}`;
}

/**
 * Create a new incident with AUDIT_FAIL handling
 */
export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  return prisma.$transaction(async (tx) => {
    // Validate driver exists
    const driver = await tx.driver.findUnique({
      where: { id: input.driverId },
      select: { id: true, firstName: true, lastName: true, securityBondBalance: true },
    });

    if (!driver) {
      throw new NotFoundError(`Driver not found: ${input.driverId}`);
    }

    // Verify shift exists if provided
    if (input.shiftId) {
      const shift = await tx.shift.findUnique({
        where: { id: input.shiftId },
        select: { id: true },
      });
      if (!shift) {
        throw new NotFoundError(`Shift not found: ${input.shiftId}`);
      }
    }

    // Generate incident number
    const incidentNumber = await generateIncidentNumber();

    // Determine initial status and deductible (AUDIT_FAIL RULE)
    let status: IncidentStatus = 'OPEN';
    let deductibleAmount = 0;

    if (input.incidentType === 'ACCIDENT' && !input.thirdPartyInsurance) {
      status = 'AUDIT_FAIL';
      deductibleAmount = DEDUCTIBLE_AMOUNT_ACCIDENT;
    }

    const severity = input.severity || 3;
    const slaDueAt = dayjs().add(SLA_HOURS[severity as keyof typeof SLA_HOURS] || 24, 'hour').toDate();

    // Create incident
    const incident = await tx.incident.create({
      data: {
        incidentNumber,
        driverId: input.driverId,
        shiftId: input.shiftId,
        tripId: input.tripId,
        assetId: input.assetId,
        incidentType: input.incidentType,
        status,
        severity,
        occurredAt: input.occurredAt,
        locationLat: input.locationLat ? new Decimal(input.locationLat) : null,
        locationLng: input.locationLng ? new Decimal(input.locationLng) : null,
        locationAddress: input.locationAddress,
        description: input.description,
        thirdPartyName: input.thirdPartyName,
        thirdPartyContact: input.thirdPartyContact,
        thirdPartyPlate: input.thirdPartyPlate,
        thirdPartyInsurance: input.thirdPartyInsurance,
        photoUrls: input.photoUrls || [],
        dashcamFootageUrl: input.dashcamFootageUrl,
        deductibleAmount: new Decimal(deductibleAmount),
        slaDueAt: slaDueAt,
        createdById: input.createdById,
        source: input.source || 'MANUAL',
      },
    });

    // If AUDIT_FAIL, deduct from bond
    if (status === 'AUDIT_FAIL' && deductibleAmount > 0) {
      const newBalance = Math.max(0, Number(driver.securityBondBalance) - deductibleAmount);
      await tx.driver.update({
        where: { id: input.driverId },
        data: { securityBondBalance: newBalance },
      });

      // Create bond transaction record
      await tx.bondTransaction.create({
        data: {
          driverId: input.driverId,
          transactionType: 'DEDUCTION',
          amount: new Decimal(deductibleAmount),
          balanceAfter: new Decimal(newBalance),
          referenceType: 'INCIDENT',
          referenceId: incident.id,
          description: `Accident deductible - missing 3rd party insurance (${incidentNumber})`,
          createdById: input.createdById,
        },
      });
    }

    // Flag shift as having incident
    if (input.shiftId) {
      await tx.shift.update({
        where: { id: input.shiftId },
        data: { hasIncident: true },
      });
    }

    // Create activity log
    await tx.incidentActivity.create({
      data: {
        incidentId: incident.id,
        activityType: 'CREATED',
        description: `Incident created: ${input.incidentType}`,
        newValue: status,
        createdById: input.createdById,
      },
    });

    return incident;
  });
}

/**
 * Get incident by ID with full details
 */
export async function getIncidentById(id: string): Promise<Incident | null> {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phonePrimary: true,
          currentAsset: {
            select: {
              plateNumber: true,
            },
          },
        },
      },
      shift: {
        select: {
          id: true,
          shiftDate: true,
          shiftType: true,
          status: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      resolvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  return incident;
}

/**
 * List incidents with filters and pagination
 */
export async function listIncidents(
  filters: IncidentFilters,
  pagination: Pagination
): Promise<PaginatedResult<Incident>> {
  const where: any = {};

  if (filters.driverId) where.driverId = filters.driverId;
  if (filters.shiftId) where.shiftId = filters.shiftId;
  if (filters.status) where.status = filters.status;
  if (filters.incidentType) where.incidentType = filters.incidentType;
  if (filters.severity) where.severity = filters.severity;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;

  if (filters.dateFrom || filters.dateTo) {
    where.occurredAt = {};
    if (filters.dateFrom) where.occurredAt.gte = filters.dateFrom;
    if (filters.dateTo) where.occurredAt.lte = filters.dateTo;
  }

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { occurredAt: 'desc' },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phonePrimary: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    data: incidents,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

/**
 * Update incident
 */
export async function updateIncident(
  id: string,
  input: UpdateIncidentInput,
  userId?: string
): Promise<Incident> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.incident.findUnique({
      where: { id },
      select: { id: true, status: true, severity: true },
    });

    if (!current) {
      throw new NotFoundError(`Incident not found: ${id}`);
    }

    const incident = await tx.incident.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });

    // Log status change
    if (input.status && input.status !== current.status) {
      await tx.incidentActivity.create({
        data: {
          incidentId: id,
          activityType: 'STATUS_CHANGED',
          description: `Status changed from ${current.status} to ${input.status}`,
          oldValue: current.status,
          newValue: input.status,
          createdById: userId,
        },
      });
    }

    return incident;
  });
}

// ============================================================================
// WORKFLOW OPERATIONS
// ============================================================================

/**
 * Assign incident to a user
 */
export async function assignIncident(
  incidentId: string,
  userId: string,
  assignedById?: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findUnique({
      where: { id: incidentId },
      select: { id: true, assignedToId: true },
    });

    if (!incident) {
      throw new NotFoundError(`Incident not found: ${incidentId}`);
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundError(`User not found: ${userId}`);
    }

    await tx.incident.update({
      where: { id: incidentId },
      data: {
        assignedToId: userId,
        status: 'INVESTIGATING',
      },
    });

    await tx.incidentActivity.create({
      data: {
        incidentId,
        activityType: 'ASSIGNED',
        description: `Assigned to ${user.firstName} ${user.lastName}`,
        newValue: userId,
        createdById: assignedById,
      },
    });
  });
}

/**
 * Escalate incident
 */
export async function escalateIncident(
  incidentId: string,
  reason: string,
  escalatedById?: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findUnique({
      where: { id: incidentId },
      select: { id: true },
    });

    if (!incident) {
      throw new NotFoundError(`Incident not found: ${incidentId}`);
    }

    await tx.incident.update({
      where: { id: incidentId },
      data: { status: 'ESCALATED' },
    });

    await tx.incidentActivity.create({
      data: {
        incidentId,
        activityType: 'ESCALATED',
        description: reason,
        newValue: 'ESCALATED',
        createdById: escalatedById,
      },
    });
  });
}

/**
 * Resolve incident with SLA tracking
 */
export async function resolveIncident(
  id: string,
  input: ResolutionInput
): Promise<Incident> {
  return prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findUnique({
      where: { id },
      select: { id: true, status: true, slaDueAt: true },
    });

    if (!incident) {
      throw new NotFoundError(`Incident not found: ${id}`);
    }

    if (incident.status === 'RESOLVED') {
      throw new ValidationError('Incident is already resolved');
    }

    // Check SLA breach
    const now = new Date();
    const slaBreached = incident.slaDueAt ? now > incident.slaDueAt : false;

    const resolved = await tx.incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: input.notes,
        resolvedAt: now,
        resolvedById: input.resolvedById,
        slaBreached,
      },
    });

    await tx.incidentActivity.create({
      data: {
        incidentId: id,
        activityType: 'RESOLVED',
        description: input.notes,
        newValue: 'RESOLVED',
        createdById: input.resolvedById,
      },
    });

    return resolved;
  });
}

/**
 * Add evidence to incident
 */
export async function addEvidence(
  id: string,
  input: EvidenceInput
): Promise<Incident> {
  return prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findUnique({
      where: { id },
      select: { id: true, photoUrls: true, dashcamFootageUrl: true },
    });

    if (!incident) {
      throw new NotFoundError(`Incident not found: ${id}`);
    }

    const updatedPhotoUrls = [...(incident.photoUrls || []), ...(input.photoUrls || [])];

    const updated = await tx.incident.update({
      where: { id },
      data: {
        photoUrls: updatedPhotoUrls,
        dashcamFootageUrl: input.dashcamFootageUrl || incident.dashcamFootageUrl,
      },
    });

    await tx.incidentActivity.create({
      data: {
        incidentId: id,
        activityType: 'EVIDENCE_ADDED',
        description: `Added ${input.photoUrls?.length || 0} photos${input.dashcamFootageUrl ? ' and dashcam footage' : ''}`,
        createdById: input.addedById,
      },
    });

    return updated;
  });
}

// ============================================================================
// INTEGRITY ALERTS
// ============================================================================

/**
 * Create integrity alert from monitoring system
 */
export async function createIntegrityAlert(data: IntegrityAlertData): Promise<Incident> {
  // Check recent alerts for suspension recommendation
  const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
  const recentAlerts = await prisma.incident.count({
    where: {
      driverId: data.driverId,
      incidentType: 'INTEGRITY_ALERT',
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const incident = await createIncident({
    driverId: data.driverId,
    shiftId: data.shiftId,
    tripId: data.tripId,
    incidentType: 'INTEGRITY_ALERT',
    severity: data.severity || 2,
    occurredAt: new Date(),
    locationLat: data.locationLat,
    locationLng: data.locationLng,
    description: data.description,
    source: 'AUTOMATED',
  });

  // If threshold reached, add suspension recommendation
  if (recentAlerts + 1 >= INTEGRITY_ALERT_SUSPENSION_THRESHOLD) {
    await prisma.incidentActivity.create({
      data: {
        incidentId: incident.id,
        activityType: 'SUSPENSION_RECOMMENDED',
        description: `Driver has ${recentAlerts + 1} integrity alerts in last 30 days - suspension recommended`,
      },
    });
  }

  return incident;
}

// ============================================================================
// CONTRACT METHODS (for other services)
// ============================================================================

/**
 * Get incidents for a specific shift
 */
export async function getIncidentsByShift(shiftId: string): Promise<Incident[]> {
  return prisma.incident.findMany({
    where: { shiftId },
    orderBy: { occurredAt: 'desc' },
  });
}

/**
 * Get incident deductions for a driver in date range
 */
export async function getIncidentDeductions(
  driverId: string,
  dateRange: { from: Date; to: Date }
): Promise<IncidentDeduction[]> {
  const incidents = await prisma.incident.findMany({
    where: {
      driverId,
      occurredAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
      deductibleAmount: { gt: 0 },
    },
    select: {
      id: true,
      incidentNumber: true,
      incidentType: true,
      occurredAt: true,
      deductibleAmount: true,
      description: true,
    },
    orderBy: { occurredAt: 'desc' },
  });

  return incidents.map((incident) => ({
    incidentId: incident.id,
    incidentNumber: incident.incidentNumber,
    incidentType: incident.incidentType,
    occurredAt: incident.occurredAt,
    amount: Number(incident.deductibleAmount),
    description: incident.description,
  }));
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const incidentService = {
  createIncident,
  getIncidentById,
  listIncidents,
  updateIncident,
  assignIncident,
  escalateIncident,
  resolveIncident,
  addEvidence,
  createIntegrityAlert,
  getIncidentsByShift,
  getIncidentDeductions,
};

export default incidentService;
