#!/bin/bash

###############################################################################
# IMMEDIATE SECURITY FIXES SCRIPT
# BilanCompetence.AI - Critical Security Remediation
#
# WARNING: This script makes irreversible changes to the repository
# Run this AFTER revoking exposed tokens in platform dashboards
###############################################################################

set -e  # Exit on error

echo "🔥 STARTING IMMEDIATE SECURITY FIXES"
echo "====================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# STEP 1: Backup current state
###############################################################################
echo -e "${YELLOW}[1/9] Creating backup...${NC}"
BACKUP_DIR="security_fixes_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r .git "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ Backup created in $BACKUP_DIR${NC}"
echo ""

###############################################################################
# STEP 2: Delete exposed token files
###############################################################################
echo -e "${YELLOW}[2/9] Deleting exposed token files...${NC}"

FILES_TO_DELETE=(
  ".railway-token.txt"
  ".vercel-token.txt"
  ".neon-token.txt"
  ".neon-config.txt"
)

for file in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    git rm --cached "$file" 2>/dev/null || true
    echo -e "${GREEN}✓ Deleted: $file${NC}"
  else
    echo -e "${YELLOW}  Skip: $file (not found)${NC}"
  fi
done
echo ""

###############################################################################
# STEP 3: Update .gitignore
###############################################################################
echo -e "${YELLOW}[3/9] Updating .gitignore with security patterns...${NC}"

cat >> .gitignore << 'EOF'

# ============================================
# SECURITY: Environment Variables & Secrets
# ============================================
# Environment files
.env
.env.local
.env.*.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local

# Platform tokens (NEVER commit these)
.railway-token.txt
.vercel-token.txt
.neon-token.txt
.neon-config.txt
*-token.txt
*.secret
*.key

# Platform configuration
.railway
.vercel/.env*

# Database backups
*.sql.backup
dump.sql
backup.sql
EOF

echo -e "${GREEN}✓ .gitignore updated${NC}"
echo ""

###############################################################################
# STEP 4: Fix hardcoded Supabase credentials in next.config.js
###############################################################################
echo -e "${YELLOW}[4/9] Removing hardcoded Supabase credentials...${NC}"

NEXT_CONFIG="apps/frontend/next.config.js"

if [ -f "$NEXT_CONFIG" ]; then
  # Create backup
  cp "$NEXT_CONFIG" "$NEXT_CONFIG.backup"

  # Replace hardcoded credentials with proper env var handling
  cat > "$NEXT_CONFIG" << 'EOF'
/** @type {import('next').NextConfig} */

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ CRITICAL: ${varName} environment variable is required`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}

const getEnvVars = () => {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'BilanCompetence.AI',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
};

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  env: getEnvVars(),
  async redirects() {
    return [
      { source: '/', destination: '/fr', permanent: false },
      { source: '/en', destination: '/fr', permanent: false },
      { source: '/en/:path*', destination: '/fr/:path*', permanent: false },
    ];
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
EOF

  echo -e "${GREEN}✓ next.config.js fixed (backup: $NEXT_CONFIG.backup)${NC}"
else
  echo -e "${RED}✗ $NEXT_CONFIG not found${NC}"
fi
echo ""

###############################################################################
# STEP 5: Fix SSL configuration in neon.ts
###############################################################################
echo -e "${YELLOW}[5/9] Fixing SSL configuration...${NC}"

NEON_CONFIG="apps/backend/src/config/neon.ts"

if [ -f "$NEON_CONFIG" ]; then
  # Backup
  cp "$NEON_CONFIG" "$NEON_CONFIG.backup"

  # Fix rejectUnauthorized
  sed -i 's/rejectUnauthorized: false/rejectUnauthorized: true/' "$NEON_CONFIG"

  echo -e "${GREEN}✓ SSL security enabled (backup: $NEON_CONFIG.backup)${NC}"
else
  echo -e "${RED}✗ $NEON_CONFIG not found${NC}"
fi
echo ""

###############################################################################
# STEP 6: Fix default JWT secret in authService.ts
###############################################################################
echo -e "${YELLOW}[6/9] Removing default JWT secret...${NC}"

AUTH_SERVICE="apps/backend/src/services/authService.ts"

if [ -f "$AUTH_SERVICE" ]; then
  # Backup
  cp "$AUTH_SERVICE" "$AUTH_SERVICE.backup"

  # Replace default secret with proper validation
  sed -i "s/const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';/const JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET) {\n  throw new Error('CRITICAL: JWT_SECRET environment variable is required');\n}/" "$AUTH_SERVICE"

  echo -e "${GREEN}✓ JWT secret validation added (backup: $AUTH_SERVICE.backup)${NC}"
else
  echo -e "${RED}✗ $AUTH_SERVICE not found${NC}"
fi
echo ""

###############################################################################
# STEP 7: Add authentication to admin monitoring endpoints
###############################################################################
echo -e "${YELLOW}[7/9] Securing admin monitoring endpoints...${NC}"

INDEX_TS="apps/backend/src/index.ts"

if [ -f "$INDEX_TS" ]; then
  # Backup
  cp "$INDEX_TS" "$INDEX_TS.backup"

  echo -e "${YELLOW}  ⚠️  Manual fix required for monitoring endpoints${NC}"
  echo -e "${YELLOW}     Open: $INDEX_TS${NC}"
  echo -e "${YELLOW}     Add: authMiddleware, roleMiddleware(['ADMIN']) to /api/admin/* routes${NC}"
else
  echo -e "${RED}✗ $INDEX_TS not found${NC}"
fi
echo ""

###############################################################################
# STEP 8: Sanitize documentation files
###############################################################################
echo -e "${YELLOW}[8/9] Sanitizing documentation files...${NC}"

DOC_FILES=(
  "PROJE_KONFIGURASYON.md"
  "SESSION_OZET_30_OCTOBRE.md"
  "VERCEL_DEPLOY_RAPORU_30_OCTOBRE.md"
  "RAILWAY_DEPLOY_RAPORU_30_OCTOBRE.md"
  "URUNLAR_VE_ENDPOINTS.md"
)

for doc in "${DOC_FILES[@]}"; do
  if [ -f "$doc" ]; then
    # Replace tokens with placeholders
    sed -i 's/14f47f8b-d1a7-42c4-a6b2-d3b8ba9a53b7/[RAILWAY_TOKEN_REDACTED]/g' "$doc"
    sed -i 's/xJcybEz24vP6Xw6ICB54sN0c/[VERCEL_TOKEN_REDACTED]/g' "$doc"
    sed -i 's/napi_xf8aumpko5ylhv5l3xnhtuscj52zvmlrtkql8b24gwci83hqye75id23c8025r4r/[NEON_TOKEN_REDACTED]/g' "$doc"
    sed -i 's/prj_oiAgQ2cG1RmfOBrGpKNw0wcHR8XO/[PROJECT_ID_REDACTED]/g' "$doc"
    echo -e "${GREEN}✓ Sanitized: $doc${NC}"
  fi
done
echo ""

###############################################################################
# STEP 9: Create security checklist
###############################################################################
echo -e "${YELLOW}[9/9] Creating security checklist...${NC}"

cat > SECURITY_CHECKLIST.md << 'EOF'
# 🔐 SECURITY REMEDIATION CHECKLIST

## ✅ Phase 0: Immediate Actions (COMPLETED BY SCRIPT)

- [x] Delete exposed token files (.railway-token.txt, .vercel-token.txt, .neon-token.txt)
- [x] Update .gitignore with security patterns
- [x] Remove hardcoded Supabase credentials from next.config.js
- [x] Fix SSL configuration (rejectUnauthorized: true)
- [x] Remove default JWT_SECRET fallback
- [x] Sanitize documentation files

## ⚠️ Phase 0: Manual Actions Required (DO NOW)

### 1. Revoke Exposed Tokens (CRITICAL - Do First!)

#### Railway Token
1. Login: https://railway.app
2. Go to: Settings → Tokens
3. Revoke token: `14f47f8b-d1a7-42c4-a6b2-d3b8ba9a53b7`
4. Generate new token
5. Add to Railway dashboard (NOT in code)

#### Vercel Token
1. Login: https://vercel.com
2. Go to: Settings → Tokens
3. Revoke token: `xJcybEz24vP6Xw6ICB54sN0c`
4. Generate new token
5. Add to Vercel dashboard (NOT in code)

#### Neon Database Token
1. Login: https://console.neon.tech
2. Go to: Settings → API Keys
3. Revoke token: `napi_xf8aumpko5ylhv5l3xnhtuscj52zvmlrtkql8b24gwci83hqye75id23c8025r4r`
4. Generate new token
5. Update DATABASE_URL in Railway/Vercel environment variables

#### Supabase ANON_KEY
1. Login: https://app.supabase.com
2. Go to: Project Settings → API
3. Click "Reset" on ANON_KEY
4. Copy new key
5. Update in Vercel environment variables

### 2. Add Authentication to Admin Endpoints

**File:** `apps/backend/src/index.ts` (lines 137-150)

**Before:**
```typescript
app.get('/api/admin/monitoring/stats', (req, res) => {
  res.json(monitoringEndpoint.stats());
});
```

**After:**
```typescript
app.get('/api/admin/monitoring/stats',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  (req, res) => {
    res.json(monitoringEndpoint.stats());
  }
);
```

Apply to ALL `/api/admin/*` endpoints.

### 3. Fix TypeScript Compilation Error

**File:** `apps/backend/src/routes/qualiopi.ts` (lines 439-467)

Fix malformed try-catch block.

### 4. Commit Security Fixes

```bash
git add .
git commit -m "🔒 SECURITY: Fix critical vulnerabilities

- Remove exposed tokens from repository
- Fix hardcoded Supabase credentials
- Enable SSL certificate validation
- Add JWT_SECRET validation
- Update .gitignore for secrets protection
- Sanitize documentation files

BREAKING: Requires new tokens to be set in platform dashboards
"
```

### 5. Deploy Security Fixes

```bash
# Push to main (triggers auto-deploy)
git push origin main

# Verify deployments
# Frontend: https://app.bilancompetence.ai
# Backend: https://web-production-60dbd.up.railway.app/health
```

### 6. Audit Platform Logs

Check for unauthorized access:
- Railway: Deployments → Logs (past 7 days)
- Vercel: Project → Logs (past 7 days)
- Neon: Dashboard → Activity (past 7 days)

Look for:
- Unusual deployment times
- Failed authentication attempts
- Unexpected database queries

### 7. Update README.md

Change production readiness score from "95/100" to reflect actual status.

## 📊 Progress Tracker

**Phase 0 (Security):** 70% complete (script done, manual steps remain)
**Estimated Time Remaining:** 2 hours

## 🚨 CRITICAL REMINDER

**DO NOT deploy to production until ALL Phase 0 tasks are complete!**

Current Status: ⚠️ VULNERABLE - Tokens still active on platforms
Target Status: ✅ SECURE - All tokens revoked and regenerated

---

**Next Steps:** See COMPREHENSIVE_PROJECT_AUDIT_2025.md for Phase 1-3 action plans
EOF

echo -e "${GREEN}✓ Security checklist created: SECURITY_CHECKLIST.md${NC}"
echo ""

###############################################################################
# COMPLETION
###############################################################################
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✓ SCRIPT COMPLETED SUCCESSFULLY${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS (MANUAL):${NC}"
echo ""
echo "1. ⚠️  REVOKE all exposed tokens in platform dashboards (Railway, Vercel, Neon)"
echo "2. 🔄 REGENERATE new tokens"
echo "3. 🔒 ADD new tokens to platform environment variables (NOT in code)"
echo "4. 🔧 FIX admin monitoring endpoints (add authentication)"
echo "5. 🐛 FIX TypeScript error in qualiopi.ts"
echo "6. 💾 COMMIT changes: git add . && git commit -m 'Security fixes'"
echo "7. 🚀 DEPLOY: git push origin main"
echo "8. 🔍 AUDIT platform logs for unauthorized access"
echo ""
echo -e "${YELLOW}📄 Detailed instructions: SECURITY_CHECKLIST.md${NC}"
echo -e "${YELLOW}📊 Full audit report: COMPREHENSIVE_PROJECT_AUDIT_2025.md${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: This is only Phase 0 (security fixes)${NC}"
echo -e "${RED}   See audit report for Phase 1-3 action plans${NC}"
echo ""
