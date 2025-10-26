# FAZA 5: Development Roadmap & Sprint Breakdown

**Tarih**: 20 Ekim 2025
**Durum**: PLANNING
**Amacı**: MVP'yi 8 haftada teslim etmek için detaylı sprint planlaması

---

## I. DEVELOPMENT TIMELINE (8 hafta)

```
WEEK 1-2: Foundation & Setup (Oct 21 - Nov 3)
  ├─ Project initialization
  ├─ Database setup
  ├─ Auth system
  └─ Landing page

WEEK 3-4: Core Flows (Nov 4 - Nov 17)
  ├─ User dashboards
  ├─ Bilan management
  ├─ Profile setup
  └─ Messaging system

WEEK 5-6: Assessment & AI (Nov 18 - Dec 1)
  ├─ Assessment forms
  ├─ Gemini integration
  ├─ Competency analysis
  └─ Recommendations

WEEK 7-8: Reports, Testing & Launch (Dec 2 - Dec 15)
  ├─ Document generation
  ├─ Testing & QA
  ├─ Performance optimization
  └─ Beta launch
```

---

## II. DETAILED SPRINT BREAKDOWN

### SPRINT 1: Foundation (Week 1 - Oct 21-27)

**Focus**: Project infrastructure, auth, database

**User Stories**:

```
US-001: Initialize Next.js project
- Acceptance: ✅ npm run dev works, no errors
- Tasks:
  1. Create Next.js 14 project
  2. Configure TypeScript, ESLint, Prettier
  3. Setup Tailwind CSS + Shadcn
  4. Configure environment variables
  5. Setup git workflow
- Estimate: 4 hours
- Developer: Manus AI

US-002: Setup Neon PostgreSQL Database
- Acceptance: ✅ Database schema migrated, RLS active
- Tasks:
  1. Create Supabase project
  2. Create tables (users, organizations, bilans, etc.)
  3. Setup RLS policies
  4. Configure auth
  5. Create migrations
- Estimate: 6 hours
- Developer: Manus AI

US-003: Email/password authentication
- Acceptance: ✅ Register, login, logout, reset password working
- Tasks:
  1. Create auth API endpoints
  2. JWT token handling (secure httpOnly cookies)
  3. Email verification flow
  4. Password reset flow
  5. Session management
- Estimate: 8 hours
- Developer: Manus AI

US-004: Role-based access control
- Acceptance: ✅ 3 roles (BENEFICIARY, CONSULTANT, ADMIN) with different dashboards
- Tasks:
  1. Create role middleware
  2. Setup permission checks
  3. Create role-specific layouts
  4. Test access restrictions
- Estimate: 4 hours
- Developer: Manus AI

US-005: Landing page (MVP version)
- Acceptance: ✅ Hero, pain points, CTA sections visible
- Tasks:
  1. Design hero section
  2. Add pain points section
  3. Add testimonials section (placeholder)
  4. Add sign-up CTA
  5. Mobile responsive
- Estimate: 6 hours
- Developer: Manus AI

**Sprint Total**: 28 hours
**Deliverables**: Deployed landing page + auth system
**Testing**: Manual auth flow testing

---

### SPRINT 2: User Flows (Week 2 - Oct 28-Nov 3)

**Focus**: Dashboards, user profiles, basic bilan management

**User Stories**:

```
US-006: Beneficiary profile setup wizard
- Acceptance: ✅ Complete wizard, profile saved, redirect to dashboard
- Tasks:
  1. Create multi-step form (age, situation, location)
  2. Add profile picture upload (optional)
  3. Save to database
  4. Add progress indicator
- Estimate: 5 hours

US-007: Consultant profile setup
- Acceptance: ✅ Professional info saved, calendar setup started
- Tasks:
  1. Create professional form (certifications, specializations)
  2. Upload Qualiopi certificate
  3. Add availability calendar (simple)
- Estimate: 6 hours

US-008: Beneficiary dashboard
- Acceptance: ✅ Active bilan card, progress tracker, messages visible
- Tasks:
  1. Create dashboard layout
  2. Display active bilan (if exists)
  3. Show progress bar
  4. Show recent messages
- Estimate: 6 hours

US-009: Consultant dashboard
- Acceptance: ✅ Active bilans list, pending actions, schedule visible
- Tasks:
  1. Create dashboard layout
  2. Display bilans (list + quick stats)
  3. Show pending actions
  4. Show this week's schedule
  5. Add action buttons
- Estimate: 8 hours

US-010: Bilan creation (consultant)
- Acceptance: ✅ Consultant can create new bilan, beneficiary receives invite
- Tasks:
  1. Create form (beneficiary search/invite)
  2. Save to database
  3. Send invitation email
  4. Handle beneficiary acceptance
- Estimate: 6 hours

**Sprint Total**: 31 hours
**Deliverables**: All user dashboards working
**Testing**: Manual flow testing with 2 test users

---

### SPRINT 3: Assessment Module (Week 3 - Nov 4-10)

**Focus**: Self-assessment form, data collection

**User Stories**:

```
US-011: Multi-step assessment form (UI)
- Acceptance: ✅ All 5 steps accessible, form persists on browser
- Tasks:
  1. Create form layouts (work history, education, skills, values, constraints)
  2. Add client-side validation
  3. Add progress bar
  4. Auto-save to localStorage
  5. Mobile responsive
- Estimate: 8 hours

US-012: Skills checklist component
- Acceptance: ✅ 100+ skills searchable, ratings working
- Tasks:
  1. Create skills database/fixture
  2. Build searchable list component
  3. Add rating controls (star, frequency, interest)
  4. Handle custom skill addition
- Estimate: 6 hours

US-013: Save assessment to database
- Acceptance: ✅ Complete assessment saved, accessible by consultant
- Tasks:
  1. Create assessment API endpoint
  2. Validate data server-side
  3. Save to competencies table
  4. Notify consultant
- Estimate: 5 hours

US-014: Consultant review assessment
- Acceptance: ✅ Consultant sees results, can add notes, validate skills
- Tasks:
  1. Create assessment view (consultant)
  2. Add validation controls
  3. Add notes textarea
  4. Save consultant changes
- Estimate: 6 hours

**Sprint Total**: 25 hours
**Deliverables**: Full assessment flow working (beneficiary → consultant)
**Testing**: User acceptance testing with beta users (2-3 people)

---

### SPRINT 4: Messaging & Admin (Week 4 - Nov 11-17)

**Focus**: Communication, admin dashboard

**User Stories**:

```
US-015: Basic messaging system
- Acceptance: ✅ Send/receive messages, mark as read
- Tasks:
  1. Create messages API
  2. Build message UI (thread view)
  3. Add real-time or polling updates
  4. Email notifications
  5. Message search
- Estimate: 8 hours

US-016: Organization admin dashboard
- Acceptance: ✅ View bilans, consultants, stats
- Tasks:
  1. Create admin dashboard layout
  2. Display organization stats (bilans, team)
  3. Show consultant list
  4. Display billing info
- Estimate: 6 hours

US-017: Session tracking & scheduling
- Acceptance: ✅ Consultant can log sessions, mark attended/absent
- Tasks:
  1. Create session form
  2. Link to calendar/bilan
  3. Add duration tracking
  4. Save to database
- Estimate: 5 hours

US-018: Basic analytics
- Acceptance: ✅ Admin sees metrics (completed bilans, satisfaction, compliance)
- Tasks:
  1. Create analytics endpoint
  2. Build charts (Recharts)
  3. Add date range filters
  4. Add export to CSV
- Estimate: 6 hours

**Sprint Total**: 25 hours
**Deliverables**: Messaging + admin dashboard complete
**Testing**: Admin flow testing

---

### SPRINT 5: AI Integration (Week 5 - Nov 18-24)

**Focus**: Gemini API, competency analysis, recommendations

**User Stories**:

```
US-019: Integrate Gemini API
- Acceptance: ✅ Call succeeds, returns JSON, cost tracked
- Tasks:
  1. Setup Gemini API account
  2. Create API wrapper/SDK
  3. Test with sample prompt
  4. Setup error handling
  5. Setup logging/monitoring
  6. Test cost calculations
- Estimate: 6 hours

US-020: Competency analysis prompt
- Acceptance: ✅ Analyze assessment, extract insights, rank skills
- Tasks:
  1. Create analysis prompt
  2. Parse structured response (JSON)
  3. Store results in database
  4. Display to consultant
- Estimate: 6 hours

US-021: France Travail API integration
- Acceptance: ✅ Fetch job listings, ROME codes, return matches
- Tasks:
  1. Register France Travail account
  2. Test API endpoints
  3. Create wrapper SDK
  4. Cache responses (24h TTL)
- Estimate: 5 hours

US-022: Job matching & recommendations
- Acceptance: ✅ Show recommended jobs based on competencies
- Tasks:
  1. Create matching algorithm
  2. Fetch jobs from France Travail
  3. Score & rank matches
  4. Display to beneficiary
- Estimate: 7 hours

**Sprint Total**: 24 hours
**Deliverables**: AI analysis + job recommendations working
**Testing**: Prompt testing with various profiles, API rate limit testing

---

### SPRINT 6: Document Generation (Week 6 - Nov 25-Dec 1)

**Focus**: PDF generation, reports

**User Stories**:

```
US-023: PDF template system
- Acceptance: ✅ Generate report from template + data
- Tasks:
  1. Choose PDF library (puppeteer or html2pdf)
  2. Create HTML templates (3 report types)
  3. Build data mapping logic
  4. Test PDF output
- Estimate: 8 hours

US-024: Preliminary report generation
- Acceptance: ✅ Consultant clicks "Generate", PDF created in 30 sec
- Tasks:
  1. Create template (objectives, timeline, etc.)
  2. Fetch data from database
  3. Generate PDF
  4. Save to S3
  5. Email to beneficiary
- Estimate: 6 hours

US-025: Investigation & final report generation
- Acceptance: ✅ Both reports working, downloadable
- Tasks:
  1. Create investigation report template
  2. Create final report template (includes recommendations)
  3. Generate & save
  4. Add version control
- Estimate: 7 hours

US-026: Report delivery & distribution
- Acceptance: ✅ Email delivery, download links, archive
- Tasks:
  1. Setup SendGrid integration
  2. Email report to beneficiary
  3. Add download interface
  4. Archive documents
- Estimate: 4 hours

**Sprint Total**: 25 hours
**Deliverables**: Full report generation working
**Testing**: Generate reports for test bilans, verify PDF quality

---

### SPRINT 7: Testing & Optimization (Week 7 - Dec 2-8)

**Focus**: Bug fixes, performance, security, QA

**User Stories**:

```
US-027: Automated testing (Jest)
- Acceptance: ✅ 80%+ coverage, all green
- Tasks:
  1. Write unit tests (auth, utils, components)
  2. Write integration tests (API endpoints)
  3. Setup CI/CD (GitHub Actions)
  4. Setup coverage reports
- Estimate: 10 hours

US-028: E2E testing (Playwright)
- Acceptance: ✅ All 3 main flows tested
- Tasks:
  1. Create test scenarios
  2. Write E2E tests
  3. Add cross-browser testing
  4. Add mobile testing
- Estimate: 8 hours

US-029: Performance optimization
- Acceptance: ✅ Page load < 3s, API < 500ms
- Tasks:
  1. Profile application (Next.js Analytics)
  2. Optimize images (next/image)
  3. Optimize database queries
  4. Setup caching (Redis, CDN)
  5. Test with real data
- Estimate: 8 hours

US-030: Security audit
- Acceptance: ✅ Pass OWASP checklist
- Tasks:
  1. Check auth vulnerabilities
  2. Check XSS prevention
  3. Check SQL injection prevention
  4. Check CSRF token
  5. Check data encryption
- Estimate: 6 hours

US-031: Bug fixes & stabilization
- Acceptance: ✅ Zero critical bugs, all known issues logged
- Tasks:
  1. Test all flows with real users (beta)
  2. Log bugs in issue tracker
  3. Prioritize & fix
  4. Regression test
- Estimate: 12 hours

**Sprint Total**: 44 hours
**Deliverables**: Test suite, security clearance, performance metrics
**Testing**: Load testing (1000 concurrent users), security scan

---

### SPRINT 8: Launch & Deployment (Week 8 - Dec 9-15)

**Focus**: Final polish, deployment, launch

**User Stories**:

```
US-032: Production deployment setup
- Acceptance: ✅ App running on Vercel, database replicated
- Tasks:
  1. Setup production environment
  2. Configure secrets & env vars
  3. Setup monitoring (Sentry, Analytics)
  4. Setup backups & disaster recovery
  5. Final smoke tests
- Estimate: 6 hours

US-033: Beta user onboarding
- Acceptance: ✅ 5 beta users signed up, first bilan completed
- Tasks:
  1. Prepare onboarding materials
  2. Create welcome email sequence
  3. Setup support channel (Slack/Discord)
  4. Collect initial feedback
- Estimate: 4 hours

US-034: Documentation & guides
- Acceptance: ✅ User guides, admin guides, technical docs available
- Tasks:
  1. Write beneficiary user guide
  2. Write consultant guide
  3. Write admin guide
  4. Create video tutorials (optional)
  5. Create FAQ
- Estimate: 6 hours

US-035: Launch & monitoring
- Acceptance: ✅ App live, 99%+ uptime, support ready
- Tasks:
  1. Deploy to production
  2. Monitor for errors (first 48h)
  3. Be on-call for support
  4. Collect metrics
  5. Prepare launch announcement
- Estimate: 4 hours

**Sprint Total**: 20 hours
**Deliverables**: Production-ready app, beta users active, documentation complete
**Testing**: Load testing, 24h production monitoring

---

## III. RESOURCE ALLOCATION

**Team Structure**:
```
Project Manager (NETZ INFORMATIQUE): 40 hours/week
  - Sprint planning, daily standups, issue tracking
  - Stakeholder communication
  - Quality assurance

Lead Developer (Manus AI): 40 hours/week
  - Backend architecture, API development
  - Database design & optimization
  - Technical decisions

Frontend Developer (Manus AI or External): 40 hours/week
  - UI/component development
  - React/Next.js implementation
  - Frontend testing

QA Engineer (Internal or External): 20 hours/week
  - Test planning
  - Manual testing
  - Bug reporting & tracking
```

**Total Team Capacity**: 140 hours/week
**MVP Duration**: 8 weeks = 1,120 hours

---

## IV. RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API delays (Gemini, FT) | Medium | High | Have local fallback data |
| Scope creep | High | Medium | Strict MVP scope, no feature additions |
| Team illness/turnover | Low | High | Document code, pair programming |
| Performance issues | Medium | Medium | Performance testing in Sprint 7 |
| Security vulnerabilities | Low | Critical | Regular security audits, pen testing |

---

## V. SUCCESS CRITERIA (End of Sprint 8)

✅ **Functional MVP**:
- [ ] All 3 user roles working
- [ ] 20+ bilans completed in beta
- [ ] Zero critical bugs
- [ ] Reports generating correctly

✅ **Performance**:
- [ ] Page load time < 3s (p95)
- [ ] API response < 500ms (p95)
- [ ] Uptime > 99%
- [ ] Support < 1 second latency

✅ **Business**:
- [ ] 5+ beta customers signed up
- [ ] NPS > 50 from beta
- [ ] Cost per feature tracked
- [ ] Revenue projections validated

✅ **Documentation**:
- [ ] User guides complete
- [ ] Technical documentation complete
- [ ] API docs (OpenAPI) complete
- [ ] Admin playbooks ready

---

**HAZIRLAYANLAR**: Teknik Yönetim Ekibi
**TARİH**: 20 Ekim 2025
**SONRAKI FAZA**: FAZA 6 - Go-To-Market Strategy
