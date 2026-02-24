/**
 * Dashboard Hooks - Barrel Export
 *
 * This file exports all dashboard-related hooks.
 */

export {
  useDashboardStats,
  useServiceTypeDashboard,
  useDriversReport,
  useRevenueReport,
  useDashboardAlerts,
  type DashboardStatsRequest,
  type ServiceTypeStats,
  type ServiceTypeDashboardResponse,
  type DriverReportItem,
  type DriversReportResponse,
  type RevenueReportItem,
  type RevenueReportResponse,
  type DashboardAlert,
} from './useDashboardStats';

export {
  useLiveMapOrders,
  useLiveMapDrivers,
  useNearbyDrivers,
  useDemandHeatmap,
  useAssignOrder,
  type LiveMapOrdersRequest,
  type LiveMapOrdersResponse,
  type LiveMapDriversRequest,
  type LiveMapDriversResponse,
  type NearbyDriversRequest,
  type NearbyDriver,
  type NearbyDriversResponse,
  type DemandZone,
  type DemandHeatmapResponse,
} from './useLiveMapOrders';

export {
  useMapData,
  type HeatmapPoint,
  type ZoneInfo,
} from './useMapData';

// New dashboard data hooks for real backend integration
export {
  useDashboardData,
  useDashboardDriverStats,
  useDashboardRecentIncidents,
  useDashboardIncidentCounts,
  DASHBOARD_QUERY_KEYS,
  type DashboardStats,
  type DashboardDriverStats,
  type DashboardIncident,
} from './useDashboardData';
