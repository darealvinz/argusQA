---
id: login-maintenance
feature: login
url: https://staging.myapp.com/login
timestamp: 2026-03-22T09:00:00Z
spec_discrepancies: 2
broken_selectors: 1
stale_artifacts: 2
new_in_app: 2
missing_from_app: 1
status: critical
---

# Test Maintenance Report: Login

## Summary

Checked login feature against live app at `https://staging.myapp.com/login`. Found **2 spec discrepancies**, **1 broken selector**, **1 missing element**, **2 undocumented elements**, and **2 stale artifacts**. Status: **CRITICAL**.

## Spec vs App Discrepancies

| Element | Spec Says | App Shows | Test Status | Action Needed |
|---------|-----------|-----------|-------------|---------------|
| Submit button text | "Submit" | "Log in" | ❌ Failing | CR or Bug? |
| Error message | "Invalid credentials" | "Invalid email or password" | ❌ Failing | CR or Bug? |
| Password field | type="password" | type="password" | ✅ Matching | None |
| Email placeholder | "Email address" | "Enter your email" | ⚠️ Not tested | CR or Bug? |

## Broken Selectors

| Page Object | Selector | Status | Suggestion |
|-------------|----------|--------|------------|
| login.page.ts | `#submit-btn` | ❌ Not found | Found `button[type="submit"]` — confirm if same element |
| login.page.ts | `#email` | ✅ Found | — |
| login.page.ts | `#password` | ✅ Found | — |
| login.page.ts | `.error-message` | ✅ Found | — |

## Missing from App

- **"Forgot password" link** — specified in `login.feature.md` scenario `login-forgot-password` but not found in DOM. May have been removed or relocated.

## New in App

- **"Sign in with Google" button** (`button.sso-google`) — not in any spec or CR
- **"Remember me" checkbox** (`input#remember-me`) — not in any spec or CR

## Stale Artifacts

| Artifact | Last Updated | Upstream Changed | Status |
|----------|-------------|-----------------|--------|
| login.testcase.md | 2026-03-10 | login.feature.md updated 2026-03-20 | ⚠️ May be outdated |
| login.page.ts | 2026-03-05 | login.testcase.md updated 2026-03-10 | ⚠️ May be outdated |
| login.spec.ts | 2026-03-05 | login.testcase.md updated 2026-03-10 | ⚠️ May be outdated |
| happy-purchase.flow.yaml | 2026-03-22 | — | ✅ Current |

## Recommendation

**Status: CRITICAL** — Action needed before running tests.

1. **2 spec discrepancies** need resolution — confirm whether the spec or app is correct for button text and error message
2. **1 broken selector** — `#submit-btn` not found, likely changed to `button[type="submit"]`. Update page object after confirming.
3. **1 missing element** — "Forgot password" link not in DOM. Confirm if removed intentionally.
4. **2 undocumented elements** — Google SSO and Remember Me are live but not in any spec. Add to spec or confirm removal planned.
5. **2 stale artifacts** — Test cases and page objects are older than the feature file. Regenerate after resolving discrepancies.

**Suggested workflow:**
1. Resolve spec discrepancies (decide CR or Bug for each)
2. Update feature file with new elements (Google SSO, Remember Me) if they should be tested
3. Regenerate test cases (`test-case-creator`)
4. Regenerate page objects (`page-object-generator`)
5. Re-run maintenance check to verify health
