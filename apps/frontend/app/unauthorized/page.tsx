'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/qualiopi/Button';
import Card from '@/components/qualiopi/Card';

export const dynamic = 'force-dynamic';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-red-700 flex items-center justify-center py-12 px-4">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 403 Large Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-black text-white/20 leading-none select-none">
            403
          </h1>
          <div className="relative -mt-20">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full border-4 border-white/20">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Accès non autorisé
        </h2>
        <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
        </p>

        {/* Card with Details */}
        <Card variant="default" className="p-8 mb-8 max-w-lg mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pourquoi suis-je bloqué ?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Vous n'avez pas le rôle requis pour cette page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Votre compte n'est peut-être pas encore activé</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Vous avez besoin d'une permission spéciale</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <div className="text-left text-sm">
                <p className="text-blue-900 dark:text-blue-100 font-semibold mb-1">
                  Besoin d'accès ?
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Contactez votre administrateur ou notre équipe support pour demander les permissions nécessaires.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
          <Link href="/dashboard" className="group">
            <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                </svg>
                <span className="font-semibold">Mon Dashboard</span>
              </div>
            </div>
          </Link>

          <Link href="/contact" className="group">
            <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Support</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-red-700 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>

          <Link href="/">
            <Button variant="outline" size="lg" className="border-2 border-white/40 text-white hover:bg-white/10 min-w-[160px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Accueil
            </Button>
          </Link>
        </div>

        {/* Role-based Access Help */}
        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 max-w-lg mx-auto">
          <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Comprendre les rôles
          </h3>
          <div className="text-white/80 text-sm text-left space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-lg">👤</span>
              <div>
                <p className="font-semibold text-white">Bénéficiaire</p>
                <p className="text-xs text-white/60">Accès à vos assessments et résultats</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-lg">👨‍🏫</span>
              <div>
                <p className="font-semibold text-white">Consultant</p>
                <p className="text-xs text-white/60">Gestion des clients et des bilans</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-lg">⚙️</span>
              <div>
                <p className="font-semibold text-white">Administrateur</p>
                <p className="text-xs text-white/60">Accès complet à la plateforme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
