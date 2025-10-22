'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';

interface ComplianceReport {
  report_id: string;
  generated_at: string;
  organization_name: string;
  overall_compliance_percentage: number;
  audit_readiness: boolean;
  summary: {
    total_indicators: number;
    compliant: number;
    missing: number;
    under_review: number;
  };
  next_steps: string[];
  audit_schedule: {
    self_assessment_deadline: string;
    external_audit_period: string;
  };
}

export default function ReportsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [includeEvidence, setIncludeEvidence] = useState(false);

  // Check authorization
  useEffect(() => {
    if (!isLoading && (!user || !['ADMIN', 'ORG_ADMIN'].includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Generate report
  const generateReport = useCallback(async () => {
    if (!token) return;

    try {
      setIsGenerating(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('format', 'json');
      if (includeEvidence) params.append('includeEvidence', 'true');

      const response = await fetch(`/api/admin/qualiopi/compliance-report?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReport(data);
      toast.success('Rapor başarıyla oluşturuldu');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [token, includeEvidence]);

  // Export report
  const exportReport = async () => {
    if (!token || !report) return;

    try {
      const params = new URLSearchParams();
      params.append('format', exportFormat);
      if (includeEvidence) params.append('includeEvidence', 'true');

      const response = await fetch(`/api/admin/qualiopi/compliance-report?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Rapor ${exportFormat.toUpperCase()} formatında indirildi`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Uyumluluk Raporu
        </h1>
        <p className="text-gray-600 mt-1">
          Qualiopi uyumluluk raporunu oluştur ve indir
        </p>
      </div>

      {/* Generation Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeEvidence}
              onChange={(e) => setIncludeEvidence(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700 font-medium">
              Kanıt dosyalarını raporda dahil et
            </span>
          </label>
        </div>

        <button
          onClick={() => generateReport()}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
        >
          {isGenerating ? '⌛ Rapor Oluşturuluyor...' : '📊 Rapor Oluştur'}
        </button>
      </div>

      {report && (
        <>
          {/* Report Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Compliance */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="text-sm text-green-700 font-medium">Genel Uyumluluk</div>
              <div className="text-4xl font-bold text-green-900 mt-2">
                {report.overall_compliance_percentage}%
              </div>
              <div className="h-2 bg-green-200 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${report.overall_compliance_percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Compliant */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <div className="text-sm text-blue-700 font-medium">✅ Uyumlu</div>
              <div className="text-4xl font-bold text-blue-900 mt-2">
                {report.summary.compliant}
              </div>
              <div className="text-xs text-blue-600 mt-2">32'den</div>
            </div>

            {/* Under Review */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
              <div className="text-sm text-yellow-700 font-medium">🔄 İnceleme</div>
              <div className="text-4xl font-bold text-yellow-900 mt-2">
                {report.summary.under_review}
              </div>
              <div className="text-xs text-yellow-600 mt-2">32'den</div>
            </div>

            {/* Audit Readiness */}
            <div className={`bg-gradient-to-br ${
              report.audit_readiness
                ? 'from-green-50 to-green-100 border-green-200'
                : 'from-orange-50 to-orange-100 border-orange-200'
            } border rounded-lg p-6`}>
              <div className={`text-sm font-medium ${
                report.audit_readiness ? 'text-green-700' : 'text-orange-700'
              }`}>
                Audit Hazırlığı
              </div>
              <div className={`text-4xl font-bold mt-2 ${
                report.audit_readiness ? 'text-green-900' : 'text-orange-900'
              }`}>
                {report.audit_readiness ? '✅' : '⚠️'}
              </div>
              <div className={`text-xs mt-2 ${
                report.audit_readiness ? 'text-green-600' : 'text-orange-600'
              }`}>
                {report.audit_readiness ? 'Hazır' : 'Hazır Değil'}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Raporu İndir</h2>

            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="json">📄 JSON Formatı</option>
                <option value="csv">📊 CSV Formatı</option>
              </select>

              <button
                onClick={() => exportReport()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                ⬇️ İndir
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Rapor, göstergelerin durumunu, memnuniyet metriklerini ve tavsiye edilen adımları içerir.
            </p>
          </div>

          {/* Audit Schedule */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Audit Takvimi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded p-4">
                <div className="font-medium text-gray-900">Kendi Değerlendirmesi</div>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {new Date(report.audit_schedule.self_assessment_deadline).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <div className="font-medium text-gray-900">Harici Audit</div>
                <div className="text-2xl font-bold text-purple-600 mt-2">
                  {report.audit_schedule.external_audit_period}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sonraki Adımlar</h2>
            <div className="space-y-3">
              {report.next_steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Rapor ID: <span className="font-mono font-medium">{report.report_id}</span></span>
              <span>Oluşturma Tarihi: {new Date(report.generated_at).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

