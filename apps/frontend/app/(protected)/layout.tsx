'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookmarkCheck, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      active: pathname === '/dashboard'
    },
    { 
      href: '/dashboard/beneficiaire/ai/job-recommendations', 
      label: 'Recommandations', 
      icon: Briefcase,
      active: pathname.includes('/job-recommendations')
    },
    { 
      href: '/dashboard/beneficiaire/saved-jobs', 
      label: 'Emplois sauvegardés', 
      icon: BookmarkCheck,
      active: pathname.includes('/saved-jobs')
    },
    { 
      href: '/dashboard/beneficiaire/profile', 
      label: 'Profil', 
      icon: User,
      active: pathname.includes('/profile')
    },
    { 
      href: '/dashboard/settings', 
      label: 'Paramètres', 
      icon: Settings,
      active: pathname.includes('/settings')
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white dark:bg-gray-800 
        shadow-xl border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="relative h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-secondary-600">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                B
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                BilanCompetence<span className="text-accent-yellow">.AI</span>
              </h1>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role?.toLowerCase().replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 font-medium
                    ${item.active 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/logout"
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              BilanCompetence<span className="text-primary-600">.AI</span>
            </span>
          </Link>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

