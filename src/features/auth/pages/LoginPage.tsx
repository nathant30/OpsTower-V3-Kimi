import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/forms';
import { FormField } from '@/lib/forms';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');

    try {
      // Use HTTPS in production, HTTP only for local development
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(err.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();

      // Store auth data (in production, use httpOnly cookies instead)
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      navigate('/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  // Development helper - auto-fill credentials
  const handleDevLogin = () => {
    setValue('email', 'admin@opstower.com');
    setValue('password', 'admin123');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <div className="bg-gray-800/50 border border-white/10 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">OpsTower V2 Login</h1>
          <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-400 text-sm">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              placeholder: 'Enter your email',
              autoComplete: 'email',
            }}
          />

          {/* Password Field */}
          <FormField
            name="password"
            label="Password"
            type="password"
            required
            leftIcon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            inputProps={{
              ...register('password'),
              placeholder: 'Enter your password',
              autoComplete: 'current-password',
            }}
          />

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-400">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Development Mode Helper */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-xs">
              <strong className="block mb-1">Development Mode</strong>
              <button
                onClick={handleDevLogin}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Click here
              </button>{' '}
              to auto-fill test credentials
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
