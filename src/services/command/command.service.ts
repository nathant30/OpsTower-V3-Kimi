/**
 * Command Service
 * Manages command center operations, alerts, activity feed, and system controls
 */

import { apiClient } from '@/lib/api/client';

// ============ Types ============

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type ActivityType = 'order' | 'incident' | 'driver' | 'system' | 'alert';
export type SystemMode = 'normal' | 'emergency' | 'maintenance';

export interface CommandAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    type: 'driver' | 'customer' | 'system' | 'admin';
  };
  metadata?: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high';
}

export interface CommandKPIs {
  activeOrders: number;
  activeOrdersChange: number;
  onlineDrivers: number;
  onlineDriversChange: number;
  pendingIssues: number;
  pendingIssuesChange: number;
  revenueToday: number;
  revenueTodayChange: number;
  fleetUtilization: number;
  systemHealth: number;
  avgResponseTime: number;
}

export interface HighActivityZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  activeOrders: number;
  availableDrivers: number;
  recommendedAction?: string;
}

export interface SystemStatus {
  mode: SystemMode;
  health: number;
  uptime: string;
  lastIncident?: string;
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
  }>;
}

export interface BroadcastMessage {
  id: string;
  message: string;
  target: 'all' | 'drivers' | 'customers' | 'operations';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentAt: string;
  sentBy: string;
  recipientCount: number;
  acknowledgedCount: number;
}

// ============ Command Service ============

export const commandService = {
  // ============ KPIs ============

  /**
   * Get real-time command center KPIs
   */
  async getKPIs(): Promise<CommandKPIs> {
    return apiClient.get('api/command/kpis');
  },

  /**
   * Get command center metrics history
   */
  async getMetricsHistory(hours: number = 24): Promise<
    Array<{
      timestamp: string;
      activeOrders: number;
      onlineDrivers: number;
      revenue: number;
    }>
  > {
    const response = await apiClient.get<{
      data: Array<{
        timestamp: string;
        activeOrders: number;
        onlineDrivers: number;
        revenue: number;
      }>;
    }>(`api/command/metrics/history?hours=${hours}`);
    return response.data;
  },

  // ============ Alerts ============

  /**
   * Get all alerts with optional filtering
   */
  async getAlerts(params?: {
    status?: AlertStatus;
    severity?: AlertSeverity;
    limit?: number;
  }): Promise<CommandAlert[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<{ alerts: CommandAlert[] }>(
      `api/command/alerts?${queryParams.toString()}`
    );
    return response.alerts;
  },

  /**
   * Get critical alerts requiring immediate attention
   */
  async getCriticalAlerts(): Promise<CommandAlert[]> {
    return this.getAlerts({ status: 'active', severity: 'critical', limit: 10 });
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await apiClient.post(`api/command/alerts/${alertId}/acknowledge`, { userId });
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    await apiClient.post(`api/command/alerts/${alertId}/resolve`, { resolution });
  },

  /**
   * Create a new alert
   */
  async createAlert(alert: Omit<CommandAlert, 'id' | 'createdAt'>): Promise<CommandAlert> {
    return apiClient.post('api/command/alerts', alert);
  },

  // ============ Activity Feed ============

  /**
   * Get recent activity feed
   */
  async getActivityFeed(limit: number = 50): Promise<ActivityItem[]> {
    const response = await apiClient.get<{ activities: ActivityItem[] }>(
      `api/command/activity?limit=${limit}`
    );
    return response.activities;
  },

  /**
   * Get activity feed by type
   */
  async getActivityByType(type: ActivityType, limit: number = 20): Promise<ActivityItem[]> {
    const response = await apiClient.get<{ activities: ActivityItem[] }>(
      `api/command/activity?type=${type}&limit=${limit}`
    );
    return response.activities;
  },

  // ============ High Activity Zones ============

  /**
   * Get high activity zones for mini maps
   */
  async getHighActivityZones(): Promise<HighActivityZone[]> {
    const response = await apiClient.get<{ zones: HighActivityZone[] }>('api/command/zones/high-activity');
    return response.zones;
  },

  /**
   * Get zone recommendations
   */
  async getZoneRecommendations(zoneId: string): Promise<string[]> {
    const response = await apiClient.get<{ recommendations: string[] }>(
      `api/command/zones/${zoneId}/recommendations`
    );
    return response.recommendations;
  },

  // ============ System Controls ============

  /**
   * Get current system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    return apiClient.get('api/command/system/status');
  },

  /**
   * Set system mode (normal, emergency, maintenance)
   */
  async setSystemMode(mode: SystemMode, reason?: string): Promise<void> {
    await apiClient.post('api/command/system/mode', { mode, reason });
  },

  /**
   * Trigger emergency mode
   */
  async triggerEmergencyMode(reason: string): Promise<void> {
    await this.setSystemMode('emergency', reason);
  },

  /**
   * End emergency mode
   */
  async endEmergencyMode(): Promise<void> {
    await this.setSystemMode('normal', 'Emergency mode manually ended');
  },

  /**
   * Start system maintenance
   */
  async startMaintenance(message: string, durationMinutes: number): Promise<void> {
    await apiClient.post('api/command/system/maintenance', { message, durationMinutes });
  },

  /**
   * End system maintenance
   */
  async endMaintenance(): Promise<void> {
    await apiClient.post('api/command/system/maintenance/end', {});
  },

  // ============ Broadcast Messages ============

  /**
   * Send broadcast message
   */
  async sendBroadcast(
    message: string,
    target: BroadcastMessage['target'],
    priority: BroadcastMessage['priority']
  ): Promise<BroadcastMessage> {
    return apiClient.post('api/command/broadcast', { message, target, priority });
  },

  /**
   * Get broadcast history
   */
  async getBroadcastHistory(limit: number = 20): Promise<BroadcastMessage[]> {
    const response = await apiClient.get<{ broadcasts: BroadcastMessage[] }>(
      `api/command/broadcast/history?limit=${limit}`
    );
    return response.broadcasts;
  },

  /**
   * Get broadcast statistics
   */
  async getBroadcastStats(): Promise<{
    totalSent: number;
    acknowledgedRate: number;
    averageResponseTime: number;
  }> {
    return apiClient.get('api/command/broadcast/stats');
  },

  // ============ Quick Actions ============

  /**
   * Auto-dispatch drivers to high demand areas
   */
  async autoDispatch(zoneIds?: string[]): Promise<{ dispatched: number; message: string }> {
    return apiClient.post('api/command/actions/auto-dispatch', { zoneIds });
  },

  /**
   * Call all idle drivers
   */
  async callIdleDrivers(message: string): Promise<{ contacted: number }> {
    return apiClient.post('api/command/actions/call-idle', { message });
  },

  /**
   * Rebalance fleet across zones
   */
  async rebalanceFleet(): Promise<{ rebalanced: number; message: string }> {
    return apiClient.post('api/command/actions/rebalance', {});
  },
};

// ============ Mock Data Generators ============

export function generateMockKPIs(): CommandKPIs {
  return {
    activeOrders: 156,
    activeOrdersChange: 12.5,
    onlineDrivers: 847,
    onlineDriversChange: 8.3,
    pendingIssues: 23,
    pendingIssuesChange: -15.2,
    revenueToday: 182450,
    revenueTodayChange: 23.8,
    fleetUtilization: 78,
    systemHealth: 96,
    avgResponseTime: 3.2,
  };
}

export function generateMockAlerts(): CommandAlert[] {
  return [
    {
      id: 'ALT-001',
      title: 'Driver Shortage in Makati CBD',
      message: 'High demand detected with only 12 available drivers in the area. Consider activating standby drivers.',
      severity: 'critical',
      status: 'active',
      source: 'Demand Forecasting',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'ALT-002',
      title: 'Payment Gateway Latency',
      message: 'GCash payment processing experiencing delays of 8-12 seconds.',
      severity: 'warning',
      status: 'active',
      source: 'Payment Service',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'ALT-003',
      title: 'Vehicle Breakdown Reported',
      message: 'Driver Juan Santos (DRV-001) reported vehicle breakdown on EDSA.',
      severity: 'warning',
      status: 'acknowledged',
      source: 'Driver App',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      assignedTo: 'Fleet Manager',
    },
    {
      id: 'ALT-004',
      title: 'Peak Hour Surge Activated',
      message: '2.5x surge pricing activated for BGC and Ortigas areas.',
      severity: 'info',
      status: 'resolved',
      source: 'Pricing Engine',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'ALT-005',
      title: 'Customer Complaint Escalation',
      message: 'High-priority complaint regarding driver behavior requires review.',
      severity: 'critical',
      status: 'active',
      source: 'Support System',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ];
}

export function generateMockActivityFeed(): ActivityItem[] {
  return [
    {
      id: 'ACT-001',
      type: 'order',
      title: 'New Order Created',
      description: 'Order #ORD-7891 created for ₱285 - Taxi service from Makati to BGC',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      actor: { id: 'CUST-123', name: 'John Dela Cruz', type: 'customer' },
      priority: 'medium',
    },
    {
      id: 'ACT-002',
      type: 'driver',
      title: 'Driver Gone Online',
      description: 'Maria Santos is now online and accepting rides in Quezon City',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      actor: { id: 'DRV-042', name: 'Maria Santos', type: 'driver' },
      priority: 'low',
    },
    {
      id: 'ACT-003',
      type: 'incident',
      title: 'Incident Reported',
      description: 'Minor collision reported by driver on C5 Road. No injuries.',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      actor: { id: 'DRV-018', name: 'Pedro Reyes', type: 'driver' },
      priority: 'high',
    },
    {
      id: 'ACT-004',
      type: 'system',
      title: 'Auto-Dispatch Executed',
      description: 'System automatically dispatched 15 drivers to high-demand zones',
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      actor: { id: 'SYSTEM', name: 'System', type: 'system' },
      priority: 'medium',
    },
    {
      id: 'ACT-005',
      type: 'order',
      title: 'Order Completed',
      description: 'Order #ORD-7885 completed successfully. Rating: 5 stars',
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      actor: { id: 'DRV-031', name: 'Ana Lopez', type: 'driver' },
      priority: 'low',
    },
    {
      id: 'ACT-006',
      type: 'alert',
      title: 'High Demand Alert',
      description: 'BGC area experiencing 3x normal demand. Surge pricing activated.',
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      actor: { id: 'SYSTEM', name: 'Demand Monitor', type: 'system' },
      priority: 'high',
    },
    {
      id: 'ACT-007',
      type: 'driver',
      title: 'Driver Completed Shift',
      description: 'Carlos Mendez completed 8-hour shift with 14 trips',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      actor: { id: 'DRV-056', name: 'Carlos Mendez', type: 'driver' },
      metadata: { trips: 14, earnings: 2840 },
      priority: 'low',
    },
    {
      id: 'ACT-008',
      type: 'system',
      title: 'Scheduled Maintenance Completed',
      description: 'Database optimization maintenance completed successfully',
      timestamp: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
      actor: { id: 'SYSTEM', name: 'System', type: 'system' },
      priority: 'medium',
    },
  ];
}

export function generateMockHighActivityZones(): HighActivityZone[] {
  return [
    {
      id: 'ZONE-001',
      name: 'Makati CBD',
      lat: 14.5547,
      lng: 121.0244,
      demandLevel: 'critical',
      activeOrders: 47,
      availableDrivers: 12,
      recommendedAction: 'Dispatch 15 drivers to this area',
    },
    {
      id: 'ZONE-002',
      name: 'BGC',
      lat: 14.5503,
      lng: 121.0483,
      demandLevel: 'high',
      activeOrders: 32,
      availableDrivers: 18,
      recommendedAction: 'Monitor closely',
    },
    {
      id: 'ZONE-003',
      name: 'Ortigas Center',
      lat: 14.5853,
      lng: 121.0614,
      demandLevel: 'high',
      activeOrders: 28,
      availableDrivers: 21,
    },
    {
      id: 'ZONE-004',
      name: 'Quezon City - Cubao',
      lat: 14.6177,
      lng: 121.0572,
      demandLevel: 'medium',
      activeOrders: 19,
      availableDrivers: 24,
    },
    {
      id: 'ZONE-005',
      name: 'Manila Bay Area',
      lat: 14.5378,
      lng: 120.9813,
      demandLevel: 'medium',
      activeOrders: 15,
      availableDrivers: 16,
    },
  ];
}

export function generateMockSystemStatus(): SystemStatus {
  return {
    mode: 'normal',
    health: 96,
    uptime: '15d 7h 23m',
    services: [
      { name: 'API Gateway', status: 'healthy', latency: 45 },
      { name: 'Order Service', status: 'healthy', latency: 120 },
      { name: 'Driver Service', status: 'healthy', latency: 85 },
      { name: 'Payment Service', status: 'degraded', latency: 850 },
      { name: 'Notification Service', status: 'healthy', latency: 65 },
      { name: 'Geolocation', status: 'healthy', latency: 95 },
    ],
  };
}

export default commandService;
