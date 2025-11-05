# Railway Duplicate Backend Issue - Resolution Guide

## 🔍 Issue Identified

During Phase 6 deployment verification, we discovered that there are **TWO Railway configuration files** in the project, which is causing duplicate backend deployments:

1. **Root Configuration**: `/railway.json`
2. **Backend Configuration**: `/apps/backend/railway.json`

This creates confusion and potentially results in:
- Multiple backend instances running simultaneously
- Wasted resources and costs
- Unclear which backend is the "active" production instance
- Potential configuration conflicts

---

## 📋 Current Configuration Analysis

### Root `/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/backend && npm install && npm run build",
    "watchPatterns": ["apps/backend/**"]
  },
  "deploy": {
    "startCommand": "cd apps/backend && npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Characteristics:**
- ✅ Monorepo-aware (uses `cd apps/backend`)
- ✅ Watch patterns for backend directory
- ⚠️ **Does NOT run migrations** before starting
- ⚠️ Shorter health check timeout (100ms)

### Backend `/apps/backend/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run migrate && npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Characteristics:**
- ✅ Simpler build command (assumes already in correct directory)
- ✅ **Runs migrations before starting** (`npm run migrate && npm start`)
- ✅ Longer health check timeout (300ms) - better for database checks
- ⚠️ Requires Railway to be pointed at `apps/backend` subdirectory

---

## ✅ Recommended Solution

**Keep ONLY the root `/railway.json` and delete `/apps/backend/railway.json`**, but update it to include migrations:

### Step 1: Update Root Configuration

Modify `/railway.json` to include migrations:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/backend && npm install && npm run build",
    "watchPatterns": ["apps/backend/**"]
  },
  "deploy": {
    "startCommand": "cd apps/backend && npm run migrate && npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Changes made:**
1. ✅ Added `npm run migrate &&` to startCommand
2. ✅ Increased healthcheckTimeout from 100 to 300 (for database checks)
3. ✅ Kept monorepo-aware commands (`cd apps/backend`)
4. ✅ Kept watch patterns for automatic rebuilds

### Step 2: Delete Backend Configuration

```bash
# Delete the duplicate configuration
rm apps/backend/railway.json

# Commit the changes
git add railway.json apps/backend/railway.json
git commit -m "🔧 Fix Railway duplicate backend - consolidate to root config"
git push
```

---

## 🚀 How to Identify Active Backend on Railway

If you have multiple backend services running on Railway, follow these steps to identify which one is active:

### Option 1: Via Railway Dashboard

1. Go to https://railway.app/dashboard
2. Select your project
3. Look for services named similar to "backend" or "bilancompetence-backend"
4. Check which one has:
   - ✅ Recent deployments
   - ✅ Active status (green indicator)
   - ✅ Environment variables configured
   - ✅ Connected to Neon database

### Option 2: Via Railway CLI

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# List all services
railway status

# Check which service is linked to this directory
railway environment

# View service details
railway logs
```

### Option 3: Check Environment Variables

The active backend should have these critical environment variables set:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT authentication secret
- `FRONTEND_URL` - Frontend Vercel URL
- `NODE_ENV=production`
- `PORT=3001`

---

## 🗑️ How to Delete Duplicate Backend Service

### Via Railway Dashboard

1. Go to https://railway.app/dashboard
2. Select your project
3. Click on the **inactive/duplicate** backend service
4. Click "Settings" in the top right
5. Scroll to "Danger Zone"
6. Click "Delete Service"
7. Confirm deletion

### Via Railway CLI

```bash
# List all services
railway service list

# Delete a specific service (use the service ID from list)
railway service delete <service-id>
```

---

## ✅ Verification Steps

After fixing the duplicate backend issue:

1. **Verify Single Backend Instance**
   ```bash
   railway status
   # Should show only ONE backend service
   ```

2. **Check Health Endpoints**
   ```bash
   curl https://web-production-60dbd.up.railway.app/health
   curl https://web-production-60dbd.up.railway.app/health/detailed
   ```

3. **Verify Database Connectivity**
   ```bash
   curl https://web-production-60dbd.up.railway.app/health/ready
   # Should return: {"status":"ready"}
   ```

4. **Check Deployment Logs**
   ```bash
   railway logs
   # Look for successful migration messages and "Server running on port 3001"
   ```

5. **Run Full Deployment Verification**
   ```bash
   ./scripts/verify-deployment.sh
   ```

---

## 📊 Expected Outcome

After implementing this fix, you should have:

✅ **Single Railway Backend Service**
- Running at: `https://web-production-60dbd.up.railway.app`
- Using root `/railway.json` configuration
- Automatically runs migrations on deployment
- Proper health check timeout (300ms)

✅ **Clean Configuration**
- No duplicate railway.json files
- Clear monorepo structure
- Consistent deployment behavior

✅ **Reduced Costs**
- Only one backend instance running
- No wasted resources on duplicate deployments

---

## 🔗 Related Documentation

- [Railway Documentation](https://docs.railway.app/)
- [Monorepo Configuration](https://docs.railway.app/deploy/monorepo)
- [Health Checks](https://docs.railway.app/deploy/healthchecks)
- [Railway CLI Guide](https://docs.railway.app/develop/cli)

---

## 📝 Troubleshooting

### If health checks fail after consolidation:

1. **Check migration logs**:
   ```bash
   railway logs --filter "migration"
   ```

2. **Verify DATABASE_URL is set**:
   ```bash
   railway variables
   ```

3. **Manually run migrations** (if needed):
   ```bash
   railway run npm run migrate
   ```

4. **Restart the service**:
   ```bash
   railway restart
   ```

### If builds fail:

1. **Check build logs**:
   ```bash
   railway logs --filter "build"
   ```

2. **Verify dependencies**:
   - Ensure `package.json` is present in `apps/backend/`
   - Check that `npm run build` works locally

3. **Test locally with same commands**:
   ```bash
   cd apps/backend
   npm install
   npm run build
   npm run migrate
   npm start
   ```

---

## ⚠️ Important Notes

- **DO NOT delete the backend service that has the production DATABASE_URL configured**
- **Make sure to backup environment variables** before deleting any service
- **Test in a staging environment first** if available
- **Monitor logs during the transition** to catch any issues early

---

**Last Updated**: Phase 6 - Production Deployment Readiness
**Status**: ⚠️ Action Required - Duplicate backend services detected
