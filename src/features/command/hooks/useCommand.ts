/**
 * useCommand Hook
 * React Query hooks for Command Center functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  commandService,
  type CommandAlert,
  type ActivityItem,
  type CommandKPIs,
  type HighActivityZone,
  type SystemStatus,
  type BroadcastMessage,
  type AlertSeverity,
  type AlertStatus,
  type ActivityType,
  type SystemMode,
  generateMockKPIs,
  generateMockAlerts,
  generateMockActivityFeed,
  generateMockHighActivityZones,
  generateMockSystemStatus,
} from '@/services/command/command.service';

// ============ Query Keys ============

const commandKeys = {
  all: ['command'] as const,
  kpis: () => [...commandKeys.all, 'kpis'] as const,
  alerts: (filters?: { status?: AlertStatus; severity?: AlertSeverity }) =>
    [...commandKeys.all, 'alerts', filters] as const,
  activity: (type?: ActivityType) => [...commandKeys.all, 'activity', type] as const,
  zones: () => [...commandKeys.all, 'zones'] as const,
  systemStatus: () => [...commandKeys.all, 'systemStatus'] as const,
  broadcasts: () => [...commandKeys.all, 'broadcasts'] as const,
};

// ============ KPI Hooks ============

/**
 * Get real-time command center KPIs
 */
export function useCommandKPIs() {
  return useQuery({
    queryKey: commandKeys.kpis(),
    queryFn: async (): Promise<CommandKPIs> => {
      try {
        return await commandService.getKPIs();
      } catch {
        return generateMockKPIs();
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    placeholderData: generateMockKPIs,
  });
}

/**
 * Get metrics history for charts
 */
export function useMetricsHistory(hours: number = 24) {
  return useQuery({
    queryKey: [...commandKeys.all, 'metricsHistory', hours],
    queryFn: async () => {
      try {
        return await commandService.getMetricsHistory(hours);
      } catch {
        // Generate mock history
        return Array.from({ length: hours }, (_, i) => ({
          timestamp: new Date(Date.now() - (hours - i) * 60 * 60 * 1000).toISOString(),
          activeOrders: 120 + Math.floor(Math.random() * 50),
          onlineDrivers: 800 + Math.floor(Math.random() * 100),
          revenue: 7000 + Math.floor(Math.random() * 3000),
        }));
      }
    },
  });
}

// ============ Alert Hooks ============

/**
 * Get all alerts
 */
export function useAlerts(filters?: { status?: AlertStatus; severity?: AlertSeverity; limit?: number }) {
  return useQuery({
    queryKey: commandKeys.alerts(filters),
    queryFn: async (): Promise<CommandAlert[]> => {
      try {
        return await commandService.getAlerts(filters);
      } catch {
        return generateMockAlerts();
      }
    },
    refetchInterval: 15000,
    placeholderData: generateMockAlerts,
  });
}

/**
 * Get active critical alerts
 */
export function useCriticalAlerts() {
  return useQuery({
    queryKey: commandKeys.alerts({ status: 'active', severity: 'critical' }),
    queryFn: async (): Promise<CommandAlert[]> => {
      try {
        return await commandService.getCriticalAlerts();
      } catch {
        return generateMockAlerts().filter(a => a.severity === 'critical' && a.status === 'active');
      }
    },
    refetchInterval: 5000,
  });
}

/**
 * Acknowledge an alert
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, userId }: { alertId: string; userId: string }) =>
      commandService.acknowledgeAlert(alertId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandKeys.alerts() });
    },
  });
}

/**
 * Resolve an alert
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, resolution }: { alertId: string; resolution: string }) =>
      commandService.resolveAlert(alertId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandKeys.alerts() });
    },
  });
}

// ============ Activity Feed Hooks ============

/**
 * Get activity feed
 */
export function useActivityFeed(limit: number = 50) {
  return useQuery({
    queryKey: commandKeys.activity(),
    queryFn: async (): Promise<ActivityItem[]> => {
      try {
        return await commandService.getActivityFeed(limit);
      } catch {
        return generateMockActivityFeed();
      }
    },
    refetchInterval: 5000,
    placeholderData: generateMockActivityFeed,
  });
}

/**
 * Get activity by type
 */
export function useActivityByType(type: ActivityType, limit: number = 20) {
  return useQuery({
    queryKey: commandKeys.activity(type),
    queryFn: async (): Promise<ActivityItem[]> => {
      try {
        return await commandService.getActivityByType(type, limit);
      } catch {
        return generateMockActivityFeed().filter(a => a.type === type);
      }
    },
  });
}

// ============ Zone Hooks ============

/**
 * Get high activity zones
 */
export function useHighActivityZones() {
  return useQuery({
    queryKey: commandKeys.zones(),
    queryFn: async (): Promise<HighActivityZone[]> => {
      try {
        return await commandService.getHighActivityZones();
      } catch {
        return generateMockHighActivityZones();
      }
    },
    refetchInterval: 30000,
    placeholderData: generateMockHighActivityZones,
  });
}

// ============ System Status Hooks ============

/**
 * Get system status
 */
export function useSystemStatus() {
  return useQuery({
    queryKey: commandKeys.systemStatus(),
    queryFn: async (): Promise<SystemStatus> => {
      try {
        return await commandService.getSystemStatus();
      } catch {
        return generateMockSystemStatus();
      }
    },
    refetchInterval: 10000,
    placeholderData: generateMockSystemStatus,
  });
}

/**
 * Set system mode
 */
export function useSetSystemMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mode, reason }: { mode: SystemMode; reason?: string }) =>
      commandService.setSystemMode(mode, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandKeys.systemStatus() });
    },
  });
}

/**
 * Trigger emergency mode
 */
export function useTriggerEmergency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => commandService.triggerEmergencyMode(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandKeys.systemStatus() });
    },
  });
}

/**
 * End emergency mode
 */
export function useEndEmergency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => commandService.endEmergencyMode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandKeys.systemStatus() });
    },
  });
}

// ============ Broadcast Hooks ============

/**
 * Send broadcast message
 */
export function useSendBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { message: string; target: BroadcastMessage['target']; priority: BroadcastMessage['priority'] }) =>
      commandService.sendBroadcast(params.message, params.target, params.priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandKeys.broadcasts() });
    },
  });
}

/**
 * Get broadcast history
 */
export function useBroadcastHistory(limit: number = 20) {
  return useQuery({
    queryKey: commandKeys.broadcasts(),
    queryFn: async (): Promise<BroadcastMessage[]> => {
      try {
        return await commandService.getBroadcastHistory(limit);
      } catch {
        return [
          {
            id: 'BC-001',
            message: 'Peak hour protocol activated. All hands on deck.',
            target: 'drivers',
            priority: 'high',
            sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            sentBy: 'Operations Manager',
            recipientCount: 1250,
            acknowledgedCount: 1184,
          },
          {
            id: 'BC-002',
            message: 'System maintenance scheduled for tonight at 2 AM.',
            target: 'all',
            priority: 'medium',
            sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            sentBy: 'System Admin',
            recipientCount: 15000,
            acknowledgedCount: 4200,
          },
        ];
      }
    },
  });
}

// ============ Quick Action Hooks ============

/**
 * Auto-dispatch drivers
 */
export function useAutoDispatch() {
  return useMutation({
    mutationFn: (zoneIds?: string[]) => commandService.autoDispatch(zoneIds),
  });
}

/**
 * Call idle drivers
 */
export function useCallIdleDrivers() {
  return useMutation({
    mutationFn: (message: string) => commandService.callIdleDrivers(message),
  });
}

/**
 * Rebalance fleet
 */
export function useRebalanceFleet() {
  return useMutation({
    mutationFn: () => commandService.rebalanceFleet(),
  });
}

// ============ Combined Hook ============

/**
 * Get all command center data at once
 */
export function useCommandCenter() {
  const kpis = useCommandKPIs();
  const alerts = useAlerts();
  const criticalAlerts = useCriticalAlerts();
  const activityFeed = useActivityFeed();
  const zones = useHighActivityZones();
  const systemStatus = useSystemStatus();

  return {
    kpis,
    alerts,
    criticalAlerts,
    activityFeed,
    zones,
    systemStatus,
    isLoading:
      kpis.isLoading ||
      alerts.isLoading ||
      criticalAlerts.isLoading ||
      activityFeed.isLoading ||
      zones.isLoading ||
      systemStatus.isLoading,
  };
}

export default useCommandCenter;
