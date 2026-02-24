import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, QUERY_KEYS } from '@/config/api.config';
import type { Incident } from '@/types/domain.types';

/**
 * Hook for assigning an investigator to an incident
 */
export function useAssignInvestigator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      investigatorUserId: string;
      investigatorName: string;
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.assignInvestigator,
        {
          disciplinaryId: data.disciplinaryId,
          investigativeUserId: data.investigatorUserId,
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for saving investigation findings
 */
export function useSaveInvestigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      findings: string;
      recommendations: string;
      additionalNotes?: string;
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.saveInvestigation,
        {
          disciplinaryId: data.disciplinaryId,
          investigationFindings: data.findings,
          investigationRecommendations: data.recommendations,
          additionalNotes: data.additionalNotes,
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for taking disciplinary action
 */
export function useTakeDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      actionType: 'Warning' | 'Suspension' | 'Termination' | 'Training';
      duration?: number; // days
      effectiveDate: string;
      reason: string;
      decidedBy: string;
      additionalSanctions?: string[];
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.saveAction,
        {
          disciplinaryId: data.disciplinaryId,
          actionType: data.actionType,
          duration: data.duration,
          effectiveDate: data.effectiveDate,
          reason: data.reason,
          decidedBy: data.decidedBy,
          additionalSanctions: data.additionalSanctions,
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for scheduling a hearing
 */
export function useScheduleHearing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      hearingDate: string;
      hearingOfficer: string;
      location?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.create,
        {
          disciplinaryId: data.disciplinaryId,
          hearingScheduled: {
            date: data.hearingDate,
            officer: data.hearingOfficer,
            location: data.location,
            notes: data.notes,
          },
          status: 'Hearing',
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for resolving an incident
 */
export function useResolveIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      resolution: string;
      resolvedBy: string;
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.create,
        {
          disciplinaryId: data.disciplinaryId,
          resolution: data.resolution,
          resolvedBy: data.resolvedBy,
          status: 'Resolved',
          resolvedAt: new Date().toISOString(),
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for closing an incident
 */
export function useCloseIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      closureReason: string;
      closedBy: string;
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.create,
        {
          disciplinaryId: data.disciplinaryId,
          closureReason: data.closureReason,
          closedBy: data.closedBy,
          status: 'Closed',
          closedAt: new Date().toISOString(),
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for reopening a closed incident
 */
export function useReopenIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      reopenReason: string;
      reopenedBy: string;
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.create,
        {
          disciplinaryId: data.disciplinaryId,
          reopenReason: data.reopenReason,
          reopenedBy: data.reopenedBy,
          status: 'Reviewing',
          reopenedAt: new Date().toISOString(),
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.incidents.list] });
    },
  });
}

/**
 * Hook for adding evidence to an incident
 */
export function useAddEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      disciplinaryId: string;
      evidence: {
        type: 'image' | 'video' | 'document';
        url: string;
        thumbnailUrl?: string;
        uploadedBy: string;
        description?: string;
      };
    }) => {
      const response = await apiClient.post<Incident>(
        ENDPOINTS.incidents.create,
        {
          disciplinaryId: data.disciplinaryId,
          newEvidence: data.evidence,
        }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.incidents.detail(variables.disciplinaryId) 
      });
    },
  });
}
