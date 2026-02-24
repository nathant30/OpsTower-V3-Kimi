import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { XpressButton } from './XpressButton';

export interface XpressEmptyStateProps {
  /** Icon component to display */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button text */
  actionLabel?: string;
  /** Primary action handler */
  onAction?: () => void;
  /** Secondary action text */
  secondaryActionLabel?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Compact mode for tight spaces */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom content (replaces default layout) */
  children?: ReactNode;
}

/**
 * XpressEmptyState - Empty state component for OpsTower
 * 
 * Use cases:
 * - No data available
 * - Empty search results
 * - Initial state before data load
 * - Error states with retry option
 * 
 * @example
 * <XpressEmptyState
 *   icon={<SearchIcon className="w-12 h-12" />}
 *   title="No results found"
 *   description="Try adjusting your search terms"
 *   actionLabel="Clear filters"
 *   onAction={handleClear}
 * />
 */
export function XpressEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  className,
  children,
}: XpressEmptyStateProps) {
  // Custom content override
  if (children) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'text-center',
          compact ? 'py-8 px-4' : 'py-16 px-4',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center',
        compact ? 'py-8 px-4' : 'py-16 px-4',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-white/5',
            compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'
          )}
        >
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          'font-semibold text-white',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-gray-400 mt-1 max-w-sm',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {description}
        </p>
      )}

      {/* Action buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 mt-4">
          {actionLabel && onAction && (
            <XpressButton
              variant="primary"
              size={compact ? 'sm' : 'md'}
              onClick={onAction}
            >
              {actionLabel}
            </XpressButton>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <XpressButton
              variant="ghost"
              size={compact ? 'sm' : 'md'}
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </XpressButton>
          )}
        </div>
      )}
    </div>
  );
}

export default XpressEmptyState;
