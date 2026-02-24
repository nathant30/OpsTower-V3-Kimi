// src/api/bonds.routes.ts
// Bond Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { bondService } from '../services/bond.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const createTransactionSchema = z.object({
  type: z.enum(['DEPOSIT', 'DEDUCTION', 'REFUND', 'ADJUSTMENT']),
  amount: z.number().positive(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
});

// Routes plugin
export default async function bondRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/bonds/transactions - List transactions
  fastify.get('/transactions', async (request, reply) => {
    const query = request.query as any;
    
    const filters = {
      driverId: query.driverId,
      type: query.type,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    const result = await bondService.listTransactions(filters, page, limit);
    return result;
  });

  // POST /api/bonds/transactions - Create transaction
  fastify.post('/transactions', async (request, reply) => {
    const validation = createTransactionSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = request.user?.id;
    const transaction = await bondService.createTransaction({
      ...validation.data,
      driverId: (request.body as any).driverId,
      performedById: userId,
    });

    reply.status(201);
    return transaction;
  });

  // GET /api/drivers/:driverId/bond-balance - Get driver bond balance
  fastify.get('/drivers/:driverId/bond-balance', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const balance = await bondService.getBalance(driverId);
    return balance;
  });

  // GET /api/drivers/:driverId/bond-history - Get driver transaction history
  fastify.get('/drivers/:driverId/bond-history', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const query = request.query as any;
    
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    const result = await bondService.getDriverTransactionHistory(driverId, page, limit);
    return result;
  });

  // GET /api/drivers/:driverId/bond-can-start-shift - Check if can start shift
  fastify.get('/drivers/:driverId/can-start-shift', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const result = await bondService.canStartShift(driverId);
    return result;
  });

  // POST /api/bonds/deduct - Process deduction
  fastify.post('/deduct', async (request, reply) => {
    const { driverId, incidentId, incidentType } = request.body as any;
    
    if (!driverId || !incidentId || !incidentType) {
      throw new ValidationError('Missing required fields: driverId, incidentId, incidentType');
    }

    const userId = request.user?.id;
    const transaction = await bondService.processIncidentDeduction(
      driverId,
      incidentId,
      incidentType,
      userId
    );

    reply.status(201);
    return transaction;
  });
}
