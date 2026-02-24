// Trust Scores Hook
// Fetches and manages trust score data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface TrustScoreHistory {
  date: string;
  score: number;
}

export interface TrustScoreFactors {
  completion: number;
  rating: number;
  behavior: number;
  verification: number;
}

export interface TrustScore {
  userId: string;
  name: string;
  role: 'driver' | 'passenger';
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: TrustScoreFactors;
  history: TrustScoreHistory[];
  lastUpdated: string;
}

export interface TrustScoresFilters {
  role?: ('driver' | 'passenger')[];
  level?: ('excellent' | 'good' | 'fair' | 'poor')[];
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface TrustScoresResponse {
  items: TrustScore[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TrustScoreStats {
  totalUsers: number;
  averageScore: number;
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  poorCount: number;
  flaggedUsers: number;
}

// Mock data for development
const mockScores: TrustScore[] = [
  {
    userId: 'USR-001',
    name: 'Juan Santos',
    role: 'driver',
    score: 94,
    level: 'excellent',
    factors: { completion: 98, rating: 4.8, behavior: 95, verification: 100 },
    history: [
      { date: '2024-01-01', score: 88 },
      { date: '2024-02-01', score: 90 },
      { date: '2024-03-01', score: 92 },
      { date: '2024-04-01', score: 94 },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-002',
    name: 'Maria Cruz',
    role: 'driver',
    score: 78,
    level: 'good',
    factors: { completion: 85, rating: 4.2, behavior: 80, verification: 100 },
    history: [
      { date: '2024-01-01', score: 72 },
      { date: '2024-02-01', score: 75 },
      { date: '2024-03-01', score: 76 },
      { date: '2024-04-01', score: 78 },
    ],
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-003',
    name: 'Pedro Reyes',
    role: 'passenger',
    score: 62,
    level: 'fair',
    factors: { completion: 70, rating: 3.8, behavior: 65, verification: 100 },
    history: [
      { date: '2024-01-01', score: 68 },
      { date: '2024-02-01', score: 66 },
      { date: '2024-03-01', score: 64 },
      { date: '2024-04-01', score: 62 },
    ],
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-004',
    name: 'Ana Garcia',
    role: 'passenger',
    score: 45,
    level: 'poor',
    factors: { completion: 50, rating: 2.5, behavior: 45, verification: 80 },
    history: [
      { date: '2024-01-01', score: 55 },
      { date: '2024-02-01', score: 52 },
      { date: '2024-03-01', score: 48 },
      { date: '2024-04-01', score: 45 },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-005',
    name: 'Miguel Torres',
    role: 'driver',
    score: 88,
    level: 'good',
    factors: { completion: 92, rating: 4.5, behavior: 88, verification: 100 },
    history: [
      { date: '2024-01-01', score: 82 },
      { date: '2024-02-01', score: 85 },
      { date: '2024-03-01', score: 86 },
      { date: '2024-04-01', score: 88 },
    ],
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-006',
    name: 'Sofia Lim',
    role: 'passenger',
    score: 96,
    level: 'excellent',
    factors: { completion: 100, rating: 4.9, behavior: 95, verification: 100 },
    history: [
      { date: '2024-01-01', score: 92 },
      { date: '2024-02-01', score: 94 },
      { date: '2024-03-01', score: 95 },
      { date: '2024-04-01', score: 96 },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Calculate stats from scores
function calculateStats(scores: TrustScore[]): TrustScoreStats {
  const totalUsers = scores.length;
  const averageScore = totalUsers > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalUsers)
    : 0;
  const excellentCount = scores.filter(s => s.level === 'excellent').length;
  const goodCount = scores.filter(s => s.level === 'good').length;
  const fairCount = scores.filter(s => s.level === 'fair').length;
  const poorCount = scores.filter(s => s.level === 'poor').length;
  const flaggedUsers = scores.filter(s => s.score < 50).length;

  return {
    totalUsers,
    averageScore,
    excellentCount,
    goodCount,
    fairCount,
    poorCount,
    flaggedUsers,
  };
}

// Fetch trust scores
export function useTrustScores(filters: TrustScoresFilters = {}) {
  const { role, level, searchQuery, pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['fraud', 'trust-scores', filters],
    queryFn: async (): Promise<TrustScoresResponse> => {
      try {
        const params = new URLSearchParams();
        params.append('page', pageNumber.toString());
        params.append('limit', pageSize.toString());
        if (role?.length) params.append('role', role.join(','));
        if (level?.length) params.append('level', level.join(','));
        if (searchQuery) params.append('search', searchQuery);

        const response = await apiClient.get<TrustScoresResponse>(
          `api/fraud/trust-scores?${params.toString()}`
        );

        // Return mock data if API returns empty
        if (!response.items || response.items.length === 0) {
          return applyFilters(mockScores, role, level, searchQuery, pageNumber, pageSize);
        }

        return response;
      } catch (error) {
        // Return mock data on error
        return applyFilters(mockScores, role, level, searchQuery, pageNumber, pageSize);
      }
    },
  });
}

// Fetch trust score statistics
export function useTrustScoreStats() {
  return useQuery({
    queryKey: ['fraud', 'trust-scores', 'stats'],
    queryFn: async (): Promise<TrustScoreStats> => {
      try {
        const response = await apiClient.get<TrustScoreStats>('api/fraud/trust-scores/stats');
        return response;
      } catch (error) {
        // Return calculated stats from mock data on error
        return calculateStats(mockScores);
      }
    },
  });
}

// Get single trust score
export function useTrustScore(userId: string | undefined) {
  return useQuery({
    queryKey: ['fraud', 'trust-score', userId],
    queryFn: async (): Promise<TrustScore | null> => {
      if (!userId) return null;
      try {
        const response = await apiClient.get<TrustScore>(`api/fraud/trust-scores/${userId}`);
        return response;
      } catch (error) {
        // Return mock score if API fails
        const mockScore = mockScores.find(s => s.userId === userId);
        return mockScore || null;
      }
    },
    enabled: !!userId,
  });
}

// Update trust score
export function useUpdateTrustScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; score: number; reason: string }) => {
      const response = await apiClient.patch(`api/fraud/trust-scores/${data.userId}`, {
        score: data.score,
        reason: data.reason,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fraud', 'trust-score', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['fraud', 'trust-scores'] });
    },
  });
}

// Recalculate trust score
export function useRecalculateTrustScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post(`api/fraud/trust-scores/${userId}/recalculate`, {});
      return response;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['fraud', 'trust-score', userId] });
      queryClient.invalidateQueries({ queryKey: ['fraud', 'trust-scores'] });
    },
  });
}

// Helper function to apply filters to mock data
function applyFilters(
  items: TrustScore[],
  role: ('driver' | 'passenger')[] | undefined,
  level: ('excellent' | 'good' | 'fair' | 'poor')[] | undefined,
  searchQuery: string | undefined,
  pageNumber: number,
  pageSize: number
): TrustScoresResponse {
  let filteredItems = [...items];

  if (role && role.length > 0) {
    filteredItems = filteredItems.filter(i => role.includes(i.role));
  }

  if (level && level.length > 0) {
    filteredItems = filteredItems.filter(i => level.includes(i.level));
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(i =>
      i.userId.toLowerCase().includes(query) ||
      i.name.toLowerCase().includes(query)
    );
  }

  const total = filteredItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total,
    pageNumber,
    pageSize,
    totalPages,
  };
}
