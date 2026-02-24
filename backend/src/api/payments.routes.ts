// src/api/payments.routes.ts
// Payment Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { paymentsService } from '../services/payments.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const initiatePaymentSchema = z.object({
  provider: z.enum(['MAYA', 'GCASH']).optional(),
  amount: z.number().positive(),
  currency: z.string().default('PHP'),
  description: z.string().min(1),
  customerId: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const refundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().min(1),
});

// Routes plugin
export default async function paymentsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // POST /api/payments/initiate - Initiate payment with orchestration
  fastify.post('/initiate', async (request, reply) => {
    const validation = initiatePaymentSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await paymentsService.initiateWithOrchestration(
      validation.data,
      validation.data.provider
    );

    return result;
  });

  // POST /api/payments/maya/initiate - Initiate Maya payment
  fastify.post('/maya/initiate', async (request, reply) => {
    const validation = initiatePaymentSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await paymentsService.initiateMaya(validation.data);
    return result;
  });

  // POST /api/payments/gcash/initiate - Initiate GCash payment
  fastify.post('/gcash/initiate', async (request, reply) => {
    const validation = initiatePaymentSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await paymentsService.initiateGCash(validation.data);
    return result;
  });

  // POST /api/payments/webhook/maya - Maya webhook
  fastify.post('/webhook/maya', async (request, reply) => {
    await paymentsService.handleMayaWebhook(request.body);
    return { received: true };
  });

  // POST /api/payments/webhook/gcash - GCash webhook
  fastify.post('/webhook/gcash', async (request, reply) => {
    await paymentsService.handleGCashWebhook(request.body);
    return { received: true };
  });

  // POST /api/payments/refund - Process refund
  fastify.post('/refund', async (request, reply) => {
    const validation = refundSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const success = await paymentsService.processRefund(validation.data);
    return { success };
  });

  // GET /api/payments/transactions - List transactions
  fastify.get('/transactions', async (request, reply) => {
    const query = request.query as any;
    const customerId = query.customerId;
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    const result = await paymentsService.getTransactionHistory(customerId, page, limit);
    return result;
  });
}
