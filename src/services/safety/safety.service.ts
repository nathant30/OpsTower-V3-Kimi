/**
 * Safety Service
 * Manages safety incidents, emergency responses, and safety metrics
 */

import { backendApi } from '../backend.api';

export type SafetyIncidentType = 
  | 'emergency'
  | 'accident'
  | 'harassment'
  | 'panic_button'
  | 'speeding'
  | 'route_deviation'
  | 'unsafe_driving'
  | 'vehicle_malfunction'
  | 'medical'
  | 'security'
  | 'other';

export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SafetyStatus = 'reported' | 'acknowledged' | 'responding' | 'resolved' | 'closed';
export type EmergencyType = 'police' | 'medical' | 'fire' | 'tow' | 'security';

export interface SafetyIncident {
  id: string;
  type: SafetyIncidentType;
  severity: SafetySeverity;
  status: SafetyStatus;
  title: string;
  description: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    safetyScore: number;
  };
  passenger?: {
    id: string;
    name: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    plateNumber: string;
    model: string;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  reportedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  responseTime?: number; // in minutes
  panicButton?: boolean;
  assignedResponder?: string;
  notes?: string[];
}

export interface EmergencyResponse {
  id: string;
  type: EmergencyType;
  incidentId: string;
  status: 'dispatched' | 'en_route' | 'on_scene' | 'resolved';
  dispatchedAt: string;
  estimatedArrival?: number; // in minutes
  responderName?: string;
  responderContact?: string;
  notes?: string;
}

export interface SafetyMetrics {
  overallScore: number;
  incidentsToday: number;
  activeEmergencies: number;
  resolvedToday: number;
  avgResponseTime: number;
  safetyViolations: number;
  incidentsByType: Record<SafetyIncidentType, number>;
  incidentsOverTime: {
    date: string;
    count: number;
    severity: SafetySeverity;
  }[];
}

export interface DriverSafetyRanking {
  driverId: string;
  name: string;
  avatar?: string;
  safetyScore: number;
  totalTrips: number;
  incidents: number;
  violations: number;
  ranking: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SafetyAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  incidentId?: string;
}

export interface SOSEvent {
  id: string;
  triggeredAt: string;
  resolvedAt?: string;
  driverId: string;
  driverName: string;
  location: string;
  status: 'active' | 'resolved' | 'false_alarm';
  responseTime?: number;
}

// Mock data for development
const mockSafetyIncidents: SafetyIncident[] = [
  {
    id: 'SFT-001',
    type: 'panic_button',
    severity: 'critical',
    status: 'responding',
    title: 'Panic Button Activated',
    description: 'Driver pressed panic button due to threatening passenger behavior',
    driver: {
      id: 'DRV-001',
      name: 'Juan Santos',
      phone: '+63 912 345 6789',
      rating: 4.8,
      safetyScore: 92,
    },
    passenger: {
      id: 'PAS-001',
      name: 'Unknown',
      phone: '+63 998 765 4321',
    },
    vehicle: {
      id: 'VEH-001',
      plateNumber: 'ABC-1234',
      model: 'Toyota Vios',
    },
    location: {
      address: 'Makati CBD, Metro Manila',
      lat: 14.5547,
      lng: 121.0244,
    },
    reportedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    panicButton: true,
    assignedResponder: 'Security Team Alpha',
    notes: ['Security team dispatched', 'Location tracked via GPS'],
  },
  {
    id: 'SFT-002',
    type: 'accident',
    severity: 'high',
    status: 'acknowledged',
    title: 'Vehicle Collision',
    description: 'Minor collision at intersection - no injuries reported',
    driver: {
      id: 'DRV-002',
      name: 'Pedro Reyes',
      phone: '+63 917 234 5678',
      rating: 4.5,
      safetyScore: 85,
    },
    vehicle: {
      id: 'VEH-002',
      plateNumber: 'XYZ-5678',
      model: 'Honda City',
    },
    location: {
      address: 'EDSA corner Ortigas Ave, Quezon City',
      lat: 14.6091,
      lng: 121.0223,
    },
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    notes: ['Insurance notified', 'Police report filed'],
  },
  {
    id: 'SFT-003',
    type: 'harassment',
    severity: 'medium',
    status: 'resolved',
    title: 'Passenger Complaint',
    description: 'Passenger reported uncomfortable behavior from driver',
    driver: {
      id: 'DRV-003',
      name: 'Miguel Torres',
      phone: '+63 918 345 6789',
      rating: 4.2,
      safetyScore: 78,
    },
    passenger: {
      id: 'PAS-002',
      name: 'Maria Cruz',
      phone: '+63 919 876 5432',
    },
    location: {
      address: 'BGC, Taguig City',
      lat: 14.5503,
      lng: 121.048,
    },
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    responseTime: 60,
    notes: ['Driver warned', 'Incident logged'],
  },
  {
    id: 'SFT-004',
    type: 'speeding',
    severity: 'medium',
    status: 'resolved',
    title: 'Speed Violation',
    description: 'Vehicle exceeded speed limit by 30% for sustained period',
    driver: {
      id: 'DRV-004',
      name: 'Carlos Mendoza',
      phone: '+63 920 456 7890',
      rating: 4.6,
      safetyScore: 82,
    },
    vehicle: {
      id: 'VEH-003',
      plateNumber: 'DEF-9012',
      model: 'Mitsubishi Mirage',
    },
    location: {
      address: 'SLEX, Muntinlupa',
      lat: 14.4082,
      lng: 121.0415,
    },
    reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    responseTime: 30,
    notes: ['Automated alert from telematics', 'Driver coaching scheduled'],
  },
  {
    id: 'SFT-005',
    type: 'route_deviation',
    severity: 'low',
    status: 'resolved',
    title: 'Route Deviation Alert',
    description: 'Driver deviated significantly from suggested route',
    driver: {
      id: 'DRV-005',
      name: 'Antonio Garcia',
      phone: '+63 921 567 8901',
      rating: 4.9,
      safetyScore: 95,
    },
    passenger: {
      id: 'PAS-003',
      name: 'Ana Lopez',
      phone: '+63 922 678 9012',
    },
    location: {
      address: 'Quezon City',
      lat: 14.676,
      lng: 121.0437,
    },
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
    responseTime: 12,
    notes: ['Driver took alternate route due to traffic', 'Passenger informed'],
  },
  {
    id: 'SFT-006',
    type: 'emergency',
    severity: 'critical',
    status: 'responding',
    title: 'Medical Emergency',
    description: 'Passenger experiencing medical distress during trip',
    driver: {
      id: 'DRV-006',
      name: 'Roberto Lim',
      phone: '+63 923 678 9012',
      rating: 4.7,
      safetyScore: 88,
    },
    passenger: {
      id: 'PAS-004',
      name: 'Elena Wang',
      phone: '+63 924 789 0123',
    },
    vehicle: {
      id: 'VEH-004',
      plateNumber: 'GHI-3456',
      model: 'Nissan Almera',
    },
    location: {
      address: 'Mall of Asia Complex, Pasay',
      lat: 14.535,
      lng: 120.982,
    },
    reportedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    assignedResponder: 'EMS Team 3',
    notes: ['Ambulance dispatched', 'Driver instructed to pull over safely'],
  },
];

const mockEmergencyResponses: EmergencyResponse[] = [
  {
    id: 'EMR-001',
    type: 'security',
    incidentId: 'SFT-001',
    status: 'en_route',
    dispatchedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedArrival: 5,
    responderName: 'Security Team Alpha',
    responderContact: '+63 925 000 1111',
    notes: 'ETA 5 minutes to location',
  },
  {
    id: 'EMR-002',
    type: 'medical',
    incidentId: 'SFT-006',
    status: 'en_route',
    dispatchedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    estimatedArrival: 8,
    responderName: 'EMS Team 3',
    responderContact: '+63 925 000 2222',
    notes: 'Priority response dispatched',
  },
];

const mockSafetyMetrics: SafetyMetrics = {
  overallScore: 87,
  incidentsToday: 6,
  activeEmergencies: 2,
  resolvedToday: 4,
  avgResponseTime: 4.2,
  safetyViolations: 3,
  incidentsByType: {
    emergency: 2,
    accident: 1,
    harassment: 1,
    panic_button: 1,
    speeding: 1,
    route_deviation: 1,
    unsafe_driving: 0,
    vehicle_malfunction: 0,
    medical: 1,
    security: 1,
    other: 0,
  },
  incidentsOverTime: [
    { date: '2026-02-10', count: 3, severity: 'low' },
    { date: '2026-02-11', count: 5, severity: 'medium' },
    { date: '2026-02-12', count: 2, severity: 'low' },
    { date: '2026-02-13', count: 7, severity: 'high' },
    { date: '2026-02-14', count: 4, severity: 'medium' },
    { date: '2026-02-15', count: 6, severity: 'medium' },
    { date: '2026-02-16', count: 8, severity: 'high' },
    { date: '2026-02-17', count: 6, severity: 'critical' },
  ],
};

const mockDriverRankings: DriverSafetyRanking[] = [
  {
    driverId: 'DRV-005',
    name: 'Antonio Garcia',
    safetyScore: 95,
    totalTrips: 1247,
    incidents: 1,
    violations: 0,
    ranking: 1,
    trend: 'up',
  },
  {
    driverId: 'DRV-001',
    name: 'Juan Santos',
    safetyScore: 92,
    totalTrips: 2156,
    incidents: 2,
    violations: 1,
    ranking: 2,
    trend: 'stable',
  },
  {
    driverId: 'DRV-006',
    name: 'Roberto Lim',
    safetyScore: 88,
    totalTrips: 1834,
    incidents: 3,
    violations: 2,
    ranking: 3,
    trend: 'down',
  },
  {
    driverId: 'DRV-002',
    name: 'Pedro Reyes',
    safetyScore: 85,
    totalTrips: 987,
    incidents: 4,
    violations: 3,
    ranking: 4,
    trend: 'stable',
  },
  {
    driverId: 'DRV-004',
    name: 'Carlos Mendoza',
    safetyScore: 82,
    totalTrips: 1567,
    incidents: 5,
    violations: 4,
    ranking: 5,
    trend: 'down',
  },
];

const mockSafetyAlerts: SafetyAlert[] = [
  {
    id: 'ALR-001',
    type: 'critical',
    title: 'Panic Button Activated',
    message: 'Driver Juan Santos has activated panic button in Makati CBD',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    acknowledged: true,
    incidentId: 'SFT-001',
  },
  {
    id: 'ALR-002',
    type: 'critical',
    title: 'Medical Emergency',
    message: 'Medical emergency reported in Pasay - EMS dispatched',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledged: false,
    incidentId: 'SFT-006',
  },
  {
    id: 'ALR-003',
    type: 'warning',
    title: 'Speed Violation Pattern',
    message: 'Multiple speeding violations detected in SLEX area',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'ALR-004',
    type: 'info',
    title: 'Safety Score Updated',
    message: 'Weekly safety scores have been recalculated',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
];

const mockSOSEvents: SOSEvent[] = [
  {
    id: 'SOS-001',
    triggeredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    driverId: 'DRV-001',
    driverName: 'Juan Santos',
    location: 'Makati CBD, Metro Manila',
    status: 'active',
    responseTime: 2,
  },
  {
    id: 'SOS-002',
    triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    driverId: 'DRV-010',
    driverName: 'Jose dela Cruz',
    location: 'BGC, Taguig',
    status: 'resolved',
    responseTime: 15,
  },
  {
    id: 'SOS-003',
    triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    driverId: 'DRV-015',
    driverName: 'Ramon Bautista',
    location: 'Quezon City',
    status: 'false_alarm',
    responseTime: 5,
  },
];

export const safetyService = {
  async getIncidents(params: {
    status?: SafetyStatus;
    severity?: SafetySeverity;
    type?: SafetyIncidentType;
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    try {
      // In production, this would call the backend API
      // return await backendApi.get('/api/safety/incidents', params);
      
      // Filter mock data based on params
      let incidents = [...mockSafetyIncidents];
      if (params.status) {
        incidents = incidents.filter(i => i.status === params.status);
      }
      if (params.severity) {
        incidents = incidents.filter(i => i.severity === params.severity);
      }
      if (params.type) {
        incidents = incidents.filter(i => i.type === params.type);
      }
      return { items: incidents, total: incidents.length };
    } catch (error) {
      console.error('Failed to fetch safety incidents:', error);
      return { items: mockSafetyIncidents, total: mockSafetyIncidents.length };
    }
  },

  async getIncidentById(id: string) {
    try {
      // return await backendApi.get(`/api/safety/incidents/${id}`);
      const incident = mockSafetyIncidents.find(i => i.id === id);
      return incident || null;
    } catch (error) {
      console.error('Failed to fetch incident:', error);
      return null;
    }
  },

  async getMetrics() {
    try {
      // return await backendApi.get('/api/safety/metrics');
      return mockSafetyMetrics;
    } catch (error) {
      console.error('Failed to fetch safety metrics:', error);
      return mockSafetyMetrics;
    }
  },

  async getEmergencyResponses() {
    try {
      // return await backendApi.get('/api/safety/emergency-responses');
      return { items: mockEmergencyResponses, total: mockEmergencyResponses.length };
    } catch (error) {
      console.error('Failed to fetch emergency responses:', error);
      return { items: mockEmergencyResponses, total: mockEmergencyResponses.length };
    }
  },

  async dispatchEmergency(incidentId: string, type: EmergencyType) {
    try {
      // return await backendApi.post('/api/safety/emergency-dispatch', { incidentId, type });
      return { success: true, message: 'Emergency services dispatched' };
    } catch (error) {
      console.error('Failed to dispatch emergency:', error);
      throw error;
    }
  },

  async acknowledgeIncident(id: string) {
    try {
      // return await backendApi.post(`/api/safety/incidents/${id}/acknowledge`);
      return { success: true };
    } catch (error) {
      console.error('Failed to acknowledge incident:', error);
      throw error;
    }
  },

  async resolveIncident(id: string, notes?: string) {
    try {
      // return await backendApi.post(`/api/safety/incidents/${id}/resolve`, { notes });
      return { success: true };
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      throw error;
    }
  },

  async getDriverRankings(limit: number = 10) {
    try {
      // return await backendApi.get('/api/safety/driver-rankings', { limit });
      return { items: mockDriverRankings.slice(0, limit), total: mockDriverRankings.length };
    } catch (error) {
      console.error('Failed to fetch driver rankings:', error);
      return { items: mockDriverRankings.slice(0, limit), total: mockDriverRankings.length };
    }
  },

  async getAlerts() {
    try {
      // return await backendApi.get('/api/safety/alerts');
      return { items: mockSafetyAlerts, total: mockSafetyAlerts.length };
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return { items: mockSafetyAlerts, total: mockSafetyAlerts.length };
    }
  },

  async acknowledgeAlert(id: string) {
    try {
      // return await backendApi.post(`/api/safety/alerts/${id}/acknowledge`);
      return { success: true };
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  },

  async getSOSEvents(params: { status?: SOSEvent['status']; limit?: number } = {}) {
    try {
      // return await backendApi.get('/api/safety/sos-events', params);
      let events = [...mockSOSEvents];
      if (params.status) {
        events = events.filter(e => e.status === params.status);
      }
      if (params.limit) {
        events = events.slice(0, params.limit);
      }
      return { items: events, total: events.length };
    } catch (error) {
      console.error('Failed to fetch SOS events:', error);
      return { items: mockSOSEvents, total: mockSOSEvents.length };
    }
  },
};

export default safetyService;
