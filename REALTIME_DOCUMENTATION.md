# Real-time Features Documentation

## Overview

BilanCompetence.AI includes a complete real-time communication system using WebSocket technology (Socket.io) for instant notifications, messaging, and user presence tracking.

## Architecture

### Backend - RealtimeService

**Location**: `apps/backend/src/services/realtimeService.ts`

The `RealtimeService` class manages all WebSocket connections and real-time events.

```typescript
class RealtimeService {
  // Initialize with HTTP server
  constructor(httpServer: HTTPServer)

  // Send notification to single user
  sendNotification(userId: string, notification: NotificationPayload)

  // Send notification to multiple users
  broadcastNotification(userIds: string[], notification: NotificationPayload)

  // Check if user is online
  isUserOnline(userId: string): boolean

  // Get user's socket connections
  getUserConnections(userId: string): UserConnection[]

  // Get total online users count
  getOnlineUsersCount(): number
}
```

#### Features:

- **Authentication Middleware**: JWT token verification on socket connection
- **User Room Management**: Each user is in a room `user:{userId}` for targeted messaging
- **Connection Tracking**: Maintains a map of active user connections
- **Event Routing**: Handles messages, notifications, and typing indicators
- **Multi-Transport**: Supports both WebSocket and polling for compatibility

### Backend - Chat Routes

**Location**: `apps/backend/src/routes/chat.ts`

REST API endpoints for chat persistence and management.

**Endpoints:**

```
POST   /api/chat/conversations              - Create conversation
GET    /api/chat/conversations              - List conversations
GET    /api/chat/conversations/:id          - Get conversation details
POST   /api/chat/conversations/:id/messages - Send message (persisted)
GET    /api/chat/conversations/:id/messages - Fetch messages with pagination
POST   /api/chat/conversations/:id/mark-as-read - Mark messages as read
DELETE /api/chat/conversations/:id          - Delete conversation
```

#### Database Tables:

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  created_by UUID REFERENCES users(id),
  participant_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### Frontend - useRealtime Hook

**Location**: `apps/frontend/hooks/useRealtime.ts`

Custom React hook for managing real-time connections and events.

```typescript
const useRealtime = () => {
  // Connection state
  const isConnected: boolean

  // Event states
  const notifications: Notification[]
  const onlineUsers: Set<string>
  const typingUsers: Map<string, TypingIndicator>

  // Methods
  const sendMessage: (recipientId, message, conversationId) => void
  const sendTypingIndicator: (conversationId, isTyping) => void
  const sendNotification: (userId, notification) => void
  const acknowledgeNotification: (notificationId) => void
  const clearNotifications: () => void
  const removeNotification: (id) => void
  const getTypingUsers: (conversationId) => TypingIndicator[]
}
```

#### Connection Management:

- Initializes Socket.io client with JWT authentication
- Automatic reconnection with exponential backoff
- User presence tracking
- Notification and message event handling

### Frontend - UI Components

#### RealtimeNotifications Component

**Location**: `apps/frontend/components/RealtimeNotifications.tsx`

Displays incoming notifications as toast notifications.

Features:
- Auto-dismiss after 5 seconds
- Type-based styling (assessment, recommendation, message, system)
- Manual dismissal
- Smooth animations

#### ChatWidget Component

**Location**: `apps/frontend/components/ChatWidget.tsx`

Full-featured chat interface with real-time messaging.

Features:
- Send and receive messages instantly
- Message history pagination
- Typing indicators
- Connection status display
- Read receipts
- Message timestamps
- Database persistence

## WebSocket Events

### Client → Server

```typescript
// Send message to another user
socket.emit('message', {
  recipientId: string
  message: string
  conversationId: string
})

// Send typing indicator
socket.emit('typing', {
  conversationId: string
  isTyping: boolean
})

// Acknowledge notification
socket.emit('notification_ack', {
  notificationId: string
})
```

### Server → Client

```typescript
// Receive message from another user
socket.on('message', {
  senderId: string
  message: string
  conversationId: string
  timestamp: Date
})

// Receive notification
socket.on('notification', {
  type: string
  title: string
  message: string
  data?: any
  timestamp: Date
})

// Typing indicator from other user
socket.on('user_typing', {
  userId: string
  conversationId: string
  isTyping: boolean
  timestamp: Date
})

// Connection confirmation
socket.on('connected', {
  socketId: string
  userId: string
  timestamp: Date
})
```

## Notification Types

### Assessment Notifications

**Type**: `assessment_started`

Sent when a beneficiary starts a career assessment.

```typescript
{
  type: 'assessment_started',
  title: 'Assessment Started',
  message: 'Your assessment has been started',
  data: { type: 'assessment_started' }
}
```

**Recipient**: Beneficiary

### Recommendation Notifications

**Type**: `recommendation`

Sent when a new recommendation is generated.

```typescript
{
  type: 'recommendation',
  title: 'New Recommendation',
  message: 'Career Path Update',
  data: { description: 'Recommendation details' }
}
```

**Recipient**: User

### Message Notifications

**Type**: `message`

Sent when user receives a message from another user.

```typescript
{
  type: 'message',
  title: 'New Message',
  message: 'Message from {sender}',
  data: { senderId, conversationId }
}
```

**Recipient**: Message recipient

### System Notifications

**Type**: `system`

System-wide notifications and announcements.

```typescript
{
  type: 'system',
  title: 'System Message',
  message: 'Maintenance scheduled',
  data: { ... }
}
```

**Recipient**: All users or specific groups

## Usage Examples

### Sending a Message

```typescript
import useRealtime from '@/hooks/useRealtime'

export default function MessageForm() {
  const { sendMessage, isConnected } = useRealtime()

  const handleSend = (recipientId: string, message: string) => {
    if (isConnected) {
      sendMessage(recipientId, message, 'conv-123')
    }
  }

  return (...)
}
```

### Displaying Notifications

```typescript
import RealtimeNotifications from '@/components/RealtimeNotifications'

export default function Layout() {
  return (
    <>
      <RealtimeNotifications />
      {/* Rest of layout */}
    </>
  )
}
```

### Using Chat Widget

```typescript
import ChatWidget from '@/components/ChatWidget'

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      {chatOpen && (
        <ChatWidget
          conversationId="conv-123"
          recipientId="user-456"
          recipientName="John Consultant"
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  )
}
```

### Sending Notifications from Backend

```typescript
import RealtimeService from '../services/realtimeService'

// In your route handler
const realtime = new RealtimeService(server)

realtime.sendNotification('user-id', {
  type: 'recommendation',
  title: 'Career Recommendation',
  message: 'New career path available',
  data: { recommendationId: '123' }
})
```

## Performance Considerations

### Scaling WebSocket Connections

For production deployment with multiple server instances:

1. **Use Redis Adapter**: Connect Socket.io instances via Redis for cross-server communication
2. **Connection Pooling**: Implement connection limits per user
3. **Message Queuing**: Use message queues for high-volume notifications
4. **Namespace Organization**: Organize rooms by feature (assessments, messages, notifications)

### Optimization Tips

1. **Selective Broadcasting**: Send notifications only to relevant users
2. **Message Batching**: Group multiple notifications if necessary
3. **Connection Timeout**: Set appropriate timeout values
4. **Heartbeat Monitoring**: Monitor connection health with ping/pong
5. **Lazy Loading**: Load chat history on-demand with pagination

## Security

### Authentication

- All Socket.io connections require valid JWT token
- Token verified in middleware before connection accepted
- User ID extracted from authenticated token

### Authorization

- Each user only receives messages in their user room
- Messages between users validated on backend
- Conversation ownership verified before access

### Data Validation

- All incoming event data validated with Zod schemas
- Message content sanitized to prevent XSS
- Conversation access controlled by ownership

## Testing

### Run Real-time Tests

```bash
cd apps/backend
npm test -- realtime.spec.ts
```

### Run Chat API Tests

```bash
cd apps/backend
npm test -- chat.integration.spec.ts
```

### Manual Testing with Socket.io Inspector

```bash
# Use Socket.io debug client or Postman WebSocket testing
# Connect to http://localhost:3001 with auth headers
```

## Troubleshooting

### Connection Issues

**Problem**: WebSocket connection fails
- Check JWT token validity
- Verify CORS configuration
- Ensure backend server running
- Check network connectivity

### Messages Not Appearing

**Problem**: Messages sent but not received
- Verify both users are connected (`isConnected` = true)
- Check recipient ID is correct
- Verify conversation ID matches
- Check browser console for errors

### Typing Indicator Not Working

**Problem**: Typing indicator not showing
- Ensure both users in same conversation
- Check `sendTypingIndicator` is called
- Verify event listeners attached
- Check for JavaScript errors

## Environment Configuration

### Backend (.env)

```env
# Socket.io Configuration
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://...
```

### Frontend (.env.local)

```env
# Backend URL for WebSocket connection
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Future Enhancements

1. **Video/Audio Calls**: Integrate WebRTC for voice and video
2. **File Sharing**: Send files through chat
3. **Message Reactions**: Add emoji reactions to messages
4. **Message Search**: Full-text search in conversations
5. **Scheduled Notifications**: Send notifications at specific times
6. **Message Encryption**: End-to-end encryption for sensitive messages
7. **Message Editing**: Edit/delete sent messages
8. **Presence Indicators**: Show user activity status (online, away, busy)
9. **Message Translation**: Auto-translate messages to user's language
10. **Mobile Push Notifications**: Send notifications to mobile apps

## Support

For issues or questions about real-time features:

1. Check the troubleshooting section above
2. Review Socket.io documentation: https://socket.io/docs/
3. Check test files for usage examples
4. Review component implementations for patterns

---

**Last Updated**: October 20, 2025
**Status**: Production Ready
