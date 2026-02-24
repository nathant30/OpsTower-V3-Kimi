/**
 * Monitoring & Analytics Library
 * Centralized exports for all monitoring functionality
 */

// Web Vitals
export type { WebVitalsMetric } from './webVitals';
export { 
  onCLS, 
  onFCP, 
  onFID, 
  onINP, 
  onLCP, 
  onTTFB, 
  getAllWebVitals 
} from './webVitals';

// Error Tracking
export type { 
  ErrorSeverity, 
  ErrorContext, 
  ErrorUser, 
  Breadcrumb,
  ErrorBoundaryFallbackProps 
} from './errorTracking';
export {
  initErrorTracking,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setTag,
  setExtra,
  configureErrorTracking,
} from './errorTracking';

// Performance
export type { PerformanceMetric } from './performance';
export {
  initPerformanceMonitoring,
  startMeasure,
  endMeasure,
  measureFunction,
  measureRender,
  onPerformanceMetric,
  cleanupPerformanceMonitoring,
} from './performance';

// Analytics
export type { AnalyticsEvent, PageView } from './analytics';
export {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackUserAction,
  getPrivacySettings,
  isAnalyticsEnabled,
  optOut,
  optIn,
} from './analytics';

// Provider
export { MonitoringProvider, useMonitoring } from './MonitoringProvider';

// Hooks (re-export from hooks directory)
export { useWebVitals } from '@/hooks/useWebVitals';
export { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Initialize all monitoring systems
 * Call this once in your app entry point
 */
export function initMonitoring(): void {
  // Initialize error tracking
  import('./errorTracking').then(({ initErrorTracking }) => {
    initErrorTracking();
  });
  
  // Initialize performance monitoring
  import('./performance').then(({ initPerformanceMonitoring }) => {
    initPerformanceMonitoring();
  });
  
  // Initialize analytics
  import('./analytics').then(({ initAnalytics }) => {
    initAnalytics();
  });
  
  if (import.meta.env.DEV) {
    console.log('[Monitoring] All systems initialized');
  }
}
