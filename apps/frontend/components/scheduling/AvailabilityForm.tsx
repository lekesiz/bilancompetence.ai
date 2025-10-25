/**
 * AvailabilityForm Component
 * Handles creation and editing of consultant availability slots
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastSuccess, toastError } from '@/components/ui/Toast';
import {
  createAvailabilitySlotSchema,
  CreateAvailabilitySlotInput,
  validateTimeRange,
  validateDateRange,
  validatePastDate,
} from '@/lib/schedulingSchemas';
import { AvailabilitySlot } from '@/lib/schedulingAPI';
import { useCreateAvailabilitySlot, useUpdateAvailabilitySlot } from '@/hooks/useScheduling';

interface AvailabilityFormProps {
  consultantId: string;
  initialSlot?: AvailabilitySlot;
  onSuccess?: (slot: AvailabilitySlot) => void;
  onCancel?: () => void;
}

const TIMEZONES = [
  'UTC',
  'Europe/Paris',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

/**
 * AvailabilityForm Component
 */
export default function AvailabilityForm({
  consultantId,
  initialSlot,
  onSuccess,
  onCancel,
}: AvailabilityFormProps) {
  const [slotType, setSlotType] = useState<'ONE_TIME' | 'RECURRING'>(
    initialSlot?.date_specific ? 'ONE_TIME' : 'RECURRING'
  );

  const createMutation = useCreateAvailabilitySlot();
  const updateMutation = useUpdateAvailabilitySlot();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateAvailabilitySlotInput>({
    resolver: zodResolver(createAvailabilitySlotSchema),
    defaultValues: initialSlot
      ? {
          slot_type: initialSlot.date_specific ? 'ONE_TIME' : 'RECURRING',
          date_specific: initialSlot.date_specific,
          day_of_week: initialSlot.day_of_week,
          start_time: initialSlot.start_time,
          end_time: initialSlot.end_time,
          duration_minutes: initialSlot.duration_minutes,
          max_concurrent_bookings: initialSlot.max_concurrent_bookings,
          timezone: initialSlot.timezone,
          is_recurring: initialSlot.is_recurring,
          recurring_until: initialSlot.recurring_until,
        }
      : {
          slot_type: 'RECURRING',
          start_time: '09:00',
          end_time: '17:00',
          timezone: 'UTC',
          max_concurrent_bookings: 1,
          duration_minutes: 120,
        },
  });

  const startTime = watch('start_time');
  const endTime = watch('end_time');
  const selectedSlotType = watch('slot_type');

  // Calculate duration
  useEffect(() => {
    if (startTime && endTime && validateTimeRange(startTime, endTime)) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const duration = (endHour - startHour) * 60 + (endMin - startMin);
      setValue('duration_minutes', duration);
    }
  }, [startTime, endTime, setValue]);

  const onSubmit = async (data: CreateAvailabilitySlotInput) => {
    try {
      if (initialSlot) {
        // Update existing
        await updateMutation.mutateAsync({
          slotId: initialSlot.id,
          data,
        });
        toastSuccess('Availability slot updated successfully');
      } else {
        // Create new
        await createMutation.mutateAsync(data);
        toastSuccess('Availability slot created successfully');
        reset();
      }

      onSuccess?.({} as AvailabilitySlot);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save availability slot';
      toastError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialSlot ? 'Edit Availability Slot' : 'Create Availability Slot'}
      </h2>

      {/* Slot Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center p-4 border-2 border-gray-200 rounded cursor-pointer hover:border-primary-500 transition">
          <input
            type="radio"
            value="ONE_TIME"
            {...register('slot_type')}
            onChange={(e) => setSlotType(e.target.value as 'ONE_TIME' | 'RECURRING')}
            className="w-4 h-4"
          />
          <span className="ml-3">
            <strong>One-Time</strong>
            <p className="text-sm text-gray-500">Single specific date</p>
          </span>
        </label>

        <label className="flex items-center p-4 border-2 border-gray-200 rounded cursor-pointer hover:border-primary-500 transition">
          <input
            type="radio"
            value="RECURRING"
            {...register('slot_type')}
            onChange={(e) => setSlotType(e.target.value as 'ONE_TIME' | 'RECURRING')}
            className="w-4 h-4"
          />
          <span className="ml-3">
            <strong>Recurring</strong>
            <p className="text-sm text-gray-500">Weekly pattern</p>
          </span>
        </label>
      </div>

      {/* Date/Day Selection */}
      <div className="space-y-3">
        {selectedSlotType === 'ONE_TIME' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              {...register('date_specific')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.date_specific && (
              <p className="text-red-500 text-sm mt-1">{errors.date_specific.message}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
            <select
              {...register('day_of_week', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a day</option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            {errors.day_of_week && (
              <p className="text-red-500 text-sm mt-1">{errors.day_of_week.message}</p>
            )}

            {/* Recurring until date */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring Until (Optional)
              </label>
              <input
                type="date"
                {...register('recurring_until')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                Leave empty for ongoing recurrence
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <input
            type="time"
            {...register('start_time')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.start_time && (
            <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
          <input
            type="time"
            {...register('end_time')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.end_time && (
            <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      {/* Duration Display */}
      {watch('duration_minutes') && (
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>Duration:</strong> {watch('duration_minutes')} minutes
          </p>
        </div>
      )}

      {/* Timezone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          {...register('timezone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Max Concurrent Bookings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Concurrent Bookings
        </label>
        <input
          type="number"
          min="1"
          max="5"
          {...register('max_concurrent_bookings', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-gray-500 text-sm mt-1">
          How many sessions can be scheduled at the same time
        </p>
        {errors.max_concurrent_bookings && (
          <p className="text-red-500 text-sm mt-1">{errors.max_concurrent_bookings.message}</p>
        )}
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm font-medium">Please fix the errors above</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition"
        >
          {isSubmitting ? 'Saving...' : initialSlot ? 'Update Slot' : 'Create Slot'}
        </button>
      </div>
    </form>
  );
}
