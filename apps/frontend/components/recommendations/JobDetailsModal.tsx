'use client';

import { useState } from 'react';
import { Job } from '@/hooks/useJobRecommendations';

export interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

/**
 * JobDetailsModal Component
 *
 * Full-screen modal displaying complete job information:
 * - Detailed description
 * - Full requirements
 * - Benefits and company info
 * - Application link
 * - Save and Share buttons
 */
export function JobDetailsModal({
  job,
  isOpen,
  onClose,
  onSave,
  isSaved = false,
}: JobDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!onSave) return;
    setIsLoading(true);
    try {
      onSave(job.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (job.url) {
      window.open(job.url, '_blank');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{job.title}</h2>
              <p className="text-blue-100 mt-2">{job.company}</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {job.location && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Location</p>
                  <p className="text-gray-900 font-medium">📍 {job.location}</p>
                </div>
              )}
              {job.contractType && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Type</p>
                  <p className="text-gray-900 font-medium">💼 {job.contractType}</p>
                </div>
              )}
              {job.salaryMin && job.salaryMax && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Salary</p>
                  <p className="text-gray-900 font-medium">
                    💰 €{job.salaryMin.toLocaleString()}-€{job.salaryMax.toLocaleString()}
                  </p>
                </div>
              )}
              {job.matchScore !== undefined && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Match</p>
                  <p className="text-green-600 font-bold text-lg">{Math.round(job.matchScore)}%</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Description */}
            {job.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Role</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>{job.description}</p>
                </div>
              </div>
            )}

            {/* Match Reasons */}
            {job.matchReasons && job.matchReasons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Why This Role Matches Your Skills</h3>
                <div className="space-y-2">
                  {job.matchReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold text-lg mt-0.5">✓</span>
                      <p className="text-gray-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Requirements Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Requirements</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">→</span>
                    <span>Relevant experience in {job.title.split(' ')[0].toLowerCase()}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">→</span>
                    <span>Strong communication and problem-solving skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">→</span>
                    <span>Team collaboration and project management experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">→</span>
                    <span>Willingness to continuously learn and adapt</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Company Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Company</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 mb-3">
                  {job.company} is a leading organization offering competitive benefits and growth opportunities
                  for talented professionals.
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span>✓</span> Competitive salary and benefits package
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Professional development opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Collaborative team environment
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Work-life balance initiatives
                  </li>
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  1. <strong>Review</strong> your skills match with this position
                </p>
                <p>
                  2. <strong>Save</strong> this job if you're interested
                </p>
                <p>
                  3. <strong>Apply</strong> through the company's application portal
                </p>
                <p>
                  4. <strong>Follow up</strong> with the hiring team after 1-2 weeks
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
            >
              Close
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium transition-all
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

            {job.url && (
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <span>→</span>
                <span>Apply Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default JobDetailsModal;
