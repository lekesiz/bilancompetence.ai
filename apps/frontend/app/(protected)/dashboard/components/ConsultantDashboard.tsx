'use client';

import { useConsultantDashboardData } from '../hooks/useDashboardData';
import {
  StatCard,
  ClientCard,
  AssessmentCard,
  RecommendationsPanel,
  ChartPlaceholder,
} from './dashboard-components';
import { Users, TrendingUp, Target, Award, Plus } from 'lucide-react';

export function ConsultantDashboard() {
  const { data, loading, error } = useConsultantDashboardData();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const stats = data?.stats || {
    activeClients: 0,
    inProgressAssessments: 0,
    completedAssessments: 0,
  };

  const clients = data?.clients || [];
  const assessments = data?.assessments || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome, Consultant!</h1>
          <p className="text-green-100 text-lg">Manage your clients and their assessment progress</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-green-600" />
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            loading={loading}
            variant="info"
            description="Currently managed"
            trend={stats.activeClients > 0 ? { value: 15, isPositive: true } : undefined}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressAssessments}
            loading={loading}
            variant="warning"
            description="Assessments ongoing"
          />
          <StatCard
            title="Completed"
            value={stats.completedAssessments}
            loading={loading}
            variant="success"
            description="Successfully finished"
            trend={stats.completedAssessments > 0 ? { value: 8, isPositive: true } : undefined}
          />
          {stats.averageSatisfaction !== undefined && (
            <StatCard
              title="Client Satisfaction"
              value={`${stats.averageSatisfaction.toFixed(1)}/5`}
              loading={loading}
              variant="success"
              description="Based on feedback"
              trend={{ value: 12, isPositive: true }}
            />
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Client Assessment Progress"
          chartType="bar"
          data={assessments.length > 0 ? assessments : []}
          loading={loading}
        />
        <ChartPlaceholder
          title="Client Satisfaction Trend"
          chartType="line"
          data={clients.length > 0 ? clients : []}
          loading={loading}
        />
      </div>

      {/* Clients Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Your Clients
          </h2>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            Invite New Client
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">
              Invite clients to start managing their assessments
            </p>
            <button className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Invite Your First Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onView={() => {
                  window.location.href = `/clients/${client.id}`;
                }}
                onMessage={() => {
                  window.location.href = `/messages/${client.id}`;
                }}
                onAssignAssessment={() => {
                  window.location.href = `/clients/${client.id}/assign-assessment`;
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assessments Needing Attention */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Assessments in Progress</h2>
          <div className="space-y-4">
            {assessments
              .filter((a) => a.status === 'IN_PROGRESS' || a.status === 'SUBMITTED')
              .slice(0, 5)
              .map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onView={() => {
                    window.location.href = `/assessments/${assessment.id}`;
                  }}
                />
              ))}
          </div>
          {assessments.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'SUBMITTED').length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No assessments requiring attention</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Provided */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Recommendations</h2>
          <RecommendationsPanel
            recommendations={recommendations}
            userRole="CONSULTANT"
          />
        </div>
      )}

      {/* Footer message */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-green-900 font-semibold mb-2">Tip</h3>
        <p className="text-green-700 text-sm">
          Keep your client information up to date and review completed assessments regularly to provide better guidance and recommendations.
        </p>
      </div>
    </div>
  );
}
