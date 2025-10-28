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

We use **Jest** for unit and integration testing. All new features and bug fixes must be accompanied by tests.

### Backend

- **Run all tests:**

  ```bash
  npm test --workspace=@bilancompetence/backend
  ```

- **Run tests in watch mode:**

  ```bash
  npm run test:watch --workspace=@bilancompetence/backend
  ```

- **Generate coverage report:**

  ```bash
  npm test -- --coverage --workspace=@bilancompetence/backend
  ```

We aim for a high test coverage. Please make sure your changes do not decrease the coverage.

### Frontend

```bash
npm test --workspace=@bilancompetence/frontend
npm run test:coverage --workspace=@bilancompetence/frontend
```

## 🎨 Code Style

We use **ESLint** and **Prettier** to enforce a consistent coding style. Before committing your changes, make sure to run the following commands:

- **Format your code:**

  ```bash
  npm run format --workspace=@bilancompetence/backend
  ```

- **Lint your code:**

  ```bash
  npm run lint --workspace=@bilancompetence/backend
  ```

We also use **Husky** and **lint-staged** to automatically format and lint your code before each commit.

## 📚 Documentation

### API Documentation

We use **Swagger** for API documentation. The documentation is automatically generated from JSDoc comments in the source code.

- **View the API documentation:**

  Run the development server and go to `http://localhost:3001/api-docs`.

- **Update the API documentation:**

  When adding or updating an endpoint, make sure to add or update the JSDoc comments.

### Performance Testing

We use **Artillery** for performance testing.

- **Run load test:**

  ```bash
  npm run test:load --workspace=@bilancompetence/backend
  ```

- **Run stress test:**

  ```bash
  npm run test:stress --workspace=@bilancompetence/backend
  ```


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
