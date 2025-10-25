'use client';

import { useEffect, useRef, useState } from 'react';
import useRealtime from '@/hooks/useRealtime';
import { api } from '@/lib/api';

interface Message {
  id: string;
  senderId: string;
  content: string;
  conversationId: string;
  timestamp: Date;
  read_at?: Date;
}

interface ChatWidgetProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatWidget({
  conversationId,
  recipientId,
  recipientName,
  isOpen = true,
  onClose,
}: ChatWidgetProps) {
  const { sendMessage, sendTypingIndicator, getTypingUsers, isConnected } = useRealtime();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/chat/conversations/${conversationId}/messages`);
        if (response.data?.data) {
          setMessages(
            response.data.data.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.created_at),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadMessages();
    }
  }, [conversationId, isOpen]);

  // Listen for incoming messages
  useEffect(() => {
    const handleMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    window.addEventListener('realtime:message', handleMessage);
    return () => window.removeEventListener('realtime:message', handleMessage);
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Send typing indicator
    if (!isTyping && isConnected) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isConnected) {
      return;
    }

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsTyping(false);

    // Stop typing indicator
    sendTypingIndicator(conversationId, false);

    // Send via real-time
    sendMessage(recipientId, messageContent, conversationId);

    // Also save to database
    try {
      const response = await api.post(`/api/chat/conversations/${conversationId}/messages`, {
        content: messageContent,
      });
      if (response.data?.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: response.data.data.id,
            senderId: response.data.data.sender_id,
            content: response.data.data.content,
            conversationId: response.data.data.conversation_id,
            timestamp: new Date(response.data.data.created_at),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const typingUsers = getTypingUsers(conversationId);
  const typingIndicator = typingUsers.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col border border-gray-200 z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{recipientName}</h3>
          {isConnected ? (
            <p className="text-xs opacity-90">🟢 Online</p>
          ) : (
            <p className="text-xs opacity-90">🔴 Offline</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-blue-800 rounded px-2 py-1 transition-colors"
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-300">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-300">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-2">
              <div className="flex-1">
                <div
                  className={`rounded-lg px-3 py-2 max-w-xs break-words ${
                    message.senderId === recipientId
                      ? 'bg-gray-100 text-gray-900 dark:text-white'
                      : 'bg-primary-600 text-white ml-auto'
                  }`}
                >
                  {message.content}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typingIndicator && (
          <div className="flex gap-2 items-center">
            <div className="space-y-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{recipientName} is typing...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={2}
            disabled={!isConnected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-3 py-2 rounded transition-colors text-sm font-medium"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        {!isConnected && <p className="text-xs text-red-600 mt-2">Not connected. Waiting...</p>}
      </div>
    </div>
  );
}
