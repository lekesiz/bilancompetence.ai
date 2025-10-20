import http from 'http';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import io, { Socket as ClientSocket } from 'socket.io-client';
import RealtimeService from '../services/realtimeService';

describe('Real-time Service - WebSocket Communication', () => {
  let server: http.Server;
  let realtime: RealtimeService;
  let clientSocket: ClientSocket;
  let clientSocket2: ClientSocket;
  const TEST_PORT = 3002;

  beforeAll((done) => {
    const app = http.createServer();
    server = app;
    realtime = new RealtimeService(server);

    server.listen(TEST_PORT, () => {
      console.log(`Test server listening on port ${TEST_PORT}`);
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket?.connected) clientSocket.disconnect();
    if (clientSocket2?.connected) clientSocket2.disconnect();
    realtime.close();
    server.close(done);
  });

  describe('Connection & Authentication', () => {
    it('should connect with valid token and userId', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token',
          userId: 'user-1',
        },
        transports: ['websocket', 'polling'],
      });

      clientSocket.on('connected', (data) => {
        expect(data.userId).toBe('user-1');
        expect(data.socketId).toBeDefined();
        done();
      });
    });

    it('should reject connection without token', (done) => {
      const socket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          userId: 'user-2',
        },
        transports: ['websocket', 'polling'],
      });

      socket.on('error', (error) => {
        expect(error).toBe('Authentication error');
        socket.disconnect();
        done();
      });
    });

    it('should track user connections', (done) => {
      clientSocket2 = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-2',
          userId: 'user-2',
        },
        transports: ['websocket', 'polling'],
      });

      clientSocket2.on('connected', () => {
        expect(realtime.isUserOnline('user-2')).toBe(true);
        const connections = realtime.getUserConnections('user-2');
        expect(connections.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Notifications', () => {
    it('should send notification to user', (done) => {
      clientSocket.on('notification', (notification) => {
        expect(notification.type).toBe('test_notification');
        expect(notification.title).toBe('Test Title');
        expect(notification.message).toBe('Test Message');
        expect(notification.timestamp).toBeDefined();
        done();
      });

      realtime.sendNotification('user-1', {
        type: 'test_notification',
        title: 'Test Title',
        message: 'Test Message',
      });
    });

    it('should broadcast notification to multiple users', (done) => {
      let notificationCount = 0;

      const handleNotification = (notification: any) => {
        notificationCount++;
        expect(notification.type).toBe('broadcast_test');
        if (notificationCount === 2) {
          clientSocket.off('notification', handleNotification);
          clientSocket2.off('notification', handleNotification);
          done();
        }
      };

      clientSocket.on('notification', handleNotification);
      clientSocket2.on('notification', handleNotification);

      realtime.broadcastNotification(['user-1', 'user-2'], {
        type: 'broadcast_test',
        title: 'Broadcast Title',
        message: 'Broadcast Message',
      });
    });

    it('should send assessment started notification', (done) => {
      clientSocket.on('notification', (notification) => {
        expect(notification.type).toBe('assessment_started');
        expect(notification.title).toBe('Assessment Started');
        clientSocket.off('notification');
        done();
      });

      realtime.notifyAssessmentStarted('user-1');
    });

    it('should send recommendation notification', (done) => {
      clientSocket.on('notification', (notification) => {
        expect(notification.type).toBe('recommendation');
        expect(notification.title).toBe('New Recommendation');
        expect(notification.data?.description).toBe('Test Recommendation');
        clientSocket.off('notification');
        done();
      });

      realtime.notifyRecommendation('user-1', 'Career Path Update', 'Test Recommendation');
    });
  });

  describe('Messaging', () => {
    it('should emit message event', (done) => {
      clientSocket2.on('message', (message) => {
        expect(message.senderId).toBe('user-1');
        expect(message.message).toBe('Hello from user-1');
        expect(message.conversationId).toBe('conv-1');
        clientSocket2.off('message');
        done();
      });

      clientSocket.emit('message', {
        recipientId: 'user-2',
        message: 'Hello from user-1',
        conversationId: 'conv-1',
      });
    });

    it('should handle message acknowledgement', (done) => {
      clientSocket.on('notification_ack', (data) => {
        console.log('Received ACK:', data);
      });

      clientSocket.emit('notification_ack', {
        notificationId: 'notif-1',
      });

      setTimeout(() => {
        done();
      }, 100);
    });
  });

  describe('Typing Indicators', () => {
    it('should broadcast typing indicator', (done) => {
      clientSocket2.on('user_typing', (typing) => {
        expect(typing.userId).toBe('user-1');
        expect(typing.conversationId).toBe('conv-1');
        expect(typing.isTyping).toBe(true);
        clientSocket2.off('user_typing');
        done();
      });

      clientSocket.emit('typing', {
        conversationId: 'conv-1',
        isTyping: true,
      });
    });

    it('should broadcast typing stop indicator', (done) => {
      clientSocket2.on('user_typing', (typing) => {
        expect(typing.isTyping).toBe(false);
        clientSocket2.off('user_typing');
        done();
      });

      clientSocket.emit('typing', {
        conversationId: 'conv-1',
        isTyping: false,
      });
    });
  });

  describe('User Status', () => {
    it('should report correct online users count', () => {
      const count = realtime.getOnlineUsersCount();
      expect(count).toBeGreaterThanOrEqual(2); // At least user-1 and user-2
    });

    it('should check if user is online', () => {
      expect(realtime.isUserOnline('user-1')).toBe(true);
      expect(realtime.isUserOnline('user-2')).toBe(true);
      expect(realtime.isUserOnline('non-existent-user')).toBe(false);
    });

    it('should get user connections', () => {
      const connections = realtime.getUserConnections('user-1');
      expect(connections.length).toBeGreaterThan(0);
      expect(connections[0].userId).toBe('user-1');
      expect(connections[0].socketId).toBeDefined();
      expect(connections[0].connectedAt).toBeDefined();
    });

    it('should return empty array for offline user', () => {
      const connections = realtime.getUserConnections('non-existent-user');
      expect(connections).toEqual([]);
    });
  });

  describe('Disconnection', () => {
    it('should remove user connection on disconnect', (done) => {
      const tempSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-3',
          userId: 'user-3',
        },
        transports: ['websocket', 'polling'],
      });

      tempSocket.on('connected', () => {
        expect(realtime.isUserOnline('user-3')).toBe(true);
        tempSocket.disconnect();

        setTimeout(() => {
          expect(realtime.isUserOnline('user-3')).toBe(false);
          done();
        }, 100);
      });
    });
  });
});
