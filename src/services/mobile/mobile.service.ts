/**
 * Mobile Service
 * Manages mobile app versions, feature flags, push notifications, and app store metrics
 */

import { apiClient } from '@/lib/api/client';
import type {
  AppVersion,
  DeviceBreakdown,
  ActiveUserMetrics,
  CrashReport,
  FeatureFlag,
  PushNotification,
  PushNotificationTemplate,
  AppStoreMetrics,
  AppReview,
  RemoteConfig,
  MobileDashboardData,
  MobileStats,
} from './types';

// API Endpoints
const MOBILE_ENDPOINTS = {
  // Dashboard
  getDashboard: '/api/mobile/dashboard',
  getStats: '/api/mobile/stats',

  // Versions
  getVersions: '/api/mobile/versions',
  getVersion: (id: string) => `/api/mobile/versions/${id}`,
  createVersion: '/api/mobile/versions',
  updateVersion: (id: string) => `/api/mobile/versions/${id}`,
  deleteVersion: (id: string) => `/api/mobile/versions/${id}`,

  // Device Breakdown
  getDeviceBreakdown: '/api/mobile/devices/breakdown',

  // Active Users
  getActiveUserMetrics: '/api/mobile/users/metrics',

  // Crashes
  getCrashes: '/api/mobile/crashes',
  getCrash: (id: string) => `/api/mobile/crashes/${id}`,
  updateCrashStatus: (id: string) => `/api/mobile/crashes/${id}/status`,

  // Feature Flags
  getFeatureFlags: '/api/mobile/feature-flags',
  getFeatureFlag: (id: string) => `/api/mobile/feature-flags/${id}`,
  createFeatureFlag: '/api/mobile/feature-flags',
  updateFeatureFlag: (id: string) => `/api/mobile/feature-flags/${id}`,
  toggleFeatureFlag: (id: string) => `/api/mobile/feature-flags/${id}/toggle`,
  deleteFeatureFlag: (id: string) => `/api/mobile/feature-flags/${id}`,

  // Push Notifications
  getNotifications: '/api/mobile/notifications',
  getNotification: (id: string) => `/api/mobile/notifications/${id}`,
  createNotification: '/api/mobile/notifications',
  sendNotification: (id: string) => `/api/mobile/notifications/${id}/send`,
  cancelNotification: (id: string) => `/api/mobile/notifications/${id}/cancel`,
  getNotificationTemplates: '/api/mobile/notifications/templates',

  // App Store Metrics
  getStoreMetrics: '/api/mobile/store-metrics',
  getReviews: '/api/mobile/reviews',
  respondToReview: (id: string) => `/api/mobile/reviews/${id}/respond`,

  // Remote Config
  getRemoteConfigs: '/api/mobile/remote-configs',
  getRemoteConfig: (id: string) => `/api/mobile/remote-configs/${id}`,
  createRemoteConfig: '/api/mobile/remote-configs',
  updateRemoteConfig: (id: string) => `/api/mobile/remote-configs/${id}`,
  deleteRemoteConfig: (id: string) => `/api/mobile/remote-configs/${id}`,
};

// Mock Data for Development
const mockVersions: AppVersion[] = [
  {
    id: 'v1',
    version: '2.5.0',
    platform: 'ios',
    buildNumber: 250,
    releaseDate: '2025-02-10T00:00:00Z',
    status: 'stable',
    forceUpdate: false,
    minRequiredVersion: '2.0.0',
    releaseNotes: 'Bug fixes and performance improvements',
    downloadUrl: 'https://apps.apple.com/xpress',
    adoptionRate: 78.5,
    activeInstalls: 45230,
  },
  {
    id: 'v2',
    version: '2.5.0',
    platform: 'android',
    buildNumber: 250,
    releaseDate: '2025-02-10T00:00:00Z',
    status: 'stable',
    forceUpdate: false,
    minRequiredVersion: '2.0.0',
    releaseNotes: 'Bug fixes and performance improvements',
    downloadUrl: 'https://play.google.com/xpress',
    adoptionRate: 72.3,
    activeInstalls: 68540,
  },
  {
    id: 'v3',
    version: '2.6.0-beta',
    platform: 'ios',
    buildNumber: 260,
    releaseDate: '2025-02-15T00:00:00Z',
    status: 'beta',
    forceUpdate: false,
    minRequiredVersion: '2.0.0',
    releaseNotes: 'New dashboard UI and dark mode support',
    downloadUrl: 'https://testflight.apple.com/xpress',
    adoptionRate: 5.2,
    activeInstalls: 1200,
  },
  {
    id: 'v4',
    version: '2.4.2',
    platform: 'android',
    buildNumber: 242,
    releaseDate: '2025-01-20T00:00:00Z',
    status: 'deprecated',
    forceUpdate: true,
    minRequiredVersion: '2.4.0',
    releaseNotes: 'Security patch',
    downloadUrl: 'https://play.google.com/xpress',
    adoptionRate: 15.8,
    activeInstalls: 8500,
  },
];

const mockDeviceBreakdown: DeviceBreakdown[] = [
  { platform: 'ios', count: 46430, percentage: 40.4, trend: 'up', changePercentage: 3.2 },
  { platform: 'android', count: 68540, percentage: 59.6, trend: 'stable', changePercentage: 0.5 },
];

const mockActiveUsers: ActiveUserMetrics = {
  dailyActive: 42350,
  weeklyActive: 78920,
  monthlyActive: 114970,
  peakConcurrent: 8500,
  avgSessionDuration: 18.5,
  retentionDay1: 68.5,
  retentionDay7: 42.3,
  retentionDay30: 28.7,
};

const mockCrashes: CrashReport[] = [
  {
    id: 'c1',
    title: 'NullPointerException in PaymentActivity',
    description: 'Crash occurs when processing payment without network',
    platform: 'android',
    version: '2.5.0',
    severity: 'critical',
    status: 'investigating',
    affectedUsers: 245,
    occurrences: 532,
    firstSeen: '2025-02-16T08:00:00Z',
    lastSeen: '2025-02-17T16:30:00Z',
  },
  {
    id: 'c2',
    title: 'Memory warning in MapView',
    description: 'High memory usage when displaying multiple routes',
    platform: 'ios',
    version: '2.5.0',
    severity: 'high',
    status: 'open',
    affectedUsers: 89,
    occurrences: 156,
    firstSeen: '2025-02-15T10:00:00Z',
    lastSeen: '2025-02-17T14:20:00Z',
  },
  {
    id: 'c3',
    title: 'Slow API response handling',
    description: 'UI freeze when API takes longer than 30s',
    platform: 'android',
    version: '2.4.2',
    severity: 'medium',
    status: 'resolved',
    affectedUsers: 45,
    occurrences: 89,
    firstSeen: '2025-02-10T09:00:00Z',
    lastSeen: '2025-02-14T18:00:00Z',
  },
  {
    id: 'c4',
    title: 'Location permission denial crash',
    description: 'App crashes when location permission is denied',
    platform: 'ios',
    version: '2.5.0',
    severity: 'high',
    status: 'investigating',
    affectedUsers: 134,
    occurrences: 298,
    firstSeen: '2025-02-14T12:00:00Z',
    lastSeen: '2025-02-17T15:45:00Z',
  },
];

const mockFeatureFlags: FeatureFlag[] = [
  {
    id: 'f1',
    name: 'New Driver Dashboard',
    key: 'new_driver_dashboard',
    description: 'Enable the new driver dashboard UI',
    enabled: true,
    platform: 'all',
    rolloutPercentage: 100,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-02-10T00:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'f2',
    name: 'Dark Mode',
    key: 'dark_mode',
    description: 'Enable dark mode support',
    enabled: true,
    platform: 'all',
    rolloutPercentage: 100,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-02-15T00:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'f3',
    name: 'In-App Chat',
    key: 'in_app_chat',
    description: 'Enable in-app messaging between drivers and passengers',
    enabled: false,
    platform: 'all',
    rolloutPercentage: 0,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-16T00:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'f4',
    name: 'iOS Widget Support',
    key: 'ios_widgets',
    description: 'Enable iOS home screen widgets',
    enabled: true,
    platform: 'ios',
    rolloutPercentage: 50,
    targetVersion: '2.6.0',
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2025-02-17T00:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'f5',
    name: 'Android Material You',
    key: 'android_material_you',
    description: 'Enable Material You dynamic theming',
    enabled: true,
    platform: 'android',
    rolloutPercentage: 75,
    createdAt: '2025-02-05T00:00:00Z',
    updatedAt: '2025-02-16T00:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
];

const mockNotifications: PushNotification[] = [
  {
    id: 'n1',
    title: 'App Update Available',
    body: 'Version 2.5.0 is now available with new features!',
    targetAudience: 'all',
    sentAt: '2025-02-10T09:00:00Z',
    status: 'sent',
    sentCount: 115000,
    deliveredCount: 112500,
    openedCount: 28500,
    clickThroughRate: 25.3,
    createdBy: 'admin@xpresstaxi.com',
    createdAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'n2',
    title: 'Weekend Bonus',
    body: 'Earn 20% more this weekend! Drive now.',
    targetAudience: 'all',
    scheduledAt: '2025-02-21T18:00:00Z',
    status: 'scheduled',
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickThroughRate: 0,
    createdBy: 'marketing@xpresstaxi.com',
    createdAt: '2025-02-17T10:00:00Z',
  },
  {
    id: 'n3',
    title: 'System Maintenance',
    body: 'Scheduled maintenance tonight from 2-4 AM.',
    targetAudience: 'all',
    sentAt: '2025-02-16T14:00:00Z',
    status: 'sent',
    sentCount: 115000,
    deliveredCount: 110200,
    openedCount: 15400,
    clickThroughRate: 14.0,
    createdBy: 'ops@xpresstaxi.com',
    createdAt: '2025-02-16T12:00:00Z',
  },
];

const mockStoreMetrics: AppStoreMetrics[] = [
  {
    platform: 'ios',
    totalDownloads: 485000,
    monthlyDownloads: 15200,
    dailyDownloads: 520,
    averageRating: 4.7,
    totalRatings: 12500,
    reviewsCount: 3200,
    fiveStarCount: 9250,
    fourStarCount: 2250,
    threeStarCount: 625,
    twoStarCount: 250,
    oneStarCount: 125,
    trend: 'up',
  },
  {
    platform: 'android',
    totalDownloads: 895000,
    monthlyDownloads: 28500,
    dailyDownloads: 980,
    averageRating: 4.5,
    totalRatings: 28600,
    reviewsCount: 8500,
    fiveStarCount: 18500,
    fourStarCount: 5720,
    threeStarCount: 2580,
    twoStarCount: 1144,
    oneStarCount: 656,
    trend: 'stable',
  },
];

const mockRemoteConfigs: RemoteConfig[] = [
  {
    id: 'rc1',
    key: 'max_search_radius',
    value: 10,
    type: 'number',
    description: 'Maximum search radius for nearby drivers (in km)',
    platform: 'all',
    environment: 'production',
    lastModified: '2025-02-15T10:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'rc2',
    key: 'eta_calculation_mode',
    value: 'ml_enhanced',
    type: 'string',
    description: 'ETA calculation algorithm mode',
    platform: 'all',
    environment: 'production',
    lastModified: '2025-02-10T14:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'rc3',
    key: 'enable_surge_pricing',
    value: true,
    type: 'boolean',
    description: 'Enable dynamic surge pricing',
    platform: 'all',
    environment: 'production',
    lastModified: '2025-01-20T09:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'rc4',
    key: 'ios_min_version',
    value: '14.0',
    type: 'string',
    description: 'Minimum iOS version required',
    platform: 'ios',
    environment: 'production',
    lastModified: '2025-01-15T11:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
  {
    id: 'rc5',
    key: 'android_min_sdk',
    value: 26,
    type: 'number',
    description: 'Minimum Android SDK level required',
    platform: 'android',
    environment: 'production',
    lastModified: '2025-01-15T11:00:00Z',
    modifiedBy: 'admin@xpresstaxi.com',
  },
];

/**
 * Get mobile dashboard data
 */
export async function getMobileDashboard(): Promise<MobileDashboardData> {
  // Return mock data for now
  return {
    versions: mockVersions,
    deviceBreakdown: mockDeviceBreakdown,
    activeUsers: mockActiveUsers,
    recentCrashes: mockCrashes.slice(0, 5),
    featureFlags: mockFeatureFlags,
    recentNotifications: mockNotifications,
    storeMetrics: mockStoreMetrics,
    remoteConfigs: mockRemoteConfigs,
  };
}

/**
 * Get mobile stats
 */
export async function getMobileStats(): Promise<MobileStats> {
  return {
    totalInstalls: 1380000,
    activeToday: 42350,
    activeThisWeek: 78920,
    activeThisMonth: 114970,
    crashFreeRate: 98.7,
    avgRating: 4.6,
    totalCrashes24h: 12,
    pendingNotifications: 1,
  };
}

/**
 * Get app versions
 */
export async function getVersions(platform?: 'ios' | 'android'): Promise<AppVersion[]> {
  if (platform) {
    return mockVersions.filter((v) => v.platform === platform);
  }
  return mockVersions;
}

/**
 * Create new app version
 */
export async function createVersion(version: Omit<AppVersion, 'id'>): Promise<AppVersion> {
  const newVersion: AppVersion = {
    ...version,
    id: `v${Date.now()}`,
  };
  mockVersions.push(newVersion);
  return newVersion;
}

/**
 * Update app version
 */
export async function updateVersion(id: string, updates: Partial<AppVersion>): Promise<AppVersion> {
  const index = mockVersions.findIndex((v) => v.id === id);
  if (index === -1) throw new Error('Version not found');
  mockVersions[index] = { ...mockVersions[index], ...updates };
  return mockVersions[index];
}

/**
 * Delete app version
 */
export async function deleteVersion(id: string): Promise<void> {
  const index = mockVersions.findIndex((v) => v.id === id);
  if (index !== -1) mockVersions.splice(index, 1);
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(): Promise<DeviceBreakdown[]> {
  return mockDeviceBreakdown;
}

/**
 * Get active user metrics
 */
export async function getActiveUserMetrics(): Promise<ActiveUserMetrics> {
  return mockActiveUsers;
}

/**
 * Get crash reports
 */
export async function getCrashes(params?: {
  platform?: string;
  severity?: string;
  status?: string;
}): Promise<CrashReport[]> {
  let crashes = [...mockCrashes];
  if (params?.platform) crashes = crashes.filter((c) => c.platform === params.platform);
  if (params?.severity) crashes = crashes.filter((c) => c.severity === params.severity);
  if (params?.status) crashes = crashes.filter((c) => c.status === params.status);
  return crashes;
}

/**
 * Update crash status
 */
export async function updateCrashStatus(
  id: string,
  status: CrashReport['status']
): Promise<CrashReport> {
  const crash = mockCrashes.find((c) => c.id === id);
  if (!crash) throw new Error('Crash not found');
  crash.status = status;
  return crash;
}

/**
 * Get feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  return mockFeatureFlags;
}

/**
 * Create feature flag
 */
export async function createFeatureFlag(
  flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FeatureFlag> {
  const newFlag: FeatureFlag = {
    ...flag,
    id: `f${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockFeatureFlags.push(newFlag);
  return newFlag;
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(
  id: string,
  updates: Partial<FeatureFlag>
): Promise<FeatureFlag> {
  const index = mockFeatureFlags.findIndex((f) => f.id === id);
  if (index === -1) throw new Error('Feature flag not found');
  mockFeatureFlags[index] = {
    ...mockFeatureFlags[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockFeatureFlags[index];
}

/**
 * Toggle feature flag
 */
export async function toggleFeatureFlag(id: string): Promise<FeatureFlag> {
  const flag = mockFeatureFlags.find((f) => f.id === id);
  if (!flag) throw new Error('Feature flag not found');
  flag.enabled = !flag.enabled;
  flag.updatedAt = new Date().toISOString();
  return flag;
}

/**
 * Delete feature flag
 */
export async function deleteFeatureFlag(id: string): Promise<void> {
  const index = mockFeatureFlags.findIndex((f) => f.id === id);
  if (index !== -1) mockFeatureFlags.splice(index, 1);
}

/**
 * Get push notifications
 */
export async function getNotifications(): Promise<PushNotification[]> {
  return mockNotifications;
}

/**
 * Create push notification
 */
export async function createNotification(
  notification: Omit<PushNotification, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickThroughRate'>
): Promise<PushNotification> {
  const newNotification: PushNotification = {
    ...notification,
    id: `n${Date.now()}`,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickThroughRate: 0,
    createdAt: new Date().toISOString(),
  };
  mockNotifications.push(newNotification);
  return newNotification;
}

/**
 * Send push notification
 */
export async function sendNotification(id: string): Promise<PushNotification> {
  const notification = mockNotifications.find((n) => n.id === id);
  if (!notification) throw new Error('Notification not found');
  notification.status = 'sent';
  notification.sentAt = new Date().toISOString();
  notification.sentCount = 115000;
  notification.deliveredCount = 112000;
  return notification;
}

/**
 * Cancel scheduled notification
 */
export async function cancelNotification(id: string): Promise<void> {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.status = 'failed';
  }
}

/**
 * Get app store metrics
 */
export async function getStoreMetrics(): Promise<AppStoreMetrics[]> {
  return mockStoreMetrics;
}

/**
 * Get remote configs
 */
export async function getRemoteConfigs(): Promise<RemoteConfig[]> {
  return mockRemoteConfigs;
}

/**
 * Create remote config
 */
export async function createRemoteConfig(
  config: Omit<RemoteConfig, 'id' | 'lastModified'>
): Promise<RemoteConfig> {
  const newConfig: RemoteConfig = {
    ...config,
    id: `rc${Date.now()}`,
    lastModified: new Date().toISOString(),
  };
  mockRemoteConfigs.push(newConfig);
  return newConfig;
}

/**
 * Update remote config
 */
export async function updateRemoteConfig(
  id: string,
  updates: Partial<RemoteConfig>
): Promise<RemoteConfig> {
  const index = mockRemoteConfigs.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Remote config not found');
  mockRemoteConfigs[index] = {
    ...mockRemoteConfigs[index],
    ...updates,
    lastModified: new Date().toISOString(),
  };
  return mockRemoteConfigs[index];
}

/**
 * Delete remote config
 */
export async function deleteRemoteConfig(id: string): Promise<void> {
  const index = mockRemoteConfigs.findIndex((c) => c.id === id);
  if (index !== -1) mockRemoteConfigs.splice(index, 1);
}

// Export as a service object
export const mobileService = {
  getMobileDashboard,
  getMobileStats,
  getVersions,
  createVersion,
  updateVersion,
  deleteVersion,
  getDeviceBreakdown,
  getActiveUserMetrics,
  getCrashes,
  updateCrashStatus,
  getFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
  getNotifications,
  createNotification,
  sendNotification,
  cancelNotification,
  getStoreMetrics,
  getRemoteConfigs,
  createRemoteConfig,
  updateRemoteConfig,
  deleteRemoteConfig,
};

export default mobileService;
