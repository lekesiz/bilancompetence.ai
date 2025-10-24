import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
  validatePasswordStrength,
  validateEmail,
  generateUserId,
  createUserRecord,
  UserPayload,
} from '../../services/authService.js';

describe('AuthService', () => {
  const testUser: UserPayload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
  };

  describe('Password Hashing', () => {
    it('should hash a password successfully', async () => {
      const password = 'SecurePass@123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should compare password correctly', async () => {
      const password = 'SecurePass@123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should fail when comparing wrong password', async () => {
      const password = 'SecurePass@123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('WrongPassword@456', hash);

      expect(isMatch).toBe(false);
    });

    it('should create different hashes for same password', async () => {
      const password = 'SecurePass@123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate access token', () => {
      const token = generateAccessToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate refresh token', () => {
      const token = generateRefreshToken(testUser.id);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate token pair', () => {
      const pair = generateTokenPair(testUser);

      expect(pair).toBeDefined();
      expect(pair.accessToken).toBeDefined();
      expect(pair.refreshToken).toBeDefined();
      expect(pair.expiresIn).toBe('7d');
    });

    it('should verify access token correctly', () => {
      const token = generateAccessToken(testUser);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.email).toBe(testUser.email);
      expect(decoded?.id).toBe(testUser.id);
      expect(decoded?.role).toBe('BENEFICIARY');
    });

    it('should verify refresh token correctly', () => {
      const token = generateRefreshToken(testUser.id);
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testUser.id);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expires immediately
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const decoded = verifyToken(expiredToken);

      expect(decoded).toBeNull();
    });
  });

  describe('Password Strength Validation', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('SecurePass@123');

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject password shorter than 12 characters', () => {
      const result = validatePasswordStrength('Short@1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('secure@pass123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('SECURE@PASS123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without digit', () => {
      const result = validatePasswordStrength('SecurePassword@');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one digit');
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('SecurePass123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('valid.email@domain.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('User ID Generation', () => {
    it('should generate UUID', () => {
      const id = generateUserId();

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36); // UUID v4 format: 8-4-4-4-12
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate different UUIDs', () => {
      const id1 = generateUserId();
      const id2 = generateUserId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('User Record Creation', () => {
    it('should create user record with all required fields', () => {
      const passwordHash = 'hashed_password_here';
      const user = createUserRecord('test@example.com', passwordHash, 'Test User', 'BENEFICIARY');

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.password_hash).toBe(passwordHash);
      expect(user.full_name).toBe('Test User');
      expect(user.role).toBe('BENEFICIARY');
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });

    it('should create user with different roles', () => {
      const roles = ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'] as const;

      roles.forEach((role) => {
        const user = createUserRecord('test@example.com', 'hash', 'Test', role);
        expect(user.role).toBe(role);
      });
    });

    it('should generate unique IDs for each user record', () => {
      const user1 = createUserRecord('test1@example.com', 'hash', 'User 1', 'BENEFICIARY');
      const user2 = createUserRecord('test2@example.com', 'hash', 'User 2', 'BENEFICIARY');

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('User Payload Type', () => {
    it('should support all user roles', () => {
      const beneficiary: UserPayload = {
        id: '1',
        email: 'beneficiary@example.com',
        full_name: 'Beneficiary User',
        role: 'BENEFICIARY',
      };

      const consultant: UserPayload = {
        id: '2',
        email: 'consultant@example.com',
        full_name: 'Consultant User',
        role: 'CONSULTANT',
      };

      const admin: UserPayload = {
        id: '3',
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'ORG_ADMIN',
      };

      expect(beneficiary.role).toBe('BENEFICIARY');
      expect(consultant.role).toBe('CONSULTANT');
      expect(admin.role).toBe('ORG_ADMIN');
    });
  });
});
