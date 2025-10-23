# Sprint 7 - Task 2: Scheduling System
## Phase 2: Consultant Frontend Implementation
### Detailed Plan

**Date**: October 23, 2025
**Duration**: 3-4 days (estimated 12-16 hours)
**Status**: READY TO START (Phase 1 Complete ✅)

---

## 📋 Phase 2 Overview

Phase 2 focuses on building the consultant-facing frontend interface for scheduling and availability management. This includes a calendar interface, availability management UI, and session booking dashboard.

### Key Objectives
1. **Availability Management** - Consultants can create and manage their availability
2. **Session Calendar** - Visual calendar of scheduled sessions
3. **Session Management** - Confirm, complete, and cancel sessions
4. **Analytics View** - Dashboard with session metrics and ratings

### Target Users
- Consultants managing their schedules
- Org Admins viewing team availability
- No direct beneficiary interaction (Phase 3)

---

## 🎯 Deliverables

### Frontend Components (8-10 React components)
- [ ] AvailabilityCalendar - Visual calendar for managing slots
- [ ] AvailabilityForm - Create/edit availability slots
- [ ] SessionCalendar - Calendar view of all bookings
- [ ] SessionCard - Individual session display with actions
- [ ] BookingConfirmation - Confirm pending bookings
- [ ] SessionCompletion - Mark session done with feedback
- [ ] AnalyticsDashboard - Session metrics and charts
- [ ] SlotBulkCreator - Quick create recurring slots
- [ ] ConsultantSchedulePage - Main container component

### Pages/Routes
- `/consultant/schedule/availability` - Manage availability
- `/consultant/schedule/sessions` - View bookings
- `/consultant/schedule/analytics` - View metrics

### Supporting Files
- Zod schemas for form validation
- Utility hooks (useAvailability, useBookings, useAnalytics)
- CSS/styled components for calendar views
- API client methods (if not already present)

---

## 🏗️ Architecture

### Component Hierarchy

```
ConsultantSchedulePage (Main container)
├── AvailabilityManagement (Tab 1)
│   ├── AvailabilityCalendar
│   ├── AvailabilityForm
│   └── SlotBulkCreator
├── SessionManagement (Tab 2)
│   ├── SessionCalendar
│   ├── SessionCard (multiple)
│   ├── BookingConfirmation
│   └── SessionCompletion
└── AnalyticsDashboard (Tab 3)
    ├── MetricsSummary
    ├── SessionChart
    └── RatingsList
```

### Data Flow

```
API Backend (Phase 1 ✅)
    ↓
React Query/SWR Cache
    ↓
Custom Hooks (useAvailability, useBookings)
    ↓
Components (Calendar, Forms, Cards)
    ↓
User Interface
```

### State Management
- **React Query** for server state (availability, bookings, analytics)
- **useState** for local UI state (selected date, filters, modal open/close)
- **Context** for organization/consultant context (if needed)

---

## 📐 Component Specifications

### 1. AvailabilityCalendar Component
**File**: `apps/frontend/src/components/scheduling/AvailabilityCalendar.tsx`
**Purpose**: Visual calendar display of consultant's availability

**Props**:
```typescript
interface AvailabilityCalendarProps {
  consultantId: string;
  organizationId: string;
  onSlotClick?: (slot: AvailabilitySlot) => void;
  onDateSelect?: (date: Date) => void;
}
```

**Features**:
- Month view calendar
- Color-coded available vs unavailable days
- Click to select day for creating new slot
- Click existing slot to edit/delete
- Timezone display
- "Create Slot" quick action button
- Recurring slot indicators (e.g., "Every Monday-Friday")

**State**:
- Selected date range
- Current month view
- Expanded/collapsed slot details

**API Calls**:
- GET /api/scheduling/availability
- GET /api/scheduling/availability?date_from=...&date_to=...

---

### 2. AvailabilityForm Component
**File**: `apps/frontend/src/components/scheduling/AvailabilityForm.tsx`
**Purpose**: Create/edit availability slots

**Props**:
```typescript
interface AvailabilityFormProps {
  consultantId: string;
  organizationId: string;
  initialSlot?: AvailabilitySlot;
  onSuccess?: (slot: AvailabilitySlot) => void;
  onCancel?: () => void;
}
```

**Form Fields**:
- [ ] Slot Type (One-time / Recurring)
- [ ] Date/Day Selection
  - If One-time: Date picker
  - If Recurring: Day of week (Mon-Sun) + end date
- [ ] Start Time (HH:MM format)
- [ ] End Time (HH:MM format)
- [ ] Duration in minutes (auto-calculated)
- [ ] Timezone selector
- [ ] Max concurrent bookings (1-5)
- [ ] Notes/Description (optional)
- [ ] Save/Cancel buttons

**Validation**:
```typescript
const createSlotSchema = z.object({
  slot_type: z.enum(['ONE_TIME', 'RECURRING']),
  date_specific: z.string().date().optional(),
  day_of_week: z.number().min(0).max(6).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_minutes: z.number().positive().optional(),
  timezone: z.string(),
  max_concurrent_bookings: z.number().min(1).max(5),
  recurring_until: z.string().date().optional(),
});
```

**API Calls**:
- POST /api/scheduling/availability (create)
- PUT /api/scheduling/availability/:slotId (update)
- DELETE /api/scheduling/availability/:slotId (delete)

**Error Handling**:
- Time validation (end > start)
- Past date prevention
- Timezone validation
- Show error toast for API failures

---

### 3. SlotBulkCreator Component
**File**: `apps/frontend/src/components/scheduling/SlotBulkCreator.tsx`
**Purpose**: Quickly create recurring availability slots

**Features**:
- Preset templates:
  - "Monday-Friday 9am-5pm"
  - "Weekends 10am-4pm"
  - "Custom schedule"
- Visual preview of created slots
- Confirm before bulk create
- Success confirmation with slot count

**Workflow**:
1. Select preset or custom
2. Adjust times if needed
3. Select start and end date for recurrence
4. Preview generated slots
5. Confirm creation

**API Calls**:
- Multiple POST /api/scheduling/availability calls
- Or implement POST /api/scheduling/availability/bulk (future enhancement)

---

### 4. SessionCalendar Component
**File**: `apps/frontend/src/components/scheduling/SessionCalendar.tsx`
**Purpose**: Visual calendar of scheduled sessions with status indicators

**Props**:
```typescript
interface SessionCalendarProps {
  consultantId: string;
  organizationId: string;
  onSessionClick?: (session: SessionBooking) => void;
}
```

**Features**:
- Month/Week/Day view toggle
- Color-coded by status:
  - Blue: SCHEDULED
  - Green: CONFIRMED
  - Gray: COMPLETED
  - Red: CANCELLED
  - Orange: NO_SHOW
- Session tooltips on hover:
  - Beneficiary name
  - Session type
  - Meeting format
  - Duration
- Conflict indicators (if any)
- Click session to view details/actions

**API Calls**:
- GET /api/scheduling/consultant/:consultantId/bookings
- GET /api/scheduling/consultant/:consultantId/bookings?status=...

---

### 5. SessionCard Component
**File**: `apps/frontend/src/components/scheduling/SessionCard.tsx`
**Purpose**: Individual session display with action buttons

**Props**:
```typescript
interface SessionCardProps {
  session: SessionBooking;
  actions?: 'confirm' | 'complete' | 'manage';
  onConfirm?: (bookingId: string) => void;
  onComplete?: (bookingId: string, attended: boolean) => void;
}
```

**Card Layout**:
```
┌─────────────────────────────────────┐
│ [Status Badge]                      │
│ Beneficiary: John Doe               │
│ Date: Mon, Jan 15, 2025             │
│ Time: 09:00 - 10:30 (90 min)        │
│ Type: FOLLOW_UP                     │
│ Format: VIDEO                       │
│ Notes: Discuss progress on skills   │
├─────────────────────────────────────┤
│ [Confirm] [Complete] [Cancel]       │
└─────────────────────────────────────┘
```

**Status Display**:
- Color badge with status
- Time until session (if scheduled)
- Past indicator if completed

**Actions**:
- Confirm (if SCHEDULED)
- Mark Complete / No-Show (if CONFIRMED)
- Cancel (with reason)
- View Details (full modal)

---

### 6. BookingConfirmation Modal
**File**: `apps/frontend/src/components/scheduling/BookingConfirmation.tsx`
**Purpose**: Confirm a scheduled booking

**Features**:
- Session details display
- Optional notes field
- Confirm/Cancel buttons
- Loading state during submission

**API Call**:
- PUT /api/scheduling/bookings/:bookingId/confirm

---

### 7. SessionCompletion Modal
**File**: `apps/frontend/src/components/scheduling/SessionCompletion.tsx`
**Purpose**: Mark session as completed and provide feedback form

**Fields**:
- [ ] Attended? (Yes/No toggle)
- [ ] Rating (1-5 stars) - optional if attended
- [ ] Feedback text - optional
- [ ] Notes - optional

**Validation**:
```typescript
const completeSessionSchema = z.object({
  attended: z.boolean(),
  beneficiary_rating: z.number().min(1).max(5).optional(),
  beneficiary_feedback: z.string().max(1000).optional(),
});
```

**API Call**:
- PUT /api/scheduling/bookings/:bookingId/complete

---

### 8. AnalyticsDashboard Component
**File**: `apps/frontend/src/components/scheduling/AnalyticsDashboard.tsx`
**Purpose**: Display session metrics and performance analytics

**Sections**:
1. **Metrics Summary** (Cards)
   - Total sessions scheduled (this month)
   - Sessions completed
   - No-show count
   - Cancellation count
   - Average rating (1-5 stars)
   - Total hours completed

2. **Charts** (using Recharts or Chart.js)
   - Session count trend (7 days / 30 days)
   - Completion rate (pie chart)
   - Rating distribution (bar chart)
   - Hours per day (line chart)

3. **Recent Sessions Table**
   - Last 10 completed sessions
   - Columns: Date, Beneficiary, Rating, Duration, Status

**Date Range Filter**:
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range

**API Calls**:
- GET /api/scheduling/analytics/consultant/:consultantId?date_from=...&date_to=...
- GET /api/scheduling/consultant/:consultantId/bookings?status=COMPLETED

---

### 9. ConsultantSchedulePage (Main Container)
**File**: `apps/frontend/src/pages/consultant/schedule.tsx` or `ConsultantSchedulePage.tsx`
**Purpose**: Main page containing all scheduling UI

**Layout**:
```
┌─────────────────────────────────────────────┐
│ Consultant Schedule Dashboard               │
├─────────────────────────────────────────────┤
│ [Availability] [Sessions] [Analytics] Tabs  │
├─────────────────────────────────────────────┤
│                                             │
│  [Tab Content]                              │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Features**:
- Tab navigation (Availability, Sessions, Analytics)
- Breadcrumb navigation
- Organization/Consultant selector (if org admin)
- Date range selector
- Status filter buttons
- Error/Success toast notifications
- Loading skeletons while fetching

**Responsibilities**:
- Manage overall state
- Handle tab switching
- Fetch data (React Query)
- Pass props to child components
- Handle error states

---

## 🎨 UI/UX Considerations

### Design System
- Use existing design tokens (colors, spacing, fonts)
- Match existing BilanCompetence.AI UI style
- Ensure accessibility (WCAG 2.1 AA)
- Mobile responsive design

### Calendar Implementation Options

**Option 1: React Big Calendar**
- Pros: Feature-rich, flexible, good for month/week/day views
- Cons: Large bundle size
- Install: `npm install react-big-calendar`

**Option 2: FullCalendar**
- Pros: Very powerful, beautiful UI, official TypeScript support
- Cons: Premium features require license
- Install: `npm install @fullcalendar/react`

**Option 3: Custom Calendar**
- Pros: Lightweight, full control
- Cons: More development time
- Use: Native JS Date APIs + React hooks

**Recommendation**: React Big Calendar (proven, good balance)

### Color Scheme for Status
- SCHEDULED: Blue (#2563eb)
- CONFIRMED: Green (#16a34a)
- IN_PROGRESS: Purple (#9333ea)
- COMPLETED: Gray (#6b7280)
- CANCELLED: Red (#dc2626)
- NO_SHOW: Orange (#ea580c)

---

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px (single column, stacked cards)
- Tablet: 640px - 1024px (2 columns, simplified calendar)
- Desktop: > 1024px (full featured layout)

### Mobile Optimizations
- Bottom sheet modals instead of center modals
- Touch-friendly button sizes (44px minimum)
- Horizontal scrolling for tables
- Collapsible sections

---

## 🔌 API Integration

### Required API Endpoints (All from Phase 1 ✅)
```
GET    /api/scheduling/availability
POST   /api/scheduling/availability
PUT    /api/scheduling/availability/:id
DELETE /api/scheduling/availability/:id

GET    /api/scheduling/consultant/:consultantId/bookings
PUT    /api/scheduling/bookings/:id/confirm
PUT    /api/scheduling/bookings/:id/complete
PUT    /api/scheduling/bookings/:id/cancel

GET    /api/scheduling/analytics/consultant/:consultantId
```

### API Client Setup
**File**: `apps/frontend/src/api/schedulingClient.ts`

```typescript
// Availability endpoints
export const schedulingAPI = {
  // Availability
  getAvailability: (consultantId: string) => ...,
  createAvailability: (data: CreateSlotData) => ...,
  updateAvailability: (slotId: string, data: UpdateSlotData) => ...,
  deleteAvailability: (slotId: string) => ...,

  // Bookings
  getConsultantBookings: (consultantId: string, filters?: Filters) => ...,
  confirmBooking: (bookingId: string) => ...,
  completeSession: (bookingId: string, data: CompleteSessionData) => ...,
  cancelBooking: (bookingId: string, reason: string) => ...,

  // Analytics
  getAnalytics: (consultantId: string, dateRange?: DateRange) => ...,
};
```

### React Query Setup
```typescript
// hooks/useAvailability.ts
export function useAvailability(consultantId: string) {
  return useQuery({
    queryKey: ['availability', consultantId],
    queryFn: () => schedulingAPI.getAvailability(consultantId),
  });
}

// hooks/useBookings.ts
export function useConsultantBookings(consultantId: string, filters?: Filters) {
  return useQuery({
    queryKey: ['bookings', consultantId, filters],
    queryFn: () => schedulingAPI.getConsultantBookings(consultantId, filters),
  });
}

// hooks/useMutations.ts
export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => schedulingAPI.confirmBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
```

---

## 📁 File Structure

```
apps/frontend/src/
├── pages/consultant/
│   └── schedule.tsx                (Main page)
├── components/scheduling/
│   ├── ConsultantSchedulePage.tsx  (Container)
│   ├── AvailabilityCalendar.tsx
│   ├── AvailabilityForm.tsx
│   ├── SlotBulkCreator.tsx
│   ├── SessionCalendar.tsx
│   ├── SessionCard.tsx
│   ├── BookingConfirmation.tsx
│   ├── SessionCompletion.tsx
│   └── AnalyticsDashboard.tsx
├── hooks/scheduling/
│   ├── useAvailability.ts
│   ├── useBookings.ts
│   ├── useAnalytics.ts
│   └── useMutations.ts
├── api/
│   └── schedulingClient.ts
├── schemas/scheduling/
│   └── validationSchemas.ts
└── utils/scheduling/
    └── dateUtils.ts
```

---

## 🧪 Testing Strategy

### Unit Tests (per component)
**File Pattern**: `{ComponentName}.spec.tsx`

**Test Coverage**:
- Render tests (component mounts correctly)
- Props validation
- User interactions (click, input, submit)
- Error state handling
- Loading state handling
- API call verification (mocked)

**Example Test**:
```typescript
describe('AvailabilityForm', () => {
  it('should render form with all fields', () => {
    render(<AvailabilityForm {...props} />);
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
  });

  it('should validate time range', async () => {
    render(<AvailabilityForm {...props} />);
    // Fill start > end time
    // Submit
    // Check error message
  });

  it('should call API on submit', async () => {
    const mockApi = vi.fn();
    render(<AvailabilityForm onSuccess={mockApi} {...props} />);
    // Fill form
    // Submit
    // Verify API called
  });
});
```

### Integration Tests
**File**: `scheduling.integration.spec.tsx`

**Scenarios**:
- Create availability slot and verify in calendar
- Update existing slot
- Delete slot
- Confirm booking
- Complete session with rating
- Filter sessions by status
- View analytics

---

## ✅ Implementation Checklist

### Component Development
- [ ] Create 9-10 scheduling components
- [ ] Implement all forms with validation
- [ ] Implement calendar views
- [ ] Implement analytics dashboard
- [ ] Add loading/error states
- [ ] Add success notifications

### API Integration
- [ ] Create schedulingClient.ts
- [ ] Create custom hooks for data fetching
- [ ] Implement React Query setup
- [ ] Add error handling
- [ ] Add loading states

### Testing
- [ ] Write unit tests for components (80%+ coverage)
- [ ] Write integration tests for workflows
- [ ] Test error scenarios
- [ ] Test accessibility

### Styling
- [ ] Apply design system colors/spacing
- [ ] Implement responsive layout
- [ ] Ensure accessibility (WCAG 2.1 AA)
- [ ] Mobile optimization

### Documentation
- [ ] Component documentation
- [ ] Storybook stories (optional)
- [ ] API integration guide
- [ ] User guide/help text

---

## 📅 Implementation Timeline

### Day 1: Setup & Calendar Components (4-5 hours)
- Create component file structure
- Build AvailabilityCalendar component
- Build SessionCalendar component
- Set up React Query and API client

### Day 2: Forms & Management UI (4 hours)
- Build AvailabilityForm component
- Build SlotBulkCreator component
- Build SessionCard component
- Build modals (Confirm, Complete)

### Day 3: Analytics & Integration (4 hours)
- Build AnalyticsDashboard component
- Build main ConsultantSchedulePage container
- Integrate all components
- Test workflows

### Day 4: Testing & Polish (2-4 hours)
- Write unit tests (50+ test cases)
- Write integration tests
- Fix bugs and edge cases
- Responsive design refinement
- Deploy and verify

---

## 🚀 Deployment Steps

### Pre-Deployment
1. All tests passing (unit + integration)
2. Code review completed
3. No TypeScript errors
4. Browser compatibility verified
5. Mobile responsiveness tested

### Deployment
1. Commit with message: `feat(scheduling): Implement consultant frontend - Phase 2`
2. Push to main branch
3. Vercel automatic deployment
4. Verify in production:
   - All pages load
   - API calls work
   - Forms submit correctly
   - Calendar renders

### Post-Deployment Verification
```bash
# Check health
curl https://bilancompetence.ai/consultant/schedule/availability

# Test availability creation
# Test session confirmation
# Test analytics dashboard
```

---

## 🔗 Dependencies

### Required Libraries
- **React**: >=18.0
- **React Router**: >=6.0 (for navigation)
- **React Query**: >=3.0 (for data fetching)
- **Zod**: >=3.0 (validation)
- **React Big Calendar**: >=1.0 (calendar component)
- **Recharts**: >=2.0 (charts)
- **Tailwind/CSS**: For styling
- **React Hot Toast**: For notifications

### Optional Enhancements
- Storybook: Component documentation
- Vitest: Fast testing
- Testing Library: Component testing

---

## 📊 Success Metrics

Phase 2 is complete when:
- ✅ All 9-10 components built and working
- ✅ 100+ test cases passing
- ✅ All 8 API endpoints integrated and tested
- ✅ Responsive design working on mobile/tablet/desktop
- ✅ Zero TypeScript errors in scheduling module
- ✅ Deployed to Vercel and verified
- ✅ All workflows tested and working
- ✅ Documentation complete

---

## 🎓 Notes for Development

### Important Considerations

1. **Timezone Handling**
   - Availability and bookings are stored in UTC in DB
   - Always display in consultant's timezone (from profile)
   - Convert when sending to API

2. **Conflict Prevention**
   - API prevents double-booking (Phase 1 ✅)
   - UI should show visual conflicts
   - Disable booking if conflict detected

3. **State Management**
   - Use React Query for server state (availability, bookings)
   - Use useState for UI state (modal open, selected date)
   - Keep state as local as possible

4. **Performance**
   - Virtualize long lists (many sessions/slots)
   - Debounce date range filters
   - Implement proper loading states
   - Cache analytics data

5. **Accessibility**
   - Calendar keyboard navigation
   - ARIA labels on all interactive elements
   - Color not only indicator of status (use text labels)
   - Form error messages linked to fields

---

## 📞 Questions & Decisions

### Before Starting, Decide On:

1. **Calendar Library**
   - [ ] React Big Calendar
   - [ ] FullCalendar
   - [ ] Custom implementation
   - **Recommendation**: React Big Calendar

2. **State Management**
   - [ ] React Query only
   - [ ] + Redux
   - [ ] + Context API
   - **Recommendation**: React Query + Context (org/consultant)

3. **Chart Library**
   - [ ] Recharts
   - [ ] Chart.js
   - [ ] Visx
   - **Recommendation**: Recharts (React-friendly)

4. **Styling Approach**
   - [ ] Tailwind CSS
   - [ ] CSS Modules
   - [ ] Styled Components
   - **Recommendation**: Match existing project

---

**Phase 2 Plan Complete** ✅

Ready to proceed with implementation!

---
