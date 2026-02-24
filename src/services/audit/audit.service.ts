/**
 * Audit Service
 * Complete audit log system for tracking all system changes
 */

import { backendApi } from '../backend.api';

export type ResourceType =
  | 'driver'
  | 'order'
  | 'booking'
  | 'payment'
  | 'incident'
  | 'shift'
  | 'vehicle'
  | 'user'
  | 'customer'
  | 'refund'
  | 'adjustment'
  | 'fare'
  | 'commission'
  | 'payout'
  | 'zone'
  | 'promo'
  | 'setting';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'reactivate'
  | 'override'
  | 'break_glass'
  | 'dual_control'
  | 'export'
  | 'login'
  | 'logout'
  | 'batch_update'
  | 'mass_action'
  | 'assign'
  | 'unassign'
  | 'verify'
  | 'cancel';

export type UserRole =
  | 'Viewer'
  | 'SupportAgent'
  | 'FinanceManager'
  | 'FleetManager'
  | 'OperationsManager'
  | 'OperationsDirector'
  | 'SuperAdmin';

export interface AuditActor {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  seat?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditResource {
  type: ResourceType;
  id: string;
  displayName?: string;
}

export interface DualControlApprover {
  userId: string;
  username: string;
  role: UserRole;
  seat?: string;
  timestamp: string;
  justification?: string;
}

export interface BreakGlassDetails {
  used: boolean;
  justification?: string;
  approvedBy?: string;
  approvalTimestamp?: string;
  emergencyContactNotified?: boolean;
}

export interface ChangeDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'modified' | 'added' | 'removed';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action: AuditAction;
  resource: AuditResource;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  changes?: ChangeDiff[];
  reasonCode?: string;
  reasonText?: string;
  success: boolean;
  errorMessage?: string;
  dualControlApprover?: DualControlApprover;
  breakGlass?: BreakGlassDetails;
  metadata?: {
    sessionId?: string;
    requestId?: string;
    apiEndpoint?: string;
    clientVersion?: string;
  };
}

export interface AuditFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  username?: string;
  role?: UserRole;
  action?: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  success?: boolean;
  searchQuery?: string;
}

export interface AuditPagination {
  page: number;
  pageSize: number;
}

export interface AuditResponse {
  events: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Reason codes mapping
export const REASON_CODES: Record<string, { label: string; category: string }> = {
  PAYMENT_DISPUTE: { label: 'Payment Dispute', category: 'Payment' },
  REFUND_REQUESTED: { label: 'Refund Request', category: 'Payment' },
  ADJUSTMENT_ERROR: { label: 'Error Correction', category: 'Data' },
  FARE_OVERRIDE: { label: 'Fare Override', category: 'Fare' },
  BONUS_ADJUSTMENT: { label: 'Bonus Adjustment', category: 'Payment' },
  DEDUCTION_REVERSAL: { label: 'Deduction Reversal', category: 'Payment' },
  DRIVER_SUSPENDED: { label: 'Driver Suspended', category: 'Driver' },
  DRIVER_REACTIVATED: { label: 'Driver Reactivated', category: 'Driver' },
  DRIVER_TERMINATED: { label: 'Driver Terminated', category: 'Driver' },
  DRIVER_WARNING: { label: 'Driver Warning', category: 'Driver' },
  RATING_ADJUSTMENT: { label: 'Rating Adjustment', category: 'Driver' },
  EMERGENCY_OVERRIDE: { label: 'Emergency Override', category: 'Emergency' },
  SAFETY_CONCERN: { label: 'Safety Concern', category: 'Safety' },
  ACCIDENT_RESPONSE: { label: 'Accident Response', category: 'Safety' },
  SECURITY_INCIDENT: { label: 'Security Incident', category: 'Security' },
  REGULATORY_COMPLIANCE: { label: 'Regulatory Compliance', category: 'Compliance' },
  AUDIT_REQUEST: { label: 'Audit Request', category: 'Audit' },
  DATA_CORRECTION: { label: 'Data Correction', category: 'Data' },
  MANUAL_CORRECTION: { label: 'Manual Correction', category: 'Data' },
  BULK_UPDATE: { label: 'Bulk Update', category: 'Data' },
  SYSTEM_MIGRATION: { label: 'System Migration', category: 'System' },
  TEST_DATA: { label: 'Test Data', category: 'System' },
  POLICY_OVERRIDE: { label: 'Policy Override', category: 'Policy' },
  SPECIAL_EXCEPTION: { label: 'Special Exception', category: 'Policy' },
  CUSTOMER_REQUEST: { label: 'Customer Request', category: 'Support' },
  DRIVER_REQUEST: { label: 'Driver Request', category: 'Support' },
  FRAUD_DETECTED: { label: 'Fraud Detected', category: 'Security' },
  TRUST_SCORE_ADJUSTMENT: { label: 'Trust Score Adjustment', category: 'Driver' },
  INCIDENT_RESOLUTION: { label: 'Incident Resolution', category: 'Incident' },
  SHIFT_CHANGE: { label: 'Shift Change', category: 'Shift' },
  VEHICLE_MAINTENANCE: { label: 'Vehicle Maintenance', category: 'Vehicle' },
};

// Mock audit events for development
const generateMockAuditEvents = (): AuditEvent[] => {
  const events: AuditEvent[] = [];
  const actors: AuditActor[] = [
    { userId: 'USR-001', username: 'admin.santos', email: 'santos@opstower.com', role: 'OperationsManager', seat: 'OPS-001' },
    { userId: 'USR-002', username: 'ops.martinez', email: 'martinez@opstower.com', role: 'SupportAgent', seat: 'OPS-002' },
    { userId: 'USR-003', username: 'finance.lopez', email: 'lopez@opstower.com', role: 'FinanceManager', seat: 'FIN-001' },
    { userId: 'USR-004', username: 'finance.garcia', email: 'garcia@opstower.com', role: 'OperationsDirector', seat: 'FIN-002' },
    { userId: 'USR-005', username: 'ops.reyes', email: 'reyes@opstower.com', role: 'SupportAgent', seat: 'OPS-003' },
    { userId: 'USR-006', username: 'fleet.cruz', email: 'cruz@opstower.com', role: 'FleetManager', seat: 'FLT-001' },
    { userId: 'USR-007', username: 'admin.flores', email: 'flores@opstower.com', role: 'SuperAdmin', seat: 'ADM-001' },
    { userId: 'USR-008', username: 'viewer.tan', email: 'tan@opstower.com', role: 'Viewer', seat: 'VWR-001' },
  ];

  const resources: AuditResource[] = [
    { type: 'driver', id: 'DRV-001', displayName: 'Juan Santos' },
    { type: 'driver', id: 'DRV-002', displayName: 'Maria Cruz' },
    { type: 'order', id: 'ORD-1234', displayName: 'Order #1234' },
    { type: 'order', id: 'ORD-5678', displayName: 'Order #5678' },
    { type: 'payment', id: 'PAY-9876', displayName: 'Payment #9876' },
    { type: 'refund', id: 'REF-5678', displayName: 'Refund Request #5678' },
    { type: 'vehicle', id: 'VEH-0123', displayName: 'Toyota Vios ABC-123' },
    { type: 'incident', id: 'INC-001', displayName: 'Incident Report #001' },
    { type: 'user', id: 'USR-009', displayName: 'New User Account' },
    { type: 'shift', id: 'SHF-001', displayName: 'Morning Shift 2026-02-17' },
    { type: 'fare', id: 'FAR-001', displayName: 'Fare Adjustment #001' },
    { type: 'payout', id: 'PAY-OUT-001', displayName: 'Driver Payout #001' },
  ];

  const actions: AuditAction[] = ['create', 'update', 'delete', 'approve', 'break_glass', 'dual_control', 'suspend', 'reactivate', 'view'];

  // Generate events for the last 7 days
  for (let i = 0; i < 50; i++) {
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const success = Math.random() > 0.1; // 90% success rate
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    const event: AuditEvent = {
      id: `AUD-${String(i + 1).padStart(3, '0')}`,
      timestamp: timestamp.toISOString(),
      actor,
      action,
      resource,
      success,
      reasonCode: Object.keys(REASON_CODES)[Math.floor(Math.random() * Object.keys(REASON_CODES).length)],
      reasonText: 'Action performed as per standard operating procedure',
      metadata: {
        sessionId: `SES-${Math.random().toString(36).substr(2, 9)}`,
        requestId: `REQ-${Math.random().toString(36).substr(2, 9)}`,
        apiEndpoint: `/api/${resource.type}/${action}`,
        clientVersion: '2.1.0',
      },
    };

    // Add state changes for update actions
    if (action === 'update' || action === 'approve') {
      event.beforeState = { status: 'pending', updatedAt: timestamp.toISOString() };
      event.afterState = { status: 'approved', updatedAt: new Date().toISOString(), approvedBy: actor.username };
      event.changes = [
        { field: 'status', oldValue: 'pending', newValue: 'approved', changeType: 'modified' },
        { field: 'approvedBy', oldValue: null, newValue: actor.username, changeType: 'added' },
      ];
    }

    // Add break glass for some events
    if (action === 'break_glass' || (action === 'override' && Math.random() > 0.5)) {
      event.breakGlass = {
        used: true,
        justification: 'Emergency override required for customer safety',
        approvedBy: 'supervisor.chen',
        approvalTimestamp: new Date(timestamp.getTime() + 60000).toISOString(),
        emergencyContactNotified: true,
      };
    }

    // Add dual control for sensitive actions
    if (['approve', 'suspend', 'delete'].includes(action) && resource.type === 'payment' && Math.random() > 0.5) {
      const approver = actors.find(a => a.role === 'OperationsDirector') || actors[0];
      event.dualControlApprover = {
        userId: approver.userId,
        username: approver.username,
        role: approver.role,
        seat: approver.seat,
        timestamp: new Date(timestamp.getTime() + 120000).toISOString(),
        justification: 'Verified and approved per financial policy',
      };
    }

    // Add error message for failed actions
    if (!success) {
      event.errorMessage = 'Insufficient permissions for this operation';
    }

    events.push(event);
  }

  // Sort by timestamp descending
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const mockAuditEvents = generateMockAuditEvents();

// Calculate changes between before and after states
function calculateChanges(before?: Record<string, unknown>, after?: Record<string, unknown>): ChangeDiff[] {
  if (!before || !after) return [];
  
  const changes: ChangeDiff[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  allKeys.forEach((key) => {
    const oldValue = before[key];
    const newValue = after[key];
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      let changeType: ChangeDiff['changeType'] = 'modified';
      if (oldValue === undefined) changeType = 'added';
      else if (newValue === undefined) changeType = 'removed';
      
      changes.push({ field: key, oldValue, newValue, changeType });
    }
  });
  
  return changes;
}

export const auditService = {
  async getAuditEvents(
    filters: AuditFilter = {},
    pagination: AuditPagination = { page: 1, pageSize: 20 }
  ): Promise<AuditResponse> {
    try {
      // In production: return await backendApi.get('/api/audit/events', { ...filters, ...pagination });
      
      let filtered = [...mockAuditEvents];

      // Apply filters
      if (filters.startDate) {
        filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filters.endDate!));
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.actor.userId === filters.userId);
      }
      if (filters.username) {
        filtered = filtered.filter(e => 
          e.actor.username.toLowerCase().includes(filters.username!.toLowerCase())
        );
      }
      if (filters.role) {
        filtered = filtered.filter(e => e.actor.role === filters.role);
      }
      if (filters.action) {
        filtered = filtered.filter(e => e.action === filters.action);
      }
      if (filters.resourceType) {
        filtered = filtered.filter(e => e.resource.type === filters.resourceType);
      }
      if (filters.resourceId) {
        filtered = filtered.filter(e => e.resource.id === filters.resourceId);
      }
      if (filters.success !== undefined) {
        filtered = filtered.filter(e => e.success === filters.success);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(e =>
          e.id.toLowerCase().includes(query) ||
          e.actor.username.toLowerCase().includes(query) ||
          e.resource.id.toLowerCase().includes(query) ||
          e.resource.displayName?.toLowerCase().includes(query) ||
          e.action.toLowerCase().includes(query)
        );
      }

      // Calculate pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / pagination.pageSize);
      const start = (pagination.page - 1) * pagination.pageSize;
      const paginatedEvents = filtered.slice(start, start + pagination.pageSize);

      // Calculate changes for each event
      paginatedEvents.forEach(event => {
        if (event.beforeState && event.afterState && !event.changes) {
          event.changes = calculateChanges(event.beforeState, event.afterState);
        }
      });

      return {
        events: paginatedEvents,
        total,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
      throw error;
    }
  },

  async getAuditEventById(id: string): Promise<AuditEvent | null> {
    try {
      // return await backendApi.get(`/api/audit/events/${id}`);
      const event = mockAuditEvents.find(e => e.id === id);
      if (event && event.beforeState && event.afterState && !event.changes) {
        event.changes = calculateChanges(event.beforeState, event.afterState);
      }
      return event || null;
    } catch (error) {
      console.error('Failed to fetch audit event:', error);
      return null;
    }
  },

  async exportAuditLogs(
    filters: AuditFilter,
    format: 'csv' | 'pdf' | 'json'
  ): Promise<{ url: string; filename: string }> {
    try {
      // In production: return await backendApi.post('/api/audit/export', { filters, format });
      
      // Simulate export
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-log-${timestamp}.${format}`;
      
      // Create a blob URL for the mock export
      const blob = new Blob(['Mock audit export data'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      return { url, filename };
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  },

  async getAuditStats(timeRange: '24h' | '7d' | '30d' | '90d' = '7d') {
    try {
      // return await backendApi.get('/api/audit/stats', { timeRange });
      
      const now = Date.now();
      const ranges = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
      const days = ranges[timeRange];
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      
      const filtered = mockAuditEvents.filter(e => new Date(e.timestamp).getTime() >= cutoff);
      
      return {
        totalEvents: filtered.length,
        successfulActions: filtered.filter(e => e.success).length,
        failedActions: filtered.filter(e => !e.success).length,
        breakGlassUsed: filtered.filter(e => e.breakGlass?.used).length,
        dualControlActions: filtered.filter(e => e.dualControlApprover).length,
        actionsByType: filtered.reduce((acc, e) => {
          acc[e.action] = (acc[e.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        eventsByDay: filtered.reduce((acc, e) => {
          const date = e.timestamp.split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
      throw error;
    }
  },

  async getRealtimeAuditStream(): Promise<ReadableStream | null> {
    try {
      // In production, this would establish a WebSocket or SSE connection
      // return await backendApi.getStream('/api/audit/stream');
      return null;
    } catch (error) {
      console.error('Failed to establish audit stream:', error);
      return null;
    }
  },
};

export default auditService;
