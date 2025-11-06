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
import { setAuthCookies, clearAuthCookies } from '../utils/cookieHelper.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min. 8 characters).
 *               full_name:
 *                 type: string
 *                 description: User's full name.
 *               role:
 *                 type: string
 *                 enum: [BENEFICIARY, CONSULTANT, ADMIN]
 *                 description: User's role (defaults to BENEFICIARY).
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Validation failed.
 *       409:
 *         description: User with this email already exists.
 *       500:
 *         description: Registration failed.
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
      organization_id: newUser.organization_id,
    });

    // 🔒 SECURITY: Set HttpOnly cookies for secure token storage
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

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
        ...tokens, // Also return in body for backward compatibility
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
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         cv_url:
 *                           type: string
 *                           nullable: true
 *                         cv_uploaded_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Login failed.
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
      organization_id: user.organization_id,
    });

    // 🔒 SECURITY: Set HttpOnly cookies for secure token storage
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

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
        ...tokens, // Also return in body for backward compatibility
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
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Invalid or expired refresh token.
 *       500:
 *         description: Token refresh failed.
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // 🔒 SECURITY: Get refresh token from cookie (priority) or body (backward compatibility)
    let refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      // Fallback to body for backward compatibility
      const validation = validateRefreshRequest(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validation.errors,
        });
      }
      refreshToken = validation.data!.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

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
      organization_id: user.organization_id,
    });

    // 🔒 SECURITY: Set new HttpOnly cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    logger.info('Token refreshed successfully', { userId: user.id });

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: tokens, // Also return in body for backward compatibility
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
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful.
 *       500:
 *         description: Logout failed.
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // 🔒 SECURITY: Clear HttpOnly cookies
    clearAuthCookies(res);

    // In a stateless JWT system, logout is handled by clearing cookies
    // If you want to implement token blacklisting, you can add it here

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
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Missing, invalid or expired token.
 *       500:
 *         description: Token verification failed.
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

export default router;
