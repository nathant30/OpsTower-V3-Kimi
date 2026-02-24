// src/api/bond.routes.ts
// Financials Agent - Bond API Routes

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bondService from '../services/bond.service.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PAGINATION } from '../config/constants.js';

// Validation schemas
const bondBalanceParamsSchema = z.object({
  driverId: z.string().uuid(),
});

const bondTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.defaultPage),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.maxPerPage)
    .default(PAGINATION.defaultPerPage),
});

const bondDepositSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

const bondDeductionSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

const bondAdjustmentSchema = z.object({
  amount: z.number(),
  reason: z.string().min(1),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

export async function bondRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/drivers/:driverId/bond
   * Get current bond balance and status
   */
  app.get('/drivers/:driverId/bond', {
    preHandler: [authenticate, requirePermission('bonds.read')],
    handler: async (request, reply) => {
      const { driverId } = bondBalanceParamsSchema.parse(request.params);

      const balance = await bondService.getBondBalance(driverId);
      const sufficiency = await bondService.checkBondSufficiency(driverId);
      const burnAlert = await bondService.checkBondBurnAlert(driverId);

      return reply.status(200).send({
        balance: balance.balance,
        required: balance.required,
        percent: balance.percent,
        serviceSegment: balance.serviceSegment,
        canStartShift: sufficiency.canStartShift,
        shortfall: sufficiency.shortfall,
        burnAlert,
      });
    },
  });

  /**
   * GET /api/v1/drivers/:driverId/bond/transactions
   * Get bond transaction history (paginated)
   */
  app.get('/drivers/:driverId/bond/transactions', {
    preHandler: [authenticate, requirePermission('bonds.read')],
    handler: async (request, reply) => {
      const { driverId } = bondBalanceParamsSchema.parse(request.params);
      const query = bondTransactionsQuerySchema.parse(request.query);

      const result = await bondService.getBondTransactionHistory(driverId, {
        page: query.page,
        perPage: query.perPage,
      });

      return reply.status(200).send(result);
    },
  });

  /**
   * POST /api/v1/drivers/:driverId/bond/deposit
   * Add funds to driver's bond (FINANCE role only)
   */
  app.post('/drivers/:driverId/bond/deposit', {
    preHandler: [authenticate, requirePermission('bonds.write')],
    handler: async (request, reply) => {
      const { driverId } = bondBalanceParamsSchema.parse(request.params);
      const body = bondDepositSchema.parse(request.body);

      const transaction = await bondService.addBondTransaction({
        driverId,
        type: 'DEPOSIT',
        amount: body.amount,
        description: body.description || `Deposit of ₱${body.amount}`,
        referenceType: body.referenceType,
        referenceId: body.referenceId,
        createdById: request.user.id,
      });

      return reply.status(201).send({
        transaction: {
          id: transaction.id,
          type: transaction.transactionType,
          amount: Number(transaction.amount),
          balanceAfter: Number(transaction.balanceAfter),
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
      });
    },
  });

  /**
   * POST /api/v1/drivers/:driverId/bond/deduction
   * Deduct funds from driver's bond (with reason)
   */
  app.post('/drivers/:driverId/bond/deduction', {
    preHandler: [authenticate, requirePermission('bonds.write')],
    handler: async (request, reply) => {
      const { driverId } = bondBalanceParamsSchema.parse(request.params);
      const body = bondDeductionSchema.parse(request.body);

      const transaction = await bondService.createBondDeduction({
        driverId,
        amount: body.amount,
        reason: body.reason,
        referenceType: body.referenceType || 'MANUAL',
        referenceId: body.referenceId || '',
        createdById: request.user.id,
      });

      return reply.status(201).send({
        transaction: {
          id: transaction.id,
          type: transaction.transactionType,
          amount: Number(transaction.amount),
          balanceAfter: Number(transaction.balanceAfter),
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
      });
    },
  });

  /**
   * POST /api/v1/drivers/:driverId/bond/adjustment
   * Make a manual adjustment to driver's bond (positive or negative)
   * FINANCE role only
   */
  app.post('/drivers/:driverId/bond/adjustment', {
    preHandler: [authenticate, requirePermission('bonds.write')],
    handler: async (request, reply) => {
      const { driverId } = bondBalanceParamsSchema.parse(request.params);
      const body = bondAdjustmentSchema.parse(request.body);

      const transaction = await bondService.addBondTransaction({
        driverId,
        type: 'ADJUSTMENT',
        amount: body.amount,
        description: body.reason,
        referenceType: body.referenceType || 'MANUAL',
        referenceId: body.referenceId || '',
        createdById: request.user.id,
      });

      return reply.status(201).send({
        transaction: {
          id: transaction.id,
          type: transaction.transactionType,
          amount: Number(transaction.amount),
          balanceAfter: Number(transaction.balanceAfter),
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
      });
    },
  });

  /**
   * GET /api/v1/drivers/:driverId/bond/lockdown
   * Check if driver is locked down (cannot start shift due to insufficient bond)
   */
  app.get('/drivers/:driverId/bond/lockdown', {
    preHandler: [authenticate, requirePermission('bonds.read')],
    handler: async (request, reply) => {
      const { driverId } = bondBalanceParamsSchema.parse(request.params);

      const isLockedDown = await bondService.checkBondLockdown(driverId);
      const sufficiency = await bondService.checkBondSufficiency(driverId);

      return reply.status(200).send({
        isLockedDown,
        canStartShift: sufficiency.canStartShift,
        balance: sufficiency.balance,
        required: sufficiency.required,
        shortfall: sufficiency.shortfall,
      });
    },
  });
}
