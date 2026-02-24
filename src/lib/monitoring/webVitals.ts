/**
 * Web Vitals Monitoring Utility
 * Tracks Core Web Vitals: LCP, FID, CLS, TTFB, FCP
 * Compatible with Google Core Web Vitals
 */

/**
 * LayoutShift interface for Cumulative Layout Shift (CLS) tracking
 */
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  navigationType?: string;
}

// Rating thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

type OnReportCallback = (metric: WebVitalsMetric) => void;
type OnReportCLSCallback = (metric: WebVitalsMetric & { name: 'CLS' }) => void;
type OnReportFCPCallback = (metric: WebVitalsMetric & { name: 'FCP' }) => void;
type OnReportFIDCallback = (metric: WebVitalsMetric & { name: 'FID' }) => void;
type OnReportINPCallback = (metric: WebVitalsMetric & { name: 'INP' }) => void;
type OnReportLCPCallback = (metric: WebVitalsMetric & { name: 'LCP' }) => void;
type OnReportTTFBCallback = (metric: WebVitalsMetric & { name: 'TTFB' }) => void;

/**
 * Get rating based on value and thresholds
 */
function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report handler that processes and reports metrics
 */
function reportHandler(
  name: WebVitalsMetric['name'],
  value: number,
  entries: PerformanceEntry[],
  onReport: OnReportCallback
): void {
  const metric: WebVitalsMetric = {
    name,
    value,
    rating: getRating(name, value),
    entries,
  };

  onReport(metric);
}

/**
 * Report Cumulative Layout Shift (CLS)
 * Measures visual stability - lower is better
 */
export function onCLS(onReport: OnReportCLSCallback): () => void {
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Only count if shift was not recently input-driven
      if (!(entry as LayoutShift & { hadRecentInput: boolean }).hadRecentInput) {
        sessionValue += (entry as LayoutShift).value;
        sessionEntries.push(entry);
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });

  // Report final value when page is hidden or unloaded
  const report = () => {
    if (sessionEntries.length > 0) {
      reportHandler('CLS', sessionValue, sessionEntries, onReport as OnReportCallback);
    }
  };

  // Report when page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      report();
    }
  });

  // Report on page unload
  window.addEventListener('pagehide', report);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', report);
    window.removeEventListener('pagehide', report);
  };
}

/**
 * Report Largest Contentful Paint (LCP)
 * Measures loading performance - lower is better
 */
export function onLCP(onReport: OnReportLCPCallback): () => void {
  const entries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    const lcpEntry = list.getEntries().at(-1);
    if (lcpEntry) {
      entries.push(lcpEntry);
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });

  // Report when page is hidden
  const report = () => {
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      reportHandler('LCP', lastEntry.startTime, entries, onReport as OnReportCallback);
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      report();
    }
  });

  window.addEventListener('pagehide', report);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', report);
    window.removeEventListener('pagehide', report);
  };
}

/**
 * Report First Input Delay (FID)
 * Measures interactivity - lower is better
 * Note: FID is being replaced by INP in 2024
 */
export function onFID(onReport: OnReportFIDCallback): () => void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEventTiming;
      const delay = fidEntry.processingStart - fidEntry.startTime;
      reportHandler('FID', delay, [entry], onReport as OnReportCallback);
    }
  });

  observer.observe({ type: 'first-input', buffered: true });

  return () => observer.disconnect();
}

/**
 * Report Interaction to Next Paint (INP)
 * Measures overall responsiveness - lower is better
 * Replacing FID as a Core Web Vital in 2024
 */
export function onINP(onReport: OnReportINPCallback): () => void {
  const entries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      entries.push(entry);
    }
  });

  observer.observe({ type: 'event', buffered: true } as PerformanceObserverInit);

  // Report when page is hidden
  const report = () => {
    if (entries.length > 0) {
      // Find the entry with the longest duration
      const maxEntry = entries.reduce((max, entry) => {
        const maxDuration = (max as PerformanceEventTiming).duration;
        const entryDuration = (entry as PerformanceEventTiming).duration;
        return entryDuration > maxDuration ? entry : max;
      });
      
      reportHandler(
        'INP',
        (maxEntry as PerformanceEventTiming).duration,
        entries,
        onReport as OnReportCallback
      );
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      report();
    }
  });

  window.addEventListener('pagehide', report);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', report);
    window.removeEventListener('pagehide', report);
  };
}

/**
 * Report First Contentful Paint (FCP)
 * Measures initial paint time - lower is better
 */
export function onFCP(onReport: OnReportFCPCallback): () => void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        reportHandler('FCP', entry.startTime, [entry], onReport as OnReportCallback);
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });

  return () => observer.disconnect();
}

/**
 * Report Time to First Byte (TTFB)
 * Measures server response time - lower is better
 */
export function onTTFB(onReport: OnReportTTFBCallback): () => void {
  // Use navigation timing API
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const value = navigation.responseStart;
    reportHandler('TTFB', value, [navigation], onReport as OnReportCallback);
  }

  // Also observe future navigations (for SPAs)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const navEntry = entry as PerformanceNavigationTiming;
      const value = navEntry.responseStart;
      reportHandler('TTFB', value, [entry], onReport as OnReportCallback);
    }
  });

  observer.observe({ type: 'navigation', buffered: true });

  return () => observer.disconnect();
}

/**
 * Get all Web Vitals at once
 */
export function getAllWebVitals(onReport: OnReportCallback): () => void {
  const disposers: Array<() => void> = [];

  disposers.push(onCLS(onReport as OnReportCLSCallback));
  disposers.push(onLCP(onReport as OnReportLCPCallback));
  disposers.push(onFID(onReport as OnReportFIDCallback));
  disposers.push(onINP(onReport as OnReportINPCallback));
  disposers.push(onFCP(onReport as OnReportFCPCallback));
  disposers.push(onTTFB(onReport as OnReportTTFBCallback));

  return () => disposers.forEach((dispose) => dispose());
}
