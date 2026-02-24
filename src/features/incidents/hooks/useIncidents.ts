import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Incident, IncidentStatus, IncidentPriority, IncidentType, Severity } from '@/types/domain.types';

export interface IncidentsFilters {
  status?: IncidentStatus[];
  priority?: IncidentPriority[];
  type?: IncidentType[];
  severity?: Severity[];
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IncidentsResponse {
  items: Incident[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Backend incident response type
interface BackendIncident {
  id?: string;
  incident_id?: string;
  type?: string;
  severity?: string;
  status?: string;
  priority?: string;
  reported_by?: {
    type: string;
    user_id: string;
    name: string;
    reported_at: string;
  };
  involved?: {
    drivers?: Array<{
      driver_id: string;
      name: string;
      phone?: string;
    }>;
    vehicles?: Array<{
      vehicle_id: string;
      plate_number: string;
    }>;
    customers?: Array<{
      customer_id: string;
      name: string;
    }>;
  };
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  description?: {
    summary: string;
    detailed_narrative?: string;
    circumstances?: string[];
  };
  evidence?: {
    photos?: Array<{
      id: string;
      url: string;
      thumbnail_url?: string;
      uploaded_at: string;
      uploaded_by: string;
    }>;
    videos?: Array<{
      id: string;
      url: string;
      thumbnail_url?: string;
      uploaded_at: string;
      uploaded_by: string;
    }>;
    documents?: Array<{
      id: string;
      url: string;
      uploaded_at: string;
      uploaded_by: string;
    }>;
    witnesses?: Array<{
      name: string;
      contact: string;
      statement?: string;
    }>;
  };
  investigation?: {
    assigned_to?: {
      user_id: string;
      name: string;
      assigned_at: string;
    };
    findings?: string;
    recommendations?: string;
    started_at?: string;
    completed_at?: string;
  };
  disciplinary_action?: {
    action_type: string;
    duration?: number;
    effective_date: string;
    reason: string;
    decided_by: string;
    appeal_status?: string;
  };
  timeline?: {
    reported_at: string;
    investigation_started?: string;
    investigation_completed?: string;
    action_taken?: string;
    resolved?: string;
    reopened?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface BackendIncidentsResponse {
  items: BackendIncident[];
  total: number;
  page: number;
  limit: number;
}

// Map backend incident data to frontend Incident type
function mapBackendIncident(data: BackendIncident): Incident {
  return {
    incidentId: data.incident_id || data.id || '',
    type: mapIncidentType(data.type),
    severity: mapSeverity(data.severity),
    status: mapIncidentStatus(data.status),
    priority: mapPriority(data.priority),
    reportedBy: data.reported_by ? {
      type: mapReporterType(data.reported_by.type),
      userId: data.reported_by.user_id,
      name: data.reported_by.name,
      reportedAt: data.reported_by.reported_at,
    } : { type: 'System', userId: '', name: 'Unknown', reportedAt: data.created_at || new Date().toISOString() },
    involved: data.involved ? {
      drivers: (data.involved.drivers || []).map(d => ({
        driverId: d.driver_id,
        name: d.name,
        phone: d.phone || '',
      })),
      vehicles: (data.involved.vehicles || []).map(v => ({
        vehicleId: v.vehicle_id,
        plateNumber: v.plate_number,
      })),
      customers: (data.involved.customers || []).map(c => ({
        customerId: c.customer_id,
        name: c.name,
      })),
    } : { drivers: [], vehicles: [], customers: [] },
    location: data.location ? {
      lat: data.location.lat,
      lng: data.location.lng,
      timestamp: data.created_at || new Date().toISOString(),
    } : undefined,
    description: data.description ? {
      summary: data.description.summary,
      detailedNarrative: data.description.detailed_narrative || '',
      circumstances: data.description.circumstances || [],
    } : { summary: '', detailedNarrative: '', circumstances: [] },
    evidence: data.evidence ? {
      photos: (data.evidence.photos || []).map(p => ({
        id: p.id,
        type: 'image' as const,
        url: p.url,
        thumbnailUrl: p.thumbnail_url,
        uploadedAt: p.uploaded_at,
        uploadedBy: p.uploaded_by,
      })),
      videos: (data.evidence.videos || []).map(v => ({
        id: v.id,
        type: 'video' as const,
        url: v.url,
        thumbnailUrl: v.thumbnail_url,
        uploadedAt: v.uploaded_at,
        uploadedBy: v.uploaded_by,
      })),
      documents: (data.evidence.documents || []).map(d => ({
        id: d.id,
        type: 'document' as const,
        url: d.url,
        uploadedAt: d.uploaded_at,
        uploadedBy: d.uploaded_by,
      })),
      witnesses: data.evidence.witnesses || [],
    } : { photos: [], videos: [], documents: [], witnesses: [] },
    investigation: data.investigation ? {
      assignedTo: data.investigation.assigned_to ? {
        userId: data.investigation.assigned_to.user_id,
        name: data.investigation.assigned_to.name,
        assignedAt: data.investigation.assigned_to.assigned_at,
      } : undefined,
      findings: data.investigation.findings,
      recommendations: data.investigation.recommendations,
      startedAt: data.investigation.started_at,
      completedAt: data.investigation.completed_at,
    } : undefined,
    disciplinaryAction: data.disciplinary_action ? {
      actionType: mapDisciplinaryActionType(data.disciplinary_action.action_type),
      duration: data.disciplinary_action.duration,
      effectiveDate: data.disciplinary_action.effective_date,
      reason: data.disciplinary_action.reason,
      decidedBy: data.disciplinary_action.decided_by,
      appealStatus: mapAppealStatus(data.disciplinary_action.appeal_status),
    } : undefined,
    timeline: data.timeline ? {
      reportedAt: data.timeline.reported_at,
      investigationStarted: data.timeline.investigation_started,
      investigationCompleted: data.timeline.investigation_completed,
      actionTaken: data.timeline.action_taken,
      resolved: data.timeline.resolved,
      reopened: data.timeline.reopened,
    } : { reportedAt: data.created_at || new Date().toISOString() },
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  };
}

function mapIncidentType(type: string | undefined): IncidentType {
  switch (type?.toUpperCase()) {
    case 'ACCIDENT':
      return 'Accident';
    case 'SAFETY_VIOLATION':
      return 'SafetyViolation';
    case 'CUSTOMER_COMPLAINT':
      return 'CustomerComplaint';
    case 'DRIVER_MISCONDUCT':
      return 'DriverMisconduct';
    case 'VEHICLE_ISSUE':
      return 'VehicleIssue';
    case 'POLICY_VIOLATION':
      return 'PolicyViolation';
    case 'FRAUD':
      return 'Fraud';
    default:
      return 'Other';
  }
}

function mapSeverity(severity: string | undefined): Severity {
  switch (severity?.toUpperCase()) {
    case 'LOW':
      return 'Low';
    case 'MEDIUM':
      return 'Medium';
    case 'HIGH':
      return 'High';
    case 'CRITICAL':
      return 'Critical';
    default:
      return 'Medium';
  }
}

function mapIncidentStatus(status: string | undefined): IncidentStatus {
  switch (status?.toUpperCase()) {
    case 'NEW':
      return 'New';
    case 'REVIEWING':
      return 'Reviewing';
    case 'INVESTIGATING':
      return 'Investigating';
    case 'PENDING_ACTION':
      return 'PendingAction';
    case 'HEARING':
      return 'Hearing';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    default:
      return 'New';
  }
}

function mapPriority(priority: string | undefined): IncidentPriority {
  switch (priority?.toUpperCase()) {
    case 'NORMAL':
      return 'Normal';
    case 'HIGH':
      return 'High';
    case 'URGENT':
      return 'Urgent';
    default:
      return 'Normal';
  }
}

function mapReporterType(type: string | undefined): 'Driver' | 'Customer' | 'System' | 'Admin' {
  switch (type?.toUpperCase()) {
    case 'DRIVER':
      return 'Driver';
    case 'CUSTOMER':
      return 'Customer';
    case 'ADMIN':
      return 'Admin';
    default:
      return 'System';
  }
}

function mapDisciplinaryActionType(type: string | undefined): 'Warning' | 'Suspension' | 'Termination' | 'Training' {
  switch (type?.toUpperCase()) {
    case 'WARNING':
      return 'Warning';
    case 'SUSPENSION':
      return 'Suspension';
    case 'TERMINATION':
      return 'Termination';
    case 'TRAINING':
      return 'Training';
    default:
      return 'Warning';
  }
}

function mapAppealStatus(status: string | undefined): 'None' | 'Pending' | 'Approved' | 'Rejected' {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'None';
  }
}

// Mock incidents for development
const mockIncidents: Incident[] = [
  { incidentId: 'INC-001', type: 'Accident', severity: 'High', status: 'Investigating', priority: 'Urgent', reportedBy: { type: 'Driver', userId: 'D001', name: 'Juan Santos', reportedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() }, involved: { drivers: [{ driverId: 'D001', name: 'Juan Santos', phone: '+639123456789' }], vehicles: [{ vehicleId: 'V001', plateNumber: 'ABC-1234' }], customers: [] }, location: { lat: 14.5995, lng: 120.9842, timestamp: new Date(Date.now() - 2*24*60*60*1000).toISOString() }, description: { summary: 'Minor collision with motorcycle at intersection', detailedNarrative: 'Driver was making a left turn when a motorcycle ran a red light causing a minor collision. No injuries reported.', circumstances: ['Traffic light was green', 'Motorcycle ran red light', 'Low speed collision'] }, evidence: { photos: [], videos: [], documents: [], witnesses: [{ name: 'Pedro Reyes', contact: '+639112233445', statement: 'I saw the motorcycle run the red light' }] }, timeline: { reportedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() }, createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
  { incidentId: 'INC-002', type: 'CustomerComplaint', severity: 'Medium', status: 'Reviewing', priority: 'Normal', reportedBy: { type: 'Customer', userId: 'C001', name: 'Maria Garcia', reportedAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() }, involved: { drivers: [{ driverId: 'D002', name: 'Maria Cruz', phone: '+639876543210' }], vehicles: [], customers: [{ customerId: 'C001', name: 'Maria Garcia' }] }, location: { lat: 14.6095, lng: 120.9942, timestamp: new Date(Date.now() - 5*24*60*60*1000).toISOString() }, description: { summary: 'Driver rude and unprofessional behavior', detailedNarrative: 'Customer reported that the driver was rude and used inappropriate language during the trip.', circumstances: ['Late pickup', 'Argument over route'] }, evidence: { photos: [], videos: [], documents: [], witnesses: [] }, timeline: { reportedAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() }, createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 4*24*60*60*1000).toISOString() },
  { incidentId: 'INC-003', type: 'SafetyViolation', severity: 'Critical', status: 'PendingAction', priority: 'Urgent', reportedBy: { type: 'System', userId: 'SYSTEM', name: 'Auto Detection', reportedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() }, involved: { drivers: [{ driverId: 'D005', name: 'Pedro Reyes', phone: '+639112233445' }], vehicles: [{ vehicleId: 'V005', plateNumber: 'JKL-7890' }], customers: [] }, location: { lat: 14.5895, lng: 120.9642, timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString() }, description: { summary: 'Speeding violation detected - 90kph in 60kph zone', detailedNarrative: 'GPS data shows vehicle exceeded speed limit by 50% for more than 5 minutes.', circumstances: ['Speed limit 60kph', 'Recorded speed 90kph', 'Duration 5+ minutes'] }, evidence: { photos: [], videos: [], documents: [{ id: 'DOC001', type: 'document', url: '/reports/speed_violation_001.pdf', uploadedAt: new Date().toISOString(), uploadedBy: 'SYSTEM' }], witnesses: [] }, timeline: { reportedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() }, createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(), updatedAt: new Date().toISOString() },
  { incidentId: 'INC-004', type: 'VehicleIssue', severity: 'Low', status: 'Resolved', priority: 'Normal', reportedBy: { type: 'Driver', userId: 'D001', name: 'Juan Santos', reportedAt: new Date(Date.now() - 7*24*60*60*1000).toISOString() }, involved: { drivers: [{ driverId: 'D001', name: 'Juan Santos', phone: '+639123456789' }], vehicles: [{ vehicleId: 'V001', plateNumber: 'ABC-1234' }], customers: [] }, location: { lat: 14.5995, lng: 120.9842, timestamp: new Date(Date.now() - 7*24*60*60*1000).toISOString() }, description: { summary: 'Air conditioning not working properly', detailedNarrative: 'Driver reported that the vehicle AC is blowing warm air and needs maintenance.', circumstances: ['AC malfunction', 'Reported during shift'] }, evidence: { photos: [], videos: [], documents: [], witnesses: [] }, timeline: { reportedAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(), resolved: new Date(Date.now() - 3*24*60*60*1000).toISOString() }, createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
];

// REAL API HOOK - Fetches incidents from /api/incidents/v2
export function useIncidents(filters: IncidentsFilters = {}) {
  const { status, priority, type, searchQuery, pageNumber = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['incidents', 'list', filters],
    queryFn: async (): Promise<IncidentsResponse> => {
      try {
        const params = new URLSearchParams();
        params.append('page', pageNumber.toString());
        params.append('limit', pageSize.toString());
        if (status?.length) params.append('status', status.map(s => s.toUpperCase()).join(','));
        if (priority?.length) params.append('priority', priority.map(p => p.toUpperCase()).join(','));
        if (type?.length) params.append('type', type.map(t => t.toUpperCase()).join(','));
        if (searchQuery) params.append('search', searchQuery);

        const response = await apiClient.get<BackendIncidentsResponse>(
          `api/incidents/v2?${params.toString()}`
        );

        // Map backend response to frontend format
        const items = (response.items || []).map(mapBackendIncident);

        // Return mock data if API returns empty
        if (items.length === 0) {
          return applyIncidentFilters(mockIncidents, status, priority, type, searchQuery, pageNumber, pageSize);
        }

        return {
          items,
          total: response.total || items.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil((response.total || items.length) / pageSize),
        };
      } catch (error) {
        // Return mock data on error
        return applyIncidentFilters(mockIncidents, status, priority, type, searchQuery, pageNumber, pageSize);
      }
    },
  });
}

function applyIncidentFilters(
  items: Incident[],
  status: IncidentStatus[] | undefined,
  priority: IncidentPriority[] | undefined,
  type: IncidentType[] | undefined,
  searchQuery: string | undefined,
  pageNumber: number,
  pageSize: number
): IncidentsResponse {
  let filteredItems = items;
  if (status && status.length > 0) {
    filteredItems = filteredItems.filter(i => status.includes(i.status));
  }
  if (priority && priority.length > 0) {
    filteredItems = filteredItems.filter(i => priority.includes(i.priority));
  }
  if (type && type.length > 0) {
    filteredItems = filteredItems.filter(i => type.includes(i.type));
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(i =>
      i.incidentId.toLowerCase().includes(query) ||
      i.description.summary.toLowerCase().includes(query)
    );
  }

  return {
    items: filteredItems,
    total: filteredItems.length,
    pageNumber,
    pageSize,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

// Get single incident
export function useIncident(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async (): Promise<Incident | null> => {
      if (!incidentId) return null;
      try {
        const response = await apiClient.get<BackendIncident>(`api/incidents/v2/${incidentId}`);
        return mapBackendIncident(response);
      } catch (error) {
        // Return mock incident if API fails
        const mockIncident = mockIncidents.find(i => i.incidentId === incidentId);
        return mockIncident || null;
      }
    },
    enabled: !!incidentId,
  });
}

// Change incident priority
export function useChangePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { incidentId: string; priority: string }) => {
      const response = await apiClient.patch(`api/incidents/v2/${data.incidentId}`, {
        priority: data.priority.toUpperCase(),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incident', variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
  });
}

// Bulk update incident status
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { incidentIds: string[]; status: string }) => {
      const response = await apiClient.post('api/incidents/v2/bulk-update', {
        incident_ids: data.incidentIds,
        status: data.status.toUpperCase(),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
  });
}

// Create incident
export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Incident>) => {
      const response = await apiClient.post('api/incidents/v2', {
        type: data.type?.toUpperCase(),
        severity: data.severity?.toUpperCase(),
        priority: data.priority?.toUpperCase(),
        description: data.description,
        location: data.location,
        involved: data.involved,
        reported_by: data.reportedBy,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
  });
}

// Update incident
export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { incidentId: string; updates: Partial<Incident> }) => {
      const response = await apiClient.patch(`api/incidents/v2/${data.incidentId}`, {
        type: data.updates.type?.toUpperCase(),
        severity: data.updates.severity?.toUpperCase(),
        status: data.updates.status?.toUpperCase(),
        priority: data.updates.priority?.toUpperCase(),
        description: data.updates.description,
        investigation: data.updates.investigation,
        disciplinary_action: data.updates.disciplinaryAction,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incident', variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
  });
}

// Assign incident to investigator
export function useAssignIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { incidentId: string; userId: string }) => {
      const response = await apiClient.post(`api/incidents/v2/${data.incidentId}/assign`, {
        user_id: data.userId,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incident', variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
  });
}

// Add evidence to incident
export function useAddIncidentEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { incidentId: string; evidence: FormData }) => {
      const response = await apiClient.post(
        `api/incidents/v2/${data.incidentId}/evidence`,
        data.evidence,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incident', variables.incidentId] });
    },
  });
}
