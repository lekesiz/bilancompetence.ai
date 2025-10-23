/**
 * ConsultantSchedulePage Component
 * Main container for consultant scheduling management
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useConsultantBookings,
  useAvailability,
  useConsultantAnalytics,
  useConfirmBooking,
  useCompleteSession,
  useCancelBooking,
} from '@/hooks/useScheduling';
import { AvailabilitySlot, SessionBooking, SessionAnalytics } from '@/lib/schedulingAPI';
import AvailabilityForm from './AvailabilityForm';
import AvailabilityCalendar from './AvailabilityCalendar';
import SessionCard from './SessionCard';
import { toastSuccess, toastError } from '@/components/ui/Toast';
import { Calendar, Clock, BarChart3, Plus } from 'lucide-react';

type TabType = 'availability' | 'sessions' | 'analytics';

/**
 * Analytics Summary Component
 */
function AnalyticsSummary({ analytics }: { analytics: SessionAnalytics[] }) {
  const totalSessions = analytics.reduce((sum, a) => sum + a.total_sessions_completed, 0);
  const totalHours = analytics.reduce((sum, a) => sum + (a.total_hours_completed || 0), 0);
  const avgRating =
    analytics.length > 0
      ? (analytics.reduce((sum, a) => sum + (a.average_rating || 0), 0) / analytics.length).toFixed(1)
      : 'N/A';
  const noShowCount = analytics.reduce((sum, a) => sum + a.total_sessions_no_show, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Sessions Completed</p>
        <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Hours Completed</p>
        <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm">Avg Rating</p>
        <p className="text-2xl font-bold text-yellow-600">⭐ {avgRating}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm">No-Shows</p>
        <p className="text-2xl font-bold text-orange-600">{noShowCount}</p>
      </div>
    </div>
  );
}

/**
 * Session List Component
 */
function SessionList({
  sessions,
  isLoading,
  onConfirm,
  onComplete,
  onCancel,
}: {
  sessions: SessionBooking[];
  isLoading: boolean;
  onConfirm: (id: string) => Promise<void>;
  onComplete: (id: string, attended: boolean) => Promise<void>;
  onCancel: (id: string, reason: string) => Promise<void>;
}) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No sessions scheduled</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          consultantMode={true}
          onConfirm={onConfirm}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}

/**
 * ConsultantSchedulePage Component
 */
export default function ConsultantSchedulePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('availability');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });

  const consultantId = user?.id;

  // Data fetching hooks
  const { data: availability = [], isLoading: availabilityLoading } = useAvailability(
    consultantId,
    dateFilter.from && dateFilter.to ? { date_from: dateFilter.from, date_to: dateFilter.to } : undefined
  );

  const { data: bookings = [], isLoading: bookingsLoading } = useConsultantBookings(
    consultantId,
    dateFilter.from && dateFilter.to ? { date_from: dateFilter.from, date_to: dateFilter.to } : undefined
  );

  const { data: analytics = [], isLoading: analyticsLoading } = useConsultantAnalytics(
    consultantId,
    dateFilter.from && dateFilter.to
      ? { dateFrom: dateFilter.from, dateTo: dateFilter.to }
      : undefined
  );

  // Mutation hooks
  const confirmMutation = useConfirmBooking();
  const completeMutation = useCompleteSession();
  const cancelMutation = useCancelBooking();

  // Filter bookings by status
  const scheduledBookings = bookings.filter((b: SessionBooking) => b.status === 'SCHEDULED');
  const confirmedBookings = bookings.filter((b: SessionBooking) => b.status === 'CONFIRMED');
  const completedBookings = bookings.filter(
    (b: SessionBooking) => b.status === 'COMPLETED' || b.status === 'NO_SHOW' || b.status === 'CANCELLED'
  );

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmMutation.mutateAsync(bookingId);
    } catch (error) {
      throw error;
    }
  };

  const handleCompleteSession = async (bookingId: string, attended: boolean) => {
    try {
      await completeMutation.mutateAsync({
        bookingId,
        data: { attended },
      });
    } catch (error) {
      throw error;
    }
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      await cancelMutation.mutateAsync({
        bookingId,
        reason,
      });
    } catch (error) {
      throw error;
    }
  };

  if (!consultantId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please log in to access your schedule</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultant Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your availability and sessions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'availability' as TabType, label: 'Availability', icon: Calendar },
          { id: 'sessions' as TabType, label: 'Sessions', icon: Clock },
          { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingSlot(null);
                setShowAvailabilityForm(!showAvailabilityForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Slot
            </button>
          </div>

          {/* Form */}
          {showAvailabilityForm && (
            <AvailabilityForm
              consultantId={consultantId}
              initialSlot={editingSlot || undefined}
              onSuccess={() => {
                setShowAvailabilityForm(false);
                setEditingSlot(null);
              }}
              onCancel={() => {
                setShowAvailabilityForm(false);
                setEditingSlot(null);
              }}
            />
          )}

          {/* Calendar */}
          <AvailabilityCalendar
            consultantId={consultantId}
            onSlotClick={(slot) => {
              // Could show slot details modal here
            }}
            onSlotEdit={(slot) => {
              setEditingSlot(slot);
              setShowAvailabilityForm(true);
            }}
          />
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Scheduled Sessions */}
          {scheduledBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Pending Confirmation ({scheduledBookings.length})
              </h2>
              <SessionList
                sessions={scheduledBookings}
                isLoading={bookingsLoading}
                onConfirm={handleConfirmBooking}
                onComplete={handleCompleteSession}
                onCancel={handleCancelBooking}
              />
            </div>
          )}

          {/* Confirmed Sessions */}
          {confirmedBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Confirmed ({confirmedBookings.length})
              </h2>
              <SessionList
                sessions={confirmedBookings}
                isLoading={bookingsLoading}
                onConfirm={handleConfirmBooking}
                onComplete={handleCompleteSession}
                onCancel={handleCancelBooking}
              />
            </div>
          )}

          {/* Completed Sessions */}
          {completedBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                Completed / Cancelled ({completedBookings.length})
              </h2>
              <SessionList
                sessions={completedBookings}
                isLoading={bookingsLoading}
                onConfirm={handleConfirmBooking}
                onComplete={handleCompleteSession}
                onCancel={handleCancelBooking}
              />
            </div>
          )}

          {bookings.length === 0 && !bookingsLoading && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sessions scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {analytics.length > 0 && <AnalyticsSummary analytics={analytics} />}

          {/* Detailed Analytics */}
          {analyticsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading analytics...</div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No analytics data available</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Scheduled
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      No-Show
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Avg Rating
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {new Date(row.session_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.total_sessions_scheduled}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.total_sessions_completed}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.total_sessions_no_show}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.average_rating ? `⭐ ${row.average_rating.toFixed(1)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.total_hours_completed?.toFixed(1) || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
