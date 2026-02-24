// src/api/finance.routes.ts
// Finance Agent - Transaction API Routes

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { prisma } from '../models/db.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const transactionTypeEnum = z.enum(['ORDER', 'TOPUP', 'WITHDRAWAL', 'FEE']);
const transactionStatusEnum = z.enum(['PENDING', 'COMPLETED', 'FAILED']);

const listTransactionsQuerySchema = z.object({
  type: z.union([transactionTypeEnum, z.array(transactionTypeEnum)]).optional(),
  status: z.union([transactionStatusEnum, z.array(transactionStatusEnum)]).optional(),
  driverId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  driverId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
});

const failTransactionSchema = z.object({
  reason: z.string().min(1).max(500),
});

const transactionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const driverIdParamsSchema = z.object({
  driverId: z.string().uuid(),
});

const topUpSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
});

const withdrawSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateTransactionNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `TXN-${year}${month}${day}-${random}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================================================
// ROUTES
// ============================================================================

export default async function financeRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/finance/transactions
   * List transactions with filters and pagination
   */
  app.get('/transactions', {
    handler: async (request, reply) => {
      const query = listTransactionsQuerySchema.parse(request.query);

      const { type, status, driverId, startDate, endDate, search, page, limit } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Type filter
      if (type) {
        if (Array.isArray(type)) {
          where.type = { in: type };
        } else {
          where.type = type;
        }
      }

      // Status filter
      if (status) {
        if (Array.isArray(status)) {
          where.status = { in: status };
        } else {
          where.status = status;
        }
      }

      // Driver filter
      if (driverId) {
        where.driverId = driverId;
      }

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = startOfDay(startDate);
        }
        if (endDate) {
          where.createdAt.lte = startOfDay(endDate);
        }
      }

      // Search filter
      if (search) {
        where.OR = [
          { transactionNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get transactions with pagination
      const [items, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.transaction.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        items,
        total,
        page,
        limit,
        totalPages,
      });
    },
  });

  /**
   * GET /api/v1/finance/transactions/:id
   * Get single transaction by ID
   */
  app.get('/transactions/:id', {
    handler: async (request, reply) => {
      const { id } = transactionIdParamsSchema.parse(request.params);

      const transaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      return reply.status(200).send(transaction);
    },
  });

  /**
   * POST /api/v1/finance/transactions
   * Create new transaction
   */
  app.post('/transactions', {
    handler: async (request, reply) => {
      const body = createTransactionSchema.parse(request.body);

      // Verify driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: body.driverId },
      });

      if (!driver) {
        throw new NotFoundError('Driver not found');
      }

      // Verify order exists if provided
      if (body.orderId) {
        const order = await prisma.trip.findUnique({
          where: { id: body.orderId },
        });

        if (!order) {
          throw new NotFoundError('Order not found');
        }
      }

      // Generate transaction number
      const transactionNumber = generateTransactionNumber();

      const transaction = await prisma.transaction.create({
        data: {
          transactionNumber,
          type: body.type,
          status: 'PENDING',
          amount: body.amount,
          description: body.description,
          driverId: body.driverId,
          orderId: body.orderId || null,
        },
      });

      return reply.status(201).send(transaction);
    },
  });

  /**
   * POST /api/v1/finance/transactions/:id/process
   * Process/complete a transaction
   */
  app.post('/transactions/:id/process', {
    handler: async (request, reply) => {
      const { id } = transactionIdParamsSchema.parse(request.params);

      const transaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      if (transaction.status !== 'PENDING') {
        throw new ValidationError(`Cannot process transaction with status: ${transaction.status}`);
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      return reply.status(200).send(updatedTransaction);
    },
  });

  /**
   * POST /api/v1/finance/transactions/:id/fail
   * Mark transaction as failed
   */
  app.post('/transactions/:id/fail', {
    handler: async (request, reply) => {
      const { id } = transactionIdParamsSchema.parse(request.params);
      const body = failTransactionSchema.parse(request.body);

      const transaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      if (transaction.status === 'COMPLETED') {
        throw new ValidationError('Cannot fail a completed transaction');
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'FAILED',
          metadata: { failureReason: body.reason },
        },
      });

      return reply.status(200).send(updatedTransaction);
    },
  });

  /**
   * GET /api/v1/finance/summary
   * Get financial summary
   */
  app.get('/summary', {
    handler: async (request, reply) => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfWeek(now);
      const monthStart = startOfMonth(now);

      // Get all transactions
      const allTransactions = await prisma.transaction.findMany({
        select: {
          amount: true,
          status: true,
          createdAt: true,
        },
      });

      // Calculate totals
      let totalRevenue = 0;
      let totalTransactions = allTransactions.length;
      let pendingAmount = 0;
      let completedAmount = 0;
      let todayRevenue = 0;
      let weekRevenue = 0;
      let monthRevenue = 0;

      for (const t of allTransactions) {
        const amount = Number(t.amount);
        
        if (t.status === 'COMPLETED') {
          totalRevenue += amount;
          completedAmount += amount;
          
          if (t.createdAt >= todayStart) {
            todayRevenue += amount;
          }
          if (t.createdAt >= weekStart) {
            weekRevenue += amount;
          }
          if (t.createdAt >= monthStart) {
            monthRevenue += amount;
          }
        } else if (t.status === 'PENDING') {
          pendingAmount += amount;
        }
      }

      return reply.status(200).send({
        totalRevenue,
        totalTransactions,
        pendingAmount,
        completedAmount,
        todayRevenue,
        weekRevenue,
        monthRevenue,
      });
    },
  });

  /**
   * GET /api/v1/finance/drivers/:driverId/transactions
   * Get transactions for a specific driver
   */
  app.get('/drivers/:driverId/transactions', {
    handler: async (request, reply) => {
      const { driverId } = driverIdParamsSchema.parse(request.params);
      const query = listTransactionsQuerySchema.parse(request.query);
      const { page, limit } = query;
      const skip = (page - 1) * limit;

      // Verify driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driver) {
        throw new NotFoundError('Driver not found');
      }

      const where: any = { driverId };

      if (query.type) {
        if (Array.isArray(query.type)) {
          where.type = { in: query.type };
        } else {
          where.type = query.type;
        }
      }

      if (query.status) {
        if (Array.isArray(query.status)) {
          where.status = { in: query.status };
        } else {
          where.status = query.status;
        }
      }

      const [items, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.transaction.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        items,
        total,
        page,
        limit,
        totalPages,
      });
    },
  });

  /**
   * GET /api/v1/finance/drivers/:driverId/balance
   * Get driver's financial balance
   */
  app.get('/drivers/:driverId/balance', {
    handler: async (request, reply) => {
      const { driverId } = driverIdParamsSchema.parse(request.params);

      // Verify driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driver) {
        throw new NotFoundError('Driver not found');
      }

      // Get all completed transactions
      const transactions = await prisma.transaction.findMany({
        where: {
          driverId,
          status: 'COMPLETED',
        },
        select: {
          type: true,
          amount: true,
        },
      });

      let totalEarnings = 0;
      let totalWithdrawals = 0;
      let totalFees = 0;

      for (const t of transactions) {
        const amount = Number(t.amount);
        
        switch (t.type) {
          case 'ORDER':
            totalEarnings += amount;
            break;
          case 'TOPUP':
            totalEarnings += amount;
            break;
          case 'WITHDRAWAL':
            totalWithdrawals += amount;
            break;
          case 'FEE':
            totalFees += amount;
            break;
        }
      }

      const balance = totalEarnings - totalWithdrawals - totalFees;

      return reply.status(200).send({
        driverId,
        balance,
        totalEarnings,
        totalWithdrawals,
        totalFees,
      });
    },
  });

  /**
   * POST /api/v1/finance/drivers/:driverId/topup
   * Top up driver's balance
   */
  app.post('/drivers/:driverId/topup', {
    handler: async (request, reply) => {
      const { driverId } = driverIdParamsSchema.parse(request.params);
      const body = topUpSchema.parse(request.body);

      // Verify driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driver) {
        throw new NotFoundError('Driver not found');
      }

      // Generate transaction number
      const transactionNumber = generateTransactionNumber();

      const transaction = await prisma.transaction.create({
        data: {
          transactionNumber,
          type: 'TOPUP',
          status: 'COMPLETED',
          amount: body.amount,
          description: body.description,
          driverId,
          processedAt: new Date(),
        },
      });

      return reply.status(201).send(transaction);
    },
  });

  /**
   * POST /api/v1/finance/drivers/:driverId/withdraw
   * Withdraw from driver's balance
   */
  app.post('/drivers/:driverId/withdraw', {
    handler: async (request, reply) => {
      const { driverId } = driverIdParamsSchema.parse(request.params);
      const body = withdrawSchema.parse(request.body);

      // Verify driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driver) {
        throw new NotFoundError('Driver not found');
      }

      // Check balance
      const completedTransactions = await prisma.transaction.findMany({
        where: {
          driverId,
          status: 'COMPLETED',
        },
        select: {
          type: true,
          amount: true,
        },
      });

      let balance = 0;
      for (const t of completedTransactions) {
        const amount = Number(t.amount);
        if (t.type === 'ORDER' || t.type === 'TOPUP') {
          balance += amount;
        } else if (t.type === 'WITHDRAWAL' || t.type === 'FEE') {
          balance -= amount;
        }
      }

      if (balance < body.amount) {
        throw new ValidationError('Insufficient balance');
      }

      // Generate transaction number
      const transactionNumber = generateTransactionNumber();

      const transaction = await prisma.transaction.create({
        data: {
          transactionNumber,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: body.amount,
          description: body.description,
          driverId,
          processedAt: new Date(),
        },
      });

      return reply.status(201).send(transaction);
    },
  });
}
