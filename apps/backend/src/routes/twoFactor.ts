import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as twoFactorService from '../services/twoFactorService.js';

/**
 * @swagger
 * tags:
 *   name: 2FA
 *   description: Two-Factor Authentication management
 */

const router = Router();

/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user
 *     description: Generate 2FA secret, QR code, and backup codes for the authenticated user
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Secret 2FA généré avec succès"
 *                 secret:
 *                   type: string
 *                   description: TOTP secret key
 *                 qrCode:
 *                   type: string
 *                   description: Base64 encoded QR code image
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of backup codes for account recovery
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
  } catch (error: any) {
    console.error('Erreur /2fa/setup:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération du secret 2FA' });
  }
});

/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Enable 2FA
 *     description: Enable 2FA after verifying the first TOTP token
 *     tags: [2FA]
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
 *                 description: 6-digit TOTP token from authenticator app
 *                 example: "123456"
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
  } catch (error: any) {
    console.error('Erreur /2fa/enable:', error);
    res.status(500).json({ error: error.message || "Erreur lors de l'activation du 2FA" });
  }
});

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     description: Verify a 2FA token during login (public endpoint)
 *     tags: [2FA]
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
 *                 description: User ID
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP token
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid token
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
  } catch (error: any) {
    console.error('Erreur /2fa/verify:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la vérification du code 2FA' });
  }
});

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     description: Disable 2FA for the authenticated user (requires password confirmation)
 *     tags: [2FA]
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
 *                 description: User password for security verification
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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

    // TODO: Vérifier le mot de passe avec authService

    await twoFactorService.disableTwoFactor(userId);

    res.status(200).json({ message: '2FA désactivé avec succès' });
  } catch (error: any) {
    console.error('Erreur /2fa/disable:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la désactivation du 2FA' });
  }
});

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Check 2FA status
 *     description: Check if 2FA is enabled for the authenticated user
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isEnabled:
 *                   type: boolean
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const isEnabled = await twoFactorService.isTwoFactorEnabled(userId);

    res.status(200).json({ isEnabled });
  } catch (error: any) {
    console.error('Erreur /2fa/status:', error);
    res
      .status(500)
      .json({ error: error.message || 'Erreur lors de la vérification du statut 2FA' });
  }
});

export default router;
