'use client';

import Link from 'next/link';
import { useBeneficiaryDashboardData } from '../hooks/useDashboardData';
import {
  StatCard,
  AssessmentCard,
  RecommendationsPanel,
  ChartPlaceholder,
} from './dashboard-components';
import { Plus, TrendingUp, Target, Award } from 'lucide-react';

export function BeneficiaryDashboard() {
  const { data, loading, error } = useBeneficiaryDashboardData();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
  };

  const assessments = data?.bilans || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-blue-100 text-lg">Here's your assessment progress and personalized recommendations</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Your Progress Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Assessments"
            value={stats.totalAssessments}
            loading={loading}
            variant="info"
            description="All time assessments"
            trend={stats.totalAssessments > 0 ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard
            title="Completed"
            value={stats.completedAssessments}
            loading={loading}
            variant="success"
            description="Successfully finished"
            trend={stats.completedAssessments > 0 ? { value: 8, isPositive: true } : undefined}
          />
          <StatCard
            title="In Progress"
            value={stats.pendingAssessments}
            loading={loading}
            variant="warning"
            description="Currently working on"
          />
          {stats.averageSatisfaction !== undefined && (
            <StatCard
              title="Satisfaction Score"
              value={`${stats.averageSatisfaction.toFixed(1)}/5`}
              loading={loading}
              variant="success"
              description="Based on feedback"
              trend={{ value: 5, isPositive: true }}
            />
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Assessment Progress Trend"
          chartType="line"
          data={assessments.length > 0 ? assessments : []}
          loading={loading}
        />
        <ChartPlaceholder
          title="Skill Development Areas"
          chartType="pie"
          data={recommendations.length > 0 ? recommendations : []}
          loading={loading}
        />
      </div>

      {/* Active Assessments Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Your Assessments
          </h2>
          {assessments.length === 0 && !loading && (
            <Link
              href="/assessments/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Start New Assessment
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No assessments yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your first assessment to get personalized recommendations and insights about your career development
            </p>
            <Link
              href="/assessments/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onEdit={() => {
                  window.location.href = `/assessments/${assessment.id}/edit`;
                }}
                onView={() => {
                  window.location.href = `/assessments/${assessment.id}`;
                }}
                onDelete={() => {
                  console.log('Delete assessment:', assessment.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-success-600" />
            AI-Powered Recommendations
          </h2>
          <RecommendationsPanel
            recommendations={recommendations}
            userRole="BENEFICIARY"
          />
        </div>
      )}

      {/* Empty state for recommendations */}
      {!loading && recommendations.length === 0 && assessments.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Get Personalized Recommendations
          </h3>
          <p className="text-blue-700">
            Complete an assessment to receive AI-powered job matches, training suggestions, and skill improvement tips tailored to your career goals.
          </p>
        </div>
      )}

      {/* Footer message */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-800 font-semibold mb-2">Need help?</h3>
        <p className="text-gray-600 text-sm">
          Visit our <Link href="/help" className="text-blue-600 hover:underline font-medium">help center</Link> or{' '}
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">contact support</Link> for assistance with your assessments.
        </p>
      </div>
    </div>
  );
}