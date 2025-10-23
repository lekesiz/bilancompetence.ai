# Sprint 7 - Task 2: Zamanlama/Randevu Sistemi - Implementation Plan

**Task**: Scheduling/Appointment System Development
**Sprint**: Sprint 7
**Task Number**: Task 2
**Date**: 2025-10-23
**Status**: PLANNING

---

## 📋 Executive Summary

Zamanlama/Randevu Sistemi, BilanCompetence.AI'nin çekirdek özelliklerinden biri olarak:
- Danışmanların müsaitlik slotlarını yönetmesine izin verir
- Faydalanıcıların danışmanlarla oturumları rezerve etmesini sağlar
- Otomatik hatırlatıcı emailler gönderir
- Oturum katılımını (katıldı/katılmadı) izler
- Bilan zaman çizelgesini yönetir

**Başarı Kriterleri**:
- ✅ Consultant availability slots yönetim
- ✅ Beneficiary booking interface
- ✅ Automated reminder emails
- ✅ Session tracking (attended/absent)
- ✅ Calendar view + list view
- ✅ Conflict detection
- ✅ Timezone support
- ✅ E2E tests (5+ scenarios)

---

## 📊 Requirement Analysis from Product Specs

### Feature 10: Scheduling/Calendar (from MVP Specs, Line 110-114)

```
**10. Scheduling/Calendar**
- Consultant availability slots
- Beneficiary can book sessions
- Reminder emails
- Session tracking (attended/absent)
```

### From Consultant User Flow (Line 224-262):

```
7. SESSION MANAGEMENT
   ├─ View available time slots
   ├─ Accept beneficiary bookings
   ├─ Send calendar invites
   ├─ Record session outcome (attended/absent)
   └─ Add session notes
```

### From Beneficiary User Flow (Line 186-190):

```
5. WAITING FOR CONSULTANT
   ├─ View consultant profile
   ├─ Message consultant
   ├─ View consultant's calendar
   └─ Schedule first meeting
```

### From Sprint Planning (Line 242-249):

```
US-017: Session tracking & scheduling
- Acceptance: ✅ Consultant can log sessions, mark attended/absent
- Tasks:
  1. Create session form
  2. Link to calendar/bilan
  3. Add duration tracking
  4. Save to database
```

---

## 🎯 Feature Scope (Detailed)

### 1. **Consultant Availability Management**

#### 1.1 Create Availability Slots
- Consultant sets working hours (e.g., Mon-Fri 9am-5pm)
- Can create recurring time blocks (weekly)
- Can set custom availability periods
- Can override (add/remove slots)
- Session duration: typically 2-3 hours (configurable per org)

**Data Model**:
```typescript
availability_slots {
  id: UUID
  consultant_id: UUID
  day_of_week: Enum (0-6, or null for custom date)
  start_time: Time (e.g., "09:00")
  end_time: Time (e.g., "17:00")
  duration_minutes: Integer (120)
  max_sessions: Integer (e.g., 2 per 8h day)
  is_recurring: Boolean
  recurring_until: Date (null = indefinite)
  is_available: Boolean (can block out)
  organization_id: UUID
  created_at: Timestamp
  updated_at: Timestamp
}
```

#### 1.2 View Availability
- Calendar grid view (week/month)
- List view of upcoming slots
- Show booked vs. available
- Color coding (green=available, red=booked, gray=unavailable)
- Timezone-aware display

#### 1.3 Manage Availability
- Quick actions: Block time, Add slot, Delete slot
- Bulk operations: Copy previous week, Enable/disable recurring
- Exceptions: Can override specific dates

---

### 2. **Beneficiary Booking Interface**

#### 2.1 Browse & Book
- View consultant's available slots (calendar grid)
- Select desired time slot
- Confirm booking with:
  - Session type (initial meeting, follow-up, etc.)
  - Preferred meeting format (in-person, video, phone)
  - Session topic/notes (optional)
- Receive confirmation email

**Data Model**:
```typescript
session_bookings {
  id: UUID
  bilan_id: UUID
  consultant_id: UUID
  beneficiary_id: UUID
  availability_slot_id: UUID (can be null if custom)
  scheduled_date: Date
  scheduled_start_time: Time
  scheduled_end_time: Time
  duration_minutes: Integer
  session_type: Enum (INITIAL_MEETING, FOLLOW_UP, REVIEW, FINAL)
  meeting_format: Enum (IN_PERSON, VIDEO, PHONE)
  meeting_link: String (null for in-person)
  session_notes: Text (from beneficiary)
  consultant_notes: Text (added later)
  status: Enum (SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
  attended: Boolean (null until completed)
  rating: Integer (1-5, optional post-session)
  feedback: Text (optional)
  bilan_phase_at_time: Enum (PRELIMINARY, INVESTIGATION, CONCLUSION)
  created_at: Timestamp
  updated_at: Timestamp
  cancelled_at: Timestamp (if cancelled)
  completed_at: Timestamp (if completed)
}
```

#### 2.2 Booking Confirmation
- Show:
  - Date & time (with timezone)
  - Consultant info (name, phone, bio)
  - Meeting format & location details
  - What to bring (if in-person)
  - Cancellation policy
  - Add to calendar (.ics file)
- Send confirmation email with:
  - Session details
  - Calendar invite
  - Preparation materials (if any)
  - Consultant's contact info

#### 2.3 Calendar Integration
- Export .ics file (Google Calendar, Outlook, Apple Calendar)
- Or: Direct sync with Google Calendar API (future enhancement)

---

### 3. **Consultant Booking Management**

#### 3.1 View Bookings
- Calendar grid (week/month) with booked sessions
- List view with details
- Filter by status (upcoming, completed, cancelled)
- Color coding:
  - Blue = Upcoming
  - Green = Completed
  - Red = Cancelled
  - Gray = No-show
- Quick actions: Edit, Cancel, Add notes

#### 3.2 Accept/Confirm Booking
- When beneficiary books, consultant receives notification
- Can auto-confirm (if pre-set) or manual approve
- Send confirmation email to beneficiary
- Add session to consultant's calendar (calendar file)

#### 3.3 Manage Sessions
- Edit session details (time, format, notes)
- Cancel session (with reason & notification to beneficiary)
- Reschedule session
- Add preparation notes
- Upload session materials

---

### 4. **Session Tracking & Recording**

#### 4.1 Session Execution
- Consultant marks session as:
  - COMPLETED (attended)
  - NO_SHOW (beneficiary didn't attend)
  - CANCELLED (session was cancelled)
  
- On completion:
  - Record actual end time
  - Add session notes
  - Optionally request beneficiary feedback/rating
  - Auto-increment "hours completed" in bilan

#### 4.2 Session Notes
- Consultant can add notes:
  - Topics discussed
  - Assessments done
  - Action items for beneficiary
  - Observations/recommendations
  - Next session date (if known)

#### 4.3 Follow-up Actions
- Auto-create task/reminder for:
  - Send report
  - Schedule follow-up
  - Share resources

---

### 5. **Automated Reminders & Notifications**

#### 5.1 Beneficiary Reminders
- 24 hours before session: Email reminder with details
- 1 hour before (optional): SMS/Email "session starts in 1 hour"
- Post-session: "Thank you for attending, please rate your experience"

**Email Template**:
```
Subject: Reminder: Your session with [Consultant Name] tomorrow at [TIME]

Hi [Beneficiary Name],

This is a reminder of your session tomorrow:

📅 Date: [Date]
🕐 Time: [Time] - [End Time]
📍 Location: [Format] (e.g., Video Call, Office Address)
👤 Consultant: [Name]
📞 Contact: [Phone/Email]

[If video]: Meeting Link: [Link]
[If in-person]: Prepare to bring: [List]

If you need to reschedule, please reply to this email or log in to your dashboard.

Looking forward to working with you!
```

#### 5.2 Consultant Reminders
- 24 hours before: Summary of day's sessions
- 1 hour before: "Session starts in 1 hour"
- Post-session: "Please complete session notes and mark as attended"

#### 5.3 Organization Notifications
- Admin gets weekly report:
  - Sessions completed
  - Cancellation rate
  - No-show rate
  - Feedback scores

---

### 6. **Conflict Detection & Validation**

#### 6.1 Prevent Double-Booking
- When beneficiary selects slot, check:
  - Slot is still available
  - Consultant doesn't have overlapping booking
  - Reserve slot (lock for 5 min during checkout)

#### 6.2 Bilan Duration Validation
- Check: Total session hours don't exceed bilan's max duration
- Warn if exceeding (e.g., "This would exceed your 24-hour bilan duration")

#### 6.3 Phase-Appropriate Sessions
- Enforce session types based on bilan phase:
  - PRELIMINARY: Allow "INITIAL_MEETING" only
  - INVESTIGATION: Allow "FOLLOW_UP", "REVIEW"
  - CONCLUSION: Allow "FINAL_REVIEW"

---

### 7. **Calendar Views**

#### 7.1 Consultant Calendar (Desktop)
- Week view (default):
  - Display hours (9am-6pm, configurable)
  - Time blocks: color-coded by status
  - Drag-to-reschedule (optional, Phase 2)
  - Click to view details/edit
  
- Month view:
  - Mini calendar
  - Dots for days with sessions
  - Show session count per day

- Agenda view:
  - List of upcoming sessions (next 30 days)
  - Sort by date
  - Quick actions (confirm, cancel, notes)

#### 7.2 Beneficiary Calendar
- View available consultant slots (upcoming 2 weeks)
- Show as grid or list
- Filter by consultant (if multiple)
- "Book now" button per slot
- Show when booking will complete bilan hours

#### 7.3 Mobile Views
- Simplified week view
- Swipe to change week
- Large touch targets
- Minimal scrolling

---

### 8. **Timezone Handling**

#### 8.1 Consultant Timezone
- Consultant sets primary timezone
- All slots stored in that timezone
- Can optionally set different availability for different timezones (Phase 2)

#### 8.2 Beneficiary Timezone
- Beneficiary timezone auto-detected (or user-set)
- All times displayed in beneficiary's timezone
- Conversion happens client-side when possible
- Server stores in UTC

#### 8.3 Timezone Conversion
- When beneficiary sees availability:
  ```
  Server: 14:00 UTC (Consultant in Paris, UTC+1)
  Show to Beneficiary (New York, UTC-4): 10:00 EDT
  ```

---

## 🏗️ Technical Architecture

### 1. Database Schema (PostgreSQL/Supabase)

```sql
-- Table 1: Availability Slots (Recurring Schedule)
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  day_of_week INTEGER, -- 0-6 (Monday-Sunday), null for custom date
  date_specific DATE, -- For one-time slots (overrides recurring)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  max_concurrent_bookings INTEGER DEFAULT 1,
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_until DATE,
  is_available BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP -- Soft delete
);

-- Table 2: Session Bookings
CREATE TABLE session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Session Details
  session_type VARCHAR(50) NOT NULL DEFAULT 'FOLLOW_UP', -- INITIAL_MEETING, FOLLOW_UP, REVIEW, FINAL
  meeting_format VARCHAR(50) NOT NULL DEFAULT 'VIDEO', -- IN_PERSON, VIDEO, PHONE
  meeting_location VARCHAR(255), -- Address or video link
  meeting_link VARCHAR(500), -- Zoom/Google Meet link
  
  -- Notes
  beneficiary_notes TEXT,
  consultant_notes TEXT,
  preparation_materials TEXT,
  
  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  attended BOOLEAN, -- NULL until marked, true/false after session
  cancellation_reason TEXT,
  
  -- Feedback
  beneficiary_rating INTEGER, -- 1-5 stars
  beneficiary_feedback TEXT,
  
  -- Audit
  bilan_phase_at_booking VARCHAR(50), -- PRELIMINARY, INVESTIGATION, CONCLUSION
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Table 3: Session Reminders (Sent/Scheduled)
CREATE TABLE session_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_booking_id UUID NOT NULL REFERENCES session_bookings(id),
  reminder_type VARCHAR(50) NOT NULL, -- BENEFICIARY_24H, BENEFICIARY_1H, CONSULTANT_24H, etc.
  scheduled_time TIMESTAMP NOT NULL,
  sent_at TIMESTAMP, -- NULL if not yet sent
  failed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Table 4: Session Tracking (Analytics)
CREATE TABLE session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  
  session_date DATE NOT NULL,
  total_sessions_scheduled INTEGER,
  total_sessions_completed INTEGER,
  total_sessions_no_show INTEGER,
  total_sessions_cancelled INTEGER,
  average_rating DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add to existing BILANS table:
ALTER TABLE bilans ADD COLUMN total_scheduled_hours DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bilans ADD COLUMN total_completed_hours DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bilans ADD COLUMN last_session_date TIMESTAMP;
ALTER TABLE bilans ADD COLUMN next_session_date TIMESTAMP;
```

### 2. API Endpoints Design

#### A. Availability Slots Management

```
GET    /api/scheduling/availability
       Query: consultant_id, date_from, date_to, include_booked
       Response: Array of availability slots with booking count

POST   /api/scheduling/availability
       Body: {
         day_of_week?: number,
         date_specific?: date,
         start_time: "09:00",
         end_time: "17:00",
         duration_minutes: 120,
         is_recurring: true,
         recurring_until: "2025-12-31",
         timezone: "Europe/Paris"
       }
       Response: Created slot

PUT    /api/scheduling/availability/:slotId
       Body: { is_available: false, ... }
       Response: Updated slot

DELETE /api/scheduling/availability/:slotId
       Response: { success: true }

POST   /api/scheduling/availability/bulk-create
       Body: {
         monday: { start: "09:00", end: "17:00" },
         tuesday: { start: "09:00", end: "17:00" },
         ...
       }
       Response: Created slots array
```

#### B. Session Booking (Beneficiary)

```
GET    /api/scheduling/availability/:consultantId/slots
       Query: bilan_id, date_from, date_to
       Response: Available slots for booking
       
POST   /api/scheduling/bookings
       Body: {
         consultant_id: UUID,
         bilan_id: UUID,
         scheduled_date: "2025-11-15",
         scheduled_start_time: "14:00",
         session_type: "INITIAL_MEETING",
         meeting_format: "VIDEO",
         beneficiary_notes: "...",
         timezone: "Europe/Paris"
       }
       Response: { id: UUID, confirmation_sent: true }

GET    /api/scheduling/bookings/:bilanId
       Response: Beneficiary's bookings for this bilan

PUT    /api/scheduling/bookings/:bookingId
       Body: { 
         scheduled_date?: date, 
         notes?: text,
         status?: "CANCELLED"
       }
       Response: Updated booking

DELETE /api/scheduling/bookings/:bookingId
       Response: { cancelled: true }

POST   /api/scheduling/bookings/:bookingId/rate
       Body: { rating: 5, feedback: "Great session!" }
       Response: { success: true }
```

#### C. Session Management (Consultant)

```
GET    /api/scheduling/consultant/bookings
       Query: from_date, to_date, status
       Response: Array of bookings for consultant

GET    /api/scheduling/consultant/bookings/:bookingId
       Response: Booking details with beneficiary info

PUT    /api/scheduling/consultant/bookings/:bookingId/confirm
       Body: { meeting_link?: "https://..." }
       Response: { confirmed: true, notification_sent: true }

PUT    /api/scheduling/consultant/bookings/:bookingId/complete
       Body: {
         attended: true,
         consultant_notes: "...",
         next_session_date?: "2025-11-22"
       }
       Response: { completed: true, bilan_hours_updated: true }

PUT    /api/scheduling/consultant/bookings/:bookingId/cancel
       Body: { reason: "..." }
       Response: { cancelled: true, notification_sent: true }

GET    /api/scheduling/consultant/calendar
       Query: start_date, end_date, view (week|month)
       Response: Calendar data for frontend rendering
```

#### D. Calendar Data

```
GET    /api/scheduling/calendar/:consultantId
       Query: month_year (e.g., "2025-11"), timezone
       Response: {
         slots: [...availability_slots],
         bookings: [...session_bookings],
         metadata: { timezone, view_mode }
       }

GET    /api/scheduling/calendar/:consultantId/export
       Query: format (ics|ical)
       Response: .ics file (calendar format)
```

---

## 📱 Frontend Implementation

### 1. Component Architecture

```
/app/scheduling/
├── (consultant)/
│   ├── availability/
│   │   ├── page.tsx (Manage availability)
│   │   ├── AvailabilityForm.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── BulkCreate.tsx
│   ├── bookings/
│   │   ├── page.tsx (View all bookings)
│   │   ├── [bookingId]/
│   │   │   ├── page.tsx (Booking details)
│   │   │   ├── SessionNotes.tsx
│   │   │   └── ConfirmModal.tsx
│   │   └── BookingList.tsx
│   └── calendar/
│       ├── page.tsx (Calendar view)
│       ├── WeekView.tsx
│       ├── MonthView.tsx
│       └── AgendaView.tsx
│
├── (beneficiary)/
│   ├── book-session/
│   │   ├── page.tsx (Booking flow)
│   │   ├── SelectConsultant.tsx
│   │   ├── SelectDateTime.tsx
│   │   ├── SessionDetails.tsx
│   │   └── Confirmation.tsx
│   ├── my-sessions/
│   │   ├── page.tsx (My bookings)
│   │   └── SessionCard.tsx
│   └── calendar/
│       ├── page.tsx (Beneficiary calendar)
│       └── AvailabilityGrid.tsx
│
└── shared/
    ├── CalendarGrid.tsx (Shared calendar component)
    ├── TimeSlotSelector.tsx
    ├── ReminderSettings.tsx
    └── TimezoneSelector.tsx
```

### 2. Key Components

#### A. Consultant Availability Manager
```typescript
// AvailabilityCalendar.tsx
- Display week/month view of availability
- Show booked sessions overlaid
- Allow quick block/unblock actions
- Show availability summary (e.g., "15 slots available this week")
- Drag-to-edit (optional Phase 2)

Props:
- consultantId: UUID
- month: Date
- view: 'week' | 'month'
```

#### B. Booking Calendar (Beneficiary)
```typescript
// AvailabilityGrid.tsx
- Show consultant's available slots (grid format)
- Filter by week/date range
- Color code: Green=available, Gray=booked, Red=unavailable
- Click to select slot
- Show session duration
- Show timezone conversion

Props:
- consultantId: UUID
- bilanId: UUID
- dateRange: { from: Date, to: Date }
```

#### C. Session Booking Form
```typescript
// BookingForm.tsx
- Multi-step form:
  1. Select consultant (if multiple)
  2. Select date/time
  3. Session type & format
  4. Notes (optional)
  5. Confirmation
  
- Validation:
  - Check bilan hours not exceeded
  - Check no conflicts
  - Check bilan phase allows this session type
```

#### D. Session Management (Consultant)
```typescript
// SessionDetails.tsx
- Display booking details
- Show beneficiary profile
- Edit notes
- Mark as completed/no-show
- Record attendance
- Add follow-up info
```

---

## 🔄 User Flows with Interaction Diagrams

### Flow 1: Consultant Creates Availability

```
Consultant → Dashboard → Scheduling → Manage Availability
  ↓
Select "Add Availability" → Multi-step form:
  1. Select: Recurring (Mon-Fri 9-5) or One-time
  2. Set: Start/end times
  3. Set: Duration (120 min)
  4. Set: Max concurrent sessions (1)
  5. Set: Timezone
  6. Review & Save
  ↓
System creates availability_slots entries
  ↓
Confirm: "Availability updated! 10 slots added for next week"
  ↓
Calendar refreshes → Shows new availability
```

### Flow 2: Beneficiary Books Session

```
Beneficiary → Dashboard → "Schedule Session" button
  ↓
Step 1: View consultant info & availability
  - Show calendar of available slots (next 2 weeks)
  - Show consultant bio, specialization
  ↓
Step 2: Select date/time
  - Click on available slot
  - See time in beneficiary's timezone
  - See "This will complete X of Y hours"
  ↓
Step 3: Session details
  - Select: Session type (Initial meeting / Follow-up)
  - Select: Meeting format (Video / In-person / Phone)
  - If video: System generates Zoom/Meet link
  - If in-person: Show address/meeting location
  - Optional: Add notes for consultant
  ↓
Step 4: Confirmation
  - Review all details
  - Click "Confirm Booking"
  ↓
System:
  - Creates session_booking entry
  - Reserves slot (decrement availability)
  - Sends confirmation email to both parties
  - Adds to both calendars
  - Creates reminder tasks
  ↓
Show: "Session booked! Check your email for details"
```

### Flow 3: Session Execution & Tracking

```
Consultant → Dashboard → Calendar
  ↓
24h before: Email reminder
  ↓
Session time arrives
  ↓
Meeting happens (video/in-person)
  ↓
After meeting:
  Consultant → Session details page
    ↓
    Mark as: "Completed" or "No-show"
    Add: Session notes
    Add: Topics covered
    Add: Next steps
    Submit
  ↓
System:
  - Updates session_bookings.status = COMPLETED
  - Updates session_bookings.attended = true
  - Increments bilan.total_completed_hours
  - Generates analytics entry
  - Sends follow-up email to beneficiary
  ↓
If beneficiary attended:
  Beneficiary gets: "Please rate your session" prompt
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SCHEDULING SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘

Consultant                          Beneficiary
     │                                  │
     ├─ Create Availability             │
     │  (availability_slots)            │
     │                                  │
     │ ◄─────── Query Available ────────┤
     │         Slots for Booking        │
     │                                  │
     │ ◄─────── Book Session ───────────┤
     │      (session_bookings)          │
     │                                  │
     ├─ Receive Notification ───────────►
     │  (Email: Booking request)        │
     │                                  ├─ Receive Notification
     ├─ Confirm Booking                 │  (Email: Confirmation)
     │  (Status: CONFIRMED)             │
     │                                  │
     │ ◄───── 24h Reminder ─────────────┤
     │                                  ├─ 24h Reminder
     │ (Session starts in 24h)          │
     │                                  │
     │  Session Happens (Video/In-person)
     │                                  │
     ├─ Mark as COMPLETED               │
     │ ├─ Set attended = true           │
     │ ├─ Add notes                     │
     │ ├─ Increment hours               │
     │ └─ Save                          │
     │                                  ├─ Receive Notification
     │                                  │  (Email: Session feedback request)
     │                                  │
     │                                  ├─ Rate Session (1-5 stars)
     │                                  │
     └─ Analytics Updated ──────────────►
        (session_analytics)
```

---

## 🔐 Security & Privacy Considerations

### 1. Authentication & Authorization
- ✅ Only authenticated users can access
- ✅ Consultant can only view/manage own availability
- ✅ Beneficiary can only book from own organization's consultants
- ✅ Admin can view all scheduling (compliance)

### 2. Data Privacy
- ✅ Don't expose consultant's phone number to beneficiary (until session confirmed)
- ✅ Beneficiary identity hidden from other beneficiaries
- ✅ Soft delete for cancelled sessions (keep audit trail)

### 3. Timezone Handling
- ✅ Always convert to UTC server-side
- ✅ Store timezone info with each booking
- ✅ Validate timezone with user location

---

## ✅ Acceptance Criteria

### For Consultant
- [ ] Can create recurring availability (e.g., Mon-Fri 9-5)
- [ ] Can view calendar of availability + bookings
- [ ] Can override/block specific dates
- [ ] Receives notifications when beneficiary books
- [ ] Can confirm/cancel bookings
- [ ] Can mark session as completed/no-show with notes
- [ ] Can view all past sessions
- [ ] Can see analytics (sessions/week, no-show rate)

### For Beneficiary
- [ ] Can view consultant's available slots (next 2 weeks)
- [ ] Can book available slot
- [ ] Receives confirmation email with calendar invite
- [ ] Can view own bookings (list + calendar)
- [ ] Can cancel booking (with 24h notice?)
- [ ] Receives reminder emails (24h, 1h before)
- [ ] Can rate session after completion

### System
- [ ] All times converted correctly to user's timezone
- [ ] No double-booking possible
- [ ] Bilan hours tracked correctly
- [ ] Reminder emails sent on schedule
- [ ] Session status flows correct (SCHEDULED → COMPLETED/CANCELLED/NO_SHOW)
- [ ] Analytics calculated correctly

---

## 📅 Implementation Timeline (Estimated)

### Phase 1: Core Backend (3-4 days)
- [ ] Database schema creation & migrations
- [ ] API endpoints for availability management
- [ ] API endpoints for session bookings
- [ ] Conflict detection logic
- [ ] Email service integration (reminders)

### Phase 2: Consultant Frontend (3-4 days)
- [ ] Availability management UI
- [ ] Calendar view (week/month)
- [ ] Booking management page
- [ ] Session details & notes UI

### Phase 3: Beneficiary Frontend (3-4 days)
- [ ] Booking interface (selecting available slots)
- [ ] My sessions view
- [ ] Calendar view (beneficiary)
- [ ] Session rating/feedback

### Phase 4: Testing & Polish (2-3 days)
- [ ] Unit tests (availability logic, conflict detection)
- [ ] Integration tests (booking flow)
- [ ] E2E tests (5 main scenarios)
- [ ] Bug fixes
- [ ] Performance optimization

### Phase 5: Deployment & Monitoring (1-2 days)
- [ ] Production deployment
- [ ] Monitor emails
- [ ] Monitor timezone handling
- [ ] Performance monitoring

**Total Estimated Time**: 12-17 days (~2.5 weeks)

---

## 📝 E2E Test Scenarios

### Scenario 1: Happy Path - Book & Complete Session
```gherkin
Given I'm logged in as beneficiary
And consultant has availability next Tuesday 2pm
When I navigate to "Book Session"
And I select the Tuesday 2pm slot
And I fill session details
And I click "Confirm"
Then I should see "Session booked!"
And I should receive confirmation email
And session should appear in "My Sessions"
```

### Scenario 2: Conflict Detection
```gherkin
Given consultant has availability slot at 2pm
And beneficiary has already booked that slot
When second beneficiary tries to book same slot
Then system should prevent booking
And show "This slot is no longer available"
```

### Scenario 3: Timezone Conversion
```gherkin
Given consultant is in Paris (UTC+1)
And has availability at "14:00 Paris time"
When beneficiary in New York (UTC-5) views availability
Then time should display as "08:00 EDT"
```

### Scenario 4: Session Completion
```gherkin
Given session is scheduled for today 2pm
When consultant marks session as completed
And adds notes
Then bilan hours should increment
And beneficiary should get feedback request email
```

### Scenario 5: Reminder Emails
```gherkin
Given session is scheduled
When 24 hours remain
Then consultant should receive reminder email
And beneficiary should receive reminder email
```

---

## 🎯 Success Metrics

- ✅ 100% of sessions have bookings visible in both calendars
- ✅ 0 double-bookings
- ✅ > 95% reminder email delivery rate
- ✅ < 100ms for availability query (with 100+ slots)
- ✅ Timezone conversion accuracy: 100%
- ✅ E2E test pass rate: 100%
- ✅ User satisfaction: > 4/5 stars

---

## 📚 References

- Product Specs: Line 110-114, 224-262
- Sprint Planning: Line 242-249
- Technical Architecture: TECHNICAL_ARCHITECTURE.md
- Database Schema: PRODUCT_SPECIFICATIONS_AND_MVP.md (Features section)

---

**Created**: 2025-10-23
**Status**: PLANNING
**Next Step**: Approve plan, then proceed with Phase 1: Core Backend

