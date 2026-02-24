import type { ReactNode, InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface XpressInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Icon to display on the left side */
  leftIcon?: ReactNode;
  /** Icon or element to display on the right side */
  rightIcon?: ReactNode;
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Full width input */
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const iconSizeClasses = {
  sm: 'left-2.5',
  md: 'left-3',
  lg: 'left-4',
};

const rightIconSizeClasses = {
  sm: 'right-2.5',
  md: 'right-3',
  lg: 'right-4',
};

const paddingWithLeftIcon = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
};

const paddingWithRightIcon = {
  sm: 'pr-9',
  md: 'pr-10',
  lg: 'pr-11',
};

/**
 * XpressInput - Search and input fields for OpsTower
 * 
 * Styling:
 * - bg-white/5 border border-white/10 rounded-lg
 * - Focus: focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
 * 
 * Features:
 * - Left/right icon support
 * - Error states
 * - Label and helper text
 * 
 * @example
 * <XpressInput 
 *   placeholder="Search devices..." 
 *   leftIcon={<SearchIcon />}
 * />
 */
export const XpressInput = forwardRef<HTMLInputElement, XpressInputProps>(
  ({
    leftIcon,
    rightIcon,
    inputSize = 'md',
    error = false,
    errorMessage,
    label,
    helperText,
    fullWidth = true,
    className,
    disabled,
    ...props
  }, ref) => {
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute inset-y-0 flex items-center pointer-events-none text-gray-400',
                iconSizeClasses[inputSize]
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            className={cn(
              // Base styles - dark command center aesthetic
              'bg-white/5 border border-white/10 rounded-lg',
              'text-white placeholder:text-gray-500',
              'transition-all duration-200',
              // Focus state
              'focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20',
              // Error state
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-white/5',
              // Size
              sizeClasses[inputSize],
              // Padding adjustments for icons
              leftIcon && paddingWithLeftIcon[inputSize],
              rightIcon && paddingWithRightIcon[inputSize],
              // Width
              fullWidth && 'w-full',
              className
            )}
            disabled={disabled}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div
              className={cn(
                'absolute inset-y-0 flex items-center text-gray-400',
                rightIconSizeClasses[inputSize]
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message or helper text */}
        {(errorMessage || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-400' : 'text-gray-500'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

XpressInput.displayName = 'XpressInput';

export default XpressInput;
