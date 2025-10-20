# BilanCompetence.AI 🚀

> The first AI-powered SaaS platform for career assessment professionals in France

## 📊 Project Overview

**BilanCompetence.AI** is an innovative SaaS platform that combines:
- 🤖 **AI-powered competency analysis** (Google Gemini)
- ✅ **Qualiopi compliance automation** (built-in from day 1)
- 💼 **Real France Travail job matching** (France's official job database)
- 👥 **Exceptional UX** for consultants and beneficiaries

### Market Opportunity
- **Market Size**: €150M annually in France
- **Growth Rate**: +15% per year
- **Target**: 500K+ career assessments/year
- **Competitive Position**: First-mover with AI + compliance focus

## 🎯 Quick Stats

| Metric | Value |
|--------|-------|
| Status | 🟢 Planning Complete, Ready for Development |
| MVP Timeline | 8 weeks (Oct 21 - Dec 15, 2025) |
| Funding Needed | €150-200K |
| Target Y1 Revenue | €141K ARR |
| Break-even | Q4 2026 |
| Tech Stack | Next.js + Supabase + Gemini API |

## 📁 Repository Structure

```
bilancompetence.ai/
├── docs/
│   ├── 00_MASTER_SUMMARY.md          ← START HERE
│   ├── 01_planning/                  (Market validation)
│   ├── 02_architecture/              (Tech stack & competition)
│   ├── 03_product/                   (Features & MVP)
│   ├── 04_design/                    (UX/UI wireframes)
│   ├── 05_development/               (8-week roadmap)
│   ├── 06_marketing/                 (Go-to-market)
│   └── 07_operations/                (Legal, finance, operations)
├── apps/
│   ├── backend/                      (Node.js + Express)
│   └── frontend/                     (Next.js 14)
├── scripts/                          (Setup & utilities)
├── README.md                         (This file)
├── .gitignore
└── package.json                      (Monorepo root)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Git

### Project Planning (Read First)
1. **Start**: [`docs/00_MASTER_SUMMARY.md`](docs/00_MASTER_SUMMARY.md) - 5 min overview
2. **Deep Dive**: [`docs/01_planning/`](docs/01_planning/) - Market & validation
3. **Technical**: [`docs/02_architecture/`](docs/02_architecture/) - Tech stack details
4. **Product**: [`docs/03_product/`](docs/03_product/) - Features & MVP spec
5. **Design**: [`docs/04_design/`](docs/04_design/) - Wireframes & UX
6. **Development**: [`docs/05_development/`](docs/05_development/) - Sprint roadmap
7. **Marketing**: [`docs/06_marketing/`](docs/06_marketing/) - GTM strategy
8. **Operations**: [`docs/07_operations/`](docs/07_operations/) - Legal & setup

### Development Setup (Coming Soon - Sprint 1)
```bash
# Clone repository
git clone https://github.com/lekesiz/bilancompetence.ai.git
cd bilancompetence.ai

# Setup backend
cd apps/backend
npm install
npm run dev

# Setup frontend (in another terminal)
cd apps/frontend
npm install
npm run dev
```

## 📅 Development Timeline

### 🎯 Sprint 1: Foundation (Week 1 - Oct 21-27)
- [ ] Next.js project setup
- [ ] Supabase database schema
- [ ] Authentication system
- [ ] Landing page deployment

### 🎯 Sprint 2-8: Full MVP (Weeks 2-8)
- Sprint 2: User dashboards
- Sprint 3: Assessment module
- Sprint 4: Messaging & admin
- Sprint 5: AI integration
- Sprint 6: Document generation
- Sprint 7: Testing & QA
- Sprint 8: Launch & deployment

**Goal**: Production-ready MVP by Dec 15, 2025

## 🏗️ Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 | React, SSR, fast development |
| Backend | Node.js + Express | JavaScript/TypeScript consistency |
| Database | Supabase (PostgreSQL) | Auth + RLS built-in |
| AI | Gemini 2.0 Flash | Multimodal, fast, affordable |
| APIs | France Travail + SendGrid | Job data + email delivery |
| Hosting | Vercel + Supabase Cloud | Serverless, auto-scaling |
| CDN | CloudFlare | Performance + DDoS protection |

## 💰 Business Model

### Three-Tier SaaS Pricing

```
STARTER (€49/mo)
├─ 10 active assessments
├─ Basic documents
└─ Email support

PROFESSIONAL (€149/mo)
├─ 50 active assessments
├─ AI analysis + France Travail
├─ Priority support
└─ 1-year data retention

ENTERPRISE (Custom)
├─ Unlimited assessments
├─ Full feature set
├─ Dedicated account manager
├─ SSO + API access
└─ SLA (99.5% uptime)
```

### Revenue Projections (Year 1)
- 100 Starter customers @ €49 = €58,800
- 30 Professional @ €149 = €53,640
- 3 Enterprise @ €800 avg = €28,800
- **Total: €141,240 ARR**

## 🎯 Success Metrics

### Technical KPIs
- Page load time: < 3 seconds
- API response: < 500ms (p95)
- Uptime: > 99.5%
- Test coverage: > 80%

### Business KPIs
- Customer Acquisition Cost: < €100
- Lifetime Value: > €1,200
- Monthly Churn: < 10%
- NPS Score: > 50

### User Satisfaction
- Beneficiary satisfaction: > 90%
- Consultant satisfaction: > 85%
- Support response time: < 24 hours

## 📊 Team

### Current
- **CEO/PM**: NETZ INFORMATIQUE
- **CTO**: Manus AI
- **Frontend Dev**: TBD (hiring)
- **QA/Tester**: TBD (hiring)

### Needed for Launch
- Customer Success Manager
- Sales Representative
- Community Manager

## 💡 Key Features (MVP)

### For Beneficiaries
✅ Easy self-assessment (5 steps, 30 minutes)
✅ AI-powered career recommendations
✅ Job matching (real France Travail data)
✅ Professional report generation
✅ Progress tracking

### For Consultants
✅ Client management dashboard
✅ Assessment review interface
✅ One-click document generation
✅ Messaging with clients
✅ Session tracking

### For Organizations
✅ Team management
✅ Real-time analytics
✅ Qualiopi compliance checklist
✅ Billing & subscriptions
✅ Performance metrics

## 🎓 Documentation Guide

**For Stakeholders**: Read `docs/00_MASTER_SUMMARY.md` (10 minutes)

**For Investors**: Read `docs/06_marketing/07_GO_TO_MARKET_STRATEGY.md` + financials section

**For Developers**: Read `docs/02_architecture/03_TECHNICAL_ARCHITECTURE.md` + `05_DEVELOPMENT_ROADMAP_SPRINTS.md`

**For Product Team**: Read `docs/03_product/04_PRODUCT_SPECIFICATIONS_AND_MVP.md` + `docs/04_design/05_UX_UI_WIREFRAMES_PART1.md`

**For Operations**: Read `docs/07_operations/08_OPERATIONAL_SETUP.md` + `09_EXECUTION_CHECKLIST.md`

## 🔐 Security & Compliance

- ✅ GDPR compliant (consent, portability, erasure)
- ✅ HTTPS/TLS encryption (in transit)
- ✅ AES-256 encryption (at rest)
- ✅ Row-level security (PostgreSQL)
- ✅ Audit logging (7-year retention per French law)
- ✅ Qualiopi compliance roadmap (certification by Q1 2026)

## 📞 Contact & Support

**Project Owner**: NETZ INFORMATIQUE
**Technical Lead**: Manus AI
**GitHub**: https://github.com/lekesiz/bilancompetence.ai

## 📜 License

Proprietary - All rights reserved to NETZ INFORMATIQUE

---

## 🚀 Ready to Launch?

✅ Planning: COMPLETE
✅ Architecture: COMPLETE
✅ Documentation: COMPLETE
⏳ Funding: IN PROGRESS
⏳ Team: HIRING
⏳ Development: READY TO START

**Next Step**: Review `docs/00_MASTER_SUMMARY.md` and schedule board meeting for GO/NO-GO decision.

---

**Last Updated**: October 20, 2025
**Status**: 🟢 Ready for Sprint 1
**Confidence**: HIGH
