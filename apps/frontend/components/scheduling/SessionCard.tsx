/**
 * SessionCard Component
 * Individual session display with action buttons
 */

'use client';

import React, { useState } from 'react';
import { SessionBooking } from '@/lib/schedulingAPI';
import { format } from 'date-fns';
import { Clock, MapPin, Video, Phone, Users, Star, X } from 'lucide-react';
import { toastSuccess, toastError } from '@/components/ui/Toast';

interface SessionCardProps {
  session: SessionBooking;
  consultantMode?: boolean;
  onConfirm?: (bookingId: string) => Promise<void>;
  onComplete?: (bookingId: string, attended: boolean) => Promise<void>;
  onCancel?: (bookingId: string, reason: string) => Promise<void>;
  onRate?: (bookingId: string, rating: number, feedback: string) => Promise<void>;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-900 border-blue-300',
  CONFIRMED: 'bg-green-100 text-green-900 border-green-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-900 border-purple-300',
  COMPLETED: 'bg-gray-100 text-gray-900 dark:text-white border-gray-300',
  CANCELLED: 'bg-red-100 text-red-900 border-red-300',
  NO_SHOW: 'bg-orange-100 text-orange-900 border-orange-300',
};

const MEETING_FORMAT_ICONS: Record<string, any> = {
  VIDEO: <Video className="w-4 h-4" />,
  PHONE: <Phone className="w-4 h-4" />,
  IN_PERSON: <MapPin className="w-4 h-4" />,
};

/**
 * SessionCard Component
 */
export default function SessionCard({
  session,
  consultantMode = false,
  onConfirm,
  onComplete,
  onCancel,
  onRate,
}: SessionCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_start_time}`);
  const isUpcoming = sessionDateTime > new Date();
  const isCompleted = session.status === 'COMPLETED' || session.status === 'NO_SHOW';

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setIsLoading(true);
    try {
      await onConfirm(session.id);
      toastSuccess('Booking confirmed');
      setShowActions(false);
    } catch (error) {
      toastError('Failed to confirm booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (attended: boolean) => {
    if (!onComplete) return;
    setIsLoading(true);
    try {
      await onComplete(session.id, attended);
      toastSuccess(attended ? 'Session marked as completed' : 'Session marked as no-show');
      setShowActions(false);
    } catch (error) {
      toastError('Failed to complete session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    const reason = prompt('Cancellation reason:');
    if (!reason) return;

    setIsLoading(true);
    try {
      await onCancel(session.id, reason);
      toastSuccess('Session cancelled');
      setShowActions(false);
    } catch (error) {
      toastError('Failed to cancel session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async () => {
    if (!onRate || !rating) {
      toastError('Please provide a rating');
      return;
    }

    setIsLoading(true);
    try {
      await onRate(session.id, rating, feedback);
      toastSuccess('Session rated successfully');
      setShowRating(false);
      setRating(0);
      setFeedback('');
    } catch (error) {
      toastError('Failed to rate session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow hover:shadow-md transition overflow-hidden">
      {/* Header with Status */}
      <div className={`p-4 border-b border-gray-200 flex justify-between items-start gap-2`}>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {consultantMode ? session.beneficiary_id : session.consultant_id}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{session.session_type}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            STATUS_COLORS[session.status] || STATUS_COLORS.SCHEDULED
          }`}
        >
          {session.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date and Time */}
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Clock className="w-4 h-4 text-gray-300" />
          <div>
            <p className="font-medium">
              {format(sessionDateTime, 'EEE, MMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {session.scheduled_start_time} - {session.scheduled_end_time} ({session.duration_minutes} min)
            </p>
          </div>
        </div>

        {/* Meeting Format */}
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          {MEETING_FORMAT_ICONS[session.meeting_format]}
          <div>
            <p className="text-sm font-medium">{session.meeting_format}</p>
            {session.meeting_location && (
              <p className="text-xs text-gray-600 dark:text-gray-300">{session.meeting_location}</p>
            )}
            {session.meeting_link && (
              <a
                href={session.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline"
              >
                Join Link
              </a>
            )}
          </div>
        </div>

        {/* Notes */}
        {(session.beneficiary_notes || session.consultant_notes) && (
          <div className="p-3 bg-gray-50 rounded">
            {session.beneficiary_notes && (
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-200">Beneficiary Notes:</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{session.beneficiary_notes}</p>
              </div>
            )}
            {session.consultant_notes && (
              <div className="text-sm mt-2">
                <p className="font-medium text-gray-700 dark:text-gray-200">Consultant Notes:</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{session.consultant_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Rating (if completed) */}
        {isCompleted && session.beneficiary_rating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (session.beneficiary_rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">({session.beneficiary_rating}/5)</span>
          </div>
        )}

        {isCompleted && session.beneficiary_feedback && (
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Feedback:</strong> {session.beneficiary_feedback}
            </p>
          </div>
        )}

        {/* Cancellation Reason */}
        {session.status === 'CANCELLED' && session.cancellation_reason && (
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <strong>Reason:</strong> {session.cancellation_reason}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 pt-0 flex gap-2 flex-wrap">
        {showActions ? (
          // Action Panel
          <div className="w-full space-y-2">
            {/* Consultant Actions */}
            {consultantMode && session.status === 'SCHEDULED' && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  Confirm
                </button>
              </>
            )}

            {consultantMode && session.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => handleComplete(true)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:bg-gray-400 transition"
                >
                  Completed
                </button>
                <button
                  onClick={() => handleComplete(false)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:bg-gray-400 transition"
                >
                  No-Show
                </button>
              </>
            )}

            {/* Cancel Button (always available if not completed) */}
            {!isCompleted && (
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}

            {/* Close Actions */}
            <button
              onClick={() => setShowActions(false)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        ) : showRating ? (
          // Rating Panel
          <div className="w-full space-y-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className="p-1 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave feedback (optional)"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={2}
            />

            <button
              onClick={handleRate}
              disabled={isLoading || !rating}
              className="w-full px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:bg-gray-400 transition"
            >
              Submit Rating
            </button>

            <button
              onClick={() => {
                setShowRating(false);
                setRating(0);
                setFeedback('');
              }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          // Normal Buttons
          <>
            {session.status === 'SCHEDULED' && consultantMode && (
              <button
                onClick={() => setShowActions(true)}
                className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition"
              >
                Action
              </button>
            )}

            {session.status === 'CONFIRMED' && consultantMode && (
              <button
                onClick={() => setShowActions(true)}
                className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition"
              >
                Complete
              </button>
            )}

            {isCompleted && !consultantMode && !session.beneficiary_rating && (
              <button
                onClick={() => setShowRating(true)}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition flex items-center justify-center gap-1"
              >
                <Star className="w-4 h-4" />
                Rate
              </button>
            )}

            {isUpcoming && !isCompleted && (
              <button
                onClick={() => setShowActions(true)}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
