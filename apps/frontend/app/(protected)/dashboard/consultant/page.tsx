'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Bilan {
  id: string;
  title: string;
  status: string;
  beneficiaire: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  updated_at: string;
  overall_progress?: number;
}

export default function ConsultantDashboard() {
  const router = useRouter();
  const t = useTranslations('dashboard.consultant');
  const tCommon = useTranslations('common');
  const [bilans, setBilans] = useState<Bilan[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    in_progress: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilans();
  }, []);

  const loadBilans = async () => {
    try {
      // 🔒 SECURITY: HttpOnly cookies (GET request doesn't need CSRF token)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments`, {
        credentials: 'include', // Send HttpOnly cookies automatically
      });

      // Backend returns 401 if not authenticated
      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Failed to load bilans');
      
      const data = await res.json();
      const bilansData = data.assessments || [];
      
      setBilans(bilansData);
      
      // Calculate stats
      setStats({
        total: bilansData.length,
        in_progress: bilansData.filter((b: Bilan) => b.status === 'in_progress').length,
        completed: bilansData.filter((b: Bilan) => b.status === 'completed').length,
        pending: bilansData.filter((b: Bilan) => b.status === 'pending').length
      });

    } catch (error) {
      console.error('Error loading bilans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">{t('loadingAssessments')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">
            {t('pageTitle')}
          </h1>
          <p className="text-textSecondary">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('totalAssessments')}
            value={stats.total}
            icon="📊"
            color="bg-blue-100 text-blue-800"
          />
          <StatCard
            title={t('inProgress')}
            value={stats.in_progress}
            icon="🔄"
            color="bg-yellow-100 text-yellow-800"
          />
          <StatCard
            title={t('completed')}
            value={stats.completed}
            icon="✅"
            color="bg-green-100 text-green-800"
          />
          <StatCard
            title={t('pending')}
            value={stats.pending}
            icon="⏳"
            color="bg-gray-100 text-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/consultant/nouveau-bilan"
            className="bg-primary text-white rounded-lg p-6 hover:bg-primary/90 transition-colors text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <h3 className="text-lg font-semibold">{t('newAssessment')}</h3>
            <p className="text-sm opacity-90">{t('newAssessmentDesc')}</p>
          </Link>

          <Link
            href="/dashboard/consultant/rendez-vous"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">📅</div>
            <h3 className="text-lg font-semibold text-textPrimary">{t('myAppointments')}</h3>
            <p className="text-sm text-textSecondary">{t('myAppointmentsDesc')}</p>
          </Link>

          <Link
            href="/dashboard/consultant/messagerie"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">💬</div>
            <h3 className="text-lg font-semibold text-textPrimary">{t('messaging')}</h3>
            <p className="text-sm text-textSecondary">{t('messagingDesc')}</p>
          </Link>
        </div>

        {/* Bilans List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-textPrimary">{t('myAssessments')}</h2>
          </div>

          {bilans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">
                {t('noAssessmentsYet')}
              </h3>
              <p className="text-textSecondary mb-6">
                {t('noAssessmentsDesc')}
              </p>
              <Link
                href="/dashboard/consultant/nouveau-bilan"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('createAssessment')}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('beneficiary')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('progress')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('lastUpdate')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {bilans.map((bilan) => (
                    <tr key={bilan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-textPrimary">
                          {bilan.beneficiaire?.first_name && bilan.beneficiaire?.last_name
                            ? `${bilan.beneficiaire.first_name} ${bilan.beneficiaire.last_name}`
                            : bilan.beneficiaire?.email || t('notAssigned')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-textPrimary">{bilan.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={bilan.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${bilan.overall_progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-textSecondary">
                            {bilan.overall_progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                        {new Date(bilan.updated_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/consultant/bilans/${bilan.id}`}
                          className="text-primary hover:text-primary/80 mr-4"
                        >
                          {t('view')}
                        </Link>
                        <Link
                          href={`/dashboard/consultant/bilans/${bilan.id}/edit`}
                          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
                        >
                          {t('modify')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-textSecondary text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-textPrimary">{value}</p>
        </div>
        <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-3xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('dashboard.consultant');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:text-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('statusCompleted');
      case 'in_progress':
        return t('statusInProgress');
      case 'pending':
        return t('statusPending');
      default:
        return status;
    }
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
}

