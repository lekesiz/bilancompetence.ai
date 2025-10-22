import { Assessment } from '../../types';

interface AssessmentCardProps {
  assessment: Assessment;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const statusLabels = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  COMPLETED: 'Completed',
};

export function AssessmentCard({ assessment, onEdit, onView, onDelete }: AssessmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{assessment.title}</h3>
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[assessment.status]
              }`}
            >
              {statusLabels[assessment.status]}
            </span>
            <span className="text-sm text-gray-500">{formatDate(assessment.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {assessment.status === 'IN_PROGRESS' || assessment.status === 'DRAFT' ? (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-gray-800">{assessment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${assessment.progress}%` }}
            ></div>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {assessment.status === 'DRAFT' && onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            Edit Draft
          </button>
        )}

        {assessment.status !== 'DRAFT' && onView && (
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            View Results
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
