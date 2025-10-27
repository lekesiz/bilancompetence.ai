# BilanCompetence.AI - Operations Runbook

**Version:** 1.0.0  
**Last Updated:** 2025-10-27  
**Maintained By:** Development Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Deployment](#deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Operations](#database-operations)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)
9. [Incident Response](#incident-response)
10. [Maintenance Procedures](#maintenance-procedures)

---

## System Overview

### Production URLs
- **Frontend:** https://app.bilancompetence.ai
- **Backend API:** https://web-production-60dbd.up.railway.app
- **Database:** Neon PostgreSQL (Serverless)

### Tech Stack
- **Backend:** Node.js 18+ / Express.js / TypeScript
- **Frontend:** Next.js 14 / React / Tailwind CSS
- **Database:** Neon PostgreSQL (primary), Supabase (legacy - being phased out)
- **Hosting:** Railway (backend), Vercel (frontend)
- **Package Manager:** pnpm

### Key Services
- Authentication & Authorization (JWT)
- User Management
- Assessment Wizard
- Dashboard & Analytics
- File Upload & Management
- PDF Generation
- Email Notifications (SendGrid)
- Job Recommendations (France Travail API)

---

## Architecture

### Monorepo Structure
```
bilancompetence.ai/
├── apps/
│   ├── backend/          # Express.js API server
│   └── frontend/         # Next.js web application
├── packages/             # Shared packages
├── migrations/           # Database migrations
└── docs/                 # Documentation
```

### Backend Services
```
src/
├── routes/              # API route handlers (34 files)
├── services/            # Business logic layer (35 services)
│   ├── *ServiceNeon.ts  # Neon PostgreSQL services (12 services)
│   └── *Service.ts      # Legacy Supabase services (15 services)
├── middleware/          # Express middleware
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

### Database Architecture
- **Primary:** Neon PostgreSQL (serverless, auto-scaling)
- **Legacy:** Supabase PostgreSQL (being migrated)
- **Migrations:** 32 SQL migration files in `/backend/migrations/`

---

## Deployment

### Backend (Railway)

#### Initial Deployment
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Link to project
railway link

# 4. Deploy
railway up
```

#### Environment Variables (Railway)
Set these in Railway dashboard or via CLI:
```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret"
railway variables set SENDGRID_API_KEY="your-key"
# ... (see .env.example for full list)
```

#### Deployment Commands
```bash
# Deploy backend
cd apps/backend
pnpm install
pnpm run build
railway up

# View logs
railway logs

# Check status
railway status
```

### Frontend (Vercel)

#### Initial Deployment
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
cd apps/frontend
vercel --prod
```

#### Environment Variables (Vercel)
Set these in Vercel dashboard:
```bash
NEXT_PUBLIC_API_URL=https://web-production-60dbd.up.railway.app/api
NEXT_PUBLIC_APP_NAME=BilanCompetence
# ... (see frontend .env.example)
```

### Database (Neon)

#### Connection
```bash
# Get connection string from Neon dashboard
# Format: postgresql://user:pass@host/db?sslmode=require

# Test connection
psql "postgresql://user:pass@host/db?sslmode=require"
```

#### Run Migrations
```bash
cd apps/backend

# Run all pending migrations
pnpm run migrate

# Rollback last migration
pnpm run migrate:rollback

# Create new migration
pnpm run migrate:create migration_name
```

---

## Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Critical - Must be set
DATABASE_URL=postgresql://...           # Neon PostgreSQL connection
JWT_SECRET=random-64-char-string        # JWT signing key
SENDGRID_API_KEY=SG.xxx                # Email service
CORS_ORIGIN=https://app.bilancompetence.ai

# Important - Should be set
GEMINI_API_KEY=xxx                     # AI features
FRANCE_TRAVAIL_API_KEY=xxx             # Job recommendations
SENTRY_DSN=xxx                         # Error tracking

# Optional - Can use defaults
LOG_LEVEL=info
RATE_LIMIT_GENERAL=100
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://web-production-60dbd.up.railway.app/api
NEXT_PUBLIC_APP_NAME=BilanCompetence
```

### Configuration Files
- `apps/backend/.env` - Backend environment variables (DO NOT COMMIT)
- `apps/backend/.env.example` - Template with all variables
- `apps/frontend/.env.local` - Frontend environment variables (DO NOT COMMIT)

---

## Database Operations

### Connection Management

#### Using psql
```bash
# Connect to production database
psql "$DATABASE_URL"

# Connect to specific database
psql "postgresql://user:pass@host/dbname?sslmode=require"
```

#### Using Node.js
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### Common Queries

#### Check Database Health
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check recent activity
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

#### User Management
```sql
-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Find user by email
SELECT id, email, role, created_at FROM users WHERE email = 'user@example.com';

-- Check user's assessments
SELECT * FROM assessments WHERE beneficiary_id = 'user-id';
```

### Migrations

#### Run Migrations
```bash
# Run all pending migrations
cd apps/backend
pnpm run migrate

# Check migration status
pnpm run migrate:status
```

#### Create New Migration
```bash
# Create migration file
pnpm run migrate:create add_new_table

# Edit the generated file in migrations/
# migrations/YYYYMMDDHHMMSS_add_new_table.sql

# Run the migration
pnpm run migrate
```

#### Rollback Migration
```bash
# Rollback last migration
pnpm run migrate:rollback

# Rollback to specific version
pnpm run migrate:rollback --to=20231201120000
```

---

## Monitoring & Health Checks

### Health Check Endpoints

#### Backend Health
```bash
# Check backend health
curl https://web-production-60dbd.up.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-27T13:43:50.670Z",
  "uptime": 6850.291033649
}
```

#### Frontend Health
```bash
# Check frontend
curl -I https://app.bilancompetence.ai

# Expected: HTTP 200 OK
```

#### Database Health
```bash
# Check database connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Expected: Returns 1
```

### Monitoring Tools

#### Railway Dashboard
- URL: https://railway.app/dashboard
- View: Logs, metrics, deployments, environment variables
- Metrics: CPU, Memory, Network, Response times

#### Vercel Dashboard
- URL: https://vercel.com/dashboard
- View: Deployments, analytics, logs, performance
- Metrics: Page views, response times, errors

#### Neon Dashboard
- URL: https://console.neon.tech/
- View: Database metrics, connections, storage
- Metrics: Query performance, connection count, storage usage

### Log Management

#### Backend Logs (Railway)
```bash
# View real-time logs
railway logs --tail

# View last 100 lines
railway logs --lines 100

# Filter by level
railway logs | grep ERROR
```

#### Frontend Logs (Vercel)
```bash
# View logs via CLI
vercel logs

# View in dashboard
# https://vercel.com/your-project/logs
```

### Alerts & Notifications

#### Set Up Alerts
1. **Railway:** Configure webhooks in project settings
2. **Vercel:** Set up integrations (Slack, Discord, etc.)
3. **Sentry:** Configure error alerts and thresholds
4. **Uptime Monitoring:** Use UptimeRobot or similar

#### Critical Alerts
- API response time > 5s
- Error rate > 1%
- Database connections > 80% of limit
- Disk usage > 85%
- Failed deployments

---

## Backup & Recovery

### Database Backups

#### Automated Backups (Neon)
- Neon provides automatic backups
- Retention: 7 days (free tier), 30 days (paid)
- Access via Neon dashboard

#### Manual Backup
```bash
# Backup entire database
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
pg_dump "$DATABASE_URL" -t users -t assessments > backup_tables.sql

# Backup with compression
pg_dump "$DATABASE_URL" | gzip > backup.sql.gz
```

#### Restore from Backup
```bash
# Restore full backup
psql "$DATABASE_URL" < backup_20251027.sql

# Restore compressed backup
gunzip -c backup.sql.gz | psql "$DATABASE_URL"

# Restore specific table
pg_restore -t users backup.sql
```

### Application Backups

#### Code Backups
- **Git Repository:** GitHub (primary backup)
- **Frequency:** Continuous (every commit)
- **Retention:** Unlimited

#### File Storage Backups
- **Location:** S3-compatible storage
- **Frequency:** Daily (if configured)
- **Retention:** 30 days

### Disaster Recovery

#### Recovery Time Objective (RTO)
- **Target:** < 1 hour
- **Critical Services:** < 15 minutes

#### Recovery Point Objective (RPO)
- **Target:** < 1 hour
- **Database:** Point-in-time recovery available

#### Recovery Procedures

**Scenario 1: Backend Service Down**
```bash
# 1. Check Railway status
railway status

# 2. View logs for errors
railway logs --tail

# 3. Redeploy if needed
railway up

# 4. Verify health
curl https://web-production-60dbd.up.railway.app/health
```

**Scenario 2: Database Corruption**
```bash
# 1. Identify issue
psql "$DATABASE_URL" -c "SELECT version();"

# 2. Restore from backup (Neon dashboard)
# Navigate to: Backups > Select backup > Restore

# 3. Verify data integrity
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# 4. Run migrations if needed
cd apps/backend && pnpm run migrate
```

**Scenario 3: Complete System Failure**
```bash
# 1. Deploy backend to new Railway project
railway init
railway link
railway up

# 2. Restore database to new Neon instance
# Create new Neon project
# Restore from backup
# Update DATABASE_URL in Railway

# 3. Deploy frontend to Vercel
cd apps/frontend
vercel --prod

# 4. Update DNS if needed
# Point app.bilancompetence.ai to new Vercel deployment
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Backend Not Responding
**Symptoms:** Health check fails, API returns 502/503

**Diagnosis:**
```bash
# Check Railway status
railway status

# Check logs
railway logs --tail | grep ERROR

# Check database connection
psql "$DATABASE_URL" -c "SELECT 1;"
```

**Solutions:**
1. Restart service: `railway restart`
2. Check environment variables: `railway variables`
3. Verify DATABASE_URL is correct
4. Check Neon database is not paused

---

#### Issue 2: Database Connection Errors
**Symptoms:** "Connection refused", "Too many connections"

**Diagnosis:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection limit
SHOW max_connections;
```

**Solutions:**
1. Reduce DB_POOL_MAX in environment variables
2. Check for connection leaks in code
3. Restart backend to clear connections
4. Upgrade Neon plan if needed

---

#### Issue 3: Authentication Failures
**Symptoms:** "Invalid token", "Unauthorized"

**Diagnosis:**
```bash
# Check JWT_SECRET is set
railway variables | grep JWT_SECRET

# Test login endpoint
curl -X POST https://web-production-60dbd.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Solutions:**
1. Verify JWT_SECRET matches between deployments
2. Check token expiry settings
3. Clear browser cookies/localStorage
4. Verify user exists in database

---

#### Issue 4: Email Not Sending
**Symptoms:** Verification emails not received

**Diagnosis:**
```bash
# Check SendGrid API key
railway variables | grep SENDGRID

# Check logs for email errors
railway logs | grep -i email
```

**Solutions:**
1. Verify SENDGRID_API_KEY is valid
2. Check SendGrid dashboard for blocked emails
3. Verify sender email is verified in SendGrid
4. Check email is not in spam folder

---

#### Issue 5: File Upload Failures
**Symptoms:** "Upload failed", 413 errors

**Diagnosis:**
```bash
# Check storage configuration
railway variables | grep STORAGE

# Check file size limits
railway variables | grep MAX_FILE_SIZE
```

**Solutions:**
1. Verify STORAGE_URL and credentials
2. Increase STORAGE_MAX_FILE_SIZE if needed
3. Check storage bucket permissions
4. Verify file type is allowed

---

### Debug Mode

#### Enable Debug Logging
```bash
# Set in Railway
railway variables set LOG_LEVEL=debug
railway variables set DEBUG=true

# Restart service
railway restart

# View detailed logs
railway logs --tail
```

#### Disable Debug Logging
```bash
railway variables set LOG_LEVEL=info
railway variables set DEBUG=false
railway restart
```

---

## Incident Response

### Severity Levels

#### SEV1 - Critical
- **Impact:** Complete service outage
- **Response Time:** Immediate (< 15 minutes)
- **Examples:** Backend down, database unavailable, data loss

#### SEV2 - High
- **Impact:** Major feature unavailable
- **Response Time:** < 1 hour
- **Examples:** Authentication broken, file uploads failing

#### SEV3 - Medium
- **Impact:** Minor feature degraded
- **Response Time:** < 4 hours
- **Examples:** Slow response times, email delays

#### SEV4 - Low
- **Impact:** Cosmetic issues
- **Response Time:** < 24 hours
- **Examples:** UI glitches, minor bugs

### Incident Response Process

1. **Detect:** Monitoring alerts, user reports, health checks
2. **Assess:** Determine severity and impact
3. **Respond:** Follow runbook procedures
4. **Communicate:** Update status page, notify stakeholders
5. **Resolve:** Implement fix and verify
6. **Document:** Create incident report
7. **Review:** Post-mortem and preventive measures

### Escalation Path

1. **On-Call Engineer:** First responder
2. **Tech Lead:** If not resolved in 30 minutes
3. **CTO:** If SEV1 and not resolved in 1 hour

---

## Maintenance Procedures

### Scheduled Maintenance

#### Database Maintenance
```bash
# Run VACUUM to reclaim storage
psql "$DATABASE_URL" -c "VACUUM ANALYZE;"

# Update statistics
psql "$DATABASE_URL" -c "ANALYZE;"

# Check for bloat
psql "$DATABASE_URL" -c "
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"
```

#### Dependency Updates
```bash
# Update backend dependencies
cd apps/backend
pnpm update --latest

# Update frontend dependencies
cd apps/frontend
pnpm update --latest

# Run tests
pnpm test

# Deploy if tests pass
railway up
```

#### Log Rotation
```bash
# Clean old logs (if storing locally)
find ./logs -name "*.log" -mtime +30 -delete

# Archive logs
tar -czf logs_$(date +%Y%m%d).tar.gz ./logs/*.log
```

### Performance Optimization

#### Database Optimization
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_assessments_beneficiary ON assessments(beneficiary_id);
```

#### API Optimization
```bash
# Enable caching
railway variables set CACHE_ENABLED=true
railway variables set CACHE_TTL=3600

# Adjust rate limits
railway variables set RATE_LIMIT_GENERAL=200
```

---

## Security Procedures

### Security Checklist

- [ ] All environment variables are set securely
- [ ] JWT_SECRET is rotated every 90 days
- [ ] Database backups are encrypted
- [ ] SSL/TLS is enforced for all connections
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Dependencies are up to date
- [ ] Security headers are enabled (Helmet)
- [ ] Audit logs are enabled and monitored

### Security Incident Response

1. **Identify:** Detect security breach or vulnerability
2. **Contain:** Isolate affected systems
3. **Eradicate:** Remove threat and patch vulnerability
4. **Recover:** Restore services and verify integrity
5. **Lessons Learned:** Document and improve security

---

## Contact Information

### Support Channels
- **Email:** support@bilancompetence.ai
- **Emergency:** [Phone number]
- **Status Page:** [URL if available]

### Key Personnel
- **Tech Lead:** [Name]
- **DevOps:** [Name]
- **On-Call:** [Rotation schedule]

---

## Appendix

### Useful Commands

```bash
# Quick health check
curl https://web-production-60dbd.up.railway.app/health

# Check all services
./scripts/health-check.sh

# Run smoke tests
cd apps/backend && ./smoke-test.sh

# Deploy backend
cd apps/backend && railway up

# Deploy frontend
cd apps/frontend && vercel --prod

# Database backup
pg_dump "$DATABASE_URL" > backup.sql

# View logs
railway logs --tail
vercel logs
```

### External Resources
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Express.js Docs:** https://expressjs.com/
- **Next.js Docs:** https://nextjs.org/docs

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-27  
**Next Review:** 2025-11-27

