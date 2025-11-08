'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const dynamic = 'force-dynamic';

export default function LogoutPage() {
  const router = useRouter();
  const { logout, isLoading } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Redirect to homepage after successful logout
        router.push('/fr');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, redirect to homepage
        router.push('/fr');
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Déconnexion en cours...
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Vous allez être redirigé vers la page d'accueil.
        </p>
      </div>
    </div>
  );
}

