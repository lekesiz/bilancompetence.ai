'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import IndicatorBoard from './components/IndicatorBoard';
import IndicatorDetailModal from './components/IndicatorDetailModal';
import { toast } from '@/components/ui/Toast';

interface Indicator {
  indicator_id: number;
  name: string;
  status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW';
  evidence_count: number;
  last_reviewed_at: string | null;
  reviewed_by_name: string | null;
}

interface ComplianceMetrics {
  overall_percentage: number;
  compliant_count: number;
  missing_count: number;
  under_review_count: number;
  last_audit_date: string | null;
}

export default function QualiopsIndicatorsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW'>('ALL');

  // Check authorization
  useEffect(() => {
    if (!isLoading && (!user || !['ADMIN', 'ORG_ADMIN'].includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Fetch indicators and metrics
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingData(true);
      setError(null);

      // Fetch indicators
      const indicatorsResponse = await fetch('/api/admin/qualiopi/indicators', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!indicatorsResponse.ok) {
        throw new Error('Failed to fetch indicators');
      }

      const indicatorsData = await indicatorsResponse.json();
      setIndicators(indicatorsData.data || []);

      // Fetch compliance metrics
      const metricsResponse = await fetch('/api/admin/qualiopi/compliance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  // Initial data load
  useEffect(() => {
    if (token && user) {
      fetchData();
    }
  }, [token, user, fetchData]);

  // Filter indicators
  const filteredIndicators = indicators.filter((ind) => {
    if (filterStatus === 'ALL') return true;
    return ind.status === filterStatus;
  });

  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
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

  if (error && !indicators.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchData()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Qualiopi Uyumluluk Göstergeleri
          </h1>
          <p className="text-gray-600 mt-1">
            32 göstergenin durumunu ve uyumluluk yüzdesini takip edin
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Compliance Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <div className="text-sm text-green-700 font-medium">Genel Uyumluluk</div>
            <div className="text-4xl font-bold text-green-900 mt-2">
              {metrics.overall_percentage}%
            </div>
            <div className="h-2 bg-green-200 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${metrics.overall_percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="text-sm text-blue-700 font-medium">✅ Uyumlu</div>
            <div className="text-4xl font-bold text-blue-900 mt-2">
              {metrics.compliant_count}
            </div>
            <div className="text-xs text-blue-600 mt-4">32'den</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
            <div className="text-sm text-yellow-700 font-medium">🔄 İnceleme Altında</div>
            <div className="text-4xl font-bold text-yellow-900 mt-2">
              {metrics.under_review_count}
            </div>
            <div className="text-xs text-yellow-600 mt-4">32'den</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
            <div className="text-sm text-red-700 font-medium">❌ Eksik</div>
            <div className="text-4xl font-bold text-red-900 mt-2">
              {metrics.missing_count}
            </div>
            <div className="text-xs text-red-600 mt-4">32'den</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'COMPLIANT', 'MISSING', 'UNDER_REVIEW'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'ALL' && 'Tümü'}
            {status === 'COMPLIANT' && '✅ Uyumlu'}
            {status === 'MISSING' && '❌ Eksik'}
            {status === 'UNDER_REVIEW' && '🔄 İnceleme Altında'}
          </button>
        ))}
      </div>

      {/* Indicators Board */}
      <IndicatorBoard
        indicators={filteredIndicators}
        onSelectIndicator={(indicator) => {
          setSelectedIndicator(indicator);
          setShowDetailModal(true);
        }}
        onRefresh={() => fetchData()}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedIndicator && (
        <IndicatorDetailModal
          indicator={selectedIndicator}
          token={token}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedIndicator(null);
          }}
          onSave={() => {
            fetchData();
            setShowDetailModal(false);
            setSelectedIndicator(null);
          }}
        />
      )}
    </div>
  );
}

