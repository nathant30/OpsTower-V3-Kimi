/**
 * Audit Feature Module
 * Exports audit viewer components, hooks, and types
 */

// Hooks
export {
  useAuditEvents,
  useAuditEvent,
  useAuditStats,
  useExportAuditLogs,
  formatAction,
  formatResourceType,
  getActionColor,
  getActionVariant,
  formatTimestamp,
  formatFullTimestamp,
  REASON_CODES,
  type AuditEvent,
  type AuditFilter,
  type AuditPagination,
  type AuditResponse,
  type ResourceType,
  type AuditAction,
  type UserRole,
  type ChangeDiff,
  type DualControlApprover,
  type BreakGlassDetails,
} from './hooks/useAudit';

// Components
export { AuditLogTable } from './components/AuditLogTable';
export { AuditFilterPanel } from './components/AuditFilterPanel';

// Pages
export { default as AuditViewer } from './pages/AuditViewer';
