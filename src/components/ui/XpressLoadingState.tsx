import { cn } from '@/lib/utils/cn';

export interface XpressLoadingStateProps {
  /** Type of loading state */
  type?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
  /** For skeleton - number of rows */
  rows?: number;
  /** For skeleton - number of columns per row */
  columns?: number;
  /** Loading message */
  message?: string;
  /** Sub message */
  subMessage?: string;
  /** Size for spinner/dots */
  size?: 'sm' | 'md' | 'lg';
  /** Full container height */
  fullHeight?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** For card skeletons - show header */
  showHeader?: boolean;
  /** For card skeletons - show footer */
  showFooter?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

/**
 * XpressLoadingState - Loading states for OpsTower
 * 
 * Types:
 * - spinner: Classic spinning loader
 * - skeleton: Content placeholder blocks
 * - pulse: Pulsing animation
 * - dots: Bouncing dots animation
 * 
 * @example
 * // Full page loading
 * <XpressLoadingState type="spinner" size="lg" message="Loading data..." fullHeight />
 * 
 * // Skeleton loading for table
 * <XpressLoadingState type="skeleton" rows={5} columns={4} />
 * 
 * // Card skeleton
 * <XpressLoadingState type="skeleton" showHeader rows={3} />
 */
export function XpressLoadingState({
  type = 'spinner',
  rows = 3,
  columns = 1,
  message,
  subMessage,
  size = 'md',
  fullHeight = false,
  className,
  showHeader = false,
  showFooter = false,
}: XpressLoadingStateProps) {
  // Spinner loading state
  if (type === 'spinner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          fullHeight && 'min-h-[400px]',
          className
        )}
      >
        <svg
          className={cn('animate-spin text-blue-500', sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {message && (
          <p className="mt-4 text-gray-300 font-medium">{message}</p>
        )}
        {subMessage && (
          <p className="mt-1 text-gray-500 text-sm">{subMessage}</p>
        )}
      </div>
    );
  }

  // Dots loading state
  if (type === 'dots') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          fullHeight && 'min-h-[400px]',
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'bg-blue-500 rounded-full animate-bounce',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-3 h-3'
            )}
            style={{ animationDelay: '0ms' }}
          />
          <span
            className={cn(
              'bg-blue-500 rounded-full animate-bounce',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-3 h-3'
            )}
            style={{ animationDelay: '150ms' }}
          />
          <span
            className={cn(
              'bg-blue-500 rounded-full animate-bounce',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-3 h-3'
            )}
            style={{ animationDelay: '300ms' }}
          />
        </div>
        {message && (
          <p className="mt-4 text-gray-300 font-medium">{message}</p>
        )}
      </div>
    );
  }

  // Pulse loading state
  if (type === 'pulse') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          fullHeight && 'min-h-[400px]',
          className
        )}
      >
        <div
          className={cn(
            'bg-blue-500/30 rounded-full animate-pulse',
            sizeClasses[size]
          )}
        />
        {message && (
          <p className="mt-4 text-gray-300 font-medium animate-pulse">{message}</p>
        )}
      </div>
    );
  }

  // Skeleton loading state
  if (type === 'skeleton') {
    return (
      <div
        className={cn(
          'space-y-3',
          className
        )}
      >
        {/* Header skeleton */}
        {showHeader && (
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="h-5 bg-white/10 rounded w-1/3 animate-pulse" />
            <div className="h-5 bg-white/10 rounded w-20 animate-pulse ml-auto" />
          </div>
        )}

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              'flex gap-3',
              columns > 1 ? 'items-center' : 'flex-col'
            )}
          >
            {columns === 1 ? (
              // Single column - stacked skeletons
              <>
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
              </>
            ) : (
              // Multi-column - row skeletons
              Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-10 bg-white/10 rounded flex-1 animate-pulse"
                  style={{
                    animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
                  }}
                />
              ))
            )}
          </div>
        ))}

        {/* Footer skeleton */}
        {showFooter && (
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
            <div className="h-8 bg-white/10 rounded w-20 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default XpressLoadingState;
