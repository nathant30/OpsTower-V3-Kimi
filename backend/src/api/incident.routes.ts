// src/api/incident.routes.ts
// Incidents Agent - Incident API Routes

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import incidentService, { IncidentFilters } from '../services/incident.service.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PAGINATION } from '../config/constants.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const incidentParamsSchema = z.object({
  id: z.string().uuid(),
});

const incidentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.defaultPage),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.maxPerPage)
    .default(PAGINATION.defaultPerPage),
  driverId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  status: z
    .enum(['OPEN', 'INVESTIGATING', 'PENDING_DOCUMENTATION', 'AUDIT_FAIL', 'RESOLVED', 'ESCALATED'])
    .optional(),
  incidentType: z
    .enum(['BREAKDOWN', 'SOS', 'ACCIDENT', 'INTEGRITY_ALERT', 'CUSTOMER_COMPLAINT', 'TRAFFIC_VIOLATION'])
    .optional(),
  severity: z.coerce.number().int().min(1).max(4).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  assignedToId: z.string().uuid().optional(),
});

const createIncidentSchema = z.object({
  driverId: z.string().uuid(),
  shiftId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  incidentType: z.enum([
    'BREAKDOWN',
    'SOS',
    'ACCIDENT',
    'INTEGRITY_ALERT',
    'CUSTOMER_COMPLAINT',
    'TRAFFIC_VIOLATION',
  ]),
  severity: z.number().int().min(1).max(4).optional(),
  occurredAt: z.coerce.date(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationAddress: z.string().optional(),
  description: z.string().min(1),
  // Third party info (for accidents)
  thirdPartyName: z.string().optional(),
  thirdPartyContact: z.string().optional(),
  thirdPartyPlate: z.string().optional(),
  thirdPartyInsurance: z.string().optional(),
  // Evidence
  photoUrls: z.array(z.string().url()).optional(),
  dashcamFootageUrl: z.string().url().optional(),
});

const updateIncidentSchema = z.object({
  status: z
    .enum(['OPEN', 'INVESTIGATING', 'PENDING_DOCUMENTATION', 'AUDIT_FAIL', 'RESOLVED', 'ESCALATED'])
    .optional(),
  severity: z.number().int().min(1).max(4).optional(),
  description: z.string().optional(),
  thirdPartyName: z.string().optional(),
  thirdPartyContact: z.string().optional(),
  thirdPartyPlate: z.string().optional(),
  thirdPartyInsurance: z.string().optional(),
  dashcamFootageUrl: z.string().url().optional(),
  sabotageConfirmed: z.boolean().optional(),
  resolutionNotes: z.string().optional(),
});

const assignIncidentSchema = z.object({
  userId: z.string().uuid(),
});

const escalateIncidentSchema = z.object({
  reason: z.string().min(1),
});

const resolveIncidentSchema = z.object({
  notes: z.string().min(1),
});

const addEvidenceSchema = z.object({
  photoUrls: z.array(z.string().url()).optional(),
  dashcamFootageUrl: z.string().url().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

export async function incidentRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/incidents
   * List incidents with filters and pagination
   */
  app.get('/incidents', {
    preHandler: [authenticate, requirePermission('incidents.read')],
    handler: async (request, reply) => {
      const query = incidentsQuerySchema.parse(request.query);

      const filters: IncidentFilters = {
        driverId: query.driverId,
        shiftId: query.shiftId,
        status: query.status,
        incidentType: query.incidentType,
        severity: query.severity,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        assignedToId: query.assignedToId,
      };

      const result = await incidentService.listIncidents(filters, {
        page: query.page,
        limit: query.perPage,
      });

      return reply.status(200).send(result);
    },
  });

  /**
   * GET /api/v1/incidents/:id
   * Get incident by ID with full details
   */
  app.get('/incidents/:id', {
    preHandler: [authenticate, requirePermission('incidents.read')],
    handler: async (request, reply) => {
      const { id } = incidentParamsSchema.parse(request.params);

      const incident = await incidentService.getIncidentById(id);

      if (!incident) {
        return reply.status(404).send({
          error: {
            code: 'INCIDENT_NOT_FOUND',
            message: `Incident with ID ${id} not found`,
          },
        });
      }

      return reply.status(200).send(incident);
    },
  });

  /**
   * POST /api/v1/incidents
   * Create a new incident (The Bridge - manual reporting)
   */
  app.post('/incidents', {
    preHandler: [authenticate, requirePermission('incidents.write')],
    handler: async (request, reply) => {
      const body = createIncidentSchema.parse(request.body);

      const incident = await incidentService.createIncident({
        driverId: body.driverId,
        shiftId: body.shiftId,
        tripId: body.tripId,
        assetId: body.assetId,
        incidentType: body.incidentType,
        severity: body.severity,
        occurredAt: body.occurredAt,
        locationLat: body.locationLat,
        locationLng: body.locationLng,
        locationAddress: body.locationAddress,
        description: body.description,
        thirdPartyName: body.thirdPartyName,
        thirdPartyContact: body.thirdPartyContact,
        thirdPartyPlate: body.thirdPartyPlate,
        thirdPartyInsurance: body.thirdPartyInsurance,
        photoUrls: body.photoUrls,
        dashcamFootageUrl: body.dashcamFootageUrl,
        createdById: request.user.id,
        source: 'MANUAL',
      });

      return reply.status(201).send({
        incident: {
          id: incident.id,
          incidentNumber: incident.incidentNumber,
          incidentType: incident.incidentType,
          status: incident.status,
          severity: incident.severity,
          occurredAt: incident.occurredAt,
          deductibleAmount: Number(incident.deductibleAmount),
          slaDueAt: incident.slaDueAt,
        },
      });
    },
  });

  /**
   * PATCH /api/v1/incidents/:id
   * Update incident details
   */
  app.patch('/incidents/:id', {
    preHandler: [authenticate, requirePermission('incidents.write')],
    handler: async (request, reply) => {
      const { id } = incidentParamsSchema.parse(request.params);
      const body = updateIncidentSchema.parse(request.body);

      const incident = await incidentService.updateIncident(id, body, request.user.id);

      return reply.status(200).send({
        incident: {
          id: incident.id,
          incidentNumber: incident.incidentNumber,
          status: incident.status,
          severity: incident.severity,
          updatedAt: incident.updatedAt,
        },
      });
    },
  });

  /**
   * POST /api/v1/incidents/:id/assign
   * Assign incident to a user
   */
  app.post('/incidents/:id/assign', {
    preHandler: [authenticate, requirePermission('incidents.assign')],
    handler: async (request, reply) => {
      const { id } = incidentParamsSchema.parse(request.params);
      const body = assignIncidentSchema.parse(request.body);

      await incidentService.assignIncident(id, body.userId, request.user.id);

      return reply.status(200).send({
        message: 'Incident assigned successfully',
      });
    },
  });

  /**
   * POST /api/v1/incidents/:id/escalate
   * Escalate incident
   */
  app.post('/incidents/:id/escalate', {
    preHandler: [authenticate, requirePermission('incidents.escalate')],
    handler: async (request, reply) => {
      const { id } = incidentParamsSchema.parse(request.params);
      const body = escalateIncidentSchema.parse(request.body);

      await incidentService.escalateIncident(id, body.reason, request.user.id);

      return reply.status(200).send({
        message: 'Incident escalated successfully',
      });
    },
  });

  /**
   * POST /api/v1/incidents/:id/resolve
   * Resolve incident
   */
  app.post('/incidents/:id/resolve', {
    preHandler: [authenticate, requirePermission('incidents.resolve')],
    handler: async (request, reply) => {
      const { id } = incidentParamsSchema.parse(request.params);
      const body = resolveIncidentSchema.parse(request.body);

      await incidentService.resolveIncident(id, {
        notes: body.notes,
        resolvedById: request.user.id,
      });

      return reply.status(200).send({
        message: 'Incident resolved successfully',
      });
    },
  });

  /**
   * POST /api/v1/incidents/:id/evidence
   * Add evidence to incident
   */
  app.post('/incidents/:id/evidence', {
    preHandler: [authenticate, requirePermission('incidents.write')],
    handler: async (request, reply) => {
      const { id } = incidentParamsSchema.parse(request.params);
      const body = addEvidenceSchema.parse(request.body);

      await incidentService.addEvidence(id, {
        ...body,
        addedById: request.user.id,
      });

      return reply.status(200).send({
        message: 'Evidence added successfully',
      });
    },
  });

  /**
   * GET /api/v1/incidents/stats/backlog
   * Get incident backlog count
   * Used for dashboard KPIs
   */
  app.get('/incidents/stats/backlog', {
    preHandler: [authenticate, requirePermission('incidents.read')],
    handler: async (request, reply) => {
      // Count incidents that are not resolved
      const backlog = await incidentService.listIncidents(
        {
          status: 'OPEN',
        },
        { page: 1, limit: 1 }
      );

      return reply.status(200).send({
        backlog: backlog.total,
      });
    },
  });
}
