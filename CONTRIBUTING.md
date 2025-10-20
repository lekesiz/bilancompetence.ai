# Contributing to BilanCompetence.AI

Welcome to the team! This guide will help you contribute effectively.

## 🎯 Getting Started

### Prerequisites
- Node.js 20+
- Git
- IDE (VS Code recommended)

### Local Setup
1. Clone the repository
2. Follow `SPRINT_1_SETUP.md` for development environment
3. Create a feature branch: `git checkout -b feature/your-feature`

## 📋 Development Workflow

### 1. Branch Naming
```
feature/feature-name          # New features
bugfix/bug-description        # Bug fixes
docs/documentation-update     # Documentation
refactor/code-improvement    # Code improvements
```

### 2. Commit Messages
Follow conventional commits:
```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
refactor: optimize database queries
test: add auth unit tests
```

### 3. Pull Requests
- Create PR against `main` branch
- Describe changes clearly
- Include testing steps
- Request review from at least 1 teammate

## 🧪 Testing

### Frontend
```bash
npm test                    # Run tests
npm run test:coverage      # Coverage report
```

### Backend
```bash
npm test                    # Run tests
npm run test:watch        # Watch mode
```

## 🎨 Code Style

### TypeScript
- Use strict mode
- Define interfaces for all types
- Avoid `any` types

### Components
- Use functional components (React hooks)
- Props should be typed
- Extract large components into smaller files

### Files
```
src/
├── components/            # Reusable components
├── pages/                 # Page components
├── utils/                 # Helper functions
├── types/                 # TypeScript types
├── constants/             # Constants
└── services/              # API services
```

## 📚 Documentation

- Update README.md for major changes
- Add comments for complex logic
- Document API endpoints
- Keep docs in `docs/` folder synchronized

## 🔄 Review Checklist

Before submitting PR, ensure:
- [ ] Code follows style guide
- [ ] Tests are passing
- [ ] No console errors
- [ ] Commit messages are clear
- [ ] Documentation is updated
- [ ] No hardcoded secrets

## 🐛 Bug Reports

Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if UI bug)
5. Environment details

## 📊 Development Standards

### Code Coverage
- Target: 80%+ coverage
- Minimum: 70%

### Performance
- API response time: < 500ms (p95)
- Page load time: < 3s
- Bundle size: < 300KB

### Security
- No exposed secrets
- SQL injection prevention
- XSS protection
- CSRF tokens

## 🚀 Release Process

1. Feature complete (all tests passing)
2. Code review approved
3. Merge to main
4. Tag version: `git tag v0.1.0`
5. Deploy to staging
6. Deploy to production

## 📞 Communication

- Daily standups: 9 AM
- Weekly sprint reviews: Friday 4 PM
- Slack for urgent issues
- GitHub for discussions

## 📝 Questions?

- Check existing documentation
- Ask in team Slack
- Create GitHub issue
- Contact project lead

---

Thank you for contributing to BilanCompetence.AI! 🎉
