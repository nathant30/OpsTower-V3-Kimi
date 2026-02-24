/**
 * Dashcam Service
 * Manages dashcam devices, recordings, and health monitoring
 * 
 * Supports both Traksolid Pro (Jimi/Concox) API and mock data
 */

import { apiClient } from '@/lib/api/client';
import { dashcamApi } from '@/features/dashcam/api/dashcamApi';

// Check if Traksolid credentials are configured
const hasTraksolidCredentials = () => {
  return !!(
    import.meta.env.VITE_TRAKSOLID_ACCOUNT &&
    import.meta.env.VITE_TRAKSOLID_PASSWORD &&
    import.meta.env.VITE_TRAKSOLID_APP_KEY &&
    import.meta.env.VITE_TRAKSOLID_APP_SECRET
  );
};

// Test Traksolid API connection
export async function testTraksolidConnection(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  if (!hasTraksolidCredentials()) {
    return {
      success: false,
      message: 'Traksolid credentials not configured',
    };
  }
  
  try {
    const authResult = await dashcamApi.authenticate();
    if (authResult.success) {
      // Try to fetch devices
      const devices = await dashcamApi.getDevices();
      return {
        success: true,
        message: `Connected successfully! Found ${devices.length} device(s)`,
        details: {
          deviceCount: devices.length,
          apiUrl: import.meta.env.VITE_TRAKSOLID_API_URL || 'https://api.jimilink.com',
        },
      };
    }
    return {
      success: false,
      message: authResult.error || 'Authentication failed - check credentials',
      details: authResult.details as Record<string, unknown> | undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
      details: { error: String(error) },
    };
  }
}

// Types
export type DeviceStatus = 'online' | 'offline' | 'recording' | 'error';
export type RecordingType = 'continuous' | 'event' | 'manual' | 'alarm';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface DashcamDevice {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  firmware: string;
  status: DeviceStatus;
  isRecording: boolean;
  lastSeen: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
    lastUpdated: string;
  };
  vehicle: {
    id: string;
    plateNumber: string;
    model?: string;
  };
  driver: {
    id: string;
    name: string;
    phone?: string;
  };
  storage: {
    used: number; // GB
    total: number; // GB
    recordingsCount: number;
  };
  health: {
    status: 'healthy' | 'warning' | 'error';
    batteryLevel?: number; // percentage
    temperature?: number; // celsius
    signalStrength?: number; // percentage
    issues: string[];
  };
  settings: {
    resolution: '720p' | '1080p' | '1440p' | '4K';
    frameRate: 30 | 60;
    recordingMode: 'continuous' | 'event' | 'both';
    audioEnabled: boolean;
    gpsEnabled: boolean;
    nightVision: boolean;
    motionDetection: boolean;
    parkingMode: boolean;
  };
  alerts: {
    id: string;
    type: string;
    severity: AlertSeverity;
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[];
}

export interface Recording {
  id: string;
  deviceId: string;
  deviceName: string;
  type: RecordingType;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  size: number; // MB
  thumbnailUrl?: string;
  downloadUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  triggeredBy?: string;
  tags: string[];
  locked: boolean;
}

export interface AlertConfig {
  id: string;
  deviceId?: string;
  type: 'offline' | 'storage_low' | 'health_issue' | 'geofence' | 'impact' | 'tampering';
  enabled: boolean;
  threshold?: number;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
  recipients: string[];
}

export interface DeviceStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  recordingDevices: number;
  devicesWithErrors: number;
  totalStorageUsed: number;
  totalStorageCapacity: number;
  recordingsToday: number;
  incidentsThisWeek: number;
}

// API Endpoints
const DASHCAM_ENDPOINTS = {
  // Devices
  getDevices: '/api/dashcam/devices',
  getDevice: (id: string) => `/api/dashcam/devices/${id}`,
  updateDevice: (id: string) => `/api/dashcam/devices/${id}`,
  updateDeviceSettings: (id: string) => `/api/dashcam/devices/${id}/settings`,
  getDeviceHealth: (id: string) => `/api/dashcam/devices/${id}/health`,
  getDeviceLocations: '/api/dashcam/devices/locations',
  
  // Recordings
  getRecordings: '/api/dashcam/recordings',
  getRecording: (id: string) => `/api/dashcam/recordings/${id}`,
  downloadRecording: (id: string) => `/api/dashcam/recordings/${id}/download`,
  deleteRecording: (id: string) => `/api/dashcam/recordings/${id}`,
  lockRecording: (id: string) => `/api/dashcam/recordings/${id}/lock`,
  unlockRecording: (id: string) => `/api/dashcam/recordings/${id}/unlock`,
  
  // Live View
  requestLiveStream: (id: string) => `/api/dashcam/devices/${id}/live`,
  stopLiveStream: (id: string) => `/api/dashcam/devices/${id}/live/stop`,
  
  // Alerts
  getAlerts: '/api/dashcam/alerts',
  acknowledgeAlert: (id: string) => `/api/dashcam/alerts/${id}/acknowledge`,
  getAlertConfigs: '/api/dashcam/alerts/config',
  updateAlertConfig: (id: string) => `/api/dashcam/alerts/config/${id}`,
  
  // Stats
  getStats: '/api/dashcam/stats',
};

// Mock data for development
const mockDevices: DashcamDevice[] = [
  {
    id: 'DC-001',
    name: 'Front Dashcam 01',
    serialNumber: 'TRK-7843291',
    model: 'Jimi JC400',
    firmware: 'v2.4.1',
    status: 'online',
    isRecording: true,
    lastSeen: new Date().toISOString(),
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: 'Makati City, Metro Manila',
      lastUpdated: new Date().toISOString(),
    },
    vehicle: {
      id: 'V-001',
      plateNumber: 'ABC-1234',
      model: 'Toyota Hiace',
    },
    driver: {
      id: 'D-001',
      name: 'Juan Santos',
      phone: '+63 912 345 6789',
    },
    storage: {
      used: 45.2,
      total: 128,
      recordingsCount: 156,
    },
    health: {
      status: 'healthy',
      batteryLevel: 85,
      temperature: 42,
      signalStrength: 92,
      issues: [],
    },
    settings: {
      resolution: '1080p',
      frameRate: 30,
      recordingMode: 'continuous',
      audioEnabled: true,
      gpsEnabled: true,
      nightVision: true,
      motionDetection: true,
      parkingMode: false,
    },
    alerts: [],
  },
  {
    id: 'DC-002',
    name: 'Front Dashcam 02',
    serialNumber: 'TRK-7843292',
    model: 'Jimi JC400',
    firmware: 'v2.4.1',
    status: 'online',
    isRecording: true,
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
    location: {
      lat: 14.5547,
      lng: 121.0244,
      address: 'Pasig City, Metro Manila',
      lastUpdated: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    vehicle: {
      id: 'V-002',
      plateNumber: 'XYZ-5678',
      model: 'Nissan Urvan',
    },
    driver: {
      id: 'D-002',
      name: 'Maria Cruz',
      phone: '+63 923 456 7890',
    },
    storage: {
      used: 89.5,
      total: 128,
      recordingsCount: 312,
    },
    health: {
      status: 'warning',
      batteryLevel: 45,
      temperature: 48,
      signalStrength: 78,
      issues: ['Storage almost full', 'Battery level low'],
    },
    settings: {
      resolution: '1080p',
      frameRate: 30,
      recordingMode: 'both',
      audioEnabled: true,
      gpsEnabled: true,
      nightVision: true,
      motionDetection: true,
      parkingMode: true,
    },
    alerts: [
      {
        id: 'ALT-001',
        type: 'storage_low',
        severity: 'warning',
        message: 'Storage capacity below 30%',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        acknowledged: false,
      },
    ],
  },
  {
    id: 'DC-003',
    name: 'Front Dashcam 03',
    serialNumber: 'TRK-7843293',
    model: 'Jimi JC400P',
    firmware: 'v2.3.8',
    status: 'offline',
    isRecording: false,
    lastSeen: new Date(Date.now() - 24 * 3600000).toISOString(),
    location: {
      lat: 14.6760,
      lng: 121.0437,
      address: 'Quezon City, Metro Manila',
      lastUpdated: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    vehicle: {
      id: 'V-003',
      plateNumber: 'DEF-9012',
      model: 'Hyundai Starex',
    },
    driver: {
      id: 'D-003',
      name: 'Pedro Reyes',
      phone: '+63 934 567 8901',
    },
    storage: {
      used: 67.3,
      total: 128,
      recordingsCount: 203,
    },
    health: {
      status: 'error',
      batteryLevel: 0,
      temperature: 35,
      signalStrength: 0,
      issues: ['Device offline for 24 hours', 'No signal detected'],
    },
    settings: {
      resolution: '720p',
      frameRate: 30,
      recordingMode: 'continuous',
      audioEnabled: false,
      gpsEnabled: true,
      nightVision: true,
      motionDetection: false,
      parkingMode: false,
    },
    alerts: [
      {
        id: 'ALT-002',
        type: 'offline',
        severity: 'critical',
        message: 'Device has been offline for 24 hours',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        acknowledged: false,
      },
    ],
  },
  {
    id: 'DC-004',
    name: 'Front Dashcam 04',
    serialNumber: 'TRK-7843294',
    model: 'Jimi JC400',
    firmware: 'v2.4.1',
    status: 'online',
    isRecording: false,
    lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
    location: {
      lat: 14.5176,
      lng: 121.0509,
      address: 'Taguig City, Metro Manila',
      lastUpdated: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    vehicle: {
      id: 'V-004',
      plateNumber: 'GHI-3456',
      model: 'Toyota Commuter',
    },
    driver: {
      id: 'D-004',
      name: 'Ana Lopez',
      phone: '+63 945 678 9012',
    },
    storage: {
      used: 23.1,
      total: 128,
      recordingsCount: 89,
    },
    health: {
      status: 'healthy',
      batteryLevel: 92,
      temperature: 38,
      signalStrength: 95,
      issues: [],
    },
    settings: {
      resolution: '1440p',
      frameRate: 60,
      recordingMode: 'both',
      audioEnabled: true,
      gpsEnabled: true,
      nightVision: true,
      motionDetection: true,
      parkingMode: true,
    },
    alerts: [],
  },
  {
    id: 'DC-005',
    name: 'Front Dashcam 05',
    serialNumber: 'TRK-7843295',
    model: 'Jimi JC400P',
    firmware: 'v2.4.0',
    status: 'error',
    isRecording: false,
    lastSeen: new Date(Date.now() - 2 * 3600000).toISOString(),
    location: {
      lat: 14.4081,
      lng: 121.0415,
      address: 'Muntinlupa City, Metro Manila',
      lastUpdated: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    vehicle: {
      id: 'V-005',
      plateNumber: 'JKL-7890',
      model: 'Ford Transit',
    },
    driver: {
      id: 'D-005',
      name: 'Carlos Mendoza',
      phone: '+63 956 789 0123',
    },
    storage: {
      used: 112.8,
      total: 128,
      recordingsCount: 445,
    },
    health: {
      status: 'error',
      batteryLevel: 15,
      temperature: 65,
      signalStrength: 45,
      issues: ['Storage full - recording stopped', 'High temperature warning', 'Firmware update available'],
    },
    settings: {
      resolution: '1080p',
      frameRate: 30,
      recordingMode: 'continuous',
      audioEnabled: true,
      gpsEnabled: true,
      nightVision: true,
      motionDetection: true,
      parkingMode: false,
    },
    alerts: [
      {
        id: 'ALT-003',
        type: 'storage_low',
        severity: 'critical',
        message: 'Storage full - recording stopped',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        acknowledged: true,
      },
      {
        id: 'ALT-004',
        type: 'health_issue',
        severity: 'warning',
        message: 'High temperature detected (65°C)',
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        acknowledged: false,
      },
    ],
  },
];

const mockRecordings: Recording[] = [
  {
    id: 'REC-001',
    deviceId: 'DC-001',
    deviceName: 'Front Dashcam 01',
    type: 'continuous',
    startTime: new Date(Date.now() - 2 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    duration: 1800,
    size: 450,
    thumbnailUrl: '/api/placeholder/320/180',
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: 'Makati Ave, Makati City',
    },
    tags: ['routine'],
    locked: false,
  },
  {
    id: 'REC-002',
    deviceId: 'DC-001',
    deviceName: 'Front Dashcam 01',
    type: 'event',
    startTime: new Date(Date.now() - 5 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 4.95 * 3600000).toISOString(),
    duration: 180,
    size: 85,
    thumbnailUrl: '/api/placeholder/320/180',
    location: {
      lat: 14.5547,
      lng: 121.0244,
      address: 'EDSA, Ortigas Center',
    },
    triggeredBy: 'Hard braking detected',
    tags: ['incident', 'hard-braking'],
    locked: true,
  },
  {
    id: 'REC-003',
    deviceId: 'DC-002',
    deviceName: 'Front Dashcam 02',
    type: 'alarm',
    startTime: new Date(Date.now() - 8 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 7.5 * 3600000).toISOString(),
    duration: 300,
    size: 120,
    thumbnailUrl: '/api/placeholder/320/180',
    location: {
      lat: 14.6760,
      lng: 121.0437,
      address: 'Commonwealth Ave, Quezon City',
    },
    triggeredBy: 'Impact detected',
    tags: ['incident', 'impact', 'urgent'],
    locked: true,
  },
  {
    id: 'REC-004',
    deviceId: 'DC-002',
    deviceName: 'Front Dashcam 02',
    type: 'manual',
    startTime: new Date(Date.now() - 12 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 11.9 * 3600000).toISOString(),
    duration: 60,
    size: 25,
    thumbnailUrl: '/api/placeholder/320/180',
    location: {
      lat: 14.5176,
      lng: 121.0509,
      address: 'C5 Road, Taguig City',
    },
    triggeredBy: 'Driver manual trigger',
    tags: ['manual'],
    locked: false,
  },
  {
    id: 'REC-005',
    deviceId: 'DC-004',
    deviceName: 'Front Dashcam 04',
    type: 'continuous',
    startTime: new Date(Date.now() - 24 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 23 * 3600000).toISOString(),
    duration: 3600,
    size: 900,
    thumbnailUrl: '/api/placeholder/320/180',
    location: {
      lat: 14.4081,
      lng: 121.0415,
      address: 'Alabang-Zapote Road, Muntinlupa',
    },
    tags: ['routine'],
    locked: false,
  },
];

const mockAlertConfigs: AlertConfig[] = [
  {
    id: 'CFG-001',
    type: 'offline',
    enabled: true,
    threshold: 30, // minutes
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    recipients: ['admin@xpressops.com'],
  },
  {
    id: 'CFG-002',
    type: 'storage_low',
    enabled: true,
    threshold: 20, // percentage
    notifyEmail: true,
    notifyPush: true,
    notifySms: true,
    recipients: ['admin@xpressops.com', 'fleet@xpressops.com'],
  },
  {
    id: 'CFG-003',
    type: 'health_issue',
    enabled: true,
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    recipients: ['support@xpressops.com'],
  },
];

// Service functions
export const dashcamService = {
  // Devices
  async getDevices(): Promise<DashcamDevice[]> {
    // Use Traksolid API if credentials are configured
    if (hasTraksolidCredentials()) {
      try {
        const authResult = await dashcamApi.authenticate();
        if (authResult.success) {
          const apiDevices = await dashcamApi.getDevices();
          // Map Traksolid device format to our DashcamDevice format
          return apiDevices.map((device) => ({
            id: device.id || device.imei,
            name: `Dashcam ${device.serialNumber || device.imei}`,
            serialNumber: device.serialNumber || device.imei,
            model: device.firmware?.split(' ')[0] || 'Jimi JC400',
            firmware: device.firmware || 'Unknown',
            status: device.status === 'active' ? 'online' : 
                    device.status === 'offline' ? 'offline' : 'error',
            isRecording: device.status === 'active',
            lastSeen: device.lastSeen || new Date().toISOString(),
            location: {
              lat: 0, // Will be populated by getDeviceTrack if needed
              lng: 0,
              address: 'Unknown',
              lastUpdated: device.lastSeen || new Date().toISOString(),
            },
            vehicle: {
              id: `V-${device.imei}`,
              plateNumber: device.vehicle.plateNumber,
              model: 'Unknown',
            },
            driver: {
              id: `D-${device.imei}`,
              name: device.driver.name,
            },
            storage: {
              used: device.storageUsed || 0,
              total: device.storageCapacity || 128,
              recordingsCount: 0,
            },
            health: {
              status: device.status === 'active' ? 'healthy' : 
                      device.status === 'offline' ? 'warning' : 'error',
              batteryLevel: device.batteryLevel,
              signalStrength: device.signalStrength,
              issues: [],
            },
            settings: {
              resolution: '1080p',
              frameRate: 30,
              recordingMode: 'continuous',
              audioEnabled: true,
              gpsEnabled: true,
              nightVision: true,
              motionDetection: true,
              parkingMode: false,
            },
            alerts: [],
          }));
        }
      } catch (error) {
        console.warn('[Dashcam] Traksolid API failed, using mock data:', error);
      }
    }
    
    // Fallback to mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDevices), 500);
    });
  },

  async getDevice(id: string): Promise<DashcamDevice | null> {
    // return apiClient.get<DashcamDevice>(DASHCAM_ENDPOINTS.getDevice(id));
    return new Promise((resolve) => {
      setTimeout(() => {
        const device = mockDevices.find((d) => d.id === id);
        resolve(device || null);
      }, 300);
    });
  },

  async updateDeviceSettings(
    id: string,
    settings: Partial<DashcamDevice['settings']>
  ): Promise<void> {
    // return apiClient.patch(DASHCAM_ENDPOINTS.updateDeviceSettings(id), settings);
    return new Promise((resolve) => {
      setTimeout(() => {
        const device = mockDevices.find((d) => d.id === id);
        if (device) {
          Object.assign(device.settings, settings);
        }
        resolve();
      }, 300);
    });
  },

  async getDeviceLocations(): Promise<Array<{ id: string; lat: number; lng: number; status: DeviceStatus }>> {
    // return apiClient.get(DASHCAM_ENDPOINTS.getDeviceLocations);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          mockDevices.map((d) => ({
            id: d.id,
            lat: d.location.lat,
            lng: d.location.lng,
            status: d.status,
          }))
        );
      }, 300);
    });
  },

  // Recordings
  async getRecordings(params?: {
    deviceId?: string;
    type?: RecordingType;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Recording[]> {
    // Use Traksolid API if credentials are configured
    if (hasTraksolidCredentials()) {
      try {
        const authResult = await dashcamApi.authenticate();
        if (authResult.success) {
          // Extract IMEI from deviceId if provided
          const imei = params?.deviceId?.replace('DC-', '');
          const apiRecordings = await dashcamApi.getRecordings(imei);
          
          // Map Traksolid recording format to our Recording format
          let recordings = apiRecordings.map((rec) => ({
            id: rec.id,
            deviceId: params?.deviceId || 'unknown',
            deviceName: rec.driver.name,
            type: (rec.type === 'incident' ? 'event' : 'continuous') as RecordingType,
            startTime: rec.timestamp,
            endTime: new Date(new Date(rec.timestamp).getTime() + rec.duration * 1000).toISOString(),
            duration: rec.duration,
            size: rec.size,
            thumbnailUrl: '/api/placeholder/320/180',
            downloadUrl: rec.fileUrl,
            location: rec.location ? {
              lat: rec.location.lat,
              lng: rec.location.lng,
              address: rec.location.address,
            } : undefined,
            triggeredBy: rec.incident ? `Incident ${rec.incident.id}` : undefined,
            tags: rec.type === 'incident' ? ['incident'] : ['routine'],
            locked: false,
          }));
          
          // Apply type filter
          if (params?.type) {
            recordings = recordings.filter((r) => r.type === params.type);
          }
          
          // Apply date filters
          if (params?.dateFrom) {
            recordings = recordings.filter((r) => r.startTime >= params.dateFrom!);
          }
          if (params?.dateTo) {
            recordings = recordings.filter((r) => r.endTime <= params.dateTo!);
          }
          
          return recordings;
        }
      } catch (error) {
        console.warn('[Dashcam] Traksolid recordings API failed, using mock data:', error);
      }
    }
    
    // Fallback to mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockRecordings];
        if (params?.deviceId) {
          filtered = filtered.filter((r) => r.deviceId === params.deviceId);
        }
        if (params?.type) {
          filtered = filtered.filter((r) => r.type === params.type);
        }
        if (params?.dateFrom) {
          filtered = filtered.filter((r) => r.startTime >= params.dateFrom!);
        }
        if (params?.dateTo) {
          filtered = filtered.filter((r) => r.endTime <= params.dateTo!);
        }
        resolve(filtered);
      }, 500);
    });
  },

  async downloadRecording(id: string): Promise<void> {
    // const blob = await apiClient.get<Blob>(DASHCAM_ENDPOINTS.downloadRecording(id));
    // // Handle download
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     // Downloading recording
    //     resolve();
    //   }, 1000);
    // });
    console.log(`Downloading recording ${id}`);
  },

  async lockRecording(id: string): Promise<void> {
    // return apiClient.post(DASHCAM_ENDPOINTS.lockRecording(id));
    return new Promise((resolve) => {
      setTimeout(() => {
        const rec = mockRecordings.find((r) => r.id === id);
        if (rec) rec.locked = true;
        resolve();
      }, 300);
    });
  },

  async unlockRecording(id: string): Promise<void> {
    // return apiClient.post(DASHCAM_ENDPOINTS.unlockRecording(id));
    return new Promise((resolve) => {
      setTimeout(() => {
        const rec = mockRecordings.find((r) => r.id === id);
        if (rec) rec.locked = false;
        resolve();
      }, 300);
    });
  },

  // Live View
  async requestLiveStream(deviceId: string): Promise<string | null> {
    // return apiClient.post<{ url: string }>(DASHCAM_ENDPOINTS.requestLiveStream(deviceId));
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock stream URL
        resolve(`wss://stream.xpressops.com/live/${deviceId}`);
      }, 800);
    });
  },

  async stopLiveStream(deviceId: string): Promise<void> {
    // return apiClient.post(DASHCAM_ENDPOINTS.stopLiveStream(deviceId));
    return new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  },

  // Alert Configs
  async getAlertConfigs(): Promise<AlertConfig[]> {
    // return apiClient.get<AlertConfig[]>(DASHCAM_ENDPOINTS.getAlertConfigs);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAlertConfigs), 300);
    });
  },

  async updateAlertConfig(id: string, config: Partial<AlertConfig>): Promise<void> {
    // return apiClient.patch(DASHCAM_ENDPOINTS.updateAlertConfig(id), config);
    return new Promise((resolve) => {
      setTimeout(() => {
        const cfg = mockAlertConfigs.find((c) => c.id === id);
        if (cfg) {
          Object.assign(cfg, config);
        }
        resolve();
      }, 300);
    });
  },

  // Stats
  async getStats(): Promise<DeviceStats> {
    // Use Traksolid API if credentials are configured
    if (hasTraksolidCredentials()) {
      try {
        const stats = await dashcamApi.getStats();
        return {
          totalDevices: stats.totalDevices,
          onlineDevices: stats.activeDevices,
          offlineDevices: stats.offlineDevices,
          recordingDevices: stats.activeDevices, // Assume active devices are recording
          devicesWithErrors: stats.totalDevices - stats.activeDevices - stats.offlineDevices,
          totalStorageUsed: stats.usedStorage,
          totalStorageCapacity: stats.totalStorage,
          recordingsToday: stats.totalRecordings,
          incidentsThisWeek: stats.incidentRecordings,
        };
      } catch (error) {
        console.warn('[Dashcam] Traksolid stats API failed, using mock data:', error);
      }
    }
    
    // Fallback to mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalDevices: mockDevices.length,
          onlineDevices: mockDevices.filter((d) => d.status === 'online').length,
          offlineDevices: mockDevices.filter((d) => d.status === 'offline').length,
          recordingDevices: mockDevices.filter((d) => d.isRecording).length,
          devicesWithErrors: mockDevices.filter((d) => d.health.status === 'error').length,
          totalStorageUsed: mockDevices.reduce((sum, d) => sum + d.storage.used, 0),
          totalStorageCapacity: mockDevices.reduce((sum, d) => sum + d.storage.total, 0),
          recordingsToday: 23,
          incidentsThisWeek: 4,
        });
      }, 300);
    });
  },
};

export default dashcamService;
