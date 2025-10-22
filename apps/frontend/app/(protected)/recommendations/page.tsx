'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJobRecommendations, RecommendationFilters, Job } from '@/hooks/useJobRecommendations';
import {
  JobRecommendationsList,
  JobDetailsModal,
} from '@/components/recommendations';

/**
 * Recommendations Page
 *
 * Displays personalized job recommendations based on user's skills and preferences.
 * Features:
 * - Automatic recommendation loading on page load
 * - Filtering by salary, location, contract type
 * - Sorting by match score, salary, date
 * - Save jobs functionality
 * - Job details modal
 */
export default function RecommendationsPage() {
  const { user } = useAuth();
  const {
    recommendations,
    savedJobs,
    loading,
    error,
    pageInfo,
    getJobRecommendations,
    saveJob,
  } = useJobRecommendations();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<RecommendationFilters>({
    limit: 10,
  });

  // Load recommendations on component mount
  useEffect(() => {
    if (user?.id) {
      getJobRecommendations(currentFilters);
    }
  }, [user?.id]);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = (filters: RecommendationFilters) => {
    setCurrentFilters(filters);
    getJobRecommendations(filters);
  };

  /**
   * Handle job save
   */
  const handleSaveJob = async (jobId: string) => {
    const result = await saveJob(jobId, '', 'saved');
    if (result) {
      // Optionally show a toast notification
      console.log('Job saved successfully');
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  /**
   * Get list of saved job IDs
   */
  const savedJobIds = savedJobs.map((job) => job.id);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Recommended Jobs for You
        </h1>
        <p className="text-blue-100 text-lg mb-4">
          Discover job opportunities that match your skills and experience
        </p>

        {/* User Info and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Total Recommendations</p>
            <p className="text-3xl font-bold text-white">{pageInfo.total}</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Saved Jobs</p>
            <p className="text-3xl font-bold text-white">{savedJobs.length}</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Your Profile</p>
            <p className="text-lg font-bold text-white">{user?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Get Fresh Recommendations Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
          <p className="text-gray-600 text-sm mt-1">
            Showing {recommendations.length} recommendations based on your skills
          </p>
        </div>
        <button
          onClick={() => getJobRecommendations(currentFilters)}
          disabled={loading}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            flex items-center gap-2
            ${
              loading
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          <span>{loading ? '⟳' : '🔄'}</span>
          <span>{loading ? 'Loading...' : 'Refresh Recommendations'}</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Recommendations</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Recommendations State */}
      {!loading && recommendations.length === 0 && !error && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-blue-700 mb-4">
            Complete your assessment first to get personalized job recommendations based on your skills.
          </p>
          <a
            href="/assessments"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
          >
            Start Assessment
          </a>
        </div>
      )}

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <JobRecommendationsList
          jobs={recommendations}
          savedJobIds={savedJobIds}
          loading={loading}
          error={null}
          onSaveJob={handleSaveJob}
          onViewDetails={handleViewDetails}
          onFiltersChange={handleFiltersChange}
          totalCount={pageInfo.total}
          hasMore={false}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveJob}
          isSaved={savedJobIds.includes(selectedJob.id)}
        />
      )}

      {/* Helpful Tips Section */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
          <div className="flex gap-3">
            <span className="text-2xl">1️⃣</span>
            <p>
              <strong>Review Match Reasons:</strong> Look at why each job matches your skills
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">2️⃣</span>
            <p>
              <strong>Save Interesting Jobs:</strong> Keep track of jobs you want to apply to later
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">3️⃣</span>
            <p>
              <strong>Check Competency Match:</strong> See which skills match and what you can develop
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">4️⃣</span>
            <p>
              <strong>Apply Strategically:</strong> Start with highest match score jobs for best results
            </p>
          </div>
        </div>
      </div>

      {/* Saved Jobs Quick Link */}
      {savedJobs.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">📌 Saved Jobs</h3>
              <p className="text-purple-700 text-sm mt-1">
                You have {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <a
              href="/saved-jobs"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all"
            >
              View All Saved Jobs →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
