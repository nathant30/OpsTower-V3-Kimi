/**
 * Incident Event Handlers
 * Handles real-time incident events and updates React Query cache
 * Plays sound alerts for critical incidents
 */

import { queryClient } from '@/lib/api/queryClient';
import { showError, showWarning, showInfo } from '@/lib/stores/ui.store';
import type { 
  IncidentCreatedEvent,
  IncidentUpdatedEvent
} from '../useWebSocket';
import type { Incident } from '@/types/domain.types';

// Track if sound is enabled (user preference)
let soundEnabled = true;

/**
 * Play alert sound for critical incidents
 */
function playAlertSound(severity: 'Low' | 'Medium' | 'High' | 'Critical'): void {
  if (!soundEnabled) return;

  try {
    // Use Web Audio API for notification sounds
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different tones for different severity levels
    switch (severity) {
      case 'Critical':
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(698, audioContext.currentTime + 0.1); // F5
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'High':
        oscillator.frequency.setValueAtTime(698, audioContext.currentTime); // F5
        oscillator.frequency.setValueAtTime(587, audioContext.currentTime + 0.15); // D5
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
      case 'Medium':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      default:
        // No sound for low severity
        break;
    }
  } catch (error) {
    // Silent fail if audio is not supported or blocked
    console.warn('Could not play alert sound:', error);
  }
}

/**
 * Enable/disable sound alerts
 */
export function setSoundAlertsEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Check if sound alerts are enabled
 */
export function isSoundAlertsEnabled(): boolean {
  return soundEnabled;
}

/**
 * Handle incident.created event
 * Adds new incident to cache and shows notification with sound alert
 */
export function handleIncidentCreated(event: IncidentCreatedEvent): void {
  const { incidentId, type, severity, reportedBy, timestamp } = event;

  // Create a minimal incident object for the cache
  const newIncident: Partial<Incident> = {
    incidentId,
    type: type as Incident['type'],
    severity,
    status: 'New',
    reportedBy: {
      type: 'System',
      userId: reportedBy,
      name: reportedBy,
      reportedAt: timestamp,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Add to incidents list cache
  queryClient.setQueryData<Incident[]>(['incidentsList'], (old) => {
    if (!old) return [newIncident as Incident];
    // Prevent duplicates
    if (old.some((i) => i.incidentId === incidentId)) return old;
    return [newIncident as Incident, ...old];
  });

  // Set individual incident cache
  queryClient.setQueryData(['incident', incidentId], newIncident);

  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  // Play alert sound for high/critical severity
  playAlertSound(severity);

  // Show notification based on severity
  const message = `New ${severity.toLowerCase()} severity incident: ${type}`;
  
  switch (severity) {
    case 'Critical':
      showError(message, 10000);
      break;
    case 'High':
      showWarning(message, 8000);
      break;
    case 'Medium':
      showWarning(message, 6000);
      break;
    default:
      showInfo(message, 5000);
      break;
  }
}

/**
 * Handle incident.updated event
 * Updates incident status in cache
 */
export function handleIncidentUpdated(event: IncidentUpdatedEvent): void {
  const { incidentId, status, previousStatus, updatedBy, timestamp } = event;

  const updateData = {
    status: status as Incident['status'],
    updatedAt: timestamp,
  };

  // Update incident detail cache
  queryClient.setQueryData(['incident', incidentId], (old: Incident | undefined) => {
    if (!old) return null;
    return { ...old, ...updateData };
  });

  // Update in incidents list
  queryClient.setQueryData<Incident[]>(['incidentsList'], (old) => {
    if (!old) return [];
    return old.map((i) => 
      i.incidentId === incidentId 
        ? { ...i, ...updateData }
        : i
    );
  });

  // Show notification for significant status changes
  if (status === 'Resolved' && previousStatus !== 'Resolved') {
    showInfo(`Incident ${incidentId} resolved by ${updatedBy}`, 5000);
  } else if (status === 'Investigating' && previousStatus === 'New') {
    showInfo(`Investigation started for incident ${incidentId}`, 4000);
  }
}

/**
 * Subscribe to all incident events
 * Returns an array of unsubscribe functions
 */
export function subscribeToIncidentEvents(signalRClient: {
  subscribe: (event: string, handler: (data: unknown) => void) => () => void;
}): Array<() => void> {
  return [
    signalRClient.subscribe('incident.created', (data) => 
      handleIncidentCreated(data as IncidentCreatedEvent)
    ),
    signalRClient.subscribe('incident.updated', (data) => 
      handleIncidentUpdated(data as IncidentUpdatedEvent)
    ),
  ];
}
