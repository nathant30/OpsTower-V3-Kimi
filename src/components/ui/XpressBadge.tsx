import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type XpressBadgeVariant = 
  | 'active' 
  | 'warning' 
  | 'alert' 
  | 'info' 
  | 'offline'
  | 'idle'
  | 'default';

export interface XpressBadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Badge variant */
  variant?: XpressBadgeVariant;
  /** Badge size */
  size?: 'sm' | 'md';
  /** Whether to show pulse animation */
  pulse?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional dot indicator color (overrides variant default) */
  dotColor?: string;
}

const variantClasses: Record<XpressBadgeVariant, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  alert: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  idle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  default: 'bg-white/10 text-white border-white/10',
};

const variantDotColors: Record<XpressBadgeVariant, string> = {
  active: 'bg-green-400',
  warning: 'bg-amber-400',
  alert: 'bg-red-400',
  info: 'bg-blue-400',
  offline: 'bg-gray-400',
  idle: 'bg-amber-400',
  default: 'bg-white',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

/**
 * XpressBadge - Status badges for OpsTower
 * 
 * Status Variants:
 * - active: Green (online, running, success)
 * - warning: Amber (caution, attention needed)
 * - alert: Red (error, critical, offline)
 * - info: Blue (information, processing)
 * - offline: Gray (inactive, disconnected)
 * - idle: Amber/Yellow (standby, waiting)
 * 
 * Features:
 * - Pulse animation for live states
 * - Dot indicator
 * 
 * @example
 * <XpressBadge variant="active" pulse>Live</XpressBadge>
 * <XpressBadge variant="alert">Error</XpressBadge>
 */
export function XpressBadge({
  children,
  variant = 'default',
  size = 'sm',
  pulse = false,
  className,
  dotColor,
}: XpressBadgeProps) {
  const dotClass = dotColor || variantDotColors[variant];

  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center',
        'rounded-full font-medium',
        'border',
        // Variant styles
        variantClasses[variant],
        // Size styles
        sizeClasses[size],
        className
      )}
    >
      {/* Pulse dot */}
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotClass
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-1.5 w-1.5',
            dotClass
          )}
        />
      </span>
      <span>{children}</span>
    </span>
  );
}

export default XpressBadge;
