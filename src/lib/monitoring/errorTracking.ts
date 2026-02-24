/**
 * Error Tracking Utility
 * Centralized error tracking with support for external services
 * 
 * PLACEHOLDER: Configure Sentry or other error tracking service here
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/react @sentry/browser
 * 2. Uncomment Sentry configuration below
 * 3. Add your DSN from Sentry dashboard
 */

import type { ReactNode } from 'react';

// Error severity levels
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Error context for additional debugging info
export interface ErrorContext {
  [key: string]: unknown;
}

// User info for error tracking
export interface ErrorUser {
  id?: string;
  username?: string;
  email?: string;
}

// Breadcrumb for error trail
export interface Breadcrumb {
  type?: 'default' | 'navigation' | 'http' | 'error' | 'ui';
  message: string;
  category?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

// Error tracking configuration
interface ErrorTrackerConfig {
  dsn?: string;
  environment: string;
  release?: string;
  sampleRate: number;
  enabled: boolean;
}

// Default configuration
const config: ErrorTrackerConfig = {
  environment: import.meta.env.MODE || 'development',
  sampleRate: 1.0,
  enabled: import.meta.env.PROD,
};

/**
 * Initialize error tracking
 * Call this in your app entry point
 */
export function initErrorTracking(): void {
  if (!config.enabled) {
    console.log('[ErrorTracking] Disabled in development mode');
    return;
  }

  // ============================================
  // PLACEHOLDER: Sentry Integration
  // ============================================
  // import * as Sentry from '@sentry/react';
  // import { BrowserTracing } from '@sentry/browser';
  //
  // Sentry.init({
  //   dsn: 'YOUR_SENTRY_DSN_HERE',
  //   environment: config.environment,
  //   release: config.release,
  //   sampleRate: config.sampleRate,
  //   integrations: [
  //     new BrowserTracing(),
  //   ],
  //   tracesSampleRate: 0.1,
  // });
  // console.log('[ErrorTracking] Sentry initialized');
  // ============================================

  // Setup global error handlers
  setupGlobalErrorHandlers();
}

/**
 * Setup global error handlers for uncaught errors and unhandled rejections
 */
function setupGlobalErrorHandlers(): void {
  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    captureException(event.error || new Error(event.message), {
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    captureException(error, {
      context: { type: 'unhandledrejection' },
    });
  });
}

/**
 * Capture an exception/error
 */
export function captureException(
  error: Error,
  options?: { severity?: ErrorSeverity; context?: ErrorContext }
): void {
  const { severity = 'error', context } = options || {};

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[ErrorTracking]', severity, error.message, context);
    console.error(error);
  }

  if (!config.enabled) return;

  // ============================================
  // PLACEHOLDER: Sentry captureException
  // ============================================
  // Sentry.withScope((scope) => {
  //   scope.setLevel(severity);
  //   if (context) {
  //     Object.entries(context).forEach(([key, value]) => {
  //       scope.setExtra(key, value);
  //     });
  //   }
  //   Sentry.captureException(error);
  // });
  // ============================================
}

/**
 * Capture a message (for non-error events)
 */
export function captureMessage(
  message: string,
  options?: { severity?: ErrorSeverity; context?: ErrorContext }
): void {
  const { severity = 'info', context } = options || {};

  if (import.meta.env.DEV) {
    console.log('[ErrorTracking]', severity, message, context);
  }

  if (!config.enabled) return;

  // ============================================
  // PLACEHOLDER: Sentry captureMessage
  // ============================================
  // Sentry.withScope((scope) => {
  //   scope.setLevel(severity);
  //   if (context) {
  //     Object.entries(context).forEach(([key, value]) => {
  //       scope.setExtra(key, value);
  //     });
  //   }
  //   Sentry.captureMessage(message);
  // });
  // ============================================
}

/**
 * Set user context for error tracking
 */
export function setUser(user: ErrorUser | null): void {
  if (import.meta.env.DEV) {
    console.log('[ErrorTracking] Set user:', user);
  }

  if (!config.enabled) return;

  // ============================================
  // PLACEHOLDER: Sentry setUser
  // ============================================
  // if (user) {
  //   Sentry.setUser(user);
  // } else {
  //   Sentry.setUser(null);
  // }
  // ============================================
}

/**
 * Add breadcrumb for error trail
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  if (!config.enabled) return;

  // ============================================
  // PLACEHOLDER: Sentry addBreadcrumb
  // ============================================
  // Sentry.addBreadcrumb({
  //   ...breadcrumb,
  //   timestamp: breadcrumb.timestamp || Date.now() / 1000,
  // });
  // ============================================
}

/**
 * Set tags for filtering in error tracker
 */
export function setTag(key: string, value: string): void {
  if (!config.enabled) return;

  // ============================================
  // PLACEHOLDER: Sentry setTag
  // ============================================
  // Sentry.setTag(key, value);
  // ============================================
}

/**
 * Set extra context data
 */
export function setExtra(key: string, value: unknown): void {
  if (!config.enabled) return;

  // ============================================
  // PLACEHOLDER: Sentry setExtra
  // ============================================
  // Sentry.setExtra(key, value);
  // ============================================
}

/**
 * Error Boundary fallback component props
 */
export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Create error boundary component
 * PLACEHOLDER: Use Sentry.ErrorBoundary when Sentry is configured
 */
export function createErrorBoundary(_options?: {
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
  onError?: (error: Error, errorInfo: unknown) => void;
}): React.FC<{ children: ReactNode }> {
  // ============================================
  // PLACEHOLDER: Sentry ErrorBoundary
  // ============================================
  // return Sentry.withErrorBoundary(
  //   ({ children }: { children: ReactNode }) => children,
  //   options || {}
  // );
  // ============================================
  
  // Return a simple passthrough component for now
  return ({ children }: { children: ReactNode }) => children;
}

/**
 * Configure error tracking (call before init)
 */
export function configureErrorTracking(options: Partial<ErrorTrackerConfig>): void {
  Object.assign(config, options);
}
