// src/services/bond.service.ts
// Bond/Commerce Service - Driver bonds and transactions

import { BondTransaction, BondTransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../models/db.js';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const BOND_CONSTANTS = {
  MIN_BOND_2W: 5000,      // ₱5,000 for 2-wheelers
  MIN_BOND_4W: 10000,     // ₱10,000 for 4-wheelers
  DEDUCTIBLE_ACCIDENT: 1000,     // ₱1,000 for accidents
  DEDUCTIBLE_NOSHOW: 500,        // ₱500 for no-show
  BURN_ALERT_THRESHOLD: 20,      // Alert when bond is below 20% of required
};

// ============================================================================
// TYPES
// ============================================================================

export interface CreateTransactionInput {
  driverId: string;
  type: BondTransactionType;
  amount: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  performedById?: string;
}

export interface BondBalance {
  balance: number;
  required: number;
  percent: number;
  serviceSegment: string;
}

export interface BondSufficiency {
  canStartShift: boolean;
  balance: number;
  required: number;
  shortfall: number;
}

export interface BondBurnAlert {
  isActive: boolean;
  percent: number;
  threshold: number;
}

export interface TransactionFilters {
  driverId?: string;
  type?: BondTransactionType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateBondTransactionInput {
  driverId: string;
  type: BondTransactionType;
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  createdById: string;
}

export interface CreateBondDeductionInput {
  driverId: string;
  amount: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  createdById: string;
}

// ============================================================================
// BALANCE OPERATIONS
// ============================================================================

/**
 * Get driver's current bond balance
 */
export async function getBondBalance(driverId: string): Promise<BondBalance> {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      currentAsset: true,
    },
  });

  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  // Calculate current balance from security bond fields
  const balance = driver.securityBondBalance.toNumber();
  const required = driver.securityBondRequired.toNumber();
  const percent = required > 0 ? Math.round((balance / required) * 100) : 100;

  return {
    balance,
    required,
    percent,
    serviceSegment: driver.serviceSegment,
  };
}

/**
 * Check if driver can start shift (bond lock)
 */
export async function canStartShift(driverId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const balance = await getBondBalance(driverId);

  if (balance.percent < 100) {
    return {
      allowed: false,
      reason: `Insufficient bond balance. Current: ₱${balance.balance}, Required: ₱${balance.required}`,
    };
  }

  return { allowed: true };
}

/**
 * Check bond sufficiency for shift start
 */
export async function checkBondSufficiency(driverId: string): Promise<BondSufficiency> {
  const balance = await getBondBalance(driverId);
  
  return {
    canStartShift: balance.percent >= 100,
    balance: balance.balance,
    required: balance.required,
    shortfall: Math.max(0, balance.required - balance.balance),
  };
}

/**
 * Check if bond burn alert should be triggered
 */
export async function checkBondBurnAlert(driverId: string): Promise<BondBurnAlert> {
  const balance = await getBondBalance(driverId);
  
  return {
    isActive: balance.percent < BOND_CONSTANTS.BURN_ALERT_THRESHOLD,
    percent: balance.percent,
    threshold: BOND_CONSTANTS.BURN_ALERT_THRESHOLD,
  };
}

/**
 * Check if driver is in bond lockdown
 */
export async function checkBondLockdown(driverId: string): Promise<boolean> {
  const sufficiency = await checkBondSufficiency(driverId);
  return !sufficiency.canStartShift;
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Create a bond transaction
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<BondTransaction> {
  const driver = await prisma.driver.findUnique({
    where: { id: input.driverId },
  });

  if (!driver) {
    throw new NotFoundError(`Driver not found: ${input.driverId}`);
  }

  // Validate amount
  if (input.amount <= 0) {
    throw new ValidationError('Amount must be greater than 0');
  }

  // For deductions, check balance
  if (input.type === 'DEDUCTION') {
    const balance = await getBondBalance(input.driverId);
    
    if (balance.balance < input.amount) {
      throw new ValidationError(
        `Insufficient balance. Current: ₱${balance.balance}, Requested: ₱${input.amount}`
      );
    }
  }

  // Calculate new balance
  const currentBalance = driver.securityBondBalance.toNumber();
  const balanceChange = input.type === 'DEPOSIT' ? input.amount : -input.amount;
  const newBalance = currentBalance + balanceChange;

  // Create transaction
  const transaction = await prisma.bondTransaction.create({
    data: {
      driverId: input.driverId,
      transactionType: input.type,
      amount: new Decimal(input.amount),
      balanceAfter: new Decimal(newBalance),
      referenceId: input.referenceId,
      referenceType: input.referenceType,
      description: input.notes,
      createdById: input.performedById,
    },
  });

  // Update driver's bond balance
  await prisma.driver.update({
    where: { id: input.driverId },
    data: {
      securityBondBalance: new Decimal(newBalance),
    },
  });

  return transaction;
}

/**
 * Add bond transaction (wrapper for routes)
 */
export async function addBondTransaction(
  input: CreateBondTransactionInput
): Promise<BondTransaction> {
  return createTransaction({
    driverId: input.driverId,
    type: input.type,
    amount: input.amount,
    referenceId: input.referenceId,
    referenceType: input.referenceType,
    notes: input.description,
    performedById: input.createdById,
  });
}

/**
 * Create bond deduction (wrapper for routes)
 */
export async function createBondDeduction(
  input: CreateBondDeductionInput
): Promise<BondTransaction> {
  return createTransaction({
    driverId: input.driverId,
    type: 'DEDUCTION',
    amount: input.amount,
    referenceId: input.referenceId,
    referenceType: input.referenceType || 'MANUAL',
    notes: input.reason,
    performedById: input.createdById,
  });
}

/**
 * List bond transactions
 */
export async function listTransactions(
  filters: TransactionFilters,
  page: number = 1,
  limit: number = 20
) {
  const where: any = {};

  if (filters.driverId) where.driverId = filters.driverId;
  if (filters.type) where.transactionType = filters.type;
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  const [transactions, total] = await Promise.all([
    prisma.bondTransaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    }),
    prisma.bondTransaction.count({ where }),
  ]);

  return {
    data: transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get transaction history for a driver
 */
export async function getDriverTransactionHistory(
  driverId: string,
  page: number = 1,
  limit: number = 20
) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new NotFoundError(`Driver not found: ${driverId}`);
  }

  return listTransactions({ driverId }, page, limit);
}

/**
 * Get bond transaction history (alias for routes)
 */
export async function getBondTransactionHistory(
  driverId: string,
  pagination: { page: number; perPage: number }
) {
  return getDriverTransactionHistory(driverId, pagination.page, pagination.perPage);
}

// ============================================================================
// DEDUCTIONS
// ============================================================================

/**
 * Process incident deduction
 */
export async function processIncidentDeduction(
  driverId: string,
  incidentId: string,
  incidentType: string,
  performedById?: string
): Promise<BondTransaction | null> {
  // Calculate deduction amount
  let amount = 0;
  
  switch (incidentType) {
    case 'ACCIDENT':
      amount = BOND_CONSTANTS.DEDUCTIBLE_ACCIDENT;
      break;
    case 'NO_SHOW':
      amount = BOND_CONSTANTS.DEDUCTIBLE_NOSHOW;
      break;
    default:
      return null; // No deduction for other types
  }

  // Check if deduction already exists for this incident
  const existingDeduction = await prisma.bondTransaction.findFirst({
    where: {
      driverId,
      referenceId: incidentId,
      referenceType: 'INCIDENT',
    },
  });

  if (existingDeduction) {
    throw new ConflictError('Deduction already processed for this incident');
  }

  // Create deduction transaction
  const transaction = await createTransaction({
    driverId,
    type: 'DEDUCTION',
    amount,
    referenceId: incidentId,
    referenceType: 'INCIDENT',
    notes: `Deduction for ${incidentType}`,
    performedById,
  });

  return transaction;
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const bondService = {
  getBondBalance,
  getBalance: getBondBalance,
  canStartShift,
  checkBondSufficiency,
  checkBondBurnAlert,
  checkBondLockdown,
  createTransaction,
  addBondTransaction,
  createBondDeduction,
  listTransactions,
  getDriverTransactionHistory,
  getBondTransactionHistory,
  processIncidentDeduction,
  constants: BOND_CONSTANTS,
};

export default bondService;
