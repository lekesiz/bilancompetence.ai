# Phase 3 Quick Reference - Frontend PDF Download UI

## UI Component Layout

```
Assessment Page Header
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Assessment Title                  [PDF Button] [Status]  │
│  Assessment Description                                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ PDF Error Message (if error occurred)                │ │
│  │ "PDF Download Failed: ..." [Dismiss]                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## PDF Download Button States

### State 1: Default (Ready)
```
┌─────────────────────┐
│ ⬇️ Download PDF     │
└─────────────────────┘
```

### State 2: Loading (Generating)
```
┌─────────────────────┐
│ ⊙ Generating...     │
└─────────────────────┘
(Button disabled)
```

### State 3: Disabled (Draft Assessment)
```
(Button not shown)
```

## Report Type Selector (Dropdown)

```
When user clicks "Download PDF" button:

┌─────────────────────────────┐
│  Select Report Type         │
│  ○ Preliminary Report       │ ← Always enabled
│  ○ Investigation Report     │ ← Disabled if status=PRELIMINARY
│  ○ Conclusion Report        │ ← Enabled only if status=COMPLETED
├─────────────────────────────┤
│ [Download]  [Cancel]        │
└─────────────────────────────┘
```

## Error Message Display

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ PDF Download Failed                          [x] │
│    Authentication failed. Please log in again.     │
└─────────────────────────────────────────────────────┘
```

## Data Flow

```
User clicks Download Button
        │
        ▼
Report Type Selector Shows
        │
        ├─ User selects type (preliminary/investigation/conclusion)
        │
        ▼
User clicks "Download" Button
        │
        ├─ Loading state: button shows "Generating..."
        │
        ▼
Frontend: fetch POST /api/export/assessment/{id}/pdf?type=...
        │
        ├─ Add Bearer token to headers
        │
        ▼
Backend: Generates PDF
        │
        ├─ Validates access control
        ├─ Generates PDF
        ├─ Returns PDF blob
        │
        ▼
Frontend: Handles Response
        │
        ├─ Check HTTP status (200, 401, 403, 404, 500, etc.)
        ├─ Validate blob (MIME type, size)
        ├─ Extract filename from Content-Disposition
        │
        ▼
Browser: Download PDF
        │
        ├─ Create blob URL
        ├─ Trigger download with filename
        ├─ Clean up resources
        │
        ▼
✅ PDF Downloaded
```

## Implementation Code Snippets

### State Variables
```typescript
const [pdfDownloading, setPdfDownloading] = useState(false);
const [pdfError, setPdfError] = useState<string | null>(null);
const [reportType, setReportType] = useState<ReportType>('preliminary');
const [showReportTypeSelector, setShowReportTypeSelector] = useState(false);
```

### Check if PDF Download Allowed
```typescript
const canDownloadPDF = () => {
  if (!assessment) return false;
  return assessment.status !== 'DRAFT' && assessment.status !== 'IN_PROGRESS';
};
```

### Download Handler (Simplified)
```typescript
const handleDownloadPDF = async () => {
  try {
    setPdfDownloading(true);
    setPdfError(null);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setPdfError('Authentication required');
      return;
    }

    const response = await fetch(
      `${API_URL}/api/export/assessment/${assessmentId}/pdf?type=${reportType}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Handle error...
      return;
    }

    const blob = await response.blob();

    // Create download...
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessment.pdf';
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    setPdfError('Failed to download PDF');
  } finally {
    setPdfDownloading(false);
  }
};
```

## Report Type Rules

| Status | Preliminary | Investigation | Conclusion |
|--------|-------------|----------------|-----------|
| DRAFT | ❌ (PDF hidden) | ❌ | ❌ |
| IN_PROGRESS | ❌ (PDF hidden) | ❌ | ❌ |
| PRELIMINARY | ✅ | ❌ (disabled) | ❌ (disabled) |
| INVESTIGATION | ✅ | ✅ | ❌ (disabled) |
| SUBMITTED | ✅ | ✅ | ❌ (disabled) |
| UNDER_REVIEW | ✅ | ✅ | ❌ (disabled) |
| COMPLETED | ✅ | ✅ | ✅ |
| ARCHIVED | ✅ | ✅ | ✅ |

## Error Messages by HTTP Status

| Status | Message | Recovery |
|--------|---------|----------|
| 401 | "Authentication failed. Please log in again." | Re-login required |
| 403 | "You do not have permission to download this assessment." | Contact admin |
| 404 | "Assessment not found." | Try different assessment |
| 400 | "Invalid report type selected." | Select valid type |
| 500 | "Server error while generating PDF: {details}" | Retry or contact support |
| Network | "Failed to download PDF" | Check internet connection |

## File Structure After Implementation

```
/apps/frontend/app/(protected)/assessments/[id]/
├── page.tsx  ✅ MODIFIED (+200 lines)
│   ├─ Added state variables (4)
│   ├─ Added handler function (handleDownloadPDF)
│   ├─ Added helper function (canDownloadPDF)
│   ├─ Added type definition (ReportType)
│   ├─ Added UI button (conditionally)
│   ├─ Added dropdown (conditionally)
│   └─ Added error message (conditionally)
└── [other files unchanged]
```

## Testing Commands

### Manual Testing with curl

```bash
# Download assessment PDF
curl -X POST \
  'http://localhost:3001/api/export/assessment/550e8400-e29b-41d4-a716-446655440000/pdf?type=preliminary' \
  -H 'Authorization: Bearer [TOKEN]' \
  -H 'Content-Type: application/json' \
  -o test-assessment.pdf

# Check file was created
ls -lh test-assessment.pdf

# Open PDF
open test-assessment.pdf
```

### Browser DevTools

```javascript
// Test from browser console:
fetch('/api/export/assessment/550e8400.../pdf?type=preliminary', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test.pdf';
    a.click();
  });
```

## Key Implementation Decisions

### Why PostRequests Instead of GET?
- ✅ POST allows request body (future enhancements)
- ✅ More RESTful for generation operations
- ✅ Better for sensitive data (token in header, not URL)
- ✅ Consistent with backend design

### Why Blob Instead of Streaming?
- ✅ Simpler browser download mechanism
- ✅ Works with all browsers consistently
- ✅ Filename control via Content-Disposition
- ✅ Proper error handling before download

### Why Report Type Selector?
- ✅ User chooses which report they want
- ✅ Different statuses have different reports available
- ✅ Prevents downloading wrong report type
- ✅ Professional, intentional user experience

### Why Content-Disposition Header?
- ✅ Server provides descriptive filename
- ✅ Consistent with backend naming convention
- ✅ Fallback if header missing
- ✅ Professional file management for users

---

**Status**: Phase 3 Complete - Ready for Phase 4 Testing
