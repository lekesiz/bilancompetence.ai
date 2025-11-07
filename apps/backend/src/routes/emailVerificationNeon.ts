import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getUserById } from '../services/userServiceNeon.js';
import {
  verifyUserEmail,
  createEmailVerificationToken,
  getEmailVerificationToken,
  useEmailVerificationToken,
  createAuditLog,
} from '../services/authFlowServiceNeon.js';
import {
  generateToken,
  sendEmailVerificationEmail,
  sendAccountConfirmationEmail,
} from '../services/emailService.js';
import { emailVerificationLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/email-verification/send:
 *   post:
 *     summary: Send a verification email
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully.
 *       400:
 *         description: Email already verified.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to send verification email.
 */
router.post(
  '/send',
  authMiddleware,
  emailVerificationLimiter,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Get user
      const user = await getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Check if already verified
      if (user.email_verified_at) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already verified',
        });
      }

      // Generate verification token
      const verificationToken = generateToken(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours expiry

      // Save token
      await createEmailVerificationToken(user.id, verificationToken, expiresAt);

      // Send email (optional - log to console if not configured)
      let emailSent = false;
      if (process.env.SENDGRID_API_KEY) {
        try {
          await sendEmailVerificationEmail(user.email, verificationToken, user.full_name);
          emailSent = true;
        } catch (emailError) {
          console.warn('Failed to send verification email:', emailError);
        }
      }

      // 🔒 SECURITY: Only log tokens in development
      if (!emailSent && process.env.NODE_ENV !== 'production') {
        logger.warn('⚠️  DEV MODE: Email service unavailable. Verification token:', {
          token: verificationToken,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
        });
      }

      // Log action
      await createAuditLog(user.id, 'EMAIL_VERIFICATION_SENT', 'user', user.id, null, req.ip);

      return res.status(200).json({
        status: 'success',
        message: 'Verification email sent',
        data: {
          emailSent,
          // Include token in development for testing
          token: !emailSent ? verificationToken : undefined,
        },
      });
    } catch (error) {
      console.error('Send verification email error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email',
        debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      });
    }
  }
);

/**
 * @swagger
 * /api/email-verification/verify:
 *   post:
 *     summary: Verify an email
 *     tags: [Email Verification]
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
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid or expired token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to verify email.
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.length < 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token',
      });
    }

    // Get valid verification token
    const verificationTokenRecord = await getEmailVerificationToken(token);
    if (!verificationTokenRecord) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token',
      });
    }

    // Get user
    const user = await getUserById(verificationTokenRecord.user_id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.email_verified_at) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already verified',
      });
    }

    // Verify email
    await verifyUserEmail(user.id);

    // Mark token as used
    await useEmailVerificationToken(verificationTokenRecord.id);

    // Send confirmation email
    await sendAccountConfirmationEmail(user.email, user.full_name);

    // Log action
    await createAuditLog(user.id, 'EMAIL_VERIFIED', 'user', user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        email: user.email,
        verified: true,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify email',
    });
  }
});

/**
 * @swagger
 * /api/email-verification/status:
 *   get:
 *     summary: Check email verification status
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verification status retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to check verification status.
 */
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        email: user.email,
        verified: !!user.email_verified_at,
        verified_at: user.email_verified_at,
      },
    });
  } catch (error) {
    console.error('Email status check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check verification status',
    });
  }
});

export default router;
