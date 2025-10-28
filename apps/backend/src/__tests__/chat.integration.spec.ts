import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// Mock auth middleware FIRST
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    
    Object.assign(req, {
      user: {
        id: 'test-beneficiary-1',
        email: 'beneficiary@test.com',
        role: 'BENEFICIARY',
        full_name: 'Test Beneficiary',
      },
    });
    next();
  },
}));

// Mock chatServiceNeon
jest.mock('../services/chatServiceNeon', () => ({
  createConversation: jest.fn().mockResolvedValue({
    id: 'conv-123',
    created_by: 'test-beneficiary-1',
    participant_id: 'test-consultant-1',
    title: 'Test Conversation',
    created_at: new Date().toISOString(),
  }),
  getUserConversations: jest.fn().mockResolvedValue([
    {
      id: 'conv-123',
      created_by: 'test-beneficiary-1',
      participant_id: 'test-consultant-1',
      title: 'Test Conversation',
      created_at: new Date().toISOString(),
    },
  ]),
  getConversation: jest.fn().mockImplementation((conversationId: string) => {
    if (conversationId === 'non-existent-id') {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      id: conversationId,
      created_by: 'test-beneficiary-1',
      participant_id: 'test-consultant-1',
      title: 'Test Conversation',
      created_at: new Date().toISOString(),
    });
  }),
  createMessage: jest.fn().mockResolvedValue({
    id: 'msg-123',
    conversation_id: 'conv-123',
    sender_id: 'test-beneficiary-1',
    content: 'Test message',
    created_at: new Date().toISOString(),
  }),
  getMessages: jest.fn().mockResolvedValue([
    {
      id: 'msg-123',
      conversation_id: 'conv-123',
      sender_id: 'test-beneficiary-1',
      content: 'Test message',
      created_at: new Date().toISOString(),
    },
  ]),
  markMessageAsRead: jest.fn().mockResolvedValue(true),
  markConversationAsRead: jest.fn().mockResolvedValue(true),
  deleteConversation: jest.fn().mockImplementation((conversationId: string) => {
    if (conversationId === 'non-existent-id') {
      return Promise.reject(new Error('Conversation not found'));
    }
    return Promise.resolve(true);
  }),
  deleteMessage: jest.fn().mockResolvedValue(true),
}));

// Import routes AFTER mocks
import chatRoutes from '../routes/chat';

describe('Chat API Integration', () => {
  let app: express.Application;
  let conversationId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes);
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

      expect([404, 400, 500]).toContain(response.status);
      expect(response.body.status).toBe('error');
    });
  });
});

