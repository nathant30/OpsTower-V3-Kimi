/**
 * Mobile Service Types
 * Types for mobile app management, analytics, and configuration
 */

// App Version Types
export interface AppVersion {
  id: string;
  version: string;
  platform: 'ios' | 'android';
  buildNumber: number;
  releaseDate: string;
  status: 'stable' | 'beta' | 'deprecated' | 'forced_update';
  forceUpdate: boolean;
  minRequiredVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  adoptionRate: number;
  activeInstalls: number;
}

// Device Breakdown Types
export interface DeviceBreakdown {
  platform: 'ios' | 'android';
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

// Active User Metrics
export interface ActiveUserMetrics {
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
  peakConcurrent: number;
  avgSessionDuration: number; // in minutes
  retentionDay1: number; // percentage
  retentionDay7: number; // percentage
  retentionDay30: number; // percentage
}

// Crash/Error Report Types
export interface CrashReport {
  id: string;
  title: string;
  description: string;
  platform: 'ios' | 'android';
  version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  affectedUsers: number;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  stackTrace?: string;
  deviceInfo?: string;
}

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  platform: 'all' | 'ios' | 'android';
  rolloutPercentage: number;
  targetVersion?: string;
  targetUsers?: string[];
  createdAt: string;
  updatedAt: string;
  modifiedBy: string;
}

// Push Notification Types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  targetAudience: 'all' | 'ios' | 'android' | 'specific_users';
  targetUsers?: string[];
  targetRegions?: string[];
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickThroughRate: number;
  createdBy: string;
  createdAt: string;
}

export interface PushNotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: string;
}

// App Store Metrics
export interface AppStoreMetrics {
  platform: 'ios' | 'android';
  totalDownloads: number;
  monthlyDownloads: number;
  dailyDownloads: number;
  averageRating: number;
  totalRatings: number;
  reviewsCount: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AppReview {
  id: string;
  platform: 'ios' | 'android';
  rating: number;
  title: string;
  content: string;
  author: string;
  version: string;
  date: string;
  responded: boolean;
  response?: string;
}

// Remote Configuration
export interface RemoteConfig {
  id: string;
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  platform: 'all' | 'ios' | 'android';
  environment: 'production' | 'staging' | 'development';
  lastModified: string;
  modifiedBy: string;
}

// Mobile Dashboard Summary
export interface MobileDashboardData {
  versions: AppVersion[];
  deviceBreakdown: DeviceBreakdown[];
  activeUsers: ActiveUserMetrics;
  recentCrashes: CrashReport[];
  featureFlags: FeatureFlag[];
  recentNotifications: PushNotification[];
  storeMetrics: AppStoreMetrics[];
  remoteConfigs: RemoteConfig[];
}

// Mobile Stats
export interface MobileStats {
  totalInstalls: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  crashFreeRate: number;
  avgRating: number;
  totalCrashes24h: number;
  pendingNotifications: number;
}
