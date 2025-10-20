# Development Guide

This guide covers setting up the development environment and running the BilanCompetence.AI application.

## Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

## Project Structure

```
apps/
├── frontend/          # Next.js 14 application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── public/       # Static assets
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── index.ts  # Server entry point
│   └── dist/         # Compiled output
```

## Initial Setup

### 1. Install Dependencies

```bash
# Root installation (monorepo)
npm install

# This installs dependencies for both frontend and backend
```

### 2. Environment Configuration

#### Frontend (.env.local)
```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

#### Backend (.env)
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
JWT_SECRET=super-secret-key-change-this
```

## Running the Application

### Option 1: Run Both (Frontend + Backend)

```bash
# From root directory
npm run dev

# This runs:
# - Frontend on http://localhost:3000
# - Backend on http://localhost:3001
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
# ✅ Server running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
# ✅ App running on http://localhost:3000
```

## Development Commands

### Frontend

```bash
cd apps/frontend

npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm test             # Run Jest tests
npm test:watch       # Run tests in watch mode
```

### Backend

```bash
cd apps/backend

npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm run start        # Run compiled server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm test             # Run Jest tests
npm test:watch       # Run tests in watch mode
```

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T08:00:00.000Z",
  "uptime": 120.5
}
```

### Authentication Routes
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify
POST /api/auth/refresh
```

## Code Style

We use **Prettier** for code formatting and **ESLint** for linting.

### Auto-format Code
```bash
npm run format
```

### Check Formatting
```bash
npm run lint
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Debugging

### Frontend (VS Code)

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/frontend/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/frontend"
    }
  ]
}
```

### Backend (VS Code)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Express",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/backend/dist/index.js",
      "cwd": "${workspaceFolder}/apps/backend",
      "preLaunchTask": "npm: build"
    }
  ]
}
```

## Database Setup (Supabase)

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Get URL and API keys

### 2. Run Migrations
```bash
cd apps/backend
npx supabase migration up
```

## Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Make Changes
```bash
# Edit files, test locally
```

### Commit Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

### Push & Create PR
```bash
git push origin feature/your-feature-name
# Then create PR on GitHub
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Force type checking
npm run type-check

# Clear TypeScript cache
rm -rf apps/*/dist
```

## Performance Tips

1. **Use React DevTools**: Debug React components in browser
2. **Use Next.js DevTools**: Monitor performance in development
3. **Use Vercel Analytics**: Track performance in production
4. **Use Chrome DevTools**: Network and performance analysis

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Getting Help

1. Check `CONTRIBUTING.md` for contribution guidelines
2. Review `SPRINT_1_DETAILED_TASKS.md` for current tasks
3. Check GitHub Issues for known problems
4. Ask in team Slack channel

---

**Happy coding! 🚀**
