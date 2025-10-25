'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a digit')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function RegisterForm({
  onSubmit,
  isLoading,
  currentStep,
  setCurrentStep,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const handleNext = async () => {
    const isValid = await trigger(['email']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleFormSubmit = async (data: RegisterFormData) => {
    await onSubmit({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-colors ${
              step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Email */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Email</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input-field"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading || !!errors.email}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Password */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Password</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className="input-field pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={password.length >= 12 ? 'text-success-600' : 'text-gray-600 dark:text-gray-300'}>
                  ✓ At least 12 characters
                </div>
                <div className={/[A-Z]/.test(password) ? 'text-success-600' : 'text-gray-600 dark:text-gray-300'}>
                  ✓ Uppercase letter
                </div>
                <div className={/[a-z]/.test(password) ? 'text-success-600' : 'text-gray-600 dark:text-gray-300'}>
                  ✓ Lowercase letter
                </div>
                <div className={/\d/.test(password) ? 'text-success-600' : 'text-gray-600 dark:text-gray-300'}>
                  ✓ Number
                </div>
                <div className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-success-600' : 'text-gray-600 dark:text-gray-300'}>
                  ✓ Special character
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className="input-field pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1 border border-gray-300 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={async () => {
                const isValid = await trigger(['password', 'confirmPassword']);
                if (isValid) {
                  setCurrentStep(3);
                }
              }}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Personal Info */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 3: Your Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Full Name
            </label>
            <input
              {...register('fullName')}
              type="text"
              placeholder="John Doe"
              className="input-field"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✓ By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1 border border-gray-300 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
