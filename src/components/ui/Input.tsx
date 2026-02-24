import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-xpress-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xpress-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'bg-xpress-bg-secondary border rounded-md px-3 py-2 text-sm text-xpress-text-primary',
              'placeholder:text-xpress-text-muted',
              'focus:outline-none focus:border-xpress-accent-blue focus:ring-1 focus:ring-xpress-accent-blue/50',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-xpress-accent-red focus:border-xpress-accent-red focus:ring-xpress-accent-red/50',
              !error && 'border-xpress-border',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xpress-text-muted">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-xpress-accent-red">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-xs text-xpress-text-muted">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
