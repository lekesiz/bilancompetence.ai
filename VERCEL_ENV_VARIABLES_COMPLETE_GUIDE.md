# 🔐 BilanCompetence.AI - Vercel Environment Variables COMPLETE GUIDE

**Status**: Comprehensive credential guide
**Purpose**: Copy-paste ready values for Vercel deployment
**Time**: 5 minutes to complete

---

## 📋 WHAT YOU NEED TO DO

1. Read this document completely
2. Gather credentials from Supabase & SendGrid (instructions below)
3. Copy the exact values from this guide
4. Paste them into Vercel dashboard
5. Deploy backend

---

## 🚀 SECTION 1: DATABASE_URL (Supabase Connection String)

### Where to Get It:
```
1. Go to: https://app.supabase.com
2. Login with your account
3. Select your project (BilanCompetence.AI)
4. Left sidebar: Settings → Database
5. Scroll down to "Connection String"
6. Select "Postgres" tab
7. Copy the full string
```

### Format:
```
postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres?sslmode=require
```

### Example (YOUR VALUE WILL LOOK LIKE THIS):
```
postgresql://postgres:abc123XyZ789def@db.supabase.co:5432/postgres?sslmode=require
```

### In Vercel Dashboard:
```
Name:  DATABASE_URL
Value: [paste the full string you copied]
```

---

## 🚀 SECTION 2: SUPABASE_URL (Project URL)

### Where to Get It:
```
1. Go to: https://app.supabase.com
2. Select your project
3. Left sidebar: Settings → API
4. Look for "Project URL"
5. Copy it
```

### Format:
```
https://your-project-id.supabase.co
```

### Example (YOUR VALUE WILL LOOK LIKE THIS):
```
https://abcdefghijklmnopqrst.supabase.co
```

### In Vercel Dashboard:
```
Name:  SUPABASE_URL
Value: [paste the Project URL]
```

---

## 🚀 SECTION 3: SUPABASE_ANON_KEY (Public Key)

### Where to Get It:
```
1. Same place as above:
   https://app.supabase.com → Settings → API
2. Look for "Anon (public)" key
3. It's a long string starting with "eyJhbGc..."
4. Copy the entire string
```

### Format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6... (very long)
```

### In Vercel Dashboard:
```
Name:  SUPABASE_ANON_KEY
Value: [paste the entire anon key]
```

---

## 🚀 SECTION 4: SUPABASE_SERVICE_KEY (Secret Key)

### Where to Get It:
```
1. Same place:
   https://app.supabase.com → Settings → API
2. Look for "Service Role (secret)" key
3. It's also a long string starting with "eyJhbGc..."
4. ⚠️  DIFFERENT from Anon key!
5. Copy the entire string
```

### Format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6... (different, very long)
```

### In Vercel Dashboard:
```
Name:  SUPABASE_SERVICE_KEY
Value: [paste the entire service key]
```

---

## 🚀 SECTION 5: JWT_SECRET (Generate New)

### How to Generate:
```
Open Terminal and run:

openssl rand -base64 32

This will output something like:
aBc1dEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnO=

Copy that entire output
```

### In Vercel Dashboard:
```
Name:  JWT_SECRET
Value: [paste the generated string from above]
```

---

## 🚀 SECTION 6: SENDGRID_API_KEY

### Where to Get It:
```
1. Go to: https://app.sendgrid.com
2. Login with your account
3. Left sidebar: Settings → API Keys
4. Click "Create API Key" (if you don't have one)
5. Give it a name: "BilanCompetence Backend"
6. Copy the key (starts with "SG.")
7. ⚠️  SAVE IT! SendGrid won't show it again!
```

### Format:
```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Example (YOUR VALUE WILL LOOK LIKE THIS):
```
SG.abc123XyZ789def456ghi789jkl012mno345pqr
```

### In Vercel Dashboard:
```
Name:  SENDGRID_API_KEY
Value: SG.[paste the key you copied]
```

---

## 🚀 SECTION 7: SENDGRID_FROM_EMAIL

### Where to Get It:
```
1. Go to SendGrid: https://app.sendgrid.com
2. Settings → Sender Authentication
3. Choose any verified email from your list
   (Must be verified - has a checkmark)
```

### Format:
```
noreply@yourdomain.com
```

### Default Value:
```
noreply@bilancompetence.ai
```

### ⚠️ IF NOT VERIFIED:
```
If noreply@bilancompetence.ai is not verified in SendGrid:

1. Go to SendGrid
2. Settings → Sender Authentication
3. Add new sender: noreply@bilancompetence.ai
4. SendGrid sends verification email
5. Click the link in email
6. Once verified, use it

OR use an existing verified email like:
your-email@gmail.com (if verified in SendGrid)
```

### In Vercel Dashboard:
```
Name:  SENDGRID_FROM_EMAIL
Value: noreply@bilancompetence.ai
       (or your verified email)
```

---

## 🚀 SECTION 8: CORS_ORIGIN

### What is it:
```
Frontend URL + local testing URL
Tells backend which URLs are allowed to call it
```

### Value:
```
https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000
```

### In Vercel Dashboard:
```
Name:  CORS_ORIGIN
Value: https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000
```

---

## 🚀 SECTION 9: FRONTEND_URL

### What is it:
```
Your frontend URL from Vercel
```

### Where to Get It:
```
1. Go to Vercel dashboard
2. Look for "bilancompetence-ai-frontend" project
3. Copy the deployment URL
```

### Format:
```
https://bilancompetence-ai-frontend.vercel.app
```

### In Vercel Dashboard:
```
Name:  FRONTEND_URL
Value: https://bilancompetence-ai-frontend.vercel.app
```

---

## 🚀 SECTION 10: NODE_ENV

### What is it:
```
Environment mode (production, development, etc.)
Always "production" for Vercel
```

### Value:
```
production
```

### In Vercel Dashboard:
```
Name:  NODE_ENV
Value: production
```

---

## 📋 COMPLETE CHECKLIST

Before you start in Vercel, gather these:

```
[ ] DATABASE_URL (from Supabase Settings → Database)
    Status: ____________________

[ ] SUPABASE_URL (from Supabase Settings → API)
    Status: ____________________

[ ] SUPABASE_ANON_KEY (from Supabase Settings → API)
    Status: ____________________

[ ] SUPABASE_SERVICE_KEY (from Supabase Settings → API)
    Status: ____________________

[ ] JWT_SECRET (generate with: openssl rand -base64 32)
    Status: ____________________

[ ] SENDGRID_API_KEY (from SendGrid Settings → API Keys)
    Status: ____________________

[ ] SENDGRID_FROM_EMAIL (verified email in SendGrid)
    Status: ____________________

[ ] CORS_ORIGIN (ready: https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000)
    Status: ✅

[ ] FRONTEND_URL (from Vercel frontend project)
    Status: ____________________

[ ] NODE_ENV (ready: production)
    Status: ✅
```

---

## 🎯 STEP-BY-STEP TO ADD IN VERCEL

### In Vercel Dashboard (while creating backend project):

After you've gathered all values above:

```
1. In Vercel: Settings → Environment Variables

2. For each variable:
   a) Click "Add New"
   b) Enter the Name (e.g., DATABASE_URL)
   c) Paste the Value you copied
   d) Select "All Environments" (or just Production)
   e) Click "Save"

3. Repeat for all 10 variables

4. Once all 10 are added:
   Click "Deploy" button
```

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ MISTAKE 1: Wrong Key
```
Problem: Used "Anon" key instead of "Service" key
Solution: Double-check you're copying the RIGHT key from Supabase
```

### ❌ MISTAKE 2: Incomplete String
```
Problem: Only copied part of the long string
Solution: Make sure to copy the ENTIRE value
```

### ❌ MISTAKE 3: Wrong Email
```
Problem: Email not verified in SendGrid
Solution: Use only verified emails from SendGrid
```

### ❌ MISTAKE 4: Typos
```
Problem: Accidentally added space or extra character
Solution: Copy-paste (don't type manually)
```

---

## ✅ VERIFICATION CHECKLIST

After adding all variables in Vercel:

```
✅ All 10 variables added
✅ No typos or extra spaces
✅ All values are complete (not truncated)
✅ Keys match their names
✅ Deployment starts successfully
```

---

## 📞 IF YOU GET ERRORS

### Error: "Cannot connect to database"
```
Check: DATABASE_URL is correct format
Make sure: It includes password and ?sslmode=require
```

### Error: "Email sending failed"
```
Check: SENDGRID_API_KEY is correct
Check: SENDGRID_FROM_EMAIL is verified in SendGrid
```

### Error: "CORS error in frontend"
```
Check: CORS_ORIGIN includes frontend URL
Check: Frontend URL is correct
```

---

## 🎯 NEXT STEPS

1. ✅ Read this entire document
2. ✅ Gather all 10 credentials
3. ✅ Go to Vercel dashboard
4. ✅ Add each variable one by one
5. ✅ Click Deploy
6. ✅ Wait for build to complete
7. ✅ Test /api/health endpoint

---

## 📊 SUMMARY TABLE

| # | Variable | Where to Get | Format |
|---|----------|-------------|--------|
| 1 | DATABASE_URL | Supabase Settings → Database | postgresql://postgres:password@db.supabase.co:5432/postgres?sslmode=require |
| 2 | SUPABASE_URL | Supabase Settings → API | https://project-id.supabase.co |
| 3 | SUPABASE_ANON_KEY | Supabase Settings → API | eyJhbGc... (long string) |
| 4 | SUPABASE_SERVICE_KEY | Supabase Settings → API | eyJhbGc... (different long string) |
| 5 | JWT_SECRET | Generate: `openssl rand -base64 32` | Random 32-char string |
| 6 | SENDGRID_API_KEY | SendGrid Settings → API Keys | SG.xxxxx... |
| 7 | SENDGRID_FROM_EMAIL | SendGrid verified email | noreply@bilancompetence.ai |
| 8 | CORS_ORIGIN | Ready to use | https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000 |
| 9 | FRONTEND_URL | Vercel frontend project | https://bilancompetence-ai-frontend.vercel.app |
| 10 | NODE_ENV | Ready to use | production |

---

**Status**: Ready to deploy! Follow this guide step-by-step.

**Time**: ~5 minutes to gather credentials + ~5 minutes to add to Vercel = ~10 minutes total

**Next**: Go to Vercel and start adding these variables!
