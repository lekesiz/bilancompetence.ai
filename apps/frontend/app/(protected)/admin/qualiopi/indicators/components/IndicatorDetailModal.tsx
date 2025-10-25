'use client';

import { useState, useEffect } from 'react';
import { toastError, toastSuccess } from '@/components/ui/Toast';
import { Indicator } from '../types';
import { api } from '@/lib/api';

interface Evidence {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  description: string;
  uploaded_by_name: string;
  created_at: string;
}

interface IndicatorDetail {
  indicator: any;
  status: {
    status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW';
    notes: string | null;
  };
  evidence: Evidence[];
}

interface IndicatorDetailModalProps {
  indicator: Indicator;
  onClose: () => void;
  onSave: () => void;
}

export default function IndicatorDetailModal({
  indicator,
  onClose,
  onSave,
}: IndicatorDetailModalProps) {
  const [details, setDetails] = useState<IndicatorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW'>(
    indicator.status
  );
  const [notes, setNotes] = useState('');
  const [newEvidence, setNewEvidence] = useState({
    fileName: '',
    fileUrl: '',
    fileSize: 0,
    fileType: '',
    description: '',
  });
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  // Fetch indicator details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/admin/qualiopi/indicators/${indicator.indicator_id}`);
        if (response.data.status !== 'success') throw new Error('Failed to fetch indicator details');
        const data = response.data;
        setDetails(data.data);
        setNewStatus(data.data.status.status);
        setNotes(data.data.status.notes || '');
      } catch (err) {
        toastError('Failed to load indicator details');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [indicator.indicator_id, onClose]);

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      setIsSaving(true);
      const response = await api.put(`/api/admin/qualiopi/indicators/${indicator.indicator_id}`, {
        status: newStatus,
        notes,
      });
      if (response.data.status !== 'success') throw new Error('Failed to update indicator');

      toastSuccess(`Gösterge #${indicator.indicator_id} başarıyla güncellendi`);
      onSave();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update indicator');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add evidence
  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const response = await api.post(`/api/admin/qualiopi/indicators/${indicator.indicator_id}/evidence`, newEvidence);
      if (response.data.status !== 'success') throw new Error('Failed to add evidence');

      toastSuccess('Kanıt dosyası başarıyla eklendi');
      setNewEvidence({
        fileName: '',
        fileUrl: '',
        fileSize: 0,
        fileType: '',
        description: '',
      });
      setShowEvidenceForm(false);
      onSave();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to add evidence');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Gösterge #{indicator.indicator_id}: {indicator.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-75 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Indicator Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Açıklama</h3>
            <p className="text-gray-700 dark:text-gray-200">{details.indicator.description}</p>
          </div>

          {/* Status Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Durum Güncelle</h3>

            {/* Status Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MISSING">❌ Eksik</option>
                <option value="UNDER_REVIEW">🔄 İnceleme Altında</option>
                <option value="COMPLIANT">✅ Uyumlu</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Notlar
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bu gösterge hakkında notlar yazın..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleStatusUpdate}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {isSaving ? 'Kaydediliyor...' : 'Durumu Kaydet'}
            </button>
          </div>

          {/* Evidence Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kanıt Dosyaları ({details.evidence.length})
              </h3>
              <button
                onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
              >
                ➕ Kanıt Ekle
              </button>
            </div>

            {/* Add Evidence Form */}
            {showEvidenceForm && (
              <form onSubmit={handleAddEvidence} className="bg-gray-50 p-4 rounded mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Dosya Adı"
                  value={newEvidence.fileName}
                  onChange={(e) => setNewEvidence({ ...newEvidence, fileName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
                <input
                  type="url"
                  placeholder="Dosya URL'i"
                  value={newEvidence.fileUrl}
                  onChange={(e) => setNewEvidence({ ...newEvidence, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Dosya Boyutu (bytes)"
                  value={newEvidence.fileSize}
                  onChange={(e) => setNewEvidence({ ...newEvidence, fileSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosya Türü (örn: application/pdf)"
                  value={newEvidence.fileType}
                  onChange={(e) => setNewEvidence({ ...newEvidence, fileType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <textarea
                  placeholder="Açıklama"
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
                  >
                    {isSaving ? 'Yükleniyor...' : 'Kanıt Ekle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEvidenceForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 dark:text-gray-200 rounded text-sm hover:bg-gray-400 transition"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}

            {/* Evidence List */}
            <div className="space-y-2">
              {details.evidence.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">Henüz kanıt dosyası eklenmemiş</p>
              ) : (
                details.evidence.map((ev) => (
                  <div key={ev.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a
                          href={ev.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline text-sm"
                        >
                          📄 {ev.file_name}
                        </a>
                        {ev.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{ev.description}</p>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2">
                          {ev.uploaded_by_name} • {new Date(ev.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

