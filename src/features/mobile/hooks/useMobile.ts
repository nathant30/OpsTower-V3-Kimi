/**
 * Mobile Feature Hooks
 * React Query hooks for mobile app management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileService } from '@/services/mobile/mobile.service';
import type {
  AppVersion,
  CrashReport,
  FeatureFlag,
  PushNotification,
  RemoteConfig,
} from '@/services/mobile/types';

// Query keys
const mobileKeys = {
  all: ['mobile'] as const,
  dashboard: () => [...mobileKeys.all, 'dashboard'] as const,
  stats: () => [...mobileKeys.all, 'stats'] as const,
  versions: () => [...mobileKeys.all, 'versions'] as const,
  deviceBreakdown: () => [...mobileKeys.all, 'device-breakdown'] as const,
  activeUsers: () => [...mobileKeys.all, 'active-users'] as const,
  crashes: (filters?: { platform?: string; severity?: string; status?: string }) =>
    [...mobileKeys.all, 'crashes', filters] as const,
  featureFlags: () => [...mobileKeys.all, 'feature-flags'] as const,
  notifications: () => [...mobileKeys.all, 'notifications'] as const,
  storeMetrics: () => [...mobileKeys.all, 'store-metrics'] as const,
  remoteConfigs: () => [...mobileKeys.all, 'remote-configs'] as const,
};

/**
 * Get mobile dashboard data
 */
export function useMobileDashboard() {
  return useQuery({
    queryKey: mobileKeys.dashboard(),
    queryFn: () => mobileService.getMobileDashboard(),
  });
}

/**
 * Get mobile stats
 */
export function useMobileStats() {
  return useQuery({
    queryKey: mobileKeys.stats(),
    queryFn: () => mobileService.getMobileStats(),
  });
}

/**
 * Get app versions
 */
export function useVersions(platform?: 'ios' | 'android') {
  return useQuery({
    queryKey: [...mobileKeys.versions(), platform],
    queryFn: () => mobileService.getVersions(platform),
  });
}

/**
 * Create app version
 */
export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (version: Omit<AppVersion, 'id'>) => mobileService.createVersion(version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.versions() });
    },
  });
}

/**
 * Update app version
 */
export function useUpdateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AppVersion> }) =>
      mobileService.updateVersion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.versions() });
    },
  });
}

/**
 * Delete app version
 */
export function useDeleteVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileService.deleteVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.versions() });
    },
  });
}

/**
 * Get device breakdown
 */
export function useDeviceBreakdown() {
  return useQuery({
    queryKey: mobileKeys.deviceBreakdown(),
    queryFn: () => mobileService.getDeviceBreakdown(),
  });
}

/**
 * Get active user metrics
 */
export function useActiveUserMetrics() {
  return useQuery({
    queryKey: mobileKeys.activeUsers(),
    queryFn: () => mobileService.getActiveUserMetrics(),
  });
}

/**
 * Get crash reports
 */
export function useCrashes(filters?: { platform?: string; severity?: string; status?: string }) {
  return useQuery({
    queryKey: mobileKeys.crashes(filters),
    queryFn: () => mobileService.getCrashes(filters),
  });
}

/**
 * Update crash status
 */
export function useUpdateCrashStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CrashReport['status'] }) =>
      mobileService.updateCrashStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.crashes() });
    },
  });
}

/**
 * Get feature flags
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: mobileKeys.featureFlags(),
    queryFn: () => mobileService.getFeatureFlags(),
  });
}

/**
 * Create feature flag
 */
export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) =>
      mobileService.createFeatureFlag(flag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.featureFlags() });
    },
  });
}

/**
 * Update feature flag
 */
export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FeatureFlag> }) =>
      mobileService.updateFeatureFlag(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.featureFlags() });
    },
  });
}

/**
 * Toggle feature flag
 */
export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileService.toggleFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.featureFlags() });
    },
  });
}

/**
 * Delete feature flag
 */
export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileService.deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.featureFlags() });
    },
  });
}

/**
 * Get push notifications
 */
export function useNotifications() {
  return useQuery({
    queryKey: mobileKeys.notifications(),
    queryFn: () => mobileService.getNotifications(),
  });
}

/**
 * Create push notification
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notification: Omit<PushNotification, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickThroughRate'>) =>
      mobileService.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.notifications() });
    },
  });
}

/**
 * Send push notification
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileService.sendNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.notifications() });
    },
  });
}

/**
 * Cancel notification
 */
export function useCancelNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileService.cancelNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.notifications() });
    },
  });
}

/**
 * Get app store metrics
 */
export function useStoreMetrics() {
  return useQuery({
    queryKey: mobileKeys.storeMetrics(),
    queryFn: () => mobileService.getStoreMetrics(),
  });
}

/**
 * Get remote configs
 */
export function useRemoteConfigs() {
  return useQuery({
    queryKey: mobileKeys.remoteConfigs(),
    queryFn: () => mobileService.getRemoteConfigs(),
  });
}

/**
 * Create remote config
 */
export function useCreateRemoteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Omit<RemoteConfig, 'id' | 'lastModified'>) =>
      mobileService.createRemoteConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.remoteConfigs() });
    },
  });
}

/**
 * Update remote config
 */
export function useUpdateRemoteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RemoteConfig> }) =>
      mobileService.updateRemoteConfig(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.remoteConfigs() });
    },
  });
}

/**
 * Delete remote config
 */
export function useDeleteRemoteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileService.deleteRemoteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mobileKeys.remoteConfigs() });
    },
  });
}
