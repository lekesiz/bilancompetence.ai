import { useState } from 'react';
import { Recommendation } from '../../types';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  userRole: 'BENEFICIARY' | 'CONSULTANT';
}

const typeColors = {
  JOB_MATCH: 'bg-blue-50 border-blue-200 text-blue-800',
  TRAINING: 'bg-green-50 border-green-200 text-green-800',
  SKILL_IMPROVEMENT: 'bg-purple-50 border-purple-200 text-purple-800',
};

const typeIcons = {
  JOB_MATCH: '💼',
  TRAINING: '📚',
  SKILL_IMPROVEMENT: '⭐',
};

const typeLabels = {
  JOB_MATCH: 'Job Match',
  TRAINING: 'Training',
  SKILL_IMPROVEMENT: 'Skill Improvement',
};

export function RecommendationsPanel({ recommendations, userRole }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No recommendations available yet.</p>
          {userRole === 'BENEFICIARY' && (
            <p className="text-sm text-gray-400 mt-2">Complete an assessment to get personalized recommendations.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border-l-4 rounded-lg p-4 transition-all cursor-pointer ${
              typeColors[rec.type]
            }`}
            onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{typeIcons[rec.type]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-50 rounded">
                      {typeLabels[rec.type]}
                    </span>
                  </div>
                  {rec.romeCode && (
                    <p className="text-sm text-gray-600">ROME Code: {rec.romeCode}</p>
                  )}
                  {rec.source && (
                    <p className="text-xs text-gray-500 mt-1">Source: {rec.source}</p>
                  )}
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {expandedId === rec.id ? '−' : '+'}
              </button>
            </div>

            {/* Expanded content */}
            {expandedId === rec.id && (
              <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <p className="text-gray-700 text-sm">{rec.description}</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-75 rounded text-sm font-medium transition-colors">
                    Learn More
                  </button>
                  <button className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-75 rounded text-sm font-medium transition-colors">
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          View All Recommendations
        </button>
      </div>
    </div>
  );
}
