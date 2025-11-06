# 🔒 Security Testing Guide

This guide provides comprehensive testing procedures for the authentication and security features implemented in BilanCompetence.AI.

## Table of Contents

- [Automated Testing](#automated-testing)
- [Manual Testing](#manual-testing)
- [Security Checklist](#security-checklist)
- [Common Issues](#common-issues)

---

## Automated Testing

### Run Authentication Flow Test

The automated test script validates the complete authentication flow including HttpOnly cookies and CSRF tokens.

```bash
# From backend directory
cd apps/backend
tsx src/scripts/test-auth-flow.ts
```

### What It Tests

1. ✅ User Registration with cookie/CSRF token generation
2. ✅ Logout functionality
3. ✅ Login with credentials
4. ✅ Authenticated requests with cookies
5. ✅ CSRF protection (blocking requests without token)
6. ✅ Authenticated POST requests with CSRF token
7. ✅ Token refresh mechanism
8. ✅ Final logout

### Expected Output

```
🧪 Starting Authentication Flow Tests...
📍 API URL: http://localhost:3001
📧 Test Email: test-xxx@example.com

✅ Register
✅ Logout
✅ Login
✅ Authenticated Request
✅ CSRF Protection
✅ Authenticated POST
✅ Token Refresh
✅ Logout

📊 TEST SUMMARY
Passed: 8/8 (100%)
✅ All tests passed! Authentication flow is working correctly.
```

---

## Manual Testing

### Prerequisites

- Backend running on http://localhost:3001
- Frontend running on http://localhost:3000
- Browser with DevTools (Chrome/Firefox recommended)

### Test 1: Registration Flow

**Steps:**

1. Open DevTools → Application/Storage → Cookies
2. Navigate to `/register`
3. Fill registration form:
   - Email: `test@example.com`
   - Password: `SecurePass123!`
   - Name: `Test User`
4. Click "Register"

**Verify:**

- ✅ Redirect to dashboard
- ✅ Cookies set:
  - `accessToken` (HttpOnly ✓, Secure ✓, SameSite=Strict ✓)
  - `refreshToken` (HttpOnly ✓, Secure ✓, SameSite=Strict ✓)
  - `csrf_token` (HttpOnly ✗, Secure ✓, SameSite=Strict ✓)
- ✅ No tokens in localStorage
- ✅ DevTools → Network: Response contains user data

**Expected Cookies:**

```
accessToken: [JWT token]
  - HttpOnly: true
  - Secure: true (production)
  - SameSite: Strict
  - Max-Age: 900 (15 minutes)

refreshToken: [JWT token]
  - HttpOnly: true
  - Secure: true (production)
  - SameSite: Strict
  - Max-Age: 604800 (7 days)

csrf_token: [random token]
  - HttpOnly: false (frontend needs to read)
  - Secure: true (production)
  - SameSite: Strict
  - Max-Age: 900 (15 minutes)
```

---

### Test 2: Login Flow

**Steps:**

1. Clear all cookies
2. Navigate to `/login`
3. Enter credentials
4. Click "Login"

**Verify:**

- ✅ Redirect to appropriate dashboard (based on role)
- ✅ All cookies reset with new values
- ✅ New CSRF token generated
- ✅ DevTools → Network: `set-cookie` headers present

---

### Test 3: Authenticated API Call

**Steps:**

1. Login first
2. Open DevTools → Console
3. Run:

```javascript
fetch('http://localhost:3001/api/dashboard/beneficiary', {
  credentials: 'include',
  headers: {
    'x-csrf-token': document.cookie.match(/csrf_token=([^;]+)/)[1]
  }
})
  .then(r => r.json())
  .then(console.log)
```

**Verify:**

- ✅ Request succeeds (200 OK)
- ✅ Response contains dashboard data
- ✅ DevTools → Network → Request Headers:
  - `Cookie: accessToken=...; refreshToken=...; csrf_token=...`
  - `x-csrf-token: [token value]`

---

### Test 4: CSRF Protection

**Test 4a: Missing CSRF Token**

```javascript
// Should FAIL with 403
fetch('http://localhost:3001/api/dashboard/beneficiary', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
  .then(r => r.json())
  .then(console.log)
```

**Expected:** `403 Forbidden - CSRF token missing`

**Test 4b: Wrong CSRF Token**

```javascript
// Should FAIL with 403
fetch('http://localhost:3001/api/dashboard/beneficiary', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': 'invalid-token-123'
  },
  body: JSON.stringify({})
})
  .then(r => r.json())
  .then(console.log)
```

**Expected:** `403 Forbidden - CSRF token invalid`

**Test 4c: Correct CSRF Token**

```javascript
// Should SUCCEED
const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)[1];

fetch('http://localhost:3001/api/dashboard/beneficiary', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  },
  body: JSON.stringify({})
})
  .then(r => r.json())
  .then(console.log)
```

**Expected:** `200 OK` (or appropriate success response)

---

### Test 5: Token Refresh

**Steps:**

1. Login
2. Wait for access token to expire (~15 minutes) OR
3. Manually trigger refresh:

```javascript
fetch('http://localhost:3001/api/auth/refresh', {
  method: 'POST',
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
```

**Verify:**

- ✅ Response: `200 OK`
- ✅ New `accessToken` cookie set
- ✅ New `refreshToken` cookie set
- ✅ New `csrf_token` cookie set
- ✅ Old cookies replaced

---

### Test 6: Logout

**Steps:**

1. Login first
2. Click "Logout" button

**Verify:**

- ✅ Redirect to `/login`
- ✅ All cookies cleared:
  - `accessToken` = (empty)
  - `refreshToken` = (empty)
  - `csrf_token` = (empty)
- ✅ Subsequent API calls fail with 401

---

### Test 7: Cross-Site Request (CSRF Attack Simulation)

**Setup:**

1. Login to BilanCompetence.AI (localhost:3000)
2. Open a new tab with this HTML:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Malicious Site</h1>
  <button onclick="attack()">Launch CSRF Attack</button>
  <script>
    function attack() {
      fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: 'HACKED' })
      })
        .then(r => r.json())
        .then(console.log)
        .catch(console.error);
    }
  </script>
</body>
</html>
```

**Verify:**

- ✅ Request blocked by CORS (different origin)
- ✅ Even if CORS bypassed, CSRF validation fails (403)
- ✅ User data NOT modified

---

### Test 8: XSS Protection

**Test 8a: localStorage Access**

```javascript
// Should be EMPTY (no tokens)
console.log(localStorage.getItem('accessToken')); // null
console.log(localStorage.getItem('refreshToken')); // null
```

**Test 8b: Cookie Access**

```javascript
// Should NOT be able to read HttpOnly cookies
console.log(document.cookie); // Should only show: csrf_token=...
// accessToken and refreshToken should NOT appear
```

**Verify:**

- ✅ HttpOnly cookies not accessible via JavaScript
- ✅ Even if XSS vulnerability exists, auth tokens cannot be stolen

---

## Security Checklist

Use this checklist to verify security implementation:

### Cookies Configuration

- [ ] `accessToken` is HttpOnly
- [ ] `refreshToken` is HttpOnly
- [ ] `csrf_token` is NOT HttpOnly (frontend reads it)
- [ ] All cookies use `SameSite=Strict`
- [ ] All cookies use `Secure=true` in production
- [ ] Appropriate expiration times set

### CSRF Protection

- [ ] CSRF token generated on login/register
- [ ] CSRF token validated on POST/PUT/DELETE/PATCH
- [ ] GET requests don't require CSRF token
- [ ] Auth endpoints excluded from CSRF validation
- [ ] Constant-time comparison used for token validation

### API Security

- [ ] CORS properly configured
- [ ] `credentials: true` enabled in CORS
- [ ] Rate limiting active on auth endpoints
- [ ] Input sanitization middleware active
- [ ] Helmet security headers set

### Frontend Security

- [ ] No tokens in localStorage
- [ ] `withCredentials: true` on axios/fetch
- [ ] CSRF token included in mutating requests
- [ ] Automatic token refresh on 401 errors

### Authentication Flow

- [ ] Login returns HttpOnly cookies
- [ ] Register returns HttpOnly cookies
- [ ] Refresh rotates all tokens and CSRF
- [ ] Logout clears all cookies
- [ ] Token verification uses cookies

---

## Common Issues

### Issue 1: CORS Error

**Symptom:** `Access-Control-Allow-Origin` error in browser

**Solution:**

1. Check `CORS_ORIGIN` environment variable
2. Verify frontend URL is in allowed origins
3. Ensure `credentials: true` in CORS config

```typescript
// Backend: src/index.ts
cors({
  origin: 'http://localhost:3000',
  credentials: true, // REQUIRED for cookies
})
```

---

### Issue 2: Cookies Not Set

**Symptom:** No cookies appear in browser after login

**Solution:**

1. Check `Secure` flag (must be `false` in development)
2. Verify `withCredentials: true` on frontend
3. Check CORS configuration
4. Verify backend sets cookies correctly

```typescript
// Backend should set cookies:
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // false in dev
  sameSite: 'strict',
});
```

---

### Issue 3: 403 CSRF Error on Valid Request

**Symptom:** `CSRF token invalid` error on authenticated request

**Solution:**

1. Verify CSRF token is included in header:

```javascript
headers: {
  'x-csrf-token': getCsrfToken() // Read from cookie
}
```

2. Check cookie name matches: `csrf_token`
3. Ensure token is not HttpOnly (frontend needs to read it)

---

### Issue 4: Token Refresh Loop

**Symptom:** Infinite refresh requests in Network tab

**Solution:**

1. Check refresh endpoint doesn't trigger interceptor
2. Verify refresh returns 200 on success
3. Ensure retry logic has proper guards:

```typescript
if (!originalRequest.headers['X-Retry']) {
  originalRequest.headers['X-Retry'] = 'true';
  // retry logic
}
```

---

### Issue 5: LocalStorage Still Used

**Symptom:** Tokens found in localStorage after login

**Solution:**

1. Clear browser storage: DevTools → Application → Clear Storage
2. Verify frontend code doesn't use localStorage:

```bash
# Search for localStorage usage
grep -r "localStorage\.(get|set).*[Tt]oken" apps/frontend
```

3. Update any remaining code to use cookies

---

## Additional Resources

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [HttpOnly Cookie Security](https://owasp.org/www-community/HttpOnly)
- [SameSite Cookie Attribute](https://web.dev/samesite-cookies-explained/)

---

## Test Results Template

Use this template to document test results:

```markdown
## Test Run: [Date]

**Environment:** Development / Staging / Production
**Tester:** [Name]
**Backend Version:** [Git commit hash]
**Frontend Version:** [Git commit hash]

### Results

| Test | Status | Notes |
|------|--------|-------|
| Registration Flow | ✅ Pass | - |
| Login Flow | ✅ Pass | - |
| Authenticated API Call | ✅ Pass | - |
| CSRF Protection | ✅ Pass | - |
| Token Refresh | ✅ Pass | - |
| Logout | ✅ Pass | - |
| CSRF Attack Simulation | ✅ Pass | Attack blocked |
| XSS Protection | ✅ Pass | Tokens not accessible |

**Overall:** ✅ All tests passed

**Issues Found:** None

**Recommendations:** None
```

---

## Quick Smoke Test

For rapid testing, use this minimal sequence:

```bash
# 1. Start services
npm run dev

# 2. Run automated test
cd apps/backend
tsx src/scripts/test-auth-flow.ts

# 3. Manual verification
# - Open browser to http://localhost:3000
# - Register new account
# - Check DevTools → Cookies
# - Verify HttpOnly flags
# - Check localStorage (should be empty)
# - Logout
# - Verify cookies cleared
```

**Expected:** All green, 8/8 tests pass ✅
