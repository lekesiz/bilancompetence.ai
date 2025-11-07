'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import RegisterForm from './components/RegisterForm';
import Link from 'next/link';
import Card from '@/components/qualiopi/Card';

// ✅ Sprint 1.3 FIX: Re-added force-dynamic - necessary for pages using i18n
// useTranslations() requires runtime context and cannot be prerendered
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const t = useTranslations('auth');

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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700 flex items-center justify-center py-12 px-4">
      {/* Background Shapes - Haguenau.pro style */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-4xl font-bold text-white">
              BilanCompetence<span className="text-yellow-400">.AI</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">
            {t('registerTitle')}
          </h1>
          <p className="text-xl text-white/80">
            {t('registerSubtitle')}
          </p>
        </div>

        {/* Registration Card - Design System v3 */}
        <Card variant="default" className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 dark:text-red-400 text-xs mt-2 hover:text-red-700 dark:hover:text-red-300 font-semibold"
                  >
                    {t('closeError')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <RegisterForm
            onSubmit={handleRegister}
            isLoading={isLoading}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                {t('alreadyHaveAccount')}
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link href="/login" className="block">
            <button className="w-full px-6 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center justify-center gap-2">
              {t('loginButton')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </Link>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

