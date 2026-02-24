// Fraud Alerts Hook
// Fetches and manages fraud alert data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface FraudAlert {
  id: string;
  type: string;
  riskLevel: 'high' | 'medium' | 'low';
  status: 'pending' | 'investigating' | 'confirmed' | 'false_positive';
  target: {
    name: string;
    role: string;
  };
  confidence: number;
  indicators: string[];
  actions: string[];
  detectedAt: string;
}

export interface FraudAlertsFilters {
  riskLevel?: ('high' | 'medium' | 'low')[];
  status?: ('pending' | 'investigating' | 'confirmed' | 'false_positive')[];
  type?: string[];
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface FraudAlertsResponse {
  items: FraudAlert[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Mock data for development
const mockAlerts: FraudAlert[] = [
  {
    id: 'FRA-001',
    type: 'fake_gps',
    riskLevel: 'high',
    status: 'investigating',
    target: { name: 'J. Santos', role: 'Driver' },
    confidence: 94,
    indicators: ['GPS spoofing detected', 'Multiple locations in short time', 'Unusual route pattern'],
    actions: ['Flagged for review', 'Temporarily suspended'],
    detectedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-002',
    type: 'payment_fraud',
    riskLevel: 'high',
    status: 'confirmed',
    target: { name: 'M. Cruz', role: 'Customer' },
    confidence: 98,
    indicators: ['Multiple failed payments', 'Stolen card used', 'Chargeback history'],
    actions: ['Account blocked', 'Transactions reversed'],
    detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-003',
    type: 'multiple_accounts',
    riskLevel: 'medium',
    status: 'pending',
    target: { name: 'A. Reyes', role: 'Driver' },
    confidence: 76,
    indicators: ['Same device used', 'Similar personal info', 'Linked phone numbers'],
    actions: ['Under investigation'],
    detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-004',
    type: 'identity_theft',
    riskLevel: 'high',
    status: 'investigating',
    target: { name: 'L. Garcia', role: 'Customer' },
    confidence: 88,
    indicators: ['Document mismatch', 'Photo verification failed', 'Behavioral anomaly'],
    actions: ['Additional verification requested'],
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-005',
    type: 'rating_manipulation',
    riskLevel: 'low',
    status: 'false_positive',
    target: { name: 'P. Mendoza', role: 'Driver' },
    confidence: 62,
    indicators: ['Unusual rating pattern', 'Multiple reviews from same IP'],
    actions: ['Cleared', 'Monitoring continued'],
    detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

// Fetch fraud alerts
export function useFraudAlerts(filters: FraudAlertsFilters = {}) {
  const { riskLevel, status, type, searchQuery, pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['fraud', 'alerts', filters],
    queryFn: async (): Promise<FraudAlertsResponse> => {
      try {
        const params = new URLSearchParams();
        params.append('page', pageNumber.toString());
        params.append('limit', pageSize.toString());
        if (riskLevel?.length) params.append('riskLevel', riskLevel.join(','));
        if (status?.length) params.append('status', status.join(','));
        if (type?.length) params.append('type', type.join(','));
        if (searchQuery) params.append('search', searchQuery);

        const response = await apiClient.get<FraudAlertsResponse>(
          `api/fraud/alerts?${params.toString()}`
        );

        // Return mock data if API returns empty
        if (!response.items || response.items.length === 0) {
          return applyFilters(mockAlerts, riskLevel, status, type, searchQuery, pageNumber, pageSize);
        }

        return response;
      } catch (error) {
        // Return mock data on error
        return applyFilters(mockAlerts, riskLevel, status, type, searchQuery, pageNumber, pageSize);
      }
    },
  });
}

// Get single fraud alert
export function useFraudAlert(alertId: string | undefined) {
  return useQuery({
    queryKey: ['fraud', 'alert', alertId],
    queryFn: async (): Promise<FraudAlert | null> => {
      if (!alertId) return null;
      try {
        const response = await apiClient.get<FraudAlert>(`api/fraud/alerts/${alertId}`);
        return response;
      } catch (error) {
        // Return mock alert if API fails
        const mockAlert = mockAlerts.find(a => a.id === alertId);
        return mockAlert || null;
      }
    },
    enabled: !!alertId,
  });
}

// Update alert status
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { alertId: string; status: FraudAlert['status'] }) => {
      const response = await apiClient.patch(`api/fraud/alerts/${data.alertId}/status`, {
        status: data.status,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fraud', 'alert', variables.alertId] });
      queryClient.invalidateQueries({ queryKey: ['fraud', 'alerts'] });
    },
  });
}

// Bulk update alert status
export function useBulkUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { alertIds: string[]; status: FraudAlert['status'] }) => {
      const response = await apiClient.post('api/fraud/alerts/bulk-update', {
        alertIds: data.alertIds,
        status: data.status,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud', 'alerts'] });
    },
  });
}

// Helper function to apply filters to mock data
function applyFilters(
  items: FraudAlert[],
  riskLevel: ('high' | 'medium' | 'low')[] | undefined,
  status: ('pending' | 'investigating' | 'confirmed' | 'false_positive')[] | undefined,
  type: string[] | undefined,
  searchQuery: string | undefined,
  pageNumber: number,
  pageSize: number
): FraudAlertsResponse {
  let filteredItems = [...items];

  if (riskLevel && riskLevel.length > 0) {
    filteredItems = filteredItems.filter(i => riskLevel.includes(i.riskLevel));
  }

  if (status && status.length > 0) {
    filteredItems = filteredItems.filter(i => status.includes(i.status));
  }

  if (type && type.length > 0) {
    filteredItems = filteredItems.filter(i => type.includes(i.type));
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(i =>
      i.id.toLowerCase().includes(query) ||
      i.target.name.toLowerCase().includes(query) ||
      i.type.toLowerCase().includes(query)
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
