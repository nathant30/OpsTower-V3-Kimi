import { forwardRef, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'select' | 'textarea';

export interface BaseFormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormFieldProps extends BaseFormFieldProps {
  name: string;
  type?: InputType;
  options?: SelectOption[];
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
  textareaProps?: InputHTMLAttributes<HTMLTextAreaElement>;
}

/**
 * FormField - A reusable form field component with validation support
 * 
 * Features:
 * - Label with required indicator
 * - Error message display
 * - Helper text support
 * - Multiple input types (text, email, password, select, textarea)
 * - Icon support for inputs
 * - Consistent styling with the OpsTower design system
 * 
 * @example
 * <FormField
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   required
 *   error={errors.email?.message}
 *   inputProps={{ placeholder: 'Enter your email' }}
 * />
 * 
 * @example
 * <FormField
 *   name="role"
 *   label="Role"
 *   type="select"
 *   required
 *   options={[
 *     { value: 'admin', label: 'Administrator' },
 *     { value: 'user', label: 'User' },
 *   ]}
 * />
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      name,
      label,
      error,
      helperText,
      required = false,
      type = 'text',
      options = [],
      className,
      fullWidth = true,
      leftIcon,
      rightIcon,
      inputProps,
      selectProps,
      textareaProps,
    },
    ref
  ) => {
    const inputId = `field-${name}`;
    const hasError = Boolean(error);

    // Common label styles
    const labelClasses = 'block text-sm font-medium text-gray-300 mb-1.5';

    // Common input container styles
    const containerClasses = cn('flex flex-col', fullWidth && 'w-full', className);

    // Common input styles
    const inputClasses = cn(
      // Base styles - dark command center aesthetic
      'bg-white/5 border border-white/10 rounded-lg',
      'text-white placeholder:text-gray-500',
      'transition-all duration-200',
      // Focus state
      'focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20',
      // Error state
      hasError && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
      // Padding
      'px-4 py-2.5',
      // Width
      fullWidth && 'w-full'
    );

    // Helper/error text
    const renderHelper = () => {
      if (!error && !helperText) return null;

      return (
        <span
          className={cn(
            'mt-1.5 text-sm',
            hasError ? 'text-red-400' : 'text-gray-500'
          )}
        >
          {error || helperText}
        </span>
      );
    };

    // Render different input types
    const renderInput = () => {
      switch (type) {
        case 'select':
          return (
            <select
              id={inputId}
              name={name}
              className={cn(inputClasses, 'appearance-none cursor-pointer')}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${inputId}-error` : undefined}
              {...selectProps}
            >
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="bg-gray-800 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'textarea':
          return (
            <textarea
              id={inputId}
              name={name}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={cn(inputClasses, 'min-h-[100px] resize-y')}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${inputId}-error` : undefined}
              {...textareaProps}
            />
          );

        default:
          return (
            <div className="relative">
              {leftIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  {leftIcon}
                </div>
              )}
              <input
                id={inputId}
                name={name}
                type={type}
                ref={ref}
                className={cn(
                  inputClasses,
                  leftIcon && 'pl-10',
                  rightIcon && 'pr-10'
                )}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${inputId}-error` : undefined}
                {...inputProps}
              />
              {rightIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {rightIcon}
                </div>
              )}
            </div>
          );
      }
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && (
              <span className="text-red-400 ml-1" aria-hidden="true">
                *
              </span>
            )}
            {required && (
              <span className="sr-only"> (required)</span>
            )}
          </label>
        )}
        {renderInput()}
        {renderHelper()}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
