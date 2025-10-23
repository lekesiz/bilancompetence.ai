'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toastError } from '@/components/ui/Toast';
import { api } from '@/lib/api';

interface SurveyAnalytics {
  total_sent: number;
  total_responded: number;
  response_rate: number;
  nps_score: number;
  average_satisfaction: number;
  questions_data: any[];
  consultant_performance: any[];
}

export default function SurveysPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (!isLoading && (!user || !['ADMIN', 'ORG_ADMIN'].includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    const token = api.getAccessToken();
    if (!token) return;

    try {
      setIsLoadingData(true);
      setError(null);

      const response = await fetch('/api/admin/qualiopi/surveys/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user && api.isAuthenticated()) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || !['ADMIN', 'ORG_ADMIN'].includes(user.role)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">Access Denied</h2>
        <p className="text-red-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getNPSCategory = (score: number) => {
    if (score >= 50) return { label: '🟢 Mükemmel', color: 'text-green-600' };
    if (score >= 0) return { label: '🟡 İyi', color: 'text-yellow-600' };
    return { label: '🔴 İyileştirilmesi Gerekli', color: 'text-red-600' };
  };

  const npsCategory = analytics ? getNPSCategory(analytics.nps_score) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Memnuniyet Anketi Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Katılımcı geri bildirimi ve memnuniyet metriklerini analiz edin
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Yenile
        </button>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* NPS Score */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <div className="text-sm text-purple-700 font-medium">NPS Skoru</div>
              <div className={`text-4xl font-bold mt-2 ${npsCategory?.color}`}>
                {analytics.nps_score}
              </div>
              <div className="text-xs text-purple-600 mt-2">{npsCategory?.label}</div>
            </div>

            {/* Response Rate */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <div className="text-sm text-blue-700 font-medium">Yanıt Oranı</div>
              <div className="text-4xl font-bold text-blue-900 mt-2">
                {analytics.response_rate}%
              </div>
              <div className="h-2 bg-blue-200 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${analytics.response_rate}%` }}
                ></div>
              </div>
            </div>

            {/* Avg Satisfaction */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="text-sm text-green-700 font-medium">Ort. Memnuniyet</div>
              <div className="text-4xl font-bold text-green-900 mt-2">
                {analytics.average_satisfaction}/10
              </div>
              <div className="text-xs text-green-600 mt-2">
                {Array(Math.round(analytics.average_satisfaction))
                  .fill('⭐')
                  .join('')}
              </div>
            </div>

            {/* Total Sent */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
              <div className="text-sm text-orange-700 font-medium">Gönderilen</div>
              <div className="text-4xl font-bold text-orange-900 mt-2">
                {analytics.total_sent}
              </div>
              <div className="text-xs text-orange-600 mt-2">Anket</div>
            </div>

            {/* Total Responded */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg p-6">
              <div className="text-sm text-cyan-700 font-medium">Yanıtlanan</div>
              <div className="text-4xl font-bold text-cyan-900 mt-2">
                {analytics.total_responded}
              </div>
              <div className="text-xs text-cyan-600 mt-2">Anket</div>
            </div>
          </div>

          {/* Questions Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Soru Bazında Analiz</h2>
            <div className="space-y-4">
              {analytics.questions_data.slice(0, 5).map((question, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Soru {question.question_number}
                    </span>
                    {question.average_score && (
                      <span className="text-lg font-bold text-blue-600">
                        {question.average_score}/10
                      </span>
                    )}
                  </div>
                  {question.average_score && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(question.average_score / 10) * 100}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {question.response_count} yanıt
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consultant Performance */}
          {analytics.consultant_performance.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Danışman Performansı</h2>
              <div className="space-y-3">
                {analytics.consultant_performance.map((consultant, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-200 rounded p-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {consultant.consultant_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {consultant.survey_count} anket
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {consultant.average_score}/10
                      </div>
                      <div className="text-xs text-gray-500">Ort. Puan</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

