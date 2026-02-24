/**
 * Profile Service Types
 * Types for user profile management and account settings
 */

// User Profile Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  department?: string;
  employeeId?: string;
  regionId?: string;
  timezone: string;
  language: string;
  bio?: string;
  joinDate: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
}

// Profile Update Input
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  bio?: string;
}

// Notification Preferences
export interface NotificationPreferences {
  email: {
    marketing: boolean;
    updates: boolean;
    security: boolean;
    reports: boolean;
  };
  push: {
    alerts: boolean;
    messages: boolean;
    mentions: boolean;
    system: boolean;
  };
  sms: {
    security: boolean;
    critical: boolean;
  };
  inApp: {
    all: boolean;
    mentions: boolean;
    tasks: boolean;
    system: boolean;
  };
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  category: 'auth' | 'profile' | 'security' | 'system' | 'data';
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  status: 'active' | 'revoked' | 'expired';
  createdBy: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes: string[];
  expiresInDays?: number;
}

// Session Types
export interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  startedAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

// Security Settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  lastPasswordChange?: string;
  passwordExpiryDays: number;
  requirePasswordChange: boolean;
  loginNotifications: boolean;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  addedAt: string;
  lastUsedAt: string;
}

// Password Change Input
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 2FA Setup
export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Profile Stats
export interface ProfileStats {
  totalLogins: number;
  apiKeysCount: number;
  activeSessions: number;
  lastActivityAt: string;
}
