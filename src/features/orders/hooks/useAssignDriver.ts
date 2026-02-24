import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import { showSuccess, showError } from '@/lib/stores/ui.store';
import type { NearbyDriver } from './useOrders';

export interface AssignDriverPayload {
  orderId: string;
  riderId: string;
  notes?: string;
  notifyRider?: boolean;
}

export interface AssignDriverResult {
  success: boolean;
  message?: string;
  assignmentId?: string;
}

/**
 * Hook for assigning a driver to a single order
 */
export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignDriverPayload): Promise<AssignDriverResult> => {
      const response = await apiClient.post<AssignDriverResult>(ENDPOINTS.orders.assign, {
        orderId: data.orderId,
        riderId: data.riderId,
        notes: data.notes,
        notifyRider: data.notifyRider ?? true,
      });
      return response;
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        showSuccess(result.message || 'Driver assigned successfully');
      }
      // Invalidate order detail
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(variables.orderId) });
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders.list] });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to assign driver');
    },
  });
}

/**
 * Hook for bulk assigning a driver to multiple orders
 */
export function useBulkAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderIds: string[];
      riderId: string;
      notes?: string;
    }): Promise<{ success: boolean; failedOrders?: string[]; message?: string }> => {
      const response = await apiClient.post<{ success: boolean; failedOrders?: string[]; message?: string }>(ENDPOINTS.orders.assign, {
        orderIds: data.orderIds,
        riderId: data.riderId,
        notes: data.notes,
        isBulk: true,
      });
      return response;
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        const successCount = variables.orderIds.length - (result.failedOrders?.length || 0);
        showSuccess(`Driver assigned to ${successCount} order(s)`);
      }
      // Invalidate all order details
      variables.orderIds.forEach((orderId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(orderId) });
      });
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders.list] });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to assign driver to orders');
    },
  });
}

/**
 * Hook for managing driver assignment modal state
 */
export function useAssignDriverModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const open = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedDriverId(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedOrderId(null);
    setSelectedDriverId(null);
  }, []);

  const selectDriver = useCallback((driverId: string) => {
    setSelectedDriverId(driverId);
  }, []);

  return {
    isOpen,
    selectedOrderId,
    selectedDriverId,
    open,
    close,
    selectDriver,
  };
}

/**
 * Hook for managing the assign driver flow with nearby drivers
 */
export function useAssignDriverFlow(orderId: string, _pickupLocation: { lat: number; lng: number } | null) {
  const [selectedDriver, setSelectedDriver] = useState<NearbyDriver | null>(null);
  const [assignNotes, setAssignNotes] = useState('');
  const assignMutation = useAssignDriver();

  const handleSelectDriver = useCallback((driver: NearbyDriver) => {
    setSelectedDriver(driver);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedDriver(null);
  }, []);

  const handleAssign = useCallback(async (): Promise<boolean> => {
    if (!selectedDriver || !orderId) return false;

    try {
      await assignMutation.mutateAsync({
        orderId,
        riderId: selectedDriver.riderId || selectedDriver.driverId,
        notes: assignNotes,
      });
      return true;
    } catch {
      return false;
    }
  }, [selectedDriver, orderId, assignNotes, assignMutation]);

  return {
    selectedDriver,
    assignNotes,
    setAssignNotes,
    handleSelectDriver,
    handleClearSelection,
    handleAssign,
    isAssigning: assignMutation.isPending,
    assignError: assignMutation.error,
  };
}

/**
 * Compare two drivers for sorting by various criteria
 */
export function compareDrivers(
  a: NearbyDriver,
  b: NearbyDriver,
  sortBy: 'distance' | 'eta' | 'rating' | 'trustScore' = 'distance'
): number {
  switch (sortBy) {
    case 'distance':
      return a.distance - b.distance;
    case 'eta':
      return a.eta - b.eta;
    case 'rating':
      return b.rating - a.rating;
    case 'trustScore':
      return b.trustScore - a.trustScore;
    default:
      return 0;
  }
}

/**
 * Filter drivers by various criteria
 */
export function filterDrivers(
  drivers: NearbyDriver[],
  filters: {
    maxDistance?: number;
    maxEta?: number;
    minRating?: number;
    vehicleType?: string;
    status?: string;
  }
): NearbyDriver[] {
  return drivers.filter((driver) => {
    if (filters.maxDistance && driver.distance > filters.maxDistance) return false;
    if (filters.maxEta && driver.eta > filters.maxEta) return false;
    if (filters.minRating && driver.rating < filters.minRating) return false;
    if (filters.vehicleType && driver.vehicleType !== filters.vehicleType) return false;
    if (filters.status && driver.status !== filters.status) return false;
    return true;
  });
}
