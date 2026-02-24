/**
 * Safety Hooks
 * React Query hooks for safety monitoring
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { safetyService, type SafetyIncident, type SafetyMetrics, type DriverSafetyRanking, type SafetyAlert, type SOSEvent, type SafetyStatus, type SafetySeverity, type SafetyIncidentType } from '@/services/safety/safety.service';

// Query keys
const safetyKeys = {
  all: ['safety'] as const,
  incidents: () => [...safetyKeys.all, 'incidents'] as const,
  incident: (id: string) => [...safetyKeys.incidents(), id] as const,
  metrics: () => [...safetyKeys.all, 'metrics'] as const,
  emergencyResponses: () => [...safetyKeys.all, 'emergency-responses'] as const,
  driverRankings: () => [...safetyKeys.all, 'driver-rankings'] as const,
  alerts: () => [...safetyKeys.all, 'alerts'] as const,
  sosEvents: () => [...safetyKeys.all, 'sos-events'] as const,
};

// Get all safety incidents with optional filters
export function useSafetyIncidents(filters?: {
  status?: SafetyStatus;
  severity?: SafetySeverity;
  type?: SafetyIncidentType;
}) {
  return useQuery({
    queryKey: [...safetyKeys.incidents(), filters],
    queryFn: async () => {
      const response = await safetyService.getIncidents(filters);
      return response.items;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Get a single incident by ID
export function useSafetyIncident(id: string | undefined) {
  return useQuery({
    queryKey: safetyKeys.incident(id || ''),
    queryFn: async () => {
      if (!id) return null;
      return await safetyService.getIncidentById(id);
    },
    enabled: !!id,
  });
}

// Get safety metrics
export function useSafetyMetrics() {
  return useQuery({
    queryKey: safetyKeys.metrics(),
    queryFn: async () => {
      return await safetyService.getMetrics();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get emergency responses
export function useEmergencyResponses() {
  return useQuery({
    queryKey: safetyKeys.emergencyResponses(),
    queryFn: async () => {
      const response = await safetyService.getEmergencyResponses();
      return response.items;
    },
    refetchInterval: 15000, // Refetch every 15 seconds for active emergencies
  });
}

// Get driver safety rankings
export function useDriverRankings(limit: number = 10) {
  return useQuery({
    queryKey: [...safetyKeys.driverRankings(), limit],
    queryFn: async () => {
      const response = await safetyService.getDriverRankings(limit);
      return response.items;
    },
  });
}

// Get safety alerts
export function useSafetyAlerts() {
  return useQuery({
    queryKey: safetyKeys.alerts(),
    queryFn: async () => {
      const response = await safetyService.getAlerts();
      return response.items;
    },
    refetchInterval: 30000,
  });
}

// Get SOS events
export function useSOSEvents(params?: { status?: SOSEvent['status']; limit?: number }) {
  return useQuery({
    queryKey: [...safetyKeys.sosEvents(), params],
    queryFn: async () => {
      const response = await safetyService.getSOSEvents(params);
      return response.items;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for active SOS
  });
}

// Mutations

// Acknowledge incident
export function useAcknowledgeIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await safetyService.acknowledgeIncident(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.incidents() });
      queryClient.invalidateQueries({ queryKey: safetyKeys.metrics() });
    },
  });
}

// Resolve incident
export function useResolveIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return await safetyService.resolveIncident(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.incidents() });
      queryClient.invalidateQueries({ queryKey: safetyKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: safetyKeys.emergencyResponses() });
    },
  });
}

// Dispatch emergency
export function useDispatchEmergency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ incidentId, type }: { incidentId: string; type: Parameters<typeof safetyService.dispatchEmergency>[1] }) => {
      return await safetyService.dispatchEmergency(incidentId, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.emergencyResponses() });
      queryClient.invalidateQueries({ queryKey: safetyKeys.incidents() });
    },
  });
}

// Acknowledge alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await safetyService.acknowledgeAlert(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.alerts() });
    },
  });
}

// Export types
export type { SafetyIncident, SafetyMetrics, DriverSafetyRanking, SafetyAlert, SOSEvent };
// EmergencyType is used by EmergencyPanel component
export type { EmergencyType } from '@/services/safety/safety.service';
