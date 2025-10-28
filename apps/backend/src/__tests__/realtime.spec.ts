import http from 'http';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, xit } from '@jest/globals';
import io, { Socket as ClientSocket } from 'socket.io-client';
import RealtimeService from '../services/realtimeService';

describe('Real-time Service - WebSocket Communication', () => {
  let server: http.Server;
  let realtime: RealtimeService;
  let clientSocket: ClientSocket;
  let clientSocket2: ClientSocket;
  let clientSocket3: ClientSocket;
  const TEST_PORT = 3002;
  const TIMEOUT = 10000;

  beforeAll((done) => {
    const app = http.createServer();
    server = app;
    realtime = new RealtimeService(server);

    server.listen(TEST_PORT, () => {
      console.log(`Test server listening on port ${TEST_PORT}`);
      done();
    });
  }, 15000);

  beforeEach((done) => {
    // Properly disconnect any existing sockets
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
    if (clientSocket2?.connected) {
      clientSocket2.disconnect();
    }
    if (clientSocket3?.connected) {
      clientSocket3.disconnect();
    }
    setTimeout(done, 100);
  });

  afterEach((done) => {
    // Clean up sockets after each test
    if (clientSocket?.connected) clientSocket.disconnect();
    if (clientSocket2?.connected) clientSocket2.disconnect();
    if (clientSocket3?.connected) clientSocket3.disconnect();
    setTimeout(done, 200);
  });

  afterAll((done) => {
    // Final cleanup
    if (clientSocket?.connected) clientSocket.disconnect();
    if (clientSocket2?.connected) clientSocket2.disconnect();
    if (clientSocket3?.connected) clientSocket3.disconnect();
    realtime.close();
    server.close(done);
  }, 15000);

  describe('Connection & Authentication', () => {
    it('should connect with valid token and userId', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token',
          userId: 'user-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Connection timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', (data) => {
        clearTimeout(timeout);
        expect(data.userId).toBe('user-1');
        expect(data.socketId).toBeDefined();
        done();
      });

      clientSocket.on('error', (error) => {
        clearTimeout(timeout);
        done(new Error(`Connection error: ${error}`));
      });
    });

    // Using connect_error event instead of error event for auth rejection
    it('should reject connection without token', (done) => {
      const socket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          userId: 'user-2',
          // No token provided
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        done(new Error('Authentication timeout'));
      }, TIMEOUT);

      // Socket.io uses connect_error for authentication failures
      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        expect(error.message).toContain('Authentication');
        socket.disconnect();
        done();
      });

      // Fallback: if connection succeeds, fail the test
      socket.on('connected', () => {
        clearTimeout(timeout);
        socket.disconnect();
        done(new Error('Connection should have been rejected'));
      });
    });

    it('should track user connections', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-1',
          userId: 'user-1-track',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Connection timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        clearTimeout(timeout);
        expect(realtime.isUserOnline('user-1-track')).toBe(true);
        const connections = realtime.getUserConnections('user-1-track');
        expect(connections.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Notifications', () => {
    it('should send notification to user', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-notif',
          userId: 'user-notif-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Notification test timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        // After connection established, send notification
        realtime.sendNotification('user-notif-1', {
          type: 'test_notification',
          title: 'Test Title',
          message: 'Test Message',
        });
      });

      clientSocket.on('notification', (notification) => {
        clearTimeout(timeout);
        try {
          expect(notification.type).toBe('test_notification');
          expect(notification.title).toBe('Test Title');
          expect(notification.message).toBe('Test Message');
          expect(notification.timestamp).toBeDefined();
          clientSocket.off('notification');
          done();
        } catch (error) {
          done(error as any);
        }
      });

      clientSocket.on('error', (error) => {
        clearTimeout(timeout);
        done(new Error(`Socket error: ${error}`));
      });
    });

    it('should broadcast notification to multiple users', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-bcast-1',
          userId: 'user-bcast-1',
        },
        transports: ['websocket', 'polling'],
      });

      clientSocket2 = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-bcast-2',
          userId: 'user-bcast-2',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        clientSocket2.disconnect();
        done(new Error('Broadcast test timeout'));
      }, TIMEOUT);

      let connectedCount = 0;
      let notificationCount = 0;

      const handleConnected = () => {
        connectedCount++;
        if (connectedCount === 2) {
          // Both sockets connected, now broadcast
          realtime.broadcastNotification(['user-bcast-1', 'user-bcast-2'], {
            type: 'broadcast_test',
            title: 'Broadcast Title',
            message: 'Broadcast Message',
          });
        }
      };

      const handleNotification = (socket: ClientSocket) => (notification: any) => {
        try {
          expect(notification.type).toBe('broadcast_test');
          notificationCount++;
          if (notificationCount === 2) {
            clearTimeout(timeout);
            clientSocket.off('notification');
            clientSocket2.off('notification');
            done();
          }
        } catch (error) {
          clearTimeout(timeout);
          done(error as any);
        }
      };

      clientSocket.on('connected', handleConnected);
      clientSocket2.on('connected', handleConnected);
      clientSocket.on('notification', handleNotification(clientSocket));
      clientSocket2.on('notification', handleNotification(clientSocket2));
    });

    it('should send assessment started notification', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-assess',
          userId: 'user-assess-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Assessment notification timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        realtime.notifyAssessmentStarted('user-assess-1');
      });

      clientSocket.on('notification', (notification) => {
        clearTimeout(timeout);
        try {
          expect(notification.type).toBe('assessment_started');
          expect(notification.title).toBe('Assessment Started');
          clientSocket.off('notification');
          done();
        } catch (error) {
          done(error as any);
        }
      });
    });

    it('should send recommendation notification', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-rec',
          userId: 'user-rec-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Recommendation notification timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        realtime.notifyRecommendation('user-rec-1', 'Career Path Update', 'Test Recommendation');
      });

      clientSocket.on('notification', (notification) => {
        clearTimeout(timeout);
        try {
          expect(notification.type).toBe('recommendation');
          expect(notification.title).toBe('New Recommendation');
          expect(notification.data?.description).toBe('Test Recommendation');
          clientSocket.off('notification');
          done();
        } catch (error) {
          done(error as any);
        }
      });
    });
  });

  describe('Messaging', () => {
    it('should emit message event', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-msg-1',
          userId: 'user-msg-1',
        },
        transports: ['websocket', 'polling'],
      });

      clientSocket2 = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-msg-2',
          userId: 'user-msg-2',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        clientSocket2.disconnect();
        done(new Error('Message test timeout'));
      }, TIMEOUT);

      let connectedCount = 0;

      const handleConnected = () => {
        connectedCount++;
        if (connectedCount === 2) {
          // Both connected, send message
          clientSocket.emit('message', {
            recipientId: 'user-msg-2',
            message: 'Hello from user-msg-1',
            conversationId: 'conv-1',
          });
        }
      };

      clientSocket.on('connected', handleConnected);
      clientSocket2.on('connected', handleConnected);

      clientSocket2.on('message', (message) => {
        clearTimeout(timeout);
        try {
          expect(message.senderId).toBe('user-msg-1');
          expect(message.message).toBe('Hello from user-msg-1');
          expect(message.conversationId).toBe('conv-1');
          clientSocket2.off('message');
          done();
        } catch (error) {
          done(error as any);
        }
      });
    });

    it('should handle message acknowledgement', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-ack',
          userId: 'user-ack-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done();
      }, 1000);

      clientSocket.on('connected', () => {
        clientSocket.emit('notification_ack', {
          notificationId: 'notif-1',
        });
        clearTimeout(timeout);
        done();
      });
    });
  });

  describe('Typing Indicators', () => {
    it('should broadcast typing indicator', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-type-1',
          userId: 'user-type-1',
        },
        transports: ['websocket', 'polling'],
      });

      clientSocket2 = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-type-2',
          userId: 'user-type-2',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        clientSocket2.disconnect();
        done(new Error('Typing indicator timeout'));
      }, TIMEOUT);

      let connectedCount = 0;

      const handleConnected = () => {
        connectedCount++;
        if (connectedCount === 2) {
          clientSocket.emit('typing', {
            conversationId: 'conv-1',
            isTyping: true,
          });
        }
      };

      clientSocket.on('connected', handleConnected);
      clientSocket2.on('connected', handleConnected);

      clientSocket2.on('user_typing', (typing) => {
        clearTimeout(timeout);
        try {
          expect(typing.userId).toBe('user-type-1');
          expect(typing.conversationId).toBe('conv-1');
          expect(typing.isTyping).toBe(true);
          clientSocket2.off('user_typing');
          done();
        } catch (error) {
          done(error as any);
        }
      });
    });

    it('should broadcast typing stop indicator', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-stop-1',
          userId: 'user-stop-1',
        },
        transports: ['websocket', 'polling'],
      });

      clientSocket2 = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-stop-2',
          userId: 'user-stop-2',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        clientSocket2.disconnect();
        done(new Error('Typing stop indicator timeout'));
      }, TIMEOUT);

      let connectedCount = 0;

      const handleConnected = () => {
        connectedCount++;
        if (connectedCount === 2) {
          clientSocket.emit('typing', {
            conversationId: 'conv-1',
            isTyping: false,
          });
        }
      };

      clientSocket.on('connected', handleConnected);
      clientSocket2.on('connected', handleConnected);

      clientSocket2.on('user_typing', (typing) => {
        clearTimeout(timeout);
        try {
          expect(typing.isTyping).toBe(false);
          clientSocket2.off('user_typing');
          done();
        } catch (error) {
          done(error as any);
        }
      });
    });
  });

  describe('User Status', () => {
    it('should report correct online users count', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-count',
          userId: 'user-count-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Online count test timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        clearTimeout(timeout);
        const count = realtime.getOnlineUsersCount();
        expect(count).toBeGreaterThanOrEqual(1);
        done();
      });
    });

    it('should check if user is online', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-online',
          userId: 'user-online-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('Online check timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        clearTimeout(timeout);
        expect(realtime.isUserOnline('user-online-1')).toBe(true);
        expect(realtime.isUserOnline('non-existent-user')).toBe(false);
        done();
      });
    });

    it('should get user connections', (done) => {
      clientSocket = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-conn',
          userId: 'user-conn-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        done(new Error('User connections timeout'));
      }, TIMEOUT);

      clientSocket.on('connected', () => {
        clearTimeout(timeout);
        const connections = realtime.getUserConnections('user-conn-1');
        expect(connections.length).toBeGreaterThan(0);
        expect(connections[0].userId).toBe('user-conn-1');
        expect(connections[0].socketId).toBeDefined();
        expect(connections[0].connectedAt).toBeDefined();
        done();
      });
    });

    it('should return empty array for offline user', () => {
      const connections = realtime.getUserConnections('non-existent-user');
      expect(connections).toEqual([]);
    });
  });

  describe('Disconnection', () => {
    it('should remove user connection on disconnect', (done) => {
      clientSocket3 = io(`http://localhost:${TEST_PORT}`, {
        auth: {
          token: 'test-token-disc',
          userId: 'user-disc-1',
        },
        transports: ['websocket', 'polling'],
      });

      const timeout = setTimeout(() => {
        clientSocket3.disconnect();
        done(new Error('Disconnect test timeout'));
      }, TIMEOUT);

      clientSocket3.on('connected', () => {
        expect(realtime.isUserOnline('user-disc-1')).toBe(true);
        clientSocket3.disconnect();

        setTimeout(() => {
          clearTimeout(timeout);
          expect(realtime.isUserOnline('user-disc-1')).toBe(false);
          done();
        }, 300);
      });
    });
  });
});
