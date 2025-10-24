import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Middleware de gestion de session avancée
 * 
 * Fonctionnalités:
 * - Gestion de sessions multiples (plusieurs appareils)
 * - Détection de sessions suspectes
 * - Révocation de sessions
 * - Tracking de l'activité utilisateur
 * - Session timeout automatique
 */

interface SessionData {
  id?: string;
  user_id: string;
  token: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  last_activity?: string;
  expires_at: string;
  is_active: boolean;
  created_at?: string;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes en millisecondes
const MAX_SESSIONS_PER_USER = 5; // Maximum 5 appareils simultanés

/**
 * Crée une nouvelle session
 */
export async function createSession(
  userId: string,
  token: string,
  req: Request
): Promise<SessionData> {
  try {
    const deviceInfo = extractDeviceInfo(req);
    const ipAddress = extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || '';
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    // Vérifier le nombre de sessions actives
    await cleanupOldSessions(userId);
    
    const sessionData: SessionData = {
      user_id: userId,
      token,
      device_info: deviceInfo,
      ip_address: ipAddress,
      user_agent: userAgent,
      last_activity: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    
    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erreur lors de la création de la session: ${error.message}`);
    }
    
    return session;
  } catch (error: any) {
    console.error('Erreur createSession:', error);
    throw error;
  }
}

/**
 * Valide et met à jour une session
 */
export async function validateSession(token: string, req: Request): Promise<SessionData | null> {
  try {
    // Décoder le token pour obtenir l'userId
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = decoded.userId;
    
    // Récupérer la session
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('token', token)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error || !session) {
      return null;
    }
    
    // Vérifier l'expiration
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      await revokeSession(session.id!);
      return null;
    }
    
    // Vérifier le timeout d'inactivité
    const lastActivity = new Date(session.last_activity || session.created_at);
    const timeSinceActivity = Date.now() - lastActivity.getTime();
    
    if (timeSinceActivity > SESSION_TIMEOUT) {
      await revokeSession(session.id!);
      return null;
    }
    
    // Mettre à jour l'activité
    await updateSessionActivity(session.id!);
    
    // Détecter les sessions suspectes (changement d'IP ou user-agent)
    const currentIp = extractIpAddress(req);
    const currentUserAgent = req.headers['user-agent'] || '';
    
    if (session.ip_address !== currentIp || session.user_agent !== currentUserAgent) {
      console.warn(`Session suspecte détectée pour l'utilisateur ${userId}`);
      // En production, envoyer une alerte email
    }
    
    return session;
  } catch (error: any) {
    console.error('Erreur validateSession:', error);
    return null;
  }
}

/**
 * Met à jour l'activité d'une session
 */
async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq('id', sessionId);
  } catch (error: any) {
    console.error('Erreur updateSessionActivity:', error);
  }
}

/**
 * Révoque une session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({
        is_active: false,
      })
      .eq('id', sessionId);
  } catch (error: any) {
    console.error('Erreur revokeSession:', error);
    throw error;
  }
}

/**
 * Révoque toutes les sessions d'un utilisateur (sauf la session actuelle)
 */
export async function revokeAllUserSessions(
  userId: string,
  exceptSessionId?: string
): Promise<void> {
  try {
    let query = supabase
      .from('user_sessions')
      .update({
        is_active: false,
      })
      .eq('user_id', userId);
    
    if (exceptSessionId) {
      query = query.neq('id', exceptSessionId);
    }
    
    await query;
  } catch (error: any) {
    console.error('Erreur revokeAllUserSessions:', error);
    throw error;
  }
}

/**
 * Nettoie les anciennes sessions
 */
async function cleanupOldSessions(userId: string): Promise<void> {
  try {
    // Compter les sessions actives
    const { count } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (count && count >= MAX_SESSIONS_PER_USER) {
      // Supprimer les sessions les plus anciennes
      const { data: oldSessions } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: true })
        .limit(count - MAX_SESSIONS_PER_USER + 1);
      
      if (oldSessions && oldSessions.length > 0) {
        const sessionIds = oldSessions.map(s => s.id);
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .in('id', sessionIds);
      }
    }
  } catch (error: any) {
    console.error('Erreur cleanupOldSessions:', error);
  }
}

/**
 * Récupère toutes les sessions actives d'un utilisateur
 */
export async function getUserActiveSessions(userId: string): Promise<SessionData[]> {
  try {
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des sessions: ${error.message}`);
    }
    
    return sessions || [];
  } catch (error: any) {
    console.error('Erreur getUserActiveSessions:', error);
    return [];
  }
}

/**
 * Middleware de validation de session
 */
export function sessionValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  validateSession(token, req)
    .then((session) => {
      if (!session) {
        return res.status(401).json({ 
          error: 'Session invalide ou expirée',
          code: 'SESSION_EXPIRED'
        });
      }
      
      // Attacher les données de session à la requête
      (req as any).session = session;
      next();
    })
    .catch((error) => {
      console.error('Erreur de validation de session:', error);
      res.status(500).json({ error: 'Erreur de validation de session' });
    });
}

/**
 * Extrait les informations de l'appareil
 */
function extractDeviceInfo(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  
  if (userAgent.includes('Mobile')) {
    return 'Mobile';
  } else if (userAgent.includes('Tablet')) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
}

/**
 * Extrait l'adresse IP
 */
function extractIpAddress(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Nettoie toutes les sessions expirées (tâche planifiée)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true);
    
    console.log('Sessions expirées nettoyées');
  } catch (error: any) {
    console.error('Erreur cleanupExpiredSessions:', error);
  }
}

// Planifier le nettoyage des sessions toutes les heures
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

