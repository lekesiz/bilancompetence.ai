'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/qualiopi/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center py-12 px-4">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full border-4 border-white/20">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Oups ! Une erreur s'est produite
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
          Quelque chose s'est mal passé. Ne vous inquiétez pas, ce n'est pas de votre faute.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 text-left max-w-lg mx-auto">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Détails de l'erreur (Dev Mode)
            </h3>
            <p className="text-white/80 text-sm font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-white/60 text-xs mt-2">
                ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={reset}
            variant="primary-gradient"
            size="lg"
            className="min-w-[200px] bg-white hover:bg-gray-100 text-red-700 border-2 border-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réessayer
          </Button>

          <Link href="/">
            <Button variant="outline" size="lg" className="min-w-[200px] border-2 border-white/40 text-white hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
          <Link href="/dashboard" className="group">
            <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                </svg>
                <span className="font-semibold">Tableau de bord</span>
              </div>
            </div>
          </Link>

          <Link href="/contact" className="group">
            <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Nous contacter</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 max-w-lg mx-auto">
          <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Que s'est-il passé ?
          </h3>
          <p className="text-white/80 text-sm mb-4">
            Une erreur inattendue s'est produite lors du chargement de cette page.
            Nos équipes techniques ont été automatiquement notifiées.
          </p>
          <ul className="text-white/70 text-sm space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-white/90">•</span>
              <span>Essayez de recharger la page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/90">•</span>
              <span>Vérifiez votre connexion Internet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/90">•</span>
              <span>Si le problème persiste, contactez notre support</span>
            </li>
          </ul>
        </div>

        {/* Error ID for Support */}
        {error.digest && (
          <div className="mt-6">
            <p className="text-white/60 text-xs">
              Code d'erreur pour le support : <span className="font-mono text-white/80">{error.digest}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
