---
name: test-maintainer
description: Detect discrepancies between specs, test artifacts, and the live application — never auto-fixes, always reports
---

# Test Maintainer

Detect discrepancies between specs, test artifacts, and the live application. Acts as a discrepancy detector — reports findings but never auto-fixes tests.

## Core Principle

> **Argus trusts the spec, not the code.** If the app doesn't match the spec, that's a finding (potential bug), not a reason to update tests. The tester decides what's correct.

## Prerequisites

- `.argus/config.yaml` must exist
- Feature files must exist in `.argus/features/`
- For live app checks: Playwright browser must be available
- For offline mode: Only staleness and consistency checks run

## Input

The user provides:
1. **Feature ID** — which feature to check (e.g., "login", "checkout")
2. **Live app URL** (optional) — enables spec vs app comparison and selector validation
3. **Scope** (optional) — "full" (default) or specific sections: "selectors", "staleness", "spec-vs-app"

## Process

### Step 1: Load Artifacts
Read all artifacts related to the feature:
- `.argus/features/<id>.feature.md` — the spec (source of truth)
- `.argus/test-cases/<id>.testcase.md` — generated test cases
- `.argus/automation/*/pages/<id>.*` — page objects
- `.argus/automation/*/specs/<id>.*` — test specs
- `.argus/flows/*.flow.yaml` — any flows referencing this feature

### Step 2: Spec vs App Comparison (URL required)
1. Navigate to the feature's page via Playwright
2. For each element/behavior documented in the spec:
   - Check if it exists in the live DOM
   - Compare text content, attributes, behavior
   - Record matches and mismatches
3. For elements in the app but NOT in the spec:
   - Record as "New in App" (undocumented)

### Step 3: Selector Validation (URL required)
1. For each selector in page objects:
   - Query the selector in the live DOM
   - If not found: mark as broken, search for similar elements and suggest alternatives
   - If found: mark as valid

### Step 4: Staleness Detection (works offline)
1. Check modification timestamps across the dependency chain:
   - feature.md → testcase.md → page objects → test specs → flows → suites
2. If upstream artifact is newer than downstream:
   - Flag downstream as potentially stale

### Step 5: Consistency Check (works offline)
1. Feature file references valid scenario IDs
2. Test cases reference scenarios that exist in the feature file
3. Page objects cover elements mentioned in test cases
4. Flows reference features that exist

### Step 6: Generate Report
Compile findings following `schemas/maintenance.schema.md`.

## Offline Mode

When no URL is provided:
- Steps 2 and 3 are skipped
- Report sections for spec vs app and broken selectors show: "Requires live app URL"
- Staleness detection and consistency checks run normally

## Output

Save report to: `.argus/reports/maintenance/<feature-id>.maintenance.md`

Reference example: `examples/login.maintenance.example.md`
Reference schema: `schemas/maintenance.schema.md`

## After Maintenance Check

Present findings with decision points:

```
Maintenance check complete for login. Status: CRITICAL.

Found:
- 2 spec vs app discrepancies
- 1 broken selector
- 2 undocumented elements
- 2 stale artifacts

For each discrepancy, I need your decision:

1. Submit button: spec says "Submit", app shows "Log in"
   A) Spec is correct → file a bug
   B) App is correct → update the spec
   C) There's a CR for this → give me the CR

2. Error message: spec says "Invalid credentials", app shows "Invalid email or password"
   A) Spec is correct → file a bug
   B) App is correct → update the spec
   C) There's a CR for this → give me the CR
```

After tester decisions:

```
Want me to:
  A) Update the feature file with your decisions → then regenerate downstream artifacts
  B) File bugs for spec-is-correct items → invokes bug-reporter
  C) Regenerate stale artifacts → invokes test-case-creator, page-object-generator
  D) Done — I'll handle the updates manually
```

## Human-in-the-Loop

- **Before checking:** Confirm feature ID and whether live URL is available
- **Discrepancy decisions:** Each spec vs app mismatch requires tester input — the agent never assumes which is correct
- **After checking:** Tester decides which actions to take (update spec, file bugs, regenerate artifacts)
- **Never auto-fixes:** The agent reports findings. The tester owns the decisions.
