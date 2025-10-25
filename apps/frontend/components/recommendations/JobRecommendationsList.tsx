'use client';

import { useState, useEffect } from 'react';
import { Job, RecommendationFilters } from '@/hooks/useJobRecommendations';
import JobRecommendationCard from './JobRecommendationCard';

export interface JobRecommendationsListProps {
  jobs: Job[];
  onSaveJob?: (jobId: string) => void;
  onViewDetails?: (job: Job) => void;
  savedJobIds?: string[];
  loading?: boolean;
  error?: string | null;
  onFiltersChange?: (filters: RecommendationFilters) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount?: number;
}

/**
 * JobRecommendationsList Component
 *
 * Displays a list of job recommendations with:
 * - Filtering by salary, location, contract type
 * - Sorting options (score, salary, date)
 * - Pagination/Load More
 * - Empty state handling
 * - Loading states
 */
export function JobRecommendationsList({
  jobs,
  onSaveJob,
  onViewDetails,
  savedJobIds = [],
  loading = false,
  error = null,
  onFiltersChange,
  onLoadMore,
  hasMore = false,
  totalCount = 0,
}: JobRecommendationsListProps) {
  const [sortBy, setSortBy] = useState<'score' | 'salary' | 'date'>('score');
  const [filters, setFilters] = useState<RecommendationFilters>({
    minSalary: undefined,
    maxSalary: undefined,
    location: '',
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<RecommendationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  // Sort jobs based on selected criteria
  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.matchScore || 0) - (a.matchScore || 0);
      case 'salary':
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      case 'date':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-semibold text-red-900">Error Loading Recommendations</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!loading && jobs.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          No Job Recommendations Yet
        </h3>
        <p className="text-primary-700 text-sm mb-4">
          Complete your assessment to get personalized job recommendations based on your skills and preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters & Sorting</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sort Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'salary' | 'date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="score">Match Score (High to Low)</option>
              <option value="salary">Salary (High to Low)</option>
              <option value="date">Recent First</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="Search location..."
              value={filters.location || ''}
              onChange={(e) => handleFilterChange({ location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Min Salary Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Min Salary (€)
            </label>
            <input
              type="number"
              placeholder="Minimum..."
              value={filters.minSalary || ''}
              onChange={(e) =>
                handleFilterChange({ minSalary: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Max Salary Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Max Salary (€)
            </label>
            <input
              type="number"
              placeholder="Maximum..."
              value={filters.maxSalary || ''}
              onChange={(e) =>
                handleFilterChange({ maxSalary: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.location || filters.minSalary || filters.maxSalary) && (
          <button
            onClick={() => {
              setFilters({ minSalary: undefined, maxSalary: undefined, location: '' });
              onFiltersChange?.({ minSalary: undefined, maxSalary: undefined, location: '' });
            }}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Showing {sortedJobs.length} of {totalCount || sortedJobs.length} recommendations
        </p>
      </div>

      {/* Jobs Grid */}
      {loading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-64 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedJobs.map((job) => (
            <JobRecommendationCard
              key={job.id}
              job={job}
              onSave={onSaveJob}
              onViewDetails={onViewDetails}
              isSaved={savedJobIds.includes(job.id)}
              showScore={true}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all
              bg-primary-600 text-white hover:bg-primary-700
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading ? 'Loading...' : 'Load More Jobs'}
          </button>
        </div>
      )}

      {/* Empty Results Message */}
      {!loading && sortedJobs.length === 0 && jobs.length > 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300">
          <p>No jobs match your current filters. Try adjusting them.</p>
        </div>
      )}
    </div>
  );
}

export default JobRecommendationsList;
