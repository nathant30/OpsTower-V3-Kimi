import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/lib/stores/auth.store';

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

/**
 * ChangePasswordPage - Allows users to change their password
 *
 * Features:
 * - Old password verification
 * - New password with strength indicator
 * - Confirm password validation
 * - API integration with error handling
 * - Success feedback with redirect
 */
export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /**
   * Calculate password strength
   */
  const calculateStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths: PasswordStrength[] = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      { score: 1, label: 'Weak', color: 'bg-red-400' },
      { score: 2, label: 'Fair', color: 'bg-orange-400' },
      { score: 3, label: 'Good', color: 'bg-yellow-400' },
      { score: 4, label: 'Strong', color: 'bg-blue-400' },
      { score: 5, label: 'Very Strong', color: 'bg-green-400' },
      { score: 6, label: 'Excellent', color: 'bg-green-500' },
    ];
    
    return strengths[Math.min(score, 6)];
  }, []);

  /**
   * Validate form fields
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    // Old password validation
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }
    
    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Check if new password is same as old
    if (formData.oldPassword && formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle input changes
   */
  const handleChange = useCallback((field: keyof FormData) => (
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
      // Clear API error when user makes changes
      if (apiError) {
        setApiError(null);
      }
    }
  ), [errors, apiError]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback((field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      
      if (result.success) {
        setIsSuccess(true);
        // Clear form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setApiError(result.message || 'Failed to change password');
      }
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  /**
   * Handle logout after successful password change
   */
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  /**
   * Navigate back
   */
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const passwordStrength = calculateStrength(formData.newPassword);

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-xpress-bg-primary flex items-center justify-center p-4">
        <XpressCard
          title="Password Changed Successfully"
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          className="max-w-md w-full"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-300">
                Your password has been changed successfully.
              </p>
              <p className="text-gray-400 text-sm">
                For security reasons, please log in again with your new password.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Stay Logged In
              </Button>
              <Button
                variant="primary"
                onClick={handleLogout}
                className="flex-1"
              >
                Log Out
              </Button>
            </div>
          </div>
        </XpressCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-xpress-bg-primary flex items-center justify-center p-4">
      <XpressCard
        title="Change Password"
        subtitle="Update your account password"
        icon={<KeyRound className="w-6 h-6 text-xpress-accent-blue" />}
        className="max-w-md w-full"
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          {/* Old Password */}
          <div className="space-y-2">
            <Input
              label="Current Password"
              type={showPassword.old ? 'text' : 'password'}
              value={formData.oldPassword}
              onChange={handleChange('oldPassword')}
              error={errors.oldPassword}
              placeholder="Enter your current password"
              icon={<Lock className="w-4 h-4" />}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="text-xs text-xpress-accent-blue hover:text-blue-400 flex items-center gap-1"
              >
                {showPassword.old ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Show
                  </>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Input
              label="New Password"
              type={showPassword.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              error={errors.newPassword}
              placeholder="Enter your new password"
              icon={<Lock className="w-4 h-4" />}
              disabled={isLoading}
              autoComplete="new-password"
            />
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Password Strength</span>
                  <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="text-xs text-xpress-accent-blue hover:text-blue-400 flex items-center gap-1"
              >
                {showPassword.new ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Show
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Input
              label="Confirm New Password"
              type={showPassword.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
              icon={<Lock className="w-4 h-4" />}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="text-xs text-xpress-accent-blue hover:text-blue-400 flex items-center gap-1"
              >
                {showPassword.confirm ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Show
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="p-3 bg-xpress-bg-secondary rounded-lg">
            <p className="text-xs font-medium text-gray-400 mb-2">Password Requirements:</p>
            <ul className="space-y-1">
              {[
                { text: 'At least 8 characters', test: formData.newPassword.length >= 8 },
                { text: 'One uppercase letter', test: /[A-Z]/.test(formData.newPassword) },
                { text: 'One lowercase letter', test: /[a-z]/.test(formData.newPassword) },
                { text: 'One number', test: /[0-9]/.test(formData.newPassword) },
                { text: 'Different from current password', test: formData.newPassword !== formData.oldPassword || !formData.oldPassword },
              ].map((req, index) => (
                <li
                  key={index}
                  className={`text-xs flex items-center gap-1.5 ${
                    req.test ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  <CheckCircle className={`w-3 h-3 ${req.test ? 'text-green-500' : 'text-gray-600'}`} />
                  {req.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              Change Password
            </Button>
          </div>
        </form>
      </XpressCard>
    </div>
  );
}

export default ChangePasswordPage;
