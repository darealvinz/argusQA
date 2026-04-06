---
id: discovery-login
scope: Login flow
url: https://staging.myapp.com/login
timestamp: 2026-03-20T14:30:00Z
auth_method: none
pages_discovered: 4
fields_discovered: 5
max_depth_reached: 3
status: complete
---

# Discovery Report: Login Flow

## Summary

Explored the login flow starting from `https://staging.myapp.com/login`. Discovered 4 pages across 3 levels of depth. Exploration completed — no new pages found beyond depth 3.

## Pages Discovered

| # | Page | URL | Screenshot | Notes |
|---|------|-----|------------|-------|
| 1 | Login | /login | screenshots/login-01.png | Entry point |
| 2 | Forgot Password | /forgot-password | screenshots/forgot-01.png | Linked from login |
| 3 | Reset Confirmation | /forgot-password/sent | screenshots/reset-confirm-01.png | After submitting email |
| 4 | Dashboard | /dashboard | screenshots/dashboard-01.png | After successful login |

## UI Elements Found

### Login Page (/login)

| Element | Selector | Type | Interactive | Notes |
|---------|----------|------|-------------|-------|
| Email field | input#email | input | Yes | type="email", placeholder="Enter your email" |
| Password field | input#password | input | Yes | type="password" |
| Show password toggle | button.toggle-password | button | Yes | Toggles password visibility |
| Login button | button[type="submit"] | button | Yes | Text: "Log in" |
| Forgot password link | a[href="/forgot-password"] | link | Yes | Text: "Forgot password?" |
| Google SSO button | button.sso-google | button | Yes | Text: "Sign in with Google" |
| Remember me checkbox | input#remember-me | checkbox | Yes | Default: unchecked |

### Dashboard Page (/dashboard)

| Element | Selector | Type | Interactive | Notes |
|---------|----------|------|-------------|-------|
| Welcome message | h1.welcome | text | No | Shows "Welcome, {name}" |
| Logout button | button#logout | button | Yes | Top-right corner |
| Navigation menu | nav.main-nav | navigation | Yes | 5 menu items |

## API Calls Observed

| Method | Endpoint | Status | Response Type | Notes |
|--------|----------|--------|---------------|-------|
| POST | /api/auth/login | 200 | JSON | Returns JWT + user profile |
| POST | /api/auth/login | 401 | JSON | Invalid credentials response |
| POST | /api/auth/forgot-password | 200 | JSON | Accepts email, returns success |
| GET | /api/user/profile | 200 | JSON | Called after login redirect |

## Behaviors Noted

- Login form validates email format client-side before submission
- Failed login shows inline error: "Invalid email or password" with red border on both fields
- After 3 failed attempts, a CAPTCHA appears (Google reCAPTCHA v2)
- Successful login redirects to /dashboard with 302
- "Show password" toggle switches input type between password and text
- Google SSO opens a popup window for OAuth flow

## Destructive Actions Found

| Action | Location | Why Flagged |
|--------|----------|-------------|
| Delete Account | /dashboard → Settings | Button found in settings page, not clicked |

## Questions for Tester

- Is the CAPTCHA after 3 attempts documented in the spec? Could not find a reference.
- Google SSO popup — should we test the full OAuth flow or just verify the redirect?
- "Remember me" checkbox — what is the expected session duration when checked vs unchecked?
- The dashboard has a "Delete Account" button — should this be explored manually?

## Field Specifications Discovered

### Login Page (/login)

| Field | Label | Type | Required | Constraints | Options | Help Text | Error Container | Visibility | Notes |
|-------|-------|------|----------|-------------|---------|-----------|-----------------|------------|-------|
| `input#email` | Email Address | email | Yes | maxlength=255 | — | — | `.email-error` | visible | autocomplete=email |
| `input#password` | Password | password | Yes | minlength=8, maxlength=128 | — | — | `.password-error` | visible | autocomplete=current-password |
| `button.toggle-password` | — | button | — | — | — | — | — | visible | Toggles password visibility |
| `input#remember-me` | Remember me | checkbox | No | — | — | Stay signed in for 30 days | — | visible | Default: unchecked |

### Forgot Password Page (/forgot-password)

| Field | Label | Type | Required | Constraints | Options | Help Text | Error Container | Visibility | Notes |
|-------|-------|------|----------|-------------|---------|-----------|-----------------|------------|-------|
| `input#reset-email` | Email Address | email | Yes | maxlength=255 | — | Enter the email associated with your account | `.reset-error` | visible | autocomplete=email |
