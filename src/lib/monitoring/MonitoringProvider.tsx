/**
 * Monitoring Provider Component
 * Provides monitoring context to the application
 * Initializes Web Vitals, Error Tracking, Performance, and Analytics
 */

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

import { useWebVitals } from '@/hooks/useWebVitals';
import { useAnalytics } from '@/hooks/useAnalytics';

import { initErrorTracking, setUser, captureException } from './errorTracking';
import { initPerformanceMonitoring } from './performance';
import { initAnalytics } from './analytics';

// Monitoring context type
interface MonitoringContextType {
  /** Whether monitoring is initialized */
  isInitialized: boolean;
  /** Report an error */
  reportError: (error: Error, context?: Record<string, unknown>) => void;
  /** Set user context for error tracking */
  setUserContext: (user: { id?: string; email?: string; username?: string } | null) => void;
}

// Create context
const MonitoringContext = createContext<MonitoringContextType>({
  isInitialized: false,
  reportError: () => {},
  setUserContext: () => {},
});

// Hook to use monitoring context
export const useMonitoring = () => useContext(MonitoringContext);

// Provider props
interface MonitoringProviderProps {
  children: ReactNode;
  /** Whether to track Web Vitals */
  trackWebVitals?: boolean;
  /** Whether to track analytics */
  trackAnalytics?: boolean;
  /** Whether to enable error tracking */
  trackErrors?: boolean;
  /** Whether to track performance metrics */
  trackPerformance?: boolean;
  /** Custom Web Vitals report handler */
  onWebVitalsReport?: (metric: {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }) => void;
  /** Google Analytics Measurement ID (G-XXXXXXXXXX) */
  ga4MeasurementId?: string;
  /** Plausible domain */
  plausibleDomain?: string;
}

/**
 * Monitoring Provider Component
 * 
 * Usage:
 * <MonitoringProvider
 *   trackWebVitals
 *   trackAnalytics
 *   ga4MeasurementId={import.meta.env.VITE_GA4_ID}
 * >
 *   <App />
 * </MonitoringProvider>
 */
export function MonitoringProvider({
  children,
  trackWebVitals = true,
  trackAnalytics = true,
  trackErrors = true,
  trackPerformance = true,
  onWebVitalsReport,
  ga4MeasurementId,
  plausibleDomain,
}: MonitoringProviderProps): React.JSX.Element {
  const location = useLocation();

  // Initialize error tracking
  useEffect(() => {
    if (trackErrors) {
      initErrorTracking();
    }
  }, [trackErrors]);

  // Initialize performance monitoring
  useEffect(() => {
    if (trackPerformance) {
      initPerformanceMonitoring();
    }
  }, [trackPerformance]);

  // Initialize analytics
  useEffect(() => {
    if (trackAnalytics) {
      initAnalytics({
        ga4MeasurementId,
        plausibleDomain,
      });
    }
  }, [trackAnalytics, ga4MeasurementId, plausibleDomain]);

  // Use Web Vitals hook
  useWebVitals({
    enabled: trackWebVitals,
    onReport: onWebVitalsReport,
  });

  // Use Analytics hook for page tracking
  useAnalytics({
    enabled: trackAnalytics,
  });

  // Report error handler
  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    captureException(error, { context });
  }, []);

  // Set user context handler
  const setUserContext = useCallback((user: { id?: string; email?: string; username?: string } | null) => {
    setUser(user);
  }, []);

  const value: MonitoringContextType = {
    isInitialized: true,
    reportError,
    setUserContext,
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
      {/* Development-only monitoring indicator */}
      {import.meta.env.DEV && <DevMonitoringIndicator />}
    </MonitoringContext.Provider>
  );
}

/**
 * Development-only monitoring indicator
 * Shows when monitoring is active in development
 */
function DevMonitoringIndicator(): React.JSX.Element | null {
  if (import.meta.env.PROD) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 
                 flex items-center gap-2 
                 px-3 py-1.5 rounded-lg 
                 bg-blue-500/10 text-blue-400 text-xs font-mono
                 border border-blue-500/20
                 pointer-events-none"
      title="Monitoring active in development mode"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      <span>MONITORING</span>
    </div>
  );
}

export default MonitoringProvider;
