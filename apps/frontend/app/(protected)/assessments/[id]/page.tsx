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

type ReportType = 'preliminary' | 'investigation' | 'conclusion';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<ReportType>('preliminary');
  const [showReportTypeSelector, setShowReportTypeSelector] = useState(false);

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

  /**
   * Handle PDF download - fetches PDF from backend and triggers browser download
   */
  const handleDownloadPDF = async () => {
    try {
      setPdfDownloading(true);
      setPdfError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setPdfError('Authentication required. Please log in again.');
        return;
      }

      // Build API endpoint with report type
      const apiEndpoint = `${API_URL}/api/export/assessment/${assessmentId}/pdf?type=${reportType}`;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle error responses
      if (!response.ok) {
        let errorMessage = 'Failed to generate PDF';

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to download this assessment.';
        } else if (response.status === 404) {
          errorMessage = 'Assessment not found.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid report type selected.';
        } else if (response.status === 500) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || 'Server error while generating PDF.';
          } catch {
            errorMessage = 'Server error while generating PDF.';
          }
        }

        setPdfError(errorMessage);
        return;
      }

      // Get the PDF blob from response
      const blob = await response.blob();

      // Verify we got a valid PDF
      if (blob.type !== 'application/pdf' || blob.size === 0) {
        setPdfError('Invalid PDF file received from server.');
        return;
      }

      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'assessment.pdf';

      if (contentDisposition) {
        // Parse filename from header: attachment; filename="Assessment_Preliminary_550e8400_2025-10-22.pdf"
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      } else {
        // Fallback filename if header not present
        const timestamp = new Date().toISOString().split('T')[0];
        const reportLabel = reportType.charAt(0).toUpperCase() + reportType.slice(1);
        filename = `Assessment_${reportLabel}_${assessmentId.slice(0, 8)}_${timestamp}.pdf`;
      }

      // Create hidden link element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);

      // Reset state
      setShowReportTypeSelector(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF';
      setPdfError(errorMessage);
      console.error('PDF download error:', err);
    } finally {
      setPdfDownloading(false);
    }
  };

  /**
   * Check if PDF download is allowed for this assessment
   */
  const canDownloadPDF = () => {
    if (!assessment) return false;
    // Allow download for non-draft assessments
    return assessment.status !== 'DRAFT' && assessment.status !== 'IN_PROGRESS';
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
            <div className="flex items-center gap-3">
              {/* PDF Download Button */}
              {canDownloadPDF() && (
                <div className="relative">
                  <button
                    onClick={() => setShowReportTypeSelector(!showReportTypeSelector)}
                    disabled={pdfDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {pdfDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>

                  {/* Report Type Dropdown */}
                  {showReportTypeSelector && !pdfDownloading && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <div className="p-3 border-b border-gray-300">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Select Report Type</p>
                        {/* Preliminary Option */}
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="radio"
                            name="reportType"
                            value="preliminary"
                            checked={reportType === 'preliminary'}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Preliminary Report</span>
                        </label>

                        {/* Investigation Option */}
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="radio"
                            name="reportType"
                            value="investigation"
                            checked={reportType === 'investigation'}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="w-4 h-4"
                            disabled={assessment.status === 'PRELIMINARY'}
                          />
                          <span className={`text-sm ${assessment.status === 'PRELIMINARY' ? 'text-gray-400' : 'text-gray-700'}`}>
                            Investigation Report
                          </span>
                        </label>

                        {/* Conclusion Option */}
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="radio"
                            name="reportType"
                            value="conclusion"
                            checked={reportType === 'conclusion'}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="w-4 h-4"
                            disabled={assessment.status !== 'COMPLETED'}
                          />
                          <span className={`text-sm ${assessment.status !== 'COMPLETED' ? 'text-gray-400' : 'text-gray-700'}`}>
                            Conclusion Report
                          </span>
                        </label>
                      </div>

                      <div className="p-3 border-t border-gray-300 flex gap-2">
                        <button
                          onClick={handleDownloadPDF}
                          disabled={pdfDownloading}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50 transition text-sm"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => setShowReportTypeSelector(false)}
                          className="flex-1 bg-gray-300 text-gray-800 px-3 py-2 rounded font-semibold hover:bg-gray-400 transition text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(assessment.status)}`}>
                {assessment.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* PDF Error Message */}
          {pdfError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">PDF Download Failed</h3>
                <p className="text-sm text-red-700 mt-1">{pdfError}</p>
              </div>
              <button
                onClick={() => setPdfError(null)}
                className="text-red-600 hover:text-red-800 font-semibold text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

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
