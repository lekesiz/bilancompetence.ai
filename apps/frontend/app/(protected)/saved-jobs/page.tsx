'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJobRecommendations, SavedJob } from '@/hooks/useJobRecommendations';
import {
  SavedJobsList,
  JobDetailsModal,
  JobCompetencyMatcher,
} from '@/components/recommendations';

/**
 * Saved Jobs Page
 *
 * Displays user's saved jobs and allows management.
 * Features:
 * - View all saved jobs
 * - Filter by status (Interested, Applied, Saved)
 * - Update job status
 * - Remove jobs from saved list
 * - View job details
 * - Skill matching analysis
 */
export default function SavedJobsPage() {
  const { user } = useAuth();
  const {
    savedJobs,
    loading,
    error,
    getSavedJobs,
    removeSavedJob,
    updateSavedJob,
  } = useJobRecommendations();

  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [competencyMatcherOpen, setCompetencyMatcherOpen] = useState(false);

  // Load saved jobs on component mount
  useEffect(() => {
    if (user?.id) {
      getSavedJobs(user.id);
    }
  }, [user?.id]);

  /**
   * Handle remove job
   */
  const handleRemoveJob = async (jobId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this job?');
    if (confirmed) {
      const result = await removeSavedJob(jobId);
      if (result) {
        // Refresh saved jobs
        if (user?.id) {
          getSavedJobs(user.id);
        }
      }
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = (job: SavedJob) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  /**
   * Handle view competency matcher
   */
  const handleViewCompetencyMatcher = (job: SavedJob) => {
    setSelectedJob(job);
    setCompetencyMatcherOpen(true);
  };

  /**
   * Handle status change
   */
  const handleStatusChange = async (jobId: string, newStatus: 'interested' | 'applied' | 'saved') => {
    const result = await updateSavedJob(jobId, { status: newStatus });
    if (result && user?.id) {
      getSavedJobs(user.id);
    }
  };

  /**
   * Get statistics
   */
  const stats = {
    total: savedJobs.length,
    applied: savedJobs.filter((j) => j.status === 'applied').length,
    interested: savedJobs.filter((j) => j.status === 'interested').length,
    saved: savedJobs.filter((j) => j.status === 'saved').length,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Your Saved Jobs
        </h1>
        <p className="text-purple-100 text-lg mb-4">
          Manage your applications and track jobs you're interested in
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-purple-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-purple-100 text-sm">Total Saved</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-success-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-green-100 text-sm">Applied</p>
            <p className="text-3xl font-bold text-white">{stats.applied}</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Interested</p>
            <p className="text-3xl font-bold text-white">{stats.interested}</p>
          </div>
          <div className="bg-gray-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-100 text-sm">Bookmarked</p>
            <p className="text-3xl font-bold text-white">{stats.saved}</p>
          </div>
        </div>
      </div>

      {/* Back to Recommendations Link */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Your Applications</h2>
          <p className="text-gray-600 text-sm mt-1">
            Track and organize your job applications
          </p>
        </div>
        <a
          href="/recommendations"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
        >
          <span>←</span>
          <span>Back to Recommendations</span>
        </a>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Saved Jobs</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && savedJobs.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && savedJobs.length === 0 && !error && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📌</div>
          <h3 className="text-xl font-semibold text-purple-900 mb-2">
            No Saved Jobs Yet
          </h3>
          <p className="text-purple-700 mb-6">
            Start exploring job recommendations and save the ones you're interested in!
          </p>
          <a
            href="/recommendations"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all"
          >
            Browse Recommendations
          </a>
        </div>
      )}

      {/* Saved Jobs List */}
      {savedJobs.length > 0 && (
        <SavedJobsList
          savedJobs={savedJobs}
          loading={loading}
          error={null}
          onRemove={handleRemoveJob}
          onViewDetails={handleViewDetails}
          onStatusChange={handleStatusChange}
          totalCount={savedJobs.length}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          isSaved={true}
        />
      )}

      {/* Competency Matcher Modal */}
      {selectedJob && competencyMatcherOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Skill Match Analysis</h2>
              <button
                onClick={() => setCompetencyMatcherOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">
              <JobCompetencyMatcher
                job={selectedJob}
                onClose={() => setCompetencyMatcherOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Application Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application Strategy */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Application Strategy
          </h3>
          <ol className="space-y-3 text-blue-800">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Mark jobs as "Applied" when you submit an application</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Use "Interested" for jobs you want to apply to soon</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Track all applications to follow up after 1-2 weeks</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Check skill match to identify gaps to address</span>
            </li>
          </ol>
        </div>

        {/* Next Steps */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✨ Next Steps
          </h3>
          <ul className="space-y-3 text-green-800">
            <li className="flex gap-3">
              <span>✓</span>
              <span>Review the skill match analysis for each job</span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>Prepare your application materials (CV, cover letter)</span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>Practice for potential interviews</span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>Follow up with companies after applying</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions Card */}
      {savedJobs.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
          <h3 className="text-lg font-semibold text-pink-900 mb-4">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-all">
              📧 Export to Email
            </button>
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-all">
              📋 Generate Report
            </button>
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-all">
              🔔 Set Reminders
            </button>
            <a
              href="/recommendations"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-all text-center"
            >
              🔍 Find More Jobs
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
