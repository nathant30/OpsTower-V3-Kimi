/**
 * Analytics Utility
 * Page view tracking, custom event tracking with privacy support
 * 
 * PLACEHOLDER: Configure Google Analytics 4 or Plausible here
 * 
 * To enable Google Analytics 4:
 * 1. Uncomment GA4 configuration below
 * 2. Add your GA4 Measurement ID (G-XXXXXXXXXX)
 * 
 * To enable Plausible Analytics:
 * 1. Add Plausible script to your index.html
 * 2. Uncomment Plausible integration below
 */

import { addBreadcrumb } from './errorTracking';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
}

export interface PageView {
  path: string;
  title?: string;
  referrer?: string;
}

// User privacy preferences
interface PrivacySettings {
  doNotTrack: boolean;
  analyticsEnabled: boolean;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
  // GA4 Measurement ID
  ga4MeasurementId?: string;
  // Plausible domain
  plausibleDomain?: string;
}

// Default configuration
const config: AnalyticsConfig = {
  enabled: typeof import.meta.env !== 'undefined' ? import.meta.env.PROD : false,
  anonymizeIp: true,
  respectDoNotTrack: true,
};

// Current privacy settings
let privacySettings: PrivacySettings = {
  doNotTrack: false,
  analyticsEnabled: true,
};

/**
 * Check if Do Not Track is enabled
 */
function checkDoNotTrack(): boolean {
  return (
    navigator.doNotTrack === '1' ||
    navigator.doNotTrack === 'yes' ||
    (window as unknown as { doNotTrack?: string }).doNotTrack === '1'
  );
}

/**
 * Initialize analytics
 */
export function initAnalytics(options?: Partial<AnalyticsConfig>): void {
  Object.assign(config, options);

  // Check privacy settings
  privacySettings.doNotTrack = checkDoNotTrack();
  privacySettings.analyticsEnabled = !config.respectDoNotTrack || !privacySettings.doNotTrack;

  if (import.meta.env.DEV) {
    console.log('[Analytics] Initialized (disabled in development)');
    console.log('[Analytics] Privacy settings:', privacySettings);
    return;
  }

  if (!privacySettings.analyticsEnabled) {
    console.log('[Analytics] Disabled due to user privacy preferences');
    return;
  }

  // ============================================
  // PLACEHOLDER: Google Analytics 4 Initialization
  // ============================================
  // if (config.ga4MeasurementId) {
  //   // Load GA4 script
  //   const script = document.createElement('script');
  //   script.async = true;
  //   script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}`;
  //   document.head.appendChild(script);
  //
  //   // Initialize data layer
  //   window.dataLayer = window.dataLayer || [];
  //   window.gtag = function gtag(...args: unknown[]) {
  //     window.dataLayer.push(args);
  //   };
  //   window.gtag('js', new Date());
  //   window.gtag('config', config.ga4MeasurementId, {
  //     anonymize_ip: config.anonymizeIp,
  //     send_page_view: false, // We'll handle page views manually
  //   });
  //   console.log('[Analytics] Google Analytics 4 initialized');
  // }
  // ============================================

  // ============================================
  // PLACEHOLDER: Plausible Analytics Initialization
  // ============================================
  // Plausible is typically loaded via script tag in index.html
  // Uncomment below to enable manual page tracking
  //
  // if (config.plausibleDomain && window.plausible) {
  //   console.log('[Analytics] Plausible initialized');
  // }
  // ============================================

  // Track initial page view
  trackPageView({
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
  });
}

/**
 * Track a page view
 */
export function trackPageView(pageView: PageView): void {
  if (!shouldTrack()) return;

  const data = {
    path: pageView.path,
    title: pageView.title || document.title,
    referrer: pageView.referrer || document.referrer,
    timestamp: Date.now(),
  };

  // Log in development
  if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
    console.log('[Analytics] Page view:', data);
    return;
  }

  // Add breadcrumb for error tracking context
  addBreadcrumb({
    type: 'navigation',
    category: 'page-view',
    message: `Navigated to ${data.path}`,
    data,
  });

  // ============================================
  // PLACEHOLDER: Google Analytics 4 Page View
  // ============================================
  // if (window.gtag && config.ga4MeasurementId) {
  //   window.gtag('event', 'page_view', {
  //     page_location: window.location.href,
  //     page_path: data.path,
  //     page_title: data.title,
  //     send_to: config.ga4MeasurementId,
  //   });
  // }
  // ============================================

  // ============================================
  // PLACEHOLDER: Plausible Page View
  // ============================================
  // if (window.plausible) {
  //   window.plausible('pageview', { u: window.location.href });
  // }
  // ============================================
}

/**
 * Track a custom event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!shouldTrack()) return;

  // Log in development
  if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
    console.log('[Analytics] Event:', event.name, event.params);
    return;
  }

  // Add breadcrumb for error tracking context
  addBreadcrumb({
    type: 'ui',
    category: 'analytics-event',
    message: `Event: ${event.name}`,
    data: event.params,
  });

  // ============================================
  // PLACEHOLDER: Google Analytics 4 Event
  // ============================================
  // if (window.gtag && config.ga4MeasurementId) {
  //   window.gtag('event', event.name, {
  //     ...event.params,
  //     send_to: config.ga4MeasurementId,
  //   });
  // }
  // ============================================

  // ============================================
  // PLACEHOLDER: Plausible Custom Event
  // ============================================
  // if (window.plausible) {
  //   window.plausible(event.name, { props: event.params });
  // }
  // ============================================
}

/**
 * Track user actions with predefined event names
 */
export const trackUserAction = {
  // Navigation
  navigate: (to: string, from?: string) => {
    trackEvent({
      name: 'navigate',
      params: { to, from: from || '' },
    });
  },

  // Feature usage
  featureUsed: (feature: string, action: string) => {
    trackEvent({
      name: 'feature_used',
      params: { feature, action },
    });
  },

  // Errors (non-fatal)
  error: (errorType: string, message: string) => {
    trackEvent({
      name: 'error',
      params: { error_type: errorType, message },
    });
  },

  // Search
  search: (query: string, resultsCount: number) => {
    trackEvent({
      name: 'search',
      params: { search_term: query, results_count: resultsCount },
    });
  },

  // Form interactions
  formStart: (formName: string) => {
    trackEvent({
      name: 'form_start',
      params: { form_name: formName },
    });
  },

  formSubmit: (formName: string, success: boolean) => {
    trackEvent({
      name: 'form_submit',
      params: { form_name: formName, success },
    });
  },

  // E-commerce / Transaction tracking
  transaction: (transactionId: string, value: number, currency: string = 'USD') => {
    trackEvent({
      name: 'purchase',
      params: {
        transaction_id: transactionId,
        value,
        currency,
      },
    });
  },

  // Engagement
  engagement: (action: string, label?: string, value?: number) => {
    const params: Record<string, string | number> = { action };
    if (label) params.label = label;
    if (value !== undefined) params.value = value;
    trackEvent({ name: 'engagement', params });
  },
};

/**
 * Check if tracking should occur
 */
function shouldTrack(): boolean {
  if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) return true; // Allow logging in dev
  if (!config.enabled) return false;
  if (!privacySettings.analyticsEnabled) return false;
  return true;
}

/**
 * Get current privacy settings
 */
export function getPrivacySettings(): PrivacySettings {
  return { ...privacySettings };
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return shouldTrack();
}

/**
 * Opt out of tracking
 */
export function optOut(): void {
  privacySettings.analyticsEnabled = false;
  
  // ============================================
  // PLACEHOLDER: GA4 Opt-out
  // ============================================
  // window['ga-disable-' + config.ga4MeasurementId] = true;
  // ============================================

  console.log('[Analytics] User opted out of tracking');
}

/**
 * Opt in to tracking
 */
export function optIn(): void {
  privacySettings.analyticsEnabled = true;
  console.log('[Analytics] User opted in to tracking');
}

// Extend Window interface for analytics
declare global {
  interface Window {
    // GA4
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    // Plausible
    plausible?: (event: string, options?: Record<string, unknown>) => void;
  }
}
