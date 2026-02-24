// src/api/driver.routes.ts
// Drivers Agent API routes

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import driverService, { DriverFilters, CreateDriverInput, UpdateDriverInput } from '../services/driver.service.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PAGINATION } from '../config/constants.js';
import { ValidationError } from '../middleware/errorHandler.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(PAGINATION.defaultPage),
  perPage: z.coerce.number().int().min(1).max(PAGINATION.maxPerPage).optional().default(PAGINATION.defaultPerPage),
  status: z.union([
    z.enum(['ACTIVE', 'SUSPENDED', 'TRAINING', 'PROBATION', 'INACTIVE', 'TERMINATED']),
    z.array(z.enum(['ACTIVE', 'SUSPENDED', 'TRAINING', 'PROBATION', 'INACTIVE', 'TERMINATED'])),
  ]).optional(),
  serviceSegment: z.union([
    z.enum(['4W-TNVS', '2W-TWG', '2W-SAL', '4W-SAL']),
    z.array(z.enum(['4W-TNVS', '2W-TWG', '2W-SAL', '4W-SAL'])),
  ]).optional(),
  tier: z.union([
    z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'UNRANKED']),
    z.array(z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'UNRANKED'])),
  ]).optional(),
  assignedOverwatchId: z.string().uuid().optional(),
  search: z.string().optional(),
});

const createDriverSchema = z.object({
  // Personal
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().max(20).optional(),
  photoUrl: z.string().max(500).url().optional(),

  // Contact
  phonePrimary: z.string().min(10).max(20),
  phoneSecondary: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  viberNumber: z.string().max(20).optional(),

  // Address
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),

  // Emergency Contact
  emergencyName: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  emergencyRelation: z.string().max(50).optional(),

  // License & Compliance
  licenseNumber: z.string().min(1).max(50),
  licenseExpiry: z.coerce.date(),
  licenseType: z.string().max(20).optional(),
  nbiClearanceDate: z.coerce.date().optional(),
  drugTestDate: z.coerce.date().optional(),

  // Employment
  serviceSegment: z.enum(['4W-TNVS', '2W-TWG', '2W-SAL', '4W-SAL']),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TRAINING', 'PROBATION', 'INACTIVE', 'TERMINATED']).optional(),
  hireDate: z.coerce.date(),

  // Financials
  securityBondRequired: z.number().min(0),
  baseSalary: z.number().min(0).optional(),

  // Assignment
  currentAssetId: z.string().uuid().optional(),
  assignedSectorId: z.string().uuid().optional(),
  assignedOverwatchId: z.string().uuid().optional(),
});

const updateDriverSchema = z.object({
  // Personal
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().max(20).optional(),
  photoUrl: z.string().max(500).url().optional(),

  // Contact
  phonePrimary: z.string().min(10).max(20).optional(),
  phoneSecondary: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  viberNumber: z.string().max(20).optional(),

  // Address
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),

  // Emergency Contact
  emergencyName: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  emergencyRelation: z.string().max(50).optional(),

  // License & Compliance
  licenseNumber: z.string().min(1).max(50).optional(),
  licenseExpiry: z.coerce.date().optional(),
  licenseType: z.string().max(20).optional(),
  nbiClearanceDate: z.coerce.date().optional(),
  drugTestDate: z.coerce.date().optional(),

  // Employment
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TRAINING', 'PROBATION', 'INACTIVE', 'TERMINATED']).optional(),
  terminationDate: z.coerce.date().optional(),
  terminationReason: z.string().optional(),

  // Financials
  securityBondRequired: z.number().min(0).optional(),
  baseSalary: z.number().min(0).optional(),

  // Assignment
  currentAssetId: z.string().uuid().optional(),
  assignedSectorId: z.string().uuid().optional(),
  assignedOverwatchId: z.string().uuid().optional(),
});

const assignmentSchema = z.object({
  overwatchId: z.string().uuid().optional(),
  sectorId: z.string().uuid().optional(),
});

const shiftsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(PAGINATION.defaultPage),
  perPage: z.coerce.number().int().min(1).max(PAGINATION.maxPerPage).optional().default(PAGINATION.defaultPerPage),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

export async function driverRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/drivers
   * List drivers with filters
   */
  app.get('/', {
    preHandler: [authenticate, requirePermission('drivers.read')],
    handler: async (request, reply) => {
      const query = listQuerySchema.parse(request.query);

      const filters: DriverFilters = {
        status: query.status,
        serviceSegment: query.serviceSegment as string,
        tier: query.tier,
        assignedOverwatchId: query.assignedOverwatchId,
        search: query.search,
      };

      const result = await driverService.list(
        filters,
        query.page,
        query.perPage,
        request.user.id,
        request.user.role
      );

      return reply.status(200).send(result);
    },
  });

  /**
   * GET /api/v1/drivers/:id
   * Get driver by ID with full details
   */
  app.get('/:id', {
    preHandler: [authenticate, requirePermission('drivers.read')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const driver = await driverService.getById(id);
      if (!driver) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Driver not found',
          },
        });
      }

      // Get additional data
      const [compliance, bondStatus, metrics] = await Promise.all([
        driverService.getComplianceStatus(id),
        driverService.getBondStatus(id),
        driverService.get28DayMetrics(id),
      ]);

      return reply.status(200).send({
        ...driver,
        compliance,
        bondStatus,
        metrics,
      });
    },
  });

  /**
   * POST /api/v1/drivers
   * Create a new driver
   */
  app.post('/', {
    preHandler: [authenticate, requirePermission('drivers.write')],
    handler: async (request, reply) => {
      const body = createDriverSchema.parse(request.body);

      // Generate employee ID
      const employeeId = `EMP-${Date.now()}`;

      const driver = await driverService.create({
        ...body,
        employeeId,
      }, request.user.id);

      return reply.status(201).send(driver);
    },
  });

  /**
   * PATCH /api/v1/drivers/:id
   * Update a driver
   */
  app.patch('/:id', {
    preHandler: [authenticate, requirePermission('drivers.write')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateDriverSchema.parse(request.body);

      const driver = await driverService.update(id, body);

      return reply.status(200).send(driver);
    },
  });

  /**
   * PATCH /api/v1/drivers/:id/assignment
   * Assign overwatch or sector to driver
   */
  app.patch('/:id/assignment', {
    preHandler: [authenticate, requirePermission('drivers.write')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = assignmentSchema.parse(request.body);

      if (body.overwatchId) {
        await driverService.assignOverwatch(id, body.overwatchId);
      }

      if (body.sectorId) {
        await driverService.assignSector(id, body.sectorId);
      }

      if (!body.overwatchId && !body.sectorId) {
        throw new ValidationError('Must provide overwatchId or sectorId');
      }

      return reply.status(200).send({
        message: 'Assignment updated successfully',
      });
    },
  });

  /**
   * GET /api/v1/drivers/:id/shifts
   * Get shift history for driver
   */
  app.get('/:id/shifts', {
    preHandler: [authenticate, requirePermission('shifts.read')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = shiftsQuerySchema.parse(request.query);

      // Check if driver exists
      const driver = await driverService.getById(id);
      if (!driver) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Driver not found',
          },
        });
      }

      // Build where clause
      const where: any = { driverId: id };
      if (query.from || query.to) {
        where.shiftDate = {};
        if (query.from) where.shiftDate.gte = query.from;
        if (query.to) where.shiftDate.lte = query.to;
      }

      // Get shifts from prisma directly
      const { prisma } = await import('../models/db.js');
      const skip = (query.page - 1) * query.perPage;
      const [shifts, total] = await Promise.all([
        prisma.shift.findMany({
          where,
          skip,
          take: query.perPage,
          orderBy: { shiftDate: 'desc' },
          include: {
            asset: {
              select: {
                assetCode: true,
                plateNumber: true,
              },
            },
          },
        }),
        prisma.shift.count({ where }),
      ]);

      return reply.status(200).send({
        data: shifts,
        pagination: {
          page: query.page,
          perPage: query.perPage,
          total,
          totalPages: Math.ceil(total / query.perPage),
        },
      });
    },
  });

  /**
   * GET /api/v1/drivers/:id/metrics
   * Get 28-day metrics for driver
   */
  app.get('/:id/metrics', {
    preHandler: [authenticate, requirePermission('drivers.read')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const metrics = await driverService.get28DayMetrics(id);

      return reply.status(200).send(metrics);
    },
  });

  /**
   * GET /api/v1/drivers/:id/compliance
   * Get compliance status for driver
   */
  app.get('/:id/compliance', {
    preHandler: [authenticate, requirePermission('drivers.read')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const compliance = await driverService.getComplianceStatus(id);

      return reply.status(200).send(compliance);
    },
  });

  /**
   * GET /api/v1/drivers/:id/bond
   * Get bond status for driver
   */
  app.get('/:id/bond', {
    preHandler: [authenticate, requirePermission('drivers.read')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const bondStatus = await driverService.getBondStatus(id);

      return reply.status(200).send(bondStatus);
    },
  });
}
