import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface XpressCardProps {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Optional badge text */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'success' | 'warning' | 'alert' | 'info';
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the card has hover effects */
  hoverable?: boolean;
  /** Optional header action (button, link, etc.) */
  headerAction?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Optional icon to display next to title */
  icon?: ReactNode;
}

const sizeClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const badgeClasses = {
  default: 'bg-white/10 text-white',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  alert: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

/**
 * XpressCard - Unified card component for OpsTower
 * 
 * Default styling: bg-[#12121a] border border-white/10 rounded-xl
 * Hover effect: hover:border-white/20
 * 
 * @example
 * <XpressCard title="Fleet Status" badge="Live" badgeVariant="success">
 *   <div>Content here</div>
 * </XpressCard>
 */
export function XpressCard({
  title,
  subtitle,
  children,
  className,
  onClick,
  badge,
  badgeVariant = 'default',
  size = 'md',
  hoverable = false,
  headerAction,
  footer,
  icon,
}: XpressCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        // Base styles - dark command center aesthetic
        'bg-[#12121a] border border-white/10 rounded-xl',
        'transition-all duration-200',
        // Hover effects
        (hoverable || isClickable) && 'hover:border-white/20',
        isClickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Header */}
      {(title || badge || headerAction) && (
        <div className={cn(
          'flex items-start justify-between gap-4',
          sizeClasses[size]
        )}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {icon && (
                <span className="text-gray-400">{icon}</span>
              )}
              {title && (
                <h3 className="text-white font-semibold text-base truncate">
                  {title}
                </h3>
              )}
              {badge && (
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  badgeClasses[badgeVariant]
                )}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-gray-400 text-sm mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        !title && !badge && !headerAction && sizeClasses[size],
        (title || badge || headerAction) && 'px-5 pb-5'
      )}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 pb-5 pt-0">
          {footer}
        </div>
      )}
    </div>
  );
}

export default XpressCard;
