import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { Order } from '@/types/domain.types';
import { useEffect, useCallback } from 'react';

/**
 * Hook for fetching a single order with real-time updates
 * Includes polling for active orders
 */
export function useOrder(orderId: string, options?: { enablePolling?: boolean }) {
  const { enablePolling = true } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.orders.detail(orderId),
    queryFn: () => apiClient.post<Order>(ENDPOINTS.orders.detail, { orderId }),
    enabled: !!orderId,
    staleTime: 5000,
    // Poll for active orders every 10 seconds
    refetchInterval: (query) => {
      const data = query.state.data as Order | undefined;
      if (!enablePolling || !data) return false;
      const activeStatuses = ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'];
      return activeStatuses.includes(data.status) ? 10000 : false;
    },
  });

  // Manual refresh function
  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    ...query,
    refresh,
  };
}

/**
 * Hook for order actions (cancel, complete, prioritize)
 */
export function useOrderActions(orderId: string) {
  const queryClient = useQueryClient();

  const cancelOrder = useMutation({
    mutationFn: (data: { reason: string; notes?: string }) =>
      apiClient.post(ENDPOINTS.orders.cancel, {
        orderId,
        ...data,
        cancelledBy: 'Admin',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders.list] });
    },
  });

  const completeOrder = useMutation({
    mutationFn: (data?: { notes?: string; forceComplete?: boolean }) =>
      apiClient.post(ENDPOINTS.orders.complete, {
        orderId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders.list] });
    },
  });

  const prioritizeOrder = useMutation({
    mutationFn: (data: { priority: 'Normal' | 'High' | 'Urgent'; reason?: string }) =>
      apiClient.post('AdminDeliveryOrder/PrioritizeOrder', {
        orderId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders.list] });
    },
  });

  return {
    cancelOrder,
    completeOrder,
    prioritizeOrder,
  };
}

/**
 * Hook for tracking order status changes
 */
export function useOrderStatusTracker(orderId: string, onStatusChange?: (newStatus: string, oldStatus: string) => void) {
  const { data: order, dataUpdatedAt } = useOrder(orderId);

  useEffect(() => {
    if (!order) return;

    // Track status changes
    const currentStatus = order.status;
    const previousStatus = (useOrderStatusTracker as unknown as { lastStatus?: string }).lastStatus;

    if (previousStatus && previousStatus !== currentStatus && onStatusChange) {
      onStatusChange(currentStatus, previousStatus);
    }

    (useOrderStatusTracker as unknown as { lastStatus?: string }).lastStatus = currentStatus;
  }, [order, onStatusChange, dataUpdatedAt]);

  return order?.status;
}

/**
 * Hook for getting order statistics
 */
export function useOrderStats(orderId: string) {
  const { data: order } = useOrder(orderId);

  if (!order) {
    return null;
  }

  const timeline = order.timeline;
  const now = new Date();

  // Calculate duration from booking to completion/cancellation
  const bookingTime = timeline.bookedAt ? new Date(timeline.bookedAt) : new Date();
  const endTime = timeline.completedAt || timeline.cancelledAt;
  const duration = endTime
    ? new Date(endTime).getTime() - bookingTime.getTime()
    : now.getTime() - bookingTime.getTime();

  // Calculate response times
  const assignmentTime = timeline.assignedAt
    ? new Date(timeline.assignedAt).getTime() - bookingTime.getTime()
    : null;

  const acceptanceTime = timeline.acceptedAt && timeline.assignedAt
    ? new Date(timeline.acceptedAt).getTime() - new Date(timeline.assignedAt).getTime()
    : null;

  const pickupTime = timeline.pickedUpAt && timeline.arrivedAt
    ? new Date(timeline.pickedUpAt).getTime() - new Date(timeline.arrivedAt).getTime()
    : null;

  return {
    totalDuration: duration,
    assignmentTime,
    acceptanceTime,
    pickupTime,
    isDelayed: duration > order.route.estimatedDuration * 1000 * 1.5, // 50% over estimated
    efficiency: order.route.actualDuration && order.route.estimatedDuration
      ? (order.route.estimatedDuration / order.route.actualDuration) * 100
      : null,
  };
}
