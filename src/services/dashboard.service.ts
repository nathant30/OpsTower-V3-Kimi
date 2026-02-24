/**
 * Dashboard Service
 * Fetches real dashboard statistics from backend API
 */

import { backendApi } from './backend.api';
import { BACKEND_ENDPOINTS } from '../config/backend.config';
import type { TierDistribution } from '@/features/tiers/types';

// Types for dashboard data
export interface DashboardDriverStats {
  totalDrivers: number;
  activeDrivers: number;
  idleDrivers: number;
  offlineDrivers: number;
  tierDistribution: TierDistribution[];
}

export interface DashboardIncident {
  id: string;
  type: 'BREAKDOWN' | 'SOS' | 'ACCIDENT' | 'INTEGRITY_ALERT' | 'CUSTOMER_COMPLAINT' | 'TRAFFIC_VIOLATION';
  title: string;
  description: string;
  location: string;
  driverId?: string;
  driverName?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'OPEN' | 'INVESTIGATING' | 'PENDING_DOCUMENTATION' | 'AUDIT_FAIL' | 'RESOLVED' | 'ESCALATED';
  createdAt: string;
  occurredAt: string;
}

export interface DashboardStats {
  drivers: DashboardDriverStats;
  incidents: {
    total: number;
    active: number;
    critical: number;
    recent: DashboardIncident[];
  };
  lastUpdated: string;
}

// Query keys for React Query
export const DASHBOARD_QUERY_KEYS = {
  stats: 'dashboardStats',
  driverStats: 'dashboardDriverStats',
  incidents: 'dashboardIncidents',
  recentIncidents: 'dashboardRecentIncidents',
  tierDistribution: 'dashboardTierDistribution',
} as const;

/**
 * Fetch driver statistics including tier distribution
 */
export async function getDriverStats(): Promise<DashboardDriverStats> {
  try {
    // Fetch tier analytics from backend
    const tierAnalytics = await backendApi.get<{
      distribution: Array<{
        tier: string;
        count: number;
        percentage: number;
      }>;
      totalDrivers: number;
      activeDrivers: number;
    }>(BACKEND_ENDPOINTS.drivers.tierAnalytics);

    // Map tier distribution with colors
    const tierColors: Record<string, string> = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2',
      'Diamond': '#B9F2FF',
    };

    const tierDistribution: TierDistribution[] = tierAnalytics.distribution.map(item => ({
      tier: item.tier as TierDistribution['tier'],
      count: item.count,
      percentage: item.percentage,
      color: tierColors[item.tier] || '#6B7280',
    }));

    return {
      totalDrivers: tierAnalytics.totalDrivers || 0,
      activeDrivers: tierAnalytics.activeDrivers || 0,
      idleDrivers: Math.max(0, tierAnalytics.totalDrivers - tierAnalytics.activeDrivers),
      offlineDrivers: 0, // Backend doesn't provide this yet
      tierDistribution,
    };
  } catch (error) {
    console.error('[DashboardService] Failed to fetch driver stats:', error);
    // Return fallback data on error
    return {
      totalDrivers: 0,
      activeDrivers: 0,
      idleDrivers: 0,
      offlineDrivers: 0,
      tierDistribution: [],
    };
  }
}

/**
 * Fetch recent incidents from backend
 */
export async function getRecentIncidents(limit: number = 5): Promise<DashboardIncident[]> {
  try {
    const response = await backendApi.get<{
      items: Array<{
        id: string;
        incidentType: string;
        description: string;
        severity: number;
        status: string;
        driverId?: string;
        locationAddress?: string;
        createdAt: string;
        occurredAt: string;
      }>;
      total: number;
    }>(BACKEND_ENDPOINTS.incidents.list, { limit, page: 1 });

    const severityMap: Record<number, DashboardIncident['severity']> = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Critical',
    };

    const typeMap: Record<string, DashboardIncident['type']> = {
      'BREAKDOWN': 'BREAKDOWN',
      'SOS': 'SOS',
      'ACCIDENT': 'ACCIDENT',
      'INTEGRITY_ALERT': 'INTEGRITY_ALERT',
      'CUSTOMER_COMPLAINT': 'CUSTOMER_COMPLAINT',
      'TRAFFIC_VIOLATION': 'TRAFFIC_VIOLATION',
    };

    return response.items.map(item => ({
      id: item.id,
      type: typeMap[item.incidentType] || 'CUSTOMER_COMPLAINT',
      title: formatIncidentTitle(item.incidentType),
      description: item.description,
      location: item.locationAddress || 'Unknown location',
      driverId: item.driverId,
      severity: severityMap[item.severity] || 'Low',
      status: item.status as DashboardIncident['status'],
      createdAt: item.createdAt,
      occurredAt: item.occurredAt,
    }));
  } catch (error) {
    console.error('[DashboardService] Failed to fetch incidents:', error);
    return [];
  }
}

/**
 * Fetch incident counts
 */
export async function getIncidentCounts(): Promise<{
  total: number;
  active: number;
  critical: number;
}> {
  try {
    const response = await backendApi.get<{
      items: Array<{ severity: number; status: string }>;
      total: number;
    }>(BACKEND_ENDPOINTS.incidents.list, { limit: 1000 });

    const activeStatuses = ['OPEN', 'INVESTIGATING', 'PENDING_DOCUMENTATION'];
    
    return {
      total: response.total || 0,
      active: response.items.filter(i => activeStatuses.includes(i.status)).length,
      critical: response.items.filter(i => i.severity >= 3).length,
    };
  } catch (error) {
    console.error('[DashboardService] Failed to fetch incident counts:', error);
    return { total: 0, active: 0, critical: 0 };
  }
}

/**
 * Fetch complete dashboard stats
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [driverStats, incidents, recentIncidents] = await Promise.all([
    getDriverStats(),
    getIncidentCounts(),
    getRecentIncidents(5),
  ]);

  return {
    drivers: driverStats,
    incidents: {
      ...incidents,
      recent: recentIncidents,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Format incident type to readable title
 */
function formatIncidentTitle(type: string): string {
  const titles: Record<string, string> = {
    'BREAKDOWN': 'Vehicle Breakdown',
    'SOS': 'Emergency Alert',
    'ACCIDENT': 'Accident Report',
    'INTEGRITY_ALERT': 'Integrity Alert',
    'CUSTOMER_COMPLAINT': 'Customer Complaint',
    'TRAFFIC_VIOLATION': 'Traffic Violation',
  };
  return titles[type] || type.replace(/_/g, ' ');
}

// Default export
export const dashboardService = {
  getDriverStats,
  getRecentIncidents,
  getIncidentCounts,
  getDashboardStats,
};

export default dashboardService;
