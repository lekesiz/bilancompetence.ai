/**
 * Scheduling Validation Schemas
 * Zod schemas for frontend form validation
 */

import { z } from 'zod';

/**
 * Time validation helpers
 */
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const timeString = z.string().regex(timeRegex, 'Time must be in HH:MM format');
const dateString = z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format');

/**
 * Custom validators
 */
const isEndTimeAfterStartTime = (data: { start_time: string; end_time: string }) => {
  return data.start_time < data.end_time;
};

/**
 * Availability Slot Schemas
 */

export const createAvailabilitySlotSchema = z
  .object({
    // Slot type selection
    slot_type: z.enum(['ONE_TIME', 'RECURRING']),

    // Date selection
    date_specific: dateString.optional(),
    day_of_week: z.number().min(0).max(6).optional(),

    // Time
    start_time: timeString,
    end_time: timeString,

    // Duration (optional, can be calculated)
    duration_minutes: z.number().positive().default(120).optional(),

    // Configuration
    max_concurrent_bookings: z.number().min(1).max(5).default(1).optional(),
    timezone: z.string().default('UTC').optional(),

    // Recurrence
    is_recurring: z.boolean().default(false).optional(),
    recurring_until: dateString.optional(),
  })
  .refine(isEndTimeAfterStartTime, {
    message: 'End time must be after start time',
    path: ['end_time'],
  })
  .refine(
    (data) => {
      if (data.slot_type === 'ONE_TIME') {
        return !!data.date_specific;
      }
      if (data.slot_type === 'RECURRING') {
        return data.day_of_week !== undefined;
      }
      return false;
    },
    {
      message: 'Select either specific date (One-time) or day of week (Recurring)',
      path: ['date_specific'],
    }
  );

export type CreateAvailabilitySlotInput = z.infer<typeof createAvailabilitySlotSchema>;

export const updateAvailabilitySlotSchema = createAvailabilitySlotSchema.partial();

export type UpdateAvailabilitySlotInput = z.infer<typeof updateAvailabilitySlotSchema>;

/**
 * Session Booking Schemas
 */

export const createSessionBookingSchema = z.object({
  bilan_id: z.string().uuid('Invalid bilan ID'),
  consultant_id: z.string().uuid('Invalid consultant ID'),

  // Date and time
  scheduled_date: dateString,
  scheduled_start_time: timeString,
  scheduled_end_time: timeString,

  // Duration
  duration_minutes: z.number().positive().default(120).optional(),

  // Timezone
  timezone: z.string().default('UTC').optional(),

  // Session details
  session_type: z
    .enum(['INITIAL_MEETING', 'FOLLOW_UP', 'REVIEW', 'FINAL'])
    .default('FOLLOW_UP')
    .optional(),

  meeting_format: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']).default('VIDEO').optional(),

  // Location/Link
  meeting_location: z.string().max(255).optional(),
  meeting_link: z.string().url().optional(),

  // Notes
  beneficiary_notes: z.string().optional(),
  preparation_materials: z.string().optional(),

  // Optional slot reference
  availability_slot_id: z.string().uuid().optional(),
});

export type CreateSessionBookingInput = z.infer<typeof createSessionBookingSchema>;

/**
 * Session Completion Schema
 */

export const completeSessionSchema = z.object({
  attended: z.boolean(),
  beneficiary_rating: z.number().min(1).max(5).optional(),
  beneficiary_feedback: z.string().max(1000).optional(),
});

export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;

/**
 * Booking Confirmation Schema
 */

export const confirmBookingSchema = z.object({
  notes: z.string().max(500).optional(),
});

export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;

/**
 * Cancel Booking Schema
 */

export const cancelBookingSchema = z.object({
  cancellation_reason: z.string().min(1).max(500, 'Reason must be less than 500 characters'),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

/**
 * Bulk Create Schema
 */

export const bulkCreateAvailabilitySchema = z.object({
  preset: z.enum(['BUSINESS_HOURS', 'WEEKEND', 'CUSTOM']),

  // For business hours: Monday-Friday 9am-5pm
  // For weekend: Saturday-Sunday 10am-4pm
  // For custom:
  start_time: timeString,
  end_time: timeString,

  // Date range
  recurring_from_date: dateString,
  recurring_to_date: dateString,

  // Which days (if custom)
  days_of_week: z.array(z.number().min(0).max(6)).optional(),

  // Configuration
  timezone: z.string().default('UTC').optional(),
  max_concurrent_bookings: z.number().min(1).max(5).default(1).optional(),
});

export type BulkCreateAvailabilityInput = z.infer<typeof bulkCreateAvailabilitySchema>;

/**
 * Filter Schemas
 */

export const availabilityFilterSchema = z.object({
  day_of_week: z.number().min(0).max(6).optional(),
  date_from: dateString.optional(),
  date_to: dateString.optional(),
  limit: z.number().default(50).optional(),
  offset: z.number().default(0).optional(),
});

export type AvailabilityFilter = z.infer<typeof availabilityFilterSchema>;

export const bookingFilterSchema = z.object({
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .optional(),
  date_from: dateString.optional(),
  date_to: dateString.optional(),
  limit: z.number().default(50).optional(),
  offset: z.number().default(0).optional(),
});

export type BookingFilter = z.infer<typeof bookingFilterSchema>;

/**
 * Helper validation functions
 */

export function validateTimeRange(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

export function validateDateRange(fromDate: string, toDate: string): boolean {
  return fromDate <= toDate;
}

export function validatePastDate(date: string): boolean {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function validateWorkingHours(startTime: string, endTime: string): boolean {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  // Typically 8am to 10pm
  return startHour >= 8 && endHour <= 22;
}
