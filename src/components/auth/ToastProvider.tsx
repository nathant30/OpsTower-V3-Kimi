/**
 * ToastProvider Component
 *
 * Provides toast notification functionality for the application.
 * Listens for custom toast events and displays them.
 */

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface ToastEventDetail {
  message: ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-green-500/10 border-green-500/30 text-green-500',
  error: 'bg-xpress-accent-red/10 border-xpress-accent-red/30 text-xpress-accent-red',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  info: 'bg-xpress-accent-blue/10 border-xpress-accent-blue/30 text-xpress-accent-blue',
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[500px]',
        'animate-in slide-in-from-right-full fade-in duration-300',
        STYLES[toast.type]
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * ToastProvider - Renders toast notifications
 *
 * Place this component at the root of your app to display toast notifications.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastEventDetail>;
      const { message, type, duration } = customEvent.detail;

      const newToast: Toast = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('opstower:toast', handleToast);

    return () => {
      window.removeEventListener('opstower:toast', handleToast);
    };
  }, []);

  return (
    <>
      {children}
      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Toast notification utility
 * Dispatch custom events to show toast notifications
 */
export const toast = {
  success: (message: ReactNode, duration = 3000) => {
    window.dispatchEvent(
      new CustomEvent('opstower:toast', {
        detail: { message, type: 'success', duration },
      })
    );
  },
  error: (message: ReactNode, duration = 5000) => {
    window.dispatchEvent(
      new CustomEvent('opstower:toast', {
        detail: { message, type: 'error', duration },
      })
    );
  },
  warning: (message: ReactNode, duration = 4000) => {
    window.dispatchEvent(
      new CustomEvent('opstower:toast', {
        detail: { message, type: 'warning', duration },
      })
    );
  },
  info: (message: ReactNode, duration = 3000) => {
    window.dispatchEvent(
      new CustomEvent('opstower:toast', {
        detail: { message, type: 'info', duration },
      })
    );
  },
};

export default ToastProvider;
