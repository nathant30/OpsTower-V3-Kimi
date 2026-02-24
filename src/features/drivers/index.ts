// ==================== HOOKS ====================

export {
  useDrivers,
  useDriver,
  useUpdateDriverStatus,
  useBulkUpdateDriverStatus,
  type DriversFilters,
  type DriverListResponse,
} from './hooks/useDrivers';

export {
  useDriverDetail,
  useDriverStats,
  useDriverRecentTrips,
  useUpdateDriverTrustScore,
  useVerifyDriverDocument,
  type DriverDetailResponse,
  type DriverStatsSummary,
  type DriverRecentTrip,
  type UpdateTrustScoreRequest,
  type VerifyDocumentRequest,
} from './hooks/useDriver';

export {
  useDriverPerformance as useDriverPerformanceData,
  useDriverPerformanceTrends,
  useDriverPerformanceComparison,
  useDriverPerformanceRanking,
  useDetailedPerformanceMetrics,
  useDriverHourlyActivity,
  getPerformanceColor,
  getPerformanceLabel,
  formatChange,
  type PerformanceTrend,
  type PerformanceComparison,
  type PerformanceRanking,
  type DetailedPerformanceMetrics,
} from './hooks/useDriverPerformance';

export {
  useDriverWallet as useDriverWalletData,
  useWalletTransactions,
  useEarningsBreakdown,
  useWeeklyEarnings,
  useProcessWithdrawal,
  useAdjustDriverBalance,
  formatWalletBalance,
  getTransactionTypeColor,
  getTransactionStatusVariant,
  type DriverWalletInfo,
  type WalletTransaction,
  type EarningsBreakdown,
  type WithdrawalRequest,
} from './hooks/useDriverWallet';

// ==================== COMPONENTS ====================

export {
  TrustScoreCard,
  TrustScoreBadge,
  TrustScoreMini,
  CircularProgress,
  SegmentedBar,
  ComponentBreakdownRow,
  getTrustScoreColor,
  getTrustScoreBgColor,
  getTrustScoreStrokeColor,
  getTrustScoreLabel,
  getTrustScoreDescription,
} from './components/TrustScoreCard';

export {
  PerformanceChart,
  PerformanceRadarChart,
  PerformanceBarChart,
  PerformanceTrendsChart,
  PerformanceAreaChart,
  TripsDistributionChart,
  EarningsChart,
} from './components/PerformanceChart';

export {
  EarningsPanel,
  EarningsCompact,
} from './components/EarningsPanel';

export {
  CompliancePanel,
  ComplianceCompact,
} from './components/CompliancePanel';

export {
  DriversTable,
} from './components/DriversTable';

export {
  DriverCard,
  DriverCardCompact,
  DriverCardSkeleton,
  DriverCardEmpty,
} from './components/DriverCard';

export {
  DriverDetail,
} from './components/DriverDetail';

// ==================== PAGES ====================

export { default as DriversPage } from './pages/DriversPage';
export { default as DriverDetailPage } from './pages/DriverDetailPage';
