import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'active' | 'idle' | 'offline' | 'alert' | 'warning' | 'success' | 'busy';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-xpress-bg-elevated text-xpress-text-secondary',
    active: 'bg-xpress-status-active/20 text-xpress-status-active',
    idle: 'bg-xpress-status-idle/20 text-xpress-status-idle',
    offline: 'bg-xpress-text-muted/20 text-xpress-text-muted',
    alert: 'bg-xpress-status-alert/20 text-xpress-status-alert',
    warning: 'bg-xpress-status-warning/20 text-xpress-status-warning',
    success: 'bg-green-500/20 text-green-400',
    busy: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
