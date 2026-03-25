---
name: suite-composer
description: Use when you need to build a test suite — composes smoke, sanity, regression, or full suites by selecting test cases based on type and context
---

# Suite Composer

Build targeted test suites by selecting the right test cases based on suite type and context. Each suite type uses a different selection strategy.

## When to Use

- User says "build a smoke suite" or "regression for PR #456"
- Before a release (full suite)
- After a bug fix (sanity suite)
- Before deploying to staging (smoke suite)

## Process

### Step 1: Determine Suite Type

Ask the user which type:

| Type | When to use | What it tests |
|------|------------|--------------|
| **Smoke** | Quick health check | Core happy paths only |
| **Sanity** | After a fix | Fix area + neighbors |
| **Regression** | After changes | Impact analysis across system |
| **Full** | Before release | Everything |

### Step 2: Read Inputs

1. Read all feature files from `.argus/features/`
2. Read all test case files from `.argus/test-cases/`
3. Read all flow files from `.argus/flows/`
4. Read the test plan from `.argus/test-plan.md`
5. For regression: ask for the PR number, commit, or description of what changed

### Step 3: Compose Suite

#### Smoke Suite
- Select 1 happy-path scenario per feature (the most critical one)
- Include 1 happy-path E2E flow (e.g., login → purchase)
- Use P0 browser/device only
- Target: 5-10% of total test cases, 2-5 min run time

#### Sanity Suite
- All test cases for the changed/fixed feature
- Happy-path only for features directly linked via `depends_on`/`next`
- Skip unrelated features
- Target: 10-20% of total test cases, 5-10 min run time

#### Regression Suite
Perform layered impact analysis:

1. **Layer 1 — Direct Impact:** All cases for directly affected features (from code change / PR diff)
2. **Layer 2 — Dependency Impact:** Cases for features with `depends_on`/`next` links to affected features
3. **Layer 3 — Shared Component Impact:** Cases for features sharing changed components/utilities
4. **Layer 4 — Risk-Based Priority:** Categorize all affected cases:
   - **P0 (must run):** Direct impact + critical paths
   - **P1 (should run):** Dependency impact + secondary paths
   - **P2 (can skip):** Low-risk, no direct connection

Generate a regression analysis report alongside the suite:
```markdown
## Regression Analysis: PR #[number] — "[title]"

### Change Summary
- Modified: [list of changed files]

### Impact Assessment
| Impact Level | Feature | Reason | Test Cases |
|---|---|---|---|
| 🔴 Direct | [feature] | Changed file is in this feature | [count] |
| 🟠 Dependency | [feature] | depends_on: [related] | [count] |
| 🟡 Shared | [feature] | Uses [shared utility] | [count] |

### Recommended Run
| Priority | Cases | Est. Time |
|---|---|---|
| P0 only | [count] | ~[time] |
| P0 + P1 | [count] | ~[time] |
| Full regression | [count] | ~[time] |
```

#### Full Suite
- All test cases, all features, all layers
- All browsers and devices from test plan
- All flows
- Target: 100% of test cases, 30-60 min run time

### Step 4: Present for Review

Show the suite with:
- Suite type and trigger
- Total cases selected
- Estimated run time
- For regression: the impact analysis
- Cases/features intentionally skipped (with reasons)

Wait for user approval.

### Step 5: Save

Save to `.argus/suites/<suite-name>.suite.yaml`. Follow the format in `schemas/suite.schema.md`.

Reference examples: `examples/smoke.suite.example.yaml`, `examples/regression-pr-456.suite.example.yaml`

## Anti-Patterns

- **Don't include everything in a smoke suite** — smoke is fast and focused, not a mini-regression
- **Don't skip the impact analysis for regression** — guessing what to test defeats the purpose
- **Don't auto-run after composing** — always present the suite for review first
- **Don't ignore the skip reasons** — explicitly document why features are excluded

## Integration

- **Reads from:** `.argus/features/`, `.argus/test-cases/`, `.argus/flows/`, `.argus/test-plan.md`
- **Produces:** `.argus/suites/<suite-name>.suite.yaml`
- **Consumed by:** `test-runner` (executes the suite), `report-generator` (reports on suite results)
