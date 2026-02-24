/**
 * Earnings Service
 * Handles earnings data operations, reports, and payouts
 */

import { apiClient } from '@/lib/api/client';

// Query keys for earnings
export const EARNINGS_QUERY_KEYS = {
  dashboard: 'earningsDashboard',
  kpis: 'earningsKpis',
  breakdown: 'earningsBreakdown',
  leaderboard: 'earningsLeaderboard',
  payouts: 'payoutHistory',
  deductions: 'deductionsSummary',
  reports: 'earningsReports',
} as const;

// Earnings KPI data
export interface EarningsKPIs {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  todayChange: number;
  weekChange: number;
  monthChange: number;
  pendingChange: number;
}

// Earnings by trip type
export interface EarningsByTripType {
  type: string;
  amount: number;
  count: number;
  percentage: number;
}

// Daily earnings
export interface DailyEarnings {
  date: string;
  day: string;
  amount: number;
  trips: number;
  bonuses: number;
  deductions: number;
}

// Driver earnings entry
export interface DriverEarningsEntry {
  driverId: string;
  driverName: string;
  email: string;
  phone: string;
  avatar?: string;
  tier: string;
  totalEarnings: number;
  tripEarnings: number;
  bonuses: number;
  penalties: number;
  netEarnings: number;
  tripsCompleted: number;
  rating: number;
  lastPayoutDate?: string;
}

// Payout entry
export interface PayoutEntry {
  id: string;
  driverId: string;
  driverName: string;
  amount: number;
  method: 'BankTransfer' | 'GCash' | 'Maya' | 'Cash';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  requestedAt: string;
  processedAt?: string;
  reference?: string;
  failureReason?: string;
}

// Deduction entry
export interface DeductionEntry {
  id: string;
  type: 'PlatformFee' | 'Tax' | 'Penalty' | 'Adjustment' | 'Insurance' | 'Bond';
  description: string;
  amount: number;
  count: number;
  percentage: number;
}

// Deductions summary
export interface DeductionsSummary {
  totalDeductions: number;
  breakdown: DeductionEntry[];
  byCategory: Record<string, number>;
}

// Earnings filters
export interface EarningsFilters {
  startDate?: string;
  endDate?: string;
  driverId?: string;
  tripType?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Payout filters
export interface PayoutFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  driverId?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Export request
export interface ExportEarningsRequest {
  format: 'Excel' | 'CSV' | 'PDF';
  startDate: string;
  endDate: string;
  driverIds?: string[];
  includeBreakdown?: boolean;
  includeDeductions?: boolean;
}

// Process payout request
export interface ProcessPayoutRequest {
  driverIds: string[];
  periodStart: string;
  periodEnd: string;
  payoutMethod: 'BankTransfer' | 'GCash' | 'Maya' | 'Cash';
  scheduledDate?: string;
}

// Mock data generators
const generateMockKPIs = (): EarningsKPIs => ({
  today: 48500,
  thisWeek: 2845600,
  thisMonth: 12584000,
  pending: 324500,
  todayChange: 12.5,
  weekChange: 15.3,
  monthChange: 18.7,
  pendingChange: -5.2,
});

const generateMockDailyEarnings = (): DailyEarnings[] => [
  { date: '2026-02-11', day: 'Mon', amount: 380000, trips: 1420, bonuses: 15000, deductions: 8500 },
  { date: '2026-02-12', day: 'Tue', amount: 420000, trips: 1580, bonuses: 18000, deductions: 9200 },
  { date: '2026-02-13', day: 'Wed', amount: 390000, trips: 1450, bonuses: 16500, deductions: 8800 },
  { date: '2026-02-14', day: 'Thu', amount: 450000, trips: 1680, bonuses: 22000, deductions: 10500 },
  { date: '2026-02-15', day: 'Fri', amount: 520000, trips: 1950, bonuses: 28000, deductions: 12000 },
  { date: '2026-02-16', day: 'Sat', amount: 580000, trips: 2150, bonuses: 35000, deductions: 13500 },
  { date: '2026-02-17', day: 'Sun', amount: 48500, trips: 180, bonuses: 2500, deductions: 1200 },
];

const generateMockTripTypeBreakdown = (): EarningsByTripType[] => [
  { type: 'Standard', amount: 1845600, count: 8540, percentage: 64.8 },
  { type: 'Premium', amount: 568000, count: 2100, percentage: 20.0 },
  { type: 'Pool', amount: 285000, count: 1650, percentage: 10.0 },
  { type: 'XL', amount: 147000, count: 480, percentage: 5.2 },
];

const generateMockLeaderboard = (): DriverEarningsEntry[] => [
  { driverId: '1', driverName: 'Juan Dela Cruz', email: 'juan@example.com', phone: '+639123456789', tier: 'Diamond', totalEarnings: 68500, tripEarnings: 62000, bonuses: 5000, penalties: 0, netEarnings: 67000, tripsCompleted: 245, rating: 4.9, lastPayoutDate: '2026-02-10' },
  { driverId: '2', driverName: 'Maria Santos', email: 'maria@example.com', phone: '+639123456790', tier: 'Platinum', totalEarnings: 62400, tripEarnings: 58000, bonuses: 5000, penalties: 100, netEarnings: 62900, tripsCompleted: 228, rating: 4.8, lastPayoutDate: '2026-02-10' },
  { driverId: '3', driverName: 'Pedro Reyes', email: 'pedro@example.com', phone: '+639123456791', tier: 'Platinum', totalEarnings: 58900, tripEarnings: 54500, bonuses: 4500, penalties: 100, netEarnings: 58900, tripsCompleted: 210, rating: 4.7, lastPayoutDate: '2026-02-09' },
  { driverId: '4', driverName: 'Ana Garcia', email: 'ana@example.com', phone: '+639123456792', tier: 'Gold', totalEarnings: 54200, tripEarnings: 50000, bonuses: 4500, penalties: 300, netEarnings: 54200, tripsCompleted: 198, rating: 4.8, lastPayoutDate: '2026-02-10' },
  { driverId: '5', driverName: 'Carlos Mendoza', email: 'carlos@example.com', phone: '+639123456793', tier: 'Gold', totalEarnings: 51800, tripEarnings: 48000, bonuses: 4000, penalties: 200, netEarnings: 51800, tripsCompleted: 185, rating: 4.6, lastPayoutDate: '2026-02-08' },
  { driverId: '6', driverName: 'Sofia Rivera', email: 'sofia@example.com', phone: '+639123456794', tier: 'Silver', totalEarnings: 48500, tripEarnings: 45000, bonuses: 3500, penalties: 0, netEarnings: 48500, tripsCompleted: 172, rating: 4.7, lastPayoutDate: '2026-02-10' },
  { driverId: '7', driverName: 'Miguel Torres', email: 'miguel@example.com', phone: '+639123456795', tier: 'Silver', totalEarnings: 46200, tripEarnings: 43000, bonuses: 3500, penalties: 300, netEarnings: 46200, tripsCompleted: 165, rating: 4.5, lastPayoutDate: '2026-02-09' },
  { driverId: '8', driverName: 'Isabella Cruz', email: 'isabella@example.com', phone: '+639123456796', tier: 'Bronze', totalEarnings: 42800, tripEarnings: 40000, bonuses: 3000, penalties: 200, netEarnings: 42800, tripsCompleted: 152, rating: 4.6, lastPayoutDate: '2026-02-10' },
  { driverId: '9', driverName: 'Rafael Lim', email: 'rafael@example.com', phone: '+639123456797', tier: 'Bronze', totalEarnings: 39500, tripEarnings: 37000, bonuses: 2800, penalties: 300, netEarnings: 39500, tripsCompleted: 140, rating: 4.4, lastPayoutDate: '2026-02-08' },
  { driverId: '10', driverName: 'Carmen Tan', email: 'carmen@example.com', phone: '+639123456798', tier: 'Bronze', totalEarnings: 36800, tripEarnings: 34500, bonuses: 2500, penalties: 200, netEarnings: 36800, tripsCompleted: 128, rating: 4.5, lastPayoutDate: '2026-02-09' },
];

const generateMockPayouts = (): PayoutEntry[] => [
  { id: 'PAY-001', driverId: '1', driverName: 'Juan Dela Cruz', amount: 67000, method: 'GCash', status: 'Completed', requestedAt: '2026-02-10T08:00:00Z', processedAt: '2026-02-10T10:30:00Z', reference: 'GC-20260210-001' },
  { id: 'PAY-002', driverId: '2', driverName: 'Maria Santos', amount: 62900, method: 'BankTransfer', status: 'Completed', requestedAt: '2026-02-10T08:15:00Z', processedAt: '2026-02-10T11:00:00Z', reference: 'BT-20260210-002' },
  { id: 'PAY-003', driverId: '4', driverName: 'Ana Garcia', amount: 54200, method: 'Maya', status: 'Completed', requestedAt: '2026-02-10T09:00:00Z', processedAt: '2026-02-10T12:15:00Z', reference: 'MY-20260210-003' },
  { id: 'PAY-004', driverId: '6', driverName: 'Sofia Rivera', amount: 48500, method: 'GCash', status: 'Completed', requestedAt: '2026-02-10T09:30:00Z', processedAt: '2026-02-10T13:00:00Z', reference: 'GC-20260210-004' },
  { id: 'PAY-005', driverId: '8', driverName: 'Isabella Cruz', amount: 42800, method: 'BankTransfer', status: 'Processing', requestedAt: '2026-02-10T10:00:00Z', reference: 'BT-20260210-005' },
  { id: 'PAY-006', driverId: '3', driverName: 'Pedro Reyes', amount: 58900, method: 'GCash', status: 'Pending', requestedAt: '2026-02-11T08:00:00Z' },
  { id: 'PAY-007', driverId: '5', driverName: 'Carlos Mendoza', amount: 51800, method: 'Maya', status: 'Pending', requestedAt: '2026-02-11T08:30:00Z' },
  { id: 'PAY-008', driverId: '7', driverName: 'Miguel Torres', amount: 46200, method: 'BankTransfer', status: 'Failed', requestedAt: '2026-02-09T10:00:00Z', processedAt: '2026-02-09T14:00:00Z', failureReason: 'Invalid account number' },
];

const generateMockDeductions = (): DeductionsSummary => ({
  totalDeductions: 145200,
  breakdown: [
    { id: '1', type: 'PlatformFee', description: 'Platform Commission (15%)', amount: 85200, count: 8920, percentage: 58.7 },
    { id: '2', type: 'Tax', description: 'Withholding Tax', amount: 28400, count: 8920, percentage: 19.6 },
    { id: '3', type: 'Penalty', description: 'Cancellation Penalties', amount: 18500, count: 145, percentage: 12.7 },
    { id: '4', type: 'Insurance', description: 'Insurance Premium', amount: 8500, count: 156, percentage: 5.9 },
    { id: '5', type: 'Bond', description: 'Performance Bond', amount: 4600, count: 12, percentage: 3.1 },
  ],
  byCategory: {
    PlatformFee: 85200,
    Tax: 28400,
    Penalty: 18500,
    Insurance: 8500,
    Bond: 4600,
  },
});

// Service functions
export async function getEarningsKPIs(_filters?: EarningsFilters): Promise<EarningsKPIs> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(generateMockKPIs()), 300);
  });
}

export async function getDailyEarnings(_filters?: EarningsFilters): Promise<DailyEarnings[]> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(generateMockDailyEarnings()), 300);
  });
}

export async function getEarningsByTripType(_filters?: EarningsFilters): Promise<EarningsByTripType[]> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(generateMockTripTypeBreakdown()), 300);
  });
}

export async function getDriverLeaderboard(_filters?: EarningsFilters): Promise<{ items: DriverEarningsEntry[]; total: number }> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve({ items: generateMockLeaderboard(), total: 156 }), 300);
  });
}

export async function getPayoutHistory(filters?: PayoutFilters): Promise<{ items: PayoutEntry[]; total: number }> {
  // Mock implementation - replace with actual API call
  const items = generateMockPayouts();
  const filtered = filters?.status 
    ? items.filter(p => p.status === filters.status)
    : items;
  
  return new Promise((resolve) => {
    setTimeout(() => resolve({ items: filtered, total: filtered.length }), 300);
  });
}

export async function getDeductionsSummary(_filters?: EarningsFilters): Promise<DeductionsSummary> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(generateMockDeductions()), 300);
  });
}

export async function exportEarningsReport(request: ExportEarningsRequest): Promise<Blob> {
  // Mock implementation - replace with actual API call
  // Exporting earnings report
  
  // Create a mock CSV content
  const csvContent = 'Driver ID,Driver Name,Total Earnings,Trips,Period\n' +
    generateMockLeaderboard().map(d => `${d.driverId},${d.driverName},${d.totalEarnings},${d.tripsCompleted},${request.startDate} to ${request.endDate}`).join('\n');
  
  return new Blob([csvContent], { type: 'text/csv' });
}

export async function processPayout(request: ProcessPayoutRequest): Promise<{ success: boolean; processedCount: number }> {
  // Mock implementation - replace with actual API call
  // Processing payout
  
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, processedCount: request.driverIds.length }), 500);
  });
}

export async function retryFailedPayout(payoutId: string): Promise<{ success: boolean }> {
  // Mock implementation - replace with actual API call
  // Retrying payout
  
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 500);
  });
}
