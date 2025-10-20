import { Router, Request, Response } from 'express';
import {
  validateRegisterRequest,
  validateLoginRequest,
  validateRefreshRequest,
} from '../validators/authValidator';
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
  createUserRecord,
} from '../services/authService';

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

    // Check if user exists (TODO: query database)
    // For now, just create user record
    const passwordHash = await hashPassword(password);
    const newUser = createUserRecord(email, passwordHash, full_name, role);

    // TODO: Save to database
    // await db.users.insert(newUser);

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
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

    // TODO: Query database for user
    // const user = await db.users.findOne({ email });

    // For now, return mock data
    const mockUser = {
      id: 'mock-user-id',
      email,
      full_name: 'Test User',
      role: 'BENEFICIARY' as const,
    };

    // TODO: Verify password
    // const passwordValid = await comparePassword(password, user.password_hash);

    // Generate tokens
    const tokens = generateTokenPair(mockUser);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: mockUser,
        tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
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
        message: 'Invalid refresh token',
      });
    }

    // TODO: Query database for user
    // const user = await db.users.findOne({ id: decoded.userId });

    // Mock user
    const mockUser = {
      id: decoded.userId,
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'BENEFICIARY' as const,
    };

    // Generate new token pair
    const tokens = generateTokenPair(mockUser);

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
      data: { tokens },
    });
  } catch (error) {
    console.error('Refresh error:', error);
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
    console.error('Verify error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Token verification failed',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (clear token on client)
 */
router.post('/logout', (req: Request, res: Response) => {
  // Since we're using JWT (stateless), logout is client-side
  // Just return success
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export default router;
