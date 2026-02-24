/**
 * Incidents Service
 * Manages incidents through custom backend
 */

import { backendApi } from './backend.api';
import { BACKEND_ENDPOINTS } from '../config/backend.config';

export interface CreateIncidentInput {
  driverId: string;
  shiftId?: string;
  tripId?: string;
  incidentType: 'BREAKDOWN' | 'SOS' | 'ACCIDENT' | 'INTEGRITY_ALERT' | 'CUSTOMER_COMPLAINT' | 'TRAFFIC_VIOLATION';
  severity?: number;
  occurredAt: string;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  description: string;
  thirdPartyName?: string;
  thirdPartyContact?: string;
  thirdPartyPlate?: string;
  thirdPartyInsurance?: string;
  photoUrls?: string[];
  dashcamFootageUrl?: string;
}

export interface UpdateIncidentInput {
  status?: 'OPEN' | 'INVESTIGATING' | 'PENDING_DOCUMENTATION' | 'AUDIT_FAIL' | 'RESOLVED' | 'ESCALATED';
  severity?: number;
  description?: string;
  resolutionNotes?: string;
}

export interface ResolveIncidentInput {
  notes: string;
}

export interface AddEvidenceInput {
  photoUrls?: string[];
  dashcamFootageUrl?: string;
}

export const incidentsService = {
  async list(params: {
    driverId?: string;
    status?: string;
    incidentType?: string;
    page?: number;
    limit?: number;
  } = {}) {
    return backendApi.get(BACKEND_ENDPOINTS.incidents.list, params);
  },

  async create(input: CreateIncidentInput) {
    return backendApi.post(BACKEND_ENDPOINTS.incidents.create, input);
  },

  async getById(id: string) {
    return backendApi.get(BACKEND_ENDPOINTS.incidents.detail(id));
  },

  async update(id: string, input: UpdateIncidentInput) {
    return backendApi.patch(BACKEND_ENDPOINTS.incidents.update(id), input);
  },

  async resolve(id: string, input: ResolveIncidentInput) {
    return backendApi.post(BACKEND_ENDPOINTS.incidents.resolve(id), input);
  },

  async addEvidence(id: string, input: AddEvidenceInput) {
    return backendApi.post(BACKEND_ENDPOINTS.incidents.addEvidence(id), input);
  },

  async getTimeline(id: string) {
    return backendApi.get(BACKEND_ENDPOINTS.incidents.timeline(id));
  },

  async getDeductible(id: string) {
    return backendApi.get(BACKEND_ENDPOINTS.incidents.deductible(id));
  },

  async getDriverIncidents(driverId: string, params: { page?: number; limit?: number } = {}) {
    return backendApi.get(BACKEND_ENDPOINTS.incidents.driverIncidents(driverId), params);
  },
};

export default incidentsService;
