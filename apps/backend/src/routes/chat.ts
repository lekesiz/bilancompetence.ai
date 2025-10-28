import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createConversation,
  getUserConversations,
  getConversation,
  createMessage,
  getMessages,
  markMessageAsRead,
  markConversationAsRead,
  deleteConversation,
  deleteMessage,
} from '../services/chatServiceNeon.js';

const router = Router();

/**
 * POST /api/chat/conversations
 * Create a new conversation
 */
router.post('/conversations', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { participantId, title } = req.body;

    if (!participantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Participant ID required',
      });
    }

    // Create conversation in database
    const conversation = await createConversation(req.user.id, participantId, title);

    return res.status(201).json({
      status: 'success',
      data: conversation,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create conversation',
    });
  }
});

/**
 * GET /api/chat/conversations
 * Get user conversations
 */
router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;

    const conversations = await getUserConversations(req.user.id, limit);

    return res.status(200).json({
      status: 'success',
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations',
    });
  }
});

/**
 * GET /api/chat/conversations/:conversationId
 * Get conversation details
 */
router.get(
  '/conversations/:conversationId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const conversation = await getConversation(conversationId, req.user.id);

      if (!conversation) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: conversation,
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch conversation',
      });
    }
  }
);

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send message (stored in DB)
 */
router.post(
  '/conversations/:conversationId/messages',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const { conversationId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          status: 'error',
          message: 'Message content required',
        });
      }

      // Store message in database
      const message = await createMessage(conversationId, req.user.id, content);

      return res.status(201).json({
        status: 'success',
        data: message,
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send message',
      });
    }
  }
);

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get conversation messages
 */
router.get(
  '/conversations/:conversationId/messages',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const messages = await getMessages(conversationId, req.user.id, limit);

      return res.status(200).json({
        status: 'success',
        data: messages.reverse(), // Reverse to get chronological order
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch messages',
      });
    }
  }
);

/**
 * DELETE /api/chat/conversations/:conversationId
 * Delete conversation
 */
router.delete(
  '/conversations/:conversationId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const { conversationId } = req.params;

      const deleted = await deleteConversation(conversationId, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found or unauthorized',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Conversation deleted',
      });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete conversation',
      });
    }
  }
);

/**
 * POST /api/chat/conversations/:conversationId/mark-as-read
 * Mark messages as read
 */
router.post(
  '/conversations/:conversationId/mark-as-read',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const { conversationId } = req.params;

      // Mark all unread messages as read
      const count = await markConversationAsRead(conversationId, req.user.id);

      return res.status(200).json({
        status: 'success',
        message: 'Messages marked as read',
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark messages as read',
      });
    }
  }
);

export default router;
