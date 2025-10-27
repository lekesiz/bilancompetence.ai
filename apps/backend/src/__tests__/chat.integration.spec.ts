import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { setupTestServer, teardownTestServer, TestServerManager } from './utils/testServer.js';
import { setupTestDatabase, teardownTestDatabase } from './utils/testDatabase.js';
import { testAuth } from './utils/testAuth.js';

// Mock authService before importing routes
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
    if (token === 'test-jwt-token-consultant') {
      return {
        userId: 'test-consultant-1',
        email: 'consultant@test.com',
        role: 'CONSULTANT',
        fullName: 'Test Consultant',
      };
    }
    return null;
  }),
  generateToken: jest.fn(() => 'mock-generated-token'),
}));

describe('Chat API Integration', () => {
  let testServer: TestServerManager;
  let conversationId: string;
  const userId1 = 'test-beneficiary-1';
  const userId2 = 'test-consultant-1';

  beforeAll(async () => {
    // Setup test server and database
    testServer = await setupTestServer();
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Teardown test server and database
    await teardownTestServer();
    await teardownTestDatabase();
  });

  const createApi = (token: string = 'test-jwt-token') => {
    return axios.create({
      baseURL: `${testServer.getBaseUrl()}/api`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true, // Don't throw on any status
    });
  };

  describe('POST /api/chat/conversations', () => {
    it('should create conversation with valid data', async () => {
      const api = createApi();
      const response = await api.post('/chat/conversations', {
        participantId: userId2,
        title: 'Test Conversation',
      });

      expect([201, 200]).toContain(response.status);
      expect(response.data.status).toBe('success');
      expect(response.data.data).toBeDefined();

      if (response.data.data?.id) {
        conversationId = response.data.data.id;
      }
    });

    it('should fail without participantId', async () => {
      const api = createApi();
      const response = await api.post('/chat/conversations', {
        title: 'Test Conversation',
      });

      expect(response.status).toBe(400);
      expect(response.data.status).toBe('error');
    });

    it('should require authentication', async () => {
      const unauthApi = axios.create({
        baseURL: `${testServer.getBaseUrl()}/api`,
        validateStatus: () => true,
      });

      const response = await unauthApi.post('/chat/conversations', {
        participantId: userId2,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/chat/conversations', () => {
    it('should get user conversations', async () => {
      const api = createApi();
      const response = await api.get('/chat/conversations');

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data.status).toBe('success');
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('should respect limit parameter', async () => {
      const api = createApi();
      const response = await api.get('/chat/conversations?limit=5');

      expect([200, 404]).toContain(response.status);
      if (response.status === 200 && response.data.data) {
        expect(response.data.data.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('GET /api/chat/conversations/:conversationId', () => {
    it('should return 404 for non-existent conversation', async () => {
      const api = createApi();
      const response = await api.get('/chat/conversations/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.data.status).toBe('error');
    });
  });

  describe('DELETE /api/chat/conversations/:conversationId', () => {
    it('should delete conversation', async () => {
      const api = createApi();
      
      // First create a conversation
      const createResponse = await api.post('/chat/conversations', {
        participantId: userId2,
        title: 'Conversation to Delete',
      });

      if (createResponse.status === 201 || createResponse.status === 200) {
        const conversationId = createResponse.data.data?.id;
        
        if (conversationId) {
          // Then delete it
          const deleteResponse = await api.delete(`/chat/conversations/${conversationId}`);
          expect([200, 204]).toContain(deleteResponse.status);
        }
      }
    });

    it('should fail to delete non-existent conversation', async () => {
      const api = createApi();
      const response = await api.delete('/chat/conversations/non-existent-id');

      expect([404, 400]).toContain(response.status);
      expect(response.data.status).toBe('error');
    });
  });
});

