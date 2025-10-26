import { Router, Request, Response } from 'express';
import {
  validateRegisterRequest,
  validateLoginRequest,
  validateRefreshRequest,
} from '../validators/authValidator.js';
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  generateUserId,
  verifyToken,
  verifyRefreshToken,
} from '../services/authService.js';
import {
  getUserByEmail,
  getUserById,
  createUser,
  emailExists,
} from '../services/userServiceNeon.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validation = validateRegisterRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const { email, password, full_name, role } = validation.data!;

    // Check if user already exists
    const userExists = await emailExists(email);
    if (userExists) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID
    const userId = generateUserId();

    // Create user in database
    const newUser = await createUser({
      id: userId,
      email,
      password_hash: passwordHash,
      full_name,
      role: role || 'BENEFICIARY',
    });

    // Send welcome email in the background (don't wait for it)
    sendWelcomeEmail(newUser.email, newUser.full_name).catch((error) => {
      logger.error('Failed to send welcome email', { email: newUser.email, error });
      // Don't fail the registration if email fails
    });

    // Generate tokens
    const tokens = generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    });

    logger.info('User registered successfully', { userId: newUser.id, email: newUser.email });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    logger.error('Register error:', error);

    // Handle duplicate email constraint
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and return tokens
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validation = validateLoginRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const { email, password } = validation.data!;

    // Query database for user
    const user = await getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash);
    if (!passwordValid) {
      logger.warn('Login failed - invalid password', { email, ip: req.ip });

      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          cv_url: user.cv_url,
          cv_uploaded_at: user.cv_uploaded_at,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validation = validateRefreshRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const { refreshToken } = validation.data!;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }

    // Get user from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    logger.info('Token refreshed successfully', { userId: user.id });

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error: any) {
    logger.error('Refresh token error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Token refresh failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client should delete tokens)
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // The client should delete the tokens from storage
    
    // If you want to implement token blacklisting, you can add it here
    // For now, we just return success

    logger.info('User logged out');

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify if the current token is valid
 */
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Get user from database to ensure they still exist
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    logger.error('Token verification error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Token verification failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.status(200).json({
        status: 'success',
        message: 'If the email exists, a verification link has been sent',
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified',
      });
    }

    // Generate verification token
    const { generateToken } = await import('../services/emailService.js');
    const verificationToken = generateToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with verification token
    const { query } = await import('../config/neon.js');
    await query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, expiresAt, user.id]
    );

    // Send verification email
    const { sendEmailVerificationEmail } = await import('../services/emailService.js');
    await sendEmailVerificationEmail(user.email, verificationToken, user.full_name);

    logger.info('Verification email resent', { email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully',
    });
  } catch (error: any) {
    logger.error('Resend verification error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/auth/verify-email/:token
 * Verify email address with token
 */
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required',
      });
    }

    // Find user by verification token
    const { query } = await import('../config/neon.js');
    const result = await query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token',
      });
    }

    const user = result.rows[0];

    // Update user as verified
    await query(
      'UPDATE users SET email_verified = true, email_verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    );

    logger.info('Email verified successfully', { email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        email: user.email,
        verified: true,
      },
    });
  } catch (error: any) {
    logger.error('Email verification error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Email verification failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const { generateToken } = await import('../services/emailService.js');
    const resetToken = generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    const { query } = await import('../config/neon.js');
    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, expiresAt, user.id]
    );

    // Send password reset email
    const { sendPasswordResetEmail } = await import('../services/emailService.js');
    await sendPasswordResetEmail(user.email, resetToken, user.full_name);

    logger.info('Password reset email sent', { email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent successfully',
    });
  } catch (error: any) {
    logger.error('Forgot password error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to send password reset email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Token and new password are required',
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long',
      });
    }

    // Find user by reset token
    const { query } = await import('../config/neon.js');
    const result = await query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token',
      });
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    logger.info('Password reset successfully', { email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    logger.error('Reset password error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Password reset failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

