import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateToken, verifyToken, hashPassword, comparePassword } from '../authService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BENEFICIAIRE',
      };

      const mockToken = 'mock.jwt.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining(payload),
        'test-secret-key',
        expect.objectContaining({
          expiresIn: expect.any(String),
        })
      );
      expect(token).toBe(mockToken);
    });

    it('should use default expiry if not provided', () => {
      const payload = { userId: 'user123' };
      (jwt.sign as jest.Mock).mockReturnValue('token');

      generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ expiresIn: '7d' })
      );
    });

    it('should use custom expiry if provided', () => {
      const payload = { userId: 'user123' };
      (jwt.sign as jest.Mock).mockReturnValue('token');

      generateToken(payload, '1h');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ expiresIn: '1h' })
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return decoded token', () => {
      const mockDecoded = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BENEFICIAIRE',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = verifyToken('valid.jwt.token');

      expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', 'test-secret-key');
      expect(result).toEqual(mockDecoded);
    });

    it('should return null for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid.token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = verifyToken('expired.token');

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'MySecurePassword123!';
      const mockHash = '$2a$10$mockedhash';

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const hash = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(hash).toBe(mockHash);
    });

    it('should use configured bcrypt rounds', async () => {
      process.env.BCRYPT_ROUNDS = '12';
      const password = 'password';
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'MyPassword123';
      const hash = '$2a$10$hashedpassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'WrongPassword';
      const hash = '$2a$10$hashedpassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword(password, hash);

      expect(result).toBe(false);
    });

    it('should handle comparison errors', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Comparison failed'));

      await expect(comparePassword('pass', 'hash')).rejects.toThrow('Comparison failed');
    });
  });
});
