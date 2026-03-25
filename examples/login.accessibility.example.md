---
id: login-accessibility
feature: login
url: https://staging.myapp.com/login
timestamp: 2026-03-21T11:00:00Z
wcag_level: AA
input_type: url
total_issues: 4
critical_issues: 1
status: fail
---

# Accessibility Report: Login

## Summary

Checked WCAG AA compliance for login page at `https://staging.myapp.com/login`. Found **4 issues** (1 critical, 2 serious, 1 moderate). Status: **FAIL**.

## Automated Checks (axe-core)

| # | Rule | Impact | Element | Description | WCAG Criteria |
|---|------|--------|---------|-------------|---------------|
| 1 | color-contrast | critical | `.forgot-password a` | Text color #9CA3AF on #FFFFFF has ratio 2.6:1 (needs 4.5:1) | 1.4.3 Contrast |
| 2 | label | serious | `input#remember-me` | Checkbox has no associated label | 1.3.1 Info and Relationships |
| 3 | button-name | serious | `button.toggle-password` | Button has no accessible name | 4.1.2 Name, Role, Value |

## Visual Checks (AI Vision)

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | Focus indicators | ⚠️ Partial | Login button shows focus ring, but email/password inputs have no visible focus indicator |
| 2 | Logical reading order | ✅ Pass | Content flows logically top-to-bottom |
| 3 | Touch target sizing | ✅ Pass | All interactive elements ≥44x44px |
| 4 | Text over images | ✅ Pass | No text overlaid on images |

## Color Contrast

| Element | Foreground | Background | Ratio | Required | Status |
|---------|------------|------------|-------|----------|--------|
| Login button text | #FFFFFF | #2563EB | 4.9:1 | 4.5:1 | ✅ Pass |
| Email label | #374151 | #FFFFFF | 10.3:1 | 4.5:1 | ✅ Pass |
| Forgot password link | #9CA3AF | #FFFFFF | 2.6:1 | 4.5:1 | ❌ Fail |
| Placeholder text | #9CA3AF | #F9FAFB | 2.4:1 | 4.5:1 | ❌ Fail |

## Heading Hierarchy

- h1: "Log in to MyApp"

No hierarchy issues — single page with one heading level.

## Form Accessibility

| Field | Label | ARIA | Required Indicator | Error Handling | Status |
|-------|-------|------|--------------------|----------------|--------|
| Email | ✅ `<label for="email">` | — | ✅ `required` attr | ✅ `aria-describedby` links error msg | ✅ Pass |
| Password | ✅ `<label for="password">` | — | ✅ `required` attr | ✅ `aria-describedby` links error msg | ✅ Pass |
| Remember me | ❌ No label | ❌ No aria-label | — | — | ❌ Fail |

## Keyboard Navigation

| Action | Key | Expected Behavior | Status |
|--------|-----|-------------------|--------|
| Tab through form | Tab | Focus moves: email → password → show password → remember me → login → forgot password → Google SSO | ✅ Pass |
| Submit form | Enter | Submits when focused on login button or within form | ✅ Pass |
| Toggle show password | Space | Toggles visibility when button focused | ✅ Pass |
| Focus visible | Tab | All elements show focus indicator | ⚠️ Partial — inputs missing focus ring |

## Dynamic Content Accessibility

| Component | Type | ARIA Role | Focus Trap | Announce | Status |
|-----------|------|-----------|------------|----------|--------|
| Error toast | Toast | ❌ No role="alert" | — | ❌ Not announced | ❌ Fail |
| CAPTCHA modal | Modal | ✅ role="dialog" | ✅ Yes | ✅ aria-labelledby | ✅ Pass |

## Recommendation

**Status: FAIL** — 4 issues must be resolved for WCAG AA compliance.

**Priority fixes:**
1. **Critical:** Fix forgot password link contrast — change color from #9CA3AF to #6B7280 or darker (ratio ≥ 4.5:1)
2. **Serious:** Add `<label>` or `aria-label` to "Remember me" checkbox
3. **Serious:** Add `aria-label="Toggle password visibility"` to show password button
4. **Moderate:** Add visible focus indicators to email and password inputs (e.g., `outline: 2px solid #2563EB`)
5. **Moderate:** Add `role="alert"` to error toast for screen reader announcement
