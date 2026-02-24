/**
 * Tiers Feature Types
 * Type definitions for Driver Tier System
 */

// Tier levels
export type TierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// Tier status
export type TierStatus = 'Active' | 'Inactive' | 'Pending';

// Tier change type
export type TierChangeType = 'Upgrade' | 'Downgrade' | 'Manual' | 'Automatic';

// Tier requirements
export interface TierRequirements {
  minTrips?: number;
  minRating?: number;
  minCompletionRate?: number;
  minAcceptanceRate?: number;
  minAccountAgeDays?: number;
  maxCancellations?: number;
  minEarnings?: number;
}

// Tier benefits
export interface TierBenefits {
  commissionRate: number; // percentage (e.g., 15 = 15%)
  priorityLevel: number; // 1-5, higher is better
  perks: string[];
  bonusMultiplier: number;
  guaranteedHourlyRate?: number;
  prioritySupport: boolean;
  instantPayout: boolean;
}

// Tier definition
export interface Tier {
  id: string;
  level: TierLevel;
  name: string;
  description: string;
  status: TierStatus;
  requirements: TierRequirements;
  benefits: TierBenefits;
  icon?: string;
  color: string;
  order: number; // for sorting (1 = lowest, 5 = highest)
  createdAt: string;
  updatedAt: string;
}

// Driver tier assignment
export interface DriverTier {
  driverId: string;
  driverName: string;
  email: string;
  phone: string;
  avatar?: string;
  currentTier: TierLevel;
  previousTier?: TierLevel;
  tierAssignedAt: string;
  tierExpiresAt?: string;
  isAutoAssigned: boolean;
  assignedBy?: string;
  metrics: {
    totalTrips: number;
    rating: number;
    completionRate: number;
    acceptanceRate: number;
    cancellations: number;
    earnings: number;
    accountAgeDays: number;
  };
  progressToNextTier?: {
    nextTier: TierLevel;
    percentComplete: number;
    missingRequirements: string[];
  };
}

// Tier history entry
export interface TierHistoryEntry {
  id: string;
  driverId: string;
  driverName: string;
  fromTier: TierLevel;
  toTier: TierLevel;
  changeType: TierChangeType;
  reason: string;
  changedBy: string;
  changedAt: string;
  metadata?: {
    tripsAtChange: number;
    ratingAtChange: number;
    completionRateAtChange: number;
  };
}

// Tier distribution
export interface TierDistribution {
  tier: TierLevel;
  count: number;
  percentage: number;
  color: string;
}

// Tier filters
export interface TierFilters {
  level?: TierLevel;
  status?: TierStatus;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Driver tier filters
export interface DriverTierFilters {
  tier?: TierLevel;
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Tier history filters
export interface TierHistoryFilters {
  driverId?: string;
  changeType?: TierChangeType;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Create/Update tier request
export interface SaveTierRequest {
  level: TierLevel;
  name: string;
  description: string;
  requirements: Partial<TierRequirements>;
  benefits: Partial<TierBenefits>;
  color: string;
  order: number;
}

// Assign tier request
export interface AssignTierRequest {
  driverId: string;
  tier: TierLevel;
  reason: string;
  isTemporary?: boolean;
  expiresAt?: string;
}

// Bulk assign tier request
export interface BulkAssignTierRequest {
  driverIds: string[];
  tier: TierLevel;
  reason: string;
}

// Tier calculation rule
export interface TierCalculationRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  checkFrequency: 'Daily' | 'Weekly' | 'Monthly';
  autoUpgrade: boolean;
  autoDowngrade: boolean;
  gracePeriodDays: number;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface TierListResponse {
  items: Tier[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface DriverTierListResponse {
  items: DriverTier[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TierHistoryListResponse {
  items: TierHistoryEntry[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TierStats {
  totalDrivers: number;
  distribution: TierDistribution[];
  upgradesThisMonth: number;
  downgradesThisMonth: number;
  pendingReviews: number;
}
