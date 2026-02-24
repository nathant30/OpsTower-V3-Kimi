/**
 * Example: User Profile Form with Validation
 * 
 * This component demonstrates how to use the form utilities
 * with react-hook-form and Zod validation.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema, type UserProfileFormData, FormField } from '@/lib/forms';
import { User, Mail, Phone, Building2, Check } from 'lucide-react';
import { useState } from 'react';

const ROLE_OPTIONS = [
  { value: '', label: 'Select a role', disabled: true },
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'operator', label: 'Operator' },
  { value: 'viewer', label: 'Viewer' },
];

interface UserProfileFormProps {
  initialData?: Partial<UserProfileFormData>;
  onSubmit: (data: UserProfileFormData) => Promise<void>;
}

export function UserProfileForm({ initialData, onSubmit }: UserProfileFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      role: initialData?.role || 'operator',
      department: initialData?.department || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleFormSubmit = async (data: UserProfileFormData) => {
    try {
      await onSubmit(data);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      // Error handling is done by the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Success Message */}
      {isSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-green-400 text-sm">Profile updated successfully!</span>
        </div>
      )}

      {/* Name Fields - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="firstName"
          label="First Name"
          type="text"
          required
          leftIcon={<User className="w-5 h-5" />}
          error={errors.firstName?.message}
          inputProps={{
            ...register('firstName'),
            placeholder: 'Enter first name',
          }}
        />

        <FormField
          name="lastName"
          label="Last Name"
          type="text"
          required
          leftIcon={<User className="w-5 h-5" />}
          error={errors.lastName?.message}
          inputProps={{
            ...register('lastName'),
            placeholder: 'Enter last name',
          }}
        />
      </div>

      {/* Email Field */}
      <FormField
        name="email"
        label="Email Address"
        type="email"
        required
        leftIcon={<Mail className="w-5 h-5" />}
        error={errors.email?.message}
        inputProps={{
          ...register('email'),
          placeholder: 'Enter email address',
        }}
      />

      {/* Phone Field */}
      <FormField
        name="phone"
        label="Phone Number"
        type="tel"
        leftIcon={<Phone className="w-5 h-5" />}
        error={errors.phone?.message}
        helperText="Optional. Format: +1 (555) 123-4567"
        inputProps={{
          ...register('phone'),
          placeholder: 'Enter phone number',
        }}
      />

      {/* Role Select */}
      <FormField
        name="role"
        label="Role"
        type="select"
        required
        options={ROLE_OPTIONS}
        error={errors.role?.message}
        selectProps={register('role')}
      />

      {/* Department Field */}
      <FormField
        name="department"
        label="Department"
        type="text"
        leftIcon={<Building2 className="w-5 h-5" />}
        error={errors.department?.message}
        helperText="Optional"
        inputProps={{
          ...register('department'),
          placeholder: 'Enter department',
        }}
      />

      {/* Active Status Checkbox */}
      <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
        <input
          type="checkbox"
          {...register('isActive')}
          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500/20"
        />
        <div>
          <span className="text-white font-medium block">Active Account</span>
          <span className="text-gray-500 text-sm">User can log in and access the system</span>
        </div>
      </label>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </form>
  );
}

export default UserProfileForm;
