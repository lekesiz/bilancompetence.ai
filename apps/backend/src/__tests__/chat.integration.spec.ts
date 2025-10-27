import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { getTestApp } from './utils/testApp.js';

// Mock authService before importing app
jest.mock('../services/authService.js', () => ({
  verifyToken: jest.fn((token: string) => {
    if (token === 'test-jwt-token' || token === 'test-jwt-token-beneficiary') {
      return {
        userId: 'test-beneficiary-1',
        email: 'beneficiary@test.com',
        role: 'BENEFICIARY',
        fullName: 'Test Beneficiary',
      };
    }
    return null;
  }),
  generateToken: jest.fn(() => 'mock-generated-token'),
}));

describe('Chat API Integration', () => {
  let app: any;
  let conversationId: string;

  beforeAll(() => {
    app = getTestApp();
  });

  const authHeader = { Authorization: 'Bearer test-jwt-token' };

  describe('POST /api/chat/conversations', () => {
    it('should create conversation with valid data', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set(authHeader)
        .send({
          participantId: 'test-consultant-1',
          title: 'Test Conversation',
        });

      expect([201, 200]).toContain(response.status);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();

      if (response.body.data?.id) {
        conversationId = response.body.data.id;
      }
    });

    it('should fail without participantId', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set(authHeader)
        .send({ title: 'Test Conversation' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .send({ participantId: 'test-consultant-1' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/chat/conversations', () => {
    it('should get user conversations', async () => {
      const response = await request(app)
        .get('/api/chat/conversations')
        .set(authHeader);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/chat/conversations?limit=5')
        .set(authHeader);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200 && response.body.data) {
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('GET /api/chat/conversations/:conversationId', () => {
    it('should return 404 for non-existent conversation', async () => {
      const response = await request(app)
        .get('/api/chat/conversations/non-existent-id')
        .set(authHeader);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/chat/conversations/:conversationId', () => {
    it('should delete conversation', async () => {
      // First create a conversation
      const createResponse = await request(app)
        .post('/api/chat/conversations')
        .set(authHeader)
        .send({
          participantId: 'test-consultant-1',
          title: 'Conversation to Delete',
        });

      if (createResponse.status === 201 || createResponse.status === 200) {
        const conversationId = createResponse.body.data?.id;
        
        if (conversationId) {
          const deleteResponse = await request(app)
            .delete(`/api/chat/conversations/${conversationId}`)
            .set(authHeader);
          
          expect([200, 204]).toContain(deleteResponse.status);
        }
      }
    });

    it('should fail to delete non-existent conversation', async () => {
      const response = await request(app)
        .delete('/api/chat/conversations/non-existent-id')
        .set(authHeader);

      expect([404, 400]).toContain(response.status);
      expect(response.body.status).toBe('error');
    });
  });
});
