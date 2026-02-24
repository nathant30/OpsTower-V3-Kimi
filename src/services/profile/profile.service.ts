/**
 * Profile Service
 * Manages user profile, security settings, API keys, and sessions
 */

import { apiClient } from '@/lib/api/client';
import type {
  UserProfile,
  UpdateProfileInput,
  NotificationPreferences,
  ActivityLog,
  ApiKey,
  CreateApiKeyInput,
  UserSession,
  SecuritySettings,
  ChangePasswordInput,
  TwoFactorSetup,
  ProfileStats,
  TrustedDevice,
} from './types';

// API Endpoints
const PROFILE_ENDPOINTS = {
  // Profile
  getProfile: '/api/profile',
  updateProfile: '/api/profile',
  uploadAvatar: '/api/profile/avatar',

  // Notifications
  getNotificationPreferences: '/api/profile/notifications',
  updateNotificationPreferences: '/api/profile/notifications',

  // Activity
  getActivityLog: '/api/profile/activity',

  // API Keys
  getApiKeys: '/api/profile/api-keys',
  createApiKey: '/api/profile/api-keys',
  revokeApiKey: (id: string) => `/api/profile/api-keys/${id}/revoke`,
  deleteApiKey: (id: string) => `/api/profile/api-keys/${id}`,

  // Sessions
  getSessions: '/api/profile/sessions',
  terminateSession: (id: string) => `/api/profile/sessions/${id}`,
  terminateAllSessions: '/api/profile/sessions/terminate-all',

  // Security
  getSecuritySettings: '/api/profile/security',
  changePassword: '/api/profile/security/password',
  setupTwoFactor: '/api/profile/security/2fa/setup',
  enableTwoFactor: '/api/profile/security/2fa/enable',
  disableTwoFactor: '/api/profile/security/2fa/disable',
  regenerateBackupCodes: '/api/profile/security/2fa/backup-codes',
  removeTrustedDevice: (id: string) => `/api/profile/security/trusted-devices/${id}`,

  // Stats
  getStats: '/api/profile/stats',
};

// Mock Data
const mockProfile: UserProfile = {
  id: 'USER-001',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@xpresstaxi.com',
  phone: '+63 912 345 6789',
  avatar: undefined,
  role: 'super_admin',
  department: 'Operations',
  employeeId: 'EMP-2024-001',
  regionId: 'NCR',
  timezone: 'Asia/Manila',
  language: 'en',
  bio: 'Operations administrator with full system access.',
  joinDate: '2024-01-15T00:00:00Z',
  lastLogin: '2025-02-17T09:30:00Z',
  status: 'active',
};

const mockNotificationPreferences: NotificationPreferences = {
  email: {
    marketing: false,
    updates: true,
    security: true,
    reports: true,
  },
  push: {
    alerts: true,
    messages: true,
    mentions: true,
    system: false,
  },
  sms: {
    security: true,
    critical: true,
  },
  inApp: {
    all: true,
    mentions: true,
    tasks: true,
    system: false,
  },
};

const mockActivityLog: ActivityLog[] = [
  {
    id: 'a1',
    userId: 'USER-001',
    action: 'LOGIN',
    description: 'Logged in successfully from Chrome on macOS',
    category: 'auth',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0 / macOS 14.3',
    metadata: { location: 'Makati City, Philippines' },
    timestamp: '2025-02-17T09:30:00Z',
  },
  {
    id: 'a2',
    userId: 'USER-001',
    action: 'PROFILE_UPDATE',
    description: 'Updated profile information',
    category: 'profile',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0 / macOS 14.3',
    timestamp: '2025-02-16T14:25:00Z',
  },
  {
    id: 'a3',
    userId: 'USER-001',
    action: 'PASSWORD_CHANGE',
    description: 'Changed account password',
    category: 'security',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0 / macOS 14.3',
    timestamp: '2025-02-15T10:15:00Z',
  },
  {
    id: 'a4',
    userId: 'USER-001',
    action: 'API_KEY_CREATED',
    description: 'Created new API key: "Production Integration"',
    category: 'security',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0 / macOS 14.3',
    timestamp: '2025-02-14T16:45:00Z',
  },
  {
    id: 'a5',
    userId: 'USER-001',
    action: 'SESSION_TERMINATED',
    description: 'Terminated session on iPhone 15 Pro',
    category: 'security',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0 / macOS 14.3',
    timestamp: '2025-02-13T11:20:00Z',
  },
  {
    id: 'a6',
    userId: 'USER-001',
    action: 'NOTIFICATION_SETTINGS',
    description: 'Updated notification preferences',
    category: 'profile',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.0 / iOS 17.2',
    timestamp: '2025-02-12T09:10:00Z',
  },
  {
    id: 'a7',
    userId: 'USER-001',
    action: 'LOGIN',
    description: 'Logged in successfully from Safari on iOS',
    category: 'auth',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.0 / iOS 17.2',
    metadata: { location: 'Quezon City, Philippines' },
    timestamp: '2025-02-12T09:05:00Z',
  },
  {
    id: 'a8',
    userId: 'USER-001',
    action: 'DATA_EXPORT',
    description: 'Exported driver performance report',
    category: 'data',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0 / macOS 14.3',
    timestamp: '2025-02-10T15:30:00Z',
  },
];

const mockApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production Integration',
    keyPrefix: 'xp_live_...7f3a',
    scopes: ['read:orders', 'write:orders', 'read:drivers'],
    createdAt: '2025-02-14T16:45:00Z',
    expiresAt: '2026-02-14T16:45:00Z',
    lastUsedAt: '2025-02-17T08:30:00Z',
    usageCount: 15420,
    status: 'active',
    createdBy: 'USER-001',
  },
  {
    id: 'key-2',
    name: 'Analytics Dashboard',
    keyPrefix: 'xp_analytics_...9b2c',
    scopes: ['read:analytics', 'read:reports'],
    createdAt: '2025-01-20T10:00:00Z',
    lastUsedAt: '2025-02-16T18:15:00Z',
    usageCount: 8932,
    status: 'active',
    createdBy: 'USER-001',
  },
  {
    id: 'key-3',
    name: 'Mobile App Testing',
    keyPrefix: 'xp_test_...4d1e',
    scopes: ['read:all', 'write:all'],
    createdAt: '2025-01-10T09:00:00Z',
    expiresAt: '2025-02-10T09:00:00Z',
    lastUsedAt: '2025-02-09T14:20:00Z',
    usageCount: 3450,
    status: 'expired',
    createdBy: 'USER-001',
  },
];

const mockSessions: UserSession[] = [
  {
    id: 'sess-1',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop',
    browser: 'Chrome 121.0',
    os: 'macOS 14.3',
    ipAddress: '192.168.1.100',
    location: 'Makati City, Philippines',
    startedAt: '2025-02-17T09:30:00Z',
    lastActiveAt: '2025-02-17T18:45:00Z',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'mobile',
    browser: 'Safari 17.0',
    os: 'iOS 17.2',
    ipAddress: '192.168.1.105',
    location: 'Quezon City, Philippines',
    startedAt: '2025-02-16T08:15:00Z',
    lastActiveAt: '2025-02-17T12:30:00Z',
    isCurrent: false,
  },
  {
    id: 'sess-3',
    deviceName: 'iPad Pro',
    deviceType: 'tablet',
    browser: 'Safari 17.0',
    os: 'iPadOS 17.2',
    ipAddress: '203.177.89.45',
    location: 'Pasig City, Philippines',
    startedAt: '2025-02-15T14:00:00Z',
    lastActiveAt: '2025-02-15T16:45:00Z',
    isCurrent: false,
  },
];

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  twoFactorMethod: 'app',
  lastPasswordChange: '2025-02-15T10:15:00Z',
  passwordExpiryDays: 90,
  requirePasswordChange: false,
  loginNotifications: true,
  trustedDevices: [
    {
      id: 'td-1',
      deviceName: 'MacBook Pro - Chrome',
      deviceType: 'desktop',
      browser: 'Chrome 121.0',
      os: 'macOS 14.3',
      addedAt: '2024-01-15T10:00:00Z',
      lastUsedAt: '2025-02-17T18:45:00Z',
    },
    {
      id: 'td-2',
      deviceName: 'iPhone 15 Pro - Safari',
      deviceType: 'mobile',
      browser: 'Safari 17.0',
      os: 'iOS 17.2',
      addedAt: '2024-06-20T14:30:00Z',
      lastUsedAt: '2025-02-17T12:30:00Z',
    },
    {
      id: 'td-3',
      deviceName: 'iPad Pro - Safari',
      deviceType: 'tablet',
      browser: 'Safari 17.0',
      os: 'iPadOS 17.2',
      addedAt: '2024-08-10T09:00:00Z',
      lastUsedAt: '2025-02-15T16:45:00Z',
    },
  ],
};

/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfile> {
  return mockProfile;
}

/**
 * Update user profile
 */
export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  Object.assign(mockProfile, input);
  return mockProfile;
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  // Simulate upload
  const avatarUrl = URL.createObjectURL(file);
  mockProfile.avatar = avatarUrl;
  return { avatarUrl };
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return mockNotificationPreferences;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  Object.assign(mockNotificationPreferences, preferences);
  return mockNotificationPreferences;
}

/**
 * Get activity log
 */
export async function getActivityLog(params?: {
  limit?: number;
  category?: string;
}): Promise<ActivityLog[]> {
  let logs = [...mockActivityLog];
  if (params?.category) {
    logs = logs.filter((l) => l.category === params.category);
  }
  if (params?.limit) {
    logs = logs.slice(0, params.limit);
  }
  return logs;
}

/**
 * Get API keys
 */
export async function getApiKeys(): Promise<ApiKey[]> {
  return mockApiKeys;
}

/**
 * Create API key
 */
export async function createApiKey(input: CreateApiKeyInput): Promise<{ apiKey: ApiKey; fullKey: string }> {
  const newKey: ApiKey = {
    id: `key-${Date.now()}`,
    name: input.name,
    keyPrefix: `xp_${input.name.toLowerCase().replace(/\s+/g, '_').slice(0, 10)}_...${Math.random().toString(36).slice(-4)}`,
    scopes: input.scopes,
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    usageCount: 0,
    status: 'active',
    createdBy: mockProfile.id,
  };
  mockApiKeys.push(newKey);
  return { apiKey: newKey, fullKey: `xp_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}` };
}

/**
 * Revoke API key
 */
export async function revokeApiKey(id: string): Promise<ApiKey> {
  const key = mockApiKeys.find((k) => k.id === id);
  if (!key) throw new Error('API key not found');
  key.status = 'revoked';
  return key;
}

/**
 * Delete API key
 */
export async function deleteApiKey(id: string): Promise<void> {
  const index = mockApiKeys.findIndex((k) => k.id === id);
  if (index !== -1) mockApiKeys.splice(index, 1);
}

/**
 * Get user sessions
 */
export async function getSessions(): Promise<UserSession[]> {
  return mockSessions;
}

/**
 * Terminate session
 */
export async function terminateSession(id: string): Promise<void> {
  const index = mockSessions.findIndex((s) => s.id === id);
  if (index !== -1) mockSessions.splice(index, 1);
}

/**
 * Terminate all other sessions
 */
export async function terminateAllSessions(): Promise<void> {
  const currentSession = mockSessions.find((s) => s.isCurrent);
  mockSessions.length = 0;
  if (currentSession) {
    mockSessions.push(currentSession);
  }
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<SecuritySettings> {
  return mockSecuritySettings;
}

/**
 * Change password
 */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  // Validate current password
  if (input.currentPassword !== 'current') {
    throw new Error('Current password is incorrect');
  }
  // Update password
  mockSecuritySettings.lastPasswordChange = new Date().toISOString();
}

/**
 * Setup 2FA
 */
export async function setupTwoFactor(method: 'app' | 'sms' | 'email'): Promise<TwoFactorSetup> {
  return {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Xpress:${mockProfile.email}?secret=JBSWY3DPEHPK3PXP&issuer=Xpress`,
    backupCodes: ['12345678', '87654321', '11223344', '55667788', '99001122'],
  };
}

/**
 * Enable 2FA
 */
export async function enableTwoFactor(code: string): Promise<void> {
  if (code !== '123456') {
    throw new Error('Invalid verification code');
  }
  mockSecuritySettings.twoFactorEnabled = true;
}

/**
 * Disable 2FA
 */
export async function disableTwoFactor(password: string): Promise<void> {
  if (password !== 'current') {
    throw new Error('Password is incorrect');
  }
  mockSecuritySettings.twoFactorEnabled = false;
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(): Promise<string[]> {
  return ['99887766', '55443322', '11335577', '22446688', '99007755'];
}

/**
 * Remove trusted device
 */
export async function removeTrustedDevice(id: string): Promise<void> {
  const index = mockSecuritySettings.trustedDevices.findIndex((d) => d.id === id);
  if (index !== -1) mockSecuritySettings.trustedDevices.splice(index, 1);
}

/**
 * Get profile stats
 */
export async function getProfileStats(): Promise<ProfileStats> {
  return {
    totalLogins: 487,
    apiKeysCount: mockApiKeys.filter((k) => k.status === 'active').length,
    activeSessions: mockSessions.length,
    lastActivityAt: mockActivityLog[0]?.timestamp || new Date().toISOString(),
  };
}

// Export as a service object
export const profileService = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getNotificationPreferences,
  updateNotificationPreferences,
  getActivityLog,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  getSessions,
  terminateSession,
  terminateAllSessions,
  getSecuritySettings,
  changePassword,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
  removeTrustedDevice,
  getProfileStats,
};

export default profileService;
