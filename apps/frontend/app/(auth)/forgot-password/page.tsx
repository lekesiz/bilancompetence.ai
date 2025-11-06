'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Button from '@/components/qualiopi/Button';
import Card from '@/components/qualiopi/Card';

export const dynamic = 'force-dynamic';

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700 flex items-center justify-center py-12 px-4">
      {/* Background Shapes */}
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
            Mot de passe oublié ?
          </h1>
          <p className="text-xl text-white/80">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card variant="default" className="p-8">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Email envoyé !
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe dans quelques minutes.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                N'oubliez pas de vérifier vos spams !
              </p>
              <Link href="/login">
                <Button variant="primary-gradient" size="lg" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            // Form State
            <>
              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">⚠️</span>
                    <div className="flex-1">
                      <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-600 dark:text-red-400 text-xs mt-2 hover:text-red-700 dark:hover:text-red-300 font-semibold"
                        aria-label="Fermer le message d'erreur"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Message */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">ℹ️</span>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Entrez l'adresse email associée à votre compte. Vous recevrez un lien pour créer un nouveau mot de passe.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Adresse email
                  </label>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span aria-hidden="true">⚠️</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary-gradient"
                  size="lg"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le lien de réinitialisation
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    Vous vous souvenez de votre mot de passe ?
                  </span>
                </div>
              </div>

              {/* Back to Login */}
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour à la connexion
                </Button>
              </Link>
            </>
          )}
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
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
