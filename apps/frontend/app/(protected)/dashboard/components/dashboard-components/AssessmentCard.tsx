import { Assessment } from '../../types';
import { Edit3, Eye, Trash2, Calendar, Clock, CheckCircle, FileText } from 'lucide-react';

interface AssessmentCardProps {
  assessment: Assessment;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  variant?: 'default' | 'compact';
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <FileText className="w-4 h-4" />,
    progressColor: 'bg-gray-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Clock className="w-4 h-4" />,
    progressColor: 'bg-blue-500',
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="w-4 h-4" />,
    progressColor: 'bg-yellow-500',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="w-4 h-4" />,
    progressColor: 'bg-success-500',
  },
};

export function AssessmentCard({ 
  assessment, 
  onEdit, 
  onView, 
  onDelete, 
  variant = 'default' 
}: AssessmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const status = statusConfig[assessment.status];
  const isCompact = variant === 'compact';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 ${
      isCompact ? 'p-4' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-800 mb-2 truncate ${
            isCompact ? 'text-base' : 'text-lg'
          }`}>
            {assessment.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
              status.color
            }`}>
              {status.icon}
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate(assessment.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {(assessment.status === 'IN_PROGRESS' || assessment.status === 'DRAFT') && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-gray-800">{assessment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`${status.progressColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${assessment.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        {assessment.status === 'DRAFT' && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Draft
          </button>
        )}

        {assessment.status !== 'DRAFT' && onView && (
          <button
            onClick={onView}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Results
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {!isCompact && 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
