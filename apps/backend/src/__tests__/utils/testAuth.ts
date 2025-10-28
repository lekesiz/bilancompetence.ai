/**
 * Test Authentication Utilities
 *
 * Provides mock authentication middleware and utilities for integration tests
 */

import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../../middleware/jwtValidation.js';

/**
 * Test user templates
 */
export const testUsers = {
  beneficiary: {
    userId: 'test-beneficiary-1',
    email: 'beneficiary@test.com',
    role: 'BENEFICIARY' as const,
    fullName: 'Test Beneficiary',
  },
  consultant: {
    userId: 'test-consultant-1',
    email: 'consultant@test.com',
    role: 'CONSULTANT' as const,
    fullName: 'Test Consultant',
  },
  admin: {
    userId: 'test-admin-1',
    email: 'admin@test.com',
    role: 'ADMIN' as const,
    fullName: 'Test Admin',
  },
};

/**
 * Test tokens for different users
 */
export const testTokens = {
  beneficiary: 'test-jwt-token-beneficiary',
  consultant: 'test-jwt-token-consultant',
  admin: 'test-jwt-token-admin',
  invalid: 'invalid-token',
};

/**
 * Mock authentication middleware for tests
 *
 * Accepts predefined test tokens and sets req.user accordingly
 */
export function mockAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.slice(7);

    // Map test tokens to user data
    let user: JWTPayload | null = null;

    switch (token) {
      case testTokens.beneficiary:
      case 'test-jwt-token': // Legacy support
        user = testUsers.beneficiary as JWTPayload;
        break;
      case testTokens.consultant:
        user = testUsers.consultant as JWTPayload;
        break;
      case testTokens.admin:
        user = testUsers.admin as JWTPayload;
        break;
      default:
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token',
        });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Create authorization header for test requests
 */
export function createAuthHeader(userType: keyof typeof testUsers = 'beneficiary'): string {
  const token = testTokens[userType];
  return `Bearer ${token}`;
}

/**
 * Create axios config with auth header
 */
export function createAuthConfig(userType: keyof typeof testUsers = 'beneficiary') {
  return {
    headers: {
      Authorization: createAuthHeader(userType),
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Mock JWT verification for tests
 */
export function mockVerifyToken(token: string): JWTPayload | null {
  switch (token) {
    case testTokens.beneficiary:
    case 'test-jwt-token':
      return testUsers.beneficiary as JWTPayload;
    case testTokens.consultant:
      return testUsers.consultant as JWTPayload;
    case testTokens.admin:
      return testUsers.admin as JWTPayload;
    default:
      return null;
  }
}

/**
 * Setup mock authentication for tests
 *
 * Call this in beforeAll to mock the auth service
 */
export function setupMockAuth() {
  // Mock authService.verifyToken
  jest.mock('../../services/authService.js', () => ({
    verifyToken: jest.fn((token: string) => mockVerifyToken(token)),
    generateToken: jest.fn((payload: any) => 'mock-generated-token'),
  }));
}

/**
 * Create a test request with authenticated user
 */
export function createAuthenticatedRequest(
  userType: keyof typeof testUsers = 'beneficiary',
  overrides: Partial<Request> = {}
): Partial<Request> {
  return {
    user: testUsers[userType] as JWTPayload,
    headers: {
      authorization: createAuthHeader(userType),
      'content-type': 'application/json',
    },
    ...overrides,
  };
}

/**
 * Test auth helpers
 */
export const testAuth = {
  users: testUsers,
  tokens: testTokens,
  middleware: mockAuthMiddleware,
  createHeader: createAuthHeader,
  createConfig: createAuthConfig,
  verifyToken: mockVerifyToken,
  setup: setupMockAuth,
  createRequest: createAuthenticatedRequest,
};

export default testAuth;
