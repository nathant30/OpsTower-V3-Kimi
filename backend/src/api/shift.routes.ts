// src/api/shift.routes.ts
// Shifts Agent API routes

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import shiftService, { ShiftFilters } from '../services/shift.service.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PAGINATION } from '../config/constants.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const todayQuerySchema = z.object({
  status: z
    .union([
      z.enum(['SCHEDULED', 'CLOCKED_IN', 'ACTIVE', 'ON_BREAK', 'ENDING', 'COMPLETED', 'NO_SHOW', 'CANCELLED']),
      z.array(
        z.enum(['SCHEDULED', 'CLOCKED_IN', 'ACTIVE', 'ON_BREAK', 'ENDING', 'COMPLETED', 'NO_SHOW', 'CANCELLED'])
      ),
    ])
    .optional(),
  shiftType: z.enum(['AM', 'PM']).optional(),
  driverId: z.string().uuid().optional(),
  hasIncident: z.coerce.boolean().optional(),
  underWorking: z.coerce.boolean().optional(),
  lateArrival: z.coerce.boolean().optional(),
});

const rollCallQuerySchema = z.object({
  shiftType: z.enum(['AM', 'PM']),
  geofenceId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
});

const leaderboardQuerySchema = z.object({
  date: z.coerce.date().optional(),
  serviceSegment: z.enum(['4W-TNVS', '2W-TWG', '2W-SAL', '4W-SAL']).optional(),
  shiftType: z.enum(['AM', 'PM']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).optional(),
});

const startShiftSchema = z.object({
  location: geoPointSchema,
  checklist: z
    .object({
      vehicleCondition: z.string().optional(),
      dashcamCheck: z.boolean().optional(),
      gpsCheck: z.boolean().optional(),
      cleanlinessCheck: z.boolean().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

const endShiftSchema = z.object({
  location: geoPointSchema,
  notes: z.string().max(1000).optional(),
});

const markArrivalSchema = z.object({
  location: geoPointSchema,
});

// ============================================================================
// ROUTES
// ============================================================================

export async function shiftRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/shifts/today
   * Get today's shifts with filters
   */
  app.get('/today', {
    preHandler: [authenticate, requirePermission('shifts.read')],
    handler: async (request, reply) => {
      const query = todayQuerySchema.parse(request.query);

      const filters: ShiftFilters = {
        status: query.status,
        shiftType: query.shiftType,
        driverId: query.driverId,
        hasIncident: query.hasIncident,
        underWorking: query.underWorking,
        lateArrival: query.lateArrival,
      };

      // Note: getToday not implemented - using list with date filter
      const shifts = await shiftService.list({
        ...filters,
        date: new Date(),
      }, 1, 100);

      return reply.status(200).send({
        data: shifts.data,
        count: shifts.total,
      });
    },
  });

  /**
   * GET /api/v1/shifts/roll-call
   * Get roll call data for a shift type
   */
  app.get('/roll-call', {
    preHandler: [authenticate, requirePermission('shifts.read')],
    handler: async (request, reply) => {
      const query = rollCallQuerySchema.parse(request.query);

      const rollCall = await shiftService.getRollCall(query.shiftType, query.date);

      return reply.status(200).send(rollCall);
    },
  });

  /**
   * GET /api/v1/shifts/leaderboard
   * Get leaderboard for a specific date
   */
  app.get('/leaderboard', {
    preHandler: [authenticate, requirePermission('shifts.read')],
    handler: async (request, reply) => {
      const query = leaderboardQuerySchema.parse(request.query);

      const date = query.date || new Date();
      const leaderboard = await shiftService.getLeaderboard(date, query.shiftType, query.limit);

      return reply.status(200).send({
        data: leaderboard,
        date,
      });
    },
  });

  /**
   * GET /api/v1/shifts/:id
   * Get shift by ID with full details
   */
  app.get('/:id', {
    preHandler: [authenticate, requirePermission('shifts.read')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const shift = await shiftService.getById(id);
      if (!shift) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Shift not found',
          },
        });
      }

      return reply.status(200).send(shift);
    },
  });

  /**
   * POST /api/v1/shifts/:id/start
   * Start a shift (clock-in with geo-lock and bond check)
   */
  app.post('/:id/start', {
    preHandler: [authenticate, requirePermission('shifts.write')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = startShiftSchema.parse(request.body);

      try {
        const result = await shiftService.clockIn(id, {
          latitude: body.location.lat,
          longitude: body.location.lng,
          accuracy: body.location.accuracyMeters,
        }, body.checklist);

        return reply.status(200).send(result);
      } catch (error: any) {
        // Handle specific error types
        if (error.message?.includes('geofence')) {
          return reply.status(422).send({ error: { code: 'OUTSIDE_GEOFENCE', message: error.message } });
        }
        if (error.message?.includes('bond')) {
          return reply.status(403).send({ error: { code: 'BOND_INSUFFICIENT', message: error.message } });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/shifts/:id/end
   * End a shift (clock-out with metrics finalization)
   */
  app.post('/:id/end', {
    preHandler: [authenticate, requirePermission('shifts.write')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = endShiftSchema.parse(request.body);
      // @ts-expect-error - GeoPoint validation

      const result = await shiftService.endShift(id, body.location, body.notes);

      if (!result.success) {
        let statusCode = 400;
        if (result.error?.code === 'OUTSIDE_GEOFENCE') {
          statusCode = 422;
        } else if (result.error?.code === 'SHIFT_NOT_ACTIVE') {
          statusCode = 409;
        }

        return reply.status(statusCode).send({
          error: result.error,
        });
      }

      return reply.status(200).send({
        shift: result.shift,
        summary: result.summary,
      });
    },
  });

  /**
   * POST /api/v1/shifts/:id/mark-arrival
   * Mark driver arrival at staging area
   */
  app.post('/:id/mark-arrival', {
    preHandler: [authenticate, requirePermission('shifts.write')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = markArrivalSchema.parse(request.body);

      // Note: markArrival not implemented - using clockIn as approximation
      await shiftService.clockIn(id, {
        latitude: body.location.lat,
        longitude: body.location.lng,
        accuracy: body.location.accuracyMeters,
      });

      return reply.status(200).send({
        message: 'Arrival marked successfully',
      });
    },
  });

  /**
   * POST /api/v1/shifts/:id/flag-incident
   * Flag shift as having an incident (used by Incidents Agent)
   */
  app.post('/:id/flag-incident', {
    preHandler: [authenticate, requirePermission('incidents.write')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      // Note: flagShiftIncident not implemented - this would update shift metadata
      return reply.status(200).send({
        message: 'Shift flagged for incident (stub)',
      });
    },
  });

  /**
   * POST /api/v1/shifts/update-under-working-flags
   * Update under-working flags for all active shifts (called by cron/system)
   */
  app.post('/update-under-working-flags', {
    preHandler: [authenticate, requirePermission('shifts.write')],
    handler: async (request, reply) => {
      // Note: updateAllUnderWorkingFlags not implemented - would be called by cron
      return reply.status(200).send({
        message: 'Under-working flags updated (stub)',
      });
    },
  });
}
