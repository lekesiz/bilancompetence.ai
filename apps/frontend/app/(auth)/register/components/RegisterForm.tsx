'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/qualiopi/Button';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
    .regex(/\d/, 'Le mot de passe doit contenir un chiffre')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Le mot de passe doit contenir un caractère spécial'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
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
      {/* Progress Indicator - Design System v3 */}
      <div className="flex gap-3">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              <div className={`text-xs font-semibold ${
                step <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step === 1 ? 'Email' : step === 2 ? 'Mot de passe' : 'Détails'}
              </div>
            </div>
            <div
              className={`h-2 rounded-full transition-all ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Step 1: Email */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Étape 1 : Votre email
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Nous utiliserons cet email pour vous connecter
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Adresse email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              autoFocus
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading || !!errors.email}
            variant="primary-gradient"
            size="lg"
            className="w-full"
          >
            Continuer
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      )}

      {/* Step 2: Password */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Étape 2 : Mot de passe sécurisé
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Créez un mot de passe fort pour protéger votre compte
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors.password.message}
              </p>
            )}

            {/* Password strength indicator - Design System v3 */}
            {password && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Force du mot de passe :
                </p>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-xs ${
                    password.length >= 12 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-base">{password.length >= 12 ? '✅' : '⭕'}</span>
                    <span>Au moins 12 caractères</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    /[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-base">{/[A-Z]/.test(password) ? '✅' : '⭕'}</span>
                    <span>Une lettre majuscule</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    /[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-base">{/[a-z]/.test(password) ? '✅' : '⭕'}</span>
                    <span>Une lettre minuscule</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    /\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-base">{/\d/.test(password) ? '✅' : '⭕'}</span>
                    <span>Un chiffre</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-base">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✅' : '⭕'}</span>
                    <span>Un caractère spécial</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const isValid = await trigger(['password', 'confirmPassword']);
                if (isValid) {
                  setCurrentStep(3);
                }
              }}
              disabled={isLoading}
              variant="primary-gradient"
              size="lg"
              className="flex-1"
            >
              Continuer
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Personal Info */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Étape 3 : Vos informations
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Dernière étape avant de commencer !
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Nom complet
            </label>
            <input
              {...register('fullName')}
              type="text"
              placeholder="Jean Dupont"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <p className="text-sm text-primary-800 dark:text-primary-200 font-medium">
                En créant un compte, vous acceptez nos <a href="/terms" className="underline font-bold">Conditions d'utilisation</a> et notre <a href="/privacy" className="underline font-bold">Politique de confidentialité</a>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="success-gradient"
              size="lg"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                <>
                  Créer mon compte
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

