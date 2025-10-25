'use client';

import { useState } from 'react';
import { Job } from '@/hooks/useJobRecommendations';

export interface JobRecommendationCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onViewDetails?: (job: Job) => void;
  isSaved?: boolean;
  showScore?: boolean;
}

/**
 * JobRecommendationCard Component
 *
 * Displays a single job recommendation with:
 * - Job title and company
 * - Location and contract type
 * - Match score (0-100%)
 * - Salary information
 * - Match reasons/skills
 * - Save and Details buttons
 */
export function JobRecommendationCard({
  job,
  onSave,
  onViewDetails,
  isSaved = false,
  showScore = true,
}: JobRecommendationCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveClick = async () => {
    if (!onSave) return;

    setIsLoading(true);
    try {
      onSave(job.id);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 75) return 'bg-blue-100 text-primary-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  const getScoreBorderColor = (score?: number) => {
    if (!score) return 'border-gray-300';
    if (score >= 90) return 'border-green-300 hover:border-green-500';
    if (score >= 75) return 'border-blue-300 hover:border-primary-500';
    if (score >= 60) return 'border-yellow-300 hover:border-yellow-500';
    return 'border-orange-300 hover:border-orange-500';
  };

  return (
    <div
      className={`
        bg-white rounded-lg border-2 p-6 transition-all duration-200
        hover:shadow-lg hover:scale-102 cursor-pointer
        ${getScoreBorderColor(job.matchScore)}
      `}
    >
      {/* Header with score badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {job.title}
          </h3>
          <p className="text-gray-600 font-medium">
            {job.company}
          </p>
        </div>

        {/* Score Badge */}
        {showScore && job.matchScore !== undefined && (
          <div className={`
            flex-shrink-0 rounded-full px-4 py-2 font-bold text-lg
            ${getScoreColor(job.matchScore)}
            flex items-center justify-center min-w-max
          `}>
            {Math.round(job.matchScore)}%
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        {/* Location and Contract Type */}
        <div className="flex flex-wrap gap-3">
          {job.location && (
            <div className="flex items-center gap-2">
              <span className="text-primary-600">📍</span>
              <span>{job.location}</span>
            </div>
          )}
          {job.contractType && (
            <div className="flex items-center gap-2">
              <span className="text-purple-600">💼</span>
              <span className="capitalize">{job.contractType.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>

        {/* Salary Information */}
        {(job.salaryMin || job.salaryMax) && (
          <div className="flex items-center gap-2">
            <span className="text-green-600">💰</span>
            <span>
              {job.salaryMin && job.salaryMax
                ? `€${job.salaryMin.toLocaleString()} - €${job.salaryMax.toLocaleString()}`
                : job.salaryMin
                ? `From €${job.salaryMin.toLocaleString()}`
                : `Up to €${job.salaryMax?.toLocaleString()}`}
            </span>
          </div>
        )}
      </div>

      {/* Match Reasons */}
      {job.matchReasons && job.matchReasons.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
            Why it matches:
          </p>
          <div className="flex flex-wrap gap-2">
            {job.matchReasons.slice(0, 3).map((reason, idx) => (
              <span
                key={idx}
                className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
              >
                ✓ {reason}
              </span>
            ))}
            {job.matchReasons.length > 3 && (
              <span className="inline-block text-gray-600 text-xs font-medium">
                +{job.matchReasons.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveClick}
          disabled={isLoading}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium transition-all
            flex items-center justify-center gap-2
            ${
              isSaved
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span>{isSaved ? '✓' : '+'}</span>
          <span>{isSaved ? 'Saved' : 'Save Job'}</span>
        </button>

        <button
          onClick={() => onViewDetails?.(job)}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium transition-all
            bg-gray-200 text-gray-800 hover:bg-gray-300
          `}
        >
          Details →
        </button>
      </div>

      {/* Save Date (if applicable) */}
      {job.createdAt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Posted: {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default JobRecommendationCard;
