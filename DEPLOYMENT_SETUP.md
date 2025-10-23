# Frontend Deployment Setup Guide

## Problem
Frontend deployment to Vercel is not working automatically from GitHub pushes.

## Root Cause
The frontend project needs to be explicitly linked in Vercel dashboard as a separate project within the monorepo structure.

## Solution Steps

### Option 1: Manual Setup via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/lekesiz-projects/bilancompetence-ai-frontend

2. **Create New Project**
   - Click "Add New Project"
   - Connect GitHub repository: `lekesiz/bilancompetence.ai`
   - Select the project

3. **Configure Project Settings**
   - **Project Name**: `bilancompetence-ai-frontend`
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (set in Vercel dashboard)
   ```
   NEXT_PUBLIC_API_URL=https://bilancompetence-ai-backend.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://ommidwwqqrhupmhaqghx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbWlkd3dxcXJodXBtaGFxZ2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0MDA0MjcsImV4cCI6MjAyNDk3NjQyN30.c8uN-S0iNsWIRBMnGDMKO3tUNPP5w78kN5hgE6OgMno
   NEXT_PUBLIC_APP_NAME=BilanCompetence.AI
   NEXT_PUBLIC_APP_URL=https://bilancompetence.ai
   ```
   **IMPORTANT**: Make sure these are set as **Plaintext**, NOT Secret!

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy from `apps/frontend`

### Option 2: Automated Setup via GitHub Secrets

1. **Add GitHub Secrets**
   - Go to: GitHub → Settings → Secrets and variables → Actions
   - Add the following secrets:
     ```
     VERCEL_TOKEN = your-vercel-token
     VERCEL_ORG_ID = team_lekesiz
     VERCEL_PROJECT_ID_FRONTEND = bilancompetence-ai-frontend
     NEXT_PUBLIC_SUPABASE_URL = https://ommidwwqqrhupmhaqghx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = (your-anon-key)
     ```

2. **GitHub Actions will automatically deploy** on push to `main` branch

### Option 3: Manual CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend from project root
./deploy-frontend.sh
```

## Verification

After deployment:

1. Visit: https://vercel.com/lekesiz-projects
2. You should see both projects:
   - ✅ `bilancompetence-ai-backend` (currently working)
   - ✅ `bilancompetence-ai-frontend` (should be working after setup)

3. Visit the frontend URL (once deployed)
4. Check that it loads with proper env vars:
   - API calls should go to backend URL
   - Should not show "environment variable missing" errors

## Files Involved

- `vercel.json` - Root-level Vercel configuration
- `apps/frontend/.vercel/project.json` - Frontend-specific Vercel config
- `deploy-frontend.sh` - Manual deployment script
- `.github/workflows/deploy-frontend.yml` - GitHub Actions workflow

## Troubleshooting

### "NEXT_PUBLIC_API_URL references Secret"
- Make sure in Vercel dashboard, this variable is set as **Plaintext**, NOT Secret
- Delete and recreate if needed

### Frontend still not deploying
- Check Vercel GitHub integration is authorized
- Verify project is linked to correct GitHub repository
- Check deployment logs in Vercel dashboard

### Build fails
- Ensure Node version is 20.x
- Check that frontend can build locally: `cd apps/frontend && npm run build`
- Review build logs in Vercel dashboard

## References

- [Vercel Monorepo Guide](https://vercel.com/docs/projects/monorepos)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/github-integration)
