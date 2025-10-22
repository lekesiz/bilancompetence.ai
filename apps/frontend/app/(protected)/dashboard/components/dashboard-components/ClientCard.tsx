import { Client } from '../../types';

interface ClientCardProps {
  client: Client;
  onView?: () => void;
  onMessage?: () => void;
  onAssignAssessment?: () => void;
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const statusLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  COMPLETED: 'Completed',
};

export function ClientCard({ client, onView, onMessage, onAssignAssessment }: ClientCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
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
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{client.name}</h3>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2 ${
            statusColors[client.status]
          }`}
        >
          {statusLabels[client.status]}
        </span>
      </div>

      {/* Client info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Contact:</span>
          <span className="text-gray-800 font-medium">{client.contact}</span>
        </div>
        {client.lastAssessmentDate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Assessment:</span>
            <span className="text-gray-800 font-medium">{formatDate(client.lastAssessmentDate)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {onView && (
          <button
            onClick={onView}
            className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors text-sm"
          >
            View Client
          </button>
        )}

        {onMessage && (
          <button
            onClick={onMessage}
            className="w-full px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors text-sm"
          >
            Message
          </button>
        )}

        {onAssignAssessment && (
          <button
            onClick={onAssignAssessment}
            className="w-full px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm"
          >
            Assign Assessment
          </button>
        )}
      </div>
    </div>
  );
}
