import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../lib/api';
import useRealtime from '../hooks/useRealtime';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface TypingUser {
  userId: string;
  isTyping: boolean;
}

export default function ChatDetailScreen({ route, navigation }: any) {
  const { conversationId, participantName } = route.params;
  const { sendMessage, sendTypingIndicator, getTypingUsers, isConnected } =
    useRealtime();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    setupMessageListener();
  }, [conversationId]);

  useEffect(() => {
    // Update typing indicator
    const typing = getTypingUsers(conversationId);
    setTypingUsers(typing as any);
  }, [conversationId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.getConversationMessages(conversationId, 100);
      if (response.data?.data) {
        setMessages(response.data.data);
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const setupMessageListener = () => {
    const handleMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    };

    window.addEventListener('realtime:message', handleMessage);
    return () => {
      window.removeEventListener('realtime:message', handleMessage);
    };
  };

  const handleTyping = (text: string) => {
    setInputValue(text);

    // Send typing indicator
    sendTypingIndicator(conversationId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isConnected) {
      return;
    }

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Send typing stopped
    sendTypingIndicator(conversationId, false);

    try {
      // Send via real-time
      sendMessage('', messageContent, conversationId);

      // Also save to database
      const response = await api.sendMessage(conversationId, messageContent);
      if (response.data?.data) {
        const newMessage: Message = {
          id: response.data.data.id,
          sender_id: response.data.data.sender_id,
          content: response.data.data.content,
          created_at: response.data.data.created_at,
        };
        setMessages((prev) => [...prev, newMessage]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputValue(messageContent); // Restore message if sending fails
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{participantName}</Text>
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? '#10b981' : '#ef4444' },
                ]}
              />
              <Text style={styles.connectionText}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item: message }) => (
            <View style={styles.messageRow}>
              <View
                style={[
                  styles.messageBubble,
                  styles.receivedMessage,
                ]}
              >
                <Text style={styles.messageText}>{message.content}</Text>
                <Text style={styles.messageTime}>
                  {formatMessageTime(message.created_at)}
                </Text>
              </View>
            </View>
          )}
          onEndReached={() => {}}
          scrollEnabled={true}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <View style={styles.typingDots}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
            <Text style={styles.typingText}>
              {typingUsers.length === 1
                ? 'Someone is typing...'
                : 'Multiple users typing...'}
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputArea}>
          {!isConnected && (
            <View style={styles.offlineWarning}>
              <Text style={styles.offlineWarningText}>
                ⚠️ You are offline. Messages will be sent when reconnected.
              </Text>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
              editable={!isSending && isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputValue.trim() || isSending || !isConnected) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputValue.trim() || isSending || !isConnected}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectionText: {
    fontSize: 11,
    color: '#999',
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  receivedMessage: {
    backgroundColor: '#e5e7eb',
    marginRight: 'auto',
  },
  sentMessage: {
    backgroundColor: '#2563eb',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  emptyMessages: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyMessagesText: {
    color: '#999',
    fontSize: 14,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  typingText: {
    fontSize: 12,
    color: '#999',
  },
  inputArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  offlineWarning: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  offlineWarningText: {
    fontSize: 12,
    color: '#92400e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
