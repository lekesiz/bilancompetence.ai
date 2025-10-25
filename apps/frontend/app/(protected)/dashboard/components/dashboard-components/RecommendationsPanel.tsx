import { useState } from 'react';
import { Recommendation } from '../../types';
import { Briefcase, BookOpen, Star, ChevronDown, ChevronUp, ExternalLink, Bookmark, TrendingUp } from 'lucide-react';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  userRole: 'BENEFICIARY' | 'CONSULTANT';
}

const typeConfig = {
  JOB_MATCH: {
    label: 'Job Match',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Briefcase className="w-5 h-5" />,
    bgColor: 'bg-blue-500',
  },
  TRAINING: {
    label: 'Training',
    color: 'bg-green-50 border-green-200 text-green-800',
    icon: <BookOpen className="w-5 h-5" />,
    bgColor: 'bg-success-500',
  },
  SKILL_IMPROVEMENT: {
    label: 'Skill Improvement',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    icon: <Star className="w-5 h-5" />,
    bgColor: 'bg-purple-500',
  },
};

export function RecommendationsPanel({ recommendations, userRole }: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          AI-Powered Recommendations
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No recommendations available yet</p>
          {userRole === 'BENEFICIARY' && (
            <p className="text-sm text-gray-400 mt-2">Complete an assessment to get personalized recommendations</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        AI-Powered Recommendations
      </h3>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const type = typeConfig[rec.type];
          
          return (
            <div
              key={rec.id}
              className={`border-l-4 rounded-xl p-5 transition-all cursor-pointer hover:shadow-md ${
                type.color
              }`}
              onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 ${type.bgColor} rounded-lg flex items-center justify-center text-white`}>
                    {type.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-800 truncate">{rec.title}</h4>
                      <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-60 rounded-full flex-shrink-0">
                        {type.label}
                      </span>
                    </div>
                    {rec.romeCode && (
                      <p className="text-sm text-gray-600 mb-1">ROME Code: {rec.romeCode}</p>
                    )}
                    {rec.source && (
                      <p className="text-xs text-gray-500">Source: {rec.source}</p>
                    )}
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 ml-2 p-1 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {expandedId === rec.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Expanded content */}
              {expandedId === rec.id && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{rec.description}</p>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-60 hover:bg-opacity-80 rounded-lg text-sm font-medium transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Learn More
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-60 hover:bg-opacity-80 rounded-lg text-sm font-medium transition-colors">
                      <Bookmark className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
          <ExternalLink className="w-4 h-4" />
          View All Recommendations
        </button>
      </div>
    </div>
  );
}
