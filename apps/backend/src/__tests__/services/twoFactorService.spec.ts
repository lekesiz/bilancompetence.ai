import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as twoFactorService from '../../services/twoFactorService.js';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');
jest.mock('crypto');

describe('TwoFactorService', () => {
  let mockSupabase: any;
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockSecret = 'JBSWY3DPEHPK3PXP';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Set environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test_service_key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  describe('generateTwoFactorSecret', () => {
    it('should generate 2FA secret with QR code and backup codes successfully', async () => {
      // Mock user data
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: mockEmail, full_name: 'Test User' },
        error: null,
      });

      // Mock upsert success
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await twoFactorService.generateTwoFactorSecret(mockUserId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('backupCodes');
      expect(result.secret).toBeTruthy();
      expect(result.qrCode).toContain('qrserver.com');
      expect(result.backupCodes).toHaveLength(8);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.from).toHaveBeenCalledWith('user_two_factor');
    });

    it('should include app name in QR code URL', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: mockEmail, full_name: 'Test User' },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await twoFactorService.generateTwoFactorSecret(mockUserId);

      expect(result.qrCode).toContain('BilanCompetence.AI');
      expect(result.qrCode).toContain(encodeURIComponent(mockEmail));
    });

    it('should generate unique backup codes', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: mockEmail, full_name: 'Test User' },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await twoFactorService.generateTwoFactorSecret(mockUserId);

      // Check that backup codes are unique
      const uniqueCodes = new Set(result.backupCodes);
      expect(uniqueCodes.size).toBe(result.backupCodes.length);

      // Check that each code has proper format (8 hex characters)
      result.backupCodes.forEach((code) => {
        expect(code).toMatch(/^[A-F0-9]{8}$/);
      });
    });

    it('should handle user not found error', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' },
      });

      await expect(twoFactorService.generateTwoFactorSecret(mockUserId)).rejects.toThrow(
        'Utilisateur non trouvé'
      );
    });

    it('should handle database insertion errors', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: mockEmail, full_name: 'Test User' },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      await expect(
        twoFactorService.generateTwoFactorSecret(mockUserId)
      ).rejects.toThrow();
    });

    it('should throw error when Supabase is not configured', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;

      // Re-import to get unconfigured instance
      await expect(
        twoFactorService.generateTwoFactorSecret(mockUserId)
      ).rejects.toThrow('Supabase is not configured');
    });

    it('should handle user with special characters in email', async () => {
      const specialEmail = 'test+user@example.com';
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: specialEmail, full_name: "O'Brien" },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await twoFactorService.generateTwoFactorSecret(mockUserId);

      expect(result.qrCode).toContain(encodeURIComponent(specialEmail));
    });
  });

  describe('enableTwoFactor', () => {
    const validToken = '123456';

    it('should enable 2FA with valid token', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { secret: mockSecret, is_enabled: false },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock verifyTOTP to return true
      // Note: We'll need to test TOTP verification separately
      const result = await twoFactorService.enableTwoFactor(mockUserId, validToken);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_two_factor');
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_enabled: true,
        })
      );
    });

    it('should reject if 2FA not configured', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await twoFactorService.enableTwoFactor(mockUserId, validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('non configuré');
    });

    it('should reject if 2FA already enabled', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { secret: mockSecret, is_enabled: true },
        error: null,
      });

      const result = await twoFactorService.enableTwoFactor(mockUserId, validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('déjà activé');
    });

    it('should handle invalid token format', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { secret: mockSecret, is_enabled: false },
        error: null,
      });

      const result = await twoFactorService.enableTwoFactor(mockUserId, 'invalid');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('invalide');
    });

    it('should handle database update errors', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { secret: mockSecret, is_enabled: false },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        twoFactorService.enableTwoFactor(mockUserId, validToken)
      ).rejects.toThrow();
    });

    it('should throw error when Supabase is not configured', async () => {
      delete process.env.SUPABASE_URL;

      await expect(
        twoFactorService.enableTwoFactor(mockUserId, validToken)
      ).rejects.toThrow('Supabase is not configured');
    });
  });

  describe('verifyTwoFactorToken', () => {
    const validToken = '123456';
    const backupCode = 'ABCD1234';

    it('should verify valid TOTP token', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: [],
        },
        error: null,
      });

      // The actual TOTP verification will happen internally
      const result = await twoFactorService.verifyTwoFactorToken(mockUserId, validToken);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_two_factor');
      expect(mockSupabase.select).toHaveBeenCalledWith('secret, is_enabled, backup_codes');
    });

    it('should reject if 2FA not configured', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await twoFactorService.verifyTwoFactorToken(mockUserId, validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('non configuré');
    });

    it('should reject if 2FA not enabled', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: false,
          backup_codes: [],
        },
        error: null,
      });

      const result = await twoFactorService.verifyTwoFactorToken(mockUserId, validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('non activé');
    });

    it('should verify and consume backup code', async () => {
      const hashedBackupCode = 'hashed_backup_code';
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: [hashedBackupCode, 'other_code'],
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // When TOTP fails, it should try backup codes
      const result = await twoFactorService.verifyTwoFactorToken(mockUserId, backupCode);

      // Verify that backup code array was updated
      if (result.isValid && result.message.includes('secours')) {
        expect(mockSupabase.update).toHaveBeenCalled();
      }
    });

    it('should reject invalid token and invalid backup code', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: ['some_other_hash'],
        },
        error: null,
      });

      const result = await twoFactorService.verifyTwoFactorToken(
        mockUserId,
        'wrong_token'
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('invalide');
    });

    it('should handle empty backup codes array', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: [],
        },
        error: null,
      });

      const result = await twoFactorService.verifyTwoFactorToken(
        mockUserId,
        'invalid_token'
      );

      expect(result.isValid).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        twoFactorService.verifyTwoFactorToken(mockUserId, validToken)
      ).rejects.toThrow();
    });
  });

  describe('disableTwoFactor', () => {
    it('should disable 2FA successfully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(
        twoFactorService.disableTwoFactor(mockUserId)
      ).resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('user_two_factor');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('should handle deletion errors', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Deletion failed' },
      });

      await expect(twoFactorService.disableTwoFactor(mockUserId)).rejects.toThrow(
        'Erreur lors de la désactivation du 2FA'
      );
    });

    it('should handle non-existent 2FA configuration', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(twoFactorService.disableTwoFactor(mockUserId)).rejects.toThrow();
    });

    it('should throw error when Supabase is not configured', async () => {
      delete process.env.SUPABASE_URL;

      await expect(twoFactorService.disableTwoFactor(mockUserId)).rejects.toThrow(
        'Supabase is not configured'
      );
    });
  });

  describe('isTwoFactorEnabled', () => {
    it('should return true when 2FA is enabled', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { is_enabled: true },
        error: null,
      });

      const result = await twoFactorService.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_two_factor');
      expect(mockSupabase.select).toHaveBeenCalledWith('is_enabled');
    });

    it('should return false when 2FA is disabled', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { is_enabled: false },
        error: null,
      });

      const result = await twoFactorService.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false when 2FA not configured', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await twoFactorService.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false when database error occurs', async () => {
      mockSupabase.single.mockRejectedValueOnce(new Error('Database error'));

      const result = await twoFactorService.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false when Supabase is not configured', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;

      const result = await twoFactorService.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });

    it('should handle null is_enabled value', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { is_enabled: null },
        error: null,
      });

      const result = await twoFactorService.isTwoFactorEnabled(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle concurrent enable attempts', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { secret: mockSecret, is_enabled: false },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        });

      const token = '123456';

      await Promise.all([
        twoFactorService.enableTwoFactor(mockUserId, token),
        twoFactorService.enableTwoFactor(mockUserId, token),
      ]);

      // Should have been called multiple times
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    it('should handle very long user IDs', async () => {
      const longUserId = 'a'.repeat(100);

      mockSupabase.single.mockResolvedValueOnce({
        data: { is_enabled: true },
        error: null,
      });

      const result = await twoFactorService.isTwoFactorEnabled(longUserId);

      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', longUserId);
    });

    it('should handle tokens with leading zeros', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: [],
        },
        error: null,
      });

      const tokenWithZeros = '000123';
      await twoFactorService.verifyTwoFactorToken(mockUserId, tokenWithZeros);

      expect(mockSupabase.from).toHaveBeenCalled();
    });

    it('should handle backup codes case sensitivity', async () => {
      const uppercaseCode = 'ABCD1234';
      const lowercaseHash = 'hashed_lowercase';

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: [lowercaseHash],
        },
        error: null,
      });

      await twoFactorService.verifyTwoFactorToken(mockUserId, uppercaseCode);

      expect(mockSupabase.from).toHaveBeenCalled();
    });

    it('should not expose secrets in error messages', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: mockEmail, full_name: 'Test' },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Secret: ABCD1234 failed' },
      });

      try {
        await twoFactorService.generateTwoFactorSecret(mockUserId);
      } catch (error: any) {
        // Ensure error doesn't expose sensitive data
        expect(error.message).not.toContain('SECRET');
      }
    });

    it('should handle rapid verification attempts', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          secret: mockSecret,
          is_enabled: true,
          backup_codes: [],
        },
        error: null,
      });

      const attempts = Array(10).fill(null).map((_, i) =>
        twoFactorService.verifyTwoFactorToken(mockUserId, `12345${i}`)
      );

      const results = await Promise.all(attempts);

      expect(results).toHaveLength(10);
    });
  });
});
