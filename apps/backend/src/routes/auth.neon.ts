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

export default router;

