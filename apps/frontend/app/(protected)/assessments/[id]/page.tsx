'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Assessment {
  id: string;
  title: string;
  description?: string;
  status: string;
  assessment_type: string;
  current_step: number;
  progress_percentage: number;
  created_at: string;
  submitted_at?: string;
  completed_at?: string;
  questions?: any[];
  answers?: any[];
  competencies?: any[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`${API_URL}/api/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }

      const data = await response.json();
      setAssessment(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assessment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'DRAFT': 'bg-gray-200 text-gray-800',
      'IN_PROGRESS': 'bg-blue-200 text-blue-800',
      'SUBMITTED': 'bg-yellow-200 text-yellow-800',
      'UNDER_REVIEW': 'bg-purple-200 text-purple-800',
      'COMPLETED': 'bg-green-200 text-green-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-900 mb-2">Error</h1>
          <p className="text-red-700">{error || 'Assessment not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-red-600 hover:text-red-800 font-semibold"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const isDraft = assessment.status === 'DRAFT' || assessment.status === 'IN_PROGRESS';
  const isCompleted = assessment.status === 'COMPLETED';
  const isSubmitted = assessment.status === 'SUBMITTED';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{assessment.title}</h1>
              <p className="text-gray-600 mt-2">{assessment.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(assessment.status)}`}>
              {assessment.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-700">Type</p>
              <p className="mt-1">{assessment.assessment_type}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Progress</p>
              <p className="mt-1">{assessment.progress_percentage}%</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Created</p>
              <p className="mt-1">{new Date(assessment.created_at).toLocaleDateString()}</p>
            </div>
            {assessment.submitted_at && (
              <div>
                <p className="font-semibold text-gray-700">Submitted</p>
                <p className="mt-1">{new Date(assessment.submitted_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isDraft && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${assessment.progress_percentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Step {assessment.current_step} of 5 completed ({assessment.progress_percentage}%)
            </p>
          </div>
        )}

        {/* Draft Resume */}
        {isDraft && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Resume Assessment</h3>
            <p className="text-blue-800 text-sm mb-4">
              You have an incomplete assessment. Continue where you left off.
            </p>
            <button
              onClick={() => router.push(`/assessments/${assessmentId}/wizard`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Continue Assessment
            </button>
          </div>
        )}

        {/* Submitted Status */}
        {isSubmitted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Assessment Submitted</h3>
            <p className="text-yellow-800 text-sm mb-4">
              Your assessment has been submitted for review. A consultant will review your responses and provide personalized recommendations.
            </p>
            <p className="text-sm text-yellow-700">
              Expected review time: 2-5 business days
            </p>
          </div>
        )}

        {/* Completed Status */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Assessment Completed</h3>
            <p className="text-green-800 text-sm mb-4">
              Your assessment has been reviewed and recommendations are ready.
            </p>
            <button
              onClick={() => router.push(`/assessments/${assessmentId}/results`)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              View Recommendations
            </button>
          </div>
        )}

        {/* Skills Summary */}
        {assessment.competencies && assessment.competencies.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Skills Assessed ({assessment.competencies.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {assessment.competencies.slice(0, 12).map((comp) => (
                <div key={comp.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-800">{comp.skill_name}</p>
                  <div className="mt-2 flex gap-2 text-xs text-gray-600">
                    <span>Level: {comp.self_assessment_level}/4</span>
                    <span>Interest: {comp.self_interest_level}/10</span>
                  </div>
                </div>
              ))}
            </div>
            {assessment.competencies.length > 12 && (
              <p className="text-sm text-gray-600 mt-4">
                +{assessment.competencies.length - 12} more skills
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            ← Back
          </button>
          {isDraft && (
            <button
              onClick={() => router.push(`/assessments/${assessmentId}/wizard`)}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Continue Assessment →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
