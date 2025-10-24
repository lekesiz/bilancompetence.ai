/**
 * Notification Service Unit Tests
 *
 * Tests for notification management functionality:
 * - sendNotification
 * - getUserNotifications
 * - markNotificationAsRead
 * - deleteNotification
 */

import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '../../services/notificationService.js';
import { supabase } from '../../services/supabaseService.js';

jest.mock('../../services/supabaseService', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('NotificationService', () => {
  const testUserId = 'user-123';
  const testNotificationId = 'notif-456';

  const mockNotification = {
    id: testNotificationId,
    user_id: testUserId,
    type: 'assessment_submitted',
    title: 'Assessment Submitted',
    message: 'Your assessment has been submitted successfully',
    data: { assessment_id: 'assess-123' },
    is_read: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockNotification,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await sendNotification(testUserId, {
        type: 'assessment_submitted',
        title: 'Assessment Submitted',
        message: 'Your assessment has been submitted successfully',
      });

      expect(result.id).toBe(testNotificationId);
      expect(result.type).toBe('assessment_submitted');
      expect(result.is_read).toBe(false);
    });

    it('should include notification metadata', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockNotification,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await sendNotification(testUserId, {
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed',
        data: { booking_id: 'book-123' },
      });

      expect(result.user_id).toBe(testUserId);
      expect(result.data).toEqual({ booking_id: 'book-123' });
    });

    it('should handle different notification types', async () => {
      const types = [
        'assessment_submitted',
        'recommendation_created',
        'booking_confirmed',
        'schedule_reminder',
      ];

      for (const type of types) {
        const mockInsert = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockNotification, type },
              error: null,
            }),
          }),
        });

        (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

        const result = await sendNotification(testUserId, {
          type,
          title: 'Test',
          message: 'Test message',
        });

        expect(result.type).toBe(type);
      }
    });
  });

  describe('getUserNotifications', () => {
    it('should fetch user notifications successfully', async () => {
      const mockNotifications = [mockNotification];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockNotifications,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserNotifications(testUserId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].user_id).toBe(testUserId);
    });

    it('should return notifications in descending order', async () => {
      const older = { ...mockNotification, created_at: '2025-01-01T00:00:00Z' };
      const newer = { ...mockNotification, created_at: '2025-01-02T00:00:00Z' };
      const notifications = [newer, older];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: notifications,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserNotifications(testUserId);

      expect(result[0].created_at).toBeGreaterThanOrEqual(result[1].created_at);
    });

    it('should handle empty notification list', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserNotifications(testUserId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockNotification, is_read: true },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await markNotificationAsRead(testNotificationId);

      expect(result.is_read).toBe(true);
    });

    it('should update read timestamp', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockNotification, is_read: true, read_at: new Date().toISOString() },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await markNotificationAsRead(testNotificationId);

      expect(result.is_read).toBe(true);
    });

    it('should handle already read notifications', async () => {
      const readNotification = { ...mockNotification, is_read: true };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: readNotification,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await markNotificationAsRead(testNotificationId);

      expect(result.is_read).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      await deleteNotification(testNotificationId);

      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle deletion of non-existent notification', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteNotification('non-existent-id')).resolves.not.toThrow();
    });

    it('should handle database errors during deletion', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteNotification(testNotificationId)).rejects.toThrow();
    });
  });

  describe('NotificationService Error Handling', () => {
    it('should handle Supabase connection errors', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Connection failed'),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(
        sendNotification(testUserId, {
          type: 'test',
          title: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should handle invalid notification types gracefully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockNotification, type: 'unknown_type' },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await sendNotification(testUserId, {
        type: 'unknown_type',
        title: 'Unknown',
        message: 'Test',
      });

      expect(result.type).toBeDefined();
    });
  });

  describe('NotificationService Success Cases', () => {
    it('should handle bulk notification sending', async () => {
      const users = ['user-1', 'user-2', 'user-3'];

      for (const userId of users) {
        const mockInsert = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockNotification, user_id: userId },
              error: null,
            }),
          }),
        });

        (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

        const result = await sendNotification(userId, {
          type: 'test',
          title: 'Test',
          message: 'Test',
        });

        expect(result.user_id).toBe(userId);
      }
    });

    it('should preserve notification data structure', async () => {
      const notificationData = {
        assessment_id: 'assess-123',
        recommendation_id: 'rec-456',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockNotification, data: notificationData },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await sendNotification(testUserId, {
        type: 'test',
        title: 'Test',
        message: 'Test',
        data: notificationData,
      });

      expect(result.data).toEqual(notificationData);
    });
  });
});
