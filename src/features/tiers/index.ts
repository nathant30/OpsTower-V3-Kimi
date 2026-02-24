/**
 * Tiers Feature Index
 * Export all tiers-related modules
 */

// ==================== TYPES ====================

export type {
  Tier,
  TierLevel,
  TierStatus,
  TierChangeType,
  TierRequirements,
  TierBenefits,
  DriverTier,
  TierHistoryEntry,
  TierDistribution,
  TierFilters,
  DriverTierFilters,
  TierHistoryFilters,
  SaveTierRequest,
  AssignTierRequest,
  BulkAssignTierRequest,
  TierCalculationRule,
  TierListResponse,
  DriverTierListResponse,
  TierHistoryListResponse,
  TierStats,
} from './types';

// ==================== HOOKS ====================

export {
  // Queries
  useTiers,
  useTier,
  useTierByLevel,
  useDriverTiers,
  useDriverTier,
  useTierHistory,
  useTierDistribution,
  useTierStats,
  useCalculationRules,
  
  // Mutations
  useCreateTier,
  useUpdateTier,
  useDeleteTier,
  useAssignTier,
  useBulkAssignTier,
  useUpdateCalculationRule,
  useRecalculateDriverTier,
  useRunTierRecalculation,
  
  // Utilities
  getTierColor,
  getTierBadgeClasses,
  getTierIcon,
  getTierLabel,
  getTierDescription,
  formatChangeType,
  getChangeTypeColor,
  getPriorityLabel,
  formatRequirement,
} from './hooks/useTiers';

// ==================== COMPONENTS ====================

export {
  TierCard,
  TierCardCompact,
  TierBadge,
  TierProgressBar,
} from './components/TierCard';

export {
  TierRequirementsForm,
} from './components/TierRequirementsForm';

export {
  DriverTierAssignment,
} from './components/DriverTierAssignment';

// ==================== PAGES ====================

export { default as TierManagement } from './pages/TierManagement';
