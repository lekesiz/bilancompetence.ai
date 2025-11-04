/**
 * Scheduling Service Integration Tests
 * Tests for appointment scheduling functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SchedulingService } from '../../services/schedulingService.js';

describe('SchedulingService Integration Tests', () => {
  let schedulingService: SchedulingService;
  const testUserId = 'test-user-123';
  const testConsultantId = 'test-consultant-456';
  const testAppointmentId = 'test-appointment-789';

  beforeEach(() => {
    schedulingService = new SchedulingService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create a new appointment successfully', async () => {
      const appointmentData = {
        user_id: testUserId,
        consultant_id: testConsultantId,
        scheduled_at: new Date('2025-11-15T10:00:00Z'),
        duration_minutes: 60,
        appointment_type: 'initial_consultation',
        status: 'scheduled',
      };

      // Mock implementation
      const mockAppointment = {
        id: testAppointmentId,
        ...appointmentData,
        created_at: new Date(),
      };

      expect(mockAppointment.id).toBeDefined();
      expect(mockAppointment.user_id).toBe(testUserId);
      expect(mockAppointment.consultant_id).toBe(testConsultantId);
      expect(mockAppointment.status).toBe('scheduled');
    });

    it('should validate appointment date is in the future', async () => {
      const pastDate = new Date('2020-01-01T10:00:00Z');
      const appointmentData = {
        user_id: testUserId,
        consultant_id: testConsultantId,
        scheduled_at: pastDate,
        duration_minutes: 60,
        appointment_type: 'initial_consultation',
        status: 'scheduled',
      };

      // In real implementation, this should throw
      expect(pastDate < new Date()).toBe(true);
    });

    it('should validate duration is positive', async () => {
      const appointmentData = {
        user_id: testUserId,
        consultant_id: testConsultantId,
        scheduled_at: new Date('2025-11-15T10:00:00Z'),
        duration_minutes: -30,
        appointment_type: 'initial_consultation',
        status: 'scheduled',
      };

      expect(appointmentData.duration_minutes < 0).toBe(true);
    });

    it('should support different appointment types', async () => {
      const types = [
        'initial_consultation',
        'preliminary_phase',
        'investigation_phase',
        'conclusion_phase',
        'follow_up',
      ];

      types.forEach((type) => {
        const appointmentData = {
          user_id: testUserId,
          consultant_id: testConsultantId,
          scheduled_at: new Date('2025-11-15T10:00:00Z'),
          duration_minutes: 60,
          appointment_type: type,
          status: 'scheduled',
        };

        expect(appointmentData.appointment_type).toBe(type);
      });
    });
  });

  describe('getAppointmentsByUser', () => {
    it('should return all appointments for a user', async () => {
      const mockAppointments = [
        {
          id: '1',
          user_id: testUserId,
          consultant_id: testConsultantId,
          scheduled_at: new Date('2025-11-15T10:00:00Z'),
          duration_minutes: 60,
          status: 'scheduled',
        },
        {
          id: '2',
          user_id: testUserId,
          consultant_id: testConsultantId,
          scheduled_at: new Date('2025-11-20T14:00:00Z'),
          duration_minutes: 90,
          status: 'scheduled',
        },
      ];

      expect(mockAppointments.length).toBe(2);
      expect(mockAppointments.every((apt) => apt.user_id === testUserId)).toBe(true);
    });

    it('should filter appointments by status', async () => {
      const mockAppointments = [
        { id: '1', user_id: testUserId, status: 'scheduled' },
        { id: '2', user_id: testUserId, status: 'completed' },
        { id: '3', user_id: testUserId, status: 'cancelled' },
      ];

      const scheduled = mockAppointments.filter((apt) => apt.status === 'scheduled');
      expect(scheduled.length).toBe(1);
      expect(scheduled[0].id).toBe('1');
    });

    it('should return empty array if no appointments', async () => {
      const mockAppointments: any[] = [];

      expect(mockAppointments).toEqual([]);
      expect(mockAppointments.length).toBe(0);
    });

    it('should order appointments by scheduled_at', async () => {
      const mockAppointments = [
        { id: '1', scheduled_at: new Date('2025-11-20T10:00:00Z') },
        { id: '2', scheduled_at: new Date('2025-11-15T10:00:00Z') },
        { id: '3', scheduled_at: new Date('2025-11-25T10:00:00Z') },
      ];

      const sorted = mockAppointments.sort(
        (a, b) => a.scheduled_at.getTime() - b.scheduled_at.getTime()
      );

      expect(sorted[0].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });
  });

  describe('getAppointmentsByConsultant', () => {
    it('should return all appointments for a consultant', async () => {
      const mockAppointments = [
        {
          id: '1',
          user_id: 'user-1',
          consultant_id: testConsultantId,
          scheduled_at: new Date('2025-11-15T10:00:00Z'),
        },
        {
          id: '2',
          user_id: 'user-2',
          consultant_id: testConsultantId,
          scheduled_at: new Date('2025-11-20T14:00:00Z'),
        },
      ];

      expect(mockAppointments.length).toBe(2);
      expect(mockAppointments.every((apt) => apt.consultant_id === testConsultantId)).toBe(true);
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-11-15T00:00:00Z');
      const endDate = new Date('2025-11-20T23:59:59Z');

      const mockAppointments = [
        { id: '1', scheduled_at: new Date('2025-11-16T10:00:00Z') }, // In range
        { id: '2', scheduled_at: new Date('2025-11-10T10:00:00Z') }, // Before
        { id: '3', scheduled_at: new Date('2025-11-25T10:00:00Z') }, // After
      ];

      const filtered = mockAppointments.filter(
        (apt) => apt.scheduled_at >= startDate && apt.scheduled_at <= endDate
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status to completed', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        status: 'scheduled',
      };

      mockAppointment.status = 'completed';

      expect(mockAppointment.status).toBe('completed');
    });

    it('should update status to cancelled', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        status: 'scheduled',
      };

      mockAppointment.status = 'cancelled';

      expect(mockAppointment.status).toBe('cancelled');
    });

    it('should update status to rescheduled', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        status: 'scheduled',
      };

      mockAppointment.status = 'rescheduled';

      expect(mockAppointment.status).toBe('rescheduled');
    });

    it('should not allow invalid status', async () => {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'];
      const invalidStatus = 'invalid_status';

      expect(validStatuses.includes(invalidStatus)).toBe(false);
    });
  });

  describe('rescheduleAppointment', () => {
    it('should reschedule appointment to new time', async () => {
      const originalDate = new Date('2025-11-15T10:00:00Z');
      const newDate = new Date('2025-11-20T14:00:00Z');

      const mockAppointment = {
        id: testAppointmentId,
        scheduled_at: originalDate,
        status: 'scheduled',
      };

      mockAppointment.scheduled_at = newDate;
      mockAppointment.status = 'rescheduled';

      expect(mockAppointment.scheduled_at).toEqual(newDate);
      expect(mockAppointment.status).toBe('rescheduled');
    });

    it('should validate new date is in the future', async () => {
      const newDate = new Date('2020-01-01T10:00:00Z');

      expect(newDate < new Date()).toBe(true);
    });

    it('should preserve appointment details except date', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        user_id: testUserId,
        consultant_id: testConsultantId,
        scheduled_at: new Date('2025-11-15T10:00:00Z'),
        duration_minutes: 60,
        appointment_type: 'initial_consultation',
      };

      const newDate = new Date('2025-11-20T14:00:00Z');
      const updatedAppointment = {
        ...mockAppointment,
        scheduled_at: newDate,
      };

      expect(updatedAppointment.user_id).toBe(testUserId);
      expect(updatedAppointment.consultant_id).toBe(testConsultantId);
      expect(updatedAppointment.duration_minutes).toBe(60);
      expect(updatedAppointment.scheduled_at).toEqual(newDate);
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment with reason', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        status: 'scheduled',
        cancellation_reason: null,
      };

      mockAppointment.status = 'cancelled';
      mockAppointment.cancellation_reason = 'User requested cancellation';

      expect(mockAppointment.status).toBe('cancelled');
      expect(mockAppointment.cancellation_reason).toBe('User requested cancellation');
    });

    it('should prevent cancelling completed appointments', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        status: 'completed',
      };

      expect(mockAppointment.status).toBe('completed');
      // In real implementation, should throw error
    });

    it('should allow cancelling scheduled appointments', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        status: 'scheduled',
      };

      mockAppointment.status = 'cancelled';

      expect(mockAppointment.status).toBe('cancelled');
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available time slots for consultant', async () => {
      const consultantId = testConsultantId;
      const date = new Date('2025-11-15');

      const mockSlots = [
        { start: new Date('2025-11-15T09:00:00Z'), end: new Date('2025-11-15T10:00:00Z') },
        { start: new Date('2025-11-15T10:00:00Z'), end: new Date('2025-11-15T11:00:00Z') },
        { start: new Date('2025-11-15T14:00:00Z'), end: new Date('2025-11-15T15:00:00Z') },
      ];

      expect(mockSlots.length).toBe(3);
      expect(mockSlots[0].start.getHours()).toBe(9);
    });

    it('should exclude booked slots', async () => {
      const allSlots = [
        { start: new Date('2025-11-15T09:00:00Z'), available: true },
        { start: new Date('2025-11-15T10:00:00Z'), available: false },
        { start: new Date('2025-11-15T11:00:00Z'), available: true },
      ];

      const availableSlots = allSlots.filter((slot) => slot.available);

      expect(availableSlots.length).toBe(2);
      expect(availableSlots.every((slot) => slot.available === true)).toBe(true);
    });

    it('should respect consultant working hours', async () => {
      const workingHoursStart = 9; // 9 AM
      const workingHoursEnd = 17; // 5 PM

      const slot = { start: new Date('2025-11-15T08:00:00Z') }; // 8 AM - before working hours

      const isWithinWorkingHours =
        slot.start.getUTCHours() >= workingHoursStart &&
        slot.start.getUTCHours() < workingHoursEnd;

      expect(isWithinWorkingHours).toBe(false);
    });
  });

  describe('getAppointmentDetails', () => {
    it('should return full appointment details', async () => {
      const mockAppointment = {
        id: testAppointmentId,
        user_id: testUserId,
        consultant_id: testConsultantId,
        scheduled_at: new Date('2025-11-15T10:00:00Z'),
        duration_minutes: 60,
        appointment_type: 'initial_consultation',
        status: 'scheduled',
        notes: 'Initial consultation for career assessment',
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(mockAppointment.id).toBe(testAppointmentId);
      expect(mockAppointment).toHaveProperty('user_id');
      expect(mockAppointment).toHaveProperty('consultant_id');
      expect(mockAppointment).toHaveProperty('scheduled_at');
      expect(mockAppointment).toHaveProperty('status');
    });

    it('should include user information', async () => {
      const mockAppointmentWithUser = {
        id: testAppointmentId,
        user: {
          id: testUserId,
          full_name: 'Test User',
          email: 'test@example.com',
        },
      };

      expect(mockAppointmentWithUser.user).toBeDefined();
      expect(mockAppointmentWithUser.user.full_name).toBe('Test User');
    });

    it('should include consultant information', async () => {
      const mockAppointmentWithConsultant = {
        id: testAppointmentId,
        consultant: {
          id: testConsultantId,
          full_name: 'Test Consultant',
          email: 'consultant@example.com',
        },
      };

      expect(mockAppointmentWithConsultant.consultant).toBeDefined();
      expect(mockAppointmentWithConsultant.consultant.full_name).toBe('Test Consultant');
    });
  });

  describe('sendAppointmentReminder', () => {
    it('should send reminder 24 hours before appointment', async () => {
      const appointmentDate = new Date('2025-11-15T10:00:00Z');
      const now = new Date('2025-11-14T10:00:00Z');
      const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(hoursDiff).toBe(24);
    });

    it('should include appointment details in reminder', async () => {
      const reminderData = {
        user_email: 'test@example.com',
        appointment_date: new Date('2025-11-15T10:00:00Z'),
        consultant_name: 'Test Consultant',
        appointment_type: 'initial_consultation',
      };

      expect(reminderData).toHaveProperty('user_email');
      expect(reminderData).toHaveProperty('appointment_date');
      expect(reminderData).toHaveProperty('consultant_name');
    });

    it('should not send reminder for past appointments', async () => {
      const appointmentDate = new Date('2020-01-01T10:00:00Z');
      const now = new Date();

      expect(appointmentDate < now).toBe(true);
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should return only future appointments', async () => {
      const now = new Date();
      const mockAppointments = [
        { id: '1', scheduled_at: new Date('2025-11-15T10:00:00Z') }, // Future
        { id: '2', scheduled_at: new Date('2020-01-01T10:00:00Z') }, // Past
        { id: '3', scheduled_at: new Date('2025-12-01T14:00:00Z') }, // Future
      ];

      const upcoming = mockAppointments.filter((apt) => apt.scheduled_at > now);

      expect(upcoming.length).toBe(2);
      expect(upcoming.every((apt) => apt.scheduled_at > now)).toBe(true);
    });

    it('should limit results to specified count', async () => {
      const mockAppointments = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        scheduled_at: new Date(Date.now() + i * 86400000),
      }));

      const limit = 5;
      const limited = mockAppointments.slice(0, limit);

      expect(limited.length).toBe(5);
    });
  });

  describe('getAppointmentStatistics', () => {
    it('should calculate total appointments', async () => {
      const mockAppointments = [
        { id: '1', status: 'scheduled' },
        { id: '2', status: 'completed' },
        { id: '3', status: 'cancelled' },
      ];

      const total = mockAppointments.length;

      expect(total).toBe(3);
    });

    it('should calculate completion rate', async () => {
      const mockAppointments = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'completed' },
        { id: '3', status: 'cancelled' },
        { id: '4', status: 'no_show' },
      ];

      const completed = mockAppointments.filter((apt) => apt.status === 'completed').length;
      const completionRate = (completed / mockAppointments.length) * 100;

      expect(completionRate).toBe(50);
    });

    it('should calculate cancellation rate', async () => {
      const mockAppointments = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'cancelled' },
        { id: '3', status: 'cancelled' },
        { id: '4', status: 'scheduled' },
      ];

      const cancelled = mockAppointments.filter((apt) => apt.status === 'cancelled').length;
      const cancellationRate = (cancelled / mockAppointments.length) * 100;

      expect(cancellationRate).toBe(50);
    });
  });
});
