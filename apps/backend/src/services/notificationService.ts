import { supabase } from './supabaseService';
import { logAndThrow, validateRequired, DatabaseError, NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Notification Service
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
      throw new ValidationError(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to create notification', error);
    }

    logger.info('Notification created successfully', { userId, type });
    return notification as unknown as Notification;
  } catch (error) {
    logAndThrow('Failed to create notification', error);
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  try {
    validateRequired({ userId }, ['userId']);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new DatabaseError('Failed to fetch user notifications', error);
    }

    logger.info('User notifications retrieved successfully', { userId, count: data?.length || 0 });
    return data || [];
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

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new DatabaseError('Failed to fetch unread count', error);
    }

    logger.info('Unread count retrieved', { userId, count: count || 0 });
    return count || 0;
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

    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to mark notification as read', error);
    }

    logger.info('Notification marked as read', { notificationId });
    return data as unknown as Notification;
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

    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new DatabaseError('Failed to mark all notifications as read', error);
    }

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

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw new DatabaseError('Failed to delete notification', error);
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
export async function notifyRecommendationCreated(userId: string, title: string) {
  try {
    validateRequired({ userId, title }, ['userId', 'title']);

    await createNotification(
      userId,
      'recommendation',
      'New Recommendation',
      `A new recommendation has been created: ${title}`,
      { type: 'new_recommendation' }
    );

    logger.info('Recommendation notification sent', { userId });
  } catch (error) {
    logAndThrow('Failed to send recommendation notification', error);
  }
}

/**
 * Send message notification
 */
export async function notifyNewMessage(recipientId: string, senderName: string, messagePreview: string) {
  try {
    validateRequired({ recipientId, senderName, messagePreview }, ['recipientId', 'senderName', 'messagePreview']);

    await createNotification(
      recipientId,
      'message',
      `Message from ${senderName}`,
      messagePreview,
      { type: 'new_message', sender_name: senderName }
    );

    logger.info('Message notification sent', { recipientId, senderName });
  } catch (error) {
    logAndThrow('Failed to send message notification', error);
  }
}

/**
 * Send system notification
 */
export async function notifySystem(userId: string, title: string, message: string) {
  try {
    validateRequired({ userId, title, message }, ['userId', 'title', 'message']);

    await createNotification(
      userId,
      'system',
      title,
      message,
      { type: 'system' }
    );

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
  type: string,
  title: string,
  message: string,
  data?: any
) {
  try {
    validateRequired({ userIds, type, title, message }, ['userIds', 'type', 'title', 'message']);

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ValidationError('userIds must be a non-empty array');
    }

    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) {
      throw new DatabaseError('Failed to broadcast notifications', error);
    }

    logger.info('Notifications broadcasted successfully', { recipientCount: userIds.length, type });
    return true;
  } catch (error) {
    logAndThrow('Failed to broadcast notifications', error);
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
  notifyRecommendationCreated,
  notifyNewMessage,
  notifySystem,
  broadcastNotification,
};
