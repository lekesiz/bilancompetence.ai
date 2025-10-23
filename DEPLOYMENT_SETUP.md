# Monorepo Deployment Setup Guide

## Architecture
- **GitHub**: Single repository with frontend and backend in monorepo
- **Vercel**: Single project that deploys both frontend and backend
- **Backend**: Currently deployed as active Vercel project
- **Frontend**: Deployed via same Vercel backend project

This approach ensures Git and Vercel stay synchronized with same project structure.

## Deployment Strategy

### Single Project Monorepo Deployment

The project is now deployed as a **single Vercel project** containing both frontend and backend:

1. **Vercel Project**: `bilancompetence-ai-backend`
   - Builds entire monorepo via root `npm run build`
   - Frontend output: `apps/frontend/.next`
   - Backend output: `apps/backend/dist`

2. **How it works**:
   - Root `package.json` build script runs both `apps/frontend` and `apps/backend` builds
   - Vercel detects and deploys both from single project
   - `.vercelignore` manages which files are included

### Current Status

✅ **Vercel Backend Project**: `bilancompetence-ai-backend`
- **Status**: Actively deployed and working
- **URL**: https://bilancompetence-ai-backend.vercel.app
- **Type**: Node.js/Express backend

✅ **Frontend**: Also deploying via same Vercel project
- **Built by**: Root monorepo build command
- **Output**: `apps/frontend/.next`
- **Serves at**: Backend project's preview/production URLs

### Environment Variables

Set these in Vercel dashboard for the `bilancompetence-ai-backend` project:

```
NEXT_PUBLIC_API_URL=https://bilancompetence-ai-backend.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://ommidwwqqrhupmhaqghx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbWlkd3dxcXJodXBtaGFxZ2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0MDA0MjcsImV4cCI6MjAyNDk3NjQyN30.c8uN-S0iNsWIRBMnGDMKO3tUNPP5w78kN5hgE6OgMno
NEXT_PUBLIC_APP_NAME=BilanCompetence.AI
NEXT_PUBLIC_APP_URL=https://bilancompetence.ai
```

**IMPORTANT**: Set these as **Plaintext**, NOT Secret!

### Verification

After git push:

1. Check Vercel dashboard: https://vercel.com/lekesiz-projects
2. Look for `bilancompetence-ai-backend` project
3. Deployment should be triggered automatically
4. Frontend will be served from the same deployment

Both frontend and backend are now part of the same Git repository and Vercel project! ✅

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
