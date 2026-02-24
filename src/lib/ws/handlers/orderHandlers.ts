/**
 * Order Event Handlers
 * Handles real-time order events and updates React Query cache
 */

import { queryClient } from '@/lib/api/queryClient';
import { showSuccess, showInfo, showWarning } from '@/lib/stores/ui.store';
import { playNotificationSound } from '@/lib/utils/sound';
import type { 
  OrderCreatedEvent, 
  OrderUpdatedEvent, 
  OrderAssignedEvent,
  OrderCompletedEvent,
  OrderCancelledEvent 
} from '../useWebSocket';
import type { Order } from '@/types/domain.types';

/**
 * Handle order.created event
 * Adds new order to cache and shows notification
 */
export function handleOrderCreated(event: OrderCreatedEvent): void {
  const order = event.data as Order;
  
  // Add to orders list cache
  queryClient.setQueryData<Order[]>(['orders', 'list'], (old) => {
    if (!old) return [order];
    // Prevent duplicates
    if (old.some((o) => o.orderId === order.orderId)) return old;
    return [order, ...old];
  });

  // Set individual order cache
  queryClient.setQueryData(['order', order.orderId], order);

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Play sound and show notification
  playNotificationSound('info');
  showInfo(`New order received: ${order.orderId}`, 5000);
}

/**
 * Handle order.updated event
 * Updates order in cache and shows notification
 */
export function handleOrderUpdated(event: OrderUpdatedEvent): void {
  const order = event.data as Order;
  
  // Update order detail cache
  queryClient.setQueryData(['order', event.orderId], (old: Order | undefined) => {
    if (!old) return order;
    return { ...old, ...order, updatedAt: event.timestamp };
  });

  // Update order in list cache
  queryClient.setQueryData<Order[]>(['orders', 'list'], (old) => {
    if (!old) return [];
    return old.map((o) => 
      o.orderId === event.orderId 
        ? { ...o, ...order, updatedAt: event.timestamp }
        : o
    );
  });

  // Update live map orders if exists
  queryClient.setQueryData(['liveMapOrders'], (old: Order[] | undefined) => {
    if (!old) return [];
    return old.map((o) => 
      o.orderId === event.orderId 
        ? { ...o, ...order, updatedAt: event.timestamp }
        : o
    );
  });

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

/**
 * Handle order.assigned event
 * Updates order with driver assignment
 */
export function handleOrderAssigned(event: OrderAssignedEvent): void {
  const updateData: Partial<Order> = {
    status: 'Assigned',
    driver: {
      driverId: event.driverId,
      name: event.driverName,
      assignedAt: event.timestamp,
      vehicle: '',
      phone: '',
    },
    timeline: {
      bookedAt: '',
      assignedAt: event.timestamp,
    },
    updatedAt: event.timestamp,
  } as Partial<Order>;

  // Update order detail
  queryClient.setQueryData(['order', event.orderId], (old: Order | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      ...updateData,
      driver: { ...old.driver, ...updateData.driver },
      timeline: { ...old.timeline, ...updateData.timeline },
    };
  });

  // Update in list
  queryClient.setQueryData<Order[]>(['orders', 'list'], (old) => {
    if (!old) return [];
    return old.map((o) => 
      o.orderId === event.orderId 
        ? ({ 
            ...o, 
            ...updateData,
            driver: updateData.driver ? { ...o.driver, ...updateData.driver } : o.driver,
            timeline: updateData.timeline ? { ...o.timeline, ...updateData.timeline } : o.timeline,
          } as Order)
        : o
    );
  });

  // Play sound and show notification
  playNotificationSound('info');
  showInfo(`Order ${event.orderId} assigned to ${event.driverName}`, 4000);
}

/**
 * Handle order.completed event
 * Updates order status and shows success notification
 */
export function handleOrderCompleted(event: OrderCompletedEvent): void {
  const order = event.data as Order;
  
  const updateData: Partial<Order> = {
    status: 'Completed',
    timeline: {
      bookedAt: '',
      completedAt: event.timestamp,
    },
    updatedAt: event.timestamp,
  };

  // Update order detail
  queryClient.setQueryData(['order', event.orderId], (old: Order | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      ...updateData,
      ...order,
      timeline: { ...old.timeline, ...updateData.timeline },
    };
  });

  // Update in list
  queryClient.setQueryData<Order[]>(['orders', 'list'], (old) => {
    if (!old) return [];
    return old.map((o) => 
      o.orderId === event.orderId 
        ? { 
            ...o, 
            ...updateData,
            ...order,
            timeline: { ...o.timeline, ...updateData.timeline },
          }
        : o
    );
  });

  // Remove from live map if present
  queryClient.setQueryData(['liveMapOrders'], (old: Order[] | undefined) => {
    if (!old) return [];
    return old.filter((o) => o.orderId !== event.orderId);
  });

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Play sound and show success notification
  playNotificationSound('success');
  showSuccess(`Order ${event.orderId} completed`, 4000);
}

/**
 * Handle order.cancelled event
 * Updates order status and shows warning notification
 */
export function handleOrderCancelled(event: OrderCancelledEvent): void {
  const updateData: Partial<Order> = {
    status: 'Cancelled',
    timeline: {
      bookedAt: '',
      cancelledAt: event.timestamp,
      cancelledBy: event.cancelledBy as 'Customer' | 'Driver' | 'System',
      cancellationReason: event.reason,
    },
    updatedAt: event.timestamp,
  };

  // Update order detail
  queryClient.setQueryData(['order', event.orderId], (old: Order | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      ...updateData,
      timeline: { ...old.timeline, ...updateData.timeline },
    };
  });

  // Update in list
  queryClient.setQueryData<Order[]>(['orders', 'list'], (old) => {
    if (!old) return [];
    return old.map((o) => 
      o.orderId === event.orderId 
        ? { 
            ...o, 
            ...updateData,
            timeline: { ...o.timeline, ...updateData.timeline },
          }
        : o
    );
  });

  // Remove from live map if present
  queryClient.setQueryData(['liveMapOrders'], (old: Order[] | undefined) => {
    if (!old) return [];
    return old.filter((o) => o.orderId !== event.orderId);
  });

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Play sound and show warning notification
  playNotificationSound('warning');
  const reasonText = event.reason ? `: ${event.reason}` : '';
  showWarning(
    `Order ${event.orderId} cancelled by ${event.cancelledBy}${reasonText}`,
    6000
  );
}

/**
 * Subscribe to all order events
 * Returns an array of unsubscribe functions
 */
export function subscribeToOrderEvents(signalRClient: {
  subscribe: (event: string, handler: (data: unknown) => void) => () => void;
}): Array<() => void> {
  return [
    signalRClient.subscribe('order.created', (data) => handleOrderCreated(data as OrderCreatedEvent)),
    signalRClient.subscribe('order.updated', (data) => handleOrderUpdated(data as OrderUpdatedEvent)),
    signalRClient.subscribe('order.assigned', (data) => handleOrderAssigned(data as OrderAssignedEvent)),
    signalRClient.subscribe('order.completed', (data) => handleOrderCompleted(data as OrderCompletedEvent)),
    signalRClient.subscribe('order.cancelled', (data) => handleOrderCancelled(data as OrderCancelledEvent)),
  ];
}
