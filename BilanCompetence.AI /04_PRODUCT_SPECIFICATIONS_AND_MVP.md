# FAZA 3: Detaylı Ürün Spesifikasyonları & MVP Tanımı

**Tarih**: 20 Ekim 2025
**Durum**: PRODUCT DESIGN
**Amacı**: MVP kapsamını tanımlamak ve detaylı feature specifications hazırlamak

---

## I. ÜRÜN VISION

### A. Product Statement

**BilanCompetence.AI** is the first AI-powered SaaS platform specifically designed for career assessment professionals in France, combining:
- Automated compliance (Qualiopi)
- Intelligent skill analysis (Gemini AI)
- Real labor market data (France Travail API)
- Exceptional user experience (Consultant + Beneficiary)

**Mission**: "Empower career consultants with AI and automation, so they can focus on what they do best: transforming lives."

---

## II. MVP SCOPE (8 hafta, 8 hafta delivery)

### A. MVP Success Criteria

✅ **Funktional**:
- 3 complete user flows (Beneficiary, Consultant, Admin)
- Minimum 20 bilans completed successfully
- Zero critical bugs
- Document generation 100% successful

✅ **Business**:
- 5+ consultant beta testers
- 80%+ satisfaction (NPS > 50)
- $0 customer acquisition cost (beta)
- 1+ case studies/testimonials

✅ **Technical**:
- API response time < 500ms (p95)
- Uptime > 99%
- Gemini API working + cost validated
- Database schema stable

---

### B. MVP Feature Set (MoSCoW Prioritization)

#### MUST HAVE (Core MVP)

**1. Authentication & User Management**
- Email/password registration
- Email verification
- Login/logout
- Password reset
- 3 role types: BENEFICIARY, CONSULTANT, ORG_ADMIN
- Profile setup wizard

**2. Bilan Management**
- Create new bilan
- List bilans (filtered by role)
- View bilan details
- Update bilan status (PRELIMINARY → INVESTIGATION → CONCLUSION → COMPLETED)
- Bilan timeline tracking

**3. Competency Assessment**
- Self-assessment form (10-20 questions)
- Competency scale (Beginner, Intermediate, Advanced, Expert)
- Interest level (1-10 scale)
- Consultant can validate/adjust

**4. Document Generation**
- Auto-generate PDF report (preliminary)
- Auto-generate PDF report (investigation)
- Auto-generate PDF report (conclusion + action plan)
- Download capability

**5. Basic Messaging**
- Consultant ↔ Beneficiary messages
- Notification on new message
- Mark as read/unread

**6. Admin Dashboard**
- Organization overview
- Active bilans count
- User management
- Basic analytics (completed, satisfaction)

---

#### SHOULD HAVE (High Priority, Phase 2)

**7. AI-Powered Recommendations**
- Skill extraction analysis (from CV or text)
- Automated competency suggestions
- Job matching (France Travail ROME codes)
- Training recommendations (from DB)

**8. France Travail Integration**
- Display available jobs (filtered by competencies)
- Show ROME codes and occupations
- Display regional employment statistics

**9. Advanced Reporting**
- Satisfaction survey (post-bilan)
- Completion metrics
- Qualiopi compliance checklist
- Export to Excel/PDF

**10. Scheduling/Calendar**
- Consultant availability slots
- Beneficiary can book sessions
- Reminder emails
- Session tracking (attended/absent)

---

#### COULD HAVE (Nice-to-have, Phase 3+)

**11. Qualiopi Compliance Module**
- Indicator tracking
- Evidence collection
- Audit-ready reports
- Automated compliance checks

**12. Mobile Responsiveness**
- Full mobile UI
- Touch-friendly forms
- Mobile app (React Native) - Optional

**13. Advanced Analytics**
- Custom dashboards
- Trend analysis
- Performance benchmarking
- ROI calculations

**14. Marketplace Features**
- Consultant directory
- Ratings/reviews
- Booking system
- Payment integration

---

#### WON'T HAVE (Out of Scope for MVP)

- ❌ Video conferencing (use Google Meet/Zoom external)
- ❌ Multilingual (French only for MVP)
- ❌ Mobile app (web responsive only)
- ❌ Advanced AR/VR features
- ❌ Blockchain integration
- ❌ White-label/multi-tenant per org

---

## III. USER FLOWS & WIREFRAMES

### A. Beneficiary User Flow

```
1. LANDING PAGE
   ├─ Learn about bilan de compétences
   ├─ View testimonials
   └─ "Start Assessment" → Register

2. REGISTRATION (3 steps)
   ├─ Email + Password
   ├─ Personal info (name, age, email)
   ├─ Situation (employed, job seeker, reconversion)
   └─ Email verification

3. DASHBOARD
   ├─ Active bilan card (if exists)
   ├─ Status tracker (Preliminary → Investigation → Conclusion)
   ├─ Progress bar (% complete)
   ├─ Next steps reminder
   └─ Messages from consultant

4. SELF-ASSESSMENT FLOW (30 min)
   ├─ Career history form (work experience)
   ├─ Education form
   ├─ Skills checklist (100+ skills)
   ├─ Interest assessment (values, motivations)
   └─ Auto-save every 30 sec

5. WAITING FOR CONSULTANT
   ├─ View consultant profile
   ├─ Message consultant
   ├─ View consultant's calendar
   └─ Schedule first meeting

6. BETWEEN SESSIONS
   ├─ Complete assigned tasks
   ├─ Review recommended jobs
   ├─ Read resources/blog posts
   └─ Message consultant with questions

7. FINAL REPORT
   ├─ View AI-generated recommendations
   ├─ Review action plan
   ├─ Download report (PDF)
   ├─ Complete satisfaction survey
   └─ Export plan or share

8. POST-BILAN
   ├─ Optional 30-day follow-up survey
   ├─ Access archived documents
   └─ Continue reading resources
```

### B. Consultant User Flow

```
1. REGISTRATION & PROFILE (10 min)
   ├─ Email + password
   ├─ Professional info (name, certifications)
   ├─ Specializations (sector, target audience)
   ├─ Availability calendar
   └─ Qualiopi certificate upload

2. DASHBOARD
   ├─ Active bilans (count & status)
   ├─ Pending actions (new assessments, tasks)
   ├─ This week's schedule
   ├─ Upcoming meetings
   └─ Messages count (unread)

3. MANAGE BILANS
   ├─ View all active bilans (list view)
   ├─ Filter by status/date
   ├─ Quick stats per bilan
   └─ Bulk actions (generate reports, email)

4. BILAN DETAILS PAGE
   ├─ Beneficiary profile & history
   ├─ Self-assessment results
   ├─ Consultant notes section
   ├─ AI analysis & recommendations
   ├─ Document generation button
   ├─ Message section
   └─ Session tracking

5. ASSESSMENT REVIEW
   ├─ View beneficiary's self-assessment
   ├─ Validate/adjust competency levels
   ├─ Add notes and observations
   ├─ Trigger AI analysis
   └─ Mark as reviewed

6. REPORT GENERATION
   ├─ One-click: Generate all documents
   ├─ Preview before download
   ├─ Download PDF
   ├─ Email to beneficiary
   └─ Archive to cloud

7. SESSION MANAGEMENT
   ├─ View available time slots
   ├─ Accept beneficiary bookings
   ├─ Send calendar invites
   ├─ Record session outcome (attended/absent)
   └─ Add session notes

8. COMMUNICATIONS
   ├─ Message beneficiary
   ├─ Mark important messages
   ├─ Search conversation history
   └─ Upload documents to thread

9. ANALYTICS
   ├─ Bilans completed this month
   ├─ Average time per bilan
   ├─ Satisfaction scores
   ├─ Compliance checklist status
   └─ Export monthly report
```

### C. Organization Admin Flow

```
1. SETUP (30 min)
   ├─ Organization details (name, SIRET, address)
   ├─ Subscription plan selection
   ├─ Billing info
   ├─ Team members (consultants) invitation
   └─ Branding (logo, colors)

2. DASHBOARD
   ├─ Organization statistics
   ├─ Active bilans total
   ├─ Team size & activity
   ├─ Compliance status
   ├─ Revenue/billing
   └─ Alerts (if any issues)

3. CONSULTANT MANAGEMENT
   ├─ View all consultants
   ├─ Invite new consultant
   ├─ Set consultant permissions
   ├─ View consultant activity
   ├─ Remove consultant
   └─ Bulk operations

4. BILAN OVERSIGHT
   ├─ View all organization bilans
   ├─ Filter by consultant/status/date
   ├─ Export bilan list
   ├─ Reassign bilans between consultants
   └─ Bulk generate reports

5. COMPLIANCE & QUALIOPI
   ├─ Qualiopi status dashboard
   ├─ Indicator checklist (1-32)
   ├─ Upload evidence for audit
   ├─ Satisfaction survey results
   ├─ Compliance report generation
   └─ Audit trail

6. ANALYTICS & REPORTING
   ├─ Custom date range selection
   ├─ Bilans completed metric
   ├─ Satisfaction trend chart
   ├─ Consultant performance comparison
   ├─ Regional statistics
   ├─ Export data (Excel, PDF)
   └─ Scheduled reports (email)

7. BILLING & SUBSCRIPTION
   ├─ Current plan & pricing
   ├─ Team member count & cost
   ├─ Upgrade/downgrade plan
   ├─ Invoice history
   ├─ Payment method management
   └─ Usage metrics

8. SETTINGS
   ├─ Organization profile
   ├─ Brand customization
   ├─ Email templates
   ├─ Notification preferences
   ├─ API keys (if Enterprise)
   └─ Security settings
```

---

## IV. FEATURE SPECIFICATIONS (Core MVP)

### Feature 1: User Registration & Profile

**Acceptance Criteria**:
```gherkin
Scenario: Beneficiary Registration
  Given I'm on the landing page
  When I click "Start Assessment"
  Then I'm directed to registration form
  And I fill: email, password, full name
  Then I receive verification email
  And I click verification link
  Then account is created and I'm logged in

Scenario: Consultant Registration
  Given I'm on registration page
  When I select role "Consultant"
  Then I fill: email, password, professional info
  And I upload Qualiopi certificate
  Then account is created and I set my calendar
```

**Implementation Details**:
- Email regex validation + DNS check
- Password: min 12 chars, uppercase, digit, special char
- Email verification: 24h token expiry
- Supabase Auth integration
- JWT stored in httpOnly cookie

---

### Feature 2: Bilan Creation & Management

**Acceptance Criteria**:
```gherkin
Scenario: Consultant Creates New Bilan
  Given I'm logged in as consultant
  When I click "New Bilan"
  And I select beneficiary (or invite new)
  Then bilan is created in PRELIMINARY status
  And notification sent to beneficiary

Scenario: Beneficiary Accepts Bilan Invitation
  Given I receive bilan invitation email
  When I click "Accept"
  Then I'm logged in (or create account)
  And I see bilan dashboard with status
```

**Fields**:
```
- Bilan ID (UUID)
- Beneficiary (linked user)
- Consultant (linked user)
- Organization (linked org)
- Status (enum: PRELIMINARY, INVESTIGATION, CONCLUSION, COMPLETED)
- Start date
- Expected end date (usually +3 months)
- Duration hours (default 24, per French law)
- Contract signed (boolean)
- Created at / Updated at
```

**Constraints**:
- Minimum duration: 24 hours
- Maximum duration: 12 months
- Duration must be spread over minimum 2 weeks

---

### Feature 3: Competency Self-Assessment

**Assessment Form Structure**:

```
Step 1: Work History (5 min)
  - Job 1: Title, Company, Duration, Industry
  - Job 2: ...
  - Job N: ...

Step 2: Education (3 min)
  - Highest qualification
  - Field of study
  - Certifications/trainings

Step 3: Skills Checklist (15 min)
  - Pre-populated skill list (100+ common skills)
  - For each skill:
    * Self-assessment level (Beginner, Intermediate, Advanced, Expert)
    * Frequency of use (Rarely, Sometimes, Often, Daily)
    * Interest level (1-10 scale)
    * Add custom skills option

Step 4: Values & Motivations (5 min)
  - What motivates you? (multiple choice)
  - Work environment preference (remote, collaborative, etc.)
  - Career goals (advancement, balance, passion, etc.)

Step 5: Constraints & Context (2 min)
  - Availability to change jobs
  - Geographic preferences
  - Salary expectations (optional)
```

**Data Model**:
```
competencies {
  id: UUID
  bilan_id: UUID
  skill_name: String
  self_assessment_level: Enum (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
  frequency_of_use: Enum (RARELY, SOMETIMES, OFTEN, DAILY)
  interest_level: Int (1-10)
  context: String (e.g., "used at my previous job in marketing")
  consultant_assessment_level: Enum (same as above)
  consultant_notes: String
  ai_transferability_score: Float (0-1)
}
```

**Gamification Elements** (Optional for MVP):
- Progress bar (% of assessment complete)
- Estimated time remaining
- Motivational message: "You're 50% done!"

---

### Feature 4: AI-Powered Competency Analysis

**Trigger**: When beneficiary completes self-assessment OR consultant clicks "Analyze"

**AI Prompt**:
```
You are a career development expert. Analyze this competency profile:

Name: {name}
Experience: {work_history}
Education: {education}
Self-assessed skills: {competencies}
Motivations: {motivations}

Task 1: Identify transferable skills (skills applicable across industries)
Task 2: Identify gaps (skills needed for target occupations)
Task 3: Suggest top 5 occupations (ROME codes from France Travail)
Task 4: For each occupation, create a transition path

Output format: JSON
{
  "transferable_skills": ["skill1", "skill2", ...],
  "gaps": ["skill1", "skill2", ...],
  "recommended_occupations": [
    {
      "rome_code": "D1410",
      "occupation_name": "Marketing Manager",
      "match_score": 85,
      "why_match": "Your leadership and communication skills align well",
      "missing_skills": ["Digital marketing", "Data analysis"],
      "transition_path": ["Certification in digital marketing", "1-2 year learning curve"]
    }
  ]
}
```

**Response Processing**:
- Parse JSON response
- Store in recommendations table
- Display to consultant for validation
- Show to beneficiary with context

---

### Feature 5: Document Generation

**Document Types**:

#### Document 1: Preliminary Report (After Phase 1)
```
1. Beneficiary Information
2. Bilan Objectives (what we're going to explore)
3. Process Overview (what happens in investigation phase)
4. Timeline & Next Steps
5. Consultant Contact Info
```

**Template**: markdown → converted to PDF (60s generation time)

#### Document 2: Investigation Report (During Phase 2)
```
1. Executive Summary
2. Career History Analysis
3. Competency Profile (self-assessment results)
4. Skills Assessment (consultant's validation notes)
5. Interest & Values Analysis
6. Constraints & Opportunities
7. Next Steps
```

#### Document 3: Final Report (After Phase 3)
```
1. Executive Summary
2. Career Path Recommendations (top 3 occupations)
3. Comprehensive Competency Profile
4. Skill Gaps & Development Plan
5. Action Plan (SMART goals)
6. Training Recommendations
7. Resources & Contacts
8. Follow-up Schedule
```

**Generation Flow**:
1. Consultant clicks "Generate Report"
2. System prepares data (competencies, AI analysis, notes)
3. Template is filled with data
4. PDF generated (using puppeteer or similar)
5. Saved to S3
6. Email link sent to beneficiary
7. Downloadable from dashboard

---

### Feature 6: Basic Messaging

**Messaging Features**:
- Text messages (no file uploads yet)
- Unread count badge
- Reply to specific message
- Search message history
- Delete message (soft delete, keep audit log)

**Notification**:
- Email notification: "New message from Consultant Name"
- In-app notification badge
- Real-time update (WebSocket optional, polling for MVP)

**Data Model**:
```
messages {
  id: UUID
  bilan_id: UUID
  sender_id: UUID (consultant or beneficiary)
  recipient_id: UUID
  content: Text
  read_at: Timestamp (null = unread)
  created_at: Timestamp
  deleted_at: Timestamp (soft delete)
}
```

---

### Feature 7: Organization Dashboard

**Widgets**:

```
1. Key Metrics Box
   - Total bilans: XX
   - Completed this month: X
   - In progress: X
   - Average satisfaction: X/10

2. Status Distribution (Pie Chart)
   - Preliminary: X%
   - Investigation: X%
   - Conclusion: X%
   - Completed: X%

3. Recent Activity (Table)
   - Timestamp
   - Consultant name
   - Beneficiary name (anonymized for privacy)
   - Action (bilan created, report generated, etc.)

4. Team Performance (Bar Chart)
   - Consultant name
   - Bilans completed
   - Average satisfaction

5. Billing Info
   - Current plan: Professional ($149/mo)
   - Team members: 5 consultants
   - Next billing date: Nov 20
   - Usage: 25/50 bilans included
```

**Data Sources**:
- COUNT bilans WHERE organization_id = X AND created_at >= START_OF_MONTH
- AVG satisfaction_score WHERE organization_id = X AND status = 'COMPLETED'
- Recent messages/actions from audit_logs

---

## V. MVP DEVELOPMENT ROADMAP

### Week 1-2: Setup & Foundation
- [ ] Project setup (Next.js, Supabase, auth)
- [ ] Database schema migration
- [ ] Basic auth flow (registration, login)
- [ ] Landing page + marketing site

### Week 3: Core User Flows
- [ ] User profile completion
- [ ] Bilan creation flow
- [ ] Beneficiary dashboard
- [ ] Consultant dashboard

### Week 4: Assessment Module
- [ ] Self-assessment form (multi-step)
- [ ] Competency data model
- [ ] Assessment review (consultant view)

### Week 5: Document Generation
- [ ] PDF template design
- [ ] Preliminary report generation
- [ ] Report download/email feature

### Week 6: AI Integration
- [ ] Gemini API integration
- [ ] Competency analysis prompt
- [ ] Recommendations storage & display

### Week 7: Messaging & Admin
- [ ] Basic messaging feature
- [ ] Organization dashboard
- [ ] Admin overview page

### Week 8: Testing & Polish
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security review
- [ ] Beta launch prep

---

## VI. QUALITY ASSURANCE

### Testing Strategy

**Unit Tests** (Jest):
- Authentication functions
- Data validation
- Utility functions
- Component rendering

**Integration Tests** (Supertest + Supabase):
- API endpoints
- Database operations
- Auth flow
- Document generation

**E2E Tests** (Playwright):
- Complete user journeys (3 main flows)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness

**Performance Tests**:
- API response time < 500ms (p95)
- Page load time < 3 seconds
- Database query time < 200ms

**Security Tests**:
- SQL injection attempts
- XSS prevention
- CSRF token validation
- Auth bypass attempts

**Acceptance Criteria for MVP**:
- ✅ Zero critical bugs
- ✅ > 80% test coverage
- ✅ All performance SLAs met
- ✅ Security audit passed

---

## VII. DELIVERABLES - MVP COMPLETION

1. ✅ Functional web application (Next.js)
2. ✅ Database schema + migrations
3. ✅ API documentation (OpenAPI)
4. ✅ User guides (Beneficiary, Consultant, Admin)
5. ✅ Deployment guide (Vercel)
6. ✅ Test suite + coverage report
7. ✅ Security audit report
8. ✅ Beta user launch kit

---

## VIII. GO-TO-MARKET (Post MVP)

**Beta Launch Strategy**:
- Direct reach to 5 consultant beta testers
- Collect feedback & case studies
- Iterate based on feedback
- Prepare for paid launch (Week 10-12)

**Success Metrics**:
- 80%+ satisfaction from beta users
- 20+ completed bilans
- Zero data loss incidents
- 99%+ uptime

---

**HAZIRLAYANLAR**: Ürün Ekibi
**TARİH**: 20 Ekim 2025
**SONRAKI FAZA**: FAZA 4 - UX/UI Tasarım & Wireframes
