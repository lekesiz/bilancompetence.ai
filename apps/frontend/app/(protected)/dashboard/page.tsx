'use client';

import { useAuth } from '@/hooks/useAuth';
import { Suspense } from 'react';
import { BeneficiaryDashboard } from './components/BeneficiaryDashboard';
import { ConsultantDashboard } from './components/ConsultantDashboard';
import { AdminDashboard } from './components/AdminDashboard';

// Loading skeleton component
function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

// Error boundary fallback
function DashboardError() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
      <p className="text-red-600">Failed to load your dashboard. Please try refreshing the page.</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-yellow-800 font-semibold mb-2">Authentication Required</h2>
        <p className="text-yellow-600">Please log in to view your dashboard.</p>
      </div>
    );
  }

  // Render role-specific dashboard
  return (
    <Suspense fallback={<DashboardLoading />}>
      {user.role === 'BENEFICIARY' && <BeneficiaryDashboard />}
      {user.role === 'CONSULTANT' && <ConsultantDashboard />}
      {user.role === 'ORG_ADMIN' && <AdminDashboard />}
      {!['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'].includes(user.role) && <DashboardError />}
    </Suspense>
  );
}
