// Analytics Feature
export { default as AnalyticsDashboard } from './pages/AnalyticsDashboard';
export { default as Reports } from './pages/Reports';
export { default as Monitoring } from './pages/Monitoring';
export { default as AIManagement } from './pages/AIManagement';
export { default as Alerts } from './pages/Alerts';

// Charts
export { RevenueChart, UserActivityChart, OrderDistributionChart } from './charts';

// Hooks
export {
  // Analytics hooks
  useAnalytics,
  useRevenueData,
  useUserActivity,
  useOrderDistribution,
  useTopRoutes,
  useExportAnalytics,
  // Reports hooks
  useReportHistory,
  useGenerateReport,
  useDownloadReport,
  useExportReport,
  useScheduleReport,
  useScheduledReports,
  getDateRange,
  // System Health hooks
  useSystemHealth,
  useSystemMetrics,
  useServiceStatus,
  useErrorLogs,
  useRefreshSystemHealth,
  useAcknowledgeError,
  useResponseTimeHistory,
  isSystemHealthy,
  getSystemStatus,
} from './hooks';
