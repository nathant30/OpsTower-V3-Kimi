/**
 * useAnalytics Hook
 * Tracks page views and custom events with privacy support
 * 
 * Usage:
 * // Basic page tracking (automatic)
 * useAnalytics();
 * 
 * // Track custom events
 * const analytics = useAnalytics();
 * analytics.trackEvent('button_click', { button: 'submit' });
 * 
 * // Check if analytics is enabled
 * if (analytics.isEnabled) {
 *   // ...
 * }
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackEvent,
  trackUserAction,
  getPrivacySettings,
  isAnalyticsEnabled,
  type AnalyticsEvent,
  type PageView,
} from '@/lib/monitoring/analytics';

export interface UseAnalyticsOptions {
  /** Whether to enable analytics */
  enabled?: boolean;
  /** Whether to track page views automatically */
  trackPageViews?: boolean;
  /** Debounce time for page view tracking (ms) */
  debounceMs?: number;
  /** Callback when page view is tracked */
  onPageView?: (pageView: PageView) => void;
  /** Callback when event is tracked */
  onEvent?: (event: AnalyticsEvent) => void;
}

export interface UseAnalyticsReturn {
  /** Whether analytics is enabled */
  isEnabled: boolean;
  /** Whether user has Do Not Track enabled */
  doNotTrack: boolean;
  /** Track a custom event */
  trackEvent: (eventName: string, params?: Record<string, string | number | boolean>) => void;
  /** Track a page view manually */
  trackPageView: (path?: string, title?: string) => void;
  /** Predefined user action tracking */
  trackUserAction: typeof trackUserAction;
}

/**
 * Hook for analytics tracking with privacy support
 */
export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    enabled = true,
    trackPageViews = true,
    debounceMs = 100,
    onPageView,
    onEvent,
  } = options;

  const location = useLocation();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTrackedPathRef = useRef<string>('');

  // Get privacy settings
  const privacySettings = getPrivacySettings();
  const canTrack = enabled && isAnalyticsEnabled();

  // Track page views
  useEffect(() => {
    if (!canTrack || !trackPageViews) return;

    const currentPath = location.pathname + location.search;

    // Debounce page view tracking
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Don't track the same path twice
      if (lastTrackedPathRef.current === currentPath) return;
      lastTrackedPathRef.current = currentPath;

      const pageView: PageView = {
        path: currentPath,
        title: document.title,
      };

      trackPageView(pageView);

      if (onPageView) {
        try {
          onPageView(pageView);
        } catch (error) {
          console.error('[useAnalytics] Error in onPageView callback:', error);
        }
      }

      // Log in development
      if (import.meta.env.DEV) {
        console.log('[Analytics] Page view:', pageView);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [location.pathname, location.search, canTrack, trackPageViews, debounceMs, onPageView]);

  // Track custom event
  const handleTrackEvent = useCallback(
    (eventName: string, params?: Record<string, string | number | boolean>) => {
      if (!canTrack) {
        if (import.meta.env.DEV) {
          console.log('[Analytics] Event skipped (tracking disabled):', eventName, params);
        }
        return;
      }

      const event: AnalyticsEvent = {
        name: eventName,
        params,
      };

      trackEvent(event);

      if (onEvent) {
        try {
          onEvent(event);
        } catch (error) {
          console.error('[useAnalytics] Error in onEvent callback:', error);
        }
      }

      if (import.meta.env.DEV) {
        console.log('[Analytics] Event:', event);
      }
    },
    [canTrack, onEvent]
  );

  // Track page view manually
  const handleTrackPageView = useCallback(
    (path?: string, title?: string) => {
      if (!canTrack) return;

      const pageView: PageView = {
        path: path || location.pathname + location.search,
        title: title || document.title,
      };

      trackPageView(pageView);

      if (onPageView) {
        try {
          onPageView(pageView);
        } catch (error) {
          console.error('[useAnalytics] Error in onPageView callback:', error);
        }
      }
    },
    [canTrack, location.pathname, location.search, onPageView]
  );

  return {
    isEnabled: canTrack,
    doNotTrack: privacySettings.doNotTrack,
    trackEvent: handleTrackEvent,
    trackPageView: handleTrackPageView,
    trackUserAction,
  };
}

/**
 * Hook for tracking specific user interactions
 */
export function useTrackInteraction(eventName: string): {
  trackClick: (elementName: string, metadata?: Record<string, unknown>) => void;
  trackHover: (elementName: string, duration?: number) => void;
  trackFocus: (elementName: string) => void;
} {
  const analytics = useAnalytics();

  const trackClick = useCallback(
    (elementName: string, metadata?: Record<string, unknown>) => {
      analytics.trackEvent(eventName, {
        action: 'click',
        element: elementName,
        ...metadata,
      });
    },
    [analytics, eventName]
  );

  const trackHover = useCallback(
    (elementName: string, duration?: number) => {
      analytics.trackEvent(eventName, {
        action: 'hover',
        element: elementName,
        ...(duration && { duration }),
      });
    },
    [analytics, eventName]
  );

  const trackFocus = useCallback(
    (elementName: string) => {
      analytics.trackEvent(eventName, {
        action: 'focus',
        element: elementName,
      });
    },
    [analytics, eventName]
  );

  return { trackClick, trackHover, trackFocus };
}

/**
 * Hook for tracking form interactions
 */
export function useTrackForm(formName: string): {
  trackFormStart: () => void;
  trackFormSubmit: (success: boolean, metadata?: Record<string, unknown>) => void;
  trackFieldInteraction: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
} {
  const analytics = useAnalytics();

  const trackFormStart = useCallback(() => {
    analytics.trackUserAction.formStart(formName);
  }, [analytics, formName]);

  const trackFormSubmit = useCallback(
    (success: boolean, metadata?: Record<string, unknown>) => {
      analytics.trackEvent('form_submit', {
        form_name: formName,
        success,
        ...metadata,
      });
    },
    [analytics, formName]
  );

  const trackFieldInteraction = useCallback(
    (fieldName: string, action: 'focus' | 'blur' | 'change') => {
      analytics.trackEvent('form_field_interaction', {
        form_name: formName,
        field_name: fieldName,
        action,
      });
    },
    [analytics, formName]
  );

  return { trackFormStart, trackFormSubmit, trackFieldInteraction };
}

/**
 * Hook for tracking search
 */
export function useTrackSearch(): {
  trackSearch: (query: string, resultsCount: number, metadata?: Record<string, unknown>) => void;
} {
  const analytics = useAnalytics();

  const trackSearch = useCallback(
    (query: string, resultsCount: number, metadata?: Record<string, unknown>) => {
      analytics.trackUserAction.search(query, resultsCount);
      
      if (metadata) {
        analytics.trackEvent('search_details', {
          query,
          results_count: resultsCount,
          ...metadata,
        });
      }
    },
    [analytics]
  );

  return { trackSearch };
}

export default useAnalytics;
