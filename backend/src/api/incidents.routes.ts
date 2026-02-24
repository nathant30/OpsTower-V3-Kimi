// src/api/incidents.routes.ts
// Incident Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { incidentService } from '../services/incident.service.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const createIncidentSchema = z.object({
  driverId: z.string().uuid(),
  shiftId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  incidentType: z.enum(['BREAKDOWN', 'SOS', 'ACCIDENT', 'INTEGRITY_ALERT', 'CUSTOMER_COMPLAINT', 'TRAFFIC_VIOLATION']),
  severity: z.number().min(1).max(4).optional(),
  occurredAt: z.string().datetime(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  locationAddress: z.string().optional(),
  description: z.string().min(1),
  thirdPartyName: z.string().optional(),
  thirdPartyContact: z.string().optional(),
  thirdPartyPlate: z.string().optional(),
  thirdPartyInsurance: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
  dashcamFootageUrl: z.string().optional(),
});

const updateIncidentSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'PENDING_DOCUMENTATION', 'AUDIT_FAIL', 'RESOLVED', 'ESCALATED']).optional(),
  severity: z.number().min(1).max(4).optional(),
  description: z.string().optional(),
  thirdPartyName: z.string().optional(),
  thirdPartyContact: z.string().optional(),
  thirdPartyPlate: z.string().optional(),
  thirdPartyInsurance: z.string().optional(),
  dashcamFootageUrl: z.string().optional(),
  sabotageConfirmed: z.boolean().optional(),
  resolutionNotes: z.string().optional(),
});

const resolveIncidentSchema = z.object({
  notes: z.string().min(1),
});

const addEvidenceSchema = z.object({
  photoUrls: z.array(z.string()).optional(),
  dashcamFootageUrl: z.string().optional(),
});

// Routes plugin
export default async function incidentRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/incidents - List incidents
  fastify.get('/', async (request, reply) => {
    const query = request.query as any;
    
    const filters = {
      driverId: query.driverId,
      shiftId: query.shiftId,
      status: query.status,
      incidentType: query.incidentType,
      severity: query.severity ? parseInt(query.severity) : undefined,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };

    const pagination = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
    };

    const result = await incidentService.listIncidents(filters, pagination);
    return result;
  });

  // POST /api/incidents - Create incident
  fastify.post('/', async (request, reply) => {
    const validation = createIncidentSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const data = validation.data;
    const incident = await incidentService.createIncident({
      ...data,
      occurredAt: new Date(data.occurredAt),
    });

    reply.status(201);
    return incident;
  });

  // GET /api/incidents/:id - Get incident by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const incident = await incidentService.getIncidentById(id);
    return incident;
  });

  // PATCH /api/incidents/:id - Update incident
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = updateIncidentSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = request.user?.id;
    const incident = await incidentService.updateIncident(id, validation.data, userId);
    return incident;
  });

  // POST /api/incidents/:id/resolve - Resolve incident
  fastify.post('/:id/resolve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = resolveIncidentSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = request.user?.id;
    const incident = await incidentService.resolveIncident(id, {
      ...validation.data,
      resolvedById: userId,
    });
    return incident;
  });

  // POST /api/incidents/:id/evidence - Add evidence
  fastify.post('/:id/evidence', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = addEvidenceSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = request.user?.id;
    const incident = await incidentService.addEvidence(id, {
      ...validation.data,
      addedById: userId,
    });
    return incident;
  });

  // GET /api/incidents/:id/timeline - Get incident timeline
  fastify.get('/:id/timeline', async (request, reply) => {
    const { id } = request.params as { id: string };
    const incident = await incidentService.getIncidentById(id);
    
    if (!incident) {
      return reply.status(404).send({ error: 'Incident not found' });
    }
    
    return {
      incidentId: id,
      incidentNumber: incident.incidentNumber,
      activities: (incident as any).activities || [],
    };
  });

  // GET /api/incidents/:id/deductible - Calculate deductible
  fastify.get('/:id/deductible', async (request, reply) => {
    const { id } = request.params as { id: string };
    // Note: calculateDeductible not implemented in service
    const deduction = 0;
    return { deduction };
  });

  // GET /api/drivers/:driverId/incidents - Get driver incidents
  fastify.get('/driver/:driverId', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const query = request.query as any;
    
    const filters = {
      driverId,
      status: query.status,
      incidentType: query.incidentType,
    };

    const pagination = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
    };

    const result = await incidentService.listIncidents(filters, pagination);
    return result;
  });
}
