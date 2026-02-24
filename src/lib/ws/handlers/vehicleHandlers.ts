/**
 * Vehicle Event Handlers
 * Handles real-time vehicle events and updates React Query cache
 */

import { queryClient } from '@/lib/api/queryClient';
import { showInfo, showWarning } from '@/lib/stores/ui.store';
import type { 
  VehicleLocationUpdatedEvent,
  VehicleStatusChangedEvent
} from '../useWebSocket';
import type { Vehicle } from '@/types/domain.types';

// Track recent location updates to prevent excessive re-renders
const lastVehicleLocationUpdates = new Map<string, number>();
const LOCATION_THROTTLE_MS = 1000; // 1 second throttle

/**
 * Handle vehicle.location.updated event
 * Updates vehicle location in cache (throttled)
 */
export function handleVehicleLocationUpdated(event: VehicleLocationUpdatedEvent): void {
  const { vehicleId, lat, lng, heading, speed, timestamp } = event;

  // Throttle location updates
  const now = Date.now();
  const lastUpdate = lastVehicleLocationUpdates.get(vehicleId) || 0;
  
  if (now - lastUpdate < LOCATION_THROTTLE_MS) {
    return;
  }
  lastVehicleLocationUpdates.set(vehicleId, now);

  const locationData = {
    lat,
    lng,
    heading,
    speed,
    timestamp,
  };

  // Update vehicle detail cache
  queryClient.setQueryData(['vehicle', vehicleId], (old: Vehicle | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      currentLocation: locationData,
      updatedAt: timestamp,
    };
  });

  // Update in vehicles list
  queryClient.setQueryData<Vehicle[]>(['vehiclesList'], (old) => {
    if (!old) return [];
    return old.map((v) => 
      v.vehicleId === vehicleId 
        ? { 
            ...v, 
            currentLocation: locationData,
            updatedAt: timestamp,
          }
        : v
    );
  });

  // Clean up old throttle entries periodically
  if (lastVehicleLocationUpdates.size > 1000) {
    const cutoff = now - 60000;
    lastVehicleLocationUpdates.forEach((time, id) => {
      if (time < cutoff) {
        lastVehicleLocationUpdates.delete(id);
      }
    });
  }
}

/**
 * Handle vehicle.status.changed event
 * Updates vehicle status in cache
 */
export function handleVehicleStatusChanged(event: VehicleStatusChangedEvent): void {
  const { vehicleId, status, previousStatus, timestamp } = event;

  // Update vehicle detail cache
  queryClient.setQueryData(['vehicle', vehicleId], (old: Vehicle | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      status: status as Vehicle['status'],
      updatedAt: timestamp,
    };
  });

  // Update in vehicles list
  queryClient.setQueryData<Vehicle[]>(['vehiclesList'], (old) => {
    if (!old) return [];
    return old.map((v) => 
      v.vehicleId === vehicleId 
        ? { 
            ...v, 
            status: status as Vehicle['status'],
            updatedAt: timestamp,
          }
        : v
    );
  });

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Show notification for important status changes
  if (status === 'Maintenance') {
    showWarning(`Vehicle ${vehicleId} moved to maintenance`, 5000);
  } else if (status === 'Active' && previousStatus === 'Maintenance') {
    showInfo(`Vehicle ${vehicleId} is back in service`, 4000);
  }
}

/**
 * Subscribe to all vehicle events
 * Returns an array of unsubscribe functions
 */
export function subscribeToVehicleEvents(signalRClient: {
  subscribe: (event: string, handler: (data: unknown) => void) => () => void;
}): Array<() => void> {
  return [
    signalRClient.subscribe('vehicle.location.updated', (data) => 
      handleVehicleLocationUpdated(data as VehicleLocationUpdatedEvent)
    ),
    signalRClient.subscribe('vehicle.status.changed', (data) => 
      handleVehicleStatusChanged(data as VehicleStatusChangedEvent)
    ),
  ];
}
