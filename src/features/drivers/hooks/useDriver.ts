import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { Driver } from '@/types/domain.types';

export interface DriverDetailResponse extends Driver {
  // Additional fields that may come from the API
  metadata?: {
    lastLoginAt?: string;
    lastActiveAt?: string;
    deviceInfo?: {
      platform: string;
      version: string;
    };
  };
}

/**
 * Hook to fetch detailed information about a single driver
 */
export function useDriverDetail(driverId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.riders.detail(driverId || ''),
    queryFn: async () => {
      if (!driverId) return null;
      const response = await apiClient.post<DriverDetailResponse>(
        ENDPOINTS.riders.detail, 
        { driverId }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch driver statistics summary
 */
export interface DriverStatsSummary {
  driverId: string;
  todayStats: {
    trips: number;
    earnings: number;
    onlineHours: number;
  };
  weekStats: {
    trips: number;
    earnings: number;
    onlineHours: number;
  };
  monthStats: {
    trips: number;
    earnings: number;
    onlineHours: number;
  };
}

export function useDriverStats(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driverStats', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      // This would be a real API endpoint in production
      const response = await apiClient.post<DriverStatsSummary>(
        'AdminXpressRider/GetRiderStats',
        { driverId }
      );
      return response;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch driver's recent trips
 */
export interface DriverRecentTrip {
  orderId: string;
  status: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: number;
  duration: number;
  fare: number;
  customerRating?: number;
  completedAt?: string;
}

export function useDriverRecentTrips(driverId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ['driverRecentTrips', driverId, limit],
    queryFn: async () => {
      if (!driverId) return [];
      const response = await apiClient.post<{ trips: DriverRecentTrip[] }>(
        'AdminXpressRider/GetRiderRecentTrips',
        { driverId, limit }
      );
      return response?.trips || [];
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to update driver's trust score (admin only)
 */
export interface UpdateTrustScoreRequest {
  driverId: string;
  component: 'reliability' | 'safety' | 'customerService' | 'compliance';
  score: number;
  reason: string;
}

export function useUpdateDriverTrustScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTrustScoreRequest) => {
      const response = await apiClient.post(
        'AdminXpressRider/UpdateTrustScore',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.riders.detail(variables.driverId) 
      });
    },
  });
}

/**
 * Hook to verify driver documents
 */
export interface VerifyDocumentRequest {
  driverId: string;
  documentId: string;
  status: 'Approved' | 'Rejected';
  notes?: string;
}

export function useVerifyDriverDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyDocumentRequest) => {
      const response = await apiClient.post(
        'AdminXpressRider/VerifyDocument',
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.riders.detail(variables.driverId) 
      });
    },
  });
}
