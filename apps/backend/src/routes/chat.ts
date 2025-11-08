import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
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
 * @swagger
 * /api/chat/conversations:
 *   post:
 *     summary: Create new conversation
 *     description: Create a new chat conversation between two users
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
    logger.error('Create conversation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create conversation',
    });
  }
});

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Get user conversations
 *     description: Retrieve all conversations for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of conversations to return
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
    logger.error('Get conversations error:', error);
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
      logger.error('Get conversation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch conversation',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send message
 *     description: Send a new message in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
      logger.error('Send message error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send message',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get conversation messages
 *     description: Retrieve all messages in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
      logger.error('Get messages error:', error);
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
      logger.error('Delete conversation error:', error);
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
      logger.error('Mark as read error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark messages as read',
      });
    }
  }
);

export default router;
