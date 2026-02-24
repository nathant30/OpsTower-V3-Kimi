/**
 * Profile Feature Hooks
 * React Query hooks for user profile management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile/profile.service';
import type {
  UserProfile,
  UpdateProfileInput,
  NotificationPreferences,
  CreateApiKeyInput,
  ChangePasswordInput,
} from '@/services/profile/types';

// Query keys
const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'details'] as const,
  notifications: () => [...profileKeys.all, 'notifications'] as const,
  activity: (params?: { limit?: number; category?: string }) =>
    [...profileKeys.all, 'activity', params] as const,
  apiKeys: () => [...profileKeys.all, 'api-keys'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
  security: () => [...profileKeys.all, 'security'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
};

/**
 * Get user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => profileService.getProfile(),
  });
}

/**
 * Update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileService.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
    },
  });
}

/**
 * Upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
    },
  });
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: profileKeys.notifications(),
    queryFn: () => profileService.getNotificationPreferences(),
  });
}

/**
 * Update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      profileService.updateNotificationPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.notifications() });
    },
  });
}

/**
 * Get activity log
 */
export function useActivityLog(params?: { limit?: number; category?: string }) {
  return useQuery({
    queryKey: profileKeys.activity(params),
    queryFn: () => profileService.getActivityLog(params),
  });
}

/**
 * Get API keys
 */
export function useApiKeys() {
  return useQuery({
    queryKey: profileKeys.apiKeys(),
    queryFn: () => profileService.getApiKeys(),
  });
}

/**
 * Create API key
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => profileService.createApiKey(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
    },
  });
}

/**
 * Revoke API key
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
    },
  });
}

/**
 * Delete API key
 */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
    },
  });
}

/**
 * Get user sessions
 */
export function useSessions() {
  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: () => profileService.getSessions(),
  });
}

/**
 * Terminate session
 */
export function useTerminateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.terminateSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
    },
  });
}

/**
 * Terminate all other sessions
 */
export function useTerminateAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileService.terminateAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
    },
  });
}

/**
 * Get security settings
 */
export function useSecuritySettings() {
  return useQuery({
    queryKey: profileKeys.security(),
    queryFn: () => profileService.getSecuritySettings(),
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => profileService.changePassword(input),
  });
}

/**
 * Setup 2FA
 */
export function useSetupTwoFactor() {
  return useMutation({
    mutationFn: (method: 'app' | 'sms' | 'email') => profileService.setupTwoFactor(method),
  });
}

/**
 * Enable 2FA
 */
export function useEnableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => profileService.enableTwoFactor(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.security() });
    },
  });
}

/**
 * Disable 2FA
 */
export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => profileService.disableTwoFactor(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.security() });
    },
  });
}

/**
 * Regenerate backup codes
 */
export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: () => profileService.regenerateBackupCodes(),
  });
}

/**
 * Remove trusted device
 */
export function useRemoveTrustedDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.removeTrustedDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.security() });
    },
  });
}

/**
 * Get profile stats
 */
export function useProfileStats() {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: () => profileService.getProfileStats(),
  });
}
