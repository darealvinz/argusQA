# Argus — Design Specification

> *Named after the 100-eyed giant of Greek mythology — the ultimate watchman who sees everything and misses nothing.*

## Overview

**Argus** is a skill pack for coding agents (Claude Code, Cursor, etc.) that provides QA/testing superpowers. It follows the same plugin architecture as [Superpowers](https://github.com/obra/superpowers) — skills are installed once at the agent level and activate on demand within any project.

The framework takes an **AI-first, human-in-the-loop** approach: AI generates test artifacts (test plans, test cases, page objects, flows), but the tester reviews and approves at every step before moving forward.

## Problem Statement

QA testers spend significant time on repetitive tasks:
- Reading specs and translating them into test cases
- Writing page objects and automation boilerplate
- Composing end-to-end flows from individual features
- Verifying UI against designs
- Reporting bugs with proper context

An AI agent with QA-specific skills can handle the generation while the tester focuses on review, judgment, and edge case thinking.

## Getting Started

### Installation

**Claude Code (recommended):**
```bash
npx skills add ToolsByMe/argus
```

**Or clone manually:**
```bash
git clone https://github.com/ToolsByMe/argus.git ~/.claude/skills/argus
cd ~/.claude/skills/argus && ./setup
```

**Cursor / Windsurf:**
```bash
npx skills add ToolsByMe/argus
```

**OpenClaw / ClawHub:**
```bash
clawhub install argus
```

### First-Time Setup

After installing, open your project directory and talk to the agent:

```
You: "Set up Argus for this project"
```

The agent will:
1. Create the `.argus/` folder in your project root
2. Walk you through `config.yaml` setup interactively:

```
Agent: "What language does your project use?"
You: "TypeScript"

Agent: "What web testing framework do you prefer?"
  A) Playwright
  B) Cypress
  C) Selenium
  D) None
You: "A"

Agent: "What browsers should we test?"
You: "Chrome and Firefox"

Agent: "What environments do you have?"
You: "Dev at dev.myapp.com, staging at staging.myapp.com"

Agent: "Do you use Jira?"
You: "Yes, project key is MYAPP at myteam.atlassian.net"
```

3. Generate `.argus/config.yaml` based on your answers
4. Done — skills are ready to use

### Quick Start Paths

**Path A: New project (no app yet)**
```
You: "Set up Argus for this project"        → creates .argus/config.yaml
You: "Create a test plan"                    → test-planner generates test-plan.md
You: "Analyze this spec: [paste spec]"       → spec-analyzer generates feature file
You: "Generate test cases for login"         → test-case-creator generates test cases
You: "Generate page objects for login"       → page-object-generator generates automation code
```

**Path B: Existing project (app is running)**
```
You: "Set up Argus for this project"         → creates .argus/config.yaml
You: "Explore the login flow on staging"     → exploratory-tester discovers the app
You: "Create a test plan"                    → test-planner generates test-plan.md
You: "Analyze this spec: [paste spec]"       → spec-analyzer generates feature file (with exploration context)
You: "Generate test cases for login"         → test-case-creator generates test cases
```

**Path C: Quick one-off (just need test cases)**
```
You: "Set up Argus for this project"         → creates .argus/config.yaml
You: "Here's the login spec: [paste spec]. Generate test cases."
     → spec-analyzer + test-case-creator run in sequence
```

### Example First Session

```
You: "Set up Argus for this project"
Agent: Created .argus/config.yaml with your settings. ✓

You: "I have a Jira ticket LOGIN-42 for the login feature"
Agent: Pulled ticket LOGIN-42 from Jira. Here's what I found:
       - Title: User Login with Email/Password
       - Acceptance Criteria: [lists them]
       - Shall I analyze this and create a feature file?

You: "Yes, analyze it"
Agent: Created .argus/features/login.feature.md
       - 6 scenarios identified (1 happy, 3 negative, 2 security)
       - Please review. Want me to proceed with test cases?

You: "Looks good, generate test cases"
Agent: Created .argus/test-cases/login.testcase.md
       - 35 test cases across 4 layers (UI, Functional, API, Security)
       - Skipped Data layer — ticket doesn't mention DB/token storage
       - Please review. Shall I add Data layer cases or generate page objects?

You: "Add token verification cases, then generate page objects"
Agent: Updated login.testcase.md with 5 Data layer cases (40 total)
       Created .argus/automation/web/pages/login.page.ts
       Created .argus/automation/web/specs/login.spec.ts
       Ready for test execution or further review.
```

## Architecture

### Plugin Model

```
Skills (installed globally in agent)       Project A            Project B
┌──────────────────────────────┐      ┌──────────────┐    ┌──────────────┐
│ exploratory-tester           │      │ .argus/      │    │ .argus/      │
│ test-planner                 │─────→│   config.yaml│    │   config.yaml│
│ spec-analyzer                │      │   features/  │    │   features/  │
│ test-case-creator            │      │   test-cases/│    │   test-cases/│
│ test-data-generator          │      │   suites/    │    │   suites/    │
│ page-object-generator        │      │   flows/     │    │   flows/     │
│ flow-composer                │      │   reports/   │    │   reports/   │
│ suite-composer               │      └──────────────┘    └──────────────┘
│ ui-verifier                  │
│ accessibility-checker        │
│ test-runner                  │
│ test-maintainer              │
│ bug-reporter                 │
│ report-generator             │
│ jira-connector               │
└──────────────────────────────┘
```

- **Skills** are installed once at the agent level (like Superpowers).
- **Project config** lives in `.argus/config.yaml` inside each project repo.
- **Generated outputs** (features, test cases, page objects, flows, reports) live in `.argus/` within the project.
- The agent reads the project config to understand project-specific settings (browsers, devices, environments, etc.).

### Skill Registry (15 Skills)

| #  | Skill                   | Category       | Purpose                                                       |
|----|-------------------------|----------------|---------------------------------------------------------------|
| 1  | `exploratory-tester`    | Discovery      | Explore existing app, discover flows, elements, and API calls |
| 2  | `test-planner`          | Planning       | Define scope: browsers, devices, viewports, environments      |
| 3  | `spec-analyzer`         | Input          | Read spec/ticket → output structured feature file             |
| 4  | `test-case-creator`     | Generation     | Generate test cases across 5 layers                           |
| 5  | `test-data-generator`   | Generation     | Generate realistic test data sets                             |
| 6  | `page-object-generator` | Generation     | Generate automation code (web/mobile/API)                     |
| 7  | `flow-composer`         | Composition    | Compose E2E flows from feature files                          |
| 8  | `suite-composer`        | Composition    | Build test suites (smoke, sanity, regression, full)           |
| 9  | `ui-verifier`           | Verification   | Visual verification — design image vs implementation          |
| 10 | `accessibility-checker` | Verification   | WCAG compliance checks from screenshots                       |
| 11 | `test-runner`           | Execution      | Execute generated automation tests                            |
| 12 | `test-maintainer`       | Maintenance    | Detect broken selectors, spec-vs-code discrepancies, stale tests |
| 13 | `bug-reporter`          | Reporting      | Auto-draft bug tickets when verification fails                |
| 14 | `report-generator`      | Reporting      | Generate consolidated test reports (sprint, feature, daily, release) |
| 15 | `jira-connector`        | Integration    | Pull tickets from Jira                                        |

### Skill Activation

Skills activate based on user intent in conversation:

| User says                                          | Skill triggered          |
|----------------------------------------------------|--------------------------|
| "Explore the login flow on staging"                | `exploratory-tester`     |
| "Set up test plan for this project"                | `test-planner`           |
| "Analyze this spec/ticket"                         | `spec-analyzer`          |
| "Generate test cases for login"                    | `test-case-creator`      |
| "Generate test data for login"                     | `test-data-generator`    |
| "Generate page objects for login"                  | `page-object-generator`  |
| "Build the flow from login to payment"             | `flow-composer`          |
| "Build a smoke suite" / "Regression for PR #456"   | `suite-composer`         |
| "Verify login page against this design" [image]    | `ui-verifier`            |
| "Check accessibility on login page" [screenshot]   | `accessibility-checker`  |
| "Run the login tests" / "Run the smoke suite"      | `test-runner`            |
| "Check if login tests are still valid"             | `test-maintainer`        |
| "Report this as a bug"                             | `bug-reporter`           |
| "Generate sprint report" / "Release readiness"     | `report-generator`       |
| "Pull ticket LOGIN-123"                            | `jira-connector`         |

## Workflow

### Existing Project (app already running)

```
exploratory-tester       ← "Go explore, tell me what you find"
     ↓ (you review discovery report)
test-planner             ← "Define browsers, devices, environments"
     ↓ (you review plan)
spec-analyzer            ← "Analyze this ticket" (with exploration context)
     ↓ (you review feature file)
test-case-creator        ← "Generate test cases"
     ↓ (you review cases)
test-data-generator      ← "Generate test data"
     ↓ (you review data)
page-object-generator    ← "Generate automation code"
     ↓ (you review code)
flow-composer            ← "Compose E2E flows"
     ↓ (you review flows)
suite-composer           ← "Build smoke/sanity/regression/full suite"
ui-verifier              ← "Verify against design"
accessibility-checker    ← "Check WCAG compliance"
test-runner              ← "Run the tests or a suite"
test-maintainer          ← "Check if existing tests are still valid"
bug-reporter             ← "Report failures"
report-generator         ← "Generate sprint/feature/daily/release report"
```

### New Project (no app yet)

```
test-planner             ← Start here (no app to explore)
     ↓
spec-analyzer            ← Analyze from spec/ticket only
     ↓
...rest of pipeline
```

### Key Principle: Human-in-the-Loop

Every generation step pauses for tester review. The AI proposes, the tester approves. Nothing is finalized without sign-off. The tester can invoke any skill at any time — the pipeline order is a recommendation, not a requirement.

## Skill Specifications

### 1. exploratory-tester

**Purpose:** Explore an existing application to build context before writing tests.

**Input:** URL + optional scope (e.g., "login flow", "checkout process")

**Authentication:** The skill reads credentials from `.argus/config.yaml` under the `auth` block. Supported methods:
- `form`: Agent fills login form with provided credentials
- `cookie`: Agent injects session cookies before navigation
- `token`: Agent sets Authorization header for API-only exploration
- Credentials reference environment variables (never stored in plain text in config)

**Process:**
1. Authenticates with the app (if auth config provided)
2. Opens the app via Playwright browser
3. Navigates through the scoped flow (respects depth/breadth limits)
4. Takes screenshots at each step (waits for network idle + 1s stability)
5. Inspects DOM elements and captures selectors
6. Monitors network calls (API requests/responses), filters out third-party scripts
7. Maps out the actual behavior

**Exploration Bounds:**
- **Max pages:** 20 per exploration session (configurable)
- **Max depth:** 5 clicks deep from entry point (configurable)
- **Termination:** Stops when scope is covered, max pages reached, or no new pages found
- **Destructive action policy:** Never clicks delete, submit payment, or form actions that modify data. Flags these as "needs manual exploration" in the report
- **SPA handling:** Detects client-side routing changes as new "pages"
- **Wait strategy:** Waits for network idle + DOM stability before capturing

**Failure Modes:**
- URL unreachable → report error, suggest checking environment config
- Auth fails → report error, suggest checking credentials
- App crashes mid-exploration → save partial report, flag where crash occurred

**Output:** Discovery report (`discovery-<feature>.md`) containing:
- Pages discovered (URL + screenshot)
- UI elements found (element, selector, type)
- API calls observed (method, endpoint, status)
- Behaviors noted (interactions, states, transitions)
- Destructive actions found (flagged for manual exploration)
- Questions for tester (undocumented features, potential issues)

### 2. test-planner

**Purpose:** Define the testing scope and environment configuration before any test generation.

**Input:** Project context (from exploration or spec)

**Output:** Test plan (`test-plan.md`) defining:
- Browser matrix (browser, version, priority)
- Device matrix (device, type, viewport, priority)
- Viewport boundaries (breakpoints: mobile, tablet, desktop, large desktop)
- Test environments (dev, staging, prod URLs)
- Test types included/excluded
- Out of scope items

**This plan feeds into every downstream skill** — `page-object-generator` knows which browsers to target, `test-runner` knows the device matrix, `ui-verifier` knows viewport boundaries.

### 3. spec-analyzer

**Purpose:** Read a spec or ticket and produce a structured feature file.

**Input:** Spec text (pasted manually) or Jira ticket ID (via `jira-connector`)

**Output:** Feature file (`feature-<name>.md`) with frontmatter:

```markdown
---
id: login
tags: [auth, entry-point]
depends_on: []
next: [dashboard, add-to-cart]
scenarios:
  - id: login-success
    type: happy
  - id: login-invalid-credentials
    type: negative
  - id: login-sql-injection
    type: security
---

# Login Feature

## Requirements
(structured requirements extracted from spec)

## Scenarios
(list of identified scenarios with types)
```

### 4. test-case-creator

**Purpose:** Generate comprehensive test cases across all 5 testing layers.

**Input:** Feature file from `spec-analyzer`

**Testing Layers** (AI proposes which layers are relevant per feature; tester confirms):
1. **UI Layer** — Elements, navigation, visual state
2. **Functional Layer** — Behavior, state changes, redirects
3. **API Layer** — Status codes, response body, headers
4. **Security Layer** — Injection, encryption, brute force, rate limiting
5. **Data Layer** — DB records, tokens, sessions

Not every feature requires all 5 layers. A pure API endpoint skips UI Layer. A static page skips Data Layer. The AI analyzes the feature and proposes applicable layers; the tester reviews before generation.

**Output Format:**
```
TestcaseID | Test Step | Test Data | Expected Result
```

**Output:** Test case file (`<feature>.testcase.md`) containing all test cases organized by layer and scenario type (happy, negative, edge, security).

**Example coverage for Login:** ~35+ test cases covering:
- Happy path (login success, token validation, redirect, UI elements)
- Negative cases (wrong credentials, empty fields, no token on failure)
- Security cases (SQL injection, XSS, brute force, HTTPS, password masking in request)
- Edge cases (spaces, case sensitivity, max length, unicode, special characters)
- Session/Token cases (JWT format, DB token, expiry, refresh, concurrent sessions, revocation)
- API level (status codes, headers, rate limiting)

### 5. test-data-generator

**Purpose:** Generate realistic test data sets for test cases.

**Input:** Test cases from `test-case-creator`

**Output:** Test data file (`<feature>.data.json`) containing:
- Valid data sets (happy path scenarios)
- Invalid data sets (negative scenarios)
- Edge case data (boundary values, special characters)
- Security test data (injection strings, XSS payloads)

### 6. page-object-generator

**Purpose:** Generate automation code from test cases and feature files.

**Input:** Feature file + test cases + test plan (browser/device matrix)

**Output:** Automation code for each target:
- **Web:** Playwright page objects + test specs
- **Mobile:** WebdriverIO page objects + test specs
- **API:** API client helpers + test specs

**Code includes:**
- Page object classes with selectors and actions
- Test specs with assertions matching all test case verifications
- Data-driven test support using generated test data
- Cross-browser/device configuration from test plan

### 7. flow-composer

**Purpose:** Compose end-to-end flows by chaining feature files.

**Input:** Feature files with `depends_on`/`next` metadata

**Composition methods:**
- **CLI-style:** `--from login --to payment` → resolves the dependency chain
- **Manual flow file:** User defines exact feature + scenario sequence
- **AI-suggested:** AI reads all features and proposes common flows

**Flow definition format:**
```yaml
name: Happy Purchase Flow
type: happy
steps:
  - feature: login
    scenario: login-success
  - feature: add-to-cart
    scenario: add-single-item
  - feature: checkout
    scenario: checkout-standard
  - feature: payment
    scenario: payment-success
```

**Handles multiple flows and edge cases:**
- Each feature file contains multiple scenarios (happy + edge)
- Flow files pick which scenarios to chain
- A single feature can appear in many flows (reuse, no duplication)
- Edge case flows can fan out: one prefix path + multiple terminal scenarios

**Output:** Flow file (`flow-<name>.yaml`) + generated E2E test spec that chains page objects in order.

### 8. suite-composer

**Purpose:** Build targeted test suites (smoke, sanity, regression, full) by selecting the right test cases based on context.

**Input:** Suite type + context (e.g., PR number, bug fix, or nothing for smoke/full)

**Suite Types:**

**Smoke Suite** — "Is the app alive and do core paths work?"
- Selects 1 happy-path scenario per feature (the most critical one)
- Includes 1 happy-path E2E flow (e.g., login → purchase)
- Runs on P0 browser/device only
- Typical size: 5-10% of total test cases
- Typical run time: 2-5 min

**Sanity Suite** — "Does the fix work and is the area around it OK?"
- All test cases for the changed/fixed feature
- Happy-path only for directly dependent features
- Skips unrelated features entirely
- Typical size: 10-20% of total test cases
- Typical run time: 5-10 min

**Regression Suite** — "Did anything break across the system?"
- Layer 1 (Direct Impact): All cases for directly affected features (from code change / PR diff)
- Layer 2 (Dependency Impact): Cases for features with `depends_on`/`next` links to affected features
- Layer 3 (Shared Component Impact): Cases for features sharing changed components/utilities
- Layer 4 (Risk-Based Priority): Categorizes all affected cases into P0 (must run), P1 (should run), P2 (can skip)
- Typical run time: 10-30 min

**Full Suite** — "Verify everything before release."
- All test cases, all features, all layers
- All browsers and devices from test plan
- Typical run time: 30-60 min

**Output:** Suite definition file (`.suite.yaml`) containing:

```yaml
# .argus/suites/smoke.suite.yaml
name: Smoke Suite
type: smoke
generated: 2026-03-25
cases: 20
estimatedTime: "3 min"
selection:
  - feature: login
    scenarios: [login-success]
  - feature: add-to-cart
    scenarios: [add-single-item]
  - feature: checkout
    scenarios: [checkout-standard]
  - feature: payment
    scenarios: [payment-success]
flows:
  - happy-purchase.flow.yaml
browsers: [chrome]
devices: [Desktop]
```

```yaml
# .argus/suites/regression-pr-456.suite.yaml
name: Regression — PR #456
type: regression
trigger: "PR #456: Fix checkout validation"
generated: 2026-03-25
cases: 77
estimatedTime: "15 min"
priority:
  P0:
    - feature: checkout
      scenarios: all
    - feature: login
      scenarios: [login-empty-fields, login-success]
    - feature: payment
      scenarios: [payment-success]
  P1:
    - feature: payment
      scenarios: all
  P2: []
skipReason:
  add-to-cart: "No overlap with change"
  search: "No overlap with change"
```

**Regression analysis output** (generated alongside the suite file):

```markdown
## Regression Analysis: PR #456 — "Fix checkout form validation"

### Change Summary
- Modified: checkout-form.component.ts
- Modified: validation.utils.ts (shared utility)

### Impact Assessment
| Impact Level | Feature | Reason | Test Cases |
|---|---|---|---|
| 🔴 Direct | Checkout | Changed file is in this feature | 30 cases |
| 🟠 Dependency | Payment | depends_on: checkout | 42 cases |
| 🟡 Shared | Login | Uses validation.utils.ts | 8 cases (validation only) |

### Recommended Run
| Priority | Cases | Est. Time |
|---|---|---|
| P0 only | 45 | ~8 min |
| P0 + P1 | 77 | ~15 min |
| Full regression | 245 | ~45 min |
```

### 9. ui-verifier

**Purpose:** Visual verification comparing any design image against the actual implementation.

**Input:** Design image (screenshot, Figma export, wireframe — any image) + live app URL or screenshot

**Process:**
1. AI analyzes the design image for qualitative layout assessment (element presence, arrangement, visual hierarchy)
2. AI captures or receives the implementation screenshot
3. For quantitative checks (colors, spacing, font sizes), the skill inspects computed CSS styles via Playwright DOM access — not AI vision
4. AI vision handles qualitative comparison (layout matches, elements present/missing, visual hierarchy)

**Comparison methodology:**
- **Qualitative (AI vision):** Element presence, layout structure, visual hierarchy, content correctness
- **Quantitative (DOM/CSS inspection):** Exact colors (hex values), spacing (px), font sizes, border radius
- **Pass criteria:** All elements present, quantitative values within configurable tolerance (default: 2px for spacing, exact match for colors)
- **Dynamic content handling:** User can mark regions as "dynamic" (e.g., user avatar, timestamps) — these are excluded from comparison

**Output:** UI verification report containing:
- Spec vs Design comparison (elements present/missing)
- Design vs Implementation comparison (colors, spacing, fonts, layout)
- Missing from spec (elements in design not documented)
- Quantitative diffs with exact values (expected vs actual)

**Not Figma-specific** — works with any visual input (Figma, Adobe XD, Sketch, hand-drawn wireframes, screenshots).

### 10. accessibility-checker

**Purpose:** Verify WCAG compliance using automated tooling + AI analysis.

**Input:** Page URL (preferred — enables DOM inspection) or screenshot (limited to visual checks only)

**WCAG Level:** Configurable in `.argus/config.yaml` (default: AA). Supports A, AA, AAA.

**Process:**
1. When given a URL: runs axe-core via Playwright for automated WCAG checks (contrast ratios, ARIA, alt text, heading hierarchy, form labels)
2. AI analyzes axe-core results and provides human-readable summary
3. AI vision supplements with checks axe-core cannot do (visual focus indicators, logical reading order, touch target sizing)
4. When given only a screenshot: AI vision performs qualitative checks only, flags that quantitative results require URL access

**Output:** Accessibility report covering:
- Color contrast ratios (exact ratios from computed styles, not AI estimation)
- Alt text presence
- Keyboard navigation
- ARIA labels
- Focus indicators (AI vision)
- Heading hierarchy
- Form labels
- Dynamic content accessibility (modals, dropdowns, toasts — tested via Playwright interaction)

### 11. test-runner

**Purpose:** Execute generated automation tests against the configured environments and device matrix.

**Input:** Test specs + test plan (environments, browsers, devices)

**Output:** Execution report with:
- Pass/fail per test case (linked back to TestcaseID for traceability)
- Error messages and stack traces for failures
- Screenshots on failure
- Console errors captured during execution
- Execution time
- Browser/device breakdown
- Retry information (flaky test detection — configurable max retries, default: 1)

### 12. test-maintainer

**Purpose:** Detect discrepancies between specs, test artifacts, and the live application. Acts as a discrepancy detector — never auto-fixes tests.

**Core Principle:** Argus always trusts the spec, not the code. If the app doesn't match the spec, that's a finding (potential bug), not a reason to update tests.

**Input:** Feature files + test cases + page objects + live app URL (optional)

**Process:**
1. Compares spec (feature file) against live app (if URL provided)
2. Compares page object selectors against live DOM
3. Checks test cases against current spec for staleness
4. Identifies elements in the app not covered by any spec

**Output:** Test Maintenance Report:

```markdown
## Test Maintenance Report: Login

### Spec vs App Discrepancies
| Element | Spec Says | App Shows | Test Status | Action Needed |
|---|---|---|---|---|
| Submit button text | "Submit" | "Send" | ❌ Failing | CR or Bug? |
| Error message | "Invalid credentials" | "Wrong password" | ❌ Failing | CR or Bug? |
| Password field | type="password" | type="password" | ✅ Matching | None |

### Broken Selectors
| Page Object | Selector | Status | Suggestion |
|---|---|---|---|
| login.page.ts | #submit-btn | ❌ Not found | Found button.btn-primary — confirm if same element |
| login.page.ts | #email | ✅ Found | — |

### Missing from App (in spec but not implemented)
- "Forgot password" link — specified in feature file but not found in DOM

### New in App (not in any spec)
- "Sign in with Google" button — not in any spec or CR
- "Remember me" checkbox — not in any spec or CR

### Stale Artifacts
| Artifact | Last Updated | Upstream Changed | Status |
|---|---|---|---|
| login.testcase.md | 2026-03-10 | login.feature.md updated 2026-03-20 | ⚠️ May be outdated |
| login.page.ts | 2026-03-05 | login.testcase.md updated 2026-03-10 | ⚠️ May be outdated |

### Recommendation
- 2 discrepancies need resolution — provide CRs or confirm these are bugs
- 2 undocumented elements found — add to spec or confirm removal planned
- 2 artifacts may be outdated — consider regenerating after discrepancies resolved
```

**Tester decides next action:**
```
Agent: "The spec says 'Submit' but the app shows 'Send'. Which is correct?"
  A) Spec is correct → file a bug against the developer
  B) Code is correct, spec is outdated → update the spec first, then regenerate tests
  C) There's a CR for this → feed me the CR and I'll update everything
```

### 13. bug-reporter

**Purpose:** Auto-draft bug tickets when verification or test execution fails.

**Input:** Failed test results, UI verification mismatches, accessibility issues

**Output:** Bug report containing:
- Title, description, severity
- Steps to reproduce
- Expected vs actual result
- Screenshots/evidence
- Environment details (browser, device, viewport)

**Can push to Jira** (via `jira-connector`) or output as markdown.

### 14. report-generator

**Purpose:** Generate consolidated test reports that aggregate data from all other skills.

**Input:** Data from test-runner results, bug-reporter tickets, ui-verifier reports, accessibility-checker reports, and test-case coverage.

**Report Types:**

#### Sprint Report
Generated at the end of a sprint. Provides a full picture of testing activity and quality.

```markdown
## Sprint Test Report — Sprint 23 (2026-03-10 to 2026-03-24)

### Summary
| Metric | Count |
|---|---|
| Features tested | 8 |
| Total test cases | 245 |
| Passed | 220 (89.8%) |
| Failed | 15 (6.1%) |
| Blocked | 10 (4.1%) |
| Bugs reported | 12 |
| Critical bugs | 2 |

### Coverage by Feature
| Feature | Test Cases | Pass | Fail | Blocked | Status |
|---|---|---|---|---|---|
| Login | 35 | 33 | 2 | 0 | ⚠️ |
| Add to Cart | 28 | 28 | 0 | 0 | ✅ |
| Checkout | 30 | 25 | 3 | 2 | ❌ |
| Payment | 42 | 38 | 4 | 0 | ⚠️ |

### Coverage by Testing Layer
| Layer | Test Cases | Pass Rate |
|---|---|---|
| UI | 65 | 95% |
| Functional | 80 | 90% |
| API | 50 | 88% |
| Security | 30 | 85% |
| Data | 20 | 80% |

### Coverage by Browser/Device
| Browser/Device | Pass Rate |
|---|---|
| Chrome Desktop | 92% |
| Firefox Desktop | 89% |
| Safari Desktop | 87% |
| iPhone 14 | 85% |
| iPad Air | 88% |

### Bug Summary
| ID | Feature | Severity | Status |
|---|---|---|---|
| BUG-001 | Checkout | Critical | Open |
| BUG-002 | Payment | Critical | Open |

### UI Verification Status
| Feature | Design Match |
|---|---|
| Login | 98% match |
| Dashboard | 95% match |

### Accessibility Status
| Feature | WCAG AA | Issues |
|---|---|---|
| Login | Pass | 0 |
| Checkout | Fail | 3 violations |

### Risks & Blockers
- (auto-generated from blocked tests and critical bugs)

### Recommendation
- (AI-generated go/no-go based on data)
```

#### Feature Report
Generated after testing a single feature. Deep dive with all details.

```markdown
## Feature Test Report: Login

### Summary
| Metric | Count |
|---|---|
| Total test cases | 35 |
| Passed | 33 (94.3%) |
| Failed | 2 (5.7%) |

### Test Cases by Layer
| Layer | Cases | Pass | Fail | Details |
|---|---|---|---|---|
| UI | 8 | 8 | 0 | All elements verified |
| Functional | 10 | 9 | 1 | TC-LOGIN-027: concurrent login not invalidating old session |
| API | 7 | 7 | 0 | All status codes correct |
| Security | 6 | 5 | 1 | TC-LOGIN-017: no rate limiting after 5 attempts |
| Data | 4 | 4 | 0 | Token storage verified |

### Failed Test Case Details
| TestcaseID | Test Step | Test Data | Expected Result | Actual Result |
|---|---|---|---|---|
| TC-LOGIN-017 | 5 failed login attempts | wrong password x5 | Account locked | No lock triggered |
| TC-LOGIN-027 | Login from 2 devices | Same credentials | First session invalidated | Both sessions active |

### UI Verification
- Design match: 98%
- Mismatch: Submit button padding (expected 16px, actual 12px)

### Accessibility
- WCAG AA: Pass (0 violations)

### Bugs Filed
| ID | Severity | Title |
|---|---|---|
| BUG-003 | Major | No rate limiting on login endpoint |
| BUG-004 | Minor | Concurrent sessions not handled |
```

#### Daily Report
Generated at end of day. Quick status of what was tested and what's remaining.

```markdown
## Daily Test Report — 2026-03-24

### Today's Activity
| Action | Count |
|---|---|
| Features tested | 3 (Login, Add to Cart, Search) |
| Test cases executed | 85 |
| Passed | 78 |
| Failed | 7 |
| Bugs reported | 4 |

### Progress
| Feature | Status | Remaining |
|---|---|---|
| Login | ✅ Complete | 0 test cases |
| Add to Cart | ✅ Complete | 0 test cases |
| Search | ⚠️ In Progress | 12 test cases remaining |
| Checkout | ⏳ Not Started | 30 test cases |
| Payment | ⏳ Not Started | 42 test cases |

### New Bugs Today
| ID | Feature | Severity | Title |
|---|---|---|---|
| BUG-005 | Search | Major | Fuzzy search returns no results for partial match |

### Tomorrow's Plan
- Complete Search feature (12 remaining cases)
- Start Checkout feature (30 cases)
```

#### Release Readiness Report
Generated before a release. Go/no-go recommendation with evidence.

```markdown
## Release Readiness Report — v2.1.0

### Verdict: ⚠️ CONDITIONAL GO

### Quality Gate Status
| Gate | Criteria | Actual | Status |
|---|---|---|---|
| Test case pass rate | ≥ 95% | 92.3% | ❌ |
| Critical bugs | 0 open | 0 open | ✅ |
| Major bugs | ≤ 3 open | 2 open | ✅ |
| UI verification | ≥ 95% match | 96% | ✅ |
| Accessibility | WCAG AA pass | Pass | ✅ |
| Cross-browser | All P0 browsers pass | Pass | ✅ |

### Failing Quality Gates
- Test case pass rate is 92.3% (below 95% threshold)
  - 15 failures in Payment edge cases (non-critical, documented known issues)
  - 5 failures in Search fuzzy matching (fix scheduled for v2.1.1)

### Risk Assessment
| Risk | Impact | Mitigation |
|---|---|---|
| Payment edge case failures | Low — affects <0.1% of transactions | Monitoring in place, hotfix ready |
| Search fuzzy matching | Medium — affects user experience | Partial fix deployed, full fix in v2.1.1 |

### Recommendation
Conditional go — release with known issues documented. Payment edge cases are low-risk. Search fix is tracked for next patch.

### Sign-off
| Role | Name | Status |
|---|---|---|
| QA Lead | — | Pending |
| Dev Lead | — | Pending |
| Product Owner | — | Pending |
```

**Output Formats:**

| Format | File Extension | Use Case |
|--------|---------------|----------|
| Markdown | `.report.md` | Default, readable in repo and PRs |
| HTML | `.report.html` | Shareable with stakeholders via email/browser |
| PDF | `.report.pdf` | Formal documentation, audit trails |
| JSON | `.report.json` | Integration with dashboards (Grafana, Jira, etc.) |

**Configuration:**

```yaml
# in .argus/config.yaml
reporting:
  defaultFormat: markdown       # markdown | html | pdf | json
  formats: [markdown, html]     # generate multiple formats at once
  qualityGates:                  # thresholds for release readiness report
    passingRate: 95
    maxCriticalBugs: 0
    maxMajorBugs: 3
    uiMatchThreshold: 95
    accessibilityLevel: "AA"
```

### 15. jira-connector

**Purpose:** Pull ticket data from Jira for use by other skills.

**Input:** Jira ticket ID (e.g., LOGIN-123)

**Process:** Authenticates with Jira REST API, fetches ticket description, acceptance criteria, attachments, linked issues.

**Output:** Structured ticket data fed into `spec-analyzer`.

**Configuration:** Jira base URL and API token stored in `.argus/config.yaml`.

## Project Configuration

### .argus/config.yaml

```yaml
project:
  name: "My App"
  id: "my-app"

# Authentication for skills that interact with live apps (exploratory-tester, ui-verifier, etc.)
auth:
  method: form  # form | cookie | token
  loginUrl: "/login"
  credentials:
    username: ${APP_TEST_USERNAME}  # references env var
    password: ${APP_TEST_PASSWORD}  # references env var

environments:
  dev:
    url: "https://dev.myapp.com"
  staging:
    url: "https://staging.myapp.com"
  prod:
    url: "https://myapp.com"

browsers:
  - name: chrome
    versions: ["latest", "latest-1"]
    priority: P0
  - name: firefox
    versions: ["latest"]
    priority: P1
  - name: safari
    versions: ["latest"]
    priority: P1

devices:
  - name: Desktop
    viewport: { width: 1920, height: 1080 }
    priority: P0
  - name: iPhone 14
    viewport: { width: 390, height: 844 }
    priority: P0
  - name: iPad Air
    viewport: { width: 820, height: 1180 }
    priority: P1

viewportBreakpoints:
  mobile: { min: 320, max: 480 }
  tablet: { min: 481, max: 1024 }
  desktop: { min: 1025, max: 1920 }
  largeDesktop: { min: 1921, max: 2560 }

integrations:
  jira:
    enabled: true
    baseUrl: "https://myteam.atlassian.net"
    projectKey: "MYAPP"

skills:
  exploratoryTester: { enabled: true }
  accessibilityChecker: { enabled: true, level: "AA" }
  bugReporter: { enabled: true, target: "jira" }

stack:
  language: typescript        # typescript | javascript | python | java
  web: playwright             # playwright | cypress | selenium | none
  mobile: webdriverio         # webdriverio | detox | none
  api: native                 # native | supertest | axios | rest-assured
  testRunner: vitest          # vitest | jest | pytest | junit

conventions:
  testCaseFormat: "TestcaseID - Test Step - Test Data - Expected Result"
  pageObjectPattern: "POM"
  namingConvention: "kebab-case"
```

### Artifact Naming Convention

All artifacts use the feature `id` (from frontmatter) as the canonical identifier. File names follow the pattern `<id>.<type>.<ext>`:

| Artifact | Pattern | Example |
|----------|---------|---------|
| Feature file | `<id>.feature.md` | `login.feature.md` |
| Test cases | `<id>.testcase.md` | `login.testcase.md` |
| Test data | `<id>.data.json` | `login.data.json` |
| Flow file | `<flow-name>.flow.yaml` | `happy-purchase.flow.yaml` |
| Discovery report | `<id>.discovery.md` | `login.discovery.md` |
| Smoke suite | `smoke.suite.yaml` | `smoke.suite.yaml` |
| Sanity suite | `sanity-<context>.suite.yaml` | `sanity-checkout-fix.suite.yaml` |
| Regression suite | `regression-<context>.suite.yaml` | `regression-pr-456.suite.yaml` |
| Full suite | `full.suite.yaml` | `full.suite.yaml` |
| Maintenance report | `<id>.maintenance.md` | `login.maintenance.md` |
| Sprint report | `sprint-<number>.report.<ext>` | `sprint-23.report.md` |
| Feature report | `<id>.feature-report.<ext>` | `login.feature-report.md` |
| Daily report | `<date>.daily-report.<ext>` | `2026-03-24.daily-report.md` |
| Release report | `<version>.release-report.<ext>` | `v2.1.0.release-report.md` |

### Artifact Versioning

- Generated artifacts are **overwritten** when regenerated. Git tracks version history.
- `.argus/` **should be committed** to version control — it is the source of truth for test artifacts and enables team collaboration.
- When an upstream artifact changes (e.g., feature file updated), downstream artifacts (test cases, page objects) are **not auto-regenerated**. The tester decides when to regenerate. Skills warn if upstream artifacts are newer than downstream ones.

### Project Output Structure

```
.argus/
├── config.yaml
├── features/
│   ├── login.feature.md
│   ├── add-to-cart.feature.md
│   └── payment.feature.md
├── test-cases/
│   ├── login.testcase.md
│   ├── add-to-cart.testcase.md
│   └── payment.testcase.md
├── test-data/
│   ├── login.data.json
│   └── payment.data.json
├── flows/
│   ├── happy-purchase.flow.yaml
│   └── payment-failures.flow.yaml
├── suites/
│   ├── smoke.suite.yaml
│   ├── sanity-checkout-fix.suite.yaml
│   └── regression-pr-456.suite.yaml
├── reports/
│   ├── discovery/
│   ├── ui-verification/
│   ├── accessibility/
│   ├── maintenance/
│   └── bugs/
└── automation/
    ├── web/
    │   ├── pages/
    │   └── specs/
    ├── mobile/
    │   ├── pages/
    │   └── specs/
    └── api/
        ├── clients/
        └── specs/
```

## Feature File Format

Feature files use markdown with YAML frontmatter for metadata. The frontmatter enables flow composition via the tag/link system.

```markdown
---
id: login
tags: [auth, entry-point]
depends_on: []
next: [dashboard, add-to-cart]
scenarios:
  - id: login-success
    type: happy
  - id: login-invalid-credentials
    type: negative
  - id: login-empty-fields
    type: negative
  - id: login-sql-injection
    type: security
  - id: login-brute-force
    type: security
  - id: login-spaces-in-username
    type: edge
---

# Login Feature

## Requirements
- User can log in with email and password
- Successful login redirects to /dashboard
- Failed login shows error message
- Account locks after 5 failed attempts
...

## Scenario: login-success
...

## Scenario: login-invalid-credentials
...
```

### Flow Composition

Features link via `depends_on` and `next`. The `flow-composer` resolves chains:

```
login → add-to-cart → checkout → payment
```

Flow files select specific scenarios per feature to create targeted E2E tests (happy path, edge case flows, etc.).

## Tech Stack

### The Skill Pack Itself

Skills are **markdown files with instructions** — no runtime dependencies, no compiled code. They work with any coding agent (Claude Code, Cursor, etc.) regardless of the user's project stack. The skill pack has zero tech stack requirements.

### Generated Output — Adapts to User's Stack

Skills instruct the AI agent to generate code matching the user's configured stack. The agent reads `config.stack` in `.argus/config.yaml` and generates accordingly.

**Supported stacks** (initial — more can be added by extending skill instructions):

| Target | Supported Frameworks |
|--------|---------------------|
| Language | TypeScript, JavaScript, Python, Java |
| Web automation | Playwright, Cypress, Selenium |
| Mobile automation | WebdriverIO/Appium, Detox |
| API testing | Native fetch/axios, Supertest, Rest Assured |
| Test runner | Vitest, Jest, Pytest, JUnit |
| Accessibility | axe-core (integrated via whichever web automation framework is chosen) |

**Config:**

```yaml
# in .argus/config.yaml
stack:
  language: typescript        # typescript | javascript | python | java
  web: playwright             # playwright | cypress | selenium | none
  mobile: webdriverio         # webdriverio | detox | none
  api: native                 # native | supertest | axios | rest-assured
  testRunner: vitest          # vitest | jest | pytest | junit
```

Skills reference `config.stack` in `.argus/config.yaml` when instructing the AI. For example, `page-object-generator` tells the AI: "Generate page objects using {config.stack.web} in {config.stack.language}." This means:
- A TypeScript + Playwright project gets Playwright page objects in TS
- A Java + Selenium project gets Selenium page objects in Java
- A Python + Cypress project gets Cypress page objects with Python helpers

### Tools Used by Verification Skills

These tools are used internally by verification skills when they interact with a live app:

- **AI Vision** — Qualitative layout comparison (`ui-verifier`), visual focus indicator checks (`accessibility-checker`)
- **DOM/CSS inspection** — Quantitative checks: exact colors, spacing, font sizes (`ui-verifier`)
- **axe-core** — Automated WCAG compliance (`accessibility-checker`)

## Agent Hooks

Hooks are automated behaviors that trigger on specific events during the agent session. They ensure consistency, prevent stale artifacts, and guide the user through the workflow.

### Hook Definitions

#### on-session-start

**Trigger:** Agent opens a project with `.argus/` directory in the project root.

**Action:**
- Load the `using-argus` skill
- Display project summary: project name, configured stack, number of existing features/test cases/flows
- Show available skills

#### on-before-skill

**Trigger:** Before any Argus skill runs.

**Actions:**
1. Check `.argus/config.yaml` exists. If not → prompt: "No Argus config found. Run 'Set up Argus for this project' first."
2. Check required config fields are present for the specific skill being invoked (e.g., `stack.web` must be set before `page-object-generator` runs). If missing → list missing fields, ask user to configure.

#### on-stale-check

**Trigger:** Before `test-case-creator`, `page-object-generator`, or `flow-composer` runs.

**Action:** Compare modification timestamps of upstream vs downstream artifacts:

| Skill about to run | Checks upstream | Against downstream |
|--------------------|-----------------|--------------------|
| `test-case-creator` | `<id>.feature.md` | `<id>.testcase.md` |
| `page-object-generator` | `<id>.feature.md`, `<id>.testcase.md` | `automation/<target>/pages/<id>.*`, `automation/<target>/specs/<id>.*` |
| `flow-composer` | All referenced `<id>.feature.md` files | `<flow-name>.flow.yaml` |

If upstream is newer than downstream → warn: "Feature file was updated since test cases were generated. Regenerate test cases first, or proceed with potentially stale data?"

#### on-after-generate

**Trigger:** After any Argus skill produces an artifact.

**Actions:**
1. Validate output matches the relevant schema (`feature.schema.md`, `testcase.schema.md`, `flow.schema.md`). If validation fails → list errors, fix before saving.
2. Display summary: "Created login.testcase.md — 35 test cases across 4 layers (UI, Functional, API, Security)"

#### on-feature-change

**Trigger:** When a `.feature.md` file in `.argus/features/` is modified (detected by comparing content before and after skill execution).

**Action:** List all downstream artifacts that reference this feature:
```
login.feature.md was modified. These artifacts may need regeneration:
  - .argus/test-cases/login.testcase.md
  - .argus/automation/web/pages/login.page.ts
  - .argus/automation/web/specs/login.spec.ts
  - .argus/flows/happy-purchase.flow.yaml (includes login)
```

#### on-test-fail

**Trigger:** After `test-runner` reports failed test cases.

**Action:** Suggest next steps:
```
3 test cases failed:
  - TC-LOGIN-017: Brute force — no rate limiting detected
  - TC-CHECKOUT-005: Shipping address validation bypassed
  - TC-PAYMENT-012: Expired card accepted

Want me to:
  A) Draft bug reports for all failures → invokes bug-reporter
  B) Draft bug reports for critical failures only
  C) Skip — I'll review the failures manually
```

#### on-flow-gap

**Trigger:** When `flow-composer` detects a missing feature in a dependency chain.

**Action:** Suggest filling the gap:
```
Flow from login to payment is missing 'checkout':
  login → add-to-cart → [checkout missing] → payment

Want me to:
  A) Analyze the checkout spec → invokes spec-analyzer
  B) Skip checkout and connect add-to-cart directly to payment
  C) Cancel this flow
```

### Hook Configuration

Hooks are defined in `hooks/argus-hooks.yaml` within the skill pack. Users can override hook behavior per project in `.argus/config.yaml`:

```yaml
# in .argus/config.yaml
hooks:
  on-session-start: { enabled: true }
  on-before-skill: { enabled: true }
  on-stale-check: { enabled: true }
  on-after-generate: { enabled: true }
  on-feature-change: { enabled: true }
  on-test-fail: { enabled: true, auto-suggest: true }
  on-flow-gap: { enabled: true }
```

All hooks are enabled by default. Users can disable specific hooks if they prefer a less guided experience.

## Phased Delivery

### Phase 1 — Core (5 skills)
`test-planner`, `spec-analyzer`, `test-case-creator`, `page-object-generator`, `flow-composer`

Delivers the primary value: plan → spec → test cases → automation code → flows. `test-planner` is in Phase 1 because `page-object-generator` depends on the browser/device matrix it produces.

### Phase 2 — Integration & Execution (6 skills)
`jira-connector`, `test-data-generator`, `suite-composer`, `test-runner`, `bug-reporter`, `report-generator`

Adds Jira integration, test data generation, test suite composition (smoke/sanity/regression/full), test execution, bug reporting, and consolidated test reports (sprint, feature, daily, release readiness).

### Phase 3 — Discovery, Verification & Maintenance (4 skills)
`exploratory-tester`, `ui-verifier`, `accessibility-checker`, `test-maintainer`

Adds app exploration, visual verification, accessibility checking, and test maintenance (spec-vs-code discrepancy detection, stale artifact detection). These skills require Playwright browser automation with advanced capabilities (vision, DOM inspection, axe-core). Mobile automation (WebdriverIO/Appium) is also introduced in this phase, as it requires additional infrastructure (Appium server, emulators/devices).
