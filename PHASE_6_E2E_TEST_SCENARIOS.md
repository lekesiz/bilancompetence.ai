# Phase 6: Integration & E2E Testing - Test Scenarios

## E2E Test Scenarios for Qualiopi Compliance Module

### Overview
This document outlines 10 critical E2E test scenarios for the Qualiopi Compliance Module that test the main user workflows involving the 4 admin pages (Indicators, Surveys, Archive, Reports) and the 16 reusable React components.

**Total Scenarios**: 10
**Expected Duration**: 45-60 minutes
**Tester Role**: ADMIN or ORG_ADMIN
**Environment**: Development (http://localhost:3000)

---

## Test Scenario 1: Indicator Status Update Workflow

**Objective**: Verify that users can view compliance indicators and update their status

**Components Tested**:
- MetricCard (compliance metrics display)
- StatusBadge (indicator status badges)
- Modal (detail modal)
- Button (status update buttons)
- FormSelect (status selection dropdown)

**Steps**:
1. Navigate to `/admin/qualiopi/indicators`
2. Verify the page loads and displays:
   - Overall Compliance percentage (MetricCard)
   - Compliant count (MetricCard with green gradient)
   - Under Review count (MetricCard with yellow gradient)
   - Missing count (MetricCard with red gradient)
3. Verify status filter buttons exist (ALL, COMPLIANT, MISSING, UNDER_REVIEW)
4. Click on Indicator #1 card to open detail modal
5. Verify modal displays:
   - Indicator title and number
   - Current status with StatusBadge
   - Evidence count
   - Last reviewed information
6. Click "Update Status" button in the modal
7. Select new status from FormSelect dropdown (e.g., COMPLIANT)
8. Click "Save" button
9. Verify:
   - Modal closes
   - Status updates in the list
   - MetricCard numbers update accordingly
   - Toast notification confirms success

**Expected Result**: ✅ Indicator status updates successfully, UI reflects changes immediately

**Failure Criteria**:
- Modal fails to open
- Status select dropdown doesn't display options
- Status update fails on API call
- MetricCard numbers don't update
- Toast notification doesn't appear

---

## Test Scenario 2: Add Indicator Evidence

**Objective**: Verify that users can add evidence files to indicators

**Components Tested**:
- Modal (evidence modal)
- FormInput (file name input)
- Button (upload button)
- LoadingSkeleton (loading state)

**Steps**:
1. Open an indicator detail modal (from Scenario 1)
2. Click "Add Evidence" button in the modal
3. A form appears with:
   - File input field
   - File name/description input (FormInput)
   - Upload button
4. Select a test document (PDF, DOC, etc., max 10MB)
5. Enter description: "Evidence for Indicator #1"
6. Click "Upload" button
7. Observe LoadingSkeleton during upload
8. Verify:
   - File appears in evidence list
   - Evidence count increments
   - Toast confirms upload success
   - File is selectable/downloadable

**Expected Result**: ✅ Evidence file uploaded and listed successfully

**Failure Criteria**:
- File upload fails
- Error message not displayed
- File not visible in list
- Evidence count doesn't update
- Download functionality unavailable

---

## Test Scenario 3: Survey Analytics Dashboard

**Objective**: Verify that survey analytics display correctly with all components

**Components Tested**:
- NPSScoreCard (NPS visualization)
- BarChart (question analysis)
- MetricCard (survey metrics)
- Badge (status indicators)
- DataTable (consultant performance)

**Steps**:
1. Navigate to `/admin/qualiopi/surveys`
2. Verify page loads and displays:
   - **NPS Score Card** with:
     - Large NPS number (-100 to +100)
     - Category badge (Excellent/Good/Moderate/Poor)
     - Promoters/Passives/Detractors percentage bars
   - **Survey Metrics** (MetricCards):
     - Total sent surveys
     - Responses received
     - Response rate percentage
     - Average satisfaction score with stars
3. Scroll to BarChart section showing question-by-question analysis
   - Verify bars display for each survey question
   - Bars scale appropriately (0-100%)
   - Question labels visible
4. Scroll to Consultant Performance table (DataTable)
   - Verify columns: Name, Avg Rating, Response Rate, Surveys Sent
   - Verify data sorts when clicking column headers
   - Verify pagination controls if data > 10 rows

**Expected Result**: ✅ All survey analytics components display and function correctly

**Failure Criteria**:
- NPS card shows incorrect calculation
- BarChart bars don't scale properly
- DataTable doesn't sort
- Pagination missing or non-functional
- Missing values or N/A displayed incorrectly

---

## Test Scenario 4: Document Archive Filtering & Search

**Objective**: Verify archive filtering, search, and access logging works

**Components Tested**:
- FilterBar (search and filter)
- DataTable (document list with sorting)
- Modal (access log modal)
- LoadingSkeleton (loading state)
- MetricCard (archive statistics)

**Steps**:
1. Navigate to `/admin/qualiopi/archive`
2. Verify page displays:
   - Archive statistics (MetricCard):
     - Total documents
     - Expiring soon count
     - Documents by type
3. Verify FilterBar with:
   - Search input (by file name)
   - Document type filter
   - Bilan ID filter
4. Search for a specific document:
   - Type document name in search box
   - Verify results filter in real-time
5. Filter by document type (e.g., "Employment Letter"):
   - Select from dropdown
   - Verify DataTable shows only that type
6. Click "Clear Filters" button
   - Verify all documents reappear
7. Click on a document row to view details
8. Click "View Access Log" button to open modal
   - Verify modal shows:
     - User names who accessed
     - Access timestamps
     - IP addresses
     - Action type (VIEW/DOWNLOAD/SHARE)
9. Verify DataTable pagination:
   - Navigate through pages using next/previous buttons
   - Verify page numbers update

**Expected Result**: ✅ Filtering, search, pagination, and access logs all work correctly

**Failure Criteria**:
- FilterBar doesn't filter in real-time
- DataTable pagination broken
- Access log modal shows empty data
- Search box doesn't filter documents
- Clear filters button doesn't reset

---

## Test Scenario 5: Generate & Download Compliance Report

**Objective**: Verify report generation and export functionality

**Components Tested**:
- MetricCard (compliance metrics)
- Card (report sections)
- Button (generate and download buttons)
- Badge (status indicators)
- Alert (important notices)

**Steps**:
1. Navigate to `/admin/qualiopi/reports`
2. Verify page displays:
   - Compliance metrics (MetricCard):
     - Overall compliance %
     - Compliant count
     - Under review count
     - Audit readiness status
3. Verify toggles/options for:
   - Include evidence checkbox
   - Include audit history checkbox
4. Click "Generate Report" button
5. Observe report generation (may include loading spinner)
6. Verify report displays:
   - Organization name
   - Report date
   - Overall compliance percentage
   - Summary of compliant, missing, under review items
   - Next steps recommendations
   - Audit schedule if applicable
7. Select export format:
   - Click "Download as JSON" button
   - Verify JSON file downloads
   - Verify file contains all report data
8. Click "Download as CSV" button
   - Verify CSV file downloads
   - Open CSV and verify data formatting
9. Click "Download as PDF" button (if available)
   - Verify PDF downloads
   - Verify PDF displays formatted report

**Expected Result**: ✅ Reports generate and export in all formats successfully

**Failure Criteria**:
- Report generation times out
- Export buttons don't work
- Downloaded files are empty
- Data missing from exports
- PDF formatting broken

---

## Test Scenario 6: Modal Interactions & Navigation

**Objective**: Verify all modal functionality works across the application

**Components Tested**:
- Modal (all modal instances)
- Button (close, save, cancel buttons)
- FormInput (inputs within modals)
- Alert (error messages)

**Steps**:
1. Open any modal (e.g., indicator detail modal)
2. Verify:
   - Modal background overlay appears
   - Close button (X) visible in top-right
   - Title displayed in header
   - Content scrollable if oversized
3. Click outside modal (on overlay) to close
   - Verify modal closes
4. Open modal again
5. Click close button (X)
   - Verify modal closes
6. Open a modal with form fields
7. Fill in form fields
8. Click "Cancel" button
   - Verify modal closes without saving
9. Open modal again
10. Fill in form fields with invalid data
    - Verify error messages display
    - Verify submit button is disabled (if applicable)
11. Correct errors
12. Click "Save" button
    - Verify success toast appears
    - Verify modal closes
    - Verify data persists

**Expected Result**: ✅ All modal interactions work smoothly without errors

**Failure Criteria**:
- Modal doesn't close on overlay click
- Close button non-functional
- Form data persists after cancel
- Errors not displayed for invalid input
- Save button doesn't submit

---

## Test Scenario 7: Form Validation & Error Handling

**Objective**: Verify form components validate correctly and display errors

**Components Tested**:
- FormInput (validation messages)
- FormSelect (required validation)
- Button (disabled state)
- Alert (error alerts)

**Steps**:
1. Open a detail modal with forms
2. Try to submit without filling required fields
3. Verify error messages appear:
   - Below FormInput fields
   - In red text color
   - With ✕ icon
4. Fill in required fields
5. Verify error messages disappear
6. Verify submit button is enabled
7. Try to enter invalid data:
   - Text in number-only field (if applicable)
   - Too long text in character-limited field
8. Verify appropriate validation messages display
9. For SelectForm fields:
   - Click dropdown
   - Verify placeholder text "Seçiniz" appears
   - Verify options display
   - Select an option
   - Verify selection displays in the input

**Expected Result**: ✅ Form validation and error messages work correctly

**Failure Criteria**:
- Error messages don't display
- Submit button enabled with invalid data
- FormSelect doesn't open
- Validation messages are unclear
- Fields accept invalid data types

---

## Test Scenario 8: Responsive Design & Mobile Navigation

**Objective**: Verify application responds correctly on different screen sizes

**Components Tested**:
- DataTable (responsive layout)
- MetricCard (grid layout)
- Modal (responsive sizing)
- Button (touch-friendly sizing)
- FilterBar (mobile layout)

**Steps**:
1. Open the application in desktop mode (1920x1080)
2. Verify:
   - MetricCard grid shows 4 columns
   - DataTable displays horizontally
   - Buttons have proper spacing
3. Resize browser to tablet size (768x1024)
4. Verify:
   - MetricCard grid shows 2 columns
   - DataTable is horizontally scrollable if needed
   - FilterBar stacks vertically
   - Buttons remain accessible
5. Resize browser to mobile size (375x667)
6. Verify:
   - MetricCard grid shows 1 column
   - DataTable is fully scrollable
   - FilterBar is compact
   - Modal fits within viewport
   - Navigation is accessible
7. Test touch interactions on mobile:
   - Tap buttons to ensure they're large enough
   - Scroll through content
   - Interact with modals

**Expected Result**: ✅ Application is fully responsive across all screen sizes

**Failure Criteria**:
- Content overlaps on smaller screens
- Buttons too small to tap
- DataTable unreadable on mobile
- Modal doesn't fit viewport
- Filters not accessible on mobile

---

## Test Scenario 9: Performance & Loading States

**Objective**: Verify loading states display correctly and performance is acceptable

**Components Tested**:
- LoadingSkeleton (all loading states)
- Button (loading state spinner)
- Modal (loading during save)

**Steps**:
1. Navigate to indicators page
2. Observe initial load:
   - LoadingSkeleton displays for MetricCards
   - LoadingSkeleton displays for DataTable
   - Skeletons animate smoothly
3. Wait for data to load (< 2 seconds)
4. Verify skeletons disappear and actual content displays
5. Click a button that triggers an API call
6. Observe:
   - Button shows loading spinner
   - Button text changes to "Loading..."
   - Button is disabled during request
7. Wait for response (< 3 seconds)
8. Verify:
   - Loading state completes
   - Success/error message displays
   - Button returns to normal state
9. Open a detail modal and save
10. Observe:
    - Modal shows loading state during save
    - Submit button is disabled
    - Progress indicator visible

**Expected Result**: ✅ Loading states display correctly and performance is good

**Failure Criteria**:
- LoadingSkeleton doesn't display
- Loading takes > 5 seconds
- Button doesn't show loading state
- No visual feedback during operations
- API requests timeout frequently

---

## Test Scenario 10: Accessibility Compliance

**Objective**: Verify application is accessible to users with disabilities

**Components Tested**:
- All components (ARIA roles and labels)
- Keyboard navigation
- Color contrast
- Focus management

**Steps**:

### Keyboard Navigation:
1. Press Tab key repeatedly to navigate through all interactive elements
2. Verify focus is visible (outline or highlight)
3. Verify focus order is logical (left-to-right, top-to-bottom)
4. Open modals using Tab + Enter
5. Close modals using Escape key
6. Navigate form fields using Tab key
7. Fill form using Tab and type
8. Submit form using Tab + Enter

### Screen Reader Testing (if available):
1. Use browser accessibility inspector or screen reader (NVDA, JAWS, VoiceOver)
2. Verify:
   - Page title reads correctly
   - Headings have proper semantic structure (h1, h2, h3)
   - Button labels are read correctly
   - Form labels are associated with inputs
   - Error messages are announced
   - Table headers are announced with data

### Color Contrast:
1. Use browser color contrast checker
2. Verify text contrast ratio >= 4.5:1 for normal text
3. Verify text contrast ratio >= 3:1 for large text
4. Check statusbadges and colored elements

### Focus Management:
1. Click a button that opens a modal
2. Verify focus moves into modal
3. Verify focus stays within modal (not outside)
4. Close modal (Escape or close button)
5. Verify focus returns to button

**Expected Result**: ✅ Application is accessible and keyboard-navigable

**Failure Criteria**:
- Focus outline not visible
- Focus order illogical
- Escape key doesn't close modal
- Color contrast insufficient
- Screen reader announces incorrect labels
- Tab focus gets stuck

---

## Manual Test Execution Checklist

### Pre-Test Setup
- [ ] Test environment accessible and running
- [ ] Test user (ADMIN role) created
- [ ] Test data (indicators, surveys, documents) exists
- [ ] Browser cache cleared
- [ ] Browser DevTools open for error checking

### During Testing
- [ ] Check browser console for errors
- [ ] Note any slow page loads
- [ ] Document any unexpected behavior
- [ ] Take screenshots of failures
- [ ] Record API response times

### Post-Test
- [ ] Summarize results
- [ ] List failed scenarios
- [ ] Document improvements needed
- [ ] Verify all fixes and re-test

---

## Test Environment Setup

### Required Data:
- ✅ At least 5 Qualiopi indicators with mixed statuses
- ✅ At least 3 completed surveys
- ✅ At least 5 archived documents
- ✅ Multiple users for consultant performance comparison

### Browser Requirements:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browser (iOS Safari / Chrome)

### Devices:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## Scoring & Pass Criteria

**Minimum Pass Rate**: 95% of scenarios must pass
**Individual Scenario**: All steps must pass for scenario to be marked passing
**Critical Failures**: Must be fixed before deployment

### Scenarios by Priority:
- **CRITICAL** (Must Pass): 1, 3, 4, 5
- **HIGH** (Should Pass): 2, 6, 9
- **MEDIUM** (Nice to Have): 7, 8
- **LOW** (Future Enhancement): 10

---

## Notes & Observations Template

For each failed test, document:
- **Scenario #**: [number]
- **Steps**: [which step failed]
- **Expected**: [what should happen]
- **Actual**: [what actually happened]
- **Severity**: [Critical/High/Medium/Low]
- **Browser**: [Chrome/Firefox/Safari/Mobile]
- **Screenshot**: [if applicable]
- **Reproducible**: [Yes/No]
- **Comments**: [additional notes]

---

## Regression Testing (After Fixes)

After fixing failed scenarios:
1. Re-test the specific scenario
2. Re-test all dependent scenarios
3. Re-test the entire suite if critical changes made
4. Document re-test results

---

**Test Plan Document**
**Created**: 2024-10-23
**Version**: 1.0
**Last Updated**: 2024-10-23
