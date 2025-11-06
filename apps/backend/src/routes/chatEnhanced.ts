import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as chatService from '../services/chatService.js';

const router = Router();

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Get user conversations
 *     description: Retrieve all conversations for authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/conversations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const conversations = await chatService.getUserConversations(userId);

    res.status(200).json({ conversations });
  } catch (error: any) {
    console.error('Erreur /chat/conversations:', error);
    res
      .status(500)
      .json({ error: error.message || 'Erreur lors de la récupération des conversations' });
  }
});

/**
 * @swagger
 * /api/chat/conversations:
 *   post:
 *     summary: Create or get conversation
 *     description: Create new conversation or retrieve existing one with another user
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
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 *       400:
 *         description: Missing recipientId
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/conversations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { recipientId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId requis' });
    }

    const conversation = await chatService.getOrCreateConversation(userId, recipientId);

    res.status(200).json({ conversation });
  } catch (error: any) {
    console.error('Erreur /chat/conversations POST:', error);
    res
      .status(500)
      .json({ error: error.message || 'Erreur lors de la création de la conversation' });
  }
});

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get conversation messages
 *     description: Retrieve messages from a specific conversation with pagination
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
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/conversations/:conversationId/messages',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const messages = await chatService.getConversationMessages(conversationId, limit, offset);

      res.status(200).json({ messages });
    } catch (error: any) {
      console.error('Erreur /chat/conversations/:id/messages:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erreur lors de la récupération des messages' });
    }
  }
);

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: Send a message
 *     description: Send a new message in a conversation
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
 *               - conversationId
 *               - recipientId
 *               - message
 *             properties:
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *               message:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 default: text
 *               fileUrl:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { conversationId, recipientId, message, messageType, fileUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!conversationId || !recipientId || !message) {
      return res.status(400).json({ error: 'conversationId, recipientId et message requis' });
    }

    const newMessage = await chatService.sendMessage({
      conversation_id: conversationId,
      sender_id: userId,
      recipient_id: recipientId,
      message,
      message_type: messageType || 'text',
      file_url: fileUrl,
      is_read: false,
    });

    res.status(201).json({ message: newMessage });
  } catch (error: any) {
    console.error('Erreur /chat/messages POST:', error);
    res.status(500).json({ error: error.message || "Erreur lors de l'envoi du message" });
  }
});

/**
 * @swagger
 * /api/chat/messages/{messageId}/read:
 *   put:
 *     summary: Mark message as read
 *     description: Mark a specific message as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/messages/:messageId/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await chatService.markMessageAsRead(messageId);

    res.status(200).json({ message: 'Message marqué comme lu' });
  } catch (error: any) {
    console.error('Erreur /chat/messages/:id/read:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du marquage du message' });
  }
});

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/read:
 *   put:
 *     summary: Mark conversation as read
 *     description: Mark all messages in a conversation as read
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
 *     responses:
 *       200:
 *         description: Conversation marked as read
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/conversations/:conversationId/read',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      await chatService.markConversationAsRead(conversationId, userId);

      res.status(200).json({ message: 'Conversation marquée comme lue' });
    } catch (error: any) {
      console.error('Erreur /chat/conversations/:id/read:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erreur lors du marquage de la conversation' });
    }
  }
);

/**
 * @swagger
 * /api/chat/unread-count:
 *   get:
 *     summary: Get unread messages count
 *     description: Get total count of unread messages for user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const count = await chatService.getUnreadMessagesCount(userId);

    res.status(200).json({ count });
  } catch (error: any) {
    console.error('Erreur /chat/unread-count:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du comptage des messages' });
  }
});

/**
 * @swagger
 * /api/chat/messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     description: Delete a specific message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/messages/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await chatService.deleteMessage(messageId, userId);

    res.status(200).json({ message: 'Message supprimé' });
  } catch (error: any) {
    console.error('Erreur /chat/messages/:id DELETE:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la suppression du message' });
  }
});

/**
 * @swagger
 * /api/chat/search:
 *   get:
 *     summary: Search messages
 *     description: Search through user's messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing search query
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { q } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Paramètre de recherche requis' });
    }

    const messages = await chatService.searchMessages(userId, q);

    res.status(200).json({ messages });
  } catch (error: any) {
    console.error('Erreur /chat/search:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la recherche' });
  }
});

/**
 * @swagger
 * /api/chat/upload:
 *   post:
 *     summary: Upload file for chat
 *     description: Upload a file to be shared in chat conversation
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
 *               - conversationId
 *               - file
 *               - fileName
 *             properties:
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *               file:
 *                 type: string
 *                 description: Base64 encoded file
 *               fileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/upload', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { conversationId, file, fileName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!conversationId || !file || !fileName) {
      return res.status(400).json({ error: 'conversationId, file et fileName requis' });
    }

    // Convertir le fichier base64 en Buffer
    const fileBuffer = Buffer.from(file, 'base64');

    const fileUrl = await chatService.uploadChatFile(fileBuffer, fileName, conversationId);

    res.status(200).json({ fileUrl });
  } catch (error: any) {
    console.error('Erreur /chat/upload:', error);
    res.status(500).json({ error: error.message || "Erreur lors de l'upload du fichier" });
  }
});

export default router;
