#!/bin/bash

# ============================================
# BilanCompetence.AI - Deployment Verification Script
# ============================================
# This script verifies that all deployments are working correctly
# Run this script after deployment to ensure everything is operational

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment URLs
FRONTEND_URL="${FRONTEND_URL:-https://bilancompetence-lekesizs-projects.vercel.app}"
BACKEND_URL="${BACKEND_URL:-https://web-production-60dbd.up.railway.app}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}BilanCompetence.AI - Deployment Verification${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Function to check HTTP status
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}

    echo -e "${YELLOW}Checking ${name}...${NC}"

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ ${name}: OK (HTTP ${response})${NC}"
        return 0
    else
        echo -e "${RED}✗ ${name}: FAILED (HTTP ${response}, expected ${expected_status})${NC}"
        return 1
    fi
}

# Function to check endpoint with JSON response
check_json_endpoint() {
    local url=$1
    local name=$2

    echo -e "${YELLOW}Checking ${name}...${NC}"

    response=$(curl -s "$url" 2>&1)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ ${name}: OK${NC}"
        echo -e "${BLUE}Response: ${response}${NC}\n"
        return 0
    else
        echo -e "${RED}✗ ${name}: FAILED (HTTP ${http_code})${NC}"
        echo -e "${RED}Response: ${response}${NC}\n"
        return 1
    fi
}

# Initialize counters
total_checks=0
passed_checks=0
failed_checks=0

# ============================================
# 1. FRONTEND VERIFICATION (Vercel)
# ============================================
echo -e "\n${BLUE}=== 1. Frontend Verification (Vercel) ===${NC}\n"

# Check frontend home page
if check_endpoint "$FRONTEND_URL" "Frontend Homepage" "200"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi
((total_checks++))

# Check frontend API proxy (if configured)
if check_endpoint "$FRONTEND_URL/api/version" "Frontend API Proxy" "200"; then
    ((passed_checks++))
else
    echo -e "${YELLOW}Note: Frontend API proxy might not be configured${NC}"
fi
((total_checks++))

# ============================================
# 2. BACKEND VERIFICATION (Railway)
# ============================================
echo -e "\n${BLUE}=== 2. Backend Verification (Railway) ===${NC}\n"

# Check basic health endpoint
if check_json_endpoint "$BACKEND_URL/health" "Backend Health Check"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi
((total_checks++))

# Check detailed health endpoint
if check_json_endpoint "$BACKEND_URL/health/detailed" "Backend Detailed Health"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi
((total_checks++))

# Check readiness probe
if check_json_endpoint "$BACKEND_URL/health/ready" "Backend Readiness Probe"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi
((total_checks++))

# Check liveness probe
if check_json_endpoint "$BACKEND_URL/health/live" "Backend Liveness Probe"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi
((total_checks++))

# Check API version endpoint
if check_json_endpoint "$BACKEND_URL/api/version" "Backend API Version"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi
((total_checks++))

# ============================================
# 3. DATABASE CONNECTIVITY
# ============================================
echo -e "\n${BLUE}=== 3. Database Connectivity ===${NC}\n"

# Database check is included in /health/detailed
echo -e "${YELLOW}Checking database connectivity via health endpoint...${NC}"
db_status=$(curl -s "$BACKEND_URL/health/detailed" | grep -o '"database":{"status":"[^"]*"' | cut -d'"' -f6)

if [ "$db_status" = "connected" ]; then
    echo -e "${GREEN}✓ Database: Connected${NC}"
    ((passed_checks++))
else
    echo -e "${RED}✗ Database: Disconnected or unavailable${NC}"
    echo -e "${RED}Status: ${db_status}${NC}"
    ((failed_checks++))
fi
((total_checks++))

# ============================================
# 4. CORS & SECURITY HEADERS
# ============================================
echo -e "\n${BLUE}=== 4. Security Headers Verification ===${NC}\n"

echo -e "${YELLOW}Checking backend security headers...${NC}"
headers=$(curl -sI "$BACKEND_URL/health" 2>&1)

# Check for security headers
if echo "$headers" | grep -qi "x-content-type-options"; then
    echo -e "${GREEN}✓ X-Content-Type-Options header present${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}⚠ X-Content-Type-Options header missing${NC}"
fi
((total_checks++))

if echo "$headers" | grep -qi "x-frame-options"; then
    echo -e "${GREEN}✓ X-Frame-Options header present${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}⚠ X-Frame-Options header missing${NC}"
fi
((total_checks++))

# ============================================
# 5. ENVIRONMENT VARIABLES CHECK
# ============================================
echo -e "\n${BLUE}=== 5. Environment Variables Check ===${NC}\n"

echo -e "${YELLOW}Checking backend environment from /health/detailed...${NC}"
env_check=$(curl -s "$BACKEND_URL/health/detailed" | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)

if [ "$env_check" = "production" ]; then
    echo -e "${GREEN}✓ Environment: production${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}⚠ Environment: ${env_check} (expected: production)${NC}"
fi
((total_checks++))

# ============================================
# SUMMARY
# ============================================
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}============================================${NC}\n"

echo -e "Total Checks: ${total_checks}"
echo -e "${GREEN}Passed: ${passed_checks}${NC}"
echo -e "${RED}Failed: ${failed_checks}${NC}"

success_rate=$((passed_checks * 100 / total_checks))
echo -e "\nSuccess Rate: ${success_rate}%"

if [ $failed_checks -eq 0 ]; then
    echo -e "\n${GREEN}✓ All deployment checks passed!${NC}"
    exit 0
elif [ $success_rate -ge 70 ]; then
    echo -e "\n${YELLOW}⚠ Deployment partially verified. Please review failed checks.${NC}"
    exit 1
else
    echo -e "\n${RED}✗ Deployment verification failed. Critical issues detected.${NC}"
    exit 1
fi
