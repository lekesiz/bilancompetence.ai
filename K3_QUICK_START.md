# 🚀 K3 Quick Start - Execute in 5 Minutes

**Choose ONE option below and follow the steps:**

---

## ⚡ OPTION A: Manual (Recommended) - 30-45 minutes

**Best for:** First-time setup, verification, safety

### Step 1: Open Supabase Dashboard
```
1. Go to https://supabase.com
2. Log in
3. Select "BilanCompetence" project (ommidwwqqrhupmhaqghx)
4. Click "SQL Editor" in left sidebar
```

### Step 2: Run Each Migration in Order
```
For EACH migration file (001 through 017):

1. Click "+ New Query"
2. Open: /Users/mikail/Desktop/bilancompetence.ai/apps/backend/migrations/[FILENAME]
3. Copy ENTIRE file contents
4. Paste into Supabase SQL Editor
5. Click "Run" button (top right)
6. Confirm: Green checkmark appears
7. Move to next migration
```

### Step 3: Verify Success
```sql
-- Run this query in SQL Editor:
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';
-- Expected: 30+ (or similar number of tables)
```

### Step 4: Test Auth API
```bash
cd /Users/mikail/Desktop/bilancompetence.ai
npm run dev

# In another terminal:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User",
    "role": "BENEFICIARY"
  }'

# Expected: 200 OK with user data (NOT 500 error)
```

---

## ⚡ OPTION B: Supabase CLI (Fastest) - 15-20 minutes

**Best for:** Experienced developers, fastest execution

### Step 1: Install Supabase CLI (if needed)
```bash
brew install supabase/tap/supabase
# Or: npm install -g supabase
```

### Step 2: Navigate to Project
```bash
cd /Users/mikail/Desktop/bilancompetence.ai
```

### Step 3: Link to Remote Project
```bash
supabase link --project-ref ommidwwqqrhupmhaqghx
# Follow prompts - confirm project link successful
```

### Step 4: Apply All Migrations
```bash
cd apps/backend
supabase db push
# Waits for all 17 migrations to apply
```

### Step 5: Verify
```bash
supabase db push --dry-run
# Should show: 0 migrations to apply (all done)
```

### Step 6: Test Auth API
```bash
cd /Users/mikail/Desktop/bilancompetence.ai
npm run dev

# In another terminal:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User",
    "role": "BENEFICIARY"
  }'

# Expected: 200 OK with user data (NOT 500 error)
```

---

## ✅ Success Checklist

After execution, confirm:

- [ ] Chose execution method (A or B)
- [ ] All migrations executed successfully
- [ ] Verification query shows 30+ tables
- [ ] Auth registration API returns 200 OK
- [ ] User was created in database
- [ ] No errors in backend logs

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Table already exists" | Safe to continue - use IF NOT EXISTS |
| "Permission denied" | Ask DevOps for admin access |
| "Connection refused" | Verify Supabase project is active |
| Auth API still returns 500 | Restart backend: `npm run dev` |
| Can't find migration files | Check: `/Users/mikail/Desktop/bilancompetence.ai/apps/backend/migrations/` |

---

## 📚 Need More Details?

See the full guides:
- **K3_MIGRATION_EXECUTION_GUIDE.md** - Complete step-by-step instructions
- **K3_TASK_COMPLETION_REPORT.md** - Executive summary
- **apply_migrations.py** - Helper script (run: `python3 apply_migrations.py`)

---

## 🎯 That's It!

You now have everything needed to execute K3 and unblock Auth APIs.

**Choose Option A or B above and follow the steps. Should take 30-60 minutes total.**

Once complete, the critical blocker will be resolved and team development can proceed.
