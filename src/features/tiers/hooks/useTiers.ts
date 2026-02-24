/**
 * Tiers Hooks
 * React Query hooks for tier management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TIER_QUERY_KEYS,
  getTiers,
  getTierById,
  getTierByLevel,
  createTier,
  updateTier,
  deleteTier,
  getDriverTiers,
  getDriverTier,
  assignTier,
  bulkAssignTier,
  getTierHistory,
  getTierDistribution,
  getTierStats,
  getCalculationRules,
  updateCalculationRule,
  recalculateDriverTier,
  runTierRecalculation,
} from '@/services/tiers/tiers.service';
import type {
  Tier,
  TierLevel,
  TierListResponse,
  DriverTier,
  DriverTierListResponse,
  TierHistoryEntry,
  TierHistoryListResponse,
  TierDistribution,
  TierStats,
  SaveTierRequest,
  AssignTierRequest,
  BulkAssignTierRequest,
  TierCalculationRule,
  TierFilters,
  DriverTierFilters,
  TierHistoryFilters,
} from '@/features/tiers/types';

// ==================== QUERIES ====================

/**
 * Hook to fetch all tiers
 */
export function useTiers(filters?: TierFilters) {
  return useQuery<TierListResponse>({
    queryKey: [TIER_QUERY_KEYS.tiers, filters],
    queryFn: () => getTiers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a single tier by ID
 */
export function useTier(tierId: string | undefined) {
  return useQuery<Tier | null>({
    queryKey: TIER_QUERY_KEYS.tier(tierId || ''),
    queryFn: () => getTierById(tierId!),
    enabled: !!tierId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch a tier by level
 */
export function useTierByLevel(level: TierLevel | undefined) {
  return useQuery<Tier | null>({
    queryKey: ['tier', 'level', level],
    queryFn: () => getTierByLevel(level!),
    enabled: !!level,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch driver tiers
 */
export function useDriverTiers(filters?: DriverTierFilters) {
  return useQuery<DriverTierListResponse>({
    queryKey: [TIER_QUERY_KEYS.driverTiers, filters],
    queryFn: () => getDriverTiers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single driver tier
 */
export function useDriverTier(driverId: string | undefined) {
  return useQuery<DriverTier | null>({
    queryKey: TIER_QUERY_KEYS.driverTier(driverId || ''),
    queryFn: () => getDriverTier(driverId!),
    enabled: !!driverId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch tier history
 */
export function useTierHistory(filters?: TierHistoryFilters) {
  return useQuery<TierHistoryListResponse>({
    queryKey: [TIER_QUERY_KEYS.tierHistory, filters],
    queryFn: () => getTierHistory(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch tier distribution
 */
export function useTierDistribution() {
  return useQuery<TierDistribution[]>({
    queryKey: [TIER_QUERY_KEYS.tierDistribution],
    queryFn: getTierDistribution,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch tier statistics
 */
export function useTierStats() {
  return useQuery<TierStats>({
    queryKey: [TIER_QUERY_KEYS.tierStats],
    queryFn: getTierStats,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch tier calculation rules
 */
export function useCalculationRules() {
  return useQuery<TierCalculationRule[]>({
    queryKey: [TIER_QUERY_KEYS.calculationRules],
    queryFn: getCalculationRules,
    staleTime: 10 * 60 * 1000,
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook to create a new tier
 */
export function useCreateTier() {
  const queryClient = useQueryClient();

  return useMutation<Tier, Error, SaveTierRequest>({
    mutationFn: createTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tiers] });
    },
  });
}

/**
 * Hook to update a tier
 */
export function useUpdateTier() {
  const queryClient = useQueryClient();

  return useMutation<Tier, Error, { id: string; data: Partial<SaveTierRequest> }>({
    mutationFn: ({ id, data }) => updateTier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tiers] });
      queryClient.invalidateQueries({ queryKey: TIER_QUERY_KEYS.tier(variables.id) });
    },
  });
}

/**
 * Hook to delete a tier
 */
export function useDeleteTier() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tiers] });
    },
  });
}

/**
 * Hook to assign a tier to a driver
 */
export function useAssignTier() {
  const queryClient = useQueryClient();

  return useMutation<DriverTier, Error, AssignTierRequest>({
    mutationFn: assignTier,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.driverTiers] });
      queryClient.invalidateQueries({ queryKey: TIER_QUERY_KEYS.driverTier(variables.driverId) });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierHistory] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierStats] });
    },
  });
}

/**
 * Hook to bulk assign tier to multiple drivers
 */
export function useBulkAssignTier() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; updatedCount: number },
    Error,
    BulkAssignTierRequest
  >({
    mutationFn: bulkAssignTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.driverTiers] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierHistory] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierStats] });
    },
  });
}

/**
 * Hook to update a calculation rule
 */
export function useUpdateCalculationRule() {
  const queryClient = useQueryClient();

  return useMutation<
    TierCalculationRule,
    Error,
    { id: string; updates: Partial<TierCalculationRule> }
  >({
    mutationFn: ({ id, updates }) => updateCalculationRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.calculationRules] });
    },
  });
}

/**
 * Hook to recalculate a driver's tier
 */
export function useRecalculateDriverTier() {
  const queryClient = useQueryClient();

  return useMutation<
    { newTier: TierLevel; changed: boolean },
    Error,
    string
  >({
    mutationFn: recalculateDriverTier,
    onSuccess: (_, driverId) => {
      queryClient.invalidateQueries({ queryKey: TIER_QUERY_KEYS.driverTier(driverId) });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.driverTiers] });
    },
  });
}

/**
 * Hook to run tier recalculation for all drivers
 */
export function useRunTierRecalculation() {
  const queryClient = useQueryClient();

  return useMutation<
    { processed: number; upgraded: number; downgraded: number },
    Error,
    void
  >({
    mutationFn: runTierRecalculation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.driverTiers] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierHistory] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierStats] });
      queryClient.invalidateQueries({ queryKey: [TIER_QUERY_KEYS.tierDistribution] });
    },
  });
}

// ==================== UTILITIES ====================

/**
 * Get tier color
 */
export function getTierColor(level: TierLevel): string {
  switch (level) {
    case 'Bronze':
      return '#CD7F32';
    case 'Silver':
      return '#C0C0C0';
    case 'Gold':
      return '#FFD700';
    case 'Platinum':
      return '#E5E4E2';
    case 'Diamond':
      return '#B9F2FF';
    default:
      return '#6B7280';
  }
}

/**
 * Get tier badge classes
 */
export function getTierBadgeClasses(level: TierLevel): string {
  switch (level) {
    case 'Bronze':
      return 'bg-amber-700/20 text-amber-600 border-amber-700/30';
    case 'Silver':
      return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
    case 'Gold':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Platinum':
      return 'bg-slate-300/20 text-slate-200 border-slate-300/30';
    case 'Diamond':
      return 'bg-cyan-300/20 text-cyan-300 border-cyan-300/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Get tier icon
 */
export function getTierIcon(level: TierLevel): string {
  switch (level) {
    case 'Bronze':
      return '🥉';
    case 'Silver':
      return '🥈';
    case 'Gold':
      return '🥇';
    case 'Platinum':
      return '⭐';
    case 'Diamond':
      return '💎';
    default:
      return '📋';
  }
}

/**
 * Get tier label
 */
export function getTierLabel(level: TierLevel): string {
  return level;
}

/**
 * Get tier description
 */
export function getTierDescription(level: TierLevel): string {
  switch (level) {
    case 'Bronze':
      return 'Entry level tier for new drivers';
    case 'Silver':
      return 'Proven drivers with consistent performance';
    case 'Gold':
      return 'High-performing drivers with excellent ratings';
    case 'Platinum':
      return 'Elite drivers with outstanding performance';
    case 'Diamond':
      return 'Top-tier drivers with exceptional service';
    default:
      return '';
  }
}

/**
 * Format change type
 */
export function formatChangeType(type: string): string {
  switch (type) {
    case 'Upgrade':
      return '↑ Upgrade';
    case 'Downgrade':
      return '↓ Downgrade';
    case 'Manual':
      return '✎ Manual';
    case 'Automatic':
      return '⚙ Automatic';
    default:
      return type;
  }
}

/**
 * Get change type color
 */
export function getChangeTypeColor(type: string): string {
  switch (type) {
    case 'Upgrade':
      return 'text-green-400';
    case 'Downgrade':
      return 'text-red-400';
    case 'Manual':
      return 'text-blue-400';
    case 'Automatic':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get priority label
 */
export function getPriorityLabel(level: number): string {
  switch (level) {
    case 1:
      return 'Low';
    case 2:
      return 'Normal';
    case 3:
      return 'High';
    case 4:
      return 'Very High';
    case 5:
      return 'Highest';
    default:
      return 'Unknown';
  }
}

/**
 * Format requirements for display
 */
export function formatRequirement(key: string, value: number): string {
  switch (key) {
    case 'minTrips':
      return `${value} trips`;
    case 'minRating':
      return `${value} rating`;
    case 'minCompletionRate':
      return `${value}% completion`;
    case 'minAcceptanceRate':
      return `${value}% acceptance`;
    case 'minAccountAgeDays':
      return `${value} days account age`;
    case 'maxCancellations':
      return `Max ${value} cancellations`;
    case 'minEarnings':
      return `₱${value.toLocaleString()} earnings`;
    default:
      return `${key}: ${value}`;
  }
}

// Re-export types
export type {
  Tier,
  TierLevel,
  TierListResponse,
  DriverTier,
  DriverTierListResponse,
  TierHistoryEntry,
  TierHistoryListResponse,
  TierDistribution,
  TierStats,
  SaveTierRequest,
  AssignTierRequest,
  BulkAssignTierRequest,
  TierCalculationRule,
  TierFilters,
  DriverTierFilters,
  TierHistoryFilters,
};
