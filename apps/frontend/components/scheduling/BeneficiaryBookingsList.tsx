/**
 * BeneficiaryBookingsList Component
 * Shows beneficiary's booked sessions with actions
 */

'use client';

import React, { useState } from 'react';
import { SessionBooking } from '@/lib/schedulingAPI';
import { useBeneficiaryBookings, useCancelBooking } from '@/hooks/useScheduling';
import { Calendar, Clock, MapPin, Video, Phone, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BeneficiaryBookingsListProps {
  beneficiaryId: string;
  bilanId?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'IN_PROGRESS';
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-900 border-blue-300',
  CONFIRMED: 'bg-green-100 text-green-900 border-green-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-900 border-purple-300',
  COMPLETED: 'bg-gray-100 text-gray-900 border-gray-300',
  CANCELLED: 'bg-red-100 text-red-900 border-red-300',
  NO_SHOW: 'bg-orange-100 text-orange-900 border-orange-300',
};

const MEETING_FORMAT_ICONS: Record<string, any> = {
  VIDEO: <Video className="w-4 h-4" />,
  PHONE: <Phone className="w-4 h-4" />,
  IN_PERSON: <MapPin className="w-4 h-4" />,
};

/**
 * BeneficiaryBookingsList Component
 */
export default function BeneficiaryBookingsList({
  beneficiaryId,
  bilanId,
  status,
}: BeneficiaryBookingsListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState<string | null>(null);

  // Fetch bookings
  const { data: bookings = [], isLoading, error } = useBeneficiaryBookings(
    beneficiaryId,
    {
      ...(status && { status }),
      ...(bilanId && { bilan_id: bilanId }),
    }
  );

  // Cancel booking mutation
  const { mutateAsync: cancelBooking } = useCancelBooking();

  const handleCancelBooking = async (bookingId: string) => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setCancelingId(bookingId);
    try {
      await cancelBooking({
        bookingId,
        data: { cancellation_reason: cancellationReason },
      });
      toast.success('Booking cancelled successfully');
      setShowCancelForm(null);
      setCancellationReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Failed to load bookings</h3>
          <p className="text-red-700 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">No Bookings</h3>
        <p className="text-gray-600">
          {status ? `You have no ${status.toLowerCase()} bookings` : 'You have no bookings yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {bookings.map((booking: SessionBooking) => {
        const sessionDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}`);
        const isUpcoming = sessionDateTime > new Date();
        const isCompleted = booking.status === 'COMPLETED' || booking.status === 'NO_SHOW';
        const showCancelButton = !isCompleted && booking.status !== 'CANCELLED';

        return (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition"
          >
            {/* Header with Status */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-start gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.consultant_id}</h3>
                <p className="text-sm text-gray-600 mt-1">{booking.session_type}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  STATUS_COLORS[booking.status] || STATUS_COLORS.SCHEDULED
                }`}
              >
                {booking.status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Date and Time */}
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium">{format(sessionDateTime, 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-gray-600">
                    {booking.scheduled_start_time} - {booking.scheduled_end_time} ({booking.duration_minutes} min)
                  </p>
                </div>
              </div>

              {/* Meeting Format */}
              <div className="flex items-center gap-2 text-gray-700">
                {MEETING_FORMAT_ICONS[booking.meeting_format]}
                <div>
                  <p className="text-sm font-medium">{booking.meeting_format}</p>
                  {booking.meeting_location && (
                    <p className="text-xs text-gray-600">{booking.meeting_location}</p>
                  )}
                  {booking.meeting_link && (
                    <a
                      href={booking.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Join Link
                    </a>
                  )}
                </div>
              </div>

              {/* Beneficiary Notes */}
              {booking.beneficiary_notes && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Your Notes:</strong> {booking.beneficiary_notes}
                  </p>
                </div>
              )}

              {/* Rating (if completed) */}
              {isCompleted && booking.beneficiary_rating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-4 h-4 ${
                        i < booking.beneficiary_rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">({booking.beneficiary_rating}/5)</span>
                </div>
              )}

              {/* Feedback */}
              {isCompleted && booking.beneficiary_feedback && (
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <strong>Your Feedback:</strong> {booking.beneficiary_feedback}
                  </p>
                </div>
              )}

              {/* Cancellation Reason */}
              {booking.status === 'CANCELLED' && booking.cancellation_reason && (
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm text-gray-700">
                    <strong>Cancellation Reason:</strong> {booking.cancellation_reason}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 pt-0 border-t border-gray-200">
              {showCancelForm === booking.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Reason
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please tell us why you're cancelling..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowCancelForm(null);
                        setCancellationReason('');
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelingId === booking.id || !cancellationReason.trim()}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {cancelingId === booking.id ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                  </div>
                </div>
              ) : showCancelButton ? (
                <button
                  onClick={() => setShowCancelForm(booking.id)}
                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium border border-red-200"
                >
                  Cancel Booking
                </button>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  {isCompleted ? 'Session completed' : 'Cannot cancel this booking'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
