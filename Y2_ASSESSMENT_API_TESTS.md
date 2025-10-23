# Y2 - Assessment Wizard API Tests

**Date:** 2025-10-23
**Format:** cURL Test Cases (can be imported to Postman)
**Base URL:** `http://localhost:5000/api`
**Authentication:** Bearer Token (JWT from login)

---

## 📋 Setup

### Step 1: Register Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.assessment@example.com",
    "password": "TestPassword123!",
    "full_name": "Assessment Tester",
    "role": "BENEFICIARY"
  }'
```

### Step 2: Get JWT Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.assessment@example.com",
    "password": "TestPassword123!"
  }'
```

Response will include `access_token`. Save this for subsequent requests.

### Step 3: Set Token Variable (for Postman or manual testing)
```bash
TOKEN="<access_token_from_login>"
```

---

## 🧪 Test Cases

### TEST 1: Create Assessment
**Endpoint:** `POST /api/assessments`
**Status Code Expected:** 201 Created

```bash
curl -X POST http://localhost:5000/api/assessments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Career Transition Assessment 2025",
    "description": "Complete career and skills assessment",
    "assessment_type": "career"
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Assessment draft created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "beneficiary_id": "user-uuid",
    "title": "Career Transition Assessment 2025",
    "description": "Complete career and skills assessment",
    "assessment_type": "career",
    "status": "DRAFT",
    "created_at": "2025-10-23T14:00:00Z",
    "updated_at": "2025-10-23T14:00:00Z"
  }
}
```

**Save Assessment ID for next tests:**
```bash
ASSESSMENT_ID="550e8400-e29b-41d4-a716-446655440000"
```

---

### TEST 2: Get Assessment
**Endpoint:** `GET /api/assessments/:id`
**Status Code Expected:** 200 OK

```bash
curl -X GET "http://localhost:5000/api/assessments/$ASSESSMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "beneficiary_id": "user-uuid",
    "title": "Career Transition Assessment 2025",
    "assessment_type": "career",
    "status": "DRAFT",
    "current_step": 0,
    "progress_percentage": 0,
    "assessment_drafts": {...},
    "assessment_questions": [...],
    "assessment_answers": [...],
    "assessment_competencies": [...],
    "created_at": "2025-10-23T14:00:00Z"
  }
}
```

---

### TEST 3: List User Assessments
**Endpoint:** `GET /api/assessments`
**Status Code Expected:** 200 OK
**Query Parameters:**
- `role`: 'beneficiary' (default) | 'consultant'
- `page`: page number
- `limit`: items per page (max 100, default 20)
- `sort`: 'created_at:desc' | 'created_at:asc' | etc.

```bash
curl -X GET "http://localhost:5000/api/assessments?role=beneficiary&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Career Transition Assessment 2025",
        "assessment_type": "career",
        "status": "DRAFT",
        "progress_percentage": 0,
        "created_at": "2025-10-23T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### TEST 4: Get Progress (Initial)
**Endpoint:** `GET /api/assessments/:id/progress`
**Status Code Expected:** 200 OK

```bash
curl -X GET "http://localhost:5000/api/assessments/$ASSESSMENT_ID/progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "currentStep": 0,
    "progressPercentage": 0,
    "completedSteps": [],
    "lastSavedAt": null,
    "draftData": {},
    "status": "DRAFT"
  }
}
```

---

### TEST 5: Save Step 1 - Work History
**Endpoint:** `POST /api/assessments/:id/steps/1`
**Status Code Expected:** 200 OK

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "work_history",
    "answers": {
      "recentJob": "Senior Software Engineer at TechCorp (2020-2025). Led development of microservices architecture serving 10M+ users. Managed team of 5 engineers. Key achievements: 40% performance improvement, zero-downtime deployments.",
      "previousPositions": "Junior Developer at StartupXYZ (2018-2020), Frontend Developer at WebAgency (2016-2018), Intern at BigTech (2015-2016). Progressive experience in full-stack development with focus on React, Node.js, and AWS."
    }
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Step 1 saved",
  "data": {
    "step": 1,
    "section": "work_history",
    "savedAt": "2025-10-23T14:02:00Z",
    "dataLength": 350
  }
}
```

---

### TEST 6: Auto-Save Draft
**Endpoint:** `POST /api/assessments/:id/auto-save`
**Status Code Expected:** 200 OK
**Purpose:** Save partial data without validation

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/auto-save" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 2,
    "partial_data": {
      "highestLevel": "bac+5",
      "fieldOfStudy": "Computer Science"
    }
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Auto-saved",
  "data": {
    "step": 2,
    "dataLength": 100,
    "savedAt": "2025-10-23T14:03:00Z"
  }
}
```

---

### TEST 7: Check Progress After Saving
**Endpoint:** `GET /api/assessments/:id/progress`
**Status Code Expected:** 200 OK

```bash
curl -X GET "http://localhost:5000/api/assessments/$ASSESSMENT_ID/progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response (should show progress increase):**
```json
{
  "status": "success",
  "data": {
    "currentStep": 1,
    "progressPercentage": 20,
    "completedSteps": ["work_history"],
    "lastSavedAt": "2025-10-23T14:02:00Z",
    "draftData": {...},
    "status": "DRAFT"
  }
}
```

---

### TEST 8: Save Step 2 - Education
**Endpoint:** `POST /api/assessments/:id/steps/2`
**Status Code Expected:** 200 OK

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "education",
    "answers": {
      "highestLevel": "bac+5",
      "fieldOfStudy": "Computer Science & Engineering",
      "certifications": "AWS Solutions Architect, Google Cloud Professional, Kubernetes CKA",
      "currentEducation": "None, but actively learning advanced system design patterns"
    }
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Step 2 saved",
  "data": {
    "step": 2,
    "section": "education",
    "savedAt": "2025-10-23T14:04:00Z",
    "dataLength": 280
  }
}
```

---

### TEST 9: Save Step 3 - Skills
**Endpoint:** `POST /api/assessments/:id/steps/3`
**Status Code Expected:** 200 OK
**Note:** Must include at least 5 competencies

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "skills",
    "answers": {
      "additionalSkills": "DevOps practices, Docker containerization, Kubernetes orchestration"
    },
    "competencies": [
      {
        "skillName": "JavaScript/TypeScript",
        "selfAssessmentLevel": 4,
        "selfInterestLevel": 8,
        "category": "technical",
        "context": "10+ years professional experience, expert level"
      },
      {
        "skillName": "React.js",
        "selfAssessmentLevel": 4,
        "selfInterestLevel": 9,
        "category": "technical",
        "context": "5+ years, built multiple large-scale applications"
      },
      {
        "skillName": "Node.js/Express",
        "selfAssessmentLevel": 4,
        "selfInterestLevel": 8,
        "category": "technical",
        "context": "8+ years backend development"
      },
      {
        "skillName": "AWS/Cloud Services",
        "selfAssessmentLevel": 3,
        "selfInterestLevel": 7,
        "category": "technical",
        "context": "5+ years, certified solutions architect"
      },
      {
        "skillName": "Team Leadership",
        "selfAssessmentLevel": 3,
        "selfInterestLevel": 8,
        "category": "soft",
        "context": "Led teams of 3-5 engineers"
      }
    ]
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Step 3 saved",
  "data": {
    "step": 3,
    "section": "skills",
    "competenciesCreated": 5,
    "savedAt": "2025-10-23T14:05:00Z"
  }
}
```

---

### TEST 10: Save Step 4 - Motivations
**Endpoint:** `POST /api/assessments/:id/steps/4`
**Status Code Expected:** 200 OK

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/4" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "motivations",
    "answers": {
      "topValues": ["Innovation", "Impact", "Learning", "Autonomy"],
      "careerGoals": ["Tech Leadership", "Startup Founding", "Mentoring"],
      "motivationDescription": "I am motivated by solving complex technical challenges and building products that impact millions of users. I thrive in environments where I can continue learning cutting-edge technologies while mentoring junior engineers. The prospect of leading a technical team or starting my own venture excites me."
    }
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Step 4 saved",
  "data": {
    "step": 4,
    "section": "motivations",
    "savedAt": "2025-10-23T14:06:00Z"
  }
}
```

---

### TEST 11: Save Step 5 - Constraints
**Endpoint:** `POST /api/assessments/:id/steps/5`
**Status Code Expected:** 200 OK

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "constraints",
    "answers": {
      "geographicPreferences": ["Remote", "Paris", "San Francisco"],
      "contractTypes": ["CDI", "Startup Equity"],
      "salaryExpectations": "80-120k EUR (Paris) or 120-160k USD (SF) + equity",
      "otherConstraints": "Family considerations limit relocation before 2027"
    }
  }'
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Step 5 saved",
  "data": {
    "step": 5,
    "section": "constraints",
    "savedAt": "2025-10-23T14:07:00Z"
  }
}
```

---

### TEST 12: Check Final Progress
**Endpoint:** `GET /api/assessments/:id/progress`
**Status Code Expected:** 200 OK

```bash
curl -X GET "http://localhost:5000/api/assessments/$ASSESSMENT_ID/progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response (should show 100% progress):**
```json
{
  "status": "success",
  "data": {
    "currentStep": 5,
    "progressPercentage": 100,
    "completedSteps": ["work_history", "education", "skills", "motivations", "constraints"],
    "lastSavedAt": "2025-10-23T14:07:00Z",
    "draftData": {...complete data...},
    "status": "DRAFT"
  }
}
```

---

### TEST 13: Submit Assessment
**Endpoint:** `POST /api/assessments/:id/submit`
**Status Code Expected:** 200 OK
**Purpose:** Submit completed assessment for review

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Assessment submitted for review",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SUBMITTED",
    "submitted_at": "2025-10-23T14:08:00Z",
    "assessment_competencies": [
      {
        "id": "comp-uuid",
        "skill_name": "JavaScript/TypeScript",
        "category": "technical",
        "self_assessment_level": 4,
        "self_interest_level": 8
      }
    ],
    "recommendations": [...]
  }
}
```

---

### TEST 14: Get Assessment After Submission
**Endpoint:** `GET /api/assessments/:id`
**Status Code Expected:** 200 OK

```bash
curl -X GET "http://localhost:5000/api/assessments/$ASSESSMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response (should show all competencies and recommendations):**
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SUBMITTED",
    "progress_percentage": 100,
    "assessment_competencies": [...],
    "recommendations": [...],
    "submitted_at": "2025-10-23T14:08:00Z"
  }
}
```

---

## 🧪 Error Test Cases

### ERROR TEST 1: Missing Authentication
**Endpoint:** `GET /api/assessments`
**Expected Status:** 401 Unauthorized

```bash
curl -X GET "http://localhost:5000/api/assessments"
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

---

### ERROR TEST 2: Invalid Assessment ID
**Endpoint:** `GET /api/assessments/invalid-uuid`
**Expected Status:** 404 Not Found

```bash
curl -X GET "http://localhost:5000/api/assessments/invalid-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Assessment not found"
}
```

---

### ERROR TEST 3: Invalid Step Number
**Endpoint:** `POST /api/assessments/:id/steps/99`
**Expected Status:** 400 Bad Request

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/99" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"section": "work_history", "answers": {}}'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid step number. Must be 1-5"
}
```

---

### ERROR TEST 4: Validation Failure (Skills Step < 5)
**Endpoint:** `POST /api/assessments/:id/steps/3`
**Expected Status:** 400 Bad Request

```bash
curl -X POST "http://localhost:5000/api/assessments/$ASSESSMENT_ID/steps/3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "skills",
    "answers": {},
    "competencies": [
      {
        "skillName": "JavaScript",
        "selfAssessmentLevel": 4,
        "selfInterestLevel": 8
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid data",
  "errors": ["Please select at least 5 skills"]
}
```

---

## 📊 Test Execution Summary

### Expected Results
- ✅ All 14 tests should pass (200/201 responses)
- ✅ Assessment should progress from 0% to 100%
- ✅ All steps should be saveable
- ✅ Competencies should be auto-created on submission
- ✅ Final status should be SUBMITTED

### Success Criteria
- [ ] All 14 main tests pass
- [ ] All 4 error tests return expected error codes
- [ ] Progress increments correctly (0% → 20% → 40% → 60% → 80% → 100%)
- [ ] Competencies auto-created (5+ competencies)
- [ ] Recommendations generated (after submission)
- [ ] Audit logs created for all actions

---

## 🚀 How to Run Tests

### Option 1: Postman
1. Import this markdown as Postman collection
2. Set variables:
   - `base_url`: http://localhost:5000/api
   - `token`: <JWT from login>
   - `assessment_id`: <ID from create response>
3. Run tests in order

### Option 2: cURL Script
```bash
#!/bin/bash

# Set variables
TOKEN="<your_jwt_token>"
ASSESSMENT_ID="<assessment_id>"

# Run each test...
# curl commands from above
```

### Option 3: Newman CLI
```bash
npm install -g newman
newman run collection.json -e environment.json
```

---

**All tests documented and ready for execution**
**Expected completion time: 30-45 minutes for full test cycle**
**Success rate target: 100% (18/18 tests passing)**

---

*Generated: 2025-10-23*
*Test Cases: 14 main + 4 error = 18 total*
*Format: cURL (Postman compatible)*
