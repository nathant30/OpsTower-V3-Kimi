// src/config/constants.ts
// Application constants

export const PAGINATION = {
  defaultPage: 1,
  defaultPerPage: 20,
  maxPerPage: 100,
};

export const SHIFT_TYPES = {
  AM: 'AM',
  PM: 'PM',
} as const;

export const DRIVER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  TRAINING: 'TRAINING',
  PROBATION: 'PROBATION',
  INACTIVE: 'INACTIVE',
  TERMINATED: 'TERMINATED',
} as const;

export const SERVICE_SEGMENTS = {
  FOUR_W_TNVS: '4W-TNVS',
  TWO_W_TWG: '2W-TWG',
  TWO_W_SAL: '2W-SAL',
  FOUR_W_SAL: '4W-SAL',
} as const;

export const INCIDENT_STATUS = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  PENDING_DOCUMENTATION: 'PENDING_DOCUMENTATION',
  AUDIT_FAIL: 'AUDIT_FAIL',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED',
} as const;

export const BOND_TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  DEDUCTION: 'DEDUCTION',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

export default {
  PAGINATION,
  SHIFT_TYPES,
  DRIVER_STATUS,
  SERVICE_SEGMENTS,
  INCIDENT_STATUS,
  BOND_TRANSACTION_TYPES,
};
