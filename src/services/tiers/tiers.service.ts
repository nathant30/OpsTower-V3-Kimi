/**
 * Tiers Service
 * Handles tier configuration, driver tier assignments, and tier history
 */

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
} from '@/features/tiers/types';

// Query keys for tiers
export const TIER_QUERY_KEYS = {
  tiers: 'tiers',
  tier: (id: string) => ['tier', id],
  driverTiers: 'driverTiers',
  driverTier: (id: string) => ['driverTier', id],
  tierHistory: 'tierHistory',
  tierDistribution: 'tierDistribution',
  tierStats: 'tierStats',
  calculationRules: 'tierCalculationRules',
} as const;

// Mock tier data
const mockTiers: Tier[] = [
  {
    id: 'tier-bronze',
    level: 'Bronze',
    name: 'Bronze Driver',
    description: 'Entry level tier for new drivers',
    status: 'Active',
    requirements: {
      minTrips: 0,
      minRating: 0,
      minCompletionRate: 0,
      minAcceptanceRate: 0,
      minAccountAgeDays: 0,
      maxCancellations: 999,
      minEarnings: 0,
    },
    benefits: {
      commissionRate: 20,
      priorityLevel: 1,
      perks: ['Basic Support'],
      bonusMultiplier: 1.0,
      prioritySupport: false,
      instantPayout: false,
    },
    color: '#CD7F32',
    order: 1,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tier-silver',
    level: 'Silver',
    name: 'Silver Driver',
    description: 'Proven drivers with consistent performance',
    status: 'Active',
    requirements: {
      minTrips: 100,
      minRating: 4.5,
      minCompletionRate: 85,
      minAcceptanceRate: 80,
      minAccountAgeDays: 30,
      maxCancellations: 20,
      minEarnings: 10000,
    },
    benefits: {
      commissionRate: 18,
      priorityLevel: 2,
      perks: ['Basic Support', 'Weekly Bonuses'],
      bonusMultiplier: 1.1,
      prioritySupport: false,
      instantPayout: false,
    },
    color: '#C0C0C0',
    order: 2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tier-gold',
    level: 'Gold',
    name: 'Gold Driver',
    description: 'High-performing drivers with excellent ratings',
    status: 'Active',
    requirements: {
      minTrips: 500,
      minRating: 4.7,
      minCompletionRate: 90,
      minAcceptanceRate: 85,
      minAccountAgeDays: 90,
      maxCancellations: 50,
      minEarnings: 75000,
    },
    benefits: {
      commissionRate: 15,
      priorityLevel: 3,
      perks: ['Priority Support', 'Weekly Bonuses', 'Fuel Discounts'],
      bonusMultiplier: 1.25,
      guaranteedHourlyRate: 150,
      prioritySupport: true,
      instantPayout: false,
    },
    color: '#FFD700',
    order: 3,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tier-platinum',
    level: 'Platinum',
    name: 'Platinum Driver',
    description: 'Elite drivers with outstanding performance',
    status: 'Active',
    requirements: {
      minTrips: 1000,
      minRating: 4.8,
      minCompletionRate: 95,
      minAcceptanceRate: 90,
      minAccountAgeDays: 180,
      maxCancellations: 75,
      minEarnings: 200000,
    },
    benefits: {
      commissionRate: 12,
      priorityLevel: 4,
      perks: ['Priority Support', 'Daily Bonuses', 'Fuel Discounts', 'Vehicle Maintenance'],
      bonusMultiplier: 1.5,
      guaranteedHourlyRate: 200,
      prioritySupport: true,
      instantPayout: true,
    },
    color: '#E5E4E2',
    order: 4,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tier-diamond',
    level: 'Diamond',
    name: 'Diamond Driver',
    description: 'Top-tier drivers with exceptional service',
    status: 'Active',
    requirements: {
      minTrips: 2500,
      minRating: 4.9,
      minCompletionRate: 98,
      minAcceptanceRate: 95,
      minAccountAgeDays: 365,
      maxCancellations: 100,
      minEarnings: 600000,
    },
    benefits: {
      commissionRate: 10,
      priorityLevel: 5,
      perks: ['VIP Support', 'Daily Bonuses', 'Fuel Discounts', 'Vehicle Maintenance', 'Health Insurance', 'Exclusive Events'],
      bonusMultiplier: 2.0,
      guaranteedHourlyRate: 300,
      prioritySupport: true,
      instantPayout: true,
    },
    color: '#B9F2FF',
    order: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// Mock driver tiers
const mockDriverTiers: DriverTier[] = [
  {
    driverId: '1',
    driverName: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '+639123456789',
    currentTier: 'Diamond',
    previousTier: 'Platinum',
    tierAssignedAt: '2026-01-15T00:00:00Z',
    isAutoAssigned: true,
    metrics: {
      totalTrips: 3200,
      rating: 4.92,
      completionRate: 98.5,
      acceptanceRate: 96,
      cancellations: 45,
      earnings: 750000,
      accountAgeDays: 450,
    },
  },
  {
    driverId: '2',
    driverName: 'Maria Santos',
    email: 'maria@example.com',
    phone: '+639123456790',
    currentTier: 'Platinum',
    tierAssignedAt: '2025-12-01T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Diamond',
      percentComplete: 75,
      missingRequirements: ['minTrips', 'minEarnings'],
    },
    metrics: {
      totalTrips: 1850,
      rating: 4.85,
      completionRate: 96,
      acceptanceRate: 92,
      cancellations: 62,
      earnings: 380000,
      accountAgeDays: 280,
    },
  },
  {
    driverId: '3',
    driverName: 'Pedro Reyes',
    email: 'pedro@example.com',
    phone: '+639123456791',
    currentTier: 'Platinum',
    previousTier: 'Gold',
    tierAssignedAt: '2026-02-01T00:00:00Z',
    isAutoAssigned: false,
    assignedBy: 'admin@example.com',
    progressToNextTier: {
      nextTier: 'Diamond',
      percentComplete: 45,
      missingRequirements: ['minTrips', 'minRating', 'minEarnings'],
    },
    metrics: {
      totalTrips: 1200,
      rating: 4.78,
      completionRate: 94,
      acceptanceRate: 91,
      cancellations: 58,
      earnings: 280000,
      accountAgeDays: 220,
    },
  },
  {
    driverId: '4',
    driverName: 'Ana Garcia',
    email: 'ana@example.com',
    phone: '+639123456792',
    currentTier: 'Gold',
    tierAssignedAt: '2025-11-15T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Platinum',
      percentComplete: 85,
      missingRequirements: ['minEarnings'],
    },
    metrics: {
      totalTrips: 850,
      rating: 4.82,
      completionRate: 93,
      acceptanceRate: 89,
      cancellations: 45,
      earnings: 165000,
      accountAgeDays: 180,
    },
  },
  {
    driverId: '5',
    driverName: 'Carlos Mendoza',
    email: 'carlos@example.com',
    phone: '+639123456793',
    currentTier: 'Gold',
    previousTier: 'Silver',
    tierAssignedAt: '2026-01-20T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Platinum',
      percentComplete: 60,
      missingRequirements: ['minTrips', 'minCompletionRate', 'minEarnings'],
    },
    metrics: {
      totalTrips: 720,
      rating: 4.68,
      completionRate: 91,
      acceptanceRate: 87,
      cancellations: 52,
      earnings: 145000,
      accountAgeDays: 150,
    },
  },
  {
    driverId: '6',
    driverName: 'Sofia Rivera',
    email: 'sofia@example.com',
    phone: '+639123456794',
    currentTier: 'Silver',
    tierAssignedAt: '2025-10-20T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Gold',
      percentComplete: 90,
      missingRequirements: ['minTrips'],
    },
    metrics: {
      totalTrips: 465,
      rating: 4.75,
      completionRate: 89,
      acceptanceRate: 86,
      cancellations: 38,
      earnings: 68000,
      accountAgeDays: 120,
    },
  },
  {
    driverId: '7',
    driverName: 'Miguel Torres',
    email: 'miguel@example.com',
    phone: '+639123456795',
    currentTier: 'Silver',
    previousTier: 'Bronze',
    tierAssignedAt: '2026-01-05T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Gold',
      percentComplete: 55,
      missingRequirements: ['minTrips', 'minCompletionRate'],
    },
    metrics: {
      totalTrips: 320,
      rating: 4.58,
      completionRate: 87,
      acceptanceRate: 84,
      cancellations: 35,
      earnings: 45000,
      accountAgeDays: 95,
    },
  },
  {
    driverId: '8',
    driverName: 'Isabella Cruz',
    email: 'isabella@example.com',
    phone: '+639123456796',
    currentTier: 'Bronze',
    tierAssignedAt: '2025-12-10T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Silver',
      percentComplete: 80,
      missingRequirements: ['minTrips'],
    },
    metrics: {
      totalTrips: 85,
      rating: 4.65,
      completionRate: 88,
      acceptanceRate: 82,
      cancellations: 12,
      earnings: 12000,
      accountAgeDays: 60,
    },
  },
  {
    driverId: '9',
    driverName: 'Rafael Lim',
    email: 'rafael@example.com',
    phone: '+639123456797',
    currentTier: 'Bronze',
    tierAssignedAt: '2026-01-25T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Silver',
      percentComplete: 45,
      missingRequirements: ['minTrips', 'minAcceptanceRate'],
    },
    metrics: {
      totalTrips: 45,
      rating: 4.45,
      completionRate: 82,
      acceptanceRate: 75,
      cancellations: 8,
      earnings: 6500,
      accountAgeDays: 45,
    },
  },
  {
    driverId: '10',
    driverName: 'Carmen Tan',
    email: 'carmen@example.com',
    phone: '+639123456798',
    currentTier: 'Bronze',
    tierAssignedAt: '2026-02-05T00:00:00Z',
    isAutoAssigned: true,
    progressToNextTier: {
      nextTier: 'Silver',
      percentComplete: 25,
      missingRequirements: ['minTrips', 'minRating', 'minAcceptanceRate'],
    },
    metrics: {
      totalTrips: 25,
      rating: 4.35,
      completionRate: 80,
      acceptanceRate: 78,
      cancellations: 5,
      earnings: 3200,
      accountAgeDays: 20,
    },
  },
];

// Mock tier history
const mockTierHistory: TierHistoryEntry[] = [
  { id: 'hist-001', driverId: '1', driverName: 'Juan Dela Cruz', fromTier: 'Platinum', toTier: 'Diamond', changeType: 'Upgrade', reason: 'Met all Diamond tier requirements', changedBy: 'System', changedAt: '2026-01-15T00:00:00Z', metadata: { tripsAtChange: 2501, ratingAtChange: 4.9, completionRateAtChange: 98.5 } },
  { id: 'hist-002', driverId: '3', driverName: 'Pedro Reyes', fromTier: 'Gold', toTier: 'Platinum', changeType: 'Manual', reason: 'Exceptional performance during holiday season', changedBy: 'admin@example.com', changedAt: '2026-02-01T00:00:00Z', metadata: { tripsAtChange: 1200, ratingAtChange: 4.78, completionRateAtChange: 94 } },
  { id: 'hist-003', driverId: '5', driverName: 'Carlos Mendoza', fromTier: 'Silver', toTier: 'Gold', changeType: 'Upgrade', reason: 'Met all Gold tier requirements', changedBy: 'System', changedAt: '2026-01-20T00:00:00Z', metadata: { tripsAtChange: 700, ratingAtChange: 4.7, completionRateAtChange: 92 } },
  { id: 'hist-004', driverId: '7', driverName: 'Miguel Torres', fromTier: 'Bronze', toTier: 'Silver', changeType: 'Upgrade', reason: 'Met all Silver tier requirements', changedBy: 'System', changedAt: '2026-01-05T00:00:00Z', metadata: { tripsAtChange: 120, ratingAtChange: 4.6, completionRateAtChange: 88 } },
  { id: 'hist-005', driverId: '2', driverName: 'Maria Santos', fromTier: 'Gold', toTier: 'Platinum', changeType: 'Upgrade', reason: 'Met all Platinum tier requirements', changedBy: 'System', changedAt: '2025-12-01T00:00:00Z', metadata: { tripsAtChange: 1050, ratingAtChange: 4.8, completionRateAtChange: 95 } },
  { id: 'hist-006', driverId: '9', driverName: 'Rafael Lim', fromTier: 'Silver', toTier: 'Bronze', changeType: 'Downgrade', reason: 'Completion rate fell below threshold', changedBy: 'System', changedAt: '2025-11-15T00:00:00Z', metadata: { tripsAtChange: 300, ratingAtChange: 4.3, completionRateAtChange: 78 } },
];

// Mock calculation rules
const mockCalculationRules: TierCalculationRule[] = [
  {
    id: 'rule-001',
    name: 'Automatic Tier Upgrade',
    description: 'Automatically upgrade drivers when they meet tier requirements',
    isEnabled: true,
    checkFrequency: 'Daily',
    autoUpgrade: true,
    autoDowngrade: false,
    gracePeriodDays: 7,
    notificationEnabled: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'rule-002',
    name: 'Automatic Tier Downgrade',
    description: 'Automatically downgrade drivers who no longer meet tier requirements',
    isEnabled: true,
    checkFrequency: 'Weekly',
    autoUpgrade: false,
    autoDowngrade: true,
    gracePeriodDays: 14,
    notificationEnabled: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'rule-003',
    name: 'Monthly Tier Review',
    description: 'Comprehensive tier review for all drivers',
    isEnabled: true,
    checkFrequency: 'Monthly',
    autoUpgrade: true,
    autoDowngrade: true,
    gracePeriodDays: 7,
    notificationEnabled: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
];

// Service functions
export async function getTiers(): Promise<TierListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => ({
      items: mockTiers,
      total: mockTiers.length,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    }), 300);
  });
}

export async function getTierById(id: string): Promise<Tier | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tier = mockTiers.find(t => t.id === id) || null;
      resolve(tier);
    }, 200);
  });
}

export async function getTierByLevel(level: TierLevel): Promise<Tier | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tier = mockTiers.find(t => t.level === level) || null;
      resolve(tier);
    }, 200);
  });
}

export async function createTier(request: SaveTierRequest): Promise<Tier> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTier: Tier = {
        id: `tier-${Date.now()}`,
        level: request.level,
        name: request.name,
        description: request.description,
        color: request.color,
        order: request.order,
        status: 'Active',
        requirements: {
          minTrips: request.requirements?.minTrips ?? 0,
          minRating: request.requirements?.minRating ?? 0,
          minCompletionRate: request.requirements?.minCompletionRate ?? 0,
          minAcceptanceRate: request.requirements?.minAcceptanceRate ?? 0,
          minAccountAgeDays: request.requirements?.minAccountAgeDays ?? 0,
          maxCancellations: request.requirements?.maxCancellations ?? 999,
          minEarnings: request.requirements?.minEarnings ?? 0,
        },
        benefits: {
          commissionRate: request.benefits?.commissionRate ?? 20,
          priorityLevel: request.benefits?.priorityLevel ?? 1,
          perks: request.benefits?.perks ?? [],
          bonusMultiplier: request.benefits?.bonusMultiplier ?? 1,
          guaranteedHourlyRate: request.benefits?.guaranteedHourlyRate,
          prioritySupport: request.benefits?.prioritySupport ?? false,
          instantPayout: request.benefits?.instantPayout ?? false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      resolve(newTier);
    }, 300);
  });
}

export async function updateTier(id: string, request: Partial<SaveTierRequest>): Promise<Tier> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tier = mockTiers.find(t => t.id === id);
      if (!tier) {
        reject(new Error('Tier not found'));
        return;
      }
      const updatedTier: Tier = {
        ...tier,
        ...request,
        id,
        requirements: {
          ...tier.requirements,
          ...request.requirements,
        },
        benefits: {
          ...tier.benefits,
          ...request.benefits,
        },
        updatedAt: new Date().toISOString(),
      };
      resolve(updatedTier);
    }, 300);
  });
}

export async function deleteTier(id: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
}

export async function getDriverTiers(filters?: { tier?: TierLevel; searchQuery?: string }): Promise<DriverTierListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let items = [...mockDriverTiers];
      
      if (filters?.tier) {
        items = items.filter(d => d.currentTier === filters.tier);
      }
      
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        items = items.filter(d => 
          d.driverName.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query) ||
          d.phone.includes(query)
        );
      }
      
      resolve({
        items,
        total: items.length,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      });
    }, 300);
  });
}

export async function getDriverTier(driverId: string): Promise<DriverTier | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const driverTier = mockDriverTiers.find(d => d.driverId === driverId) || null;
      resolve(driverTier);
    }, 200);
  });
}

export async function assignTier(request: AssignTierRequest): Promise<DriverTier> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const driverTier = mockDriverTiers.find(d => d.driverId === request.driverId);
      if (driverTier) {
        driverTier.previousTier = driverTier.currentTier;
        driverTier.currentTier = request.tier;
        driverTier.isAutoAssigned = !request.isTemporary;
        driverTier.tierAssignedAt = new Date().toISOString();
        if (request.expiresAt) {
          driverTier.tierExpiresAt = request.expiresAt;
        }
      }
      resolve(driverTier!);
    }, 300);
  });
}

export async function bulkAssignTier(request: BulkAssignTierRequest): Promise<{ success: boolean; updatedCount: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, updatedCount: request.driverIds.length });
    }, 500);
  });
}

export async function getTierHistory(filters?: { driverId?: string; changeType?: string }): Promise<TierHistoryListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let items = [...mockTierHistory];
      
      if (filters?.driverId) {
        items = items.filter(h => h.driverId === filters.driverId);
      }
      
      if (filters?.changeType) {
        items = items.filter(h => h.changeType === filters.changeType);
      }
      
      resolve({
        items,
        total: items.length,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      });
    }, 300);
  });
}

export async function getTierDistribution(): Promise<TierDistribution[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const distribution: TierDistribution[] = [
        { tier: 'Bronze', count: 45, percentage: 28.8, color: '#CD7F32' },
        { tier: 'Silver', count: 38, percentage: 24.4, color: '#C0C0C0' },
        { tier: 'Gold', count: 35, percentage: 22.4, color: '#FFD700' },
        { tier: 'Platinum', count: 25, percentage: 16.0, color: '#E5E4E2' },
        { tier: 'Diamond', count: 13, percentage: 8.3, color: '#B9F2FF' },
      ];
      resolve(distribution);
    }, 300);
  });
}

export async function getTierStats(): Promise<TierStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalDrivers: 156,
        distribution: [
          { tier: 'Bronze', count: 45, percentage: 28.8, color: '#CD7F32' },
          { tier: 'Silver', count: 38, percentage: 24.4, color: '#C0C0C0' },
          { tier: 'Gold', count: 35, percentage: 22.4, color: '#FFD700' },
          { tier: 'Platinum', count: 25, percentage: 16.0, color: '#E5E4E2' },
          { tier: 'Diamond', count: 13, percentage: 8.3, color: '#B9F2FF' },
        ],
        upgradesThisMonth: 8,
        downgradesThisMonth: 3,
        pendingReviews: 12,
      });
    }, 300);
  });
}

export async function getCalculationRules(): Promise<TierCalculationRule[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCalculationRules);
    }, 200);
  });
}

export async function updateCalculationRule(id: string, updates: Partial<TierCalculationRule>): Promise<TierCalculationRule> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rule = mockCalculationRules.find(r => r.id === id);
      if (!rule) {
        reject(new Error('Rule not found'));
        return;
      }
      const updatedRule = { ...rule, ...updates, updatedAt: new Date().toISOString() };
      resolve(updatedRule);
    }, 300);
  });
}

export async function recalculateDriverTier(driverId: string): Promise<{ newTier: TierLevel; changed: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const driver = mockDriverTiers.find(d => d.driverId === driverId);
      if (driver) {
        resolve({ newTier: driver.currentTier, changed: false });
      } else {
        resolve({ newTier: 'Bronze', changed: false });
      }
    }, 500);
  });
}

export async function runTierRecalculation(): Promise<{ processed: number; upgraded: number; downgraded: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ processed: 156, upgraded: 5, downgraded: 2 });
    }, 1000);
  });
}
