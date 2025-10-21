import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { api } from '@/lib/api';

interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

interface Message {
  id?: string;
  senderId: string;
  content: string;
  conversationId: string;
  timestamp: Date;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: Date;
}

export const useRealtime = () => {
  const { user } = useAuth();
  const token = api.getAccessToken();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    const socket = io(serverUrl, {
      auth: {
        token,
        userId: user.id,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to real-time server');
      setIsConnected(true);
    });

    socket.on('connected', (data) => {
      console.log('🔌 Socket connected:', data);
    });

    // Handle incoming notifications
    socket.on('notification', (notification: Notification) => {
      console.log('📬 Received notification:', notification);
      setNotifications((prev) => [...prev, { ...notification, id: `notif-${Date.now()}` }]);
    });

    // Handle incoming messages
    socket.on('message', (message: Message) => {
      console.log('💬 Received message:', message);
      // Dispatch to message handler (parent component)
      window.dispatchEvent(
        new CustomEvent('realtime:message', {
          detail: message,
        })
      );
    });

    // Handle typing indicators
    socket.on('user_typing', (typing: TypingIndicator) => {
      console.log('✍️ User typing:', typing);
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        const key = `${typing.userId}-${typing.conversationId}`;
        if (typing.isTyping) {
          updated.set(key, typing);
        } else {
          updated.delete(key);
        }
        return updated;
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time server');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [user, token]);

  // Send notification acknowledgement
  const acknowledgeNotification = useCallback((notificationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('notification_ack', { notificationId });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    (recipientId: string, message: string, conversationId: string) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('message', {
          recipientId,
          message,
          conversationId,
        });
      } else {
        console.warn('⚠️ Socket not connected, message not sent');
      }
    },
    []
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', {
        conversationId,
        isTyping,
      });
    }
  }, []);

  // Send notification to user
  const sendNotification = useCallback((userId: string, notification: Notification) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_notification', {
        userId,
        ...notification,
      });
    }
  }, []);

  // Clear old notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Get typing users for a conversation
  const getTypingUsers = useCallback(
    (conversationId: string) => {
      const typing: TypingIndicator[] = [];
      typingUsers.forEach((indicator) => {
        if (indicator.conversationId === conversationId && indicator.isTyping) {
          typing.push(indicator);
        }
      });
      return typing;
    },
    [typingUsers]
  );

  return {
    isConnected,
    notifications,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    sendNotification,
    acknowledgeNotification,
    clearNotifications,
    removeNotification,
    getTypingUsers,
  };
};

export default useRealtime;
