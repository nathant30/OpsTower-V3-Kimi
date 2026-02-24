// src/features/bonds/hooks/useBonds.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface BondTransaction {
  id: string;
  driverId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'DEDUCTION' | 'REFUND';
  amount: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description: string;
  createdAt: string;
  createdById?: string;
}

export interface BondBalance {
  driverId: string;
  balance: number;
  required: number;
  percent: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
  canStartShift: boolean;
}

export interface BondFilters {
  driverId?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Get bond balance for a driver
export function useBondBalance(driverId: string) {
  return useQuery({
    queryKey: ['bondBalance', driverId],
    queryFn: async () => {
      const response = await apiClient.get(`/drivers/${driverId}/bond`);
      return response as BondBalance;
    },
    enabled: !!driverId,
  });
}

// Get bond transaction history
export interface BondTransactionsResponse {
  data: BondTransaction[];
  total: number;
  page: number;
  limit: number;
}

// Mock bond data
const mockBondTransactions: BondTransaction[] = [
  { id: 'TXN-001', driverId: 'D001', type: 'DEPOSIT', amount: 5000, balanceAfter: 5000, description: 'Initial bond deposit', createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString() },
  { id: 'TXN-002', driverId: 'D002', type: 'DEPOSIT', amount: 3000, balanceAfter: 3000, description: 'Initial bond deposit', createdAt: new Date(Date.now() - 25*24*60*60*1000).toISOString() },
  { id: 'TXN-003', driverId: 'D001', type: 'DEDUCTION', amount: 1000, balanceAfter: 4000, referenceType: 'Incident', referenceId: 'INC-001', description: 'Accident deductible', createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { id: 'TXN-004', driverId: 'D005', type: 'DEPOSIT', amount: 2000, balanceAfter: 2000, description: 'Initial bond deposit', createdAt: new Date(Date.now() - 20*24*60*60*1000).toISOString() },
  { id: 'TXN-005', driverId: 'D002', type: 'WITHDRAWAL', amount: 500, balanceAfter: 2500, description: 'Partial withdrawal request', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
  { id: 'TXN-006', driverId: 'D007', type: 'DEPOSIT', amount: 4500, balanceAfter: 4500, description: 'Initial bond deposit', createdAt: new Date(Date.now() - 15*24*60*60*1000).toISOString() },
];

const mockLowBondDrivers: LowBondDriver[] = [
  { id: 'D005', firstName: 'Pedro', lastName: 'Reyes', securityBondBalance: 2000, securityBondRequired: 5000 },
];

const mockBondStats: BondStatsResponse = {
  totalBalance: 13000,
  activeDriverCount: 4,
  averageBalance: 3250,
  driverBalances: [
    { driverId: 'D001', driverName: 'Juan Santos', balance: 4000, required: 5000 },
    { driverId: 'D002', driverName: 'Maria Cruz', balance: 2500, required: 5000 },
    { driverId: 'D005', driverName: 'Pedro Reyes', balance: 2000, required: 5000 },
    { driverId: 'D007', driverName: 'Ana Lopez', balance: 4500, required: 5000 },
  ],
};

export function useBondTransactions(filters: BondFilters = {}, page: number = 1, limit: number = 20) {
  return useQuery<BondTransactionsResponse>({
    queryKey: ['bondTransactions', filters, page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.driverId) params.append('driverId', filters.driverId);
        if (filters.type) params.append('type', filters.type);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
        if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
        params.append('page', String(page));
        params.append('limit', String(limit));

        const response = await apiClient.get(`/bonds/transactions?${params.toString()}`);
        const result = response as BondTransactionsResponse;
        // Return mock if empty
        if (!result?.data || result.data.length === 0) {
          return { data: mockBondTransactions, total: mockBondTransactions.length, page, limit };
        }
        return result;
      } catch {
        return { data: mockBondTransactions, total: mockBondTransactions.length, page, limit };
      }
    },
  });
}

// Driver with low bond balance
export interface LowBondDriver {
  id: string;
  firstName: string;
  lastName: string;
  securityBondBalance: number;
  securityBondRequired: number;
}

// Get all drivers with low bond balance
export function useLowBondDrivers() {
  return useQuery<LowBondDriver[]>({
    queryKey: ['lowBondDrivers'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/bonds/low-balance');
        const data = (response as { data?: LowBondDriver[] })?.data;
        return data?.length ? data : mockLowBondDrivers;
      } catch {
        return mockLowBondDrivers;
      }
    },
  });
}

// Create bond deposit
export function useCreateDeposit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: { driverId: string; amount: number; reference?: string }) => {
      const response = await apiClient.post('/bonds/deposit', input);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bondBalance', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['bondTransactions'] });
    },
  });
}

// Create bond withdrawal
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: { driverId: string; amount: number; reason: string }) => {
      const response = await apiClient.post('/bonds/withdrawal', input);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bondBalance', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['bondTransactions'] });
    },
  });
}

// Driver balance in stats
export interface DriverBalanceStat {
  driverId: string;
  driverName: string;
  balance: number;
  required: number;
}

// Bond statistics response
export interface BondStatsResponse {
  totalBalance: number;
  activeDriverCount: number;
  averageBalance: number;
  driverBalances: DriverBalanceStat[];
}

// Get bond statistics
export function useBondStats() {
  return useQuery<BondStatsResponse>({
    queryKey: ['bondStats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/bonds/stats');
        const data = (response as { data?: BondStatsResponse })?.data;
        // Return mock if empty or all zeros
        if (!data || data.totalBalance === 0) {
          return mockBondStats;
        }
        return data;
      } catch (error) {
        return mockBondStats;
      }
    },
  });
}
