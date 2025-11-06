import { pool } from '../config/neon.js';
import {
  logAndThrow,
  validateRequired,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Notification Service
 * Migrated to Neon PostgreSQL
 * Standardized error handling for all notification operations
 */

export interface Notification {
  id: string;
  user_id: string;
  type: 'assessment' | 'recommendation' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  read_at?: string;
  created_at: string;
}

/**
 * Create notification
 */
export async function createNotification(
  userId: string,
  type: 'assessment' | 'recommendation' | 'message' | 'system',
  title: string,
  message: string,
  data?: any
) {
  try {
    validateRequired({ userId, type, title, message }, ['userId', 'type', 'title', 'message']);

    const validTypes = ['assessment', 'recommendation', 'message', 'system'];
    if (!validTypes.includes(type)) {
      throw new ValidationError(
        `Invalid notification type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data, read)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, title, message, data ? JSON.stringify(data) : null, false]
    );

    const notification = result.rows[0];

    logger.info('Notification created successfully', { userId, type });
    return notification as Notification;
  } catch (error) {
    logAndThrow('Failed to create notification', error);
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit: number = 50): Promise<any> {
  try {
    validateRequired({ userId }, ['userId']);

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    logger.info('User notifications retrieved successfully', { userId, count: result.rows.length });
    return result.rows;
  } catch (error) {
    logAndThrow('Failed to get user notifications', error);
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    const count = parseInt(result.rows[0].count, 10);

    logger.info('Unread count retrieved', { userId, count });
    return count;
  } catch (error) {
    logAndThrow('Failed to get unread count', error);
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  try {
    validateRequired({ notificationId }, ['notificationId']);

    const result = await pool.query(
      `UPDATE notifications
       SET read = true, read_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Notification');
    }

    const notification = result.rows[0];

    logger.info('Notification marked as read', { notificationId });
    return notification as Notification;
  } catch (error) {
    logAndThrow('Failed to mark notification as read', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    await pool.query(
      `UPDATE notifications
       SET read = true, read_at = NOW()
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    logger.info('All notifications marked as read', { userId });
    return true;
  } catch (error) {
    logAndThrow('Failed to mark all notifications as read', error);
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    validateRequired({ notificationId }, ['notificationId']);

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 RETURNING id',
      [notificationId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Notification');
    }

    logger.info('Notification deleted successfully', { notificationId });
    return true;
  } catch (error) {
    logAndThrow('Failed to delete notification', error);
  }
}

/**
 * Send assessment notification
 */
export async function notifyAssessmentStarted(beneficiaryId: string, consultantId?: string) {
  try {
    validateRequired({ beneficiaryId }, ['beneficiaryId']);

    await createNotification(
      beneficiaryId,
      'assessment',
      'Assessment Started',
      'Your assessment has been started. Please complete the questions.',
      { type: 'assessment_started' }
    );

    if (consultantId) {
      await createNotification(
        consultantId,
        'assessment',
        'New Assessment',
        'A new assessment has been assigned to you.',
        { type: 'new_assessment' }
      );
    }

    logger.info('Assessment started notifications sent', { beneficiaryId, consultantId });
  } catch (error) {
    logAndThrow('Failed to send assessment started notifications', error);
  }
}

/**
 * Send assessment completion notification
 */
export async function notifyAssessmentCompleted(beneficiaryId: string, consultantId?: string) {
  try {
    validateRequired({ beneficiaryId }, ['beneficiaryId']);

    await createNotification(
      beneficiaryId,
      'assessment',
      'Assessment Completed',
      'Your assessment has been completed. Check recommendations.',
      { type: 'assessment_completed' }
    );

    if (consultantId) {
      await createNotification(
        consultantId,
        'assessment',
        'Assessment Completed',
        'An assessment has been completed. Review results.',
        { type: 'assessment_completed_for_review' }
      );
    }

    logger.info('Assessment completed notifications sent', { beneficiaryId, consultantId });
  } catch (error) {
    logAndThrow('Failed to send assessment completed notifications', error);
  }
}

/**
 * Send recommendation notification
 */
export async function notifyNewRecommendation(userId: string, recommendationTitle: string) {
  try {
    validateRequired({ userId, recommendationTitle }, ['userId', 'recommendationTitle']);

    await createNotification(
      userId,
      'recommendation',
      'New Recommendation',
      `You have a new recommendation: ${recommendationTitle}`,
      { type: 'new_recommendation' }
    );

    logger.info('New recommendation notification sent', { userId });
  } catch (error) {
    logAndThrow('Failed to send new recommendation notification', error);
  }
}

/**
 * Send message notification
 */
export async function notifyNewMessage(userId: string, senderName: string) {
  try {
    validateRequired({ userId, senderName }, ['userId', 'senderName']);

    await createNotification(
      userId,
      'message',
      'New Message',
      `You have a new message from ${senderName}`,
      { type: 'new_message' }
    );

    logger.info('New message notification sent', { userId });
  } catch (error) {
    logAndThrow('Failed to send new message notification', error);
  }
}

/**
 * Send system notification
 */
export async function sendSystemNotification(
  userId: string,
  title: string,
  message: string,
  data?: any
) {
  try {
    validateRequired({ userId, title, message }, ['userId', 'title', 'message']);

    await createNotification(userId, 'system', title, message, data);

    logger.info('System notification sent', { userId });
  } catch (error) {
    logAndThrow('Failed to send system notification', error);
  }
}

/**
 * Broadcast notification to multiple users
 */
export async function broadcastNotification(
  userIds: string[],
  type: 'assessment' | 'recommendation' | 'message' | 'system',
  title: string,
  message: string,
  data?: any
) {
  try {
    validateRequired({ userIds, type, title, message }, ['userIds', 'type', 'title', 'message']);

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ValidationError('userIds must be a non-empty array');
    }

    const promises = userIds.map((userId) => createNotification(userId, type, title, message, data));
    await Promise.all(promises);

    logger.info('Broadcast notification sent', { count: userIds.length, type });
  } catch (error) {
    logAndThrow('Failed to broadcast notification', error);
  }
}

/**
 * Delete old read notifications
 */
export async function deleteOldReadNotifications(daysOld: number = 30) {
  try {
    validateRequired({ daysOld }, ['daysOld']);

    const result = await pool.query(
      `DELETE FROM notifications
       WHERE read = true
       AND read_at < NOW() - INTERVAL '1 day' * $1
       RETURNING id`,
      [daysOld]
    );

    const deletedCount = result.rows.length;

    logger.info('Old read notifications deleted', { deletedCount, daysOld });
    return deletedCount;
  } catch (error) {
    logAndThrow('Failed to delete old read notifications', error);
  }
}

export default {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAssessmentStarted,
  notifyAssessmentCompleted,
  notifyNewRecommendation,
  notifyNewMessage,
  sendSystemNotification,
  broadcastNotification,
  deleteOldReadNotifications,
};
