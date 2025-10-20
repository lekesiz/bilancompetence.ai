import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../services/supabaseService';

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
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert([
        {
          created_by: req.user.id,
          participant_id: participantId,
          title: title || `Chat with ${participantId}`,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

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

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`created_by.eq.${req.user.id},participant_id.eq.${req.user.id}`)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: conversations || [],
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
router.get('/conversations/:conversationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
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
});

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send message (stored in DB)
 */
router.post('/conversations/:conversationId/messages', authMiddleware, async (req: Request, res: Response) => {
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
    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: req.user.id,
          content,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update conversation last message timestamp
    await supabase
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

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
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get conversation messages
 */
router.get('/conversations/:conversationId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 'success',
      data: (messages || []).reverse(), // Reverse to get chronological order
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch messages',
    });
  }
});

/**
 * DELETE /api/chat/conversations/:conversationId
 * Delete conversation
 */
router.delete('/conversations/:conversationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { conversationId } = req.params;

    // Delete all messages in conversation first
    await supabase.from('messages').delete().eq('conversation_id', conversationId);

    // Delete conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('created_by', req.user.id); // Only creator can delete

    if (error) {
      throw error;
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
});

/**
 * POST /api/chat/conversations/:conversationId/mark-as-read
 * Mark messages as read
 */
router.post('/conversations/:conversationId/mark-as-read', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { conversationId } = req.params;

    // Mark all unread messages as read
    const { error } = await supabase
      .from('messages')
      .update({
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', req.user.id)
      .is('read_at', null);

    if (error) {
      throw error;
    }

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
});

export default router;
