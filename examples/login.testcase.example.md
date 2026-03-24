# Test Cases: Login

**Feature:** login
**Total Cases:** 35
**Layers:** UI, Functional, API, Security, Data
**Generated from:** login.feature.md

## UI Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-LOGIN-001 | Verify email input field is present on /login | — | Email input with type="email" or type="text" is visible |
| TC-LOGIN-002 | Verify password input field is present on /login | — | Password input with type="password" is visible |
| TC-LOGIN-003 | Verify "Sign In" button is present | — | Button with text "Sign In" is visible and enabled |
| TC-LOGIN-004 | Verify password field masks input | $password: "Test@123" | Characters display as dots/asterisks |
| TC-LOGIN-005 | Verify error message styling on failed login | $username: valid, $password: wrong | Error message is visible, red colored, readable |
| TC-LOGIN-006 | Verify loading state during login | $username: valid, $password: valid | Button shows loading indicator while API call in progress |

## Functional Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-LOGIN-010 | Enter valid credentials and click Sign In | $username: valid, $password: valid | Redirect to /dashboard, welcome message shown |
| TC-LOGIN-011 | Enter valid username, wrong password | $username: valid, $password: wrong | Error "Invalid credentials", stay on /login |
| TC-LOGIN-012 | Enter wrong username, valid password | $username: wrong, $password: valid | Error "Invalid credentials", stay on /login |
| TC-LOGIN-013 | Submit with empty username | $username: empty, $password: valid | Validation "Email is required" |
| TC-LOGIN-014 | Submit with empty password | $username: valid, $password: empty | Validation "Password is required" |
| TC-LOGIN-015 | Submit with both fields empty | $username: empty, $password: empty | Both validation messages shown |
| TC-LOGIN-016 | Login while already logged in | Already has valid token | Old token invalidated, new token issued |
| TC-LOGIN-017 | Verify redirect to dashboard after login | $username: valid, $password: valid | URL is /dashboard, page loads correctly |

## API Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-LOGIN-020 | Verify response status code on success | Valid credentials | HTTP 200 |
| TC-LOGIN-021 | Verify response status code on failure | Invalid credentials | HTTP 401 |
| TC-LOGIN-022 | Verify response body on success | Valid credentials | Body contains userId, email, token |
| TC-LOGIN-023 | Verify response headers | — | Content-Type: application/json, CORS headers present |
| TC-LOGIN-024 | Verify rate limiting on login endpoint | 100 requests in 1 min | HTTP 429 after threshold |
| TC-LOGIN-025 | Verify user info returned in response | Valid credentials | Response contains userId, email, role |

## Security Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-LOGIN-030 | SQL injection in username | $username: `' OR 1=1--`, $password: any | Error message, no DB bypass, no token |
| TC-LOGIN-031 | XSS in username | $username: `<script>alert(1)</script>`, $password: any | Input sanitized, no script execution |
| TC-LOGIN-032 | Brute force — multiple failed attempts | $username: valid, $password: wrong x5 | Account locked / captcha triggered |
| TC-LOGIN-033 | Verify password not in plain text in request | — | Network request shows hashed/encrypted password |
| TC-LOGIN-034 | Verify HTTPS on login endpoint | — | Request uses TLS, no HTTP fallback |
| TC-LOGIN-035 | Verify failed attempts logged | $username: valid, $password: wrong x3 | DB audit log has 3 failed attempt records |

## Data Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-LOGIN-040 | Verify auth token stored after login | — | Token exists in localStorage/cookie |
| TC-LOGIN-041 | Verify token is valid JWT format | — | Token has valid header.payload.signature |
| TC-LOGIN-042 | Verify token stored in database | — | DB session table has matching token for user |
| TC-LOGIN-043 | Verify token expiry is set correctly | — | Token expires in expected duration (e.g., 24h) |
| TC-LOGIN-044 | Verify refresh token issued | — | Refresh token exists alongside access token |
| TC-LOGIN-045 | Use expired token to access dashboard | Expired token | Redirect to login, HTTP 401 |
| TC-LOGIN-046 | Verify token revoked after logout | — | Token removed from DB and client |
| TC-LOGIN-047 | Concurrent login from 2 devices | Same credentials, 2 sessions | Both active OR first session invalidated (per spec) |
| TC-LOGIN-048 | Verify no token stored on failed login | Invalid credentials | No token in localStorage/cookie/DB |
