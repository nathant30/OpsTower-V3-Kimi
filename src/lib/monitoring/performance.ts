/**
 * Performance Monitoring Utility
 * Tracks custom performance metrics and long tasks
 */

import { addBreadcrumb } from './errorTracking';

// Performance mark/measure names
const PERF_PREFIX = 'opstower:';

// Performance observer for long tasks
let longTaskObserver: PerformanceObserver | null = null;

// Active marks for nested measurements
const activeMarks = new Map<string, number>();

/**
 * Performance metric with metadata
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  unit?: 'ms' | 'bytes' | 'count';
  metadata?: Record<string, unknown>;
}

/**
 * Custom performance observer callback
 */
type PerformanceMetricCallback = (metric: PerformanceMetric) => void;

// Registered callbacks
const metricCallbacks: PerformanceMetricCallback[] = [];

/**
 * Subscribe to performance metrics
 */
export function onPerformanceMetric(callback: PerformanceMetricCallback): () => void {
  metricCallbacks.push(callback);
  return () => {
    const index = metricCallbacks.indexOf(callback);
    if (index > -1) {
      metricCallbacks.splice(index, 1);
    }
  };
}

/**
 * Report a performance metric to all subscribers
 */
function reportMetric(metric: PerformanceMetric): void {
  metricCallbacks.forEach((callback) => {
    try {
      callback(metric);
    } catch (error) {
      console.error('[Performance] Error in metric callback:', error);
    }
  });

  // Add breadcrumb for significant metrics
  if (metric.rating === 'poor') {
    addBreadcrumb({
      type: 'default',
      category: 'performance',
      message: `Poor performance: ${metric.name} = ${metric.value}${metric.unit || 'ms'}`,
      data: metric.metadata,
    });
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  // Monitor long tasks
  if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
    longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric: PerformanceMetric = {
          name: 'long-task',
          value: entry.duration,
          rating: entry.duration > 200 ? 'poor' : entry.duration > 50 ? 'needs-improvement' : 'good',
          unit: 'ms',
          metadata: {
            startTime: entry.startTime,
            attribution: (entry as unknown as { attribution?: Array<{ containerSrc?: string }> }).attribution?.[0]?.containerSrc || 'unknown',
          },
        };
        reportMetric(metric);

        // Log in development
        if (import.meta.env.DEV) {
          console.warn('[Performance] Long task detected:', entry.duration.toFixed(2), 'ms');
        }
      }
    });

    longTaskObserver.observe({ type: 'longtask', buffered: true });
  }

  // Monitor resource loading
  if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        // Report slow resources
        if (entry.duration > 1000) {
          const metric: PerformanceMetric = {
            name: 'slow-resource',
            value: entry.duration,
            rating: entry.duration > 3000 ? 'poor' : 'needs-improvement',
            unit: 'ms',
            metadata: {
              url: entry.name,
              initiatorType: entry.initiatorType,
              transferSize: entry.transferSize,
            },
          };
          reportMetric(metric);
        }
      }
    });

    try {
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch {
      // Some browsers don't support resource observation
    }
  }

  // Report navigation timing
  reportNavigationTiming();
}

/**
 * Report navigation timing metrics
 */
function reportNavigationTiming(): void {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return;

  const metrics: PerformanceMetric[] = [
    {
      name: 'dns-lookup',
      value: navigation.domainLookupEnd - navigation.domainLookupStart,
      rating: 'good', // Will be evaluated by consumer
      unit: 'ms',
    },
    {
      name: 'tcp-connect',
      value: navigation.connectEnd - navigation.connectStart,
      rating: 'good',
      unit: 'ms',
    },
    {
      name: 'server-response',
      value: navigation.responseEnd - navigation.responseStart,
      rating: 'good',
      unit: 'ms',
    },
    {
      name: 'dom-interactive',
      value: navigation.domInteractive,
      rating: 'good',
      unit: 'ms',
    },
    {
      name: 'dom-complete',
      value: navigation.domComplete,
      rating: 'good',
      unit: 'ms',
    },
    {
      name: 'load-complete',
      value: navigation.loadEventEnd - navigation.startTime,
      rating: 'good',
      unit: 'ms',
    },
  ];

  metrics.forEach((metric) => {
    // Apply thresholds
    if (metric.value > 3000) metric.rating = 'poor';
    else if (metric.value > 1000) metric.rating = 'needs-improvement';

    reportMetric(metric);
  });
}

/**
 * Start a performance measurement
 */
export function startMeasure(name: string): void {
  const fullName = `${PERF_PREFIX}${name}`;
  const startTime = performance.now();
  
  activeMarks.set(fullName, startTime);
  
  try {
    performance.mark(`${fullName}-start`);
  } catch {
    // Mark might already exist
  }
}

/**
 * End a performance measurement and report it
 */
export function endMeasure(name: string, metadata?: Record<string, unknown>): number {
  const fullName = `${PERF_PREFIX}${name}`;
  const endTime = performance.now();
  const startTime = activeMarks.get(fullName);

  if (!startTime) {
    console.warn(`[Performance] No active measurement for: ${name}`);
    return 0;
  }

  activeMarks.delete(fullName);

  const duration = endTime - startTime;

  // Create performance measure
  try {
    performance.mark(`${fullName}-end`);
    performance.measure(fullName, `${fullName}-start`, `${fullName}-end`);
  } catch {
    // Measures might already exist
  }

  // Report metric
  const metric: PerformanceMetric = {
    name,
    value: duration,
    rating: duration > 1000 ? 'poor' : duration > 100 ? 'needs-improvement' : 'good',
    unit: 'ms',
    metadata,
  };
  reportMetric(metric);

  return duration;
}

/**
 * Measure function execution time
 */
export function measureFunction<T extends (...args: unknown[]) => unknown>(
  name: string,
  fn: T,
  options?: { logInDev?: boolean }
): T {
  return ((...args: unknown[]) => {
    startMeasure(name);
    const result = fn(...args);
    
    const finalize = () => {
      const duration = endMeasure(name);
      if (options?.logInDev && import.meta.env.DEV) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
    };

    if (result instanceof Promise) {
      return result.finally(finalize) as ReturnType<T>;
    }

    finalize();
    return result;
  }) as T;
}

/**
 * React component render timing helper
 */
export function measureRender(componentName: string): () => void {
  startMeasure(`render:${componentName}`);
  return () => {
    const duration = endMeasure(`render:${componentName}`, { component: componentName });
    
    // Log slow renders in development
    if (import.meta.env.DEV && duration > 16) {
      console.warn(`[Performance] Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Measure React hook execution
 */
export function measureHook(hookName: string, phase: 'mount' | 'update' | 'unmount'): () => void {
  startMeasure(`hook:${hookName}:${phase}`);
  return () => {
    endMeasure(`hook:${hookName}:${phase}`, { hook: hookName, phase });
  };
}

/**
 * Report memory usage (if available)
 */
export function reportMemoryUsage(): void {
  const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
  
  if (!memory) return;

  const usedMB = memory.usedJSHeapSize / (1024 * 1024);
  const totalMB = memory.totalJSHeapSize / (1024 * 1024);

  reportMetric({
    name: 'memory-used',
    value: Math.round(usedMB),
    rating: usedMB > 200 ? 'poor' : usedMB > 100 ? 'needs-improvement' : 'good',
    unit: 'bytes',
    metadata: { total: Math.round(totalMB) },
  });
}

/**
 * Clean up performance observers
 */
export function cleanupPerformanceMonitoring(): void {
  if (longTaskObserver) {
    longTaskObserver.disconnect();
    longTaskObserver = null;
  }
}
