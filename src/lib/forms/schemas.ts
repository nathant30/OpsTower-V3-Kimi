import { z } from 'zod';

/**
 * Common validation schemas for forms
 * Uses Zod for type-safe validation
 */

// ============================================
// Login Form Schema
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// User Profile Form Schema
// ============================================
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val === '' || /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  role: z.enum(['admin', 'manager', 'operator', 'viewer'], {
    message: 'Please select a valid role',
  }),
  department: z.string().optional(),
  isActive: z.boolean(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// ============================================
// Password Change Schema
// ============================================
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// ============================================
// Driver Profile Schema
// ============================================
export const driverProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  vehicleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'on_leave'], {
    message: 'Please select a valid status',
  }),
});

export type DriverProfileFormData = z.infer<typeof driverProfileSchema>;

// ============================================
// Incident Report Schema
// ============================================
export const incidentReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    message: 'Please select a valid severity',
  }),
  category: z.enum(['safety', 'operational', 'technical', 'compliance', 'other'], {
    message: 'Please select a valid category',
  }),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  location: z.string().optional(),
  occurredAt: z.string().min(1, 'Date and time is required'),
});

export type IncidentReportFormData = z.infer<typeof incidentReportSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Get the first error message from a Zod error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || 'Validation failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Safely parse form data with Zod schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function safeParseForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.issues.map((err: z.ZodIssue) => err.message),
  };
}
