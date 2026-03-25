---
name: bug-reporter
description: Use when a test fails or verification finds an issue — auto-drafts bug tickets with steps to reproduce, evidence, and severity
---

# Bug Reporter

Auto-draft bug tickets when tests fail, UI verification finds mismatches, or accessibility checks find violations. Produces structured bug reports that can be pushed to Jira or saved as markdown.

## When to Use

- `test-runner` reports failed test cases
- `ui-verifier` finds design mismatches
- `accessibility-checker` finds WCAG violations
- User manually reports an issue found during testing

## Process

### Step 1: Gather Failure Context

Collect all available information about the failure:
- **TestcaseID** that failed (if from test-runner)
- **Error message** and stack trace
- **Screenshots** (if captured)
- **Console errors** (if captured)
- **Environment details** (browser, device, URL)
- **Steps that were executed** (from the test case)
- **Expected vs actual result**

### Step 2: Determine Severity

Apply severity guidelines:

| Severity | Criteria |
|----------|----------|
| **Critical** | App crashes, data loss, security vulnerability, complete feature broken |
| **Major** | Feature partially broken, workaround exists but painful |
| **Minor** | Cosmetic issue, minor UX problem, edge case failure |
| **Trivial** | Typo, alignment off by 1px, non-user-facing issue |

Present the suggested severity to the user — they have final say.

### Step 3: Draft Bug Report

Generate a bug report following `schemas/bugreport.schema.md`:
- Clear, specific title
- Steps to reproduce (numbered, anyone can follow)
- Expected result (from the spec/test case)
- Actual result (from the test execution)
- Evidence (screenshots, console errors, network responses)
- Related test cases and features

### Step 4: Present for Review

Show the draft bug report. The user can:
- Approve as-is
- Edit severity, title, or description
- Add additional context
- Reject (not a real bug)

### Step 5: Save or Push

Based on configuration:
- **Markdown:** Save to `.argus/reports/bugs/BUG-<NUMBER>.report.md`
- **Jira:** Push to Jira via `jira-connector` (if configured and enabled)
- **Both:** Save markdown locally AND push to Jira

Auto-increment bug number based on existing bug reports in `.argus/reports/bugs/`.

## Batch Mode

When `test-runner` reports multiple failures:
1. List all failures with suggested severity
2. Ask: "Draft bug reports for all, critical only, or select individually?"
3. Generate all selected reports
4. Present each for review (or batch-approve)

## Anti-Patterns

- **Don't auto-file without review** — always present the draft first
- **Don't write vague reproduction steps** — "click the button" is not enough. Which button, on which page, with what data?
- **Don't guess severity** — propose based on guidelines, but the tester decides
- **Don't duplicate bugs** — check existing bug reports before creating a new one

## Integration

- **Reads from:** Test execution results, `.argus/test-cases/`, `.argus/features/`
- **Produces:** `.argus/reports/bugs/BUG-<NUMBER>.report.md`
- **Can push to:** Jira (via `jira-connector`)
- **Consumed by:** `report-generator` (aggregates bugs into reports)

Reference example: `examples/bug-001.report.example.md`
