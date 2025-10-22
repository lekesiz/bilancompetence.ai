# Sprint 5 - Task 1: Assessment Creation Wizard Implementation Plan

**Status**: 📋 PLANNING PHASE
**Date**: 22 Ekim 2025
**Scope**: Complete Assessment Creation Wizard for Beneficiary users
**Estimated Duration**: 40-50 hours (4-5 days intensive)
**Priority**: 🔴 CRITICAL (MVP blocker)

---

## 🎯 Mission

Implement a comprehensive 5-step Assessment Creation Wizard that guides beneficiaries through a detailed career assessment process, replacing the current basic inline form.

**Success Criteria**:
- ✅ All 5 wizard steps implemented and functional
- ✅ Auto-save draft functionality every 30 seconds
- ✅ Step progress tracking and resume capability
- ✅ Full form validation with clear error messages
- ✅ Comprehensive test coverage (50+ tests)
- ✅ TypeScript type safety throughout
- ✅ Production-ready and deployed

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /assessments/create              /assessments/[id]/wizard   │
│  (Create entry point)             (Wizard flow)              │
│         │                               │                    │
│         └───────────────┬───────────────┘                    │
│                         │                                     │
│            AssessmentWizard Component                        │
│            (Multi-step form manager)                         │
│                         │                                     │
│         ┌───────────────┼───────────────┐                    │
│         │       │       │       │       │                    │
│    Step 1   Step 2   Step 3   Step 4   Step 5               │
│    Work     Edu      Skills   Values   Context              │
│    History          Assess    & Goals  & Const              │
│         │       │       │       │       │                    │
│         └───────────────┼───────────────┘                    │
│                         │                                     │
│              useAssessmentWizard Hook                        │
│              (State management & API calls)                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                  API Layer (axios)
                           │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST   /api/assessments              (Create new)          │
│  GET    /api/assessments/:id          (Get draft)           │
│  POST   /api/assessments/:id/steps    (Save individual)     │
│  POST   /api/assessments/:id/auto-save (Draft auto-save)    │
│  GET    /api/assessments/:id/progress (Get progress)        │
│  POST   /api/assessments/:id/submit   (Final submission)    │
│                                                               │
│            ↓ assessmentService.ts ↓                          │
│                                                               │
│  - Draft management                                          │
│  - Step-by-step validation                                   │
│  - Competency processing                                     │
│  - Auto-save logic                                           │
│                                                               │
│            ↓ supabaseService.ts ↓                            │
│                                                               │
│  Database operations for assessments,                        │
│  questions, answers, competencies                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  assessments                 (Main bilan entity)            │
│  assessment_questions        (Assessment form questions)    │
│  assessment_answers          (User responses)               │
│  assessment_competencies     (Skills & competencies)        │
│  assessment_drafts           (Auto-save drafts)             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Phases

### Phase 1: Database & Schema (2-3 hours)
### Phase 2: Backend API Endpoints (6-8 hours)
### Phase 3: Frontend Components (10-12 hours)
### Phase 4: Integration & Testing (8-10 hours)
### Phase 5: Polish & Deployment (4-6 hours)

---

## 🔴 PHASE 1: DATABASE SCHEMA & MIGRATIONS

### 1.1 Database Type Definitions (database.types.ts)

**Current State**: Assessment tables are empty generics
**Target State**: Complete type definitions with all required fields

```typescript
// NEW/UPDATED in database.types.ts

// 1. Assessment Competencies (NEW TABLE)
assessment_competencies: {
  Row: {
    id: string;
    assessment_id: string;
    skill_name: string;
    category: string; // 'technical' | 'soft' | 'language' | 'other'
    self_assessment_level: number; // 1-4 (Beginner, Intermediate, Advanced, Expert)
    self_interest_level: number; // 1-10
    context: string | null; // Where learned, how used, etc.
    consultant_assessment_level?: number | null;
    consultant_notes?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
  Insert: { /* optional id, timestamps */ };
  Update: { /* all optional */ };
};

// 2. Assessment Questions (EXPAND)
assessment_questions: {
  Row: {
    id: string;
    assessment_id: string;
    step_number: number; // 1-5
    section: string; // 'work_history' | 'education' | 'skills' | 'motivations' | 'constraints'
    question_text: string;
    question_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'rating' | 'checkbox_array';
    options?: { label: string; value: string }[]; // For select/multiselect
    order: number; // Question order within section
    required: boolean;
    help_text?: string | null;
    placeholder?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
};

// 3. Assessment Answers (EXPAND)
assessment_answers: {
  Row: {
    id: string;
    assessment_id: string;
    question_id: string;
    step_number: number;
    section: string;
    answer_value: any; // String, number, array, JSON object
    answer_type: string; // Matches question_type
    submitted_at: string;
    updated_at: string;
    [key: string]: any;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
};

// 4. Assessment Drafts (NEW - for auto-save)
assessment_drafts: {
  Row: {
    id: string;
    assessment_id: string;
    step_number: number; // Current step being edited
    draft_data: any; // JSON object with all step data
    last_saved_at: string;
    auto_save_enabled: boolean;
    [key: string]: any;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
};

// 5. Assessments (EXPAND existing)
assessments: {
  Row: {
    id: string;
    beneficiary_id: string;
    consultant_id: string | null;
    organization_id: string | null;
    title: string;
    description?: string | null;
    assessment_type: 'career' | 'skills' | 'comprehensive'; // Preset types
    status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED';
    current_step: number; // 0-5 (0 = not started)
    progress_percentage: number; // 0-100
    started_at: string | null;
    submitted_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
  Insert: { /* ... */ };
  Update: { /* ... */ };
};
```

### 1.2 Migration Strategy

**Files to Create**:
```
apps/backend/migrations/
├── 001_expand_assessment_tables.sql
├── 002_create_assessment_competencies.sql
├── 003_create_assessment_drafts.sql
└── 004_add_indexes_and_constraints.sql
```

**Key SQL Operations**:
```sql
-- Add columns to existing assessments table
ALTER TABLE assessments
ADD COLUMN current_step INT DEFAULT 0,
ADD COLUMN progress_percentage INT DEFAULT 0,
ADD COLUMN submitted_at TIMESTAMP,
ADD COLUMN completed_at TIMESTAMP;

-- Expand assessment_questions
ALTER TABLE assessment_questions
ADD COLUMN step_number INT,
ADD COLUMN section TEXT,
ADD COLUMN question_type TEXT,
ADD COLUMN options JSONB,
ADD COLUMN required BOOLEAN DEFAULT true,
ADD COLUMN help_text TEXT;

-- Expand assessment_answers
ALTER TABLE assessment_answers
ADD COLUMN step_number INT,
ADD COLUMN section TEXT,
ADD COLUMN answer_type TEXT;

-- Create competencies table
CREATE TABLE assessment_competencies (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  self_assessment_level INT,
  self_interest_level INT,
  context TEXT,
  consultant_assessment_level INT,
  consultant_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create drafts table
CREATE TABLE assessment_drafts (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  step_number INT,
  draft_data JSONB,
  last_saved_at TIMESTAMP DEFAULT NOW(),
  auto_save_enabled BOOLEAN DEFAULT true
);
```

### 1.3 Seed Data

Pre-defined questions for the 5 assessment steps:

```typescript
// SEED: Step 1 - Work History Questions
const workHistoryQuestions = [
  {
    section: 'work_history',
    step_number: 1,
    question_text: 'Describe your most recent job position',
    question_type: 'textarea',
    placeholder: 'Job title, company, years...',
    required: true,
    order: 1
  },
  {
    section: 'work_history',
    step_number: 1,
    question_text: 'List all previous positions (reverse chronological)',
    question_type: 'textarea',
    placeholder: 'Format: Job | Company | Years',
    required: true,
    order: 2
  },
  // ... more questions
];

// SEED: Step 2 - Education Questions
const educationQuestions = [
  {
    section: 'education',
    step_number: 2,
    question_text: 'Highest education level',
    question_type: 'select',
    options: [
      { value: 'bac', label: 'Baccalauréat' },
      { value: 'bac+2', label: 'Bac+2' },
      { value: 'bac+3', label: 'Bac+3' },
      { value: 'bac+5', label: 'Bac+5+' }
    ],
    required: true,
    order: 1
  },
  // ... more questions
];

// SEED: Step 3 - Skills Checklist
const skillsQuestions = [
  {
    section: 'skills',
    step_number: 3,
    question_text: 'Select your competencies and rate yourself (100+ skills)',
    question_type: 'checkbox_array',
    options: [
      { value: 'leadership', label: 'Leadership' },
      { value: 'communication', label: 'Communication' },
      { value: 'project_management', label: 'Project Management' },
      { value: 'data_analysis', label: 'Data Analysis' },
      // ... 100+ skills
    ],
    required: true,
    order: 1
  }
];

// SEED: Step 4 - Values & Motivations
const motivationsQuestions = [
  {
    section: 'motivations',
    step_number: 4,
    question_text: 'What are your top 3 career values?',
    question_type: 'multiselect',
    options: [
      { value: 'autonomy', label: 'Autonomy' },
      { value: 'stability', label: 'Stability' },
      { value: 'growth', label: 'Growth & Learning' },
      { value: 'impact', label: 'Impact' },
      // ... more values
    ],
    required: true,
    order: 1
  },
  // ... more motivation questions
];

// SEED: Step 5 - Constraints & Context
const constraintsQuestions = [
  {
    section: 'constraints',
    step_number: 5,
    question_text: 'Geographic preferences',
    question_type: 'multiselect',
    options: [
      { value: 'ile_de_france', label: 'Île-de-France' },
      { value: 'auvergne', label: 'Auvergne-Rhône-Alpes' },
      // ... French regions
    ],
    required: false,
    order: 1
  },
  // ... more constraint questions
];
```

---

## 🔵 PHASE 2: BACKEND API ENDPOINTS

### 2.1 New Endpoints to Create

**File**: `apps/backend/src/routes/assessments.ts` (expand existing)

#### Endpoint 1: Create Assessment Draft
```
POST /api/assessments
Body: {
  title?: string,
  description?: string,
  assessment_type: 'career' | 'skills' | 'comprehensive'
}
Response: {
  id: string,
  beneficiary_id: string,
  status: 'DRAFT',
  current_step: 0,
  ...
}
```

#### Endpoint 2: Get Assessment Draft
```
GET /api/assessments/:id
Response: Full assessment with all steps, answers, competencies
```

#### Endpoint 3: Save Individual Step
```
POST /api/assessments/:id/steps/:stepNumber
Body: {
  section: 'work_history' | 'education' | 'skills' | 'motivations' | 'constraints',
  answers: { [questionId]: answerValue },
  competencies?: [ { skillName, level, interest } ]
}
Response: { status: 'step_saved', progress_percentage: 20, ... }
```

#### Endpoint 4: Auto-Save Draft (Incremental)
```
POST /api/assessments/:id/auto-save
Body: {
  step_number: number,
  partial_data: any
}
Response: { status: 'auto_saved', last_saved_at: timestamp }
```

#### Endpoint 5: Get Wizard Progress
```
GET /api/assessments/:id/progress
Response: {
  assessment_id: string,
  current_step: number,
  progress_percentage: number,
  completed_steps: number[],
  last_saved_at: timestamp,
  draft_data: { step1: {...}, step2: {...}, ... }
}
```

#### Endpoint 6: Submit Assessment
```
POST /api/assessments/:id/submit
Body: (empty - triggers validation & submission)
Response: {
  status: 'submitted',
  assessment_id: string,
  submitted_at: timestamp,
  next_step: 'awaiting_consultant_review'
}
```

### 2.2 Backend Service Functions

**File**: `apps/backend/src/services/assessmentService.ts` (expand existing)

```typescript
// NEW FUNCTIONS

// Draft Management
export async function createAssessmentDraft(
  beneficiaryId: string,
  assessmentType: 'career' | 'skills' | 'comprehensive',
  title?: string
): Promise<Assessment>

export async function getDraftById(assessmentId: string): Promise<Assessment>

export async function saveDraftStep(
  assessmentId: string,
  stepNumber: number,
  section: string,
  answers: Record<string, any>,
  competencies?: any[]
): Promise<{ progressPercentage: number }>

export async function autoSaveDraft(
  assessmentId: string,
  stepNumber: number,
  partialData: any
): Promise<{ savedAt: string }>

// Progress Tracking
export async function getAssessmentProgress(
  assessmentId: string
): Promise<{
  currentStep: number,
  progressPercentage: number,
  completedSteps: number[],
  lastSavedAt: string,
  draftData: any
}>

// Submission & Validation
export async function validateAssessmentStep(
  stepNumber: number,
  section: string,
  answers: Record<string, any>
): Promise<{ valid: boolean, errors?: string[] }>

export async function submitAssessment(
  assessmentId: string,
  beneficiaryId: string
): Promise<{ status: string, submittedAt: string }>

// Competency Processing
export async function extractAndCreateCompetencies(
  assessmentId: string,
  skillsData: any[]
): Promise<any[]>

export async function validateCompetencies(
  competencies: any[]
): Promise<{ valid: boolean, errors?: string[] }>
```

### 2.3 Validation & Error Handling

**New Validation Schemas** (Zod):

```typescript
// Step 1: Work History
const workHistoryStepSchema = z.object({
  recentJob: z.string().min(10).max(1000),
  previousPositions: z.string().min(10).max(5000),
});

// Step 2: Education
const educationStepSchema = z.object({
  highestLevel: z.enum(['bac', 'bac+2', 'bac+3', 'bac+5']),
  fieldOfStudy: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

// Step 3: Skills
const skillsStepSchema = z.object({
  competencies: z.array(z.object({
    skillName: z.string(),
    selfLevel: z.number().min(1).max(4),
    interestLevel: z.number().min(1).max(10),
    context: z.string().optional(),
  })).min(5),
});

// Step 4: Motivations
const motivationsStepSchema = z.object({
  topValues: z.array(z.string()).min(1).max(5),
  careerGoals: z.string().min(20),
  motivationDescription: z.string().min(20),
});

// Step 5: Constraints
const constraintsStepSchema = z.object({
  geographicPreferences: z.array(z.string()).optional(),
  salaryExpectations: z.string().optional(),
  availabilityConstraints: z.string().optional(),
  typeOfContract: z.array(z.string()).optional(),
});
```

---

## 🟢 PHASE 3: FRONTEND COMPONENTS & PAGES

### 3.1 New Frontend Structure

```
apps/frontend/app/(protected)/assessments/
├── page.tsx (List assessments)
├── create/
│   └── page.tsx (Create assessment entry)
├── [id]/
│   ├── page.tsx (Assessment detail/review)
│   └── wizard/
│       └── page.tsx (Main wizard page)
│
components/assessment/
├── AssessmentWizard.tsx (Main wizard component)
├── WizardStep.tsx (Step wrapper)
├── steps/
│   ├── WorkHistoryStep.tsx
│   ├── EducationStep.tsx
│   ├── SkillsStep.tsx
│   ├── MotivationsStep.tsx
│   └── ConstraintsStep.tsx
├── common/
│   ├── ProgressBar.tsx
│   ├── StepNavigation.tsx
│   ├── AutoSaveIndicator.tsx
│   ├── FormError.tsx
│   └── WizardSummary.tsx
│
hooks/
└── useAssessmentWizard.ts (Custom hook for wizard state)
```

### 3.2 Component Specifications

#### AssessmentWizard.tsx (Parent Component)
```typescript
interface AssessmentWizardProps {
  assessmentId: string;
  initialStep?: number;
  onComplete?: (assessmentId: string) => void;
}

export function AssessmentWizard({ assessmentId, initialStep = 1, onComplete }: AssessmentWizardProps) {
  const {
    currentStep,
    progress,
    loading,
    error,
    saveStep,
    goToStep,
    goBack,
    goNext,
    submitAssessment
  } = useAssessmentWizard(assessmentId);

  // Render progress bar, current step, navigation
  // Auto-save every 30 seconds
  // Show unsaved changes warning
}
```

#### useAssessmentWizard Hook
```typescript
interface AssessmentWizardState {
  currentStep: number;
  progressPercentage: number;
  completedSteps: number[];
  formData: Record<number, any>;
  loading: boolean;
  error?: string;
  unsavedChanges: boolean;
  lastSavedAt?: string;
}

export function useAssessmentWizard(assessmentId: string): {
  state: AssessmentWizardState,
  actions: {
    saveStep: (step, data) => Promise<void>,
    goToStep: (step) => Promise<void>,
    goBack: () => void,
    goNext: () => Promise<void>,
    submitAssessment: () => Promise<void>,
    autoSave: () => Promise<void>
  }
} {
  // State management
  // API calls
  // Auto-save logic (useEffect with 30-second interval)
  // Unsaved changes detection
  // Step validation
}
```

#### Individual Step Components

**WorkHistoryStep.tsx**:
- Textarea for recent job description
- Textarea for previous positions (formatted list)
- Field labels and help text
- Validation messages

**EducationStep.tsx**:
- Select dropdown for education level
- Optional text field for field of study
- Checkbox array for certifications
- Progress indicator

**SkillsStep.tsx** (Most Complex):
- Skills checklist (100+ skills)
- For each skill: self-assessment level (1-4 dropdown) + interest (1-10 slider)
- Search/filter functionality
- Category grouping (technical, soft, languages, etc.)
- Add custom skill button
- Validation (min 5 selected)

**MotivationsStep.tsx**:
- Multi-select dropdown for values (pick 1-5)
- Textarea for career goals
- Textarea for motivation description
- Value cards with icons

**ConstraintsStep.tsx**:
- Multi-select for geographic preferences (French regions)
- Optional salary expectation range
- Optional availability constraints
- Optional contract type preferences
- All fields optional

#### Common Components

**ProgressBar.tsx**:
```
Step 1     Step 2     Step 3     Step 4     Step 5
[====]     [==]       [ ]        [ ]        [ ]
20%        40%        0%         0%         0%
```

**StepNavigation.tsx**:
- Previous button (disabled on step 1)
- Next button (disabled if validation fails)
- Skip button (for optional fields)
- Submit button (on final step, if all valid)

**AutoSaveIndicator.tsx**:
- Shows "Saving..." during auto-save
- Shows "✓ Saved" when complete
- Shows last saved time
- Shows error if save fails

### 3.3 Pages

#### /assessments/create/page.tsx (Entry point)
```
Simple form to start new assessment:
- Assessment title (optional)
- Assessment type selector (Career / Skills / Comprehensive)
- "Start Assessment" button
→ Creates draft and redirects to wizard
```

#### /assessments/[id]/wizard/page.tsx (Main wizard)
```
- Full AssessmentWizard component
- 5-step form with navigation
- Progress tracking
- Auto-save every 30 seconds
- Unsaved changes warning on page leave
- Submit button on final step
```

#### /assessments/[id]/page.tsx (Review page)
```
- Display assessment details and responses
- Show competencies extracted
- Allow editing if status is DRAFT
- Show status and timestamps
- Link to consultant feedback (if available)
```

---

## 🟡 PHASE 4: INTEGRATION & TESTING

### 4.1 Unit Tests

**Test Files to Create**:
```
apps/backend/src/__tests__/
├── services/assessmentWizardService.spec.ts
│   └── 15-20 tests for service functions
├── routes/assessments.wizard.spec.ts
│   └── 20-25 tests for new endpoints
└── validators/assessmentValidator.spec.ts
    └── 10-15 tests for validation

apps/frontend/__tests__/
├── components/AssessmentWizard.spec.tsx
│   └── 10-15 tests for component behavior
├── hooks/useAssessmentWizard.spec.ts
│   └── 15-20 tests for hook logic
└── pages/assessments/wizard.spec.tsx
    └── 10-15 tests for page integration
```

**Test Coverage Target**: 70%+ overall, 80%+ for critical functions

### 4.2 Integration Tests

- Full wizard flow end-to-end
- Step navigation and validation
- Auto-save functionality
- Draft recovery (refresh page mid-wizard)
- Form data persistence
- Submit and completion flow

### 4.3 Manual Testing Checklist

```
[ ] Step 1: Create assessment and start wizard
[ ] Step 2: Navigate through all 5 steps
[ ] Step 3: Auto-save functionality (every 30 sec)
[ ] Step 4: Back/Next navigation
[ ] Step 5: Field validation errors
[ ] Step 6: Skip optional fields
[ ] Step 7: Go back and edit previous steps
[ ] Step 8: Browser refresh mid-wizard (resume)
[ ] Step 9: Unsaved changes warning
[ ] Step 10: Final submission
[ ] Step 11: View completed assessment
[ ] Step 12: Mobile responsiveness
[ ] Step 13: Error handling (API failures)
[ ] Step 14: Accessibility (keyboard nav, screen reader)
```

---

## 🟣 PHASE 5: POLISH & DEPLOYMENT

### 5.1 Code Quality

- TypeScript strict mode compliance
- ESLint/Prettier formatting
- Remove console.logs
- Add proper error boundaries
- Improve error messages
- Add loading skeletons

### 5.2 Performance Optimization

- Lazy load step components
- Memoize expensive computations
- Optimize API calls (batch updates)
- Image optimization
- Code splitting

### 5.3 Accessibility

- Keyboard navigation support
- ARIA labels
- Form field descriptions
- Error announcements
- Color contrast compliance

### 5.4 Documentation

- Component documentation
- API endpoint documentation
- Setup instructions
- Troubleshooting guide

### 5.5 Deployment

- Build verification
- Staging environment testing
- Production deployment
- Monitoring setup
- Rollback plan

---

## 🤖 AI Collaboration Strategy

### Using Gemini API for Code Review & Optimization

**When to Engage Gemini**:

1. **Backend Service Functions** (8-10 hours of work)
   ```
   ~/gemini-cli "Review this assessmentService.ts function: [large function]
   - Is error handling complete?
   - Any performance issues?
   - Security concerns?
   - Suggestions for improvement?"
   ```

2. **Frontend Component Complex Logic** (6-8 hours)
   ```
   ~/gemini-cli "Review useAssessmentWizard hook: [code]
   - Is state management clean?
   - Any memory leaks?
   - Performance optimizations?
   - Best practices for React hooks?"
   ```

3. **Validation Schema Design** (2-3 hours)
   ```
   ~/gemini-cli "Design Zod schemas for 5-step assessment: [requirements]
   - Schema structure
   - Validation rules
   - Error messages
   - Edge cases"
   ```

4. **Database Query Optimization** (2-3 hours)
   ```
   ~/gemini-cli "Optimize these Supabase queries: [queries]
   - N+1 query problems?
   - Indexing recommendations?
   - Alternative approaches?"
   ```

5. **Component Architecture Review** (3-4 hours)
   ```
   ~/gemini-cli "Review Assessment wizard component architecture: [design]
   - Is component splitting optimal?
   - State management patterns?
   - Reusability concerns?
   - Performance implications?"
   ```

### Using OpenAI for General Tasks & Planning

**When to Engage OpenAI**:

1. Database migration script generation
2. TypeScript type definitions review
3. Test case generation
4. Documentation writing
5. Placeholder content generation

---

## 📅 Timeline & Milestones

```
Day 1 (8 hours):
  ✓ Database schema updates & migrations
  ✓ Assessment types and validation schemas
  ✓ Phase 1 completion

Day 2 (8 hours):
  ✓ Backend API endpoints (all 6)
  ✓ Service functions
  ✓ Error handling & validation
  ✓ Basic tests
  ✓ Phase 2 completion

Day 3-4 (16 hours):
  ✓ Frontend components (5 step components)
  ✓ Main wizard component
  ✓ Custom hook for state management
  ✓ Navigation & progress tracking
  ✓ Auto-save implementation
  ✓ Pages (create, wizard, detail)
  ✓ Styling & responsiveness
  ✓ Phase 3 completion

Day 5 (8-10 hours):
  ✓ Integration testing
  ✓ End-to-end wizard flow
  ✓ Manual testing & bug fixes
  ✓ Code review & optimization
  ✓ Phase 4-5 completion
  ✓ Deployment to staging
  ✓ Production deployment

TOTAL: 40-50 hours (5 days intensive)
```

---

## 🎯 Success Criteria Checklist

### Functionality
- [ ] All 5 wizard steps fully functional
- [ ] Auto-save every 30 seconds
- [ ] Form validation with error messages
- [ ] Step progress tracking
- [ ] Draft recovery on page refresh
- [ ] Final submission & status change
- [ ] Back/Next navigation
- [ ] Optional field handling

### Code Quality
- [ ] 100% TypeScript type safety
- [ ] ESLint/Prettier compliant
- [ ] No console.logs in production
- [ ] Proper error handling
- [ ] Clear function documentation
- [ ] No code duplication

### Testing
- [ ] 50+ unit tests created
- [ ] 70%+ code coverage
- [ ] Integration tests passing
- [ ] Manual testing checklist completed
- [ ] Accessibility testing passed

### Performance
- [ ] Page load < 2 seconds
- [ ] Step transition < 500ms
- [ ] Auto-save non-blocking (background)
- [ ] No memory leaks

### Documentation
- [ ] Component documentation
- [ ] API endpoint documentation
- [ ] README for setup
- [ ] Troubleshooting guide

### Deployment
- [ ] Build succeeds without errors
- [ ] Tests pass in CI/CD
- [ ] Staging environment verified
- [ ] Production deployment successful
- [ ] Monitoring alerts configured

---

## 📊 Effort Estimation

| Phase | Hours | Days | Key Tasks |
|-------|-------|------|-----------|
| 1. Database | 3-4 | 0.5 | Schema, types, migrations |
| 2. Backend | 6-8 | 1 | Endpoints, services, validation |
| 3. Frontend | 12-15 | 2 | Components, pages, styling |
| 4. Testing | 8-10 | 1 | Unit, integration, manual |
| 5. Polish | 4-6 | 0.5 | Optimization, docs, deploy |
| **TOTAL** | **40-50** | **5** | Complete wizard feature |

---

## 🚀 Deliverables Upon Completion

```
✅ Complete Assessment Creation Wizard (5 steps)
✅ 6 new backend API endpoints
✅ 4 new database tables with migrations
✅ 10+ frontend components
✅ useAssessmentWizard custom hook
✅ 4 new frontend pages/routes
✅ 50+ unit tests (70%+ coverage)
✅ Integration tests for full flow
✅ Comprehensive documentation
✅ Deployed to production
✅ Sprint 5 Task 1 Completion Report
```

---

## ⚠️ Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Complex state management | High | Medium | Use custom hook early, test thoroughly |
| Form validation complexity | Medium | Medium | Zod schema review with Gemini |
| Performance issues | Medium | Medium | Lazy loading, memoization from start |
| Database migration rollback | Low | High | Test migrations in staging first |
| Browser compatibility | Low | Medium | Test on major browsers, use polyfills |

---

## 📝 Next Steps

1. **User Approval** (5 min): Review this plan, request changes if needed
2. **Start Implementation** (2 min): Begin Phase 1 (Database)
3. **Daily Progress Reports** (5 min): After each 8-hour session
4. **Final Completion Report** (30 min): Comprehensive report with tests, metrics
5. **Deployment Verification** (15 min): Confirm production deployment

---

**Plan Status**: 📋 Ready for User Approval & Implementation
**Awaiting**: User confirmation to proceed with Phase 1 (Database & Schema)

