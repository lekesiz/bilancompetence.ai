'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toastError } from '@/components/ui/Toast';
import { api } from '@/lib/api';

interface ArchivedDocument {
  id: string;
  bilan_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_by_name: string;
  created_at: string;
  retention_until: string | null;
}

interface ArchiveStats {
  total_documents: number;
  total_size: number;
  by_type: Record<string, number>;
  earliest_document: string;
  latest_document: string;
  documents_expiring_soon: number;
}

export default function ArchivePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState<ArchivedDocument[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchBilanId, setSearchBilanId] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<ArchivedDocument | null>(null);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [accessLog, setAccessLog] = useState([]);

  // Check authorization
  useEffect(() => {
    if (!isLoading && (!user || !['ADMIN', 'ORG_ADMIN'].includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Fetch documents and stats
  const fetchData = useCallback(async () => {
    const token = api.getAccessToken();
    if (!token) return;

    try {
      setIsLoadingData(true);
      setError(null);

      // Fetch stats
      const statsResponse = await fetch('/api/admin/qualiopi/archive-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch documents
      const docsResponse = await fetch('/api/admin/qualiopi/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!docsResponse.ok) {
        throw new Error('Failed to fetch documents');
      }

      const docsData = await docsResponse.json();
      setDocuments(docsData.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Fetch access log for document
  const fetchAccessLog = useCallback(async (docId: string) => {
    const token = api.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/qualiopi/documents/${docId}/access-log`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccessLog(data.data || []);
      }
    } catch (err) {
      toastError('Failed to fetch access log');
    }
  }, []);

  useEffect(() => {
    if (user && api.isAuthenticated()) {
      fetchData();
    }
  }, [user, fetchData]);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== 'ALL' && doc.document_type !== filterType) return false;
    if (searchBilanId && !doc.bilan_id.includes(searchBilanId)) return false;
    return true;
  });

  const getDocumentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      PRELIMINARY: '📋',
      INVESTIGATION: '🔍',
      CONCLUSION: '✅',
      REPORT: '📊',
      EVIDENCE: '📄',
      OTHER: '📁',
    };
    return icons[type] || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Döküman Arşivi
          </h1>
          <p className="text-gray-600 mt-1">
            Arşivlenmiş bilans dökümanlarını yönet ve erişim günlüğünü kontrol et
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Archive Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="text-sm text-blue-700 font-medium">Toplam Döküman</div>
            <div className="text-4xl font-bold text-blue-900 mt-2">{stats.total_documents}</div>
            <div className="text-xs text-blue-600 mt-2">
              Toplam boyut: {formatFileSize(stats.total_size)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
            <div className="text-sm text-yellow-700 font-medium">Yakında Silinecek</div>
            <div className="text-4xl font-bold text-yellow-900 mt-2">
              {stats.documents_expiring_soon}
            </div>
            <div className="text-xs text-yellow-600 mt-2">30 gün içinde</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <div className="text-sm text-purple-700 font-medium">Tür Bazında</div>
            <div className="text-sm text-purple-900 mt-2 space-y-1">
              {Object.entries(stats.by_type).slice(0, 3).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Döküman Türü
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tümü</option>
              <option value="PRELIMINARY">📋 Ön Değerlendirme</option>
              <option value="INVESTIGATION">🔍 İnceleme</option>
              <option value="CONCLUSION">✅ Sonuç</option>
              <option value="REPORT">📊 Rapor</option>
              <option value="EVIDENCE">📄 Kanıt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bilans ID Ara
            </label>
            <input
              type="text"
              placeholder="Bilans ID girin..."
              value={searchBilanId}
              onChange={(e) => setSearchBilanId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dosya Adı</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bilans ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Türü</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Boyut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarih</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Döküman bulunamadı
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {doc.file_name}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {doc.bilan_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1">
                        {getDocumentTypeIcon(doc.document_type)} {doc.document_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          fetchAccessLog(doc.id);
                          setShowAccessLog(true);
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Erişim Günlüğü
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Log Modal */}
      {showAccessLog && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Erişim Günlüğü</h2>
              <button
                onClick={() => setShowAccessLog(false)}
                className="text-2xl hover:opacity-75"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDocument.file_name}
              </h3>

              {accessLog.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Henüz erişim kaydı yok
                </p>
              ) : (
                <div className="space-y-3">
                  {accessLog.map((log: any, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {log.accessed_by_name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {log.action === 'VIEW' && '👁️ Görüntüldü'}
                            {log.action === 'DOWNLOAD' && '⬇️ İndirildi'}
                            {log.action === 'SHARE' && '↗️ Paylaşıldı'}
                            {log.action === 'DELETE_REQUEST' && '🗑️ Silme İsteği'}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(log.accessed_at).toLocaleDateString('tr-TR')}
                          {' '}
                          {new Date(log.accessed_at).toLocaleTimeString('tr-TR')}
                        </div>
                      </div>
                      {log.user_ip && (
                        <div className="text-xs text-gray-500 mt-2 font-mono">
                          IP: {log.user_ip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

