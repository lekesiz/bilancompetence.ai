import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService';

const router = Router();

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const notifications = await getUserNotifications(req.user.id, limit);

    return res.status(200).json({
      status: 'success',
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
    });
  }
});

/**
 * GET /api/notifications/unread/count
 * Get unread count
 */
router.get('/unread/count', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const count = await getUnreadCount(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unread count',
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await markAsRead(id);

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read',
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    await markAllAsRead(req.user.id);

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark all notifications as read',
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteNotification(id);

    return res.status(200).json({
      status: 'success',
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete notification',
    });
  }
});

export default router;
