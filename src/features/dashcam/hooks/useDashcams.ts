/**
 * Dashcam Hook
 * Manages dashcam devices, recordings, and related state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { dashcamService, type DashcamDevice, type Recording, type DeviceStatus, type RecordingType } from '@/services/dashcam/dashcam.service';

export interface DashcamFilters {
  status: DeviceStatus | 'all';
  search: string;
  vehicleId?: string;
  driverId?: string;
}

export interface RecordingFilters {
  type: RecordingType | 'all';
  deviceId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UseDashcamsReturn {
  // Data
  devices: DashcamDevice[];
  recordings: Recording[];
  selectedDevice: DashcamDevice | null;
  selectedRecording: Recording | null;
  
  // Filters
  deviceFilters: DashcamFilters;
  recordingFilters: RecordingFilters;
  setDeviceFilters: (filters: Partial<DashcamFilters>) => void;
  setRecordingFilters: (filters: Partial<RecordingFilters>) => void;
  
  // Selection
  selectDevice: (device: DashcamDevice | null) => void;
  selectRecording: (recording: Recording | null) => void;
  
  // Actions
  refreshDevices: () => Promise<void>;
  refreshRecordings: () => Promise<void>;
  downloadRecording: (recordingId: string) => Promise<void>;
  updateDeviceSettings: (deviceId: string, settings: Partial<DashcamDevice['settings']>) => Promise<void>;
  requestLiveView: (deviceId: string) => Promise<string | null>;
  
  // Stats
  stats: {
    total: number;
    online: number;
    offline: number;
    recording: number;
    error: number;
    storageUsed: number;
    storageTotal: number;
  };
  
  // Status
  isLoading: boolean;
  isLoadingRecordings: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useDashcams(): UseDashcamsReturn {
  // Data state
  const [devices, setDevices] = useState<DashcamDevice[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DashcamDevice | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  
  // Filter state
  const [deviceFilters, setDeviceFilterState] = useState<DashcamFilters>({
    status: 'all',
    search: '',
  });
  
  const [recordingFilters, setRecordingFilterState] = useState<RecordingFilters>({
    type: 'all',
  });
  
  // Status state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch devices
  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashcamService.getDevices();
      setDevices(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
      console.error('Failed to fetch dashcam devices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch recordings
  const refreshRecordings = useCallback(async () => {
    setIsLoadingRecordings(true);
    try {
      const data = await dashcamService.getRecordings({
        deviceId: recordingFilters.deviceId,
        type: recordingFilters.type === 'all' ? undefined : recordingFilters.type,
        dateFrom: recordingFilters.dateFrom,
        dateTo: recordingFilters.dateTo,
      });
      setRecordings(data);
    } catch (err) {
      console.error('Failed to fetch recordings:', err);
    } finally {
      setIsLoadingRecordings(false);
    }
  }, [recordingFilters.deviceId, recordingFilters.type, recordingFilters.dateFrom, recordingFilters.dateTo]);

  // Initial load
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Load recordings when filters change
  useEffect(() => {
    refreshRecordings();
  }, [refreshRecordings]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (deviceFilters.status !== 'all' && device.status !== deviceFilters.status) {
        return false;
      }
      if (deviceFilters.search) {
        const search = deviceFilters.search.toLowerCase();
        const matchName = device.name.toLowerCase().includes(search);
        const matchVehicle = device.vehicle.plateNumber.toLowerCase().includes(search);
        const matchDriver = device.driver.name.toLowerCase().includes(search);
        const matchId = device.id.toLowerCase().includes(search);
        if (!matchName && !matchVehicle && !matchDriver && !matchId) {
          return false;
        }
      }
      if (deviceFilters.vehicleId && device.vehicle.id !== deviceFilters.vehicleId) {
        return false;
      }
      if (deviceFilters.driverId && device.driver.id !== deviceFilters.driverId) {
        return false;
      }
      return true;
    });
  }, [devices, deviceFilters]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === 'online').length;
    const offline = devices.filter((d) => d.status === 'offline').length;
    const recording = devices.filter((d) => d.isRecording).length;
    const error = devices.filter((d) => d.health.status === 'error').length;
    const storageUsed = devices.reduce((sum, d) => sum + d.storage.used, 0);
    const storageTotal = devices.reduce((sum, d) => sum + d.storage.total, 0);
    
    return {
      total,
      online,
      offline,
      recording,
      error,
      storageUsed,
      storageTotal,
    };
  }, [devices]);

  // Actions
  const setDeviceFilters = useCallback((filters: Partial<DashcamFilters>) => {
    setDeviceFilterState((prev) => ({ ...prev, ...filters }));
  }, []);

  const setRecordingFilters = useCallback((filters: Partial<RecordingFilters>) => {
    setRecordingFilterState((prev) => ({ ...prev, ...filters }));
  }, []);

  const selectDevice = useCallback((device: DashcamDevice | null) => {
    setSelectedDevice(device);
  }, []);

  const selectRecording = useCallback((recording: Recording | null) => {
    setSelectedRecording(recording);
  }, []);

  const downloadRecording = useCallback(async (recordingId: string) => {
    try {
      await dashcamService.downloadRecording(recordingId);
    } catch (err) {
      console.error('Failed to download recording:', err);
      throw err;
    }
  }, []);

  const updateDeviceSettings = useCallback(async (deviceId: string, settings: Partial<DashcamDevice['settings']>) => {
    try {
      await dashcamService.updateDeviceSettings(deviceId, settings);
      // Refresh devices to get updated settings
      await refreshDevices();
    } catch (err) {
      console.error('Failed to update device settings:', err);
      throw err;
    }
  }, [refreshDevices]);

  const requestLiveView = useCallback(async (deviceId: string) => {
    try {
      return await dashcamService.requestLiveStream(deviceId);
    } catch (err) {
      console.error('Failed to request live view:', err);
      return null;
    }
  }, []);

  return {
    // Data
    devices: filteredDevices,
    recordings,
    selectedDevice,
    selectedRecording,
    
    // Filters
    deviceFilters,
    recordingFilters,
    setDeviceFilters,
    setRecordingFilters,
    
    // Selection
    selectDevice,
    selectRecording,
    
    // Actions
    refreshDevices,
    refreshRecordings,
    downloadRecording,
    updateDeviceSettings,
    requestLiveView,
    
    // Stats
    stats,
    
    // Status
    isLoading,
    isLoadingRecordings,
    error,
    lastUpdated,
  };
}

export default useDashcams;
