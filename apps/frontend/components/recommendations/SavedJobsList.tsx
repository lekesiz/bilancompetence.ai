'use client';

import { useState } from 'react';
import { SavedJob } from '@/hooks/useJobRecommendations';

export interface SavedJobsListProps {
  savedJobs: SavedJob[];
  onRemove?: (jobId: string) => void;
  onViewDetails?: (job: SavedJob) => void;
  onStatusChange?: (jobId: string, status: 'interested' | 'applied' | 'saved') => void;
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
}

/**
 * SavedJobsList Component
 *
 * Displays user's saved jobs with:
 * - Save date and status
 * - Notes/comments from user
 * - Status management (interested, applied, saved)
 * - Delete functionality
 * - View details option
 */
export function SavedJobsList({
  savedJobs,
  onRemove,
  onViewDetails,
  onStatusChange,
  loading = false,
  error = null,
  totalCount = 0,
}: SavedJobsListProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'interested' | 'applied' | 'saved'>('all');

  // Filter jobs by status
  const filteredJobs = selectedStatus === 'all'
    ? savedJobs
    : savedJobs.filter((job) => job.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interested':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'applied':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'saved':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'interested':
        return '❤️ Interested';
      case 'applied':
        return '✓ Applied';
      case 'saved':
        return '📌 Saved';
      default:
        return status;
    }
  };

  const handleStatusChange = (jobId: string, newStatus: 'interested' | 'applied' | 'saved') => {
    onStatusChange?.(jobId, newStatus);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-semibold text-red-900">Error Loading Saved Jobs</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!loading && savedJobs.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">📌</div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          No Saved Jobs Yet
        </h3>
        <p className="text-blue-700 text-sm mb-4">
          Save jobs that interest you to keep track of opportunities and manage your application process.
        </p>
        <button
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
          onClick={() => window.history.back()}
        >
          Browse Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Saved Jobs</h3>
            <p className="text-gray-600 text-sm mt-1">
              {filteredJobs.length} of {totalCount || savedJobs.length} jobs
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'interested', 'applied', 'saved'] as const).map((status) => {
              const count = status === 'all'
                ? savedJobs.length
                : savedJobs.filter((j) => j.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`
                    px-4 py-2 rounded-full font-medium transition-all text-sm
                    ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Jobs List - Loading State */}
      {loading && savedJobs.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-32 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <span
                      className={`
                        flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold
                        border ${getStatusColor(job.status)}
                      `}
                    >
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 font-medium mb-3">
                    {job.company}
                  </p>

                  {/* Job Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.contractType && (
                      <div className="flex items-center gap-1">
                        <span>💼</span>
                        <span>{job.contractType}</span>
                      </div>
                    )}
                    {job.salaryMin && job.salaryMax && (
                      <div className="flex items-center gap-1">
                        <span>💰</span>
                        <span>
                          €{job.salaryMin.toLocaleString()} - €{job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {job.notes && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-blue-900">
                        <strong>Your notes:</strong> {job.notes}
                      </p>
                    </div>
                  )}

                  {/* Save Date */}
                  <p className="text-xs text-gray-500">
                    Saved on {new Date(job.savedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex flex-col gap-2">
                  {/* Status Selector */}
                  <select
                    value={job.status}
                    onChange={(e) =>
                      handleStatusChange(job.id, e.target.value as 'interested' | 'applied' | 'saved')
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="saved">Mark as Saved</option>
                    <option value="interested">Mark as Interested</option>
                    <option value="applied">Mark as Applied</option>
                  </select>

                  {/* Details Button */}
                  <button
                    onClick={() => onViewDetails?.(job)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all text-sm"
                  >
                    View Details
                  </button>

                  {/* Delete Button */}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(job.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-all text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Filter State */}
      {!loading && filteredJobs.length === 0 && savedJobs.length > 0 && (
        <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg">
          <p className="text-lg">No jobs with status "{getStatusLabel(selectedStatus)}"</p>
          <p className="text-sm mt-2">Try selecting a different status filter</p>
        </div>
      )}

      {/* Statistics Section */}
      {savedJobs.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4">📊 Application Statistics</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {savedJobs.filter((j) => j.status === 'applied').length}
              </p>
              <p className="text-sm text-blue-800 mt-1">Applied</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {savedJobs.filter((j) => j.status === 'interested').length}
              </p>
              <p className="text-sm text-green-800 mt-1">Interested</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {savedJobs.filter((j) => j.status === 'saved').length}
              </p>
              <p className="text-sm text-gray-800 mt-1">Saved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedJobsList;
