#!/bin/bash

# BilanCompetence.AI - Smoke Test Suite
# Tests basic functionality of the API

set -e

API_URL="${API_URL:-https://web-production-60dbd.up.railway.app}"
RESULTS_FILE="/tmp/smoke-test-results.json"

echo "🚀 Starting Smoke Tests for BilanCompetence.AI"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/health" "200"

# Test 2: API Root (should return 404 or error)
test_endpoint "API Root" "GET" "/" "200" || true

# Test 3: Register new user
RANDOM_EMAIL="test-$(date +%s)@example.com"
REGISTER_DATA="{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123!@#\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"BENEFICIARY\"}"
test_endpoint "User Registration" "POST" "/api/auth/register" "201" "$REGISTER_DATA" || true

# Test 4: Login with invalid credentials (should fail)
LOGIN_DATA="{\"email\":\"invalid@example.com\",\"password\":\"wrongpassword\"}"
test_endpoint "Login (Invalid)" "POST" "/api/auth/login" "401" "$LOGIN_DATA" || true

# Test 5: Get users without auth (should fail)
test_endpoint "Get Users (No Auth)" "GET" "/api/users" "401" || true

# Test 6: Dashboard endpoint without auth (should fail)
test_endpoint "Dashboard (No Auth)" "GET" "/api/dashboard/stats" "401" || true

echo ""
echo "================================"
echo "Smoke Test Results"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
