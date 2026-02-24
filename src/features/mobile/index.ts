/**
 * Mobile Feature Module
 * Mobile app management components, hooks, and pages
 */

// Components
export { AppVersionCard } from './components/AppVersionCard';
export { FeatureFlagManager } from './components/FeatureFlagManager';
export { PushNotificationPanel } from './components/PushNotificationPanel';

// Hooks
export { useMobileDashboard, useMobileStats, useVersions, useCrashes, useFeatureFlags, useNotifications, useStoreMetrics, useRemoteConfigs } from './hooks/useMobile';

// Pages
export { default as MobileDashboard } from './pages/MobileDashboard';
