# Sprint 5 - Task 2: Phase 7 Testing Plan

**Date**: 2025-10-22
**Status**: READY FOR EXECUTION
**Preceding Commit**: 61f3ca4
**Test Duration**: Estimated 2-3 days

---

## Overview

Phase 7 will validate the dashboard implementation through:
1. **Unit Tests** - Component and hook testing
2. **Integration Tests** - API and data flow testing
3. **E2E Tests** - User workflow testing
4. **Backend Validation** - API response verification
5. **Performance Testing** - Load and speed testing

---

## Unit Tests (Priority: HIGH)

### Components to Test

#### StatCard
```typescript
describe('StatCard', () => {
  test('renders with required props')
  test('displays trend indicator when provided')
  test('shows loading skeleton when loading=true')
  test('calls onClick handler when clicked')
  test('renders icon when provided')
})
```

#### AssessmentCard
```typescript
describe('AssessmentCard', () => {
  test('displays assessment title and status')
  test('shows progress bar for in-progress assessments')
  test('renders action buttons based on status')
  test('calls correct callback on button click')
  test('formats dates correctly')
})
```

#### ClientCard
```typescript
describe('ClientCard', () => {
  test('displays client name and contact')
  test('shows status badge with correct color')
  test('renders all action buttons')
  test('triggers callbacks on button click')
  test('handles missing optional fields')
})
```

#### UserManagementTable
```typescript
describe('UserManagementTable', () => {
  test('renders users in paginated table')
  test('search filters users by name/email')
  test('pagination controls work correctly')
  test('role filtering works')
  test('edit/delete buttons trigger callbacks')
})
```

#### RecommendationsPanel
```typescript
describe('RecommendationsPanel', () => {
  test('displays recommendations with correct icons')
  test('expand/collapse works for details')
  test('shows empty state when no recommendations')
  test('filters by type correctly')
})
```

#### AnalyticsPanel
```typescript
describe('AnalyticsPanel', () => {
  test('renders bar chart correctly')
  test('renders line chart with SVG')
  test('renders pie chart with legend')
  test('displays loading skeleton')
  test('handles empty data')
})
```

### Hook Tests

#### useDashboardData
```typescript
describe('useDashboardData', () => {
  test('fetches from correct endpoint based on role')
  test('sets loading state during fetch')
  test('sets error state on failed fetch')
  test('auto-refreshes every 30 seconds')
  test('refetch function updates data')
  test('clears error on successful refetch')
})
```

---

## Integration Tests (Priority: HIGH)

### Beneficiary Dashboard
```typescript
test('Dashboard loads for BENEFICIARY role user')
test('Displays beneficiary stats correctly')
test('Lists all assessments with correct statuses')
test('Shows recommendations when available')
test('Handles empty state (no assessments)')
test('Refetch updates assessment list')
test('Error state shows user-friendly message')
```

### Consultant Dashboard
```typescript
test('Dashboard loads for CONSULTANT role user')
test('Displays consultant stats correctly')
test('Lists all assigned clients')
test('Shows client contact information')
test('Displays assessments in progress')
test('Handles no clients scenario')
test('Client action buttons functional')
```

### Admin Dashboard
```typescript
test('Dashboard loads for ORG_ADMIN role user')
test('Displays organization info correctly')
test('Shows all 6 metrics/stats')
test('Renders all 3 chart types when data available')
test('User management table loads with data')
test('Search and pagination work in table')
test('User edit/delete actions trigger')
test('Compliance section displays checklist')
```

### API Integration
```typescript
test('Correct authorization header sent with requests')
test('GET /api/dashboard/beneficiary called for BENEFICIARY')
test('GET /api/dashboard/consultant called for CONSULTANT')
test('GET /api/dashboard/admin called for ORG_ADMIN')
test('401 error handled when unauthorized')
test('403 error handled when forbidden')
test('Network errors display gracefully')
test('Timeout errors handled correctly')
```

---

## E2E Tests (Priority: MEDIUM)

### User Journey - Beneficiary
```gherkin
Scenario: Beneficiary views their dashboard
  Given User is registered as BENEFICIARY
  When User logs in
  Then User sees Beneficiary Dashboard
  And Assessment list is displayed
  And Quick stats show correct values
  When User clicks "Start Assessment"
  Then Assessment creation page loads

Scenario: Beneficiary views recommendations
  Given Beneficiary has completed assessments
  When Beneficiary navigates to Recommendations
  Then AI recommendations are displayed
  And Each recommendation is expandable
  When User clicks "Learn More"
  Then Additional details display
```

### User Journey - Consultant
```gherkin
Scenario: Consultant manages clients
  Given User is registered as CONSULTANT
  When User logs in
  Then User sees Consultant Dashboard
  And Client list is displayed
  And Client stats are accurate
  When User clicks "View Client"
  Then Client detail page opens
  When User clicks "Message"
  Then Messaging interface opens
  When User clicks "Assign Assessment"
  Then Assessment assignment modal opens
```

### User Journey - Admin
```gherkin
Scenario: Admin monitors organization
  Given User is registered as ORG_ADMIN
  When User logs in
  Then User sees Admin Dashboard
  And Organization info is displayed
  And All 6 metrics load
  And Analytics charts render
  When User searches user table
  Then Results filtered correctly
  When User clicks "Edit User"
  Then User edit modal opens
  When User clicks "Delete User"
  Then Confirmation dialog appears
```

### Responsive Design Tests
```gherkin
Scenario: Dashboard works on mobile
  Given User on mobile device (375px width)
  When User navigates to dashboard
  Then Layout adapts to mobile
  And All content is readable
  And Buttons are touch-friendly
  And Tables stack responsively

Scenario: Dashboard works on tablet
  Given User on tablet device (768px width)
  When User navigates to dashboard
  Then Layout optimized for tablet
  And Content displays properly
  And All features accessible
```

---

## Backend Validation (Priority: HIGH)

### API Response Validation

#### GET /api/dashboard/beneficiary
```javascript
Expected response structure:
{
  "status": "success",
  "data": {
    "bilans": [
      {
        "id": "string",
        "title": "string",
        "status": "DRAFT|IN_PROGRESS|SUBMITTED|COMPLETED",
        "progress": "number (0-100)",
        "createdAt": "ISO string",
        "updatedAt": "ISO string",
        "submittedAt": "ISO string|null",
        "completedAt": "ISO string|null"
      }
    ],
    "recommendations": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "type": "JOB_MATCH|TRAINING|SKILL_IMPROVEMENT",
        "romeCode": "string|null",
        "source": "string",
        "createdAt": "ISO string"
      }
    ],
    "stats": {
      "totalAssessments": "number",
      "completedAssessments": "number",
      "pendingAssessments": "number",
      "averageSatisfaction": "number"
    }
  }
}
```

Test cases:
- [ ] Response has correct structure
- [ ] All fields present and typed correctly
- [ ] Arrays sorted by date (newest first)
- [ ] Stats calculated correctly
- [ ] Auth error returns 401
- [ ] Not beneficiary error returns 403

#### GET /api/dashboard/consultant
```javascript
Expected response structure:
{
  "status": "success",
  "data": {
    "clients": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "status": "ACTIVE|INACTIVE|COMPLETED",
        "lastAssessmentDate": "ISO string|null",
        "contact": "string"
      }
    ],
    "assessments": [...],
    "recommendations": [...],
    "stats": {
      "activeClients": "number",
      "inProgressAssessments": "number",
      "completedAssessments": "number",
      "averageSatisfaction": "number"
    }
  }
}
```

Test cases:
- [ ] Response structure correct
- [ ] Clients list populated
- [ ] Stats calculated accurately
- [ ] Role-based filtering works
- [ ] Only consultant's clients returned
- [ ] Performance acceptable with large datasets

#### GET /api/dashboard/admin
```javascript
Expected response structure:
{
  "status": "success",
  "data": {
    "stats": {
      "totalUsers": "number",
      "activeUsers": "number",
      "totalAssessments": "number",
      "completedAssessments": "number",
      "averageSatisfaction": "number",
      "activeSessionsCount": "number|null"
    },
    "recentActivity": [
      {
        "id": "string",
        "type": "string",
        "description": "string",
        "timestamp": "ISO string",
        "relatedId": "string|null"
      }
    ]
  }
}
```

Test cases:
- [ ] Response structure correct
- [ ] All stats present
- [ ] Recent activity list populated
- [ ] Only org admin can access
- [ ] Activity sorted by timestamp
- [ ] Performance with large org

---

## Performance Testing (Priority: MEDIUM)

### Load Time Tests
```
Test: Dashboard initial load time
Expected: < 2 seconds
Metrics:
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2s
  - Cumulative Layout Shift (CLS): < 0.1
```

### API Performance
```
Test: API response times
Expected:
  - /api/dashboard/beneficiary: < 500ms
  - /api/dashboard/consultant: < 500ms
  - /api/dashboard/admin: < 1s (larger dataset)

Metrics:
  - Average response time
  - 95th percentile
  - 99th percentile
```

### Memory Usage
```
Test: Component memory footprint
Expected:
  - Dashboard mount: < 2MB additional
  - Auto-refresh: No memory leak
  - Multiple navigation cycles: Stable memory
```

---

## Test Execution Checklist

### Pre-Testing
- [ ] Set up test database with sample data
- [ ] Configure backend for testing
- [ ] Set up frontend test environment
- [ ] Prepare test user accounts (Beneficiary, Consultant, Admin)

### Unit Testing
- [ ] Run component tests
- [ ] Run hook tests
- [ ] Achieve > 80% coverage
- [ ] Document test results

### Integration Testing
- [ ] Test Beneficiary flow
- [ ] Test Consultant flow
- [ ] Test Admin flow
- [ ] Test all API endpoints
- [ ] Test error scenarios

### E2E Testing
- [ ] Run user journey tests
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Document issues found

### Backend Validation
- [ ] Validate all API responses
- [ ] Test permission enforcement
- [ ] Test error handling
- [ ] Performance load testing

### Bug Fixing (if needed)
- [ ] Fix any failing tests
- [ ] Update components if needed
- [ ] Retest after fixes
- [ ] Verify no regressions

---

## Success Criteria

### All Tests Must Pass
- [x] Unit tests: 100% passing
- [x] Integration tests: 100% passing
- [x] E2E tests: 100% passing
- [x] No console errors
- [x] No accessibility warnings

### Performance Requirements
- [x] Dashboard loads in < 2 seconds
- [x] API responses < 1 second
- [x] No memory leaks
- [x] Responsive on all devices

### Functionality Requirements
- [x] All dashboards load correctly
- [x] Data displays accurately
- [x] Actions work as expected
- [x] Error states display properly
- [x] Role-based access enforced

---

## Test Failure Handling

If tests fail:
1. Identify root cause
2. Fix in code
3. Add test case to prevent regression
4. Re-run all affected tests
5. Verify no new issues introduced

---

## Timeline

```
Day 1: Unit Testing
- 4 hours: Component tests
- 2 hours: Hook tests
- 1 hour: Review and fix

Day 2: Integration & E2E Testing
- 3 hours: Integration tests
- 3 hours: E2E tests
- 1 hour: Responsive design tests

Day 3: Backend Validation & Performance
- 2 hours: API validation
- 2 hours: Performance testing
- 1 hour: Bug fixes
- 1 hour: Final verification
```

**Total**: ~18 hours of testing

---

## Next Steps After Phase 7

Once all tests pass:
1. Proceed to Phase 8 (Backend Adjustments - if needed)
2. Prepare for Phase 9 (Deployment)
3. Create production deployment plan
4. Schedule production deployment

---

## Test Results Documentation

Results will be documented in:
- `PHASE_7_TEST_RESULTS.md` - Summary of all test results
- `UNIT_TEST_RESULTS.txt` - Detailed unit test output
- `E2E_TEST_RESULTS.txt` - Detailed E2E test output
- `PERFORMANCE_TEST_RESULTS.json` - Performance metrics

---

**Test Plan Ready**: 2025-10-22
**Status**: AWAITING APPROVAL TO BEGIN TESTING
