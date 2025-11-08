'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/qualiopi/Button';
import Card from '@/components/qualiopi/Card';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Verify email on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Token de vérification manquant');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/email-verification/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la vérification');
        }

        setSuccess(true);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/fr/dashboard');
        }, 3000);
      } catch (err: any) {
        setError(err.message || 'Token invalide ou expiré');
        setSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendEmail = async () => {
    setResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/email-verification/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: This requires authentication - adjust as needed
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      setResendSuccess(true);
    } catch (err) {
      console.error('Failed to resend email:', err);
    } finally {
      setResending(false);
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
            Vérification d'email
          </h1>
          <p className="text-xl text-white/80">
            Confirmation de votre adresse email
          </p>
        </div>

        {/* Verify Email Card */}
        <Card variant="default" className="p-8">
          {isVerifying ? (
            // Verifying State
            <div className="text-center py-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Vérification en cours...
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </div>
          ) : success ? (
            // Success State
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full animate-bounce">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Email vérifié avec succès ! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Votre adresse email a été confirmée.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Redirection vers votre dashboard...
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard">
                  <Button variant="primary-gradient" size="lg" className="w-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Accéder au dashboard
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Error State
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Vérification échouée
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {error || 'Le lien de vérification est invalide ou a expiré.'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Les liens de vérification expirent après 24 heures pour des raisons de sécurité.
              </p>

              {/* Resend Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Besoin d'un nouveau lien ?
                </h3>
                {resendSuccess ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl mb-4">
                    <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                      ✅ Email de vérification renvoyé ! Vérifiez votre boîte de réception.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Nous pouvons vous envoyer un nouveau lien de vérification par email.
                  </p>
                )}
                <Button
                  variant="primary-gradient"
                  size="md"
                  onClick={handleResendEmail}
                  disabled={resending || resendSuccess}
                  className="w-full"
                >
                  {resending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : resendSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email envoyé
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Renvoyer l'email de vérification
                    </>
                  )}
                </Button>
              </div>

              {/* Alternative Actions */}
              <div className="flex flex-col gap-3">
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full">
                    Retour à la connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full">
                    Créer un nouveau compte
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Besoin d'aide ?
          </h3>
          <p className="text-white/80 text-sm mb-3">
            Si vous rencontrez des problèmes avec la vérification de votre email :
          </p>
          <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
            <li>Vérifiez votre dossier spam</li>
            <li>Assurez-vous d'utiliser le dernier lien reçu</li>
            <li>Les liens expirent après 24 heures</li>
            <li>Contactez le support si le problème persiste</li>
          </ul>
        </div>

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
