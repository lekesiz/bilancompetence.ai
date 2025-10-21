# 🚀 BilanCompetence.AI Backend - Vercel Deployment Instructions

**MANUEL DEPLOYMENT STEPS** (Backend'i Vercel'e deploy etmek için)

---

## ⏱️ TIMELINE

```
Step 1: Create Backend Project      → 3 minutes
Step 2: Set Environment Variables   → 5 minutes
Step 3: Deploy                      → 5 minutes
Step 4: Test                        → 2 minutes
────────────────────────────────────────────────
TOTAL TIME TO BACKEND LIVE:         ~15 minutes
```

---

## 📋 STEP 1: Create New Vercel Project (3 minutes)

### 1.1 Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### 1.2 Click "Add New Project"
```
Dashboard → [Add New Project] button (top right)
```

### 1.3 Select GitHub Repository
```
Search: lekesiz/bilancompetence.ai
Click: Select Repository
```

### 1.4 Configure Project Settings

```
Framework Preset: Other (Node.js)

Root Directory:
  ✅ SELECT: ./apps/backend
  (This is the KEY setting!)

Build Command:
  npm run build

Output Directory:
  dist

Install Command:
  npm install

Environment Variables:
  (Will set in STEP 2)
```

---

## 🔐 STEP 2: Set Environment Variables (5 minutes)

### 2.1 Copy These Variables

Get your values from:
- **Supabase**: https://app.supabase.com → Settings
- **SendGrid**: https://app.sendgrid.com → API Keys
- **Vercel**: Generate locally

### 2.2 Variables to Add

**In Vercel: Settings → Environment Variables**

Add these 10 variables:

#### 1️⃣ DATABASE_URL
```
From: Supabase Settings → Database → Connection String

Format: postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres

Step-by-step:
1. Go to https://app.supabase.com
2. Select your project
3. Settings → Database
4. Connection String (Postgres section)
5. Copy the full string
6. Paste into Vercel
```

#### 2️⃣ SUPABASE_URL
```
From: Supabase Settings → API

Value: https://your-project.supabase.co

Step-by-step:
1. Supabase Dashboard → Settings → API
2. Copy "Project URL"
3. Paste into Vercel
```

#### 3️⃣ SUPABASE_ANON_KEY
```
From: Supabase Settings → API

Step-by-step:
1. Supabase Dashboard → Settings → API
2. Copy "Anon (public)" key
3. Paste into Vercel
```

#### 4️⃣ SUPABASE_SERVICE_KEY
```
From: Supabase Settings → API

Step-by-step:
1. Supabase Dashboard → Settings → API
2. Copy "Service Role (secret)" key
3. Paste into Vercel
```

#### 5️⃣ JWT_SECRET
```
Generate new: Copy this command:

openssl rand -base64 32

Or use existing secret (32+ characters)

Step-by-step:
1. Open Terminal
2. Run: openssl rand -base64 32
3. Copy the output
4. Paste into Vercel
```

#### 6️⃣ SENDGRID_API_KEY
```
From: SendGrid Account

Step-by-step:
1. Go to https://app.sendgrid.com
2. Settings → API Keys
3. Copy any active API key (starts with SG.)
4. Paste into Vercel
```

#### 7️⃣ SENDGRID_FROM_EMAIL
```
Your email address: noreply@bilancompetence.ai

Or use: your-email@domain.com

(Must be verified in SendGrid)
```

#### 8️⃣ CORS_ORIGIN
```
Value: https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000

(Frontend URL + localhost for testing)
```

#### 9️⃣ FRONTEND_URL
```
Value: https://bilancompetence-ai-frontend.vercel.app

(Your frontend URL from Vercel)
```

#### 🔟 NODE_ENV
```
Value: production

(Always production for Vercel)
```

### 2.3 Add Variables in Vercel

```
For each variable:
1. In Vercel Settings → Environment Variables
2. Click "Add New"
3. Enter Name (e.g., DATABASE_URL)
4. Enter Value (paste from above)
5. Select "All Environments" (or just Production)
6. Click "Save"

Repeat for all 10 variables
```

---

## 🚀 STEP 3: Deploy Backend (5 minutes)

### 3.1 Click Deploy Button
```
After setting all variables:
Click "Deploy" button

Vercel will:
1. Trigger build
2. Install dependencies
3. Compile TypeScript
4. Create dist folder
5. Deploy to serverless

Expected time: 3-5 minutes
```

### 3.2 Monitor Build
```
You'll see:
- "Building" ← npm install, npm run build
- "Deploying" ← uploading to servers
- "Ready" ← ✅ LIVE!

Watch logs if interested
```

### 3.3 Get Backend URL
```
When READY:
- URL will be shown (example):
  https://bilancompetence-ai-backend.vercel.app

Copy this URL - you'll need it for frontend!
```

---

## ✅ STEP 4: Test Backend (2 minutes)

### 4.1 Test Health Endpoint
```bash
# Replace URL with your backend URL
curl https://bilancompetence-ai-backend.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-21T13:42:00.000Z",
  "uptime": 12.345,
  "environment": "production"
}
```

### 4.2 Test Version Endpoint
```bash
curl https://bilancompetence-ai-backend.vercel.app/api/version

# Expected response:
{
  "version": "1.0.0",
  "name": "BilanCompetence.AI Backend",
  "environment": "production",
  "platform": "Vercel Serverless"
}
```

### 4.3 If Tests Fail
```
Common issues:
- Environment variables not set correctly
- Database URL invalid
- Vercel build had errors

Solution:
1. Check Vercel logs
2. Verify environment variables
3. Redeploy
```

---

## 📊 SUMMARY CHECKLIST

```
✅ Created new Vercel project
✅ Set Root Directory to ./apps/backend
✅ Added 10 environment variables
✅ Clicked Deploy
✅ Backend is LIVE
✅ /api/health returns 200
✅ /api/version works

Next: Update Frontend with new Backend URL
```

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### Step 5: Update Frontend (2 minutes)
```
Edit: apps/frontend/.env.local

Add/Update:
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL/api
NEXT_PUBLIC_REALTIME_URL=https://YOUR-BACKEND-URL

Push to GitHub:
git add -A
git commit -m "Update backend API URL"
git push origin main

Frontend auto-redeploys on Vercel!
```

### Step 6: Integration Testing (10 minutes)
```
Open: https://bilancompetence-ai-frontend.vercel.app

Test:
✅ Go to login page
✅ Try to register → Check database
✅ Try to login → Check JWT token
✅ Try to create assessment → Check API
✅ Try to send message → Check real-time
✅ Try to upload file → Check email sent
```

---

## 🆘 TROUBLESHOOTING

### Problem: Build Failed
**Solution:**
```
1. Check Vercel logs for error message
2. Common: wrong DATABASE_URL format
3. Common: missing environment variable
4. Fix the issue
5. Click "Redeploy" in Vercel
```

### Problem: /api/health returns 404
**Solution:**
```
1. Wait 30 seconds (might still deploying)
2. Check environment variables in Vercel
3. Verify DATABASE_URL is correct format
4. Redeploy
```

### Problem: Cannot connect to database
**Solution:**
```
1. Verify DATABASE_URL in Vercel
2. Check if Supabase is running
3. Test connection string locally:
   psql "postgresql://..."
4. Update environment variable if needed
5. Redeploy
```

### Problem: Emails not sending
**Solution:**
```
1. Verify SENDGRID_API_KEY in Vercel
2. Check SendGrid account has credits
3. Verify SENDGRID_FROM_EMAIL is verified
4. Test in SendGrid dashboard
5. Redeploy backend
```

---

## 📞 SUPPORT RESOURCES

- **Documentation**: [MONOREPO_VERCEL_DEPLOYMENT_GUIDE.md](./MONOREPO_VERCEL_DEPLOYMENT_GUIDE.md)
- **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Supabase Docs**: https://supabase.com/docs
- **SendGrid Docs**: https://docs.sendgrid.com
- **Vercel Docs**: https://vercel.com/docs

---

## ⏱️ TOTAL TIME TO PRODUCTION

```
Step 1: Create Project      → 3 min
Step 2: Env Variables       → 5 min
Step 3: Deploy              → 5 min
Step 4: Test                → 2 min
Step 5: Update Frontend     → 2 min
Step 6: Integration Tests   → 10 min
─────────────────────────────────────
TOTAL:                      ~27 minutes

🎉 PRODUCTION LAUNCH TIME: ~27 minutes from now!
```

---

**Status**: Backend ready to deploy
**Next Action**: Follow steps 1-4 above
**Estimated Completion**: ~27 minutes
