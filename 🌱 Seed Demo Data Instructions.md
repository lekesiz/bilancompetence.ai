# 🌱 Seed Demo Data Instructions

This guide explains how to seed demo data into the production database.

---

## 📋 Overview

The seed script creates:
- ✅ **3 demo user accounts** (admin, consultant, beneficiary)
- ✅ **1 demo organization** (Demo Organization)
- ✅ **2 sample assessments** (In Progress & Completed)
- ✅ **4 sample competencies** (Communication, Leadership, Project Management, Data Analysis)
- ✅ **3 Qualiopi indicators** (Compliance tracking)
- ✅ **1 satisfaction survey** (5/5 rating)

---

## 🚀 Method 1: Run Locally (Development)

### Prerequisites
- Node.js 22.x installed
- Access to the database (DATABASE_URL)

### Steps

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Set DATABASE_URL environment variable:**
   ```bash
   export DATABASE_URL="your_production_database_url"
   ```

3. **Run the seed script:**
   ```bash
   npm run seed:demo
   ```

4. **Verify output:**
   You should see output like:
   ```
   🌱 Starting demo data seeding...
   📊 Creating demo organization...
   ✅ Organization created: xxx-xxx-xxx
   👥 Creating demo users...
   ✅ organization_admin: admin@demo.bilancompetence.ai
   ✅ consultant: consultant@demo.bilancompetence.ai
   ✅ beneficiary: client@demo.bilancompetence.ai
   ...
   🎉 Demo data seeding completed!
   ```

---

## 🚂 Method 2: Run on Railway (Production)

### Prerequisites
- Railway CLI installed (`npm install -g @railway/cli`)
- Logged in to Railway (`railway login`)
- Linked to the project (`railway link`)

### Steps

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Run seed script on Railway:**
   ```bash
   railway run npm run seed:demo
   ```

   This will:
   - Connect to the production database
   - Create demo accounts and data
   - Display credentials in the terminal

---

## 🌐 Method 3: Railway Dashboard (No CLI)

### Steps

1. **Go to Railway Dashboard:**
   - Open: https://railway.app/dashboard
   - Select your project: `bilancompetence-backend`

2. **Open the service:**
   - Click on the backend service
   - Go to the "Settings" tab

3. **Add a one-time command:**
   - Scroll to "Deploy"
   - Click "Custom Start Command"
   - Enter: `npm run seed:demo`
   - Click "Deploy"

4. **View logs:**
   - Go to "Deployments" tab
   - Click on the latest deployment
   - View logs to see the demo credentials

5. **Restore normal deployment:**
   - Go back to "Settings"
   - Remove custom start command
   - Redeploy with normal start command: `npm start`

---

## 📧 Demo Account Credentials

After seeding, you'll have these accounts:

### 👨‍💼 Admin Account
```
Email: admin@demo.bilancompetence.ai
Password: Admin@Demo2025
Role: organization_admin
```

### 👨‍🏫 Consultant Account
```
Email: consultant@demo.bilancompetence.ai
Password: Consultant@Demo2025
Role: consultant
```

### 👤 Client Account
```
Email: client@demo.bilancompetence.ai
Password: Client@Demo2025
Role: beneficiary
```

For detailed information, see: [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)

---

## 🔄 Idempotency

The seed script is **idempotent**, meaning:
- ✅ Safe to run multiple times
- ✅ Updates existing demo accounts (doesn't create duplicates)
- ✅ Uses `ON CONFLICT` clauses to handle existing data
- ✅ Won't affect other users or organizations

---

## 🧹 Cleaning Demo Data (Optional)

To remove demo data from the database:

```sql
-- Delete demo organization and all related data (cascades)
DELETE FROM organizations WHERE name = 'Demo Organization';

-- Or delete specific demo users
DELETE FROM users WHERE email LIKE '%@demo.bilancompetence.ai';
```

⚠️ **Warning:** This will permanently delete all demo data.

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL not configured"
**Solution:** Set the DATABASE_URL environment variable:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### Error: "ECONNREFUSED"
**Solution:** Check that:
- Database is accessible
- DATABASE_URL is correct
- Firewall allows connections
- SSL settings are correct

### Error: "relation does not exist"
**Solution:** Run migrations first:
```bash
npm run migrate
```

### Error: "duplicate key value violates unique constraint"
**Solution:** Demo data already exists. The script will update existing records automatically.

---

## 📝 Script Location

The seed script is located at:
```
apps/backend/src/scripts/seed-demo-data.ts
```

To modify the demo data, edit this file and re-run the script.

---

## 🔐 Security Notes

⚠️ **Important Security Considerations:**

1. **Demo accounts are for testing only**
   - Do not use in production with real client data
   - Change passwords if exposed publicly

2. **Database access**
   - Keep DATABASE_URL secret
   - Use environment variables, never hardcode
   - Rotate credentials regularly

3. **Production safety**
   - Demo accounts use `@demo.bilancompetence.ai` domain
   - Easy to identify and remove
   - Isolated from real users

---

## ✅ Verification

After seeding, verify the data:

1. **Login to the application:**
   - Go to: https://app.bilancompetence.ai/login
   - Try logging in with each demo account

2. **Check database:**
   ```sql
   -- Count demo users
   SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.bilancompetence.ai';
   
   -- List demo organization
   SELECT * FROM organizations WHERE name = 'Demo Organization';
   
   -- Check assessments
   SELECT COUNT(*) FROM assessments WHERE organization_id = 
     (SELECT id FROM organizations WHERE name = 'Demo Organization');
   ```

3. **Test features:**
   - Admin: Access dashboard, view analytics
   - Consultant: View clients, create assessments
   - Client: Take assessments, view results

---

**Last Updated:** October 28, 2025  
**Script Version:** 1.0.0

