import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { hashPassword, comparePassword } from '../services/authService.js';
import { getUserByEmail, getUserById } from '../services/userServiceNeon.js';
import {
  updateUserPassword,
  createPasswordResetToken,
  getPasswordResetToken,
  usePasswordResetToken,
  createAuditLog,
} from '../services/authFlowServiceNeon.js';
import { generateToken, sendPasswordResetEmail } from '../services/emailService.js';
import { passwordResetLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Validation schemas
const requestResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Invalid token'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/\d/, 'Must contain digit')
    .regex(/[!@#$%^&*]/, 'Must contain special character'),
});

/**
 * @swagger
 * /api/password-reset/request:
 *   post:
 *     summary: Request a password reset
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent successfully.
 *       400:
 *         description: Invalid email format.
 *       500:
 *         description: Failed to process password reset request.
 */
router.post('/request', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const validation = requestResetSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(200).json({
        status: 'success',
        message: 'If an account with this email exists, a password reset link will be sent.',
      });
    }

    // Generate reset token
    const resetToken = generateToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Save token to database
    await createPasswordResetToken(user.id, resetToken, expiresAt);

    // Send email (optional - log to console if not configured)
    let emailSent = false;
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sendPasswordResetEmail(email, resetToken, user.full_name);
        emailSent = true;
      } catch (emailError) {
        console.warn('Failed to send password reset email:', emailError);
      }
    }

    // 🔒 SECURITY: Only log tokens in development
    if (!emailSent && process.env.NODE_ENV !== 'production') {
      logger.warn('⚠️  DEV MODE: Email service unavailable. Password reset token:',  {
        token: resetToken,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      });
    }

    // Log action
    await createAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'user', user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'If an account with this email exists, a password reset link will be sent.',
      data: {
        emailSent,
        // Include token in development for testing
        token: !emailSent ? resetToken : undefined,
      },
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process password reset request',
    });
  }
});

/**
 * @swagger
 * /api/password-reset/confirm:
 *   post:
 *     summary: Confirm password reset
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Invalid request, token, or password.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to reset password.
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request',
        errors: validation.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { token, newPassword } = validation.data;

    // Get valid reset token
    const resetTokenRecord = await getPasswordResetToken(token);
    if (!resetTokenRecord) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired password reset token',
      });
    }

    // Get user
    const user = await getUserById(resetTokenRecord.user_id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if new password is different from old
    if (user.password_hash) {
      const isSamePassword = await comparePassword(newPassword, user.password_hash);
      if (isSamePassword) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be different from current password',
        });
      }
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password
    await updateUserPassword(user.id, newPasswordHash);

    // Mark token as used
    await usePasswordResetToken(resetTokenRecord.id);

    // Log action
    await createAuditLog(user.id, 'PASSWORD_RESET_COMPLETED', 'user', user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password',
    });
  }
});

/**
 * @swagger
 * /api/password-reset/validate-token:
 *   post:
 *     summary: Validate password reset token
 *     tags: [Password Reset]
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
 *         description: Token is valid.
 *       400:
 *         description: Invalid or expired token.
 *       500:
 *         description: Failed to validate token.
 */
router.post('/validate-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.length < 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token',
      });
    }

    const resetTokenRecord = await getPasswordResetToken(token);
    if (!resetTokenRecord) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    const user = await getUserById(resetTokenRecord.user_id);
    return res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        email: user?.email,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate token',
    });
  }
});

export default router;
