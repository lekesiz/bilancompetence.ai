import {
  registerSchema,
  loginSchema,
  refreshSchema,
  passwordResetSchema,
  passwordResetConfirmSchema,
  verifyEmailSchema,
  validateRegisterRequest,
  validateLoginRequest,
  validateRefreshRequest,
  RegisterRequest,
  LoginRequest,
} from '../../validators/authValidator';

describe('Auth Validators', () => {
  describe('Register Schema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass@123',
        full_name: 'Test User',
        role: 'BENEFICIARY',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should set default role to BENEFICIARY', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass@123',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('BENEFICIARY');
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass@123',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short email', () => {
      const invalidData = {
        email: 'a@b',
        password: 'SecurePass@123',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 12 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Short@1',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'secure@pass123',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SECURE@PASS123',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without digit', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePassword@',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        full_name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass@123',
        full_name: 'A',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid roles', () => {
      const roles = ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'];

      roles.forEach((role) => {
        const data = {
          email: 'test@example.com',
          password: 'SecurePass@123',
          full_name: 'Test User',
          role: role as any,
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass@123',
        full_name: 'Test User',
        role: 'INVALID_ROLE',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass@123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept password with minimum 8 characters for login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'simplepass',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '1234567',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'SecurePass@123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Refresh Token Schema', () => {
    it('should validate correct refresh token', () => {
      const validData = {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
      };

      const result = refreshSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject token shorter than 10 characters', () => {
      const invalidData = {
        refreshToken: 'short',
      };

      const result = refreshSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const invalidData = {};

      const result = refreshSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Schema', () => {
    it('should validate correct password reset request', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = passwordResetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = passwordResetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = {};

      const result = passwordResetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Confirm Schema', () => {
    it('should validate correct password reset confirmation', () => {
      const validData = {
        token: 'abcdefghijklmnopqrst',
        newPassword: 'NewSecurePass@123',
      };

      const result = passwordResetConfirmSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject token shorter than 20 characters', () => {
      const invalidData = {
        token: 'short',
        newPassword: 'NewSecurePass@123',
      };

      const result = passwordResetConfirmSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        token: 'abcdefghijklmnopqrst',
        newPassword: 'weak',
      };

      const result = passwordResetConfirmSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const invalidData = {
        newPassword: 'NewSecurePass@123',
      };

      const result = passwordResetConfirmSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        token: 'abcdefghijklmnopqrst',
      };

      const result = passwordResetConfirmSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Verify Email Schema', () => {
    it('should validate correct email verification', () => {
      const validData = {
        token: 'abcdefghijklmnopqrst',
      };

      const result = verifyEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject token shorter than 20 characters', () => {
      const invalidData = {
        token: 'short',
      };

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const invalidData = {};

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Validate Functions', () => {
    describe('validateRegisterRequest', () => {
      it('should validate correct registration', () => {
        const data = {
          email: 'test@example.com',
          password: 'SecurePass@123',
          full_name: 'Test User',
        };

        const result = validateRegisterRequest(data);
        expect(result.valid).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.errors).toBeNull();
      });

      it('should return errors for invalid data', () => {
        const data = {
          email: 'invalid',
          password: 'weak',
          full_name: 'A',
        };

        const result = validateRegisterRequest(data);
        expect(result.valid).toBe(false);
        expect(result.data).toBeNull();
        expect(result.errors).toBeDefined();
        expect(result.errors?.length).toBeGreaterThan(0);
      });

      it('should format errors with path and message', () => {
        const data = {
          email: 'invalid',
        };

        const result = validateRegisterRequest(data);
        if (!result.valid && result.errors) {
          expect(result.errors[0]).toHaveProperty('path');
          expect(result.errors[0]).toHaveProperty('message');
        }
      });
    });

    describe('validateLoginRequest', () => {
      it('should validate correct login', () => {
        const data = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = validateLoginRequest(data);
        expect(result.valid).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.errors).toBeNull();
      });

      it('should return errors for invalid data', () => {
        const data = {
          email: 'invalid',
          password: 'short',
        };

        const result = validateLoginRequest(data);
        expect(result.valid).toBe(false);
        expect(result.data).toBeNull();
        expect(result.errors).toBeDefined();
      });
    });

    describe('validateRefreshRequest', () => {
      it('should validate correct refresh request', () => {
        const data = {
          refreshToken: 'valid.token.here',
        };

        const result = validateRefreshRequest(data);
        expect(result.valid).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should return errors for invalid token', () => {
        const data = {
          refreshToken: 'short',
        };

        const result = validateRefreshRequest(data);
        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });
  });
});
