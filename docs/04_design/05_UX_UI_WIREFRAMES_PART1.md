# FAZA 4: UX/UI Tasar\u0131m - Part 1: Wireframes

**Tarih**: 20 Ekim 2025
**Durum**: ACTIVE
**Amacı**: MVP için temel UX/UI wireframes tasarlamak

---

## I. DESIGN SYSTEM BASICS

### A. Color Palette

```
Primary: #0066FF (Trust blue)
Secondary: #00CC88 (Growth green)
Accent: #FF6B35 (Energy orange)
Neutral Dark: #1F2937
Neutral Light: #F3F4F6
Success: #10B981
Warning: #F59E0B
Danger: #EF4444
```

### B. Typography

```
Headings: Inter Bold (sizes: 32px, 28px, 24px, 20px)
Body: Inter Regular (16px, 14px, 12px)
Monospace: JetBrains Mono (code, timestamps)
```

### C. Spacing Grid
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

---

## II. KEY WIREFRAMES

### Wireframe 1: Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│                      HEADER (Sticky)                         │
├──────────────────────┬──────────────────────┬───────────────┤
│ Logo                 │ Features | Pricing   │ Sign In | Try  │
│ BilanCompetence.AI   │          |           │ it Free!      │
└─────────────────────┴──────────────────────┴───────────────┘
│
├─────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│    "Transform Career Assessments with AI                      │
│     and Compliance Automation"                                │
│                                                               │
│    Subtitle: "For career consultants who want to spend        │
│     less time on admin and more time with clients"            │
│                                                               │
│    [Start Free Trial] [Watch Demo]                           │
│                                                               │
│                    [Hero Image/Animation]                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────┐
│  PAIN POINTS SECTION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ❌ Manual admin work consumes 40% of your time              │
│  ❌ Qualiopi compliance feels like paperwork nightmare       │
│  ❌ Hard to match clients to real job opportunities          │
│  ❌ Document generation is repetitive and slow               │
│                                                               │
│                        ↓ vs ↓                                 │
│                                                               │
│  ✅ Automated workflows save 40% time                         │
│  ✅ Built-in Qualiopi compliance (audit-ready)              │
│  ✅ Real France Travail job matching                         │
│  ✅ AI-powered reports in 30 seconds                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────┐
│  HOW IT WORKS (3 steps)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. CLIENT ASSESSMENT        2. AI ANALYSIS      3. ACTION PLAN
│  ┌──────────────┐           ┌──────────┐         ┌──────┐
│  │ Self-eval    │ ────────> │ Gemini   │ ────── > │PDF   │
│  │ Your notes   │           │ extracts │         │Plan  │
│  └──────────────┘           │ insights │         └──────┘
│                             └──────────┘
│
└─────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────┐
│  TESTIMONIALS                                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ⭐⭐⭐⭐⭐                                                    │
│  "Saved me 20 hours per month on admin work"                 │
│  - Marie Dupont, Consultant, Paris                           │
│                                                               │
│  ⭐⭐⭐⭐⭐                                                    │
│  "Finally, a platform built for bilans de compétences"       │
│  - Jean Martin, Organisme Director, Lyon                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────┐
│  PRICING (3 tiers)                                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  STARTER        │    PROFESSIONAL    │    ENTERPRISE         │
│  $49/mo         │    $149/mo         │    Custom pricing     │
│  ───────────────┼────────────────────┼──────────────────────  │
│  10 active      │    50 active       │    Unlimited          │
│  bilans         │    bilans          │    bilans             │
│  Basic docs     │    + AI insights   │    + Dedicated        │
│  Email support  │    + Priority      │      support           │
│  [Choose]       │    [Choose]        │    [Contact sales]    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────┐
│  CTA FOOTER                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Ready to transform your bilan process?                      │
│  [Get Started Free] - No credit card required                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Wireframe 2: Registration Flow (Beneficiary)

```
SCREEN 1: Choose Role
┌─────────────────────────────────────────────────────────────┐
│ BilanCompetence.AI - Sign Up                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  I am a...                                                    │
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │  👤 Beneficiary          │  │  💼 Consultant            │ │
│  │  (Job seeker or          │  │  (Career professional)    │ │
│  │   reconversion)          │  │                           │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────┐                               │
│  │  🏢 Organization Admin    │                               │
│  │  (Manage team)            │                               │
│  └──────────────────────────┘                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

SCREEN 2: Email & Password
┌─────────────────────────────────────────────────────────────┐
│ Create Account - Step 1 of 3                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Email                                                        │
│  [_____________________________@_____.__]                    │
│                                                               │
│  Password (min 12 chars, 1 uppercase, 1 digit, 1 special)   │
│  [________________________________]  👁 (show/hide)         │
│                                                               │
│  Confirm Password                                             │
│  [________________________________]  👁                      │
│                                                               │
│  ☑ I agree to Terms & Privacy Policy                         │
│                                                               │
│                                    [Cancel]  [Next Step]     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

SCREEN 3: Personal Info
┌─────────────────────────────────────────────────────────────┐
│ Create Account - Step 2 of 3                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Full Name *                                                  │
│  [Marie Dupont________________________]                       │
│                                                               │
│  Age *                                                        │
│  [35]                                                         │
│                                                               │
│  Current Situation *                                          │
│  ☑ Employed (looking for change)                             │
│  ○ Job seeker                                                │
│  ○ Reconversion                                              │
│  ○ Other                                                      │
│                                                               │
│  Location (optional)                                          │
│  [Paris_________________]                                    │
│                                                               │
│                                    [Back]  [Next Step]       │
│                                                               │
└─────────────────────────────────────────────────────────────┘

SCREEN 4: Email Verification
┌─────────────────────────────────────────────────────────────┐
│ Verify Your Email - Step 3 of 3                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  We sent a verification link to:                             │
│  marie.dupont@example.com                                    │
│                                                               │
│  Click the link in your email to verify your account.        │
│  (Link expires in 24 hours)                                  │
│                                                               │
│  Didn't receive the email?                                   │
│  [Resend verification email]                                 │
│                                                               │
│  [Back to login]                                             │
│                                                               │
│  ⏳ Waiting for verification... or [Open email]              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Wireframe 3: Beneficiary Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  ☰ BilanCompetence.AI  │  Dashboard  Messages  Settings  👤  │
├─────────────────────────────────────────────────────────────┤
│  Welcome back, Marie!                                         │
│                                                               │
├─────────────────────────────────────────────────────────────┐
│  YOUR ACTIVE BILAN                                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Career Transition Assessment with Sarah Martin      │    │
│  │                                                      │    │
│  │ Started: Oct 2, 2025                                │    │
│  │ Expected End: Dec 24, 2025                          │    │
│  │                                                      │    │
│  │ Status: Phase 2 - Investigation                     │    │
│  │ ████████░░░░░░░░░░  60% Complete                    │    │
│  │                                                      │    │
│  │ Next: Complete skills assessment                    │    │
│  │       (Deadline: Oct 29)                            │    │
│  │                                                      │    │
│  │ [Continue Assessment] [Message Sarah] [View Report] │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┐
│  RECENT MESSAGES                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  From: Sarah Martin                                           │
│  "Great! I see you've completed the first assessment.        │
│   Next, I'd like you to explore the skills from the          │
│   recommended job profiles. See you Thursday!"               │
│                                                               │
│  [Reply]  2 days ago                                         │
│                                                               │
├─────────────────────────────────────────────────────────────┐
│  RECOMMENDED JOB PROFILES                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 📊 Data Analyst (85% match)                              │
│  2. 📈 Business Analyst (78% match)                          │
│  3. 💼 Project Manager (72% match)                           │
│                                                               │
│  [View All Jobs] [Save Favorites]                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Wireframe 4: Consultant Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  ☰ BilanCompetence.AI  │  Dashboard  Bilans  Analytics  👤  │
├─────────────────────────────────────────────────────────────┤
│  Welcome back, Sarah!                                         │
│                                                               │
├─────────────────────────────────────────────────────────────┐
│  QUICK STATS                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Active Bilans: 8        │  This Month: 2/5 target           │
│  Pending Review: 2       │  Avg Satisfaction: 4.8/5 ⭐       │
│  This Week Meetings: 5   │  Compliance: ✅ On Track          │
│                                                               │
├─────────────────────────────────────────────────────────────┐
│  BILANS NEEDING ACTION                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔴 URGENT (2)                                               │
│  • Marie Dupont - Awaiting assessment review (2 days late)   │
│    [Review Now]                                              │
│  • Tom Anderson - Submit final report (deadline today)       │
│    [Generate Report]                                         │
│                                                               │
│  🟡 ACTION NEEDED (1)                                        │
│  • Anna Rossi - Assessment completed, ready for AI analysis  │
│    [Analyze]                                                 │
│                                                               │
│  🟢 ON TRACK (5)                                             │
│  • [View All]                                                │
│                                                               │
├─────────────────────────────────────────────────────────────┐
│  THIS WEEK'S SCHEDULE                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Mon, Oct 21                                                  │
│  • 10:00 - Marie Dupont (Preliminary meeting)                │
│  • 14:00 - Tom Anderson (Progress review)                    │
│                                                               │
│  Wed, Oct 23                                                  │
│  • 09:30 - Anna Rossi (Investigation session)                │
│  • 15:00 - New client (Initial consultation)                │
│                                                               │
│  [View Calendar] [Schedule Meeting]                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Wireframe 5: Bilan Detail Page (Consultant View)

```
┌─────────────────────────────────────────────────────────────┐
│  ☰ BilanCompetence.AI  │  Dashboard  Back to Bilans  👤     │
├─────────────────────────────────────────────────────────────┤
│  BILAN: Career Transition - Marie Dupont                     │
│                                                               │
├──────────────────────────┬──────────────────────────────────┤
│  Client Profile          │  Timeline & Status                │
├──────────────────────────┼──────────────────────────────────┤
│  👤 Marie Dupont         │  Start: Oct 2, 2025               │
│  Age: 35                 │  Expected End: Dec 24, 2025       │
│  Situation: Employed     │  Current Phase: Investigation     │
│  Location: Paris         │                                   │
│  Email: marie@...        │  ④① Preliminary    [✓ Oct 5]    │
│                          │  ④② Investigation  [⏳ Oct 20]   │
│  Consultant: Me (Sarah)  │  ④③ Conclusion     [ _ _ _ ]     │
│                          │  ④④ Completed      [ _ _ _ ]     │
│                          │                                   │
│  [Edit Profile]          │  Duration: 24+ hours required     │
│                          │  Current: 18 hours logged         │
│                          │                                   │
├──────────────────────────┴──────────────────────────────────┤
│  ASSESSMENT RESULTS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Self-Assessment: Completed Oct 15                            │
│  ├─ Technical Skills (8 total)                               │
│  │  • Excel: Advanced ⭐⭐⭐⭐                               │
│  │  • SQL: Intermediate ⭐⭐⭐                               │
│  │  • Python: Beginner ⭐⭐                                  │
│  │  + 5 more skills                                          │
│  │  [View All Skills]                                        │
│  │                                                            │
│  ├─ Soft Skills (inferred from bio)                          │
│  │  • Leadership, Communication, Problem-solving             │
│  │                                                            │
│  └─ AI Analysis: Ready ✅                                    │
│     [View Detailed Analysis]                                 │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  CONSULTANT NOTES                                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [+] Add Note                                                │
│                                                               │
│  Sarah Martin - Oct 15, 2025, 10:30                          │
│  "Discussed career goals. Marie is interested in data        │
│   roles but worried about Python skills gap. Explored        │
│   possible training paths. She's motivated and realistic     │
│   about timeline (12-18 months)."                            │
│                                                               │
│  Sarah Martin - Oct 12, 2025, 15:00                          │
│  "First meeting went well. Marie has strong analytical       │
│   background and leadership experience. Good candidate       │
│   for transition."                                            │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  RECOMMENDATIONS (AI-Generated)                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ Consultant Validated (Oct 18)                            │
│                                                               │
│  1. 📊 Data Analyst (85% match)                              │
│     Missing: Python, Advanced SQL                            │
│     Path: 3-month course + 6-month practice                  │
│                                                               │
│  2. 📈 Business Analyst (78% match)                          │
│     Missing: Business acumen, stakeholder mgmt              │
│     Path: 2-month course + 6-month internship                │
│                                                               │
│  3. 💼 Project Manager (72% match)                           │
│     Missing: PM tools, Agile certification                   │
│     Path: 1-month bootcamp + immediate job search            │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  DOCUMENTS                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📄 Preliminary Report - Oct 10                              │
│     [Download PDF] [Email to Marie] [Print]                 │
│                                                               │
│  📄 Investigation Report - (Draft, not generated yet)        │
│     [Generate Now] [Preview]                                 │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  MESSAGES                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Marie (Oct 18): "Hi Sarah, I completed the assessment       │
│  as you asked. Looking forward to discussing with you.       │
│  See you Thursday!"                                          │
│                                                               │
│  [Reply Box...]                                              │
│  [Send Message]                                              │
│                                                               │
│  [View All Messages]                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Wireframe 6: Self-Assessment Form

```
SCREEN: Skills Assessment (Multi-step form)

┌─────────────────────────────────────────────────────────────┐
│  BilanCompetence.AI - Your Skills Assessment                 │
│                                                               │
│  Step 2 of 5: Technical Skills                               │
│  ████████░░░░░░░░░░░░ 40% Complete                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  For each skill, please rate your level and how often        │
│  you use it:                                                 │
│                                                               │
│  1. Microsoft Excel                                           │
│     Proficiency: ⭐⭐⭐⭐ (Advanced)                          │
│     Frequency:   ⭐⭐⭐⭐⭐ (Daily)                           │
│     Interest:    😍 😊 😐 😞 (Love it!)                     │
│                                                               │
│     Context: I use Excel for reporting at work, 5+ years     │
│     [textarea]                                               │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  2. Python Programming                                        │
│     Proficiency: ⭐⭐ (Beginner)                             │
│     Frequency:   ⭐ (Rarely)                                 │
│     Interest:    😍 😊 😐 😞 (Interested)                   │
│                                                               │
│     Context: Tried Python in university, haven't used since  │
│     [textarea]                                               │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  [+ Add Custom Skill]                                        │
│                                                               │
│  [Previous Step]  [Save Progress]  [Next Step]              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## III. DESIGN NOTES

**Accessibility**:
- WCAG 2.1 AA compliant
- Color not only indicator (always use icons/text too)
- Keyboard navigation fully supported
- Screen reader friendly labels

**Responsive Breakpoints**:
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

**Loading States**:
- Skeleton loaders for data tables
- Progress indicators for multi-step forms
- Animated spinners with "Loading..." text

---

**HAZIRLAYANLAR**: UX/UI Ekibi
**TARİH**: 20 Ekim 2025
**SONRAKI**: Part 2 - Component Details & Design Tokens
