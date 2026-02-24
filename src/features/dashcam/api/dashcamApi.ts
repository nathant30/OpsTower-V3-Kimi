/**
 * Traksolid Pro (Jimi/Concox) API Service
 * Integration with Traksolid Pro GPS/IoT platform
 * API Docs: https://tracksolidprodocs.jimicloud.com/
 */

import axios, { type AxiosInstance } from 'axios';
import CryptoJS from 'crypto-js';

// Traksolid Pro API Configuration
// Use Vite proxy in development to avoid CORS issues
const isDev = import.meta.env.DEV;
const TRAKSOLID_BASE_URL = import.meta.env.VITE_TRAKSOLID_API_URL || 'https://api.jimilink.com';

const TRAKSOLID_CONFIG = {
  // In dev, use empty baseURL (proxy handles it); in production, use the actual API URL
  baseURL: isDev ? '' : TRAKSOLID_BASE_URL,
  account: import.meta.env.VITE_TRAKSOLID_ACCOUNT || '',
  password: import.meta.env.VITE_TRAKSOLID_PASSWORD || '',
  appKey: import.meta.env.VITE_TRAKSOLID_APP_KEY || '',
  appSecret: import.meta.env.VITE_TRAKSOLID_APP_SECRET || '',
};

// Debug logging only in development
const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log('[Dashcam API]', ...args);
  }
};

// Types
export interface DashcamDevice {
  id: string;
  serialNumber: string;
  imei: string;
  status: 'active' | 'offline' | 'maintenance';
  driver: { name: string };
  vehicle: { plateNumber: string };
  lastSeen: string;
  storageUsed: number;
  storageCapacity: number;
  firmware: string;
  batteryLevel?: number;
  signalStrength?: number;
}

export interface Recording {
  id: string;
  type: 'incident' | 'emergency' | 'routine';
  driver: { name: string };
  location?: { address: string; lat: number; lng: number };
  timestamp: string;
  duration: number;
  size: number;
  incident?: { id: string };
  fileUrl?: string;
}

export interface DashcamStats {
  totalDevices: number;
  activeDevices: number;
  offlineDevices: number;
  totalRecordings: number;
  incidentRecordings: number;
  usedStorage: number;
  totalStorage: number;
}

// Generate API signature for Jimi API
// Algorithm: md5(appSecret + sortedParams + appSecret), uppercase
function generateSignature(params: Record<string, string>, appSecret: string): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort();
  
  // Concatenate key=value pairs (no separators, sorted by key)
  let paramString = '';
  for (const key of sortedKeys) {
    paramString += `${key}${params[key]}`;
  }
  
  // Add appSecret at beginning and end, then MD5 hash
  const signStr = appSecret + paramString + appSecret;
  debugLog('Sign string:', signStr);
  return CryptoJS.MD5(signStr).toString().toUpperCase();
}

// Get current UTC timestamp in format: yyyy-MM-dd HH:mm:ss
function getUTCTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Traksolid Pro API Client
 */
class TraksolidApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: TRAKSOLID_CONFIG.baseURL || undefined,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[Dashcam API] Error:', error.response?.status, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with Traksolid Pro API
   * Uses POST with x-www-form-urlencoded (matching Postman)
   */
  async authenticate(): Promise<{ success: boolean; error?: string; details?: unknown }> {
    try {
      const timestamp = getUTCTimestamp();
      const passwordHash = CryptoJS.MD5(TRAKSOLID_CONFIG.password).toString();
      
      // Jimi API uses snake_case for params (app_key, not appKey)
      const params: Record<string, string> = {
        method: 'jimi.oauth.token.get',
        timestamp: timestamp,
        app_key: TRAKSOLID_CONFIG.appKey,
        sign_method: 'md5',
        v: '1.0',
        format: 'json',
        // Private parameters for auth
        account: TRAKSOLID_CONFIG.account,
        password: passwordHash,
      };

      const sign = generateSignature(params, TRAKSOLID_CONFIG.appSecret);
      params.sign = sign;
      
      debugLog('Auth request params:', params);

      // Use POST with x-www-form-urlencoded (matching Postman)
      // In dev, use the proxy path; in prod, use direct API path
      const apiPath = isDev ? '/traksolid-proxy' : '/route/rest';
      
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await this.client.post(apiPath, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      debugLog('Auth response:', response.data);
      console.log('[Dashcam API] Full response:', JSON.stringify(response.data, null, 2));

      // Jimi API returns result.accessToken on success
      if (response.data.code === 0 && response.data.result?.accessToken) {
        this.token = response.data.result.accessToken;
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.data.message || `Auth failed (code: ${response.data.code})`,
        details: response.data 
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = (error as { response?: { data?: unknown; status?: number } })?.response;
      debugLog('Auth error:', errorMsg, errorDetails);
      return { 
        success: false, 
        error: errorMsg,
        details: errorDetails 
      };
    }
  }

  /**
   * Get device list
   */
  async getDevices(): Promise<DashcamDevice[]> {
    try {
      const timestamp = getUTCTimestamp();
      
      // Use snake_case for Jimi API (matching auth)
      const params: Record<string, string> = {
        method: 'jimi.user.device.list',
        timestamp: timestamp,
        app_key: TRAKSOLID_CONFIG.appKey,
        sign_method: 'md5',
        v: '1.0',
        format: 'json',
        access_token: this.token || '',
      };

      const sign = generateSignature(params, TRAKSOLID_CONFIG.appSecret);
      params.sign = sign;

      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await this.client.get(`/traksolid-proxy?${queryString}`);

      if (response.data.code === 0) {
        return (response.data.data || []).map((device: unknown) => ({
          id: (device as { id?: string; imei?: string }).id || (device as { imei: string }).imei,
          serialNumber: (device as { imei: string }).imei,
          imei: (device as { imei: string }).imei,
          status: (device as { online?: boolean }).online ? 'active' : 'offline',
          driver: { name: (device as { driverName?: string }).driverName || 'Unknown' },
          vehicle: { plateNumber: (device as { plateNumber?: string }).plateNumber || 'Unknown' },
          lastSeen: (device as { gpsTime?: string }).gpsTime || new Date().toISOString(),
          storageUsed: (device as { storageUsed?: number }).storageUsed || 0,
          storageCapacity: (device as { storageCapacity?: number }).storageCapacity || 128,
          firmware: (device as { firmware?: string }).firmware || 'Unknown',
          batteryLevel: (device as { battery?: number }).battery,
          signalStrength: (device as { signal?: number }).signal,
        }));
      }
      throw new Error('Failed to fetch devices');
    } catch (error) {
      debugLog('Failed to fetch devices:', error);
      throw error;
    }
  }

  /**
   * Get device location/track
   */
  async getDeviceTrack(imei: string): Promise<unknown> {
    try {
      const timestamp = getUTCTimestamp();
      
      const params: Record<string, string> = {
        method: 'jimi.device.track.list',
        timestamp: timestamp,
        app_key: TRAKSOLID_CONFIG.appKey,
        sign_method: 'md5',
        v: '1.0',
        format: 'json',
        access_token: this.token || '',
        imei: imei,
      };

      const sign = generateSignature(params, TRAKSOLID_CONFIG.appSecret);
      params.sign = sign;

      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await this.client.get(`/traksolid-proxy?${queryString}`);

      return response.data;
    } catch (error) {
      debugLog('Failed to fetch device track:', error);
      throw error;
    }
  }

  /**
   * Get video/photo list from device
   */
  async getRecordings(imei?: string): Promise<Recording[]> {
    try {
      const timestamp = getUTCTimestamp();
      
      const params: Record<string, string> = {
        method: 'jimi.device.media.URL',
        timestamp: timestamp,
        app_key: TRAKSOLID_CONFIG.appKey,
        sign_method: 'md5',
        v: '1.0',
        format: 'json',
        access_token: this.token || '',
      };
      
      if (imei) {
        params.imei = imei;
      }
      
      const sign = generateSignature(params, TRAKSOLID_CONFIG.appSecret);
      params.sign = sign;

      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await this.client.get(`/traksolid-proxy?${queryString}`);

      if (response.data.code === 0) {
        return (response.data.data || []).map((media: unknown) => ({
          id: (media as { id?: string; fileName?: string }).id || (media as { fileName: string }).fileName,
          type: (media as { type?: string }).type === 'alarm' ? 'incident' : 'routine',
          driver: { name: (media as { driverName?: string }).driverName || 'Unknown' },
          location: (media as { lat?: number; lng?: number }).lat && (media as { lat: number; lng: number }).lng ? {
            address: (media as { address?: string }).address || 'Unknown',
            lat: (media as { lat: number }).lat,
            lng: (media as { lng: number }).lng,
          } : undefined,
          timestamp: (media as { createTime?: string; gpsTime?: string }).createTime || (media as { gpsTime?: string }).gpsTime,
          duration: (media as { duration?: number }).duration || 0,
          size: (media as { size?: number }).size || 0,
          fileUrl: (media as { url?: string }).url,
        }));
      }
      
      return [];
    } catch (error) {
      debugLog('Failed to fetch recordings:', error);
      return [];
    }
  }

  /**
   * Get device statistics
   */
  async getStats(): Promise<DashcamStats> {
    try {
      const devices = await this.getDevices();
      const recordings = await this.getRecordings();

      const totalStorage = devices.reduce((sum, d) => sum + d.storageCapacity, 0);
      const usedStorage = devices.reduce((sum, d) => sum + d.storageUsed, 0);

      return {
        totalDevices: devices.length,
        activeDevices: devices.filter((d) => d.status === 'active').length,
        offlineDevices: devices.filter((d) => d.status === 'offline').length,
        totalRecordings: recordings.length,
        incidentRecordings: recordings.filter((r) => r.type === 'incident').length,
        usedStorage,
        totalStorage,
      };
    } catch (error) {
      debugLog('Failed to get stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashcamApi = new TraksolidApiClient();
