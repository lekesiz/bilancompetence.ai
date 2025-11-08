# Security Notes - Post-Audit Actions Required

## ⚠️ CRITICAL: API Keys Rotation Required

The following API keys found in `.env.local` files need to be rotated before production deployment:

### Backend (.env.local)
- **JWT_SECRET**: Current value is weak ("your-secret-key-change-this"). Generate new 256-bit secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- **GEMINI_API_KEY**: Rotate at https://makersuite.google.com/app/apikey
- **OPENAI_API_KEY**: Rotate at https://platform.openai.com/api-keys
- **ANTHROPIC_API_KEY**: Rotate at https://console.anthropic.com/settings/keys
- **RESEND_API_KEY**: Rotate at https://resend.com/api-keys
- **STRIPE_SECRET_KEY**: Rotate at https://dashboard.stripe.com/apikeys

### Frontend (.env.local)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Rotate in Supabase dashboard

### Database Connection
- **NEON_DATABASE_URL**: Contains password in connection string - ensure it's never committed
- **DIRECT_URL**: Same as above

## ✅ Completed Security Fixes

1. **Railway Deployment**: Removed Artillery dependency (unix-dgram/Python issue)
2. **API Endpoints**: Fixed /wizard/save-step mismatch
3. **RLS Policies**: Fixed column name mismatch (beneficiary_id)
4. **Rate Limiting**: Updated auth limiter to production-safe 5 req/15min
5. **Logging**: Replaced 180+ console.log with Winston logger

## 📋 Remaining Security Tasks

1. Rotate all API keys listed above
2. Update JWT_SECRET in production environment
3. Enable RLS on assessment_drafts, cv_analyses, files tables
4. Add account lockout mechanism (5 failed logins = 30min lockout)
5. Implement CSRF token validation for state-changing operations
6. Add indexes for performance (beneficiary_id, consultant_id, status, created_at)

## 🚀 Before Production Deployment

- [ ] All API keys rotated
- [ ] Strong JWT_SECRET generated (256-bit)
- [ ] Environment variables set in Railway/Vercel
- [ ] RLS policies re-run on production database
- [ ] Rate limiting tested and confirmed working
- [ ] Logging tested in production environment
- [ ] Database migrations applied successfully

---

Generated: 2025-11-08
Last Updated: 2025-11-08
