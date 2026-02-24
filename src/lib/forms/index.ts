/**
 * Form Utilities
 * 
 * This module provides form validation and components for OpsTower.
 * Built with react-hook-form and Zod for type-safe forms.
 * 
 * @example
 * // Basic usage with LoginForm
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { loginSchema, LoginFormData, FormField } from '@/lib/forms';
 * 
 * function LoginForm() {
 *   const {
 *     register,
 *     handleSubmit,
 *     formState: { errors, isSubmitting },
 *   } = useForm<LoginFormData>({
 *     resolver: zodResolver(loginSchema),
 *   });
 * 
 *   const onSubmit = (data: LoginFormData) => {
 *     console.log(data);
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <FormField
 *         label="Email"
 *         type="email"
 *         required
 *         error={errors.email?.message}
 *         inputProps={register('email')}
 *       />
 *       <button type="submit" disabled={isSubmitting}>
 *         Login
 *       </button>
 *     </form>
 *   );
 * }
 */

// Export schemas and types
export {
  // Schemas
  loginSchema,
  userProfileSchema,
  passwordChangeSchema,
  driverProfileSchema,
  incidentReportSchema,
  
  // Types
  type LoginFormData,
  type UserProfileFormData,
  type PasswordChangeFormData,
  type DriverProfileFormData,
  type IncidentReportFormData,
  
  // Helpers
  getErrorMessage,
  safeParseForm,
} from './schemas';

// Export components
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

// Re-export commonly used items from react-hook-form for convenience
export { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';

// Re-export zod resolver
export { zodResolver } from '@hookform/resolvers/zod';

// Re-export zod for convenience
export { z } from 'zod';

// Export example components
export * from './examples';
