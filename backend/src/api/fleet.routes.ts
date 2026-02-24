// src/api/fleet.routes.ts
// Fleet/Vehicles Agent API routes

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../models/db.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

const createVehicleSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  serviceSegment: z.enum(['4W-TNVS', '2W-TWG', '2W-SAL', '4W-SAL']),
  vin: z.string().max(50).optional(),
  color: z.string().max(30).optional(),
});

const updateVehicleSchema = z.object({
  make: z.string().min(1).max(50).optional(),
  model: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  color: z.string().max(30).optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

export default async function fleetRoutes(app: FastifyInstance) {
  // GET /api/fleet/vehicles - List all vehicles
  app.get('/vehicles', async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          currentDrivers: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return reply.status(200).send({
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // GET /api/fleet/vehicles/:id - Get vehicle by ID
  app.get('/vehicles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const vehicle = await prisma.asset.findUnique({
      where: { id },
      include: {
        currentDrivers: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return reply.status(200).send(vehicle);
  });

  // POST /api/fleet/vehicles - Create new vehicle
  app.post('/vehicles', async (request, reply) => {
    const body = createVehicleSchema.parse(request.body);

    // Generate asset code from plate number
    const assetCode = body.plateNumber.replace(/\s/g, '').toUpperCase();

    // Check for duplicate plate number
    const existing = await prisma.asset.findUnique({
      where: { plateNumber: body.plateNumber.toUpperCase() },
    });

    if (existing) {
      throw new ValidationError('Vehicle with this plate number already exists');
    }

    const vehicle = await prisma.asset.create({
      data: {
        assetCode,
        plateNumber: body.plateNumber.toUpperCase(),
        serviceSegment: body.serviceSegment as any,
        make: body.make,
        model: body.model,
        year: body.year,
        vin: body.vin,
        color: body.color,
        isActive: true,
      },
      include: {
        currentDrivers: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return reply.status(201).send(vehicle);
  });

  // PATCH /api/fleet/vehicles/:id - Update vehicle
  app.patch('/vehicles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateVehicleSchema.parse(request.body);

    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Vehicle not found');
    }

    const vehicle = await prisma.asset.update({
      where: { id },
      data: {
        ...(body.make !== undefined && { make: body.make }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.color !== undefined && { color: body.color }),
      },
      include: {
        currentDrivers: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return reply.status(200).send(vehicle);
  });

  // DELETE /api/fleet/vehicles/:id - Delete vehicle (soft delete by deactivating)
  app.delete('/vehicles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Vehicle not found');
    }

    await prisma.asset.update({
      where: { id },
      data: { isActive: false },
    });

    return reply.status(204).send();
  });

  // GET /api/fleet/vehicles/:id/drivers - Get drivers assigned to vehicle
  app.get('/vehicles/:id/drivers', async (request, reply) => {
    const { id } = request.params as { id: string };

    const vehicle = await prisma.asset.findUnique({
      where: { id },
      include: {
        currentDrivers: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return reply.status(200).send(vehicle.currentDrivers);
  });
}
