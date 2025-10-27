# BilanCompetence.AI - Complete API Documentation

**Version**: 1.0.0
**Base URL**: `https://web-production-60dbd.up.railway.app/api`
**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`

---

## Authentication

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
X-Request-ID: {unique-request-id}
```

### Login Response
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "User Name",
      "role": "BENEFICIARY"
    }
  }
}
```

---

## API Endpoints Reference

### 1. Authentication Endpoints

#### POST `/auth/register`
Register new user
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "User Name"
}

Response:
{
  "status": "success",
  "data": {
    "user": {...},
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

#### POST `/auth/login`
User login
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "status": "success",
  "data": {
    "user": {...},
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

#### POST `/auth/refresh`
Refresh access token
```json
Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### GET `/auth/verify`
Verify current token
```json
Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "BENEFICIARY"
  }
}
```

---

### 2. User Management Endpoints

#### GET `/users/profile`
Get current user profile
```json
Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "phone": "+33123456789",
    "bio": "User bio",
    "avatar_url": "https://...",
    "role": "BENEFICIARY",
    "created_at": "2025-10-20T10:00:00Z"
  }
}
```

#### PUT `/users/profile`
Update user profile
```json
Request:
{
  "full_name": "New Name",
  "phone": "+33987654321",
  "bio": "New bio"
}

Response: Updated user object
```

#### GET `/users/stats`
Get user statistics
```json
Response:
{
  "status": "success",
  "data": {
    "totalAssessments": 5,
    "completedAssessments": 3,
    "averageScore": 85,
    "completionRate": 60
  }
}
```

#### GET `/users/preferences`
Get user preferences
```json
Response:
{
  "status": "success",
  "data": {
    "notifications_enabled": true,
    "email_notifications": true,
    "theme": "light",
    "language": "en"
  }
}
```

#### PUT `/users/preferences`
Update preferences
```json
Request:
{
  "notifications_enabled": true,
  "email_notifications": false,
  "theme": "dark",
  "language": "fr"
}

Response: Updated preferences
```

#### DELETE `/users/account`
Delete user account (GDPR)
```json
Response:
{
  "status": "success",
  "message": "Account deleted successfully"
}
```

---

### 3. Assessment Endpoints

#### POST `/assessments`
Create new assessment
```json
Request:
{
  "title": "Career Assessment 2025",
  "description": "Evaluate your career path",
  "assessment_type": "career"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Career Assessment 2025",
    "status": "draft",
    "assessment_type": "career",
    "created_at": "2025-10-20T10:00:00Z"
  }
}
```

#### GET `/assessments`
List user assessments
```json
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "title": "Career Assessment",
      "status": "in_progress",
      "completion_percentage": 45,
      "created_at": "2025-10-20T10:00:00Z"
    }
  ]
}
```

#### GET `/assessments/:id`
Get assessment details
```json
Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Career Assessment",
    "description": "...",
    "status": "in_progress",
    "questions": [...]
  }
}
```

#### POST `/assessments/:id/start`
Start assessment
```json
Response:
{
  "status": "success",
  "message": "Assessment started"
}
```

#### GET `/assessments/:id/questions`
Get assessment questions
```json
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "question_text": "What is your goal?",
      "question_type": "multiple_choice",
      "options": ["Option 1", "Option 2"]
    }
  ]
}
```

#### POST `/assessments/:id/answers`
Submit answer
```json
Request:
{
  "question_id": "uuid",
  "answer": "Option 1"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "question_id": "uuid",
    "answer": "Option 1"
  }
}
```

#### POST `/assessments/:id/complete`
Complete assessment
```json
Response:
{
  "status": "success",
  "data": {
    "score": 85,
    "recommendations": [...]
  }
}
```

---

### 4. Messaging Endpoints

#### GET `/chat/conversations`
List conversations
```json
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "participant_id": "uuid",
      "title": "John Consultant",
      "last_message": "Great progress!",
      "unread_count": 2,
      "created_at": "2025-10-20T10:00:00Z"
    }
  ]
}
```

#### POST `/chat/conversations`
Create conversation
```json
Request:
{
  "participant_id": "uuid",
  "title": "Chat with John"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "participant_id": "uuid",
    "title": "Chat with John"
  }
}
```

#### GET `/chat/conversations/:id/messages`
Get messages
```json
Query Parameters:
- limit: 100
- offset: 0

Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "content": "Hello!",
      "created_at": "2025-10-20T10:00:00Z",
      "read_at": null
    }
  ]
}
```

#### POST `/chat/conversations/:id/messages`
Send message
```json
Request:
{
  "content": "Hello, how are you?"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "sender_id": "uuid",
    "content": "Hello, how are you?",
    "created_at": "2025-10-20T10:00:00Z"
  }
}
```

---

### 5. Notification Endpoints

#### GET `/notifications`
List notifications
```json
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "type": "assessment_started",
      "title": "Assessment Started",
      "message": "Your assessment has started",
      "read_at": null,
      "created_at": "2025-10-20T10:00:00Z"
    }
  ]
}
```

#### GET `/notifications/unread/count`
Get unread count
```json
Response:
{
  "status": "success",
  "data": {
    "unread_count": 5
  }
}
```

#### PUT `/notifications/:id/read`
Mark notification as read
```json
Response:
{
  "status": "success",
  "message": "Notification marked as read"
}
```

---

### 6. Analytics Endpoints

#### GET `/analytics/user-activity`
Get user activity stats
```json
Response:
{
  "status": "success",
  "data": {
    "totalAssessments": 10,
    "completedAssessments": 7,
    "averageScore": 82,
    "completionRate": 70
  }
}
```

#### GET `/analytics/assessment/:id`
Get assessment analytics
```json
Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "score": 85,
    "timeSpent": 1500,
    "questionStats": [...]
  }
}
```

---

### 7. File Endpoints

#### POST `/files/upload`
Upload file
```
Content-Type: multipart/form-data
Form field: file (binary)

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "filename": "document.pdf",
    "url": "https://storage.bilancompetence.ai/files/..."
  }
}
```

#### GET `/files`
List user files
```json
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "filename": "document.pdf",
      "size": 2048,
      "created_at": "2025-10-20T10:00:00Z"
    }
  ]
}
```

---

### 8. Password Management

#### POST `/password-reset/request`
Request password reset
```json
Request:
{
  "email": "user@example.com"
}

Response:
{
  "status": "success",
  "message": "Reset email sent"
}
```

#### POST `/password-reset/confirm`
Confirm password reset
```json
Request:
{
  "token": "reset_token_xyz",
  "new_password": "NewSecurePass123!"
}

Response:
{
  "status": "success",
  "message": "Password updated"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Server Error

---

## Rate Limiting

### Limits per 15 minutes
- General API: 100 requests
- Auth endpoints: 5 requests
- Login: 3 requests per email
- Registration: 2 requests per IP
- Password reset: 5 requests per email
- Email verification: 10 requests per email

---

## WebSocket Events (Real-time)

### Connection
```javascript
// Connect to WebSocket
io('https://api.bilancompetence.ai', {
  auth: {
    token: 'your_jwt_token',
    userId: 'your_user_id'
  }
})

// Events
socket.on('connected', (data) => {...})
socket.on('notification', (notification) => {...})
socket.on('message', (message) => {...})
socket.on('user_typing', (typing) => {...})
```

---

## SDK/Client Libraries

### JavaScript/TypeScript
```bash
npm install @bilancompetence/sdk
```

### Python
```bash
pip install bilancompetence-sdk
```

### Mobile (React Native)
```bash
npm install @bilancompetence/mobile-sdk
```

---

## Webhooks

### Supported Events
- `assessment.completed`
- `recommendation.created`
- `user.registered`
- `organization.created`

### Example Webhook Payload
```json
{
  "event": "assessment.completed",
  "timestamp": "2025-10-20T10:00:00Z",
  "data": {
    "assessment_id": "uuid",
    "user_id": "uuid",
    "score": 85
  }
}
```

---

## Support & Contact

- **API Status**: https://status.bilancompetence.ai
- **Documentation**: https://docs.bilancompetence.ai
- **Support Email**: api-support@bilancompetence.ai
- **Slack Community**: https://slack.bilancompetence.ai

---

**Last Updated**: October 27, 2025
**API Version**: 1.0.0
**Status**: Production Ready ✅
**Database**: Neon PostgreSQL
**Backend**: Railway
**Frontend**: Vercel (https://app.bilancompetence.ai)
