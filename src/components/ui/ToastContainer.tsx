/**
 * Toast Container Component
 * Displays notification toasts in the top-right corner
 */

import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/lib/stores/ui.store';
import { cn } from '@/lib/utils/cn';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { NotificationType } from '@/types/ui.types';

interface ToastProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles: Record<NotificationType, string> = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const toastIcons: Record<NotificationType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  const Icon = toastIcons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm',
        'transform transition-all duration-300 ease-out',
        'animate-in slide-in-from-right-full fade-in',
        toastStyles[type]
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  const handleClose = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  // Only show toast notifications (not read ones in the header dropdown)
  const toastNotifications = notifications.slice(-5); // Show max 5 at a time

  if (toastNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toastNotifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={handleClose}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
