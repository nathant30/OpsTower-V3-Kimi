/**
 * Driver Event Handlers
 * Handles real-time driver events and updates React Query cache
 */

import { queryClient } from '@/lib/api/queryClient';
import { showInfo, showWarning } from '@/lib/stores/ui.store';
import { playNotificationSound } from '@/lib/utils/sound';
import type { 
  DriverStatusChangedEvent,
  DriverLocationUpdatedEvent,
  DriverShiftEvent
} from '../useWebSocket';
import type { Driver, LiveMapDriver } from '@/types/domain.types';

// Track recent location updates to prevent excessive re-renders
const lastLocationUpdates = new Map<string, number>();
const LOCATION_THROTTLE_MS = 1000; // 1 second throttle

/**
 * Handle driver.status.changed event
 * Updates driver status in cache
 */
export function handleDriverStatusChanged(event: DriverStatusChangedEvent): void {
  const { driverId, status, previousStatus, timestamp } = event;

  // Update driver detail cache
  queryClient.setQueryData(['rider', driverId], (old: Driver | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      onlineStatus: status as Driver['onlineStatus'],
      updatedAt: timestamp,
    };
  });

  // Update in drivers list
  queryClient.setQueryData<Driver[]>(['ridersList'], (old) => {
    if (!old) return [];
    return old.map((d) => 
      d.driverId === driverId 
        ? { 
            ...d, 
            onlineStatus: status as Driver['onlineStatus'],
            updatedAt: timestamp,
          }
        : d
    );
  });

  // Update in live map drivers cache
  queryClient.setQueryData<LiveMapDriver[]>(['liveMapDrivers'], (old) => {
    if (!old) return [];
    return old.map((d) => 
      d.driverId === driverId 
        ? { ...d, status: status as LiveMapDriver['status'] }
        : d
    );
  });

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Show notification for important status changes
  if (status === 'Online' && previousStatus === 'Offline') {
    playNotificationSound('info');
    showInfo(`Driver ${driverId} is now online`, 3000);
  } else if (status === 'Offline' && previousStatus !== 'Offline') {
    playNotificationSound('warning');
    showWarning(`Driver ${driverId} went offline`, 3000);
  }
}

/**
 * Handle driver.location.updated event
 * Updates driver location in cache (throttled)
 */
export function handleDriverLocationUpdated(event: DriverLocationUpdatedEvent): void {
  const { driverId, lat, lng, heading, speed, timestamp } = event;

  // Throttle location updates to prevent excessive re-renders
  const now = Date.now();
  const lastUpdate = lastLocationUpdates.get(driverId) || 0;
  
  if (now - lastUpdate < LOCATION_THROTTLE_MS) {
    return; // Skip this update
  }
  lastLocationUpdates.set(driverId, now);

  const locationData = {
    lat,
    lng,
    heading,
    speed,
    timestamp,
  };

  // Update driver detail cache
  queryClient.setQueryData(['rider', driverId], (old: Driver | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      currentLocation: locationData,
      updatedAt: timestamp,
    };
  });

  // Update in live map drivers cache (most important for real-time map)
  queryClient.setQueryData<LiveMapDriver[]>(['liveMapDrivers'], (old) => {
    if (!old) return [];
    return old.map((d) => 
      d.driverId === driverId 
        ? { 
            ...d, 
            location: locationData,
          }
        : d
    );
  });

  // Clean up old throttle entries periodically
  if (lastLocationUpdates.size > 1000) {
    const cutoff = now - 60000; // 1 minute
    lastLocationUpdates.forEach((time, id) => {
      if (time < cutoff) {
        lastLocationUpdates.delete(id);
      }
    });
  }
}

/**
 * Handle driver.shift.started event
 * Updates driver shift information
 */
export function handleDriverShiftStarted(event: DriverShiftEvent): void {
  const { driverId, shiftId, timestamp } = event;

  const shiftData = {
    currentShift: shiftId,
    shiftStart: timestamp,
    isOnBreak: false,
  };

  // Update driver detail
  queryClient.setQueryData(['rider', driverId], (old: Driver | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      shift: { ...old.shift, ...shiftData },
      onlineStatus: 'Online',
      updatedAt: timestamp,
    };
  });

  // Update in list
  queryClient.setQueryData<Driver[]>(['ridersList'], (old) => {
    if (!old) return [];
    return old.map((d) => 
      d.driverId === driverId 
        ? { 
            ...d, 
            shift: { ...d.shift, ...shiftData },
            onlineStatus: 'Online',
            updatedAt: timestamp,
          }
        : d
    );
  });

  // Play sound and show notification
  playNotificationSound('info');
  showInfo(`Driver ${driverId} started shift`, 3000);
}

/**
 * Handle driver.shift.ended event
 * Updates driver shift information
 */
export function handleDriverShiftEnded(event: DriverShiftEvent): void {
  const { driverId, timestamp } = event;

  const shiftData = {
    currentShift: undefined,
    shiftEnd: timestamp,
    isOnBreak: false,
    breakStart: undefined,
  };

  // Update driver detail
  queryClient.setQueryData(['rider', driverId], (old: Driver | undefined) => {
    if (!old) return null;
    return { 
      ...old, 
      shift: { ...old.shift, ...shiftData },
      onlineStatus: 'Offline',
      updatedAt: timestamp,
    };
  });

  // Update in list
  queryClient.setQueryData<Driver[]>(['ridersList'], (old) => {
    if (!old) return [];
    return old.map((d) => 
      d.driverId === driverId 
        ? { 
            ...d, 
            shift: { ...d.shift, ...shiftData },
            onlineStatus: 'Offline',
            updatedAt: timestamp,
          }
        : d
    );
  });

  // Update in live map
  queryClient.setQueryData<LiveMapDriver[]>(['liveMapDrivers'], (old) => {
    if (!old) return [];
    return old.filter((d) => d.driverId !== driverId);
  });

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Play sound and show notification
  playNotificationSound('info');
  showInfo(`Driver ${driverId} ended shift`, 3000);
}

/**
 * Subscribe to all driver events
 * Returns an array of unsubscribe functions
 */
export function subscribeToDriverEvents(signalRClient: {
  subscribe: (event: string, handler: (data: unknown) => void) => () => void;
}): Array<() => void> {
  return [
    signalRClient.subscribe('driver.status.changed', (data) => 
      handleDriverStatusChanged(data as DriverStatusChangedEvent)
    ),
    signalRClient.subscribe('driver.location.updated', (data) => 
      handleDriverLocationUpdated(data as DriverLocationUpdatedEvent)
    ),
    signalRClient.subscribe('driver.shift.started', (data) => 
      handleDriverShiftStarted(data as DriverShiftEvent)
    ),
    signalRClient.subscribe('driver.shift.ended', (data) => 
      handleDriverShiftEnded(data as DriverShiftEvent)
    ),
  ];
}
