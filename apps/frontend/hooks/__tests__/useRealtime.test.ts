import { renderHook, waitFor, act } from '@testing-library/react';
import { useRealtime } from '../useRealtime';
import { useAuth } from '../useAuth';
import { api } from '@/lib/api';
import io from 'socket.io-client';

// Mock dependencies
jest.mock('socket.io-client');
jest.mock('../useAuth');
jest.mock('@/lib/api', () => ({
  api: {
    getAccessToken: jest.fn(),
  },
}));

describe('useRealtime', () => {
  let mockSocket: any;
  let mockEventHandlers: Map<string, Function>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
  };

  beforeEach(() => {
    mockEventHandlers = new Map();

    // Mock socket instance
    mockSocket = {
      on: jest.fn((event: string, handler: Function) => {
        mockEventHandlers.set(event, handler);
      }),
      emit: jest.fn(),
      close: jest.fn(),
      connected: true,
    };

    (io as jest.Mock).mockReturnValue(mockSocket);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (api.getAccessToken as jest.Mock).mockReturnValue('test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockEventHandlers.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useRealtime());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.onlineUsers.size).toBe(0);
      expect(result.current.typingUsers.size).toBe(0);
    });

    it('should connect to Socket.IO server when user and token exist', () => {
      renderHook(() => useRealtime());

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: {
            token: 'test-token',
            userId: 'user-123',
          },
          reconnection: true,
          transports: ['websocket', 'polling'],
        })
      );
    });

    it('should not connect when user is missing', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      renderHook(() => useRealtime());

      expect(io).not.toHaveBeenCalled();
    });

    it('should not connect when token is missing', () => {
      (api.getAccessToken as jest.Mock).mockReturnValue(null);

      renderHook(() => useRealtime());

      expect(io).not.toHaveBeenCalled();
    });

    it('should set connected state on socket connect', () => {
      const { result } = renderHook(() => useRealtime());

      expect(result.current.isConnected).toBe(false);

      // Simulate socket connect event
      act(() => {
        const connectHandler = mockEventHandlers.get('connect');
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should set disconnected state on socket disconnect', () => {
      const { result } = renderHook(() => useRealtime());

      // First connect
      act(() => {
        const connectHandler = mockEventHandlers.get('connect');
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);

      // Then disconnect
      act(() => {
        const disconnectHandler = mockEventHandlers.get('disconnect');
        if (disconnectHandler) disconnectHandler();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should close socket on unmount', () => {
      const { unmount } = renderHook(() => useRealtime());

      unmount();

      expect(mockSocket.close).toHaveBeenCalled();
    });

    it('should use NEXT_PUBLIC_BACKEND_URL from env', () => {
      const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
      process.env.NEXT_PUBLIC_BACKEND_URL = 'https://custom-backend.com';

      renderHook(() => useRealtime());

      expect(io).toHaveBeenCalledWith(
        'https://custom-backend.com',
        expect.any(Object)
      );

      process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
    });

    it('should fallback to localhost when env not set', () => {
      const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
      delete process.env.NEXT_PUBLIC_BACKEND_URL;

      renderHook(() => useRealtime());

      expect(io).toHaveBeenCalledWith(
        'http://localhost:3001',
        expect.any(Object)
      );

      process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
    });
  });

  describe('Notifications', () => {
    it('should receive and store notifications', () => {
      const { result } = renderHook(() => useRealtime());

      const mockNotification = {
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: new Date(),
      };

      act(() => {
        const notificationHandler = mockEventHandlers.get('notification');
        if (notificationHandler) notificationHandler(mockNotification);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject(mockNotification);
      expect(result.current.notifications[0].id).toBeDefined();
    });

    it('should accumulate multiple notifications', () => {
      const { result } = renderHook(() => useRealtime());

      const notifications = [
        { type: 'info', title: 'Notif 1', message: 'Message 1', timestamp: new Date() },
        { type: 'warning', title: 'Notif 2', message: 'Message 2', timestamp: new Date() },
        { type: 'error', title: 'Notif 3', message: 'Message 3', timestamp: new Date() },
      ];

      act(() => {
        const handler = mockEventHandlers.get('notification');
        notifications.forEach((notif) => {
          if (handler) handler(notif);
        });
      });

      expect(result.current.notifications).toHaveLength(3);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useRealtime());

      // Add notifications
      act(() => {
        const handler = mockEventHandlers.get('notification');
        if (handler) {
          handler({ type: 'info', title: 'Test', message: 'Test', timestamp: new Date() });
          handler({ type: 'info', title: 'Test 2', message: 'Test', timestamp: new Date() });
        }
      });

      expect(result.current.notifications).toHaveLength(2);

      // Clear notifications
      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('should remove specific notification', () => {
      const { result } = renderHook(() => useRealtime());

      // Add notifications
      act(() => {
        const handler = mockEventHandlers.get('notification');
        if (handler) {
          handler({ type: 'info', title: 'Notif 1', message: 'Test', timestamp: new Date() });
          handler({ type: 'info', title: 'Notif 2', message: 'Test', timestamp: new Date() });
        }
      });

      const firstNotificationId = result.current.notifications[0].id!;

      // Remove first notification
      act(() => {
        result.current.removeNotification(firstNotificationId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Notif 2');
    });

    it('should acknowledge notification', () => {
      const { result } = renderHook(() => useRealtime());

      act(() => {
        result.current.acknowledgeNotification('notif-123');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('notification_ack', {
        notificationId: 'notif-123',
      });
    });

    it('should send notification to user', () => {
      const { result } = renderHook(() => useRealtime());

      const notification = {
        type: 'info',
        title: 'Test',
        message: 'Test message',
        timestamp: new Date(),
      };

      act(() => {
        result.current.sendNotification('user-456', notification);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'send_notification',
        expect.objectContaining({
          userId: 'user-456',
          type: 'info',
          title: 'Test',
        })
      );
    });

    it('should not send notification when socket disconnected', () => {
      const { result } = renderHook(() => useRealtime());
      mockSocket.connected = false;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      act(() => {
        result.current.sendNotification('user-456', {
          type: 'info',
          title: 'Test',
          message: 'Test',
          timestamp: new Date(),
        });
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Messages', () => {
    it('should dispatch custom event for received messages', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      renderHook(() => useRealtime());

      const mockMessage = {
        id: 'msg-1',
        senderId: 'user-456',
        content: 'Hello!',
        conversationId: 'conv-1',
        timestamp: new Date(),
      };

      act(() => {
        const messageHandler = mockEventHandlers.get('message');
        if (messageHandler) messageHandler(mockMessage);
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'realtime:message',
          detail: mockMessage,
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should send message when connected', () => {
      const { result } = renderHook(() => useRealtime());

      act(() => {
        result.current.sendMessage('user-456', 'Hello', 'conv-1');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('message', {
        recipientId: 'user-456',
        message: 'Hello',
        conversationId: 'conv-1',
      });
    });

    it('should not send message when socket disconnected', () => {
      const { result } = renderHook(() => useRealtime());
      mockSocket.connected = false;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      act(() => {
        result.current.sendMessage('user-456', 'Hello', 'conv-1');
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Socket not connected')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Typing Indicators', () => {
    it('should track typing users', () => {
      const { result } = renderHook(() => useRealtime());

      const typingIndicator = {
        userId: 'user-456',
        conversationId: 'conv-1',
        isTyping: true,
        timestamp: new Date(),
      };

      act(() => {
        const typingHandler = mockEventHandlers.get('user_typing');
        if (typingHandler) typingHandler(typingIndicator);
      });

      expect(result.current.typingUsers.size).toBe(1);
    });

    it('should remove typing indicator when user stops typing', () => {
      const { result } = renderHook(() => useRealtime());

      const typingStart = {
        userId: 'user-456',
        conversationId: 'conv-1',
        isTyping: true,
        timestamp: new Date(),
      };

      const typingStop = {
        userId: 'user-456',
        conversationId: 'conv-1',
        isTyping: false,
        timestamp: new Date(),
      };

      act(() => {
        const handler = mockEventHandlers.get('user_typing');
        if (handler) {
          handler(typingStart);
        }
      });

      expect(result.current.typingUsers.size).toBe(1);

      act(() => {
        const handler = mockEventHandlers.get('user_typing');
        if (handler) {
          handler(typingStop);
        }
      });

      expect(result.current.typingUsers.size).toBe(0);
    });

    it('should get typing users for specific conversation', () => {
      const { result } = renderHook(() => useRealtime());

      act(() => {
        const handler = mockEventHandlers.get('user_typing');
        if (handler) {
          handler({
            userId: 'user-456',
            conversationId: 'conv-1',
            isTyping: true,
            timestamp: new Date(),
          });
          handler({
            userId: 'user-789',
            conversationId: 'conv-2',
            isTyping: true,
            timestamp: new Date(),
          });
        }
      });

      const typingInConv1 = result.current.getTypingUsers('conv-1');
      expect(typingInConv1).toHaveLength(1);
      expect(typingInConv1[0].userId).toBe('user-456');

      const typingInConv2 = result.current.getTypingUsers('conv-2');
      expect(typingInConv2).toHaveLength(1);
      expect(typingInConv2[0].userId).toBe('user-789');
    });

    it('should send typing indicator', () => {
      const { result } = renderHook(() => useRealtime());

      act(() => {
        result.current.sendTypingIndicator('conv-1', true);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('typing', {
        conversationId: 'conv-1',
        isTyping: true,
      });
    });

    it('should not send typing indicator when disconnected', () => {
      const { result } = renderHook(() => useRealtime());
      mockSocket.connected = false;

      act(() => {
        result.current.sendTypingIndicator('conv-1', true);
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle socket errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      renderHook(() => useRealtime());

      const mockError = new Error('Connection failed');

      act(() => {
        const errorHandler = mockEventHandlers.get('error');
        if (errorHandler) errorHandler(mockError);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Socket error'),
        mockError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle null socket reference safely', () => {
      const { result } = renderHook(() => useRealtime());

      // Force unmount to clear socket ref
      const { unmount } = renderHook(() => useRealtime());
      unmount();

      // These should not throw
      act(() => {
        result.current.sendMessage('user-1', 'test', 'conv-1');
        result.current.sendTypingIndicator('conv-1', true);
        result.current.acknowledgeNotification('notif-1');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid typing indicator updates', () => {
      const { result } = renderHook(() => useRealtime());

      act(() => {
        const handler = mockEventHandlers.get('user_typing');
        for (let i = 0; i < 100; i++) {
          if (handler) {
            handler({
              userId: `user-${i}`,
              conversationId: 'conv-1',
              isTyping: i % 2 === 0,
              timestamp: new Date(),
            });
          }
        }
      });

      // Should have 50 typing users (even numbers)
      expect(result.current.typingUsers.size).toBe(50);
    });

    it('should handle multiple simultaneous connections', () => {
      const { result: result1 } = renderHook(() => useRealtime());
      const { result: result2 } = renderHook(() => useRealtime());

      expect(io).toHaveBeenCalledTimes(2);
      expect(result1.current).not.toBe(result2.current);
    });

    it('should handle notifications with missing optional fields', () => {
      const { result } = renderHook(() => useRealtime());

      const minimalNotification = {
        type: 'info',
        title: 'Test',
        message: 'Test',
        timestamp: new Date(),
      };

      act(() => {
        const handler = mockEventHandlers.get('notification');
        if (handler) handler(minimalNotification);
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('should handle reconnection attempts', () => {
      renderHook(() => useRealtime());

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
      );
    });
  });
});
