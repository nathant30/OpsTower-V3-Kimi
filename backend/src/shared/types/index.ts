// Shared types for OpsTower V2
// These types are used across multiple services

// ============================================================================
// GPS & Location Types
// ============================================================================

export interface GPSData {
  lat: number;
  lng: number;
  speedKph: number;
  heading?: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracyMeters?: number;
}

export interface DashcamData {
  isObstructed: boolean;
  isRecording: boolean;
  lastHeartbeat?: Date;
}

// ============================================================================
// Integrity Check Types
// ============================================================================

export interface IntegrityCheckResult {
  triggered: boolean;
  incidentId?: string;
  reason?: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// Enum Mappings
// ============================================================================

export const ShiftTypeMap = {
  AM: 'AM',
  PM: 'PM',
  NIGHT: 'NIGHT'
} as const;

export const TransactionTypeMap = {
  ORDER: 'ORDER',
  TOPUP: 'TOPUP',
  WITHDRAWAL: 'WITHDRAWAL',
  FEE: 'FEE'
} as const;

export const TransactionStatusMap = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

export const IncidentStatusMap = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  PENDING_DOCUMENTATION: 'PENDING_DOCUMENTATION',
  AUDIT_FAIL: 'AUDIT_FAIL',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED'
} as const;

export const DriverStatusMap = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  TRAINING: 'TRAINING',
  PROBATION: 'PROBATION',
  INACTIVE: 'INACTIVE',
  TERMINATED: 'TERMINATED'
} as const;

export const ServiceSegmentMap = {
  '4W-TNVS': 'FOUR_W_TNVS',
  '2W-TWG': 'TWO_W_TWG',
  '2W-SAL': 'TWO_W_SAL',
  '4W-SAL': 'FOUR_W_SAL'
} as const;

export type ServiceSegmentLiteral = '4W-TNVS' | '2W-TWG' | '2W-SAL' | '4W-SAL';
