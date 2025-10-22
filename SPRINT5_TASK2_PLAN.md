# Sprint 5 - Task 2: Dashboard Variants Development Plan

**Date**: 2025-10-22
**Task**: Develop Role-Based Dashboard Variants (Beneficiary, Consultant, Admin)
**Status**: PLANNING PHASE
**Priority**: HIGH
**Dependencies**: Assessment Wizard (Sprint 5 Task 1) ✅ COMPLETE

---

## Executive Summary

Currently, the frontend dashboard is **static and not role-aware**. The backend has implemented real API endpoints (`GET /api/dashboard/beneficiary`, `/consultant`, `/admin`), but the frontend is not utilizing them.

**Objective**: Create dynamic, role-specific dashboard pages that pull real data from backend endpoints and provide unique UX for each user role.

---

## Current State Analysis

### Frontend
```
/apps/frontend/app/(protected)/dashboard/page.tsx
- Basic static page with role detection
- Shows user info (name, email, role)
- Has role-specific sections but NO real data
- API calls to `/api/dashboard/stats` (doesn't exist)
- Minimal styling and components
```

### Backend
```
/apps/backend/src/routes/dashboard.ts
- GET /api/dashboard/me - Current user profile ✅
- GET /api/dashboard/beneficiary - Real beneficiary data ✅
- GET /api/dashboard/consultant - Consultant client list ✅
- GET /api/dashboard/admin - Organization stats ✅
- All with role-based access control ✅
```

### Database
```
Supports:
- assessments table (for beneficiary bilans)
- clients/consultant relationships
- organization stats
- user management
```

---

## Detailed Implementation Plan

### PHASE 1: Frontend Architecture (Component Structure)

#### 1.1 Create Dashboard Variants Directory
```
apps/frontend/app/(protected)/dashboard/
├── page.tsx                          (Router - dispatches to variant)
├── components/
│   ├── BeneficiaryDashboard.tsx     (Beneficiary variant)
│   ├── ConsultantDashboard.tsx      (Consultant variant)
│   ├── AdminDashboard.tsx           (Admin variant)
│   └── dashboard-components/        (Shared sub-components)
│       ├── StatCard.tsx             (Reusable stat card)
│       ├── AssessmentCard.tsx       (Beneficiary: assessment item)
│       ├── ClientCard.tsx           (Consultant: client item)
│       ├── UserManagementTable.tsx  (Admin: users table)
│       ├── AnalyticsPanel.tsx       (Admin: analytics display)
│       ├── RecommendationsPanel.tsx (Beneficiary: recommendations)
│       └── ProgressChart.tsx        (Visualization component)
└── hooks/
    └── useDashboardData.ts          (Custom hook for data fetching)
```

#### 1.2 Main Dashboard Router Page
**File**: `apps/frontend/app/(protected)/dashboard/page.tsx`

**Functionality**:
- Get current user from context/hook
- Dispatch to appropriate variant based on user.role
- Handle loading and error states
- Fallback for unknown roles

**Structure**:
```typescript
// Get user from useAuth hook
const user = useAuth();

// Render based on role
switch(user?.role) {
  case 'BENEFICIARY':
    return <BeneficiaryDashboard />;
  case 'CONSULTANT':
    return <ConsultantDashboard />;
  case 'ORG_ADMIN':
    return <AdminDashboard />;
  default:
    return <NotFound />;
}
```

---

### PHASE 2: Beneficiary Dashboard

**Component**: `BeneficiaryDashboard.tsx`

**Key Sections**:
1. **Welcome Section**
   - User greeting ("Welcome, Marie!")
   - Profile completion percentage
   - CTA button ("Start New Assessment")

2. **Quick Stats** (3-card grid)
   - Total Assessments (count)
   - Completed Assessments (count)
   - Pending Assessments (count)
   - Average Satisfaction Score (if any submitted)

3. **Active Assessments Section**
   - List of assessments with status
   - Status badge (DRAFT, IN_PROGRESS, SUBMITTED, COMPLETED)
   - Progress bar per assessment (% complete)
   - Buttons: Edit Draft, View Results, Delete

4. **Recommendations Section**
   - AI-powered recommendations based on assessments
   - Job matches (from France Travail)
   - Training suggestions
   - Skill improvement recommendations

5. **Recent Activity**
   - Timeline of actions (assessment submitted, recommendation viewed, etc.)
   - Timestamps and action descriptions

**Data Fetching**:
```typescript
// GET /api/dashboard/beneficiary
// Returns: {
//   bilans: [...],
//   recommendations: [...],
//   stats: {
//     totalBilans, completedBilans, pendingBilans, averageSatisfaction
//   }
// }
```

**Components Used**:
- StatCard (4x for stats)
- AssessmentCard (list items)
- RecommendationsPanel
- ProgressChart
- Timeline component

---

### PHASE 3: Consultant Dashboard

**Component**: `ConsultantDashboard.tsx`

**Key Sections**:
1. **Welcome Section**
   - User greeting
   - Quick stats overview
   - CTA ("Invite New Client")

2. **Quick Stats** (4-card grid)
   - Active Clients (count)
   - Assessments in Progress (count)
   - Completed Assessments (count)
   - Average Client Satisfaction (NPS)

3. **Client List Section**
   - Table/Card grid of assigned clients
   - Columns: Name, Status, Latest Assessment, Contact, Actions
   - Status indicators (Active, No Activity, Completed)
   - Buttons: View Client, Message, Assign Assessment

4. **Assessments Overview**
   - Pending assessments awaiting consultant input
   - Assessments requiring validation
   - Completed assessments ready for delivery

5. **My Recommendations Provided**
   - List of recommendations given to clients
   - Client feedback/satisfaction per recommendation

6. **Calendar/Schedule** (Future)
   - Upcoming sessions with clients
   - Availability slots
   - Completed session history

**Data Fetching**:
```typescript
// GET /api/dashboard/consultant
// Returns: {
//   clients: [...],
//   assessments: [...],
//   recommendations: [...],
//   stats: {
//     activeClients, inProgressAssessments, completedAssessments, avgSatisfaction
//   }
// }
```

**Components Used**:
- StatCard (4x for stats)
- ClientCard (list/grid items)
- AssessmentCard
- RecommendationsPanel
- DataTable (clients list)

---

### PHASE 4: Admin Dashboard

**Component**: `AdminDashboard.tsx`

**Key Sections**:
1. **Organization Overview**
   - Organization name
   - Total users breakdown (Consultants, Beneficiaries, Admins)
   - Subscription plan and usage

2. **Key Metrics** (6-card grid)
   - Total Users (all roles)
   - Active Bilans (in progress)
   - Completed Bilans
   - User Satisfaction (avg rating)
   - Assessments This Month (count)
   - Active Sessions (real-time)

3. **Organization Analytics**
   - Line chart: Bilans completed over time (last 30 days)
   - Bar chart: Bilans by status distribution
   - Pie chart: User distribution by role

4. **User Management Section**
   - Searchable table of all organization users
   - Columns: Name, Email, Role, Status, Created Date, Actions
   - Actions: View Profile, Edit Role, Deactivate, Delete
   - Bulk actions (if needed)
   - Pagination

5. **Recent Activity**
   - Timeline of organization events
   - User registrations
   - Bilan submissions
   - System events
   - Admin actions log

6. **Compliance & Reports**
   - Qualiopi compliance checklist status
   - Export analytics button
   - Generate compliance report button

**Data Fetching**:
```typescript
// GET /api/dashboard/admin
// Returns: {
//   organization: { name, plan, usageStats },
//   users: [...],
//   bilans: [...],
//   stats: {
//     totalUsers, activeUsers, totalBilans, completedBilans,
//     avgSatisfaction, recentActivity
//   },
//   analytics: {
//     chartData: {
//       completionTrend: [...],
//       statusDistribution: [...],
//       roleDistribution: [...]
//     }
//   }
// }
```

**Components Used**:
- StatCard (6x for metrics)
- Charts (Line, Bar, Pie using recharts or chart.js)
- DataTable (users management)
- Analytics panels
- Compliance checklist

---

### PHASE 5: Shared Components

#### 5.1 StatCard Component
```typescript
// apps/frontend/components/assessment/dashboard-components/StatCard.tsx

Interface:
- title: string
- value: string | number
- icon?: ReactNode
- trend?: { value: number, isPositive: boolean }
- onClick?: () => void
- loading?: boolean

Features:
- Display stat with label
- Optional trend indicator (↑ or ↓)
- Optional icon
- Clickable variant
- Loading skeleton
```

#### 5.2 AssessmentCard Component
```typescript
// apps/frontend/components/assessment/dashboard-components/AssessmentCard.tsx

Interface:
- assessment: Assessment object
- onEdit?: () => void
- onView?: () => void
- onDelete?: () => void

Features:
- Show assessment title/date
- Status badge (color-coded)
- Progress bar if in progress
- Action buttons
- Timestamp formatting
```

#### 5.3 ClientCard Component
```typescript
// apps/frontend/components/assessment/dashboard-components/ClientCard.tsx

Interface:
- client: Client object
- onView?: () => void
- onMessage?: () => void
- onAssignAssessment?: () => void

Features:
- Client name and status
- Latest assessment info
- Contact details
- Action buttons
- Activity indicators
```

#### 5.4 UserManagementTable Component
```typescript
// apps/frontend/components/assessment/dashboard-components/UserManagementTable.tsx

Interface:
- users: User[]
- onEdit?: (userId) => void
- onDelete?: (userId) => void
- sortBy?: string
- filterRole?: string

Features:
- Sortable columns
- Filterable by role
- Searchable
- Pagination
- Bulk actions
- Status indicators
```

#### 5.5 RecommendationsPanel Component
```typescript
// apps/frontend/components/assessment/dashboard-components/RecommendationsPanel.tsx

Interface:
- recommendations: Recommendation[]
- userRole: 'BENEFICIARY' | 'CONSULTANT'

Features:
- Display recommendations in list/card format
- Job matches with ROME codes
- Training suggestions
- Skill improvement tips
- Expand/collapse for details
```

#### 5.6 AnalyticsPanel Component
```typescript
// apps/frontend/components/assessment/dashboard-components/AnalyticsPanel.tsx

Interface:
- data: AnalyticsData
- title: string
- chartType: 'line' | 'bar' | 'pie'

Features:
- Render charts based on data
- Responsive sizing
- Legend
- Tooltips
- Export capability
```

---

### PHASE 6: Custom Hook for Data Fetching

**File**: `apps/frontend/app/(protected)/dashboard/hooks/useDashboardData.ts`

**Purpose**: Centralize all dashboard API calls and state management

**Functions**:
```typescript
// Hook: useDashboardData(userRole)
// Returns: {
//   data: DashboardData | null,
//   loading: boolean,
//   error: Error | null,
//   refetch: () => Promise<void>
// }

// Uses:
// - /api/dashboard/beneficiary (if BENEFICIARY)
// - /api/dashboard/consultant (if CONSULTANT)
// - /api/dashboard/admin (if ORG_ADMIN)

// Features:
// - Auto-refresh every 30 seconds (configurable)
// - Caching
// - Error handling
// - Loading states
// - Manual refetch capability
```

---

## PHASE 7: Backend API Adjustments

### Current State
✅ Endpoints exist and return data:
- `GET /api/dashboard/me`
- `GET /api/dashboard/beneficiary`
- `GET /api/dashboard/consultant`
- `GET /api/dashboard/admin`

### Required Adjustments
**Estimate**: 20% chance changes needed

**Potential Issues**:
1. Missing data fields for new UI components
2. Pagination needed for large lists
3. Analytics data format mismatch
4. Permission checks

**Validation Plan**:
1. Test each endpoint with curl
2. Verify response structure matches component expectations
3. Test with real data (if available)
4. Make minor adjustments if needed

---

## Implementation Sequence

### Week 1
**Task 1**: Setup component structure and create dashboard router
- Create directories
- Create main page.tsx router
- Setup TypeScript interfaces

**Task 2**: Build shared components
- StatCard
- AssessmentCard
- ClientCard
- UserManagementTable
- RecommendationsPanel
- AnalyticsPanel

**Task 3**: Implement useDashboardData hook
- API call wrappers
- State management
- Error handling
- Auto-refresh logic

### Week 2
**Task 4**: Implement Beneficiary Dashboard
- Quick stats section
- Active assessments list
- Recommendations panel
- Recent activity
- Connect to useDashboardData

**Task 5**: Implement Consultant Dashboard
- Quick stats section
- Client list/grid
- Assessments awaiting validation
- Recommendations given
- Connect to useDashboardData

**Task 6**: Implement Admin Dashboard
- Organization overview
- Key metrics cards
- Analytics charts
- User management table
- Compliance section
- Connect to useDashboardData

### Week 3
**Task 7**: Testing and refinement
- Test each dashboard with real data
- Test role-based access
- Test loading/error states
- Performance optimization

**Task 8**: Backend adjustments (if needed)
- Fix any data format issues
- Add missing endpoints/fields
- Optimize queries

**Task 9**: Documentation and deployment
- Update docs
- Create test data
- Deploy to staging/production

---

## Files to Create/Modify

### New Files (12-15)
```
/apps/frontend/app/(protected)/dashboard/
├── page.tsx (MODIFY)
├── components/
│   ├── BeneficiaryDashboard.tsx (NEW)
│   ├── ConsultantDashboard.tsx (NEW)
│   ├── AdminDashboard.tsx (NEW)
│   └── dashboard-components/
│       ├── StatCard.tsx (NEW)
│       ├── AssessmentCard.tsx (NEW)
│       ├── ClientCard.tsx (NEW)
│       ├── UserManagementTable.tsx (NEW)
│       ├── RecommendationsPanel.tsx (NEW)
│       ├── AnalyticsPanel.tsx (NEW)
│       └── index.ts (NEW - exports)
└── hooks/
    └── useDashboardData.ts (NEW)
```

### Modified Files (2-3)
```
/apps/backend/src/routes/dashboard.ts (VALIDATE/ADJUST)
/apps/frontend/tailwind.config.ts (if adding new colors)
/apps/frontend/package.json (if adding charting library)
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Hooks + Context
- **UI Components**: Custom + Tailwind CSS
- **Charts**: recharts or chart.js (to be selected)
- **Data Fetching**: fetch API + custom hooks
- **Styling**: Tailwind CSS

### Backend
- **No new packages needed**
- May optimize queries with indexes
- May add caching layer (optional)

---

## Estimated Timeline & Effort

| Phase | Tasks | Estimate | Status |
|-------|-------|----------|--------|
| 1 | Setup, interfaces, routing | 2-3 days | Pending |
| 2 | Shared components | 3-4 days | Pending |
| 3 | Custom hook | 1-2 days | Pending |
| 4 | Beneficiary dashboard | 2-3 days | Pending |
| 5 | Consultant dashboard | 2-3 days | Pending |
| 6 | Admin dashboard | 3-4 days | Pending |
| 7 | Testing & refinement | 2-3 days | Pending |
| 8 | Backend adjustments | 1-2 days | Pending |
| 9 | Deployment & docs | 1-2 days | Pending |

**Total Estimate**: 17-24 days (3-4 weeks of active development)

**With parallel work on components**: 2-3 weeks

---

## Success Criteria

### Functional
- ✅ Beneficiary sees only their assessments and recommendations
- ✅ Consultant sees assigned clients and their assessments
- ✅ Admin sees all users, organization metrics, and analytics
- ✅ Role-based access control enforced (401/403 errors)
- ✅ Data updates in real-time (auto-refresh)
- ✅ All API endpoints return correct data structure

### UX/Design
- ✅ Dashboards match wireframe specifications
- ✅ Color scheme consistent (primary blue, secondary green, etc.)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Loading states displayed
- ✅ Error messages user-friendly
- ✅ No console errors

### Performance
- ✅ Dashboard loads in < 2 seconds
- ✅ No unnecessary re-renders
- ✅ Optimized images/charts
- ✅ Efficient API calls (no duplicate requests)

### Testing
- ✅ Unit tests for components (70%+ coverage)
- ✅ Integration tests for data flow
- ✅ E2E tests for each role dashboard
- ✅ Manual QA checklist completed

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Backend data doesn't match component expectations | 30% | High | Validate endpoints early, adjust if needed |
| Performance issues with large datasets | 20% | Medium | Implement pagination, lazy loading |
| Styling inconsistencies across components | 25% | Low | Use shared Tailwind classes, component library |
| Chart library dependency issues | 15% | Medium | Test early, have fallback option |
| Role-based access control edge cases | 20% | High | Comprehensive permission testing |

---

## Deliverables

### Code
- ✅ Complete dashboard variants (3)
- ✅ Shared component library (6-8 components)
- ✅ Custom hook for data management
- ✅ TypeScript interfaces
- ✅ Tests (unit + integration)

### Documentation
- ✅ Component API documentation
- ✅ Hook usage guide
- ✅ API response structure documentation
- ✅ Styling guidelines

### Deployment
- ✅ Code merged to main
- ✅ Deployed to staging environment
- ✅ Deployed to production
- ✅ Rollout plan (if needed)

---

## Next Steps (Awaiting Approval)

1. **Approve this plan**
2. **Confirm**: Any additional requirements or changes?
3. **Confirm**: Chart library preference (recharts vs chart.js)?
4. **Confirm**: Timeline acceptable?
5. **Start development** once approved

---

**Plan Created**: 2025-10-22
**Status**: Awaiting User Approval
**Complexity**: MEDIUM
**Risk Level**: LOW-MEDIUM
