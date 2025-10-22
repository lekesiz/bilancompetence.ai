'use client';

import { useAdminDashboardData } from '../hooks/useDashboardData';
import {
  StatCard,
  UserManagementTable,
  AnalyticsPanel,
} from './dashboard-components';

export function AdminDashboard() {
  const { data, loading, error } = useAdminDashboardData();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    averageSatisfaction: 0,
  };

  const organization = data?.organization || {
    name: 'Organization',
    plan: 'Premium',
  };

  const users = data?.users || [];
  const analytics = data?.analytics?.chartData || {
    completionTrend: [],
    statusDistribution: [],
    roleDistribution: [],
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Organization Dashboard</h1>
        <p className="text-red-100">Manage users, assessments, and organization metrics</p>
      </div>

      {/* Organization Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Organization Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Organization Name</p>
            <p className="text-lg font-semibold text-gray-800">{organization.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Plan</p>
            <p className="text-lg font-semibold text-gray-800">{organization.plan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-lg font-semibold text-green-600">Active</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Storage Used</p>
            <p className="text-lg font-semibold text-gray-800">--</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            loading={loading}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            loading={loading}
          />
          <StatCard
            title="Total Assessments"
            value={stats.totalAssessments}
            loading={loading}
          />
          <StatCard
            title="Completed Assessments"
            value={stats.completedAssessments}
            loading={loading}
          />
          {stats.averageSatisfaction !== undefined && (
            <StatCard
              title="User Satisfaction"
              value={`${stats.averageSatisfaction.toFixed(1)}/5`}
              loading={loading}
            />
          )}
          {stats.activeSessionsCount !== undefined && (
            <StatCard
              title="Active Sessions"
              value={stats.activeSessionsCount}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.completionTrend && analytics.completionTrend.length > 0 && (
            <AnalyticsPanel
              data={analytics.completionTrend}
              title="Completion Trend (Last 30 Days)"
              chartType="line"
              loading={loading}
            />
          )}
          {analytics.statusDistribution && analytics.statusDistribution.length > 0 && (
            <AnalyticsPanel
              data={analytics.statusDistribution}
              title="Assessment Status Distribution"
              chartType="bar"
              loading={loading}
            />
          )}
          {analytics.roleDistribution && analytics.roleDistribution.length > 0 && (
            <AnalyticsPanel
              data={analytics.roleDistribution}
              title="User Distribution by Role"
              chartType="pie"
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* User Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Add User
          </button>
        </div>

        {loading ? (
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        ) : (
          <UserManagementTable
            users={users}
            onEdit={(userId) => {
              window.location.href = `/admin/users/${userId}`;
            }}
            onDelete={(userId) => {
              if (confirm('Are you sure you want to delete this user?')) {
                console.log('Delete user:', userId);
              }
            }}
          />
        )}
      </div>

      {/* Compliance & Reports */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Compliance</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">QUALIOPI Certification</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
              <span className="text-gray-800">Data Protection & Privacy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
              <span className="text-gray-800">Assessment Quality</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                ⚠
              </div>
              <span className="text-gray-800">User Feedback & Satisfaction</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generate Compliance Report
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tips */}
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <h3 className="text-red-900 font-semibold mb-2">Admin Tips</h3>
        <ul className="text-red-700 text-sm space-y-2">
          <li>• Monitor user activity regularly to ensure platform health</li>
          <li>• Review assessment completion rates and adjust support as needed</li>
          <li>• Maintain QUALIOPI compliance by reviewing satisfaction metrics monthly</li>
          <li>• Export compliance reports for audit purposes</li>
        </ul>
      </div>
    </div>
  );
}
