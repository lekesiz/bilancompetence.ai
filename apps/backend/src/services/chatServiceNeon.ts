import { query, queryOne } from '../config/neon.js';
import { logger } from '../utils/logger.js';

export interface Conversation {
  id: string;
  created_by: string;
  participant_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: Date;
  read_at?: Date;
}

/**
 * Create a new conversation
 */
export async function createConversation(
  createdBy: string,
  participantId: string,
  title?: string
): Promise<Conversation> {
  const result = await query<Conversation>(
    createdBy,
    `INSERT INTO conversations (created_by, participant_id, title, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [createdBy, participantId, title || `Chat with ${participantId}`]
  );

  logger.info('Conversation created', { conversationId: result[0].id, createdBy, participantId });
  return result[0];
}

/**
 * Get user conversations
 */
export async function getUserConversations(
  userId: string,
  limit: number = 50
): Promise<Conversation[]> {
  return query<Conversation>(
    userId,
    `SELECT * FROM conversations 
     WHERE created_by = $1 OR participant_id = $1 
     ORDER BY updated_at DESC 
     LIMIT $2`,
    [userId, limit]
  );
}

/**
 * Get conversation by ID
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  return queryOne<Conversation>(
    userId,
    `SELECT * FROM conversations 
     WHERE id = $1 AND (created_by = $2 OR participant_id = $2)`,
    [conversationId, userId]
  );
}

/**
 * Create a new message
 */
export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  // Update conversation updated_at
  await query(senderId, `UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [
    conversationId,
  ]);

  const result = await query<Message>(
    senderId,
    `INSERT INTO messages (conversation_id, sender_id, content, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [conversationId, senderId, content]
  );

  logger.info('Message created', { messageId: result[0].id, conversationId, senderId });
  return result[0];
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  userId: string,
  limit: number = 100
): Promise<Message[]> {
  return query<Message>(
    userId,
    `SELECT m.* FROM messages m
     JOIN conversations c ON m.conversation_id = c.id
     WHERE m.conversation_id = $1 
       AND (c.created_by = $2 OR c.participant_id = $2)
     ORDER BY m.created_at DESC
     LIMIT $3`,
    [conversationId, userId, limit]
  );
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<Message | null> {
  return queryOne<Message>(
    userId,
    `UPDATE messages m
     SET read_at = NOW()
     FROM conversations c
     WHERE m.id = $1 
       AND m.conversation_id = c.id
       AND (c.created_by = $2 OR c.participant_id = $2)
       AND m.sender_id != $2
     RETURNING m.*`,
    [messageId, userId]
  );
}

/**
 * Mark all messages in conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<number> {
  const result = await query<{ count: string }>(
    userId,
    `UPDATE messages m
     SET read_at = NOW()
     FROM conversations c
     WHERE m.conversation_id = $1
       AND m.conversation_id = c.id
       AND (c.created_by = $2 OR c.participant_id = $2)
       AND m.sender_id != $2
       AND m.read_at IS NULL
     RETURNING m.id`,
    [conversationId, userId]
  );

  const count = result.length;
  logger.info('Messages marked as read', { conversationId, userId, count });
  return count;
}

/**
 * Delete conversation (soft delete)
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<boolean> {
  // First delete all messages
  await query(
    userId,
    `DELETE FROM messages 
     WHERE conversation_id = $1 
       AND conversation_id IN (
         SELECT id FROM conversations 
         WHERE id = $1 AND (created_by = $2 OR participant_id = $2)
       )`,
    [conversationId, userId]
  );

  // Then delete conversation
  const result = await query<{ id: string }>(
    userId,
    `DELETE FROM conversations 
     WHERE id = $1 AND (created_by = $2 OR participant_id = $2)
     RETURNING id`,
    [conversationId, userId]
  );

  const deleted = result.length > 0;
  if (deleted) {
    logger.info('Conversation deleted', { conversationId, userId });
  }
  return deleted;
}

/**
 * Delete message
 */
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    userId,
    `DELETE FROM messages m
     USING conversations c
     WHERE m.id = $1 
       AND m.conversation_id = c.id
       AND (c.created_by = $2 OR c.participant_id = $2)
       AND m.sender_id = $2
     RETURNING m.id`,
    [messageId, userId]
  );

  const deleted = result.length > 0;
  if (deleted) {
    logger.info('Message deleted', { messageId, userId });
  }
  return deleted;
}
