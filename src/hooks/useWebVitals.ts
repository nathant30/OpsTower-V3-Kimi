/**
 * useWebVitals Hook
 * Measures and logs Core Web Vitals
 * 
 * Usage:
 * // Basic usage in App component
 * useWebVitals();
 * 
 * // With custom handler
 * useWebVitals({
 *   onReport: (metric) => {
 *     console.log(`${metric.name}: ${metric.value}`);
 *   }
 * });
 */

import { useEffect, useCallback, useRef } from 'react';
import type { WebVitalsMetric } from '@/lib/monitoring/webVitals';
import { getAllWebVitals } from '@/lib/monitoring/webVitals';

// Rating thresholds for console styling
const RATING_STYLES = {
  good: 'color: #0c6;',
  'needs-improvement': 'color: #fa3;',
  poor: 'color: #f33; font-weight: bold;',
};

// Rating emojis
const RATING_EMOJIS = {
  good: '✅',
  'needs-improvement': '⚠️',
  poor: '❌',
};

// Metric descriptions
const METRIC_DESCRIPTIONS: Record<string, string> = {
  CLS: 'Cumulative Layout Shift (visual stability)',
  FCP: 'First Contentful Paint (initial paint)',
  FID: 'First Input Delay (interactivity)',
  INP: 'Interaction to Next Paint (responsiveness)',
  LCP: 'Largest Contentful Paint (loading)',
  TTFB: 'Time to First Byte (server response)',
};

// Metric units
const METRIC_UNITS: Record<string, string> = {
  CLS: '',
  FCP: 'ms',
  FID: 'ms',
  INP: 'ms',
  LCP: 'ms',
  TTFB: 'ms',
};

export interface UseWebVitalsOptions {
  /** Whether to enable Web Vitals tracking */
  enabled?: boolean;
  /** Custom report handler */
  onReport?: (metric: WebVitalsMetric) => void;
  /** Whether to log to console (defaults to true in DEV) */
  logToConsole?: boolean;
  /** Whether to report to analytics service */
  reportToAnalytics?: boolean;
}

/**
 * Hook for tracking Core Web Vitals
 */
export function useWebVitals(options: UseWebVitalsOptions = {}): void {
  const {
    enabled = true,
    onReport,
    logToConsole = import.meta.env.DEV,
    reportToAnalytics = false,
  } = options;

  const reportedMetrics = useRef<Set<string>>(new Set());

  // Default report handler
  const handleReport = useCallback(
    (metric: WebVitalsMetric) => {
      // Prevent duplicate reports for the same metric
      const key = `${metric.name}-${metric.value}`;
      if (reportedMetrics.current.has(key)) return;
      reportedMetrics.current.add(key);

      // Log to console in development
      if (logToConsole) {
        logMetricToConsole(metric);
      }

      // Report to custom handler
      if (onReport) {
        try {
          onReport(metric);
        } catch (error) {
          console.error('[useWebVitals] Error in onReport handler:', error);
        }
      }

      // Report to analytics service
      if (reportToAnalytics && import.meta.env.PROD) {
        reportToAnalyticsService(metric);
      }
    },
    [logToConsole, onReport, reportToAnalytics]
  );

  // Initialize Web Vitals tracking
  useEffect(() => {
    if (!enabled) return;

    // Wait for page to be interactive
    if (document.readyState === 'loading') {
      const handleLoad = () => {
        const cleanup = getAllWebVitals(handleReport);
        return cleanup;
      };
      window.addEventListener('DOMContentLoaded', handleLoad);
      return () => window.removeEventListener('DOMContentLoaded', handleLoad);
    }

    // Page already loaded
    const cleanup = getAllWebVitals(handleReport);
    return cleanup;
  }, [enabled, handleReport]);
}

/**
 * Log metric to console with styling
 */
function logMetricToConsole(metric: WebVitalsMetric): void {
  const emoji = RATING_EMOJIS[metric.rating];
  const style = RATING_STYLES[metric.rating];
  const description = METRIC_DESCRIPTIONS[metric.name];
  const unit = METRIC_UNITS[metric.name];
  const value = metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value);

  console.groupCollapsed(
    `%c${emoji} ${metric.name}: ${value}${unit} (${metric.rating})`,
    style
  );
  console.log(`Description: ${description}`);
  console.log(`Value: ${value}${unit}`);
  console.log(`Rating: ${metric.rating}`);
  
  if (import.meta.env.DEV && metric.entries) {
    console.log('Entries:', metric.entries);
  }
  
  console.groupEnd();
}

/**
 * Report metric to analytics service
 * PLACEHOLDER: Send to your analytics service
 */
function reportToAnalyticsService(metric: WebVitalsMetric): void {
  // ============================================
  // PLACEHOLDER: Send to analytics service
  // ============================================
  // Example with GA4:
  // if (window.gtag) {
  //   window.gtag('event', 'web_vitals', {
  //     event_category: 'Web Vitals',
  //     event_label: metric.name,
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     custom_parameter_1: metric.rating,
  //   });
  // }
  //
  // Example with custom API:
  // fetch('/api/metrics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     name: metric.name,
  //     value: metric.value,
  //     rating: metric.rating,
  //     path: window.location.pathname,
  //     timestamp: Date.now(),
  //   }),
  // }).catch(() => {});
  // ============================================
}

/**
 * Hook for measuring component render performance
 */
export function useComponentPerformance(componentName: string): {
  markRenderStart: () => void;
  markRenderEnd: () => void;
} {
  const startTimeRef = useRef<number>(0);

  const markRenderStart = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const markRenderEnd = useCallback(() => {
    if (startTimeRef.current === 0) return;

    const duration = performance.now() - startTimeRef.current;
    startTimeRef.current = 0;

    // Log slow renders
    if (import.meta.env.DEV && duration > 16) {
      console.warn(
        `[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }
  }, [componentName]);

  return { markRenderStart, markRenderEnd };
}

export default useWebVitals;
