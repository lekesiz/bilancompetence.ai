import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as sessionManagement from '../middleware/sessionManagement.js';

const router = Router();

/**
 * GET /api/sessions
 * Récupère toutes les sessions actives de l'utilisateur
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const sessions = await sessionManagement.getUserActiveSessions(userId);

    // Masquer les tokens pour la sécurité
    const sanitizedSessions = sessions.map((session) => ({
      id: session.id,
      device_info: session.device_info,
      ip_address: session.ip_address,
      last_activity: session.last_activity,
      created_at: session.created_at,
      is_current: session.token === req.headers.authorization?.replace('Bearer ', ''),
    }));

    res.status(200).json({ sessions: sanitizedSessions });
  } catch (error: any) {
    console.error('Erreur /sessions:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération des sessions' });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * Révoque une session spécifique
 */
router.delete('/:sessionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Vérifier que la session appartient à l'utilisateur
    const sessions = await sessionManagement.getUserActiveSessions(userId);
    const sessionToRevoke = sessions.find((s) => s.id === sessionId);

    if (!sessionToRevoke) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    await sessionManagement.revokeSession(sessionId);

    res.status(200).json({ message: 'Session révoquée avec succès' });
  } catch (error: any) {
    console.error('Erreur /sessions/:id DELETE:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la révocation de la session' });
  }
});

/**
 * DELETE /api/sessions/all
 * Révoque toutes les sessions sauf la session actuelle
 */
router.delete('/all/except-current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const currentSession = (req as any).session;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await sessionManagement.revokeAllUserSessions(userId, currentSession?.id);

    res.status(200).json({ message: 'Toutes les autres sessions ont été révoquées' });
  } catch (error: any) {
    console.error('Erreur /sessions/all DELETE:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la révocation des sessions' });
  }
});

export default router;
