/**
 * Fraud Detection Service
 * Manages fraud alerts, trust scores, and fraud-related operations
 */

import { apiClient } from '@/lib/api/client';

// Types
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

export interface FraudAlertInput {
  type: string;
  riskLevel: 'high' | 'medium' | 'low';
  target: {
    name: string;
    role: string;
  };
  confidence: number;
  indicators: string[];
}

export interface TrustScore {
  userId: string;
  name: string;
  role: 'driver' | 'passenger';
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: {
    completion: number;
    rating: number;
    behavior: number;
    verification: number;
  };
  history: {
    date: string;
    score: number;
  }[];
  lastUpdated: string;
}

export interface FraudStats {
  totalAlerts: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  pendingCount: number;
  investigatingCount: number;
  confirmedCount: number;
  falsePositiveCount: number;
  blockedTransactions: number;
  savings: number;
}

export interface FraudDashboardData {
  flaggedAccounts: number;
  blockedTransactions: number;
  falsePositiveRate: number;
  savings: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  topFraudTypes: {
    type: string;
    count: number;
  }[];
  recentAlerts: FraudAlert[];
}

// API Endpoints
const FRAUD_ENDPOINTS = {
  // Alerts
  getAlerts: '/api/fraud/alerts',
  getAlert: (id: string) => `/api/fraud/alerts/${id}`,
  createAlert: '/api/fraud/alerts',
  updateAlertStatus: (id: string) => `/api/fraud/alerts/${id}/status`,
  bulkUpdateStatus: '/api/fraud/alerts/bulk-update',
  deleteAlert: (id: string) => `/api/fraud/alerts/${id}`,
  
  // Trust Scores
  getTrustScores: '/api/fraud/trust-scores',
  getTrustScore: (userId: string) => `/api/fraud/trust-scores/${userId}`,
  updateTrustScore: (userId: string) => `/api/fraud/trust-scores/${userId}`,
  recalculateTrustScore: (userId: string) => `/api/fraud/trust-scores/${userId}/recalculate`,
  
  // Dashboard & Stats
  getDashboard: '/api/fraud/dashboard',
  getStats: '/api/fraud/stats',
};

/**
 * Get fraud alerts with optional filtering
 */
export async function getFraudAlerts(params?: {
  riskLevel?: string;
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: FraudAlert[];
  total: number;
  page: number;
  limit: number;
}> {
  const queryParams = new URLSearchParams();
  
  if (params?.riskLevel) queryParams.append('riskLevel', params.riskLevel);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = queryParams.toString() 
    ? `${FRAUD_ENDPOINTS.getAlerts}?${queryParams.toString()}`
    : FRAUD_ENDPOINTS.getAlerts;

  return apiClient.get(url);
}

/**
 * Get a single fraud alert by ID
 */
export async function getFraudAlert(alertId: string): Promise<FraudAlert> {
  return apiClient.get(FRAUD_ENDPOINTS.getAlert(alertId));
}

/**
 * Create a new fraud alert
 */
export async function createFraudAlert(input: FraudAlertInput): Promise<FraudAlert> {
  return apiClient.post(FRAUD_ENDPOINTS.createAlert, input);
}

/**
 * Update alert status
 */
export async function updateAlertStatus(
  alertId: string, 
  status: FraudAlert['status']
): Promise<FraudAlert> {
  return apiClient.patch(FRAUD_ENDPOINTS.updateAlertStatus(alertId), { status });
}

/**
 * Bulk update alert statuses
 */
export async function bulkUpdateAlertStatus(
  alertIds: string[], 
  status: FraudAlert['status']
): Promise<{ updated: number }> {
  return apiClient.post(FRAUD_ENDPOINTS.bulkUpdateStatus, { alertIds, status });
}

/**
 * Delete a fraud alert
 */
export async function deleteFraudAlert(alertId: string): Promise<void> {
  return apiClient.delete(FRAUD_ENDPOINTS.deleteAlert(alertId));
}

/**
 * Get trust scores with optional filtering
 */
export async function getTrustScores(params?: {
  role?: string;
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: TrustScore[];
  total: number;
  page: number;
  limit: number;
}> {
  const queryParams = new URLSearchParams();
  
  if (params?.role) queryParams.append('role', params.role);
  if (params?.level) queryParams.append('level', params.level);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = queryParams.toString() 
    ? `${FRAUD_ENDPOINTS.getTrustScores}?${queryParams.toString()}`
    : FRAUD_ENDPOINTS.getTrustScores;

  return apiClient.get(url);
}

/**
 * Get a single trust score by user ID
 */
export async function getTrustScore(userId: string): Promise<TrustScore> {
  return apiClient.get(FRAUD_ENDPOINTS.getTrustScore(userId));
}

/**
 * Update trust score for a user
 */
export async function updateTrustScore(
  userId: string, 
  score: number, 
  reason: string
): Promise<TrustScore> {
  return apiClient.patch(FRAUD_ENDPOINTS.updateTrustScore(userId), { score, reason });
}

/**
 * Recalculate trust score for a user
 */
export async function recalculateTrustScore(userId: string): Promise<TrustScore> {
  return apiClient.post(FRAUD_ENDPOINTS.recalculateTrustScore(userId), {});
}

/**
 * Get fraud dashboard data
 */
export async function getFraudDashboard(): Promise<FraudDashboardData> {
  return apiClient.get(FRAUD_ENDPOINTS.getDashboard);
}

/**
 * Get fraud statistics
 */
export async function getFraudStats(): Promise<FraudStats> {
  return apiClient.get(FRAUD_ENDPOINTS.getStats);
}

// Export as a service object for consistency with other services
export const fraudService = {
  getFraudAlerts,
  getFraudAlert,
  createFraudAlert,
  updateAlertStatus,
  bulkUpdateAlertStatus,
  deleteFraudAlert,
  getTrustScores,
  getTrustScore,
  updateTrustScore,
  recalculateTrustScore,
  getFraudDashboard,
  getFraudStats,
};

export default fraudService;
