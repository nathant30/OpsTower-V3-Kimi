/**
 * Earnings Feature Index
 * Export all earnings-related modules
 */

// ==================== HOOKS ====================

export {
  // Queries
  useEarningsKPIs,
  useDailyEarnings,
  useEarningsByTripType,
  useDriverLeaderboard,
  usePayoutHistory,
  useDeductionsSummary,
  
  // Mutations
  useExportEarningsReport,
  useProcessPayout,
  useRetryPayout,
  
  // Utilities
  formatCurrency,
  formatNumber,
  formatPercentage,
  getTrendColor,
  getTrendIndicator,
  getPayoutStatusColor,
  getPayoutMethodLabel,
  getDeductionTypeLabel,
  
  // Types
  type EarningsFilters,
  type PayoutFilters,
  type ExportEarningsRequest,
  type ProcessPayoutRequest,
  type EarningsKPIs,
  type DailyEarnings,
  type EarningsByTripType,
  type DriverEarningsEntry,
  type PayoutEntry,
  type DeductionsSummary,
} from './hooks/useEarnings';

// ==================== COMPONENTS ====================

export {
  EarningsChart,
  DailyEarningsChart,
  TripTypeChart,
  TripTypeBarChart,
} from './components/EarningsChart';

export {
  PayoutHistory,
  PayoutHistoryCompact,
} from './components/PayoutHistory';

// ==================== PAGES ====================

export { default as EarningsDashboard } from './pages/EarningsDashboard';
