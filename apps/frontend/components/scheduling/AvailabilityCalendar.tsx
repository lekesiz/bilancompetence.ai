/**
 * AvailabilityCalendar Component
 * Visual calendar display of consultant's availability slots
 */

'use client';

import React, { useState, useMemo } from 'react';
import { AvailabilitySlot } from '@/lib/schedulingAPI';
import { useAvailability, useDeleteAvailabilitySlot } from '@/hooks/useScheduling';
import { toastSuccess, toastError } from '@/components/ui/Toast';
// import { ChevronLeft, ChevronRight, Trash2, Edit2 } from 'lucide-react'; // Package not installed

// Temporary icon replacements until lucide-react is installed
const ChevronLeft = ({ className }: { className?: string }) => <span className={className}>‹</span>;
const ChevronRight = ({ className }: { className?: string }) => <span className={className}>›</span>;
const Trash2 = ({ className }: { className?: string }) => <span className={className}>🗑</span>;
const Edit2 = ({ className }: { className?: string }) => <span className={className}>✏</span>;

interface AvailabilityCalendarProps {
  consultantId: string;
  onSlotClick?: (slot: AvailabilitySlot) => void;
  onSlotEdit?: (slot: AvailabilitySlot) => void;
  onDateSelect?: (date: Date) => void;
}

/**
 * Simple calendar component
 */
function CalendarGrid({
  month,
  year,
  slots,
  onDateClick,
  onSlotClick,
}: {
  month: number;
  year: number;
  slots: AvailabilitySlot[];
  onDateClick: (date: Date) => void;
  onSlotClick: (slot: AvailabilitySlot) => void;
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const hasSlot = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return slots.some((slot) => slot.date_specific === dateStr);
  };

  const getSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter((slot) => slot.date_specific === dateStr);
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayLabels.map((label) => (
          <div key={label} className="text-center font-semibold text-gray-600 dark:text-gray-300 text-sm py-2">
            {label}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, idx) => (
          <div key={idx} className="aspect-square">
            {!date ? (
              <div className="w-full h-full bg-gray-50 rounded"></div>
            ) : (
              <button
                onClick={() => {
                  onDateClick(date);
                  const daySlots = getSlotsForDate(date);
                  if (daySlots.length > 0) {
                    onSlotClick(daySlots[0]);
                  }
                }}
                className={`w-full h-full p-1 rounded text-xs font-medium flex flex-col items-center justify-center transition ${
                  hasSlot(date)
                    ? 'bg-green-100 text-green-900 border-2 border-green-500 hover:bg-green-200'
                    : 'bg-gray-50 text-gray-700 dark:text-gray-200 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div>{date.getDate()}</div>
                {hasSlot(date) && <div className="text-xs mt-1">✓</div>}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AvailabilityCalendar Component
 */
export default function AvailabilityCalendar({
  consultantId,
  onSlotClick,
  onSlotEdit,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const deleteMutation = useDeleteAvailabilitySlot();

  // Fetch availability for current month
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const dateFrom = monthStart.toISOString().split('T')[0];
  const dateTo = monthEnd.toISOString().split('T')[0];

  const { data: slots = [], isLoading } = useAvailability(consultantId, {
    date_from: dateFrom,
    date_to: dateTo,
  });

  const recurringSlots = useMemo(() => {
    return slots.filter((slot: AvailabilitySlot) => slot.is_recurring);
  }, [slots]);

  const oneTimeSlots = useMemo(() => {
    return slots.filter((slot: AvailabilitySlot) => !slot.is_recurring);
  }, [slots]);

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      await deleteMutation.mutateAsync(slotId);
      toastSuccess('Availability slot deleted');
      setSelectedSlot(null);
    } catch (error) {
      toastError('Failed to delete availability slot');
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">Loading calendar...</div>
          ) : (
            <CalendarGrid
              month={currentDate.getMonth()}
              year={currentDate.getFullYear()}
              slots={oneTimeSlots}
              onDateClick={(date) => onDateSelect?.(date)}
              onSlotClick={(slot) => {
                setSelectedSlot(slot);
                onSlotClick?.(slot);
              }}
            />
          )}
        </div>
      </div>

      {/* Sidebar - Details */}
      <div className="space-y-4">
        {/* Recurring Slots */}
        {recurringSlots.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recurring Availability</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recurringSlots.map((slot: AvailabilitySlot) => (
                <div key={slot.id} className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][slot.day_of_week || 0]}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {slot.start_time} - {slot.end_time}
                      </p>
                      {slot.recurring_until && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Until {slot.recurring_until}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Slot Details */}
        {selectedSlot && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Slot Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Date</p>
                <p className="font-medium">
                  {selectedSlot.date_specific
                    ? new Date(selectedSlot.date_specific).toLocaleDateString()
                    : 'Recurring'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Time</p>
                <p className="font-medium">
                  {selectedSlot.start_time} - {selectedSlot.end_time}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                <p className="font-medium">{selectedSlot.duration_minutes} minutes</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Max Concurrent</p>
                <p className="font-medium">{selectedSlot.max_concurrent_bookings}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Timezone</p>
                <p className="font-medium">{selectedSlot.timezone}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => onSlotEdit?.(selectedSlot)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSlot(selectedSlot.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Green dates have availability slots. Click to view details or
            create new slots.
          </p>
        </div>
      </div>
    </div>
  );
}
