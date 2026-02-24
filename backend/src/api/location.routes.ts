// src/api/location.routes.ts
// Location Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { locationService } from '../services/location.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  timestamp: z.string().datetime().optional(),
});

const checkGeofenceSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  geofenceId: z.string().uuid().optional(),
});

// Routes plugin
export default async function locationRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // POST /api/locations/update - Update driver location
  fastify.post('/update', async (request, reply) => {
    const validation = updateLocationSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const driverId = (request as any).user?.userId || (request.body as any).driverId;
    
    if (!driverId) {
      throw new ValidationError('Driver ID required');
    }

    await locationService.updateLocation({
      driverId,
      ...validation.data,
      timestamp: validation.data.timestamp ? new Date(validation.data.timestamp) : new Date(),
    });

    return { success: true };
  });

  // GET /api/locations/drivers/:driverId - Get driver location
  fastify.get('/drivers/:driverId', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const location = await locationService.getDriverLocation(driverId);
    
    if (!location) {
      return reply.status(404).send({ error: 'Location not available' });
    }
    
    return location;
  });

  // POST /api/locations/geofence/check - Check if in geofence
  fastify.post('/geofence/check', async (request, reply) => {
    const validation = checkGeofenceSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await locationService.checkGeofence(validation.data);
    return result;
  });

  // GET /api/locations/nearby - Get nearby drivers
  fastify.get('/nearby', async (request, reply) => {
    const query = request.query as any;
    
    const latitude = query.latitude ? parseFloat(query.latitude) : null;
    const longitude = query.longitude ? parseFloat(query.longitude) : null;
    const radius = query.radius ? parseInt(query.radius) : 5000;
    const status = query.status;

    if (latitude === null || longitude === null) {
      throw new ValidationError('Latitude and longitude required');
    }

    const drivers = await locationService.getNearbyDrivers(latitude, longitude, radius, status);
    return { drivers };
  });
}
