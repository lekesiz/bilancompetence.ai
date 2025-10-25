'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RegisterForm from './components/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const handleRegister = async (data: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    const success = await authRegister(data.email, data.password, data.fullName);

    if (success) {
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join BilanCompetence.AI
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create your account to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 text-xs mt-2 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Registration Form */}
        <RegisterForm
          onSubmit={handleRegister}
          isLoading={isLoading}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm mt-6">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
