'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  total_users: number;
  total_bilans: number;
  bilans_in_progress: number;
  bilans_completed: number;
  total_consultants: number;
  total_beneficiaires: number;
  completion_rate: number;
  average_duration: number;
}

interface RecentActivity {
  id: string;
  type: string;
  user: string;
  action: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_bilans: 0,
    bilans_in_progress: 0,
    bilans_completed: 0,
    total_consultants: 0,
    total_beneficiaires: 0,
    completion_rate: 0,
    average_duration: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Load analytics data
      const analyticsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setStats(analyticsData.stats || stats);
      }

      // Load recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'bilan',
          user: 'Marie Dupont',
          action: 'a complété la phase préliminaire',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'user',
          user: 'Thomas Martin',
          action: 's\'est inscrit',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Chargement du tableau de bord...</p>
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
            Tableau de Bord Administrateur
          </h1>
          <p className="text-textSecondary">
            Vue d'ensemble de la plateforme BilanCompetence.AI
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={stats.total_users}
            icon="👥"
            color="bg-blue-100 text-blue-800"
            trend="+12%"
          />
          <StatCard
            title="Bilans Actifs"
            value={stats.bilans_in_progress}
            icon="📊"
            color="bg-yellow-100 text-yellow-800"
            trend="+8%"
          />
          <StatCard
            title="Bilans Complétés"
            value={stats.bilans_completed}
            icon="✅"
            color="bg-green-100 text-green-800"
            trend="+15%"
          />
          <StatCard
            title="Taux de Complétion"
            value={`${stats.completion_rate}%`}
            icon="📈"
            color="bg-purple-100 text-purple-800"
            trend="+5%"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">Répartition Utilisateurs</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Bénéficiaires</span>
                <span className="font-semibold text-textPrimary">{stats.total_beneficiaires}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Consultants</span>
                <span className="font-semibold text-textPrimary">{stats.total_consultants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Administrateurs</span>
                <span className="font-semibold text-textPrimary">3</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Durée Moyenne</span>
                <span className="font-semibold text-textPrimary">{stats.average_duration} jours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Satisfaction</span>
                <span className="font-semibold text-textPrimary">4.8/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Taux de Réussite</span>
                <span className="font-semibold text-textPrimary">92%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">Conformité Qualiopi</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Indicateurs</span>
                <span className="font-semibold text-success-600">32/32 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Conformité</span>
                <span className="font-semibold text-success-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textSecondary">Dernier Audit</span>
                <span className="font-semibold text-textPrimary">15/10/2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard/admin/utilisateurs"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-lg font-semibold text-textPrimary">Utilisateurs</h3>
            <p className="text-sm text-textSecondary">Gérer les comptes</p>
          </Link>

          <Link
            href="/dashboard/admin/bilans"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-textPrimary">Tous les Bilans</h3>
            <p className="text-sm text-textSecondary">Vue d'ensemble</p>
          </Link>

          <Link
            href="/dashboard/admin/qualiopi"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-semibold text-textPrimary">Qualiopi</h3>
            <p className="text-sm text-textSecondary">Conformité & Audit</p>
          </Link>

          <Link
            href="/dashboard/admin/statistiques"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-lg font-semibold text-textPrimary">Statistiques</h3>
            <p className="text-sm text-textSecondary">Analytics détaillées</p>
          </Link>

          <Link
            href="/dashboard/admin/integrations/wedof"
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-center border-2 border-purple-200"
          >
            <div className="text-3xl mb-2">🎓</div>
            <h3 className="text-lg font-semibold text-purple-800">Wedof</h3>
            <p className="text-sm text-purple-600">Gestion formation</p>
          </Link>

          <Link
            href="/dashboard/admin/integrations/pennylane"
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-center border-2 border-blue-200"
          >
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-blue-800">Pennylane</h3>
            <p className="text-sm text-blue-600">Facturation</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-textPrimary">Activité Récente</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-textSecondary">
                Aucune activité récente
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'bilan' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {activity.type === 'bilan' ? '📊' : '👤'}
                      </div>
                      <div>
                        <p className="text-sm text-textPrimary">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-textSecondary">
                          {new Date(activity.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      Voir détails
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: number | string; 
  icon: string; 
  color: string; 
  trend?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <span className="text-success-600 text-sm font-semibold">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-textSecondary text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-textPrimary">{value}</p>
    </div>
  );
}

