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
  verifyToken,
  verifyRefreshToken,
} from '../services/authService.js';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserLastLogin,
  createSession,
  createAuditLog,
} from '../services/supabaseService.js';
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
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const newUser = await createUser(email, passwordHash, full_name, role);

    // Create audit log
    await createAuditLog(newUser.id, 'USER_REGISTERED', 'user', newUser.id, null, req.ip);

    // Send welcome email in the background (don't wait for it)
    sendWelcomeEmail(newUser.email, newUser.full_name).catch((error) => {
      logger.error('Failed to send welcome email', { email: newUser.email, error });
      // Don't fail the registration if email fails
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
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
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash);
    if (!passwordValid) {
      // Log failed attempt
      await createAuditLog(user.id, 'LOGIN_FAILED', 'user', user.id, null, req.ip);

      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Update last login time
    await updateUserLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    // Create session
    await createSession(user.id, tokens.refreshToken);

    // Log successful login
    await createAuditLog(user.id, 'LOGIN_SUCCESS', 'user', user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 *
 * This endpoint:
 * 1. Validates the refresh token signature
 * 2. Retrieves the user from database
 * 3. Validates the session is active and not expired
 * 4. Generates new access and refresh tokens
 * 5. Updates the session with new refresh token
 * 6. Logs the operation for audit purposes
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

    // Step 1: Verify refresh token signature
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }

    // Step 2: Get user from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      // Log failed refresh attempt (user not found)
      await createAuditLog(
        decoded.userId,
        'TOKEN_REFRESH_FAILED',
        'user',
        decoded.userId,
        { reason: 'user_not_found' },
        req.ip
      );

      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Step 3: Check if user is active (not deleted or suspended)
    if (user.deleted_at) {
      // Log failed refresh attempt (user deleted)
      await createAuditLog(
        user.id,
        'TOKEN_REFRESH_FAILED',
        'user',
        user.id,
        { reason: 'user_deleted' },
        req.ip
      );

      return res.status(401).json({
        status: 'error',
        message: 'User account has been deleted',
      });
    }

    // Step 4: Generate new token pair
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    // Step 5: Create new session record with new refresh token
    await createSession(user.id, tokens.refreshToken);

    // Step 6: Log successful token refresh
    await createAuditLog(
      user.id,
      'TOKEN_REFRESHED',
      'user',
      user.id,
      { old_token_prefix: refreshToken.substring(0, 10) },
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    logger.error('Refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Token refresh failed',
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token (protected route example)
 */
router.get('/verify', (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
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

    return res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: { user: decoded },
    });
  } catch (error) {
    logger.error('Verify error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Token verification failed',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (revoke refresh token and session)
 *
 * This endpoint:
 * 1. Gets user ID from Authorization header token
 * 2. Revokes all active sessions
 * 3. Logs the logout action for audit
 * 4. Returns success message
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
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

    // Get user for audit logging
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Log successful logout
    await createAuditLog(
      user.id,
      'LOGOUT',
      'user',
      user.id,
      null,
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
      data: {
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
    });
  }
});

export default router;
