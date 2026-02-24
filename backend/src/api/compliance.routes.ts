// src/api/compliance.routes.ts
// Compliance Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { complianceService } from '../services/compliance.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const amlCheckSchema = z.object({
  customerId: z.string(),
  transactionId: z.string(),
  amount: z.number().positive(),
  transactionType: z.string(),
});

const dataSubjectRequestSchema = z.object({
  userId: z.string(),
  requestType: z.enum(['ACCESS', 'DELETION', 'PORTABILITY', 'CORRECTION']),
  details: z.string().optional(),
});

const ltfrbReportSchema = z.object({
  reportType: z.enum(['FLEET', 'DRIVER', 'SERVICE']),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

const taxCalculationSchema = z.object({
  revenue: z.number().positive(),
  expenses: z.number().optional(),
  vatRegistered: z.boolean().optional(),
});

// Routes plugin
export default async function complianceRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // ========================================
  // BSP (Anti-Money Laundering)
  // ========================================

  // POST /api/compliance/bsp/aml-check - AML check
  fastify.post('/bsp/aml-check', async (request, reply) => {
    const validation = amlCheckSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await complianceService.checkAML(validation.data);
    return result;
  });

  // POST /api/compliance/bsp/ctr - Generate CTR
  fastify.post('/bsp/ctr', async (request, reply) => {
    const validation = amlCheckSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const report = await complianceService.generateCTR(validation.data);
    return report;
  });

  // POST /api/compliance/bsp/str - Generate STR
  fastify.post('/bsp/str', async (request, reply) => {
    const body = request.body as any;
    const validation = amlCheckSchema.safeParse(body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    if (!body.reason) {
      throw new ValidationError('Reason required for STR');
    }

    const report = await complianceService.generateSTR(validation.data, body.reason);
    return report;
  });

  // ========================================
  // DPA (Data Privacy)
  // ========================================

  // POST /api/compliance/dpa/request - Data subject request
  fastify.post('/dpa/request', async (request, reply) => {
    const validation = dataSubjectRequestSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await complianceService.handleDataSubjectRequest(validation.data);
    return result;
  });

  // GET /api/compliance/dpa/request/:id - Get request status
  fastify.get('/dpa/request/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    // Use compliance service to get request data
    const requestData = await complianceService.getDataSubjectRequest(id);
    
    if (!requestData) {
      return reply.status(404).send({ error: 'Request not found' });
    }
    
    return requestData;
  });

  // ========================================
  // LTFRB
  // ========================================

  // POST /api/compliance/ltfrb/report - Generate LTFRB report
  fastify.post('/ltfrb/report', async (request, reply) => {
    const validation = ltfrbReportSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const report = await complianceService.generateLTFRBReport(
      validation.data.reportType,
      {
        from: new Date(validation.data.from),
        to: new Date(validation.data.to),
      }
    );
    return report;
  });

  // ========================================
  // BIR (Tax)
  // ========================================

  // POST /api/compliance/bir/calculate-tax - Calculate tax
  fastify.post('/bir/calculate-tax', async (request, reply) => {
    const validation = taxCalculationSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = complianceService.calculateTax(validation.data);
    return result;
  });

  // POST /api/compliance/bir/receipt/:paymentId - Generate receipt
  fastify.post('/bir/receipt/:paymentId', async (request, reply) => {
    const { paymentId } = request.params as { paymentId: string };
    const receipt = await complianceService.generateBIRReceipt(paymentId);
    return receipt;
  });

  // GET /api/compliance/bir/receipt/:id - Get receipt
  fastify.get('/bir/receipt/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const receipt = await complianceService.getBIRReceipt(id);
    
    if (!receipt) {
      return reply.status(404).send({ error: 'Receipt not found' });
    }
    
    return receipt;
  });
}
