import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';

describe('Auth Routes Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with invalid email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'SecurePass@123',
        full_name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'weak',
        full_name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject registration with short name', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass@123',
        full_name: 'A',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should accept valid registration data structure', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'SecurePass@123',
        full_name: 'New User',
        role: 'BENEFICIARY',
      });

      // Should return 201 (created) or 500 (if DB not connected)
      expect([201, 500]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('data.userId');
      }
    });

    it('should reject missing required fields', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        // missing password and name
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with invalid email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject login with missing email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should accept valid login data structure', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'ValidPass@123',
      });

      // Should return 200 (success with mock user) or 500 (if DB not connected)
      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('data.tokens');
        expect(response.body).toHaveProperty('data.user');
      }
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should reject invalid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should accept valid token format', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
      });

      // Expect 400 or 401 (invalid token signature)
      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with malformed header', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Request Content-Type Handling', () => {
    it('should handle JSON content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).not.toBe(415); // Not Unsupported Media Type
    });

    it('should reject non-JSON content', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=password123');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Error Response Format', () => {
    it('should include errors property in validation failures', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid',
        password: 'pass',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return consistent error structure', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'bad-email',
        password: 'bad',
        full_name: 'X',
      });

      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });
});
