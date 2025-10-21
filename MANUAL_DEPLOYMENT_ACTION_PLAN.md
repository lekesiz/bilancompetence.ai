# 🎯 BilanCompetence.AI - MANUAL DEPLOYMENT ACTION PLAN

**Status**: Ready for your action
**Time**: Now
**Timeline to Production**: ~27 minutes
**Difficulty**: Easy (just follow the steps)

---

## ⏱️ QUICK TIMELINE

```
You are here:        ← Manual deployment instructions
↓
Step 1: Create Backend Project (3 min)
↓
Step 2: Set 10 Environment Variables (5 min)
↓
Step 3: Deploy (5 min)
↓
Step 4: Test Health Endpoint (2 min)
↓
Step 5: Update Frontend Config (2 min)
↓
Step 6: Run Integration Tests (10 min)
↓
🎉 PRODUCTION LIVE! (~27 minutes total)
```

---

## 🚀 YOUR EXACT NEXT STEPS

### STEP 1: GO TO VERCEL DASHBOARD (Right Now!)

**URL**: https://vercel.com/dashboard

```
You should see:
✅ bilancompetence-ai-frontend (already deployed)
✅ "Add New Project" button (top right)
```

---

### STEP 2: CLICK "ADD NEW PROJECT"

```
Top Right: [Add New Project] button
Click it!
```

---

### STEP 3: SELECT GITHUB REPOSITORY

```
Search Box: lekesiz/bilancompetence.ai
Click on it to select
```

---

### STEP 4: CONFIGURE PROJECT SETTINGS

When you see the configuration screen:

```
Framework Preset:
  ⚠️  SELECT "Other (Node.js)"

Root Directory:
  ⚠️  CLEAR DEFAULT & TYPE: ./apps/backend
  (This is CRITICAL!)

Build Command:
  npm run build

Output Directory:
  dist

Install Command:
  npm install

Environment Variables:
  (Skip for now, we'll add later)
```

---

## 🔐 STEP 5: SET ENVIRONMENT VARIABLES

This is the most important part!

### 5.1 Scroll down to "Environment Variables"

### 5.2 Add These 10 Variables

For each variable: Click "Add New" → Enter Name & Value → Save

#### Variable 1: DATABASE_URL
```
Name:  DATABASE_URL
Value: postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres?sslmode=require

(Get from Supabase: Settings → Database → Connection String)
```

#### Variable 2: SUPABASE_URL
```
Name:  SUPABASE_URL
Value: https://your-project.supabase.co

(Get from Supabase: Settings → API → Project URL)
```

#### Variable 3: SUPABASE_ANON_KEY
```
Name:  SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiI... (long string)

(Get from Supabase: Settings → API → Anon (public) Key)
```

#### Variable 4: SUPABASE_SERVICE_KEY
```
Name:  SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiI... (different long string)

(Get from Supabase: Settings → API → Service Role (secret) Key)
```

#### Variable 5: JWT_SECRET
```
Name:  JWT_SECRET
Value: (Generate new: run this in Terminal)

Command: openssl rand -base64 32

Example output:
aBc1dEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnO=

Paste that value here!
```

#### Variable 6: SENDGRID_API_KEY
```
Name:  SENDGRID_API_KEY
Value: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

(Get from SendGrid: Settings → API Keys)
```

#### Variable 7: SENDGRID_FROM_EMAIL
```
Name:  SENDGRID_FROM_EMAIL
Value: noreply@bilancompetence.ai

(Any verified email from SendGrid)
```

#### Variable 8: CORS_ORIGIN
```
Name:  CORS_ORIGIN
Value: https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000

(Frontend URL + localhost for testing)
```

#### Variable 9: FRONTEND_URL
```
Name:  FRONTEND_URL
Value: https://bilancompetence-ai-frontend.vercel.app

(Your frontend URL)
```

#### Variable 10: NODE_ENV
```
Name:  NODE_ENV
Value: production

(Always production)
```

---

## 🚀 STEP 6: CLICK DEPLOY

```
When all variables are set:
Click the BIG "Deploy" button
```

**WHAT HAPPENS:**
```
1. Vercel starts build
2. npm install runs
3. npm run build runs (TypeScript compiles)
4. App deployed to serverless
5. After 3-5 minutes: Status changes to "READY"
```

**WATCH THE LOGS** (optional but cool):
```
You'll see:
- npm install: ✅
- npm run build: ✅
- Deploying: ✅
- Ready: ✅ LIVE!
```

---

## ✅ STEP 7: VERIFY BACKEND IS LIVE

When status shows "READY":

```
You'll see a URL like:
https://bilancompetence-ai-backend-xxxxx.vercel.app

Test it (open in browser):
https://your-backend-url.vercel.app/api/health

Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-21T...",
  "uptime": 12.345,
  "environment": "production"
}
```

**SAVE THIS URL** - You'll need it for frontend!

---

## 📱 STEP 8: UPDATE FRONTEND

Now backend is live! Tell frontend where backend is.

### 8.1 Update Environment Variable

Edit file: `apps/frontend/.env.local`

```
Change:
NEXT_PUBLIC_API_URL=http://localhost:3001/api

To:
NEXT_PUBLIC_API_URL=https://your-backend-url/api
NEXT_PUBLIC_REALTIME_URL=https://your-backend-url
```

### 8.2 Push to GitHub

```bash
cd /Users/mikail/Desktop/BilanCompetence.AI
git add apps/frontend/.env.local
git commit -m "Update backend API URL for production"
git push origin main
```

**WHAT HAPPENS:**
```
- GitHub webhook → Vercel
- Vercel sees changes
- Frontend auto-redeploys
- In 2-3 minutes: Frontend has new backend URL
```

---

## 🧪 STEP 9: INTEGRATION TEST

Open frontend:
```
https://bilancompetence-ai-frontend.vercel.app
```

Test the complete flow:

```
✅ Open login page
   Should load without errors

✅ Try to register
   Email & password entered
   Click register
   Check browser console for errors
   Should see success

✅ Try to login
   Use registered email
   Check if JWT token received
   Should redirect to dashboard

✅ Create assessment
   Go to assessments page
   Create new assessment
   Should call backend API
   Data should be saved to database

✅ Send message
   Go to chat page
   Send a message
   Should appear instantly (real-time)
   Check Supabase database

✅ Upload file
   Try to upload a file
   Should trigger SendGrid email
   Check email received
```

---

## 🎉 STEP 10: YOU'RE DONE!

If all tests pass:

```
🎊 PRODUCTION LAUNCH COMPLETE! 🎊

Frontend:  https://bilancompetence-ai-frontend.vercel.app ✅
Backend:   https://your-backend-url.vercel.app ✅
Database:  Supabase ✅
Email:     SendGrid ✅
Real-time: Socket.io ✅

PRODUCTION LIVE! 🚀
```

---

## 🆘 TROUBLESHOOTING

### Problem: Build Failed
```
Error shown in Vercel logs?

Common solutions:
1. Check environment variables are ALL set
2. Verify DATABASE_URL format
3. Redeploy (click Redeploy button)
```

### Problem: /api/health returns 404
```
Solution:
1. Wait 30 seconds (might still deploying)
2. Refresh page
3. Check environment variables in Vercel
4. If still fails: Click Redeploy
```

### Problem: Frontend can't reach backend
```
Solution:
1. Check NEXT_PUBLIC_API_URL in .env.local
2. Should be: https://your-backend-url/api
3. Push to GitHub
4. Wait for frontend to redeploy
5. Refresh browser cache (Ctrl+Shift+R)
```

### Problem: Emails not sending
```
Solution:
1. Check SENDGRID_API_KEY is correct
2. Check SENDGRID_FROM_EMAIL is verified in SendGrid
3. Check SendGrid account has credits
4. Redeploy backend
```

---

## 📊 SUMMARY CHECKLIST

```
BEFORE YOU START:
☐ Read this entire document
☐ Have Supabase credentials ready
☐ Have SendGrid API key ready
☐ Know your frontend URL

DURING DEPLOYMENT:
☐ Created new Vercel project
☐ Set Root Directory to ./apps/backend
☐ Added all 10 environment variables
☐ Clicked Deploy
☐ Waited for "READY" status

AFTER DEPLOYMENT:
☐ Tested /api/health endpoint
☐ Saved backend URL
☐ Updated frontend .env.local
☐ Pushed to GitHub
☐ Frontend auto-redeployed
☐ Ran integration tests
☐ All systems green ✅
```

---

## 🏆 FINAL STATUS

```
Frontend:           ✅ LIVE
Backend:            ⏳ DEPLOYING NOW (by you!)
Database:           ✅ READY
Email:              ✅ READY
Real-time:          ✅ READY
Documentation:      ✅ COMPLETE

When you finish:    ✅ 100% PRODUCTION READY
```

---

## ⏱️ TIME ESTIMATE

```
Step 1-3: Create project       → 3 minutes
Step 4-5: Configure & set vars → 5 minutes
Step 6-7: Deploy & verify      → 5 minutes
Step 8: Update frontend        → 2 minutes
Step 9: Integration tests      → 10 minutes
────────────────────────────────────────────
TOTAL:                         ~25 minutes

🎯 Target Completion Time: ~13:40 UTC
```

---

## 🎯 YOUR MISSION (if you choose to accept it!)

```
1. ✅ You've decided to deploy (OPTION A selected)
2. ✅ Documentation is ready
3. ✅ Backend code is ready
4. ✅ Database is ready
5. ✅ Email service is ready

NOW:
⏳ Go to https://vercel.com/dashboard
⏳ Follow STEP 1-10 above
⏳ Report back when done!

RESULT:
🎉 BilanCompetence.AI PRODUCTION LIVE!
```

---

## 📞 IF YOU GET STUCK

```
Document: BACKEND_VERCEL_DEPLOYMENT_INSTRUCTIONS.md
  (Detailed step-by-step with screenshots references)

Document: PROJECT_STATUS_REPORT.md
  (Current project status & what's done)

Document: MONOREPO_VERCEL_DEPLOYMENT_GUIDE.md
  (Architecture & detailed guide)
```

---

**Ready to launch?** 🚀

**Go to**: https://vercel.com/dashboard
**Do**: Follow steps 1-10 above
**Time**: ~25 minutes
**Result**: ✅ PRODUCTION LIVE!

When you're done, let me know the backend URL and I'll verify everything is working perfectly! 🎉

---

**Generated**: 21 October 2025
**Document**: MANUAL_DEPLOYMENT_ACTION_PLAN.md
**Status**: Ready for execution
