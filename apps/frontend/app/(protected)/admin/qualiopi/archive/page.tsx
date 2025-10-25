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
    if (!api.isAuthenticated()) return;

    try {
      setIsLoadingData(true);
      setError(null);

      // Fetch stats
      const statsResponse = await api.get('/api/admin/qualiopi/archive-stats');
      if (statsResponse.data.status === 'success') {
        setStats(statsResponse.data.data);
      }

      // Fetch documents
      const docsResponse = await api.get('/api/admin/qualiopi/documents');
      if (docsResponse.data.status === 'success') {
        setDocuments(docsResponse.data.data || []);
      } else {
        throw new Error('Failed to fetch documents');
      }
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
    if (!api.isAuthenticated()) return;

    try {
      const response = await api.get(`/api/admin/qualiopi/documents/${docId}/access-log`);
      if (response.data.status === 'success') {
        setAccessLog(response.data.data || []);
      }
    } catch (err) {
      toastError('Failed to fetch access log');
    }
  }, []);

  useEffect(() => {
    if (api.isAuthenticated() && user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== 'ALL' && doc.document_type !== filterType) return false;
    if (searchBilanId && !doc.bilan_id.toLowerCase().includes(searchBilanId.toLowerCase())) return false;
    return true;
  });

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading archive...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Document Archive</h1>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Documents</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_documents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Size</h3>
            <p className="text-3xl font-bold text-blue-600">
              {(stats.total_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Expiring Soon</h3>
            <p className="text-3xl font-bold text-warning-600">{stats.documents_expiring_soon}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ALL">All Types</option>
              <option value="BILAN">Bilan</option>
              <option value="REPORT">Report</option>
              <option value="CERTIFICATE">Certificate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Search by Bilan ID</label>
            <input
              type="text"
              value={searchBilanId}
              onChange={(e) => setSearchBilanId(e.target.value)}
              placeholder="Enter Bilan ID..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bilan ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {doc.file_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.document_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.bilan_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(doc.file_size / 1024).toFixed(2)} KB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedDocument(doc);
                      fetchAccessLog(doc.id);
                      setShowAccessLog(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View Log
                  </button>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success-600 hover:text-green-900"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No documents found</p>
          </div>
        )}
      </div>

      {/* Access Log Modal */}
      {showAccessLog && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Access Log - {selectedDocument.file_name}</h2>
              <button
                onClick={() => {
                  setShowAccessLog(false);
                  setSelectedDocument(null);
                  setAccessLog([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {accessLog.length > 0 ? (
                accessLog.map((log: any, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="text-sm">
                      <span className="font-semibold">{log.accessed_by_name}</span> accessed on{' '}
                      {new Date(log.accessed_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No access log available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

