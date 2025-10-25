'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure user is not authenticated
    // (loading is done and still no user)
    if (!isLoading && !user) {
      console.log('Protected route: Redirecting to login (no authenticated user)');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">BilanCompetence</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.role}</p>
        </div>

        <nav className="mt-6">
          <a
            href="/dashboard"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Dashboard
          </a>
          <a
            href="/recommendations"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            📊 Job Recommendations
          </a>
          <a
            href="/saved-jobs"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            📌 Saved Jobs
          </a>
          <a
            href="/profile"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Profile
          </a>
          <a
            href="/settings"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Settings
          </a>
          <a
            href="/logout"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 transition"
          >
            Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
