import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as twoFactorService from '../services/twoFactorService.js';

const router = Router();

/**
 * POST /api/2fa/setup
 * Génère un secret 2FA et un QR code pour l'utilisateur
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
      backupCodes: twoFactorData.backupCodes
    });
  } catch (error: any) {
    console.error('Erreur /2fa/setup:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération du secret 2FA' });
  }
});

/**
 * POST /api/2fa/enable
 * Active le 2FA après vérification du premier code
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
    res.status(500).json({ error: error.message || 'Erreur lors de l\'activation du 2FA' });
  }
});

/**
 * POST /api/2fa/verify
 * Vérifie un code 2FA lors de la connexion
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
 * POST /api/2fa/disable
 * Désactive le 2FA pour l'utilisateur
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
  } catch (error: any) {
    console.error('Erreur /2fa/status:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la vérification du statut 2FA' });
  }
});

export default router;

