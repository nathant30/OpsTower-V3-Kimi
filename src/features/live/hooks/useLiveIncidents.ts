/**
 * useLiveIncidents Hook
 * 
 * Subscribes to real-time incident notifications via WebSocket
 * Tracks new incidents and shows notification when an incident is created
 * 
 * @example
 * const { incidents, newIncidentCount, resetNewIncidentCount, isConnected } = useLiveIncidents();
 * const { incidents, newIncidentCount } = useLiveIncidents({ onNewIncident: (incident) => console.log(incident) });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { signalRClient } from '@/lib/ws/signalrClient';
import { useAuthStore } from '@/lib/stores/auth.store';
import { showError, showWarning, showInfo } from '@/lib/stores/ui.store';
import type { Severity, IncidentType, IncidentStatus } from '@/types/domain.types';

export interface LiveIncident {
  incidentId: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  description: string;
  reportedBy: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  involvedDrivers?: string[];
  timestamp: string;
}

export interface UseLiveIncidentsOptions {
  /** Whether to enable the subscription */
  enabled?: boolean;
  /** Callback when a new incident is created */
  onNewIncident?: (incident: LiveIncident) => void;
  /** Whether to show toast notifications */
  showNotifications?: boolean;
  /** Whether to play alert sounds */
  playSound?: boolean;
  /** Maximum number of incidents to keep in history */
  maxHistory?: number;
  /** Minimum severity level to show notifications for */
  minSeverity?: Severity;
}

export interface UseLiveIncidentsReturn {
  /** Array of recent incidents (newest first) */
  incidents: LiveIncident[];
  /** Count of new incidents since last reset */
  newIncidentCount: number;
  /** Number of critical incidents */
  criticalCount: number;
  /** Number of high severity incidents */
  highCount: number;
  /** Reset the new incident counter */
  resetNewIncidentCount: () => void;
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Clear incident history */
  clearIncidents: () => void;
  /** Get incident by ID */
  getIncident: (incidentId: string) => LiveIncident | undefined;
  /** Mark incident as viewed */
  markAsViewed: (incidentId: string) => void;
  /** Get incidents filtered by severity */
  getIncidentsBySeverity: (severity: Severity) => LiveIncident[];
}

// Set to track which incidents have been counted as "new"
const viewedIncidents = new Set<string>();

// Severity priority for sorting
const severityPriority: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Play alert sound for incidents
 */
function playIncidentSound(severity: Severity): void {
  try {
    const audioContext = new (window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (severity) {
      case 'Critical':
        // Urgent double beep
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(698, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'High':
        // Single alert tone
        oscillator.frequency.setValueAtTime(698, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(587, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
      case 'Medium':
        // Lower tone
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
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
    console.warn('Could not play incident sound:', error);
  }
}

export function useLiveIncidents(options: UseLiveIncidentsOptions = {}): UseLiveIncidentsReturn {
  const {
    enabled = true,
    onNewIncident,
    showNotifications = true,
    playSound = true,
    maxHistory = 50,
    minSeverity = 'Low',
  } = options;

  const [incidents, setIncidents] = useState<LiveIncident[]>([]);
  const [newIncidentCount, setNewIncidentCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const incidentsRef = useRef<LiveIncident[]>([]);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Keep ref in sync with state
  useEffect(() => {
    incidentsRef.current = incidents;
  }, [incidents]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      setIncidents([]);
      setNewIncidentCount(0);
      setIsConnected(false);
      viewedIncidents.clear();
      return;
    }

    setError(null);

    // Subscribe to connection status
    const unsubStatus = signalRClient.onStatusChange((status) => {
      setIsConnected(status === 'connected');
    });

    // Subscribe to incident created events
    const unsubIncident = signalRClient.subscribe(
      'incident.created',
      (data: {
        incidentId: string;
        type: string;
        severity: Severity;
        reportedBy: string;
        description?: string;
        location?: { lat: number; lng: number; address?: string };
        involvedDrivers?: string[];
        timestamp: string;
      }) => {
        const newIncident: LiveIncident = {
          incidentId: data.incidentId,
          type: (data.type as IncidentType) || 'Other',
          severity: data.severity,
          status: 'New',
          description: data.description || `${data.type} incident reported`,
          reportedBy: data.reportedBy,
          location: data.location,
          involvedDrivers: data.involvedDrivers,
          timestamp: data.timestamp,
        };

        // Check if severity meets minimum threshold
        if (severityPriority[newIncident.severity] < severityPriority[minSeverity]) {
          return;
        }

        setIncidents((prev) => {
          // Prevent duplicates
          if (prev.some((i) => i.incidentId === newIncident.incidentId)) {
            return prev;
          }
          
          const newIncidents = [newIncident, ...prev].sort((a, b) => {
            // Sort by severity first, then by time
            const severityDiff = severityPriority[b.severity] - severityPriority[a.severity];
            if (severityDiff !== 0) return severityDiff;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          
          // Limit history size
          if (newIncidents.length > maxHistory) {
            return newIncidents.slice(0, maxHistory);
          }
          return newIncidents;
        });

        // Increment new incident count if not already viewed
        if (!viewedIncidents.has(newIncident.incidentId)) {
          setNewIncidentCount((prev) => prev + 1);
          viewedIncidents.add(newIncident.incidentId);
        }

        // Play sound based on severity
        if (playSound) {
          playIncidentSound(newIncident.severity);
        }

        // Show notification based on severity
        if (showNotifications) {
          const message = `New ${newIncident.severity.toLowerCase()} severity incident: ${newIncident.type}`;
          
          switch (newIncident.severity) {
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

        // Call optional callback
        onNewIncident?.(newIncident);
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
      unsubIncident();
    };
  }, [enabled, isAuthenticated, onNewIncident, showNotifications, playSound, maxHistory, minSeverity]);

  // Calculate critical and high counts
  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;
  const highCount = incidents.filter((i) => i.severity === 'High').length;

  const resetNewIncidentCount = useCallback(() => {
    setNewIncidentCount(0);
  }, []);

  const clearIncidents = useCallback(() => {
    setIncidents([]);
    setNewIncidentCount(0);
    viewedIncidents.clear();
  }, []);

  const getIncident = useCallback((incidentId: string): LiveIncident | undefined => {
    return incidentsRef.current.find((i) => i.incidentId === incidentId);
  }, []);

  const markAsViewed = useCallback((incidentId: string) => {
    if (!viewedIncidents.has(incidentId)) {
      viewedIncidents.add(incidentId);
    }
    setNewIncidentCount((prev) => Math.max(0, prev - 1));
  }, []);

  const getIncidentsBySeverity = useCallback((severity: Severity): LiveIncident[] => {
    return incidentsRef.current.filter((i) => i.severity === severity);
  }, []);

  return {
    incidents,
    newIncidentCount,
    criticalCount,
    highCount,
    resetNewIncidentCount,
    isConnected,
    error,
    clearIncidents,
    getIncident,
    markAsViewed,
    getIncidentsBySeverity,
  };
}

export default useLiveIncidents;
