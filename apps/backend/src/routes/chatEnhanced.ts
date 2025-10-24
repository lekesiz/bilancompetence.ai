import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as chatService from '../services/chatService.js';

const router = Router();

/**
 * GET /api/chat/conversations
 * Récupère toutes les conversations de l'utilisateur
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
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération des conversations' });
  }
});

/**
 * POST /api/chat/conversations
 * Crée ou récupère une conversation avec un autre utilisateur
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
    res.status(500).json({ error: error.message || 'Erreur lors de la création de la conversation' });
  }
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Récupère les messages d'une conversation
 */
router.get('/conversations/:conversationId/messages', authenticateToken, async (req: Request, res: Response) => {
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
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération des messages' });
  }
});

/**
 * POST /api/chat/messages
 * Envoie un message
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
    res.status(500).json({ error: error.message || 'Erreur lors de l\'envoi du message' });
  }
});

/**
 * PUT /api/chat/messages/:messageId/read
 * Marque un message comme lu
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
 * PUT /api/chat/conversations/:conversationId/read
 * Marque tous les messages d'une conversation comme lus
 */
router.put('/conversations/:conversationId/read', authenticateToken, async (req: Request, res: Response) => {
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
    res.status(500).json({ error: error.message || 'Erreur lors du marquage de la conversation' });
  }
});

/**
 * GET /api/chat/unread-count
 * Récupère le nombre de messages non lus
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
 * DELETE /api/chat/messages/:messageId
 * Supprime un message
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
 * GET /api/chat/search
 * Recherche dans les messages
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
 * POST /api/chat/upload
 * Upload un fichier pour le chat
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
    res.status(500).json({ error: error.message || 'Erreur lors de l\'upload du fichier' });
  }
});

export default router;

