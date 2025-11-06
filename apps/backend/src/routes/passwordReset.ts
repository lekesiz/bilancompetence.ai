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
 *     summary: Request password reset
 *     description: Request password reset email (rate limited for security)
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
 *         description: Password reset email sent (if account exists)
 *       400:
 *         description: Invalid email format
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

    // Send email
    await sendPasswordResetEmail(email, resetToken, user.full_name);

    // Log action
    await createAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'user', user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'If an account with this email exists, a password reset link will be sent.',
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
 *     description: Reset password using token (min 12 chars, uppercase, lowercase, digit, special char)
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
 *                 minLength: 20
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 12
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password requirements not met
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
    const typedResetToken = resetTokenRecord as any;
    const user = await getUserById(typedResetToken.user_id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if new password is different from old
    const isSamePassword = await comparePassword(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be different from current password',
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password
    await updateUserPassword(user.id, newPasswordHash);

    // Mark token as used
    await usePasswordResetToken(typedResetToken.id);

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
 *     description: Check if password reset token is valid and not expired
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
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
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

    const typedToken = resetTokenRecord as any;
    return res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        email: (await getUserById(typedToken.user_id))?.email,
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
