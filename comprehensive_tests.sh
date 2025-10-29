#!/bin/bash

# Comprehensive User Tests - BilanCompetence.AI
# Tests all user roles with all scenarios

API_BASE="https://web-production-60dbd.up.railway.app/api"
RESULTS_FILE="/tmp/test_results.txt"

echo "=========================================="
echo "🧪 TESTS UTILISATEUR COMPLETS"
echo "BilanCompetence.AI"
echo "=========================================="
echo ""

# Clear results file
> $RESULTS_FILE

# Function to log results
log_result() {
    echo "$1" | tee -a $RESULTS_FILE
}

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local token="$4"
    local data="$5"
    
    log_result "Test: $name"
    
    if [ "$method" == "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
        log_result "  ✅ SUCCESS (HTTP $HTTP_CODE)"
        STATUS=$(echo "$BODY" | jq -r '.status // "unknown"')
        log_result "  Status: $STATUS"
    else
        log_result "  ❌ FAILED (HTTP $HTTP_CODE)"
        ERROR=$(echo "$BODY" | jq -r '.message // "Unknown error"')
        log_result "  Error: $ERROR"
    fi
    
    log_result ""
}

# ==========================================
# ROLE 1: CLIENT (BENEFICIARY)
# ==========================================
log_result "=========================================="
log_result "👤 ROLE 1: CLIENT (BÉNÉFICIAIRE)"
log_result "Email: client@demo.bilancompetence.ai"
log_result "=========================================="
log_result ""

# Login
log_result "Scénario 1.1: Connexion"
CLIENT_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"client@demo.bilancompetence.ai","password":"Client@Demo2025"}' | \
    jq -r '.data.accessToken')

if [ "$CLIENT_TOKEN" != "null" ] && [ -n "$CLIENT_TOKEN" ]; then
    log_result "  ✅ Login réussi"
    log_result "  Token: ${CLIENT_TOKEN:0:30}..."
else
    log_result "  ❌ Login échoué"
    exit 1
fi
log_result ""

# Test endpoints
test_endpoint "1.2: Récupérer mes assessments" "GET" "/assessments" "$CLIENT_TOKEN"
test_endpoint "1.3: Récupérer mon profil" "GET" "/users/me" "$CLIENT_TOKEN"
test_endpoint "1.4: Récupérer mes analytics" "GET" "/analytics/user-activity" "$CLIENT_TOKEN"
test_endpoint "1.5: Récupérer assessment spécifique" "GET" "/assessments/361964e6-727f-4146-90f3-baee10d29ccc" "$CLIENT_TOKEN"

# Try to access admin endpoint (should fail)
log_result "Test: 1.6: Accès endpoint admin (devrait échouer)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/admin/qualiopi/indicators" \
    -H "Authorization: Bearer $CLIENT_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "403" ] || [ "$HTTP_CODE" == "401" ]; then
    log_result "  ✅ CORRECT - Accès refusé (HTTP $HTTP_CODE)"
else
    log_result "  ❌ PROBLÈME - Client peut accéder aux endpoints admin (HTTP $HTTP_CODE)"
fi
log_result ""

# ==========================================
# ROLE 2: CONSULTANT
# ==========================================
log_result "=========================================="
log_result "👨‍🏫 ROLE 2: CONSULTANT"
log_result "Email: consultant@demo.bilancompetence.ai"
log_result "=========================================="
log_result ""

# Login
log_result "Scénario 2.1: Connexion"
CONSULTANT_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"consultant@demo.bilancompetence.ai","password":"Consultant@Demo2025"}' | \
    jq -r '.data.accessToken')

if [ "$CONSULTANT_TOKEN" != "null" ] && [ -n "$CONSULTANT_TOKEN" ]; then
    log_result "  ✅ Login réussi"
    log_result "  Token: ${CONSULTANT_TOKEN:0:30}..."
else
    log_result "  ❌ Login échoué"
    exit 1
fi
log_result ""

# Test endpoints
test_endpoint "2.2: Récupérer mes clients/assessments" "GET" "/assessments" "$CONSULTANT_TOKEN"
test_endpoint "2.3: Récupérer mon profil" "GET" "/users/me" "$CONSULTANT_TOKEN"
test_endpoint "2.4: Récupérer mes analytics" "GET" "/analytics/user-activity" "$CONSULTANT_TOKEN"

# Try to access admin endpoint (should fail)
log_result "Test: 2.5: Accès endpoint admin (devrait échouer)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/admin/qualiopi/indicators" \
    -H "Authorization: Bearer $CONSULTANT_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "403" ] || [ "$HTTP_CODE" == "401" ]; then
    log_result "  ✅ CORRECT - Accès refusé (HTTP $HTTP_CODE)"
else
    log_result "  ❌ PROBLÈME - Consultant peut accéder aux endpoints admin (HTTP $HTTP_CODE)"
fi
log_result ""

# ==========================================
# ROLE 3: ADMIN (ORGANIZATION_ADMIN)
# ==========================================
log_result "=========================================="
log_result "👨‍💼 ROLE 3: ADMIN (ORGANIZATION_ADMIN)"
log_result "Email: admin@demo.bilancompetence.ai"
log_result "=========================================="
log_result ""

# Login
log_result "Scénario 3.1: Connexion"
ADMIN_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@demo.bilancompetence.ai","password":"Admin@Demo2025"}' | \
    jq -r '.data.accessToken')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    log_result "  ✅ Login réussi"
    log_result "  Token: ${ADMIN_TOKEN:0:30}..."
else
    log_result "  ❌ Login échoué"
    exit 1
fi
log_result ""

# Test endpoints
test_endpoint "3.2: Récupérer tous les assessments" "GET" "/assessments" "$ADMIN_TOKEN"
test_endpoint "3.3: Récupérer mon profil" "GET" "/users/me" "$ADMIN_TOKEN"
test_endpoint "3.4: Récupérer indicateurs Qualiopi" "GET" "/admin/qualiopi/indicators" "$ADMIN_TOKEN"
test_endpoint "3.5: Récupérer analytics organisation" "GET" "/analytics/organization" "$ADMIN_TOKEN"

# ==========================================
# SUMMARY
# ==========================================
log_result "=========================================="
log_result "📊 RÉSUMÉ DES TESTS"
log_result "=========================================="

SUCCESS_COUNT=$(grep -c "✅ SUCCESS" $RESULTS_FILE)
FAILED_COUNT=$(grep -c "❌ FAILED" $RESULTS_FILE)
TOTAL_COUNT=$((SUCCESS_COUNT + FAILED_COUNT))

log_result ""
log_result "Tests réussis: $SUCCESS_COUNT"
log_result "Tests échoués: $FAILED_COUNT"
log_result "Total: $TOTAL_COUNT"
log_result ""

if [ $FAILED_COUNT -eq 0 ]; then
    log_result "✅ TOUS LES TESTS SONT PASSÉS"
else
    log_result "⚠️  CERTAINS TESTS ONT ÉCHOUÉ"
fi

log_result ""
log_result "Rapport complet sauvegardé dans: $RESULTS_FILE"
log_result "=========================================="

# Display results
cat $RESULTS_FILE

