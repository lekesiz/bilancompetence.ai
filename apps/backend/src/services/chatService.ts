import { createClient } from '@supabase/supabase-js';

// Make Supabase optional - only initialize if credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Service de gestion du chat et de la messagerie
 * Stocke les messages dans Supabase pour persistance
 */

interface Message {
  id?: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  file_url?: string;
  is_read: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Conversation {
  id?: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message?: string;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crée ou récupère une conversation entre deux utilisateurs
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<Conversation> {
  try {
    // Vérifier si une conversation existe déjà
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1_id.eq.${userId1},participant_2_id.eq.${userId2}),and(participant_1_id.eq.${userId2},participant_2_id.eq.${userId1})`
      )
      .single();

    if (existingConversation) {
      return existingConversation;
    }

    // Créer une nouvelle conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: userId1,
        participant_2_id: userId2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Erreur lors de la création de la conversation: ${createError.message}`);
    }

    return newConversation;
  } catch (error: any) {
    console.error('Erreur getOrCreateConversation:', error);
    throw error;
  }
}

/**
 * Envoie un message dans une conversation
 */
export async function sendMessage(messageData: Message): Promise<Message> {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversation_id,
        sender_id: messageData.sender_id,
        recipient_id: messageData.recipient_id,
        message: messageData.message,
        message_type: messageData.message_type || 'text',
        file_url: messageData.file_url,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'envoi du message: ${error.message}`);
    }

    // Mettre à jour la conversation avec le dernier message
    await supabase
      .from('conversations')
      .update({
        last_message: messageData.message,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageData.conversation_id);

    return message;
  } catch (error: any) {
    console.error('Erreur sendMessage:', error);
    throw error;
  }
}

/**
 * Récupère l'historique des messages d'une conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
    }

    return messages || [];
  } catch (error: any) {
    console.error('Erreur getConversationMessages:', error);
    throw error;
  }
}

/**
 * Marque un message comme lu
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) {
      throw new Error(`Erreur lors du marquage du message: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erreur markMessageAsRead:', error);
    throw error;
  }
}

/**
 * Marque tous les messages d'une conversation comme lus
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Erreur lors du marquage de la conversation: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erreur markConversationAsRead:', error);
    throw error;
  }
}

/**
 * Récupère toutes les conversations d'un utilisateur
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des conversations: ${error.message}`);
    }

    return conversations || [];
  } catch (error: any) {
    console.error('Erreur getUserConversations:', error);
    throw error;
  }
}

/**
 * Compte les messages non lus pour un utilisateur
 */
export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Erreur lors du comptage des messages non lus: ${error.message}`);
    }

    return count || 0;
  } catch (error: any) {
    console.error('Erreur getUnreadMessagesCount:', error);
    return 0;
  }
}

/**
 * Supprime un message
 */
export async function deleteMessage(messageId: string, userId: string): Promise<void> {
  try {
    // Vérifier que l'utilisateur est l'expéditeur
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      throw new Error('Message non trouvé');
    }

    if (message.sender_id !== userId) {
      throw new Error('Non autorisé à supprimer ce message');
    }

    const { error: deleteError } = await supabase.from('messages').delete().eq('id', messageId);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression du message: ${deleteError.message}`);
    }
  } catch (error: any) {
    console.error('Erreur deleteMessage:', error);
    throw error;
  }
}

/**
 * Recherche dans les messages
 */
export async function searchMessages(
  userId: string,
  query: string,
  limit: number = 20
): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .ilike('message', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }

    return messages || [];
  } catch (error: any) {
    console.error('Erreur searchMessages:', error);
    throw error;
  }
}

/**
 * Upload un fichier pour le chat
 */
export async function uploadChatFile(
  file: Buffer,
  fileName: string,
  conversationId: string
): Promise<string> {
  try {
    const filePath = `chat/${conversationId}/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage.from('chat-files').upload(filePath, file, {
      contentType: 'application/octet-stream',
      upsert: false,
    });

    if (error) {
      throw new Error(`Erreur lors de l'upload du fichier: ${error.message}`);
    }

    // Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage.from('chat-files').getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Erreur uploadChatFile:', error);
    throw error;
  }
}

/**
 * Envoie un message système (notification automatique)
 */
export async function sendSystemMessage(
  conversationId: string,
  recipientId: string,
  message: string
): Promise<Message> {
  try {
    const systemMessage: Message = {
      conversation_id: conversationId,
      sender_id: 'system',
      recipient_id: recipientId,
      message,
      message_type: 'system',
      is_read: false,
    };

    return await sendMessage(systemMessage);
  } catch (error: any) {
    console.error('Erreur sendSystemMessage:', error);
    throw error;
  }
}
