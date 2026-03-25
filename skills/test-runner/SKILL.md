---
name: test-runner
description: Use when you need to execute automation tests — runs test specs against configured environments with full traceability back to test case IDs
---

# Test Runner

Execute generated automation tests against configured environments and the browser/device matrix. Provides full traceability from test results back to TestcaseIDs.

## When to Use

- User says "run the login tests" or "run the smoke suite"
- After generating page objects and test specs
- As part of CI/CD pipeline execution

## Process

### Step 1: Determine What to Run

Ask the user what to execute:

**A) Single feature:** Run all test specs for one feature
- Reads from: `.argus/automation/<target>/specs/<feature>.spec.*`

**B) Suite:** Run a composed suite
- Reads from: `.argus/suites/<suite-name>.suite.yaml`
- Resolves which specs and scenarios to include

**C) Flow:** Run a specific E2E flow
- Reads from: `.argus/flows/<flow-name>.flow.yaml`

**D) All:** Run everything

### Step 2: Read Configuration

1. Read `.argus/config.yaml` for stack, environments, browsers, devices
2. Read `.argus/test-plan.md` for the test matrix
3. Determine the test runner command based on `config.stack.testRunner`:
   - `vitest` → `npx vitest run`
   - `jest` → `npx jest`
   - `pytest` → `pytest`
   - `junit` → `mvn test`

### Step 3: Configure Execution

Based on the test plan and suite:
- **Environment:** Which URL to test against (dev/staging/prod)
- **Browsers:** Which browsers to launch (from suite or test plan)
- **Devices:** Which device viewports to emulate
- **Retries:** Configurable max retries for flaky test detection (default: 1)
- **Parallel:** Whether to run in parallel (based on framework support)

### Step 4: Execute

Run the tests using the configured test runner. Capture:
- Pass/fail per test case (linked back to TestcaseID)
- Error messages and stack traces for failures
- Screenshots on failure (if supported by framework)
- Console errors captured during execution
- Execution time per test
- Browser/device used for each test
- Retry information (which tests were retried, final result)

### Step 5: Present Results

Show execution results:

```markdown
## Test Execution Results

**Suite:** Smoke Suite
**Environment:** staging (https://staging.myapp.com)
**Duration:** 2m 34s

### Summary
| Status | Count |
|--------|-------|
| ✅ Passed | 18 |
| ❌ Failed | 2 |
| ⏭️ Skipped | 0 |
| 🔄 Retried | 1 |

### Failed Tests
| TestcaseID | Test | Error | Screenshot |
|------------|------|-------|------------|
| TC-LOGIN-032 | Brute force protection | No lockout after 5 attempts | ./screenshots/TC-LOGIN-032.png |
| TC-CHECKOUT-015 | Empty cart checkout | Button not disabled | ./screenshots/TC-CHECKOUT-015.png |

### Retried Tests
| TestcaseID | Attempts | Final Result |
|------------|----------|-------------|
| TC-PAYMENT-021 | 2 | ✅ Passed |

### Browser/Device Breakdown
| Browser | Device | Passed | Failed |
|---------|--------|--------|--------|
| Chrome | Desktop | 17 | 1 |
| Chrome | iPhone 14 | 1 | 1 |
```

### Step 6: Offer Next Actions

Based on results:
- **All passed:** "All tests passed. Generate a report?" → invokes `report-generator`
- **Some failed:** "2 tests failed. Options:"
  - A) Draft bug reports for failures → invokes `bug-reporter`
  - B) Retry failed tests only
  - C) View failure details
  - D) Generate report including failures → invokes `report-generator`

## Anti-Patterns

- **Don't run against production without explicit confirmation** — always confirm the environment
- **Don't hide flaky tests** — report retries transparently
- **Don't lose traceability** — every result must link back to a TestcaseID
- **Don't auto-file bugs** — present failures and let the tester decide

## Integration

- **Reads from:** `.argus/automation/`, `.argus/suites/`, `.argus/flows/`, `.argus/config.yaml`, `.argus/test-plan.md`
- **Produces:** Execution results (displayed, not saved as artifact — fed to `report-generator` and `bug-reporter`)
- **Triggers:** `bug-reporter` (on failure), `report-generator` (on completion)
