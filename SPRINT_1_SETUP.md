# SPRINT 1: Foundation Setup Guide

**Duration**: Week 1 (Oct 21-27, 2025)
**Goal**: Complete backend/frontend boilerplate + auth system
**Status**: 🟡 READY TO START

---

## Step 1: Frontend Setup (Next.js 14)

### 1.1 Create Next.js Project

```bash
cd apps/frontend

# Create Next.js 14 with TypeScript + Tailwind
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --app \
  --no-eslint \
  --import-alias "@/*"
```

### 1.2 Install Dependencies

```bash
npm install
npm install -D @types/node @types/react eslint-config-next

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-slot \
  class-variance-authority clsx tailwind-merge

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# HTTP client
npm install axios swr

# State management
npm install zustand

# Date handling
npm install dayjs

# Icons
npm install lucide-react

# Environment variables
npm install dotenv-cli
```

### 1.3 Configure TypeScript

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true
  }
}
```

### 1.4 Setup Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

---

## Step 2: Backend Setup (Node.js + Express)

### 2.1 Create Backend Project

```bash
cd apps/backend

npm init -y
npm install express cors dotenv helmet morgan uuid
npm install @supabase/supabase-js
npm install -D typescript @types/node @types/express nodemon
```

### 2.2 Create TypeScript Config

```bash
npx tsc --init
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  }
}
```

### 2.3 Create src/index.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### 2.4 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "echo 'Linting...'",
    "test": "echo 'Testing...'"
  }
}
```

---

## Step 3: Supabase Setup

### 3.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project (name: `bilancompetence-dev`)
3. Region: EU (Frankfurt)
4. Copy:
   - Project URL: `https://[project].supabase.co`
   - Anon Key: `[anon-key]`
   - Service Role Key: `[service-role-key]`

### 3.2 Create Database Schema

Go to Supabase SQL Editor and run:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'BENEFICIARY',
  organization_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  siret VARCHAR(14),
  subscription_plan VARCHAR(50) DEFAULT 'STARTER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bilans table
CREATE TABLE bilans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR(50) DEFAULT 'PRELIMINARY',
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_bilans_beneficiary ON bilans(beneficiary_id);
CREATE INDEX idx_bilans_consultant ON bilans(consultant_id);
CREATE INDEX idx_bilans_status ON bilans(status);
```

### 3.3 Setup Supabase Auth

1. In Supabase dashboard → Authentication → URL Configuration
2. Set Site URL: `http://localhost:3000`
3. Set Redirect URLs: `http://localhost:3000/auth/callback`

---

## Step 4: Authentication API

### 4.1 Create Auth Routes (backend)

Create `src/routes/auth.ts`:

```typescript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create user record
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      full_name,
      role,
    });

    res.status(201).json({ message: 'User created', userId: data.user.id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
```

### 4.2 Add Route to Main App

```typescript
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);
```

---

## Step 5: Frontend Auth Component

### 5.1 Create Login Page

Create `app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(12, 'Password too short'),
});

export default function LoginPage() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        data
      );

      // Store token
      localStorage.setItem('token', response.data.session.access_token);

      // Redirect
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-96 space-y-4">
        <h1 className="text-3xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          {...form.register('email')}
          className="w-full px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          {...form.register('password')}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
```

---

## Step 6: Git Commit

```bash
git add .
git commit -m "Sprint 1: Initial project setup

- Next.js 14 frontend with TypeScript + Tailwind
- Express backend with Node.js
- Supabase PostgreSQL setup
- Authentication API endpoints
- Login form component

Status: Foundation ready for database schema migration"
```

---

## ✅ Sprint 1 Completion Checklist

- [ ] Next.js project running (`npm run dev` on port 3000)
- [ ] Express backend running (`npm run dev` on port 3001)
- [ ] Supabase database schema created
- [ ] Auth endpoints working (test with Postman/Insomnia)
- [ ] Login form displays correctly
- [ ] Environment variables configured
- [ ] All code committed to Git
- [ ] Zero console errors
- [ ] Landing page deployed (Vercel)
- [ ] 5 beta users identified for Week 2

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Next Sprint**: User dashboards and bilan management flows
