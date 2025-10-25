'use client';

import { Job } from '@/hooks/useJobRecommendations';

export interface JobCompetencyMatcherProps {
  job: Job;
  userSkills?: string[];
  requiredSkills?: string[];
  onClose?: () => void;
}

/**
 * JobCompetencyMatcher Component
 *
 * Displays detailed skill matching between user and job:
 * - Matched skills (green)
 * - Missing skills (orange/red)
 * - Skill proficiency levels
 * - Match percentage breakdown
 * - Learning recommendations
 */
export function JobCompetencyMatcher({
  job,
  userSkills = [],
  requiredSkills = [],
  onClose,
}: JobCompetencyMatcherProps) {
  // Parse match reasons to extract matched and missing skills
  const matchedSkills = job.matchReasons || [];
  const allRequiredSkills = requiredSkills.length > 0 ? requiredSkills : ['Communication', 'Problem Solving', 'Team Work'];

  // Find missing skills
  const missingSkills = allRequiredSkills.filter(
    (skill) => !matchedSkills.some((reason) => reason.toLowerCase().includes(skill.toLowerCase()))
  );

  const matchPercentage = Math.round(
    (matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100
  );

  const getSkillLevel = (proficiency?: number): string => {
    if (!proficiency) return 'Basic';
    if (proficiency >= 90) return 'Expert';
    if (proficiency >= 75) return 'Advanced';
    if (proficiency >= 60) return 'Intermediate';
    return 'Basic';
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-green-100 text-green-700';
      case 'Advanced':
        return 'bg-blue-100 text-primary-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {job.title}
          </h2>
          <p className="text-gray-600 mt-1">{job.company}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Match Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Overall Match */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Overall Match</p>
          <div className="text-3xl font-bold text-primary-600">
            {job.matchScore || matchPercentage}%
          </div>
          <div className="mt-2 bg-white rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${job.matchScore || matchPercentage}%` }}
            />
          </div>
        </div>

        {/* Matched Skills Count */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Matched Skills</p>
          <div className="text-3xl font-bold text-green-600">
            {matchedSkills.length}
          </div>
          <p className="text-sm text-green-700 mt-2">
            You have these skills
          </p>
        </div>

        {/* Missing Skills Count */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Skills to Develop</p>
          <div className="text-3xl font-bold text-orange-600">
            {missingSkills.length}
          </div>
          <p className="text-sm text-orange-700 mt-2">
            You could learn these
          </p>
        </div>
      </div>

      {/* Your Skills Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-green-600">✓</span> Your Matched Skills
        </h3>

        {matchedSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchedSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="text-xl">✓</span>
                <div className="flex-1">
                  <p className="font-medium text-green-900">{skill}</p>
                  <p className="text-xs text-green-700 mt-1">Matches job requirement</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-gray-600 text-center">
            No matching skills yet
          </div>
        )}
      </div>

      {/* Skills to Develop Section */}
      {missingSkills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-orange-600">◆</span> Skills to Develop
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {missingSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <span className="text-xl">◆</span>
                <div className="flex-1">
                  <p className="font-medium text-orange-900">{skill}</p>
                  <p className="text-xs text-orange-700 mt-1">Recommended skill</p>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Resources Suggestion */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              💡 Learning Recommendations
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              {missingSkills.slice(0, 2).map((skill, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>→</span>
                  <span>Consider taking courses or certifications in {skill}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span>→</span>
                <span>Search for relevant training programs on platforms like Coursera, LinkedIn Learning, or France Travail</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Proficiency Levels */}
      {userSkills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skill Levels</h3>

          <div className="space-y-3">
            {userSkills.slice(0, 5).map((skill, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{skill}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getProficiencyColor(
                    getSkillLevel()
                  )}`}
                >
                  {getSkillLevel()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">📊 Key Takeaways</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              You are a {job.matchScore ? 'strong' : 'good'} match for this position with {matchedSkills.length} matching skills.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              {missingSkills.length > 0
                ? `Consider developing ${missingSkills.length} additional skill(s) to strengthen your candidacy.`
                : 'You have all the key skills mentioned for this role!'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              Apply now to showcase your expertise, or save this job for later reference.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default JobCompetencyMatcher;
