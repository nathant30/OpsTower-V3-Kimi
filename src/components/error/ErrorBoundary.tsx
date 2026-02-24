/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */

import { Component, type ReactNode, type ErrorInfo, useState, useCallback } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    this.props.onError?.(error, errorInfo);

    if (import.meta.env.PROD && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <XpressCard
              title="Something Went Wrong"
              icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
            >
              <div className="space-y-6">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 font-medium">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                  {import.meta.env.DEV && this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                        View Error Details (Development Only)
                      </summary>
                      <pre className="mt-2 p-3 bg-[#0f0f14] rounded text-xs text-gray-400 overflow-auto max-h-64">
                        {this.state.error?.stack}
                        {'\n\nComponent Stack:\n'}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={this.handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={this.handleReload}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button variant="ghost" onClick={this.handleGoHome}>
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                {import.meta.env.PROD && (
                  <div className="text-center text-sm text-gray-500">
                    <p>If this problem persists, please contact support.</p>
                    <p className="mt-1">Error ID: {Math.random().toString(36).substring(2, 15)}</p>
                  </div>
                )}
              </div>
            </XpressCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Feature Error Boundary
 */
export function FeatureErrorBoundary({ 
  children, 
  featureName = 'Feature' 
}: { 
  children: ReactNode; 
  featureName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <XpressCard
            title={`${featureName} Error`}
            icon={<Bug className="w-5 h-5 text-orange-500" />}
          >
            <p className="text-gray-400 mb-4">
              Failed to load {featureName.toLowerCase()}. Please try refreshing.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </XpressCard>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Hook for async error handling
 */
export function useAsyncError() {
  const [, setError] = useState<Error | null>(null);
  return useCallback((error: Error) => {
    setError(() => { throw error; });
  }, []);
}

export default ErrorBoundary;
