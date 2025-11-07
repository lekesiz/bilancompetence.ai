import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as sessionManagement from '../middleware/sessionManagement.js';
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';

const router = Router();

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get user active sessions
 *     description: Retrieve all active sessions for the authenticated user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       device_info:
 *                         type: string
 *                       ip_address:
 *                         type: string
 *                       last_activity:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       is_current:
 *                         type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
  } catch (error: unknown) {
    console.error('Erreur /sessions:', error);
    
          const statusCode = getErrorStatusCode(error);
          const message = getErrorMessage(error);
          res.status(statusCode).json({ error: message });
        
  }
});

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     description: Revoke a specific session by ID (logout from specific device)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID to revoke
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Session not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
  } catch (error: unknown) {
    console.error('Erreur /sessions/:id DELETE:', error);
    
          const statusCode = getErrorStatusCode(error);
          const message = getErrorMessage(error);
          res.status(statusCode).json({ error: message });
        
  }
});

/**
 * @swagger
 * /api/sessions/all/except-current:
 *   delete:
 *     summary: Revoke all sessions except current
 *     description: Logout from all devices except the current one
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All other sessions revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
  } catch (error: unknown) {
    console.error('Erreur /sessions/all DELETE:', error);
    
          const statusCode = getErrorStatusCode(error);
          const message = getErrorMessage(error);
          res.status(statusCode).json({ error: message });
        
  }
});

export default router;
