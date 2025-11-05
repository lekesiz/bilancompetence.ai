# 🚀 Production Deployment Checklist - BilanCompetence.AI

This comprehensive checklist ensures all aspects of the application are verified before and after deployment to production.

---

## 📋 Pre-Deployment Checklist

### 1. Code Quality & Testing

- [ ] All TypeScript compilation errors resolved (`npm run type-check`)
- [ ] All ESLint warnings addressed (`npm run lint`)
- [ ] Code formatted with Prettier (`npm run format`)
- [ ] Unit tests passing (`npm test`)
- [ ] Integration tests passing (if applicable)
- [ ] No console.log statements in production code
- [ ] All TODOs and FIXMEs resolved or documented

### 2. Security Audit

- [ ] **No exposed secrets or API keys in code**
  ```bash
  # Check for potential secrets
  grep -r "sk-" apps/
  grep -r "api.*key" apps/ --include="*.ts" --include="*.tsx"
  grep -r "SECRET" apps/ --include="*.ts" --include="*.tsx"
  ```
- [ ] JWT_SECRET is set to strong random value (64+ characters)
- [ ] All tokens rotated if previously exposed
- [ ] SSL/TLS enabled for all connections (rejectUnauthorized: true)
- [ ] CORS configured correctly (no wildcards in production)
- [ ] Rate limiting configured and tested
- [ ] Input sanitization enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled (Helmet middleware)
- [ ] CSRF tokens implemented where needed
- [ ] Authentication endpoints secured
- [ ] Admin endpoints require authentication + authorization
- [ ] File upload size limits configured
- [ ] Allowed file types whitelisted

### 3. Environment Variables

#### Backend (.env)

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DATABASE_URL` (Neon PostgreSQL with SSL)
- [ ] `JWT_SECRET` (64+ char random string)
- [ ] `JWT_ACCESS_TOKEN_EXPIRY=15m`
- [ ] `JWT_REFRESH_TOKEN_EXPIRY=7d`
- [ ] `CORS_ORIGIN` (production URLs only)
- [ ] `FRONTEND_URL` (production Vercel URL)
- [ ] `SENDGRID_API_KEY` (or email service key)
- [ ] `GEMINI_API_KEY` (for AI features)
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `HEALTH_CHECK_ENABLED=true`

#### Frontend (.env.local)

- [ ] `NEXT_PUBLIC_API_URL=/api` (or backend URL)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (production Vercel URL)

### 4. Database

- [ ] Database migrations tested locally
- [ ] Database migrations tested in staging
- [ ] Backup of production database created
- [ ] Database connection pooling configured
- [ ] Database indexes optimized
- [ ] Database query performance verified
- [ ] SSL connection to database enabled
- [ ] Database credentials secured in environment variables

### 5. Performance

- [ ] Bundle size analyzed (`npm run analyze` if available)
- [ ] Large dependencies reviewed
- [ ] Images optimized (WebP, compression)
- [ ] Lazy loading implemented for heavy components
- [ ] Code splitting configured (dynamic imports)
- [ ] API response times < 500ms for critical endpoints
- [ ] Database queries optimized (no N+1 queries)
- [ ] CDN configured for static assets (if applicable)
- [ ] Caching headers configured

### 6. Accessibility (WCAG 2.1 AA)

- [ ] Skip-to-main-content link implemented
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible (not disabled)
- [ ] ARIA labels on all important elements
- [ ] Color contrast meets WCAG AA (4.5:1 ratio)
- [ ] Form validation accessible (aria-invalid, role="alert")
- [ ] Images have alt text
- [ ] Semantic HTML used (header, nav, main, footer)
- [ ] Screen reader tested (NVDA, VoiceOver)
- [ ] Reduced motion support (@prefers-reduced-motion)

### 7. Error Handling & Monitoring

- [ ] Global error boundary implemented (React)
- [ ] API error responses standardized
- [ ] Sentry configured and tested
- [ ] Error logs properly formatted
- [ ] Sensitive data excluded from error logs
- [ ] 404 pages implemented
- [ ] 500 error pages implemented
- [ ] Health check endpoints working (`/health`, `/health/detailed`)

---

## 🚀 Deployment Process

### Step 1: Final Code Review

```bash
# Ensure working tree is clean
git status

# Pull latest from main branch
git pull origin main

# Review all changes since last deployment
git log --oneline -20

# Check for any uncommitted changes
git diff
```

### Step 2: Build & Test Locally

```bash
# Backend
cd apps/backend
npm install
npm run build
npm run type-check
npm run lint
npm test

# Frontend
cd ../frontend
npm install
npm run build
npm run lint

# Return to root
cd ../..
```

### Step 3: Deploy Backend (Railway)

```bash
# Option 1: Via Git Push (if Railway auto-deploy enabled)
git push origin main

# Option 2: Via Railway CLI
railway up

# Option 3: Via Railway Dashboard
# Go to Railway dashboard and click "Deploy"
```

**Expected Railway Deployment Process:**
1. Railway detects push to main branch
2. Runs build command: `cd apps/backend && npm install && npm run build`
3. Runs start command: `cd apps/backend && npm run migrate && npm start`
4. Health check succeeds at `/health` within 300ms
5. Service marked as "Active"

### Step 4: Deploy Frontend (Vercel)

```bash
# Option 1: Via Git Push (if Vercel auto-deploy enabled)
git push origin main

# Option 2: Via Vercel CLI
vercel --prod

# Option 3: Via Vercel Dashboard
# Go to Vercel dashboard and click "Deploy"
```

**Expected Vercel Deployment Process:**
1. Vercel detects push to main branch
2. Installs dependencies
3. Runs build: `next build`
4. Deploys to production URL
5. Auto-invalidates CDN cache

### Step 5: Verify Deployment

Run the automated verification script:

```bash
./scripts/verify-deployment.sh
```

---

## ✅ Post-Deployment Verification

### 1. Health Checks

```bash
# Basic health
curl https://web-production-60dbd.up.railway.app/health

# Detailed health (includes database)
curl https://web-production-60dbd.up.railway.app/health/detailed

# Readiness probe
curl https://web-production-60dbd.up.railway.app/health/ready

# Liveness probe
curl https://web-production-60dbd.up.railway.app/health/live
```

**Expected Responses:**

✅ `/health`:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T17:45:52.123Z",
  "uptime": 3600.5
}
```

✅ `/health/detailed`:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T17:45:52.123Z",
  "uptime": 3600.5,
  "version": "0.0.1",
  "environment": "production",
  "database": {
    "status": "connected",
    "responseTime": 45
  },
  "memory": {
    "used": 128.5,
    "total": 512.0,
    "percentage": 25.1
  }
}
```

### 2. Frontend Verification

- [ ] Frontend loads at production URL
- [ ] No console errors in browser
- [ ] Authentication flow works (login/logout)
- [ ] Protected routes redirect to login
- [ ] API calls to backend succeed
- [ ] Dark mode toggle works
- [ ] Language switcher works (FR/EN)
- [ ] Mobile responsive layout verified
- [ ] Forms submit successfully
- [ ] File uploads work (if applicable)

### 3. Backend API Verification

```bash
# Check API version
curl https://web-production-60dbd.up.railway.app/api/version

# Test authentication endpoint (should fail without credentials)
curl -X POST https://web-production-60dbd.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

### 4. Database Verification

- [ ] Database migrations applied successfully
- [ ] Database connection stable (check `/health/ready`)
- [ ] Sample queries execute successfully
- [ ] No N+1 query issues
- [ ] Connection pool not exhausted

### 5. Error Monitoring

- [ ] Sentry receiving events
- [ ] Error logs captured correctly
- [ ] No critical errors in last 24 hours
- [ ] Alert notifications configured

### 6. Performance Verification

```bash
# Use Lighthouse for frontend
npx lighthouse https://bilancompetence-lekesizs-projects.vercel.app --view

# Check backend response times
curl -w "@curl-format.txt" -o /dev/null -s https://web-production-60dbd.up.railway.app/health
```

**Performance Targets:**
- Frontend Lighthouse Score: 90+ (all categories)
- Backend API response time: < 200ms (health checks)
- Backend API response time: < 500ms (authenticated endpoints)
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s

### 7. Security Verification

```bash
# Check security headers
curl -I https://web-production-60dbd.up.railway.app/health

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
```

- [ ] HTTPS enforced (no HTTP)
- [ ] Security headers present
- [ ] No exposed secrets in responses
- [ ] CORS properly restricting origins
- [ ] Rate limiting active

### 8. User Acceptance Testing (UAT)

- [ ] Admin can login
- [ ] Consultant can login
- [ ] Beneficiary can login
- [ ] Create new assessment works
- [ ] Update assessment works
- [ ] Delete assessment works (if applicable)
- [ ] File upload works
- [ ] AI recommendations work
- [ ] Chat functionality works
- [ ] Email notifications sent
- [ ] Export functionality works
- [ ] Scheduling functionality works

---

## 🔄 Rollback Plan

If deployment fails or critical issues discovered:

### Immediate Actions

1. **Check health endpoints**:
   ```bash
   ./scripts/verify-deployment.sh
   ```

2. **Review error logs**:
   ```bash
   railway logs --tail 100
   ```

3. **Check Sentry for errors**:
   - Go to Sentry dashboard
   - Check last 1 hour for errors

### Rollback Backend (Railway)

```bash
# Option 1: Via Railway CLI
railway rollback

# Option 2: Via Railway Dashboard
# Go to deployment history and click "Rollback" on previous version

# Option 3: Git revert and redeploy
git revert HEAD
git push origin main
```

### Rollback Frontend (Vercel)

```bash
# Option 1: Via Vercel Dashboard
# Go to deployments and promote previous deployment to production

# Option 2: Via Vercel CLI
vercel rollback

# Option 3: Git revert and redeploy
git revert HEAD
git push origin main
```

### Database Rollback

```bash
# If migrations need to be rolled back
cd apps/backend
npm run migrate:rollback

# Restore from backup (if data corrupted)
# Contact Neon support or use backup restoration tool
```

---

## 📊 Success Criteria

Deployment is considered successful when:

✅ **Health Checks**
- All 4 health endpoints return 200 OK
- Database status: "connected"
- Environment: "production"

✅ **Frontend**
- Lighthouse score: 90+ (Performance, Accessibility, Best Practices, SEO)
- No console errors
- All user flows working

✅ **Backend**
- API response times < 500ms
- No 500 errors
- Database queries optimized

✅ **Security**
- All security headers present
- HTTPS enforced
- No exposed secrets

✅ **Monitoring**
- Sentry receiving events
- No critical errors in last 1 hour
- Logs properly formatted

---

## 📞 Support & Escalation

### If deployment fails:

1. **Check logs first**:
   ```bash
   railway logs
   vercel logs
   ```

2. **Review this checklist** - did you miss any steps?

3. **Check documentation**:
   - `docs/RAILWAY_DUPLICATE_BACKEND_FIX.md`
   - `docs/PHASE_6_DEPLOYMENT_REPORT.md`

4. **Rollback if critical** (see Rollback Plan above)

5. **Contact support**:
   - Railway: https://railway.app/help
   - Vercel: https://vercel.com/support
   - Neon: https://neon.tech/docs/introduction/support

---

## 📝 Post-Deployment Tasks

- [ ] Document deployment in changelog
- [ ] Update version number in package.json
- [ ] Create git tag for release (`git tag v0.0.1`)
- [ ] Notify team of successful deployment
- [ ] Monitor error rates for next 24 hours
- [ ] Update documentation with any new features
- [ ] Schedule post-deployment review meeting

---

**Last Updated**: Phase 6 - Production Deployment Readiness
**Status**: Ready for Production Deployment
**Version**: 0.0.1
