/**
 * React Hook for WebSocket/SignalR Events
 * Provides a simple interface for subscribing to real-time events
 * 
 * Usage:
 * useWebSocket('order.updated', (event) => {
 *   queryClient.setQueryData(['order', event.orderId], event.data);
 *   showInfo(`Order ${event.orderId} updated to ${event.status}`);
 * });
 */

import { useEffect, useRef, useCallback } from 'react';
import { signalRClient, type EventCallback } from './signalrClient';
import { useAuthStore } from '@/lib/stores/auth.store';

// Event type definitions for type safety
export interface OrderCreatedEvent {
  orderId: string;
  data: unknown;
  timestamp: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: string;
  data: unknown;
  timestamp: string;
}

export interface OrderAssignedEvent {
  orderId: string;
  driverId: string;
  driverName: string;
  timestamp: string;
}

export interface OrderCompletedEvent {
  orderId: string;
  data: unknown;
  timestamp: string;
}

export interface OrderCancelledEvent {
  orderId: string;
  reason?: string;
  cancelledBy: 'Customer' | 'Driver' | 'System' | 'Admin';
  timestamp: string;
}

export interface DriverStatusChangedEvent {
  driverId: string;
  status: string;
  previousStatus: string;
  timestamp: string;
}

export interface DriverLocationUpdatedEvent {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface DriverShiftEvent {
  driverId: string;
  shiftId: string;
  timestamp: string;
}

export interface VehicleLocationUpdatedEvent {
  vehicleId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface VehicleStatusChangedEvent {
  vehicleId: string;
  status: string;
  previousStatus: string;
  timestamp: string;
}

export interface IncidentCreatedEvent {
  incidentId: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  timestamp: string;
}

export interface IncidentUpdatedEvent {
  incidentId: string;
  status: string;
  previousStatus: string;
  updatedBy: string;
  timestamp: string;
}

export interface DashboardStatsUpdatedEvent {
  stats: unknown;
  timestamp: string;
}

// Event type mapping
export interface WebSocketEvents {
  // Order events
  'order.created': OrderCreatedEvent;
  'order.updated': OrderUpdatedEvent;
  'order.assigned': OrderAssignedEvent;
  'order.completed': OrderCompletedEvent;
  'order.cancelled': OrderCancelledEvent;
  
  // Driver events
  'driver.status.changed': DriverStatusChangedEvent;
  'driver.location.updated': DriverLocationUpdatedEvent;
  'driver.shift.started': DriverShiftEvent;
  'driver.shift.ended': DriverShiftEvent;
  
  // Vehicle events
  'vehicle.location.updated': VehicleLocationUpdatedEvent;
  'vehicle.status.changed': VehicleStatusChangedEvent;
  
  // Incident events
  'incident.created': IncidentCreatedEvent;
  'incident.updated': IncidentUpdatedEvent;
  
  // Dashboard events
  'dashboard.stats.updated': DashboardStatsUpdatedEvent;
}

export type WebSocketEventName = keyof WebSocketEvents;

// Options for useWebSocket hook
export interface UseWebSocketOptions {
  /** Whether the subscription is enabled */
  enabled?: boolean;
  /** Dependencies array to control when to resubscribe */
  deps?: React.DependencyList;
}

/**
 * React hook for subscribing to WebSocket events
 * 
 * @param eventName - The event name to subscribe to
 * @param callback - Callback function when event is received
 * @param options - Optional configuration
 * 
 * @example
 * useWebSocket('order.updated', (event) => {
 *   queryClient.invalidateQueries(['orders']);
 * });
 * 
 * @example with options
 * useWebSocket('driver.location.updated', (event) => {
 *   updateDriverOnMap(event.driverId, event.lat, event.lng);
 * }, { enabled: isMapVisible, deps: [driverId] });
 */
export function useWebSocket<T extends WebSocketEventName>(
  eventName: T,
  callback: EventCallback<WebSocketEvents[T]>,
  options: UseWebSocketOptions = {}
): void {
  const { enabled = true, deps = [] } = options;
  const callbackRef = useRef(callback);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Only subscribe if enabled and authenticated
    if (!enabled || !isAuthenticated) return;

    // Connect SignalR if not connected
    signalRClient.connect();

    // Subscribe to the event
    const unsubscribe = signalRClient.subscribe<WebSocketEvents[T]>(
      eventName,
      (data: WebSocketEvents[T]) => {
        callbackRef.current(data);
      }
    );

    // Cleanup on unmount or when dependencies change
    return () => {
      unsubscribe();
    };
  }, [eventName, enabled, isAuthenticated, ...deps]);
}

/**
 * Hook for subscribing to multiple events
 * 
 * @example
 * useWebSocketEvents([
 *   { event: 'order.created', handler: handleOrderCreated },
 *   { event: 'order.updated', handler: handleOrderUpdated },
 * ]);
 */
export function useWebSocketEvents(
  subscriptions: Array<{
    event: WebSocketEventName;
    handler: EventCallback<unknown>;
  }>,
  options: UseWebSocketOptions = {}
): void {
  const { enabled = true, deps = [] } = options;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    // Connect SignalR
    signalRClient.connect();

    // Subscribe to all events
    const unsubscribes = subscriptions.map(({ event, handler }) =>
      signalRClient.subscribe(event, handler)
    );

    // Cleanup
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [enabled, isAuthenticated, ...deps]);
}

/**
 * Hook to manually send events to the server
 * 
 * @example
 * const invoke = useWebSocketInvoke();
 * invoke('JoinGroup', 'drivers_online');
 */
export function useWebSocketInvoke() {
  return useCallback(<T>(methodName: string, ...args: unknown[]): Promise<T | null> => {
    return signalRClient.invoke<T>(methodName, ...args);
  }, []);
}

/**
 * Hook to get the current connection status
 * 
 * @example
 * const status = useWebSocketStatus();
 * // 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState(signalRClient.getConnectionStatus());

  useEffect(() => {
    return signalRClient.onStatusChange(setStatus);
  }, []);

  return status;
}

// Import useState for useWebSocketStatus
import { useState } from 'react';

/**
 * Hook to connect/disconnect based on authentication state
 * This should be used in the app's root component
 */
export function useWebSocketAuth(): void {
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      signalRClient.connect();
    } else {
      signalRClient.disconnect();
    }

    // Cleanup on unmount
    return () => {
      signalRClient.disconnect();
    };
  }, [isAuthenticated, token]);
}

/**
 * Hook for optimistic updates with rollback support
 * 
 * @example
 * const { update, rollback } = useOptimisticUpdate<Order>(['order', orderId]);
 * 
 * // Apply optimistic update
 * update((old) => ({ ...old, status: 'Completed' }));
 * 
 * // Rollback if API call fails
 * try {
 *   await completeOrder(orderId);
 * } catch {
 *   rollback();
 * }
 */
export function useOptimisticUpdate<T>(queryKey: string[]) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef<T | null>(null);

  const update = useCallback(
    (updater: (old: T | undefined) => T) => {
      // Store previous data for potential rollback
      const currentData = queryClient.getQueryData<T>(queryKey);
      previousDataRef.current = currentData ?? null;

      // Apply optimistic update
      queryClient.setQueryData<T>(queryKey, (old) => updater(old));
    },
    [queryClient, queryKey]
  );

  const rollback = useCallback(() => {
    if (previousDataRef.current !== null) {
      queryClient.setQueryData<T>(queryKey, previousDataRef.current);
    }
  }, [queryClient, queryKey]);

  const commit = useCallback(() => {
    previousDataRef.current = null;
  }, []);

  return { update, rollback, commit };
}

// Import useQueryClient for useOptimisticUpdate
import { useQueryClient } from '@tanstack/react-query';
