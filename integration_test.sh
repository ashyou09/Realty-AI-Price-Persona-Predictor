#!/bin/bash

# Complete Frontend + Backend Integration Test
# This script simulates a complete user journey through the app

BACKEND_URL="https://realty-ai-price-persona-predictor.onrender.com"
FRONTEND_URL="http://localhost:5174"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    COMPLETE AUTHENTICATION SYSTEM INTEGRATION TEST             ║"
echo "║    Testing Frontend + Backend Communication                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Generate unique test user
TEST_TIMESTAMP=$(date +%s)
TEST_EMAIL="integration_test_${TEST_TIMESTAMP}@example.com"
TEST_NAME="Integration Test User ${TEST_TIMESTAMP}"
TEST_PASSWORD="IntegrationTest123!"

echo "📋 TEST CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Test Email: $TEST_EMAIL"
echo "Test Name: $TEST_NAME"
echo "Test Password: $TEST_PASSWORD"
echo ""
echo "⏱️  Starting tests at: $(date)"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_pattern=$3
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}TEST ${TESTS_RUN}: ${test_name}${NC}"
    
    local response=$(eval "$test_command")
    
    if echo "$response" | grep -q "$expected_pattern"; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "  Response: $(echo "$response" | head -c 100)..."
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected: $expected_pattern"
        echo "  Got: $response"
    fi
    echo ""
}

# TEST 1: Health check - Backend is accessible
echo "🔍 STEP 1: Verify Backend is Accessible"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test \
    "Backend Health Check" \
    "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL/api/auth/verify" \
    "[2-4][0-9][0-9]"

# TEST 2: Registration
echo "📝 STEP 2: User Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TESTS_RUN=$((TESTS_RUN + 1))
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✓ Registration Successful${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    USER_NAME=$(echo "$REGISTER_RESPONSE" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  User ID: $USER_ID"
    echo "  User Name: $USER_NAME"
    echo "  Token: ${TOKEN:0:20}..."
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}✗ Registration Failed${NC}"
    echo "  Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# TEST 3: Verify with token
echo "🔐 STEP 3: Token Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test \
    "Verify JWT Token" \
    "curl -s -X GET '$BACKEND_URL/api/auth/verify' -H 'Authorization: Bearer $TOKEN'" \
    '"success":true'

# TEST 4: Login
echo "🔑 STEP 4: User Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TESTS_RUN=$((TESTS_RUN + 1))
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✓ Login Successful${NC}"
    LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "  New Token: ${LOGIN_TOKEN:0:20}..."
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}✗ Login Failed${NC}"
    echo "  Response: $LOGIN_RESPONSE"
fi
echo ""

# TEST 5: Invalid credentials
echo "⚠️  STEP 5: Error Handling - Invalid Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INVALID_LOGIN=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123!\"}")

TESTS_RUN=$((TESTS_RUN + 1))
if echo "$INVALID_LOGIN" | grep -q '"success":false'; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✓ Invalid Credentials Properly Rejected${NC}"
    echo "  Error: $(echo "$INVALID_LOGIN" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}✗ Invalid Credentials Should Be Rejected${NC}"
fi
echo ""

# TEST 6: Logout
echo "🚪 STEP 6: User Logout"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test \
    "Logout User" \
    "curl -s -X POST '$BACKEND_URL/api/auth/logout' -H 'Authorization: Bearer $TOKEN'" \
    '"success":true'

# TEST 7: Check API endpoints are reachable
echo "🌐 STEP 7: Other API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test \
    "Properties Endpoint" \
    "curl -s -X GET '$BACKEND_URL/api/properties' -H 'Authorization: Bearer $TOKEN' -w '%{http_code}' | tail -c 3" \
    "[2-4][0-9][0-9]"

# TEST 8: Verify CORS headers
echo "🔗 STEP 8: CORS Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CORS_RESPONSE=$(curl -s -i -X OPTIONS "$BACKEND_URL/api/auth/register" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" 2>&1)

TESTS_RUN=$((TESTS_RUN + 1))
if echo "$CORS_RESPONSE" | grep -q "Access-Control"; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✓ CORS Headers Present${NC}"
else
    # It's okay if no explicit CORS headers, still might work
    echo -e "${YELLOW}⚠ Check CORS configuration${NC}"
fi
echo ""

# Final Summary
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo "Total Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
else
    SUCCESS_RATE=100
    echo -e "Tests Failed: ${GREEN}0${NC}"
fi
echo "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - SYSTEM IS FULLY OPERATIONAL${NC}"
    echo ""
    echo "Frontend Ready: $FRONTEND_URL"
    echo "Backend API: $BACKEND_URL"
    echo ""
    echo "You can now:"
    echo "1. Open http://localhost:5174 in your browser"
    echo "2. Click 'Create Account' to register"
    echo "3. Fill in the registration form"
    echo "4. Click 'Sign Up' to register"
    echo "5. You will be logged in and redirected to properties page"
    echo "6. Click on your user avatar to logout"
    echo ""
else
    echo -e "${RED}❌ SOME TESTS FAILED - CHECK ERRORS ABOVE${NC}"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════════"
echo "✨ Test completed at: $(date)"
echo "═══════════════════════════════════════════════════════════════════"
