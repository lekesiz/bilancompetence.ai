# 🚨 Sentry Error Tracking - Setup Guide

**Date:** November 4, 2025
**Status:** ✅ Implementation Complete
**Activation Required:** Environment variables needed

---

## 📋 Overview

Sentry error tracking has been fully integrated into both backend and frontend. This guide shows how to activate it.

---

## 🔑 1. Get Sentry DSN

### Create Sentry Projects

1. **Go to:** https://sentry.io
2. **Sign up / Login**
3. **Create two projects:**
   - **Frontend:** `bilancompetence-frontend` (Next.js)
   - **Backend:** `bilancompetence-backend` (Node.js/Express)

### Copy DSN Keys

For each project, go to **Settings > Client Keys (DSN)** and copy the DSN.

Example DSN format:
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

---

## ⚙️ 2. Configure Environment Variables

### Backend (.env)

Add to `apps/backend/.env`:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-backend-dsn@o123456.ingest.sentry.io/789012
SENTRY_ENVIRONMENT=production  # or development, staging
```

### Frontend (.env.local)

Add to `apps/frontend/.env.local`:

```bash
# Sentry Error Tracking (Public)
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@o123456.ingest.sentry.io/789013
SENTRY_DSN=https://your-frontend-dsn@o123456.ingest.sentry.io/789013

# Sentry Organization & Project (for source maps upload)
SENTRY_ORG=bilancompetence
SENTRY_PROJECT=frontend
SENTRY_AUTH_TOKEN=your-auth-token-here  # Optional, for source maps
```

### Production (Vercel)

Add environment variables in Vercel dashboard:

```
NEXT_PUBLIC_SENTRY_DSN = https://your-frontend-dsn...
SENTRY_DSN = https://your-frontend-dsn...
SENTRY_ORG = bilancompetence
SENTRY_PROJECT = frontend
SENTRY_AUTH_TOKEN = sntrys_abc123...
```

### Production (Railway)

Add environment variables in Railway dashboard:

```
SENTRY_DSN = https://your-backend-dsn...
SENTRY_ENVIRONMENT = production
```

---

## 🧪 3. Test Sentry Integration

### Test Backend Error Tracking

```bash
# Start backend
cd apps/backend
npm run dev

# Test error endpoint (create this for testing):
curl http://localhost:3001/api/test/sentry-error
```

Create test route in `apps/backend/src/routes/health.ts`:

```typescript
router.get('/test/sentry-error', (req, res) => {
  throw new Error('Test Sentry error from backend!');
});
```

### Test Frontend Error Tracking

Add a test button in your app:

```tsx
// apps/frontend/app/[locale]/page.tsx
<button onClick={() => {
  throw new Error('Test Sentry error from frontend!');
}}>
  Test Sentry
</button>
```

### Verify in Sentry Dashboard

1. Go to https://sentry.io
2. Navigate to your project
3. Check **Issues** tab
4. You should see the test errors appear within seconds

---

## 📊 4. What's Being Tracked

### Backend (Express)

✅ **Automatic:**
- Unhandled exceptions
- Unhandled promise rejections
- HTTP request tracing
- Express middleware errors
- 500+ status code errors

✅ **Manual:**
- Custom error captures via `Sentry.captureException()`
- Performance monitoring
- Database query slow queries

### Frontend (Next.js)

✅ **Automatic:**
- Unhandled exceptions
- Unhandled promise rejections
- React component errors (via ErrorBoundary)
- API call errors
- Navigation errors

✅ **Manual:**
- Custom error captures via `captureApiError()`
- Custom component errors via `captureComponentError()`
- User tracking via `setSentryUser()`
- Breadcrumbs via `addSentryBreadcrumb()`

---

## 📈 5. Performance Monitoring

### Sample Rates (Configured)

**Development:**
- Traces: 100% (all requests tracked)
- Profiles: 100%

**Production:**
- Traces: 10% (to reduce costs)
- Profiles: 10%
- Session Replay: 10%

### Adjust Sample Rates

Edit `apps/backend/src/config/sentry.ts`:

```typescript
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

Edit `apps/frontend/sentry.server.config.ts`:

```typescript
tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
```

---

## 🔒 6. Security & Privacy

### Data Filtering

✅ **Automatically filtered:**
- Authentication tokens (Authorization headers)
- Cookies
- Passwords

✅ **Session Replay:**
- All text is masked (`maskAllText: true`)
- All media is blocked (`blockAllMedia: true`)

### User Privacy

User information sent to Sentry:
- User ID (UUID)
- User email (optional)
- Organization ID

**NO sensitive data** like passwords, tokens, or personal information is sent.

---

## 🎯 7. Integration Points

### Files Created/Modified

**Frontend:**
```
✅ sentry.client.config.ts (activated)
✅ sentry.server.config.ts (created)
✅ sentry.edge.config.ts (created)
✅ instrumentation.ts (created)
✅ next.config.js (Sentry webpack plugin added)
✅ components/ErrorBoundary.tsx (Sentry integration added)
```

**Backend:**
```
✅ src/config/sentry.ts (already existed)
✅ src/index.ts (middleware added)
```

---

## 📚 8. Usage Examples

### Capture Custom Error (Backend)

```typescript
import { Sentry } from './config/sentry.js';

try {
  await dangerousOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'dangerous_operation' },
    extra: { userId: user.id },
  });
  throw error;
}
```

### Capture API Error (Frontend)

```typescript
import { captureApiError } from '@/sentry.client.config';

try {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('API error');
} catch (error) {
  captureApiError(error, {
    endpoint: '/api/users',
    method: 'GET',
    statusCode: 500,
  });
}
```

### Set User Context (Frontend)

```typescript
import { setSentryUser } from '@/sentry.client.config';

// On login
setSentryUser(user.id, user.email, user.organizationId);

// On logout
import { clearSentryUser } from '@/sentry.client.config';
clearSentryUser();
```

---

## 🚀 9. Deployment Checklist

### Before Production Deploy

- [ ] Create Sentry projects (frontend + backend)
- [ ] Get DSN keys from Sentry dashboard
- [ ] Add `SENTRY_DSN` to backend env vars (Railway)
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to frontend env vars (Vercel)
- [ ] (Optional) Add `SENTRY_AUTH_TOKEN` for source maps upload
- [ ] Test error tracking in staging
- [ ] Verify errors appear in Sentry dashboard
- [ ] Set up Sentry alerts and notifications
- [ ] Configure sample rates for production

### After Production Deploy

- [ ] Monitor Sentry dashboard for first 24 hours
- [ ] Set up alert rules in Sentry
- [ ] Configure Slack/email notifications
- [ ] Review and adjust sample rates based on volume
- [ ] Set up performance budgets

---

## 💰 10. Cost Optimization

### Free Tier Limits (Sentry)

- **5,000 errors/month** (free)
- **10,000 performance units/month** (free)

### Tips to Stay Under Limits

1. **Use sampling** (10% in production)
2. **Filter non-critical errors** (404s, auth failures)
3. **Rate limit** error captures per user
4. **Deduplicate** similar errors
5. **Use separate projects** for staging/production

---

## 📞 11. Support

### Sentry Documentation
- https://docs.sentry.io/platforms/javascript/guides/nextjs/
- https://docs.sentry.io/platforms/node/guides/express/

### Troubleshooting

**Errors not appearing in Sentry?**
1. Check `SENTRY_DSN` is set correctly
2. Verify environment variables are loaded
3. Check console for Sentry initialization logs
4. Ensure you're testing in correct environment

**Too many errors being sent?**
1. Increase sample rate filters
2. Add `beforeSend` filters
3. Ignore specific error types
4. Set up error rate limiting

---

## ✅ Status

| Component | Status | DSN Required |
|-----------|--------|--------------|
| Backend Integration | ✅ Complete | Yes (SENTRY_DSN) |
| Frontend Client | ✅ Complete | Yes (NEXT_PUBLIC_SENTRY_DSN) |
| Frontend Server | ✅ Complete | Yes (SENTRY_DSN) |
| Frontend Edge | ✅ Complete | Yes (SENTRY_DSN) |
| ErrorBoundary | ✅ Complete | No (uses client config) |
| Webpack Plugin | ✅ Complete | Optional (SENTRY_AUTH_TOKEN) |
| Documentation | ✅ Complete | N/A |

**Next Step:** Add environment variables and test! 🚀

---

**Last Updated:** November 4, 2025
**Author:** AI Development Assistant
**Version:** 1.0.0
