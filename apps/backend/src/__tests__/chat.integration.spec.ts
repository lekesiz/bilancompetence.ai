import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';
const authToken = 'test-jwt-token';

describe('Chat API Integration', () => {
  let conversationId: string;
  const userId1 = 'user-1';
  const userId2 = 'user-2';

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    validateStatus: () => true, // Don't throw on any status
  });

  describe('POST /api/chat/conversations', () => {
    it('should create conversation with valid data', async () => {
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
      const response = await api.post('/chat/conversations', {
        title: 'Test Conversation',
      });

      expect(response.status).toBe(400);
      expect(response.data.status).toBe('error');
    });

    it('should require authentication', async () => {
      const unauthApi = axios.create({
        baseURL: BASE_URL,
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
      const response = await api.get('/chat/conversations');

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await api.get('/chat/conversations?limit=5');

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/chat/conversations/:conversationId', () => {
    it('should get conversation details', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.get(`/chat/conversations/${conversationId}`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
      expect(response.data.data.id).toBe(conversationId);
    });

    it('should return 404 for non-existent conversation', async () => {
      const response = await api.get('/chat/conversations/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.data.status).toBe('error');
    });
  });

  describe('POST /api/chat/conversations/:conversationId/messages', () => {
    it('should send message', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content: 'Test message content',
      });

      expect([201, 200]).toContain(response.status);
      expect(response.data.status).toBe('success');
      expect(response.data.data?.content).toBe('Test message content');
    });

    it('should fail without message content', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {});

      expect(response.status).toBe(400);
      expect(response.data.status).toBe('error');
    });

    it('should include sender information', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content: 'Another test message',
      });

      expect(response.data.data?.sender_id).toBeDefined();
      expect(response.data.data?.conversation_id).toBe(conversationId);
    });
  });

  describe('GET /api/chat/conversations/:conversationId/messages', () => {
    it('should get conversation messages', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.get(`/chat/conversations/${conversationId}/messages`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should support pagination with limit and offset', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.get(
        `/chat/conversations/${conversationId}/messages?limit=10&offset=0`
      );

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeLessThanOrEqual(10);
    });

    it('should return messages in chronological order', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.get(`/chat/conversations/${conversationId}/messages`);

      if (response.data.data.length > 1) {
        const dates = response.data.data.map((msg: any) => new Date(msg.created_at).getTime());
        // Check if timestamps are in ascending order (newest last after reversal)
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
        }
      }
    });
  });

  describe('POST /api/chat/conversations/:conversationId/mark-as-read', () => {
    it('should mark messages as read', async () => {
      if (!conversationId) {
        console.log('Skipping test - no conversation created');
        return;
      }

      const response = await api.post(
        `/chat/conversations/${conversationId}/mark-as-read`
      );

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });
  });

  describe('DELETE /api/chat/conversations/:conversationId', () => {
    it('should delete conversation', async () => {
      // Create a new conversation for deletion test
      const createResponse = await api.post('/chat/conversations', {
        participantId: userId2,
        title: 'Conversation to Delete',
      });

      if (!createResponse.data.data?.id) {
        console.log('Skipping delete test - conversation creation failed');
        return;
      }

      const tempConvId = createResponse.data.data.id;

      const response = await api.delete(`/chat/conversations/${tempConvId}`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('success');
    });

    it('should fail to delete non-existent conversation', async () => {
      const response = await api.delete('/chat/conversations/non-existent-id');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
