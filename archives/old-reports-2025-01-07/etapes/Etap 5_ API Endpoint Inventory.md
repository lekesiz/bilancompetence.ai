# Etap 5: API Endpoint Inventory
## BilanCompetence.AI - Complete API Documentation

**Date:** 2025-10-27  
**Status:** Active API Endpoints  
**Base URL:** `https://web-production-60dbd.up.railway.app`  

---

## System Endpoints (3)

### Health & Monitoring

1. **GET /health**
   - Description: Health check endpoint
   - Auth: None
   - Response: `{ status, timestamp, uptime }`

2. **GET /api/version**
   - Description: API version information
   - Auth: None
   - Response: `{ version, name, environment }`

3. **GET /api/admin/monitoring/stats**
   - Description: Performance monitoring stats
   - Auth: Admin only
   - Response: Query performance metrics

---

## API Routes (23 modules)

### 1. Authentication (/api/auth)
**Module:** `auth.ts`  
**Endpoints:**
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/refresh - Refresh auth token
- GET /api/auth/me - Get current user

### 2. Dashboard (/api/dashboard)
**Module:** `dashboardNeon.ts` (Neon version active)  
**Endpoints:**
- GET /api/dashboard - Get dashboard data
- GET /api/dashboard/stats - Get statistics
- GET /api/dashboard/beneficiary - Beneficiary dashboard
- GET /api/dashboard/consultant - Consultant dashboard
- GET /api/dashboard/admin - Admin dashboard

### 3. Password Reset (/api/password-reset)
**Module:** `passwordResetNeon.ts` (Neon version active)  
**Endpoints:**
- POST /api/password-reset/request - Request password reset
- POST /api/password-reset/verify - Verify reset token
- POST /api/password-reset/reset - Reset password

### 4. Email Verification (/api/email-verification)
**Module:** `emailVerificationNeon.ts` (Neon version active)  
**Endpoints:**
- POST /api/email-verification/send - Send verification email
- POST /api/email-verification/verify - Verify email token
- POST /api/email-verification/resend - Resend verification email

### 5. Users (/api/users)
**Module:** `users.ts`  
**Endpoints:**
- GET /api/users - List users (admin)
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user
- GET /api/users/:id/profile - Get user profile
- PUT /api/users/:id/profile - Update user profile
- GET /api/users/:id/preferences - Get user preferences
- PUT /api/users/:id/preferences - Update user preferences

### 6. Assessments (/api/assessments)
**Module:** `assessments.ts`  
**Endpoints:**
- GET /api/assessments - List assessments
- POST /api/assessments - Create assessment
- GET /api/assessments/:id - Get assessment
- PUT /api/assessments/:id - Update assessment
- DELETE /api/assessments/:id - Delete assessment
- POST /api/assessments/:id/submit - Submit assessment
- GET /api/assessments/:id/progress - Get progress
- POST /api/assessments/:id/draft - Save draft

### 7. Parcours (/api/parcours)
**Module:** `parcours.ts`  
**Endpoints:**
- GET /api/parcours/:assessmentId - Get parcours
- POST /api/parcours/:assessmentId/answer - Save answer
- POST /api/parcours/:assessmentId/complete-preliminaire - Complete phase 1
- POST /api/parcours/:assessmentId/complete-investigation - Complete phase 2
- POST /api/parcours/:assessmentId/complete-conclusion - Complete phase 3

### 8. Tests (/api/tests)
**Module:** `tests.ts`  
**Endpoints:**
- GET /api/tests/mbti/questions - Get MBTI questions
- POST /api/tests/mbti/submit - Submit MBTI test
- GET /api/tests/riasec/questions - Get RIASEC questions
- POST /api/tests/riasec/submit - Submit RIASEC test
- GET /api/tests/values/questions - Get values questions
- POST /api/tests/values/submit - Submit values test
- GET /api/tests/interests/questions - Get interests questions
- POST /api/tests/interests/submit - Submit interests test
- GET /api/tests/:userId/results - Get test results

### 9. AI (/api/ai)
**Module:** `ai.ts`  
**Endpoints:**
- POST /api/ai/analyze-cv - Analyze CV
- POST /api/ai/recommend-jobs - Job recommendations
- POST /api/ai/personality-analysis - Personality analysis
- POST /api/ai/action-plan - Generate action plan

### 10. Recommendations (/api/recommendations)
**Module:** `recommendations.ts`  
**Endpoints:**
- POST /api/recommendations/jobs - Get job recommendations
- GET /api/recommendations/saved - Get saved recommendations
- POST /api/recommendations/save - Save recommendation
- DELETE /api/recommendations/:id - Delete recommendation
- GET /api/recommendations/rome-codes/search - Search ROME codes

### 11. Chat (/api/chat)
**Module:** `chat.ts`  
**Endpoints:**
- GET /api/chat/conversations - List conversations
- POST /api/chat/conversations - Create conversation
- GET /api/chat/conversations/:id - Get conversation
- DELETE /api/chat/conversations/:id - Delete conversation
- GET /api/chat/conversations/:id/messages - Get messages
- POST /api/chat/conversations/:id/messages - Send message
- PUT /api/chat/messages/:id/read - Mark message as read

### 12. Chat Enhanced (/api/chat-enhanced)
**Module:** `chatEnhanced.ts`  
**Endpoints:**
- Similar to /api/chat but with enhanced features

### 13. Scheduling (/api/scheduling)
**Module:** `scheduling.ts`  
**Endpoints:**
- GET /api/scheduling/availability - Get availability
- POST /api/scheduling/availability - Create availability slot
- PUT /api/scheduling/availability/:id - Update availability
- DELETE /api/scheduling/availability/:id - Delete availability
- GET /api/scheduling/bookings - List bookings
- POST /api/scheduling/bookings - Create booking
- PUT /api/scheduling/bookings/:id - Update booking
- DELETE /api/scheduling/bookings/:id - Cancel booking

### 14. Sessions (/api/sessions)
**Module:** `sessions.ts`  
**Endpoints:**
- GET /api/sessions - List sessions
- POST /api/sessions - Create session
- GET /api/sessions/:id - Get session
- PUT /api/sessions/:id - Update session
- DELETE /api/sessions/:id - Delete session

### 15. Documents (/api/documents)
**Module:** `documents.ts`  
**Endpoints:**
- GET /api/documents - List documents
- POST /api/documents - Upload document
- GET /api/documents/:id - Get document
- DELETE /api/documents/:id - Delete document
- GET /api/documents/:id/download - Download document

### 16. Files (/api/files)
**Module:** `files.ts`  
**Endpoints:**
- POST /api/files/upload - Upload file
- GET /api/files/:id - Get file
- DELETE /api/files/:id - Delete file

### 17. Export (/api/export)
**Module:** `export.ts`  
**Endpoints:**
- GET /api/export/assessment/:id/pdf - Export assessment to PDF
- GET /api/export/user/:id/data - Export user data (GDPR)

### 18. Notifications (/api/notifications)
**Module:** `notifications.ts`  
**Endpoints:**
- GET /api/notifications - List notifications
- PUT /api/notifications/:id/read - Mark as read
- PUT /api/notifications/read-all - Mark all as read
- DELETE /api/notifications/:id - Delete notification

### 19. Analytics (/api/analytics)
**Module:** `analytics.ts`  
**Endpoints:**
- GET /api/analytics/overview - Analytics overview
- GET /api/analytics/users - User analytics
- GET /api/analytics/assessments - Assessment analytics
- GET /api/analytics/revenue - Revenue analytics

### 20. Payments (/api/payments)
**Module:** `payments.ts`  
**Endpoints:**
- POST /api/payments/create-intent - Create payment intent
- POST /api/payments/confirm - Confirm payment
- GET /api/payments/:id - Get payment
- POST /api/payments/webhook - Stripe webhook

### 21. Pennylane (/api/pennylane)
**Module:** `pennylane.ts`  
**Endpoints:**
- POST /api/pennylane/invoice - Create invoice
- GET /api/pennylane/invoices - List invoices
- GET /api/pennylane/invoices/:id - Get invoice

### 22. Wedof (/api/wedof)
**Module:** `wedof.ts`  
**Endpoints:**
- POST /api/wedof/sync - Sync with Wedof
- GET /api/wedof/status - Get sync status

### 23. Two-Factor Auth (/api/2fa)
**Module:** `twoFactor.ts`  
**Endpoints:**
- POST /api/2fa/enable - Enable 2FA
- POST /api/2fa/verify - Verify 2FA code
- POST /api/2fa/disable - Disable 2FA

### 24. Qualiopi (/api/admin/qualiopi)
**Module:** `qualiopi.ts`  
**Endpoints:**
- GET /api/admin/qualiopi/indicators - List indicators
- PUT /api/admin/qualiopi/indicators/:id - Update indicator
- POST /api/admin/qualiopi/evidence - Add evidence
- GET /api/admin/qualiopi/report - Generate report

---

## External Service Integrations

### 1. France Travail API
**Service:** Job recommendations  
**Used in:** recommendations.ts  
**Status:** ⚠️ To be verified

### 2. ESCO API
**Service:** Skills and competencies  
**Used in:** ai.ts, recommendations.ts  
**Status:** ⚠️ To be verified

### 3. OpenAI API
**Service:** AI analysis  
**Used in:** ai.ts, chat.ts  
**Status:** ⚠️ To be verified

### 4. Stripe API
**Service:** Payments  
**Used in:** payments.ts  
**Status:** ⚠️ To be verified

### 5. SendGrid API
**Service:** Email sending  
**Used in:** emailService.ts  
**Status:** ⚠️ To be verified

### 6. Pennylane API
**Service:** Invoicing  
**Used in:** pennylane.ts  
**Status:** ⚠️ To be verified

### 7. Wedof API
**Service:** Integration  
**Used in:** wedof.ts  
**Status:** ⚠️ To be verified

### 8. Supabase Storage
**Service:** File storage  
**Used in:** files.ts, documents.ts  
**Status:** ✅ Active

---

## Authentication & Authorization

### Auth Methods
1. **JWT Tokens** - Primary auth method
2. **Session Tokens** - For long-lived sessions
3. **2FA** - Optional two-factor authentication

### User Roles
1. **BENEFICIARY** - End users
2. **CONSULTANT** - Consultants/coaches
3. **ADMIN** - System administrators
4. **SUPER_ADMIN** - Super administrators

### Protected Routes
- Most /api/* routes require authentication
- Admin routes require ADMIN or SUPER_ADMIN role
- Qualiopi routes require ADMIN role

---

## Rate Limiting

### Limits
- **API Routes:** 100 requests/15 minutes
- **Auth Login:** 5 requests/15 minutes
- **Auth Register:** 5 requests/15 minutes

---

## CORS Configuration

### Allowed Origins
- `https://bilancompetence.vercel.app`
- `https://bilancompetence-git-main-lekesizs-projects.vercel.app`
- `https://bilancompetence.ai`
- `https://app.bilancompetence.ai`
- `https://*.bilancompetence.ai`
- `https://*.vercel.app`
- `http://localhost:*` (development)

---

## Next Steps for Etap 5

### 1. API Testing ⏳
- [ ] Test all authentication endpoints
- [ ] Test all CRUD endpoints
- [ ] Test file upload/download
- [ ] Test payment flow
- [ ] Test external integrations

### 2. External Service Verification ⏳
- [ ] Verify France Travail API
- [ ] Verify ESCO API
- [ ] Verify OpenAI API
- [ ] Verify Stripe API
- [ ] Verify SendGrid API
- [ ] Verify Pennylane API
- [ ] Verify Wedof API

### 3. E2E Test Framework ⏳
- [ ] Choose framework (Playwright/Cypress)
- [ ] Set up test environment
- [ ] Write critical user flows
- [ ] Implement CI/CD integration

### 4. API Documentation ⏳
- [ ] Generate OpenAPI/Swagger spec
- [ ] Add endpoint descriptions
- [ ] Add request/response examples
- [ ] Deploy documentation

---

**Total Endpoints:** 100+ endpoints across 24 modules  
**Status:** Inventory complete, testing pending  
**Next:** Begin API endpoint testing

