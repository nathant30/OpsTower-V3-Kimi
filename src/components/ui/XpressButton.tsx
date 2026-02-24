import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface XpressButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  /** Button size */
  size?: 'xs' | 'sm' | 'md';
  /** Icon to display before text */
  icon?: ReactNode;
  /** Icon to display after text */
  trailingIcon?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Children content */
  children?: ReactNode;
}

const variantClasses = {
  primary: [
    'bg-blue-500 hover:bg-blue-600',
    'text-white',
    'border border-transparent',
    'shadow-lg shadow-blue-500/25',
  ],
  secondary: [
    'bg-white/5 hover:bg-white/10',
    'text-white',
    'border border-white/10',
  ],
  ghost: [
    'bg-transparent hover:bg-white/5',
    'text-gray-300 hover:text-white',
    'border border-transparent',
  ],
  danger: [
    'bg-red-500/10 hover:bg-red-500/20',
    'text-red-400',
    'border border-red-500/20',
  ],
  success: [
    'bg-green-500/10 hover:bg-green-500/20',
    'text-green-400',
    'border border-green-500/20',
  ],
};

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5',
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
};

/**
 * XpressButton - Unified button component for OpsTower
 * 
 * Variants:
 * - Primary: bg-blue-500 hover:bg-blue-600 (main actions)
 * - Secondary: bg-white/5 border border-white/10 (secondary actions)
 * - Ghost: hover:bg-white/5 (tertiary actions)
 * - Danger: bg-red-500/10 text-red-400 (destructive actions)
 * 
 * Sizes: xs, sm, md
 * 
 * @example
 * <XpressButton variant="primary" icon={<PlusIcon />}>
 *   Add Device
 * </XpressButton>
 */
export function XpressButton({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: XpressButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant styles
        variantClasses[variant],
        // Size styles
        sizeClasses[size],
        // Full width
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && trailingIcon && (
        <span className="flex-shrink-0">{trailingIcon}</span>
      )}
    </button>
  );
}

export default XpressButton;
