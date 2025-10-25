/**
 * BeneficiaryBookingForm Component
 * Form for beneficiaries to complete booking after selecting a slot
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreateSessionBooking } from '@/hooks/useScheduling';
import { useAuth } from '@/hooks/useAuth';

/**
 * Zod schema for beneficiary booking form
 */
const beneficiaryBookingSchema = z.object({
  session_type: z.enum(['INITIAL_MEETING', 'FOLLOW_UP', 'REVIEW', 'FINAL']),
  meeting_format: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']),
  meeting_location: z.string().optional(),
  meeting_link: z.string().url().optional(),
  beneficiary_notes: z.string().max(1000).optional(),
  preparation_materials: z.string().optional(),
});

type BeneficiaryBookingFormData = z.infer<typeof beneficiaryBookingSchema>;

interface BeneficiaryBookingFormProps {
  bilanId: string;
  consultantId: string;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  durationMinutes: number;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
}

/**
 * BeneficiaryBookingForm Component
 */
export default function BeneficiaryBookingForm({
  bilanId,
  consultantId,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  durationMinutes,
  onSuccess,
  onCancel,
}: BeneficiaryBookingFormProps) {
  const { organizationId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createBooking } = useCreateSessionBooking();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<BeneficiaryBookingFormData>({
    resolver: zodResolver(beneficiaryBookingSchema),
    defaultValues: {
      session_type: 'INITIAL_MEETING',
      meeting_format: 'VIDEO',
      beneficiary_notes: '',
    },
  });

  const meetingFormat = watch('meeting_format');

  const onSubmit = async (data: BeneficiaryBookingFormData) => {
    if (!organizationId) {
      toast.error('Organization context not available');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        bilan_id: bilanId,
        consultant_id: consultantId,
        scheduled_date: selectedDate,
        scheduled_start_time: selectedStartTime,
        scheduled_end_time: selectedEndTime,
        duration_minutes: durationMinutes,
        session_type: data.session_type,
        meeting_format: data.meeting_format,
        meeting_location: data.meeting_location,
        meeting_link: data.meeting_link,
        beneficiary_notes: data.beneficiary_notes,
        preparation_materials: data.preparation_materials,
      };

      const response = await createBooking(bookingData);
      toast.success('Session booked successfully!');
      reset();
      onSuccess?.(response?.id || '');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>

      {/* Booking Summary */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Date & Time:</strong> {selectedDate} from {selectedStartTime} to {selectedEndTime} ({durationMinutes} minutes)
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Type *
          </label>
          <select
            {...register('session_type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="INITIAL_MEETING">Initial Meeting</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="REVIEW">Review</option>
            <option value="FINAL">Final</option>
          </select>
          {errors.session_type && (
            <p className="text-red-600 text-sm mt-1">{errors.session_type.message}</p>
          )}
        </div>

        {/* Meeting Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Format *
          </label>
          <select
            {...register('meeting_format')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="VIDEO">Video Call</option>
            <option value="PHONE">Phone Call</option>
            <option value="IN_PERSON">In Person</option>
          </select>
          {errors.meeting_format && (
            <p className="text-red-600 text-sm mt-1">{errors.meeting_format.message}</p>
          )}
        </div>

        {/* Meeting Location/Link (conditional) */}
        {meetingFormat === 'IN_PERSON' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Location
            </label>
            <input
              type="text"
              {...register('meeting_location')}
              placeholder="e.g., Office Building A, Room 301"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.meeting_location && (
              <p className="text-red-600 text-sm mt-1">{errors.meeting_location.message}</p>
            )}
          </div>
        )}

        {meetingFormat === 'VIDEO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link (Optional)
            </label>
            <input
              type="url"
              {...register('meeting_link')}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.meeting_link && (
              <p className="text-red-600 text-sm mt-1">{errors.meeting_link.message}</p>
            )}
          </div>
        )}

        {/* Beneficiary Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes or Topics to Discuss (Optional)
          </label>
          <textarea
            {...register('beneficiary_notes')}
            placeholder="Share any topics you'd like to discuss or questions you have..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          {errors.beneficiary_notes && (
            <p className="text-red-600 text-sm mt-1">{errors.beneficiary_notes.message}</p>
          )}
        </div>

        {/* Preparation Materials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preparation Materials (Optional)
          </label>
          <textarea
            {...register('preparation_materials')}
            placeholder="Any documents or materials you'd like to prepare or bring..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          {errors.preparation_materials && (
            <p className="text-red-600 text-sm mt-1">{errors.preparation_materials.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
