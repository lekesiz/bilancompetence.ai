import { supabase } from './supabaseService';

/**
 * Notification Service
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
    throw error;
  }

  return notification as Notification;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(userId: string) {
  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
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
    throw error;
  }

  return data as Notification;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Send assessment notification
 */
export async function notifyAssessmentStarted(beneficiaryId: string, consultantId?: string) {
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
}

/**
 * Send assessment completion notification
 */
export async function notifyAssessmentCompleted(beneficiaryId: string, consultantId?: string) {
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
}

/**
 * Send recommendation notification
 */
export async function notifyRecommendationCreated(userId: string, title: string) {
  await createNotification(
    userId,
    'recommendation',
    'New Recommendation',
    `A new recommendation has been created: ${title}`,
    { type: 'new_recommendation' }
  );
}

/**
 * Send message notification
 */
export async function notifyNewMessage(recipientId: string, senderName: string, messagePreview: string) {
  await createNotification(
    recipientId,
    'message',
    `Message from ${senderName}`,
    messagePreview,
    { type: 'new_message', sender_name: senderName }
  );
}

/**
 * Send system notification
 */
export async function notifySystem(userId: string, title: string, message: string) {
  await createNotification(
    userId,
    'system',
    title,
    message,
    { type: 'system' }
  );
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
    throw error;
  }

  return true;
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
