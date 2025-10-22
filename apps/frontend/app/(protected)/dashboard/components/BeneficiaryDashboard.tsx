'use client';

import Link from 'next/link';
import { useBeneficiaryDashboardData } from '../hooks/useDashboardData';
import {
  StatCard,
  AssessmentCard,
  RecommendationsPanel,
} from './dashboard-components';

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100">Here's your assessment progress and recommendations</p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Assessments"
            value={stats.totalAssessments}
            loading={loading}
          />
          <StatCard
            title="Completed"
            value={stats.completedAssessments}
            loading={loading}
          />
          <StatCard
            title="Pending"
            value={stats.pendingAssessments}
            loading={loading}
          />
          {stats.averageSatisfaction !== undefined && (
            <StatCard
              title="Satisfaction Score"
              value={`${stats.averageSatisfaction.toFixed(1)}/5`}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Active Assessments Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Assessments</h2>
          {assessments.length === 0 && !loading && (
            <Link
              href="/assessments/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Assessment
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No assessments yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first assessment to get personalized recommendations and insights
            </p>
            <Link
              href="/assessments/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
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
                  // Navigate to edit assessment
                  window.location.href = `/assessments/${assessment.id}/edit`;
                }}
                onView={() => {
                  // Navigate to view results
                  window.location.href = `/assessments/${assessment.id}`;
                }}
                onDelete={() => {
                  // Handle delete
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">AI-Powered Recommendations</h2>
          <RecommendationsPanel
            recommendations={recommendations}
            userRole="BENEFICIARY"
          />
        </div>
      )}

      {/* Empty state for recommendations */}
      {!loading && recommendations.length === 0 && assessments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-900 font-semibold mb-2">Get Personalized Recommendations</h3>
          <p className="text-blue-700">
            Complete an assessment to receive AI-powered job matches, training suggestions, and skill improvement tips.
          </p>
        </div>
      )}

      {/* Footer message */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-gray-800 font-semibold mb-2">Need help?</h3>
        <p className="text-gray-600 text-sm">
          Visit our <Link href="/help" className="text-blue-600 hover:underline">help center</Link> or{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">contact support</Link> for assistance with your assessments.
        </p>
      </div>
    </div>
  );
}
