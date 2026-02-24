/**
 * useLiveDrivers Hook
 * 
 * Subscribes to real-time driver location updates via WebSocket
 * Returns live driver positions with their current status
 * 
 * @example
 * const { drivers, isConnected, error } = useLiveDrivers();
 * const { drivers, isConnected } = useLiveDrivers({ enabled: isMapVisible });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { signalRClient } from '@/lib/ws/signalrClient';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { LiveMapDriver, Location } from '@/types/domain.types';

export interface LiveDriver extends LiveMapDriver {
  lastUpdate: string;
  heading?: number;
  speed?: number;
}

export interface UseLiveDriversOptions {
  /** Whether to enable the subscription */
  enabled?: boolean;
  /** Callback when a driver's location updates */
  onLocationUpdate?: (driver: LiveDriver) => void;
  /** Callback when a driver's status changes */
  onStatusChange?: (driverId: string, status: string, previousStatus: string) => void;
}

export interface UseLiveDriversReturn {
  /** Array of live driver positions */
  drivers: LiveDriver[];
  /** Map of driverId to driver for quick lookup */
  driversMap: Map<string, LiveDriver>;
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Manually refresh driver list */
  refresh: () => void;
  /** Get a specific driver by ID */
  getDriver: (driverId: string) => LiveDriver | undefined;
}

// Throttle map to prevent excessive updates
const updateThrottles = new Map<string, number>();
const THROTTLE_MS = 500; // Minimum time between updates for same driver

export function useLiveDrivers(options: UseLiveDriversOptions = {}): UseLiveDriversReturn {
  const { enabled = true, onLocationUpdate, onStatusChange } = options;
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const driversMapRef = useRef<Map<string, LiveDriver>>(new Map());
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Keep driversMap in sync with drivers array
  useEffect(() => {
    const newMap = new Map<string, LiveDriver>();
    drivers.forEach((driver) => {
      newMap.set(driver.driverId, driver);
    });
    driversMapRef.current = newMap;
  }, [drivers]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      setDrivers([]);
      setIsConnected(false);
      return;
    }

    setError(null);

    // Subscribe to connection status
    const unsubStatus = signalRClient.onStatusChange((status) => {
      setIsConnected(status === 'connected');
    });

    // Subscribe to driver location updates
    const unsubLocation = signalRClient.subscribe(
      'driver.location.updated',
      (data: {
        driverId: string;
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
        timestamp: string;
      }) => {
        const now = Date.now();
        const lastUpdate = updateThrottles.get(data.driverId) || 0;
        
        // Throttle updates for same driver
        if (now - lastUpdate < THROTTLE_MS) {
          return;
        }
        updateThrottles.set(data.driverId, now);

        setDrivers((prevDrivers) => {
          const existingIndex = prevDrivers.findIndex(
            (d) => d.driverId === data.driverId
          );

          const location: Location = {
            lat: data.lat,
            lng: data.lng,
            timestamp: data.timestamp,
            heading: data.heading,
            speed: data.speed,
          };

          const updatedDriver: LiveDriver = {
            driverId: data.driverId,
            name: existingIndex >= 0 ? prevDrivers[existingIndex].name : data.driverId,
            status: existingIndex >= 0 ? prevDrivers[existingIndex].status : 'Online',
            location,
            vehicleType: existingIndex >= 0 ? prevDrivers[existingIndex].vehicleType : 'Taxi',
            trustScore: existingIndex >= 0 ? prevDrivers[existingIndex].trustScore : 0,
            lastUpdate: data.timestamp,
            heading: data.heading,
            speed: data.speed,
            currentOrderId: existingIndex >= 0 ? prevDrivers[existingIndex].currentOrderId : undefined,
          };

          // Call optional callback
          onLocationUpdate?.(updatedDriver);

          if (existingIndex >= 0) {
            // Update existing driver
            const newDrivers = [...prevDrivers];
            newDrivers[existingIndex] = updatedDriver;
            return newDrivers;
          } else {
            // Add new driver
            return [...prevDrivers, updatedDriver];
          }
        });
      }
    );

    // Subscribe to driver status changes
    const unsubStatusChange = signalRClient.subscribe(
      'driver.status.changed',
      (data: {
        driverId: string;
        status: string;
        previousStatus: string;
        timestamp: string;
      }) => {
        setDrivers((prevDrivers) => {
          const existingIndex = prevDrivers.findIndex(
            (d) => d.driverId === data.driverId
          );

          if (existingIndex >= 0) {
            const newDrivers = [...prevDrivers];
            newDrivers[existingIndex] = {
              ...newDrivers[existingIndex],
              status: data.status as LiveDriver['status'],
              lastUpdate: data.timestamp,
            };
            return newDrivers;
          }
          return prevDrivers;
        });

        // Call optional callback
        onStatusChange?.(data.driverId, data.status, data.previousStatus);
      }
    );

    // Connect if not already connected
    signalRClient.connect().catch((err) => {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    });

    // Set initial connection status
    setIsConnected(signalRClient.getConnectionStatus() === 'connected');

    // Cleanup subscriptions
    return () => {
      unsubStatus();
      unsubLocation();
      unsubStatusChange();
    };
  }, [enabled, isAuthenticated, onLocationUpdate, onStatusChange]);

  // Cleanup old throttle entries periodically
  useEffect(() => {
    if (!enabled) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 60000; // 1 minute
      updateThrottles.forEach((time, id) => {
        if (time < cutoff) {
          updateThrottles.delete(id);
        }
      });
    }, 30000); // Run every 30 seconds

    return () => clearInterval(cleanupInterval);
  }, [enabled]);

  const refresh = useCallback(() => {
    setDrivers([]);
    driversMapRef.current.clear();
    signalRClient.connect().catch((err) => {
      setError(err instanceof Error ? err : new Error('Failed to refresh'));
    });
  }, []);

  const getDriver = useCallback((driverId: string): LiveDriver | undefined => {
    return driversMapRef.current.get(driverId);
  }, []);

  return {
    drivers,
    driversMap: driversMapRef.current,
    isConnected,
    error,
    refresh,
    getDriver,
  };
}

export default useLiveDrivers;
