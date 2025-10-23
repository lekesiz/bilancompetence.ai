#!/bin/bash

# Y2 Assessment Wizard API - Live Testing Script
# Date: 2025-10-23
# Target: https://bilancompetence.vercel.app/api
# Test Cases: 18 (14 main + 4 error scenarios)

set -e

# Configuration
BASE_URL="https://bilancompetence.vercel.app/api"
TEST_EMAIL="test.assessment.$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_FULL_NAME="Assessment Tester $(date +%s)"
RESULTS_FILE="Y2_TEST_RESULTS.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TESTS_RUN=0

# Initialize results array
echo "{" > "$RESULTS_FILE"
echo "  \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"," >> "$RESULTS_FILE"
echo "  \"base_url\": \"$BASE_URL\"," >> "$RESULTS_FILE"
echo "  \"tests\": [" >> "$RESULTS_FILE"

# Helper function to test an endpoint
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local body="$4"
    local expected_status="$5"
    local token="$6"

    ((TESTS_RUN++))

    echo ""
    echo -e "${BLUE}[TEST $TESTS_RUN] $test_name${NC}"
    echo "  Method: $method"
    echo "  Endpoint: $endpoint"
    echo "  Expected Status: $expected_status"

    # Build curl command
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method"

    if [ -n "$token" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $token'"
    fi

    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"

    if [ -n "$body" ]; then
        curl_cmd="$curl_cmd -d '$body'"
    fi

    curl_cmd="$curl_cmd '$BASE_URL$endpoint'"

    # Execute and capture response
    local response=$(eval "$curl_cmd")
    local http_code=$(echo "$response" | tail -n1)
    local body_response=$(echo "$response" | sed '$d')

    # Check if status matches expected
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        ((PASSED++))

        # Save result
        echo "    {" >> "$RESULTS_FILE"
        echo "      \"test\": \"$test_name\"," >> "$RESULTS_FILE"
        echo "      \"status\": \"PASSED\"," >> "$RESULTS_FILE"
        echo "      \"http_code\": $http_code," >> "$RESULTS_FILE"
        echo "      \"expected\": $expected_status," >> "$RESULTS_FILE"
        echo "      \"response_preview\": \"$(echo "$body_response" | head -c 100)...\"" >> "$RESULTS_FILE"
        echo "    }," >> "$RESULTS_FILE"

        # Return response for further processing
        echo "$body_response"
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $http_code)"
        ((FAILED++))

        # Save result
        echo "    {" >> "$RESULTS_FILE"
        echo "      \"test\": \"$test_name\"," >> "$RESULTS_FILE"
        echo "      \"status\": \"FAILED\"," >> "$RESULTS_FILE"
        echo "      \"http_code\": $http_code," >> "$RESULTS_FILE"
        echo "      \"expected\": $expected_status," >> "$RESULTS_FILE"
        echo "      \"response_preview\": \"$(echo "$body_response" | head -c 100)...\"" >> "$RESULTS_FILE"
        echo "    }," >> "$RESULTS_FILE"

        echo "$body_response"
    fi
}

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Y2 Assessment Wizard API - Live Testing${NC}"
echo -e "${YELLOW}Target: $BASE_URL${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================
# PHASE 1: AUTHENTICATION
# ============================================================

echo -e "${YELLOW}PHASE 1: AUTHENTICATION SETUP${NC}"
echo ""

# TEST 1: Register Test User
echo -e "${BLUE}Step 1/2: Register Test User${NC}"

register_body="{
  \"email\": \"$TEST_EMAIL\",
  \"password\": \"$TEST_PASSWORD\",
  \"full_name\": \"$TEST_FULL_NAME\",
  \"role\": \"BENEFICIARY\"
}"

register_response=$(test_endpoint "Register Test User" "POST" "/auth/register" "$register_body" "201" "")

# Extract user_id if registration successful
USER_ID=$(echo "$register_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Extracted User ID: $USER_ID"

# TEST 2: Login and Get Token
echo ""
echo -e "${BLUE}Step 2/2: Login and Get JWT Token${NC}"

login_body="{
  \"email\": \"$TEST_EMAIL\",
  \"password\": \"$TEST_PASSWORD\"
}"

login_response=$(test_endpoint "Login and Get Token" "POST" "/auth/login" "$login_body" "200" "")

# Extract JWT token
TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "  Extracted JWT Token: ${TOKEN:0:20}..."

if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERROR: Could not extract JWT token. Aborting tests.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Authentication setup complete${NC}"
echo ""

# ============================================================
# PHASE 2: ASSESSMENT LIFECYCLE TESTS
# ============================================================

echo -e "${YELLOW}PHASE 2: ASSESSMENT LIFECYCLE TESTS${NC}"
echo ""

# TEST 3: Create Assessment
echo -e "${BLUE}Step 1/10: Create Assessment${NC}"

create_assessment_body="{
  \"title\": \"Career Transition Assessment 2025\",
  \"description\": \"Complete career and skills assessment\",
  \"assessment_type\": \"career\"
}"

create_response=$(test_endpoint "Create Assessment" "POST" "/assessments" "$create_assessment_body" "201" "$TOKEN")

# Extract assessment ID
ASSESSMENT_ID=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  Extracted Assessment ID: $ASSESSMENT_ID"

if [ -z "$ASSESSMENT_ID" ]; then
    echo -e "${RED}ERROR: Could not extract assessment ID. Aborting tests.${NC}"
    exit 1
fi

# TEST 4: Get Assessment Details
echo ""
echo -e "${BLUE}Step 2/10: Get Assessment Details${NC}"
test_endpoint "Get Assessment" "GET" "/assessments/$ASSESSMENT_ID" "" "200" "$TOKEN" > /dev/null

# TEST 5: List User Assessments
echo ""
echo -e "${BLUE}Step 3/10: List User Assessments${NC}"
test_endpoint "List Assessments" "GET" "/assessments?role=beneficiary&page=1&limit=10" "" "200" "$TOKEN" > /dev/null

# TEST 6: Get Progress (Initial)
echo ""
echo -e "${BLUE}Step 4/10: Get Initial Progress${NC}"
test_endpoint "Get Progress (Initial)" "GET" "/assessments/$ASSESSMENT_ID/progress" "" "200" "$TOKEN" > /dev/null

# ============================================================
# PHASE 3: WIZARD STEP TESTS (1-5)
# ============================================================

echo ""
echo -e "${YELLOW}PHASE 3: WIZARD STEPS - WORK HISTORY${NC}"
echo ""

echo -e "${BLUE}Step 5/10: Save Step 1 - Work History${NC}"

step1_body="{
  \"section\": \"work_history\",
  \"answers\": {
    \"recentJob\": \"Senior Software Engineer at TechCorp (2020-2025). Led development of microservices architecture serving 10M+ users. Managed team of 5 engineers. Key achievements: 40% performance improvement, zero-downtime deployments.\",
    \"previousPositions\": \"Junior Developer at StartupXYZ (2018-2020), Frontend Developer at WebAgency (2016-2018), Intern at BigTech (2015-2016). Progressive experience in full-stack development with focus on React, Node.js, and AWS.\"
  }
}"

test_endpoint "Save Step 1 - Work History" "POST" "/assessments/$ASSESSMENT_ID/steps/1" "$step1_body" "200" "$TOKEN" > /dev/null

# TEST 7: Auto-Save Draft
echo ""
echo -e "${YELLOW}PHASE 3: AUTO-SAVE FEATURE${NC}"
echo ""
echo -e "${BLUE}Step 6/10: Auto-Save Draft${NC}"

autosave_body="{
  \"step_number\": 2,
  \"partial_data\": {
    \"highestLevel\": \"bac+5\",
    \"fieldOfStudy\": \"Computer Science\"
  }
}"

test_endpoint "Auto-Save Draft" "POST" "/assessments/$ASSESSMENT_ID/auto-save" "$autosave_body" "200" "$TOKEN" > /dev/null

# TEST 8: Check Progress After Saving
echo ""
echo -e "${BLUE}Step 7/10: Check Progress After Saving${NC}"
test_endpoint "Get Progress (After Save)" "GET" "/assessments/$ASSESSMENT_ID/progress" "" "200" "$TOKEN" > /dev/null

# ============================================================
# PHASE 4: COMPLETE ALL STEPS
# ============================================================

echo ""
echo -e "${YELLOW}PHASE 4: COMPLETE REMAINING WIZARD STEPS${NC}"
echo ""

# Step 2: Education
echo -e "${BLUE}Step 8/10: Save Step 2 - Education${NC}"

step2_body="{
  \"section\": \"education\",
  \"answers\": {
    \"highestLevel\": \"bac+5\",
    \"fieldOfStudy\": \"Computer Science & Engineering\",
    \"certifications\": \"AWS Solutions Architect, Google Cloud Professional, Kubernetes CKA\",
    \"currentEducation\": \"None, but actively learning advanced system design patterns\"
  }
}"

test_endpoint "Save Step 2 - Education" "POST" "/assessments/$ASSESSMENT_ID/steps/2" "$step2_body" "200" "$TOKEN" > /dev/null

echo ""

# Step 3: Skills
echo -e "${BLUE}Saving Step 3 - Skills (with 5+ competencies)${NC}"

step3_body="{
  \"section\": \"skills\",
  \"answers\": {
    \"additionalSkills\": \"DevOps practices, Docker containerization, Kubernetes orchestration\"
  },
  \"competencies\": [
    {
      \"skillName\": \"JavaScript/TypeScript\",
      \"selfAssessmentLevel\": 4,
      \"selfInterestLevel\": 8,
      \"category\": \"technical\",
      \"context\": \"10+ years professional experience, expert level\"
    },
    {
      \"skillName\": \"React.js\",
      \"selfAssessmentLevel\": 4,
      \"selfInterestLevel\": 9,
      \"category\": \"technical\",
      \"context\": \"5+ years, built multiple large-scale applications\"
    },
    {
      \"skillName\": \"Node.js/Express\",
      \"selfAssessmentLevel\": 4,
      \"selfInterestLevel\": 8,
      \"category\": \"technical\",
      \"context\": \"8+ years backend development\"
    },
    {
      \"skillName\": \"AWS/Cloud Services\",
      \"selfAssessmentLevel\": 3,
      \"selfInterestLevel\": 7,
      \"category\": \"technical\",
      \"context\": \"5+ years, certified solutions architect\"
    },
    {
      \"skillName\": \"Team Leadership\",
      \"selfAssessmentLevel\": 3,
      \"selfInterestLevel\": 8,
      \"category\": \"soft\",
      \"context\": \"Led teams of 3-5 engineers\"
    }
  ]
}"

test_endpoint "Save Step 3 - Skills" "POST" "/assessments/$ASSESSMENT_ID/steps/3" "$step3_body" "200" "$TOKEN" > /dev/null

echo ""

# Step 4: Motivations
echo -e "${BLUE}Saving Step 4 - Motivations${NC}"

step4_body="{
  \"section\": \"motivations\",
  \"answers\": {
    \"topValues\": [\"Innovation\", \"Impact\", \"Learning\", \"Autonomy\"],
    \"careerGoals\": [\"Tech Leadership\", \"Startup Founding\", \"Mentoring\"],
    \"motivationDescription\": \"I am motivated by solving complex technical challenges and building products that impact millions of users. I thrive in environments where I can continue learning cutting-edge technologies while mentoring junior engineers. The prospect of leading a technical team or starting my own venture excites me.\"
  }
}"

test_endpoint "Save Step 4 - Motivations" "POST" "/assessments/$ASSESSMENT_ID/steps/4" "$step4_body" "200" "$TOKEN" > /dev/null

echo ""

# Step 5: Constraints
echo -e "${BLUE}Saving Step 5 - Constraints${NC}"

step5_body="{
  \"section\": \"constraints\",
  \"answers\": {
    \"geographicPreferences\": [\"Remote\", \"Paris\", \"San Francisco\"],
    \"contractTypes\": [\"CDI\", \"Startup Equity\"],
    \"salaryExpectations\": \"80-120k EUR (Paris) or 120-160k USD (SF) + equity\",
    \"otherConstraints\": \"Family considerations limit relocation before 2027\"
  }
}"

test_endpoint "Save Step 5 - Constraints" "POST" "/assessments/$ASSESSMENT_ID/steps/5" "$step5_body" "200" "$TOKEN" > /dev/null

# TEST 9: Check Final Progress
echo ""
echo -e "${BLUE}Step 9/10: Check Final Progress${NC}"
test_endpoint "Get Progress (Final)" "GET" "/assessments/$ASSESSMENT_ID/progress" "" "200" "$TOKEN" > /dev/null

# TEST 10: Submit Assessment
echo ""
echo -e "${BLUE}Step 10/10: Submit Assessment${NC}"
test_endpoint "Submit Assessment" "POST" "/assessments/$ASSESSMENT_ID/submit" "" "200" "$TOKEN" > /dev/null

# ============================================================
# PHASE 5: VERIFICATION TESTS
# ============================================================

echo ""
echo -e "${YELLOW}PHASE 5: POST-SUBMISSION VERIFICATION${NC}"
echo ""

echo -e "${BLUE}Verifying Assessment After Submission${NC}"
test_endpoint "Get Assessment (After Submit)" "GET" "/assessments/$ASSESSMENT_ID" "" "200" "$TOKEN" > /dev/null

# ============================================================
# PHASE 6: ERROR TEST CASES
# ============================================================

echo ""
echo -e "${YELLOW}PHASE 6: ERROR TEST CASES${NC}"
echo ""

echo -e "${BLUE}Error Test 1: Missing Authentication${NC}"
test_endpoint "Missing Authentication" "GET" "/assessments" "" "401" "" > /dev/null

echo ""

echo -e "${BLUE}Error Test 2: Invalid Assessment ID${NC}"
test_endpoint "Invalid Assessment ID" "GET" "/assessments/invalid-uuid" "" "404" "$TOKEN" > /dev/null

echo ""

echo -e "${BLUE}Error Test 3: Invalid Step Number${NC}"

invalid_step_body="{\"section\": \"work_history\", \"answers\": {}}"
test_endpoint "Invalid Step Number" "POST" "/assessments/$ASSESSMENT_ID/steps/99" "$invalid_step_body" "400" "$TOKEN" > /dev/null

echo ""

echo -e "${BLUE}Error Test 4: Validation Failure (< 5 Skills)${NC}"

invalid_skills_body="{
  \"section\": \"skills\",
  \"answers\": {},
  \"competencies\": [
    {
      \"skillName\": \"JavaScript\",
      \"selfAssessmentLevel\": 4,
      \"selfInterestLevel\": 8
    }
  ]
}"

test_endpoint "Validation Failure (< 5 Skills)" "POST" "/assessments/$ASSESSMENT_ID/steps/3" "$invalid_skills_body" "400" "$TOKEN" > /dev/null

# ============================================================
# FINAL RESULTS
# ============================================================

# Close JSON results array
echo "  ]" >> "$RESULTS_FILE"
echo "}" >> "$RESULTS_FILE"

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST EXECUTION COMPLETE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "Total Tests Run: $TESTS_RUN"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

PASS_RATE=$(( PASSED * 100 / TESTS_RUN ))
echo -e "Pass Rate: ${PASS_RATE}%"

echo ""
echo "Results saved to: $RESULTS_FILE"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi
