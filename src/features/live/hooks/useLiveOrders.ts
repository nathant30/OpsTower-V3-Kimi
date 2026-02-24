/**
 * useLiveOrders Hook
 * 
 * Subscribes to real-time new order notifications via WebSocket
 * Tracks new orders and shows notification when a new order arrives
 * 
 * @example
 * const { orders, newOrderCount, resetNewOrderCount, isConnected } = useLiveOrders();
 * const { orders, newOrderCount } = useLiveOrders({ onNewOrder: (order) => console.log(order) });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { signalRClient } from '@/lib/ws/signalrClient';
import { useAuthStore } from '@/lib/stores/auth.store';
import { showInfo } from '@/lib/stores/ui.store';
import { playNotificationSound } from '@/lib/utils/sound';
import type { Order, OrderStatus, ServiceType, Priority } from '@/types/domain.types';

export interface LiveOrder {
  orderId: string;
  status: OrderStatus;
  serviceType: ServiceType;
  priority: Priority;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedFare: number;
  timestamp: string;
}

export interface UseLiveOrdersOptions {
  /** Whether to enable the subscription */
  enabled?: boolean;
  /** Callback when a new order arrives */
  onNewOrder?: (order: LiveOrder) => void;
  /** Whether to show toast notifications */
  showNotifications?: boolean;
  /** Whether to play sound on new order */
  playSound?: boolean;
  /** Maximum number of orders to keep in history */
  maxHistory?: number;
}

export interface UseLiveOrdersReturn {
  /** Array of recent orders (newest first) */
  orders: LiveOrder[];
  /** Count of new orders since last reset */
  newOrderCount: number;
  /** Reset the new order counter */
  resetNewOrderCount: () => void;
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Clear order history */
  clearOrders: () => void;
  /** Get order by ID */
  getOrder: (orderId: string) => LiveOrder | undefined;
  /** Mark order as viewed (removes from new count) */
  markAsViewed: (orderId: string) => void;
}

// Set to track which orders have been counted as "new"
const viewedOrders = new Set<string>();

export function useLiveOrders(options: UseLiveOrdersOptions = {}): UseLiveOrdersReturn {
  const {
    enabled = true,
    onNewOrder,
    showNotifications = true,
    playSound = true,
    maxHistory = 50,
  } = options;

  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ordersRef = useRef<LiveOrder[]>([]);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Keep ref in sync with state
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      setOrders([]);
      setNewOrderCount(0);
      setIsConnected(false);
      viewedOrders.clear();
      return;
    }

    setError(null);

    // Subscribe to connection status
    const unsubStatus = signalRClient.onStatusChange((status) => {
      setIsConnected(status === 'connected');
    });

    // Subscribe to new order events
    const unsubOrder = signalRClient.subscribe(
      'order.created',
      (data: {
        orderId: string;
        data?: Partial<Order> & {
          customer?: { name?: string };
          route?: {
            pickup?: { address?: string };
            dropoff?: { address?: string };
          };
          pricing?: { total?: number };
        };
        timestamp: string;
      }) => {
        const orderData = data.data || {};
        const route = orderData.route || {};
        
        const newOrder: LiveOrder = {
          orderId: data.orderId,
          status: (orderData.status as OrderStatus) || 'Searching',
          serviceType: (orderData.serviceType as ServiceType) || 'Taxi',
          priority: (orderData.priority as Priority) || 'Normal',
          customerName: orderData.customer?.name || 'Unknown',
          pickupAddress: route.pickup?.address || 'Unknown',
          dropoffAddress: route.dropoff?.address || 'Unknown',
          estimatedFare: orderData.pricing?.total || 0,
          timestamp: data.timestamp,
        };

        setOrders((prev) => {
          // Prevent duplicates
          if (prev.some((o) => o.orderId === newOrder.orderId)) {
            return prev;
          }
          
          const newOrders = [newOrder, ...prev];
          // Limit history size
          if (newOrders.length > maxHistory) {
            return newOrders.slice(0, maxHistory);
          }
          return newOrders;
        });

        // Increment new order count if not already viewed
        if (!viewedOrders.has(newOrder.orderId)) {
          setNewOrderCount((prev) => prev + 1);
          viewedOrders.add(newOrder.orderId);
        }

        // Play notification sound
        if (playSound) {
          playNotificationSound('info');
        }

        // Show toast notification
        if (showNotifications) {
          showInfo(
            `New ${newOrder.serviceType} order: ${newOrder.orderId.slice(0, 8)}...`,
            5000
          );
        }

        // Call optional callback
        onNewOrder?.(newOrder);
      }
    );

    // Connect if not already connected
    signalRClient.connect().catch((err) => {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    });

    // Set initial connection status
    setIsConnected(signalRClient.getConnectionStatus() === 'connected');

    // Cleanup
    return () => {
      unsubStatus();
      unsubOrder();
    };
  }, [enabled, isAuthenticated, onNewOrder, showNotifications, playSound, maxHistory]);

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0);
  }, []);

  const clearOrders = useCallback(() => {
    setOrders([]);
    setNewOrderCount(0);
    viewedOrders.clear();
  }, []);

  const getOrder = useCallback((orderId: string): LiveOrder | undefined => {
    return ordersRef.current.find((o) => o.orderId === orderId);
  }, []);

  const markAsViewed = useCallback((orderId: string) => {
    if (!viewedOrders.has(orderId)) {
      viewedOrders.add(orderId);
    }
    // Decrement count if this order was counted
    setNewOrderCount((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    orders,
    newOrderCount,
    resetNewOrderCount,
    isConnected,
    error,
    clearOrders,
    getOrder,
    markAsViewed,
  };
}

export default useLiveOrders;
