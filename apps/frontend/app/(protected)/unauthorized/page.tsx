'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/qualiopi/Button';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-red-700 flex items-center justify-center py-12 px-4">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 403 Icon */}
        <div className="mb-8">
          <div className="relative">
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
        </div>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Accès non autorisé
        </h2>
        <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
          Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {/* User Info & Role */}
        {user && (
          <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">{user.email}</p>
                <p className="text-white/70 text-sm capitalize">
                  Rôle : {user.role?.toLowerCase().replace('_', ' ') || 'User'}
                </p>
              </div>
            </div>
            <div className="border-t-2 border-white/20 pt-4 mt-4">
              <p className="text-white/80 text-sm">
                Votre rôle actuel ne permet pas d'accéder à cette ressource.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/dashboard">
            <Button variant="primary-gradient" size="lg" className="min-w-[200px] bg-white hover:bg-gray-100 text-orange-700 border-2 border-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
              </svg>
              Mon tableau de bord
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 text-white/90 hover:text-white font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Page précédente
          </button>
        </div>

        {/* Available Resources */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Pages disponibles pour vous
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link href="/" className="group">
              <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center gap-3 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-semibold">Accueil</span>
                </div>
              </div>
            </Link>

            <Link href="/dashboard" className="group">
              <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center gap-3 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold">Dashboard</span>
                </div>
              </div>
            </Link>

            <Link href="/profile" className="group">
              <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center gap-3 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">Mon profil</span>
                </div>
              </div>
            </Link>

            <Link href="/contact" className="group">
              <div className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center gap-3 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Contact</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 max-w-lg mx-auto">
          <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Besoin d'aide ?
          </h3>
          <p className="text-white/80 text-sm mb-4">
            Si vous pensez que vous devriez avoir accès à cette page :
          </p>
          <ul className="text-white/70 text-sm space-y-2 text-left mb-4">
            <li className="flex items-start gap-2">
              <span className="text-white/90">•</span>
              <span>Vérifiez que vous êtes connecté avec le bon compte</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/90">•</span>
              <span>Contactez votre administrateur pour demander l'accès</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/90">•</span>
              <span>Consultez la documentation des permissions</span>
            </li>
          </ul>
          <Link href="/contact">
            <Button variant="outline" size="md" className="w-full border-2 border-white/40 text-white hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Demander l'accès
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
