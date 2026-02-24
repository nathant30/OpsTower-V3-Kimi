/**
 * Audit Hooks
 * React Query hooks for audit log system
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  auditService,
  type AuditEvent,
  type AuditFilter,
  type AuditPagination,
  type AuditResponse,
  type ResourceType,
  type AuditAction,
  type UserRole,
  REASON_CODES,
} from '@/services/audit/audit.service';

// Query keys
const auditKeys = {
  all: ['audit'] as const,
  events: (filters?: AuditFilter, pagination?: AuditPagination) => 
    [...auditKeys.all, 'events', filters, pagination] as const,
  event: (id: string) => [...auditKeys.all, 'event', id] as const,
  stats: (timeRange?: string) => [...auditKeys.all, 'stats', timeRange] as const,
  stream: () => [...auditKeys.all, 'stream'] as const,
};

// Get audit events with filters and pagination
export function useAuditEvents(
  filters: AuditFilter = {},
  pagination: AuditPagination = { page: 1, pageSize: 20 }
) {
  return useQuery({
    queryKey: auditKeys.events(filters, pagination),
    queryFn: async (): Promise<AuditResponse> => {
      return await auditService.getAuditEvents(filters, pagination);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    placeholderData: (previousData) => previousData,
  });
}

// Get a single audit event by ID
export function useAuditEvent(id: string | undefined) {
  return useQuery({
    queryKey: auditKeys.event(id || ''),
    queryFn: async (): Promise<AuditEvent | null> => {
      if (!id) return null;
      return await auditService.getAuditEventById(id);
    },
    enabled: !!id,
  });
}

// Get audit statistics
export function useAuditStats(timeRange: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: auditKeys.stats(timeRange),
    queryFn: async () => {
      return await auditService.getAuditStats(timeRange);
    },
    refetchInterval: 60000,
  });
}

// Export audit logs mutation
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async ({ filters, format }: { filters: AuditFilter; format: 'csv' | 'pdf' | 'json' }) => {
      const result = await auditService.exportAuditLogs(filters, format);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return result;
    },
  });
}

// Helper function to format action for display
export function formatAction(action: AuditAction): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to format resource type for display
export function formatResourceType(type: ResourceType): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get action color
export function getActionColor(action: AuditAction): string {
  const colors: Record<AuditAction, string> = {
    create: 'text-green-400',
    update: 'text-blue-400',
    delete: 'text-red-400',
    view: 'text-gray-400',
    approve: 'text-green-400',
    reject: 'text-orange-400',
    suspend: 'text-red-400',
    reactivate: 'text-green-400',
    override: 'text-purple-400',
    break_glass: 'text-red-500',
    dual_control: 'text-yellow-400',
    export: 'text-cyan-400',
    login: 'text-gray-400',
    logout: 'text-gray-400',
    batch_update: 'text-blue-400',
    mass_action: 'text-blue-400',
    assign: 'text-green-400',
    unassign: 'text-orange-400',
    verify: 'text-green-400',
    cancel: 'text-red-400',
  };
  return colors[action] || 'text-gray-400';
}

// Helper function to get action badge variant
export function getActionVariant(action: AuditAction, success: boolean): 'default' | 'active' | 'warning' | 'alert' | 'success' | 'idle' | 'offline' | 'busy' {
  if (!success) return 'alert';
  
  const variants: Record<AuditAction, 'default' | 'active' | 'warning' | 'alert' | 'success'> = {
    create: 'active',
    update: 'warning',
    delete: 'alert',
    view: 'default',
    approve: 'active',
    reject: 'warning',
    suspend: 'alert',
    reactivate: 'active',
    override: 'alert',
    break_glass: 'alert',
    dual_control: 'warning',
    export: 'default',
    login: 'default',
    logout: 'default',
    batch_update: 'warning',
    mass_action: 'warning',
    assign: 'active',
    unassign: 'warning',
    verify: 'active',
    cancel: 'alert',
  };
  return variants[action] || 'default';
}

// Helper function to format timestamp
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  // Less than 1 hour
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  }
  // Less than 24 hours
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  }
  // Less than 7 days
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}d ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Helper function to format full timestamp
export function formatFullTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Export types and constants
export { REASON_CODES };
export type { AuditEvent, AuditFilter, AuditPagination, AuditResponse, ResourceType, AuditAction, UserRole };

// Export additional audit types
export type { ChangeDiff, DualControlApprover, BreakGlassDetails } from '@/services/audit/audit.service';
