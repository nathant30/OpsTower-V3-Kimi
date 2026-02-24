/**
 * Profile Feature Module
 * User profile management components, hooks, and pages
 */

// Components
export { ProfileForm } from './components/ProfileForm';
export { NotificationPreferences } from './components/NotificationPreferences';
export { SecuritySettings } from './components/SecuritySettings';

// Hooks
export { useProfile, useUpdateProfile, useNotificationPreferences, useUpdateNotificationPreferences, useActivityLog, useApiKeys, useCreateApiKey, useRevokeApiKey, useSessions, useTerminateSession, useChangePassword, useSecuritySettings } from './hooks/useProfile';

// Pages
export { default as ProfilePage } from './pages/ProfilePage';
