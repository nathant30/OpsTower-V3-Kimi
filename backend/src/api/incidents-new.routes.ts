// src/api/incidents-new.routes.ts
// Incidents V2 Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { PrismaClient, IncidentStatus, IncidentType, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// ============================================================================
// Types & Enums
// ============================================================================

const Priority = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

type PriorityType = typeof Priority[keyof typeof Priority];

// Map priority to severity (1-4, where 1 is highest/critical)
const priorityToSeverity: Record<PriorityType, number> = {
  [Priority.CRITICAL]: 1,
  [Priority.HIGH]: 2,
  [Priority.MEDIUM]: 3,
  [Priority.LOW]: 4,
};

const severityToPriority: Record<number, PriorityType> = {
  1: Priority.CRITICAL,
  2: Priority.HIGH,
  3: Priority.MEDIUM,
  4: Priority.LOW,
};

// ============================================================================
// Validation Schemas
// ============================================================================

const listIncidentsSchema = z.object({
  status: z.enum(['Open', 'Investigating', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  type: z.enum(['BREAKDOWN', 'SOS', 'ACCIDENT', 'INTEGRITY_ALERT', 'CUSTOMER_COMPLAINT', 'TRAFFIC_VIOLATION']).optional(),
  driverId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

const createIncidentSchema = z.object({
  type: z.enum(['BREAKDOWN', 'SOS', 'ACCIDENT', 'INTEGRITY_ALERT', 'CUSTOMER_COMPLAINT', 'TRAFFIC_VIOLATION']),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  description: z.string().min(1, 'Description is required'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  reportedBy: z.string().min(1, 'Reported by is required'),
});

const updateIncidentSchema = z.object({
  status: z.enum(['Open', 'Investigating', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
});

const assignIncidentSchema = z.object({
  assignedTo: z.string().min(1, 'Assigned to is required'),
});

const resolveIncidentSchema = z.object({
  resolutionNotes: z.string().min(1, 'Resolution notes are required'),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate incident number in format INC-YYYYMMDD-XXX
 */
async function generateIncidentNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INC-${dateStr}-`;

  // Find the highest incident number for today
  const latestIncident = await prisma.incident.findFirst({
    where: {
      incidentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      incidentNumber: 'desc',
    },
  });

  let sequence = 1;
  if (latestIncident) {
    const parts = latestIncident.incidentNumber.split('-');
    const lastSequence = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
}

/**
 * Map API status to Prisma IncidentStatus
 */
function mapApiStatusToPrisma(status: string): IncidentStatus {
  const statusMap: Record<string, IncidentStatus> = {
    'Open': IncidentStatus.OPEN,
    'Investigating': IncidentStatus.INVESTIGATING,
    'Resolved': IncidentStatus.RESOLVED,
    'Closed': IncidentStatus.RESOLVED,
  };
  return statusMap[status] || IncidentStatus.OPEN;
}

/**
 * Map Prisma IncidentStatus to API status
 */
function mapPrismaStatusToApi(status: IncidentStatus): string {
  const statusMap: Record<IncidentStatus, string> = {
    [IncidentStatus.OPEN]: 'Open',
    [IncidentStatus.INVESTIGATING]: 'Investigating',
    [IncidentStatus.PENDING_DOCUMENTATION]: 'Investigating',
    [IncidentStatus.AUDIT_FAIL]: 'Investigating',
    [IncidentStatus.RESOLVED]: 'Resolved',
    [IncidentStatus.ESCALATED]: 'Investigating',
  };
  return statusMap[status] || 'Open';
}

/**
 * Format incident for API response
 */
function formatIncidentResponse(incident: any) {
  return {
    id: incident.id,
    incidentNumber: incident.incidentNumber,
    type: incident.incidentType,
    status: mapPrismaStatusToApi(incident.status),
    priority: severityToPriority[incident.severity] || Priority.MEDIUM,
    severity: incident.severity,
    driverId: incident.driverId,
    shiftId: incident.shiftId,
    tripId: incident.tripId,
    assetId: incident.assetId,
    occurredAt: incident.occurredAt,
    reportedAt: incident.reportedAt,
    location: incident.locationLat && incident.locationLng ? {
      lat: incident.locationLat,
      lng: incident.locationLng,
      address: incident.locationAddress,
    } : null,
    description: incident.description,
    assignedTo: incident.assignedTo ? {
      id: incident.assignedTo.id,
      name: `${incident.assignedTo.firstName} ${incident.assignedTo.lastName}`,
    } : null,
    assignedToId: incident.assignedToId,
    resolvedBy: incident.resolvedBy ? {
      id: incident.resolvedBy.id,
      name: `${incident.resolvedBy.firstName} ${incident.resolvedBy.lastName}`,
    } : null,
    resolvedAt: incident.resolvedAt,
    resolutionNotes: incident.resolutionNotes,
    deductibleAmount: incident.deductibleAmount,
    repairLiability: incident.repairLiability,
    photoUrls: incident.photoUrls,
    dashcamFootageUrl: incident.dashcamFootageUrl,
    thirdPartyName: incident.thirdPartyName,
    thirdPartyContact: incident.thirdPartyContact,
    thirdPartyPlate: incident.thirdPartyPlate,
    thirdPartyInsurance: incident.thirdPartyInsurance,
    sabotageConfirmed: incident.sabotageConfirmed,
    gpsVelocityKph: incident.gpsVelocityKph,
    dashcamStatus: incident.dashcamStatus,
    slaDueAt: incident.slaDueAt,
    slaBreached: incident.slaBreached,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
    source: incident.source,
    // Include relations if loaded
    driver: incident.driver ? {
      id: incident.driver.id,
      employeeId: incident.driver.employeeId,
      firstName: incident.driver.firstName,
      lastName: incident.driver.lastName,
      photoUrl: incident.driver.photoUrl,
    } : null,
    asset: incident.asset ? {
      id: incident.asset.id,
      assetCode: incident.asset.assetCode,
      plateNumber: incident.asset.plateNumber,
      make: incident.asset.make,
      model: incident.asset.model,
    } : null,
    activities: incident.activities || [],
  };
}

/**
 * Log activity for an incident
 */
async function logIncidentActivity(
  incidentId: string,
  activityType: string,
  description: string,
  oldValue?: string,
  newValue?: string,
  createdById?: string
) {
  await prisma.incidentActivity.create({
    data: {
      incidentId,
      activityType,
      description,
      oldValue,
      newValue,
      createdById,
    },
  });
}

// ============================================================================
// Routes Plugin
// ============================================================================

export default async function incidentsNewRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // ==========================================================================
  // GET /api/incidents/v2 - List incidents
  // ==========================================================================
  fastify.get('/', async (request, reply) => {
    const validation = listIncidentsSchema.safeParse(request.query);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const { status, priority, type, driverId, search, page, limit } = validation.data;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.IncidentWhereInput = {};

    // Status filter - map API status to Prisma enum
    if (status) {
      const prismaStatus = mapApiStatusToPrisma(status);
      if (status === 'Closed' || status === 'Resolved') {
        where.status = { in: [IncidentStatus.RESOLVED] };
      } else if (status === 'Investigating') {
        where.status = { in: [IncidentStatus.INVESTIGATING, IncidentStatus.PENDING_DOCUMENTATION, IncidentStatus.AUDIT_FAIL, IncidentStatus.ESCALATED] };
      } else {
        where.status = prismaStatus;
      }
    }

    // Priority filter - map to severity
    if (priority) {
      where.severity = priorityToSeverity[priority];
    }

    // Type filter
    if (type) {
      where.incidentType = type as IncidentType;
    }

    // Driver filter
    if (driverId) {
      where.driverId = driverId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { incidentNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute query with count
    const [items, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
          asset: {
            select: {
              id: true,
              assetCode: true,
              plateNumber: true,
              make: true,
              model: true,
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

    const totalPages = Math.ceil(total / limitNum);

    return {
      items: items.map(formatIncidentResponse),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  });

  // ==========================================================================
  // GET /api/incidents/v2/:id - Get single incident
  // ==========================================================================
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            phonePrimary: true,
            email: true,
            currentTier: true,
          },
        },
        asset: {
          select: {
            id: true,
            assetCode: true,
            plateNumber: true,
            make: true,
            model: true,
            color: true,
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
        trip: {
          select: {
            id: true,
            status: true,
            pickupAddress: true,
            dropoffAddress: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!incident) {
      throw new NotFoundError('Incident not found');
    }

    return formatIncidentResponse(incident);
  });

  // ==========================================================================
  // POST /api/incidents/v2 - Create new incident
  // ==========================================================================
  fastify.post('/', async (request, reply) => {
    const validation = createIncidentSchema.safeParse(request.body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const data = validation.data;
    const userId = (request as any).user?.userId;

    // Verify driver exists
    const driver = await prisma.driver.findUnique({
      where: { id: data.driverId },
    });
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    // Verify vehicle exists if provided
    if (data.vehicleId) {
      const vehicle = await prisma.asset.findUnique({
        where: { id: data.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundError('Vehicle not found');
      }
    }

    // Generate incident number
    const incidentNumber = await generateIncidentNumber();

    // Create incident
    const incident = await prisma.incident.create({
      data: {
        incidentNumber,
        driverId: data.driverId,
        assetId: data.vehicleId,
        tripId: data.orderId,
        incidentType: data.type,
        status: IncidentStatus.OPEN,
        severity: priorityToSeverity[data.priority],
        occurredAt: new Date(),
        locationLat: data.location.lat ? new Prisma.Decimal(data.location.lat) : null,
        locationLng: data.location.lng ? new Prisma.Decimal(data.location.lng) : null,
        locationAddress: data.location.address,
        description: data.description,
        source: data.reportedBy,
        createdById: userId,
        // Set SLA due at 24 hours from now
        slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        driver: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        asset: {
          select: {
            id: true,
            assetCode: true,
            plateNumber: true,
            make: true,
            model: true,
          },
        },
      },
    });

    // Log activity
    await logIncidentActivity(
      incident.id,
      'INCIDENT_CREATED',
      `Incident created by ${data.reportedBy}`,
      undefined,
      `Type: ${data.type}, Priority: ${data.priority}`,
      userId
    );

    reply.status(201);
    return formatIncidentResponse(incident);
  });

  // ==========================================================================
  // PATCH /api/incidents/v2/:id - Update incident
  // ==========================================================================
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = updateIncidentSchema.safeParse(request.body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const data = validation.data;
    const userId = (request as any).user?.userId;

    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id },
      include: { assignedTo: true },
    });
    if (!existingIncident) {
      throw new NotFoundError('Incident not found');
    }

    // Build update data
    const updateData: Prisma.IncidentUpdateInput = {};
    const changes: string[] = [];

    if (data.status) {
      const oldStatus = mapPrismaStatusToApi(existingIncident.status);
      const newPrismaStatus = mapApiStatusToPrisma(data.status);
      updateData.status = newPrismaStatus;
      changes.push(`Status: ${oldStatus} → ${data.status}`);

      // If resolving, set resolvedAt
      if (data.status === 'Resolved' || data.status === 'Closed') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId ? { connect: { id: userId } } : undefined;
      }
    }

    if (data.priority) {
      const oldPriority = severityToPriority[existingIncident.severity];
      const newSeverity = priorityToSeverity[data.priority];
      updateData.severity = newSeverity;
      changes.push(`Priority: ${oldPriority} → ${data.priority}`);
    }

    if (data.description) {
      updateData.description = data.description;
      changes.push('Description updated');
    }

    if (data.assignedTo) {
      // Find user by name or ID
      const assignedUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: data.assignedTo },
            { firstName: { contains: data.assignedTo, mode: 'insensitive' } },
            { lastName: { contains: data.assignedTo, mode: 'insensitive' } },
          ],
        },
      });

      if (!assignedUser) {
        throw new NotFoundError('Assigned user not found');
      }

      const oldAssigned = existingIncident.assignedTo 
        ? `${existingIncident.assignedTo.firstName} ${existingIncident.assignedTo.lastName}`
        : 'Unassigned';
      const newAssigned = `${assignedUser.firstName} ${assignedUser.lastName}`;
      
      updateData.assignedTo = { connect: { id: assignedUser.id } };
      changes.push(`Assigned To: ${oldAssigned} → ${newAssigned}`);
    }

    // Update incident
    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        asset: {
          select: {
            id: true,
            assetCode: true,
            plateNumber: true,
            make: true,
            model: true,
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
    });

    // Log activity if there were changes
    if (changes.length > 0) {
      await logIncidentActivity(
        incident.id,
        'INCIDENT_UPDATED',
        `Incident updated: ${changes.join(', ')}`,
        undefined,
        changes.join(', '),
        userId
      );
    }

    return formatIncidentResponse(incident);
  });

  // ==========================================================================
  // POST /api/incidents/v2/:id/assign - Assign investigator
  // ==========================================================================
  fastify.post('/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = assignIncidentSchema.safeParse(request.body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const { assignedTo } = validation.data;
    const userId = (request as any).user?.userId;

    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id },
      include: { assignedTo: true },
    });
    if (!existingIncident) {
      throw new NotFoundError('Incident not found');
    }

    // Find user by name or ID
    const assignedUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: assignedTo },
          { firstName: { contains: assignedTo, mode: 'insensitive' } },
          { lastName: { contains: assignedTo, mode: 'insensitive' } },
        ],
      },
    });

    if (!assignedUser) {
      throw new NotFoundError('Assigned user not found');
    }

    // Update incident
    const incident = await prisma.incident.update({
      where: { id },
      data: {
        assignedTo: { connect: { id: assignedUser.id } },
        status: IncidentStatus.INVESTIGATING,
      },
      include: {
        driver: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
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
    });

    // Log activity
    const oldAssigned = existingIncident.assignedTo 
      ? `${existingIncident.assignedTo.firstName} ${existingIncident.assignedTo.lastName}`
      : 'Unassigned';
    await logIncidentActivity(
      incident.id,
      'INCIDENT_ASSIGNED',
      `Incident assigned to ${assignedUser.firstName} ${assignedUser.lastName}`,
      oldAssigned,
      `${assignedUser.firstName} ${assignedUser.lastName}`,
      userId
    );

    return formatIncidentResponse(incident);
  });

  // ==========================================================================
  // POST /api/incidents/v2/:id/resolve - Resolve incident
  // ==========================================================================
  fastify.post('/:id/resolve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = resolveIncidentSchema.safeParse(request.body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const { resolutionNotes } = validation.data;
    const userId = (request as any).user?.userId;

    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id },
    });
    if (!existingIncident) {
      throw new NotFoundError('Incident not found');
    }

    // Check if already resolved
    if (existingIncident.status === IncidentStatus.RESOLVED) {
      throw new ConflictError('Incident is already resolved');
    }

    // Update incident
    const incident = await prisma.incident.update({
      where: { id },
      data: {
        status: IncidentStatus.RESOLVED,
        resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: userId ? { connect: { id: userId } } : undefined,
      },
      include: {
        driver: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log activity
    await logIncidentActivity(
      incident.id,
      'INCIDENT_RESOLVED',
      'Incident resolved',
      mapPrismaStatusToApi(existingIncident.status),
      'Resolved',
      userId
    );

    return formatIncidentResponse(incident);
  });

  // ==========================================================================
  // GET /api/incidents/v2/stats - Get incident statistics
  // ==========================================================================
  fastify.get('/stats', async (request, reply) => {
    const [
      total,
      openCount,
      investigatingCount,
      resolvedCount,
      criticalCount,
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({
        where: { status: IncidentStatus.OPEN },
      }),
      prisma.incident.count({
        where: {
          status: {
            in: [
              IncidentStatus.INVESTIGATING,
              IncidentStatus.PENDING_DOCUMENTATION,
              IncidentStatus.AUDIT_FAIL,
              IncidentStatus.ESCALATED,
            ],
          },
        },
      }),
      prisma.incident.count({
        where: { status: IncidentStatus.RESOLVED },
      }),
      prisma.incident.count({
        where: { severity: 1 }, // Critical = severity 1
      }),
    ]);

    return {
      total,
      openCount,
      investigatingCount,
      resolvedCount,
      criticalCount,
    };
  });

  // ==========================================================================
  // POST /api/incidents/v2/:id/escalate - Escalate priority
  // ==========================================================================
  fastify.post('/:id/escalate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.userId;

    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id },
    });
    if (!existingIncident) {
      throw new NotFoundError('Incident not found');
    }

    // Check if already at critical
    const currentSeverity = existingIncident.severity;
    const currentPriority = severityToPriority[currentSeverity];
    
    if (currentSeverity === 1) {
      throw new ConflictError('Incident is already at Critical priority');
    }

    // Check if already resolved
    if (existingIncident.status === IncidentStatus.RESOLVED) {
      throw new ConflictError('Cannot escalate a resolved incident');
    }

    // Calculate new severity (lower number = higher priority)
    const newSeverity = Math.max(1, currentSeverity - 1);
    const newPriority = severityToPriority[newSeverity];

    // Update incident
    const incident = await prisma.incident.update({
      where: { id },
      data: {
        severity: newSeverity,
        status: existingIncident.status === IncidentStatus.OPEN 
          ? IncidentStatus.ESCALATED 
          : existingIncident.status,
      },
      include: {
        driver: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
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
    });

    // Log activity
    await logIncidentActivity(
      incident.id,
      'INCIDENT_ESCALATED',
      `Incident escalated from ${currentPriority} to ${newPriority}`,
      currentPriority,
      newPriority,
      userId
    );

    return formatIncidentResponse(incident);
  });
}
