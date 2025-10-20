# 📋 SPRINT 1 DETAILED TASKS & ASSIGNMENTS

**Sprint**: Sprint 1 (Oct 21-27, 2025)
**Focus**: Foundation & Authentication System
**Status**: READY TO EXECUTE

---

## 🏗️ INFRASTRUCTURE SETUP (Oct 21 - Oct 22)

### TASK 1.1: Supabase Project Setup
**Assigned**: DevOps Team (2 people)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

**Steps**:
1. [ ] Go to https://supabase.com/dashboard
2. [ ] Create new project
   - Name: `bilancompetence-dev`
   - Database password: [Strong password]
   - Region: EU (Frankfurt)
   - Plan: Free (scalable)
3. [ ] Wait for project to initialize (3-5 min)
4. [ ] Get credentials:
   - [ ] Copy Project URL
   - [ ] Copy Anon Key
   - [ ] Copy Service Role Key
5. [ ] Store in secure location (LastPass/1Password)
6. [ ] Add to GitHub repo secrets:
   - [ ] SUPABASE_URL
   - [ ] SUPABASE_ANON_KEY
   - [ ] SUPABASE_SERVICE_ROLE_KEY
7. [ ] Test connection:
   ```bash
   npm install @supabase/supabase-js
   # Test script here
   ```

**Definition of Done**:
- [ ] Supabase project created
- [ ] Credentials securely stored
- [ ] GitHub Actions can access credentials
- [ ] Connection test successful

**Blockers**: None anticipated

---

### TASK 1.2: Vercel Deployment Setup
**Assigned**: DevOps Team (1 person)
**Duration**: 1.5 hours
**Status**: 🔴 NOT STARTED

**Steps**:
1. [ ] Go to https://vercel.com/new
2. [ ] Connect GitHub repository
3. [ ] Configure Frontend:
   - [ ] Framework: Next.js
   - [ ] Root: `apps/frontend`
   - [ ] Build command: `npm run build`
   - [ ] Output directory: `.next`
   - [ ] Install command: `npm install`
4. [ ] Environment variables:
   - [ ] NEXT_PUBLIC_API_URL: `http://localhost:3001` (dev), `https://api.bilancompetence.ai` (prod)
   - [ ] NEXT_PUBLIC_SUPABASE_URL: [from 1.1]
   - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY: [from 1.1]
5. [ ] Configure Backend (Edge Functions):
   - [ ] Framework: Node.js
   - [ ] Root: `apps/backend`
   - [ ] Build command: `npm run build`
6. [ ] Setup domain:
   - [ ] Point to bilancompetence.ai (or staging.bilancompetence.ai for now)
7. [ ] Configure auto-deployment:
   - [ ] Deploy on push to main
   - [ ] Preview deployments for PRs

**Definition of Done**:
- [ ] Frontend deployed to Vercel
- [ ] Backend Edge Functions configured
- [ ] Environment variables set
- [ ] Automatic deployment working

**Test**: Visit `https://[project].vercel.app` → should show landing page (in progress)

---

### TASK 1.3: GitHub Actions CI/CD Pipeline
**Assigned**: DevOps Team (1 person)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

**Create file**: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run test:e2e

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run deploy
```

**Definition of Done**:
- [ ] CI/CD pipeline created
- [ ] Tests run on push
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Green checkmark on PRs

---

### TASK 1.4: Local Development Environment Setup
**Assigned**: All Developers (12 FE + 12 BE)
**Duration**: 2 hours each
**Status**: 🔴 NOT STARTED

**Frontend Setup**:
```bash
# Clone repo
git clone https://github.com/lekesiz/bilancompetence.ai.git
cd bilancompetence.ai/apps/frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=[from 1.1]" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=[from 1.1]" >> .env.local

# Start dev server
npm run dev
# Should see: ✅ ready - started server on 0.0.0.0:3000
```

**Backend Setup**:
```bash
# Navigate to backend
cd ../backend

# Install dependencies
npm install

# Create .env
echo "DATABASE_URL=postgresql://..." > .env
echo "SUPABASE_URL=[from 1.1]" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=[from 1.1]" >> .env
echo "JWT_SECRET=[generate secure secret]" >> .env

# Start dev server
npm run dev
# Should see: ✅ Server running on http://localhost:3001
```

**Verification**:
- [ ] Frontend runs on port 3000 without errors
- [ ] Backend runs on port 3001 without errors
- [ ] Can access http://localhost:3000 in browser
- [ ] Console has no critical errors
- [ ] Git status clean

**Blockers to Watch**:
- Node version mismatch (must be 20+)
- Port already in use (change in package.json)
- Missing environment variables (use template file)

---

## 🔐 AUTHENTICATION SYSTEM (Oct 22-24)

### TASK 2.1: Backend Auth API - Registration Endpoint
**Assigned**: Backend Team (Developer 1 & 2)
**Duration**: 4 hours
**Status**: 🔴 NOT STARTED

**Files to Create**:
- `apps/backend/src/routes/auth.ts`
- `apps/backend/src/services/authService.ts`
- `apps/backend/src/validators/authValidator.ts`

**Endpoint**: `POST /api/auth/register`

```typescript
// Input
{
  "email": "marie@example.com",
  "password": "SecurePass123!",
  "full_name": "Marie Dupont",
  "role": "BENEFICIARY"
}

// Output (success)
{
  "status": "success",
  "message": "User created. Please verify your email.",
  "userId": "uuid-here"
}

// Output (error)
{
  "status": "error",
  "message": "Email already exists",
  "code": "DUPLICATE_EMAIL"
}
```

**Validation Rules**:
- Email: valid format, unique in database
- Password: min 12 chars, 1 uppercase, 1 digit, 1 special char
- Full name: required, max 255 chars
- Role: BENEFICIARY, CONSULTANT, or ORG_ADMIN

**Implementation Steps**:
1. [ ] Create Zod validation schema
2. [ ] Create authService functions:
   - [ ] validatePassword()
   - [ ] checkEmailExists()
   - [ ] createAuthUser() (Supabase)
   - [ ] createDBUser() (insert to DB)
   - [ ] sendVerificationEmail()
3. [ ] Create auth router:
   - [ ] Setup Express router
   - [ ] Add POST /register route
   - [ ] Error handling middleware
   - [ ] Logging middleware
4. [ ] Add to main app: `app.use('/api/auth', authRouter)`
5. [ ] Test endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123!",
       "full_name": "Test User",
       "role": "BENEFICIARY"
     }'
   ```

**Definition of Done**:
- [ ] Endpoint works without errors
- [ ] Validation works (test invalid inputs)
- [ ] User created in Supabase
- [ ] User created in PostgreSQL
- [ ] Verification email sent
- [ ] Error responses correct
- [ ] Unit tests written (min 5 tests)
- [ ] Code reviewed and approved

**Tests to Write**:
```typescript
describe('POST /api/auth/register', () => {
  test('should create user with valid data');
  test('should reject invalid email format');
  test('should reject weak password');
  test('should reject duplicate email');
  test('should send verification email');
  test('should handle database errors');
});
```

---

### TASK 2.2: Backend Auth API - Login Endpoint
**Assigned**: Backend Team (Developer 3 & 4)
**Duration**: 3 hours
**Status**: 🔴 NOT STARTED

**Endpoint**: `POST /api/auth/login`

```typescript
// Input
{
  "email": "marie@example.com",
  "password": "SecurePass123!"
}

// Output (success)
{
  "status": "success",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid-here",
    "email": "marie@example.com",
    "full_name": "Marie Dupont",
    "role": "BENEFICIARY"
  }
}
```

**Implementation**:
1. [ ] Validate credentials with Supabase Auth
2. [ ] Generate JWT tokens (access + refresh)
3. [ ] Return tokens + user info
4. [ ] Setup token refresh endpoint

**Tests**: 6+ tests covering success, invalid credentials, etc.

---

### TASK 2.3: Frontend Auth Components
**Assigned**: Frontend Team (Developer 1 & 2)
**Duration**: 5 hours
**Status**: 🔴 NOT STARTED

**Files to Create**:
- `apps/frontend/app/(auth)/register/page.tsx`
- `apps/frontend/app/(auth)/register/components/RegisterForm.tsx`
- `apps/frontend/app/(auth)/register/components/EmailPasswordStep.tsx`
- `apps/frontend/app/(auth)/register/components/PersonalInfoStep.tsx`
- `apps/frontend/app/(auth)/register/components/VerificationStep.tsx`
- `apps/frontend/hooks/useRegister.ts`

**Step-by-Step Registration**:

**Step 1: Email & Password**
```
Form Fields:
├─ Email input (type=email)
├─ Password input (type=password, with strength indicator)
└─ Confirm password input

Validation:
├─ Email format
├─ Password strength
└─ Passwords match
```

**Step 2: Personal Information**
```
Form Fields:
├─ Full name
├─ Age
├─ Current situation (dropdown)
└─ Location (optional)
```

**Step 3: Verification**
```
Display:
├─ Message: "We sent verification link to [email]"
├─ "Resend" button
└─ "Open email" button (optional)
```

**Component Structure**:
```typescript
// apps/frontend/app/(auth)/register/page.tsx
export default function RegisterPage() {
  return <RegisterForm />;
}

// apps/frontend/app/(auth)/register/components/RegisterForm.tsx
export function RegisterForm() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-md mx-auto">
      <FormProgress current={step} total={3} />

      {step === 1 && <EmailPasswordStep onNext={() => setStep(2)} />}
      {step === 2 && <PersonalInfoStep onNext={() => setStep(3)} />}
      {step === 3 && <VerificationStep />}
    </div>
  );
}
```

**Testing**:
- [ ] All form inputs work
- [ ] Validation messages display
- [ ] API calls succeed
- [ ] Redirect after completion
- [ ] Mobile responsive

---

### TASK 2.4: Frontend Login Page
**Assigned**: Frontend Team (Developer 3)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

**Files to Create**:
- `apps/frontend/app/(auth)/login/page.tsx`
- `apps/frontend/app/(auth)/login/components/LoginForm.tsx`
- `apps/frontend/hooks/useLogin.ts`

**Simple login form**:
```
┌──────────────────────────┐
│  BilanCompetence.AI      │
│                          │
│  Email                   │
│  [__________________]    │
│                          │
│  Password                │
│  [__________________]    │
│                          │
│  [Sign In]  [Sign Up]    │
│                          │
│  [Forgot Password?]      │
└──────────────────────────┘
```

---

### TASK 2.5: Database Schema Migration
**Assigned**: Backend Team (Developer 5 & 6)
**Duration**: 3 hours
**Status**: 🔴 NOT STARTED

**Create file**: `apps/backend/migrations/001_schema.sql`

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  age INT,
  role VARCHAR(50) DEFAULT 'BENEFICIARY',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bilans table
CREATE TABLE bilans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  consultant_id UUID REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR(50) DEFAULT 'PRELIMINARY',
  start_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bilans_beneficiary ON bilans(beneficiary_id);
CREATE INDEX idx_bilans_status ON bilans(status);

-- Row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- (add RLS policies)
```

**Migration Steps**:
1. [ ] Connect to Supabase SQL editor
2. [ ] Copy schema SQL
3. [ ] Execute
4. [ ] Verify tables created
5. [ ] Test queries

---

## 🎨 LANDING PAGE (Oct 23-24)

### TASK 3.1: Landing Page Hero Section
**Assigned**: Frontend Team (Developer 4)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

**File**: `apps/frontend/app/page.tsx`

```typescript
export default function Home() {
  return (
    <main>
      <HeroSection />
      <PainPointsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
    </main>
  );
}
```

**Hero Component**:
```
┌─────────────────────────────────────┐
│  Logo          [Features] [Pricing]  │
├─────────────────────────────────────┤
│                                     │
│  Transform Career Assessments       │
│         with AI                     │
│                                     │
│  Save 40% on admin time.            │
│  Automate Qualiopi compliance.      │
│                                     │
│  [Start Free Trial]  [Watch Demo]   │
│                                     │
│           [Illustration]            │
│                                     │
└─────────────────────────────────────┘
```

---

### TASK 3.2: Landing Page Other Sections
**Assigned**: Frontend Team (Developer 5 & 6)
**Duration**: 3 hours
**Status**: 🔴 NOT STARTED

**Sections**:
- Pain points (4 icons + descriptions)
- How it works (3-step process)
- Testimonials (3 cards, placeholder)
- Pricing (3-tier table)
- CTA footer

---

### TASK 3.3: Landing Page Styling & Responsiveness
**Assigned**: UI/UX Team (1 person)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

- [ ] Implement Tailwind CSS styling
- [ ] Test on mobile (320px, 768px, 1024px)
- [ ] Test on different browsers
- [ ] Optimize images
- [ ] Accessibility check

---

## 🧪 TESTING SETUP (Oct 22-24)

### TASK 4.1: Jest Unit Tests Setup
**Assigned**: QA Team (Automation - 1 person)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

**Create files**:
- `apps/frontend/jest.config.js`
- `apps/backend/jest.config.js`
- `apps/frontend/__tests__/components.test.tsx`
- `apps/backend/__tests__/auth.test.ts`

**Setup**:
```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

---

### TASK 4.2: Playwright E2E Tests
**Assigned**: QA Team (1 person)
**Duration**: 2 hours
**Status**: 🔴 NOT STARTED

**Setup**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Create**: `playwright.config.ts` + basic tests

---

## ✅ COMPLETION CHECKLIST (Oct 27)

### Frontend Complete?
- [ ] Landing page live
- [ ] Registration form works
- [ ] Login form works
- [ ] Responsive on mobile
- [ ] All pages load < 3s
- [ ] No console errors
- [ ] 60%+ test coverage

### Backend Complete?
- [ ] Auth endpoints working
- [ ] Database connected
- [ ] API responses correct
- [ ] Error handling working
- [ ] JWT tokens valid
- [ ] 60%+ test coverage
- [ ] No database errors

### Infrastructure Complete?
- [ ] Supabase ready
- [ ] Vercel deployed
- [ ] GitHub Actions passing
- [ ] CI/CD working
- [ ] Monitoring active
- [ ] Backups configured

### Quality Complete?
- [ ] All tests passing
- [ ] Code reviewed
- [ ] No critical bugs
- [ ] Performance baseline set
- [ ] Security scan passed
- [ ] Documentation updated

---

## 📊 TASK PRIORITY & DEPENDENCIES

```
Week 1 Critical Path:

Oct 21: Infrastructure (1.1, 1.2, 1.3, 1.4) ← Must complete first
  ↓
Oct 22: Auth Backend (2.1, 2.2) + DB (2.5)
  ↓
Oct 23: Auth Frontend (2.3, 2.4) + Landing (3.1, 3.2, 3.3)
  ↓
Oct 24: Testing (4.1, 4.2) + Final polish
  ↓
Oct 27: Deployment & Review
```

---

**Ready to execute! All tasks detailed and assigned.** 🚀
