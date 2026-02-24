// src/api/shifts.routes.ts
// Shift Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { shiftService } from '../services/shift.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const createShiftSchema = z.object({
  driverId: z.string().uuid(),
  assetId: z.string().uuid().optional(),
  shiftType: z.enum(['AM', 'PM']),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime().optional(),
  geofenceId: z.string().uuid().optional(),
});

const clockInSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
});

const clockOutSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  odometerReading: z.number().optional(),
});

const breakSchema = z.object({
  reason: z.string().optional(),
});

// Routes plugin
export default async function shiftRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/shifts - List shifts
  fastify.get('/', async (request, reply) => {
    const query = request.query as any;
    
    const filters = {
      status: query.status,
      shiftType: query.shiftType,
      driverId: query.driverId,
      date: query.date ? new Date(query.date) : undefined,
    };

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    const result = await shiftService.list(filters, page, limit);
    return result;
  });

  // POST /api/shifts - Create shift
  fastify.post('/', async (request, reply) => {
    const validation = createShiftSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const data = validation.data;
    const shift = await shiftService.create({
      ...data,
      scheduledStart: new Date(data.scheduledStart),
      scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
    });

    reply.status(201);
    return shift;
  });

  // GET /api/shifts/:id - Get shift by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const shift = await shiftService.getById(id);
    return shift;
  });

  // POST /api/shifts/:id/clock-in - Clock in
  fastify.post('/:id/clock-in', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = clockInSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const shift = await shiftService.clockIn(id, validation.data);
    return shift;
  });

  // POST /api/shifts/:id/clock-out - Clock out
  fastify.post('/:id/clock-out', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = clockOutSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const shift = await shiftService.clockOut(id, validation.data);
    return shift;
  });

  // POST /api/shifts/:id/start-break - Start break
  fastify.post('/:id/start-break', async (request, reply) => {
    const { id } = request.params as { id: string };
    const validation = breakSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const shift = await shiftService.startBreak(id, validation.data);
    return shift;
  });

  // POST /api/shifts/:id/end-break - End break
  fastify.post('/:id/end-break', async (request, reply) => {
    const { id } = request.params as { id: string };
    const shift = await shiftService.endBreak(id);
    return shift;
  });

  // GET /api/drivers/:driverId/shifts - Get driver shifts
  fastify.get('/driver/:driverId', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const query = request.query as any;
    
    const filters = {
      driverId,
      status: query.status,
      shiftType: query.shiftType,
    };

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    const result = await shiftService.list(filters, page, limit);
    return result;
  });
}
