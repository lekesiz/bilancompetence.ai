import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as twoFactorService from '../services/twoFactorService.js';
import { comparePassword } from '../services/authService.js';
import { pool } from '../config/neon.js';
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     summary: Generate 2FA secret and QR code
 *     description: Generate 2FA secret, QR code, and backup codes for user authentication
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA secret generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 secret:
 *                   type: string
 *                 qrCode:
 *                   type: string
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to generate 2FA secret
 */
router.post('/setup', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const twoFactorData = await twoFactorService.generateTwoFactorSecret(userId);

    res.status(200).json({
      message: 'Secret 2FA généré avec succès',
      secret: twoFactorData.secret,
      qrCode: twoFactorData.qrCode,
      backupCodes: twoFactorData.backupCodes,
    });
  } catch (error: unknown) {
    logger.error('Erreur /2fa/setup:', error);
    
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);
    res.status(statusCode).json({ error: message || 'Erreur lors de la génération du secret 2FA' });
  
  }
});

/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Enable 2FA
 *     description: Enable two-factor authentication after verifying first token
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit 2FA token
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid token
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/enable', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token requis' });
    }

    const result = await twoFactorService.enableTwoFactor(userId, token);

    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }

    res.status(200).json({ message: result.message });
  } catch (error: unknown) {
    logger.error('Erreur /2fa/enable:', error);
    
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);
    res.status(statusCode).json({ error: message || "Erreur lors de l'activation du 2FA" });
  
  }
});

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     description: Verify 2FA token during login process
 *     tags: [Two-Factor Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               token:
 *                 type: string
 *                 description: 6-digit 2FA token
 *     responses:
 *       200:
 *         description: Token verified successfully
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Verification failed
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'userId et token requis' });
    }

    const result = await twoFactorService.verifyTwoFactorToken(userId, token);

    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }

    res.status(200).json({ message: result.message, isValid: true });
  } catch (error: unknown) {
    logger.error('Erreur /2fa/verify:', error);
    
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);
    res.status(statusCode).json({ error: message || 'Erreur lors de la vérification du code 2FA' });
  
  }
});

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     description: Disable two-factor authentication (requires password confirmation)
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid password
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/disable', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Vérifier le mot de passe avant de désactiver (sécurité)
    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis pour désactiver le 2FA' });
    }

    // ✅ SECURITY FIX: Verify password before disabling 2FA
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await comparePassword(password, userResult.rows[0].password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }


    await twoFactorService.disableTwoFactor(userId);

    res.status(200).json({ message: '2FA désactivé avec succès' });
  } catch (error: unknown) {
    logger.error('Erreur /2fa/disable:', error);
    
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);
    res.status(statusCode).json({ error: message || 'Erreur lors de la désactivation du 2FA' });
  
  }
});

/**
 * GET /api/2fa/status
 * Vérifie si le 2FA est activé pour l'utilisateur
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const isEnabled = await twoFactorService.isTwoFactorEnabled(userId);

    res.status(200).json({ isEnabled });
  } catch (error: unknown) {
    logger.error('Erreur /2fa/status:', error);
    res
      .status(500)
      .json({ error: error.message || 'Erreur lors de la vérification du statut 2FA' });
  }
});

export default router;
