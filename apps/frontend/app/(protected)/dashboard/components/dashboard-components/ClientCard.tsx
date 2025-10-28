import { Client } from '../../types';
import { User, Mail, Calendar, Eye, MessageCircle, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onView?: () => void;
  onMessage?: () => void;
  onAssignAssessment?: () => void;
  variant?: 'default' | 'compact';
}

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:text-gray-100 border-gray-200',
    icon: <Clock className="w-4 h-4" />,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

export function ClientCard({ 
  client, 
  onView, 
  onMessage, 
  onAssignAssessment, 
  variant = 'default' 
}: ClientCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const status = statusConfig[client.status];
  const isCompact = variant === 'compact';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 ${
      isCompact ? 'p-4' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {client.name?.charAt(0)?.toUpperCase() || client.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-800 dark:text-gray-100 truncate ${
                isCompact ? 'text-base' : 'text-lg'
              }`}>
                {client.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">{client.email}</p>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ml-2 ${
          status.color
        }`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Client info */}
      <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-300" />
          <span className="text-gray-600 dark:text-gray-300">Contact:</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{client.contact}</span>
        </div>
        {client.lastAssessmentDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-300" />
            <span className="text-gray-600 dark:text-gray-300">Last Assessment:</span>
            <span className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(client.lastAssessmentDate)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {onView && (
          <button
            onClick={onView}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            View Client
          </button>
        )}

        {onMessage && (
          <button
            onClick={onMessage}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-success-600 hover:bg-green-50 rounded-lg font-medium transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        )}

        {onAssignAssessment && (
          <button
            onClick={onAssignAssessment}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Assign Assessment
          </button>
        )}
      </div>
    </div>
  );
}
