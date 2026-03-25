# Argus Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Argus skill pack (Phase 1) — 5 core QA skills that install into coding agents and generate test artifacts from specs.

**Architecture:** Argus is a skill pack (like Superpowers) made of markdown instruction files. Each skill is a `SKILL.md` file in its own folder under `skills/`. Skills are stack-agnostic — they instruct the AI agent what to do, and the agent generates output in whatever language/framework the user's project uses. Project-specific config and outputs live in `.argus/` within the user's project.

**Tech Stack:** Markdown (skill definitions), YAML (config schema, flow definitions), no runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-03-24-ai-test-skills-design.md`

**Working Directory:** Project root (where `package.json` lives). All paths in this plan are relative to this directory.

**Prerequisites:** Run `git init` in the working directory before starting Task 1 (if not already a git repo).

---

## File Structure

```
argus/   (project root)
├── package.json                             # npm metadata
├── setup                                    # Setup script for manual git clone installs
├── README.md                                # Getting started guide
├── skills/
│   ├── using-argus/
│   │   └── SKILL.md                         # Meta skill: intro, setup, skill registry
│   ├── test-planner/
│   │   └── SKILL.md                         # Skill 2: define test scope & environments
│   ├── spec-analyzer/
│   │   └── SKILL.md                         # Skill 3: analyze specs into feature files
│   ├── test-case-creator/
│   │   └── SKILL.md                         # Skill 4: generate test cases (5 layers)
│   ├── page-object-generator/
│   │   ├── SKILL.md                         # Skill 6: generate automation code
│   │   └── examples/
│   │       ├── playwright-page.example.ts   # Example Playwright page object
│   │       ├── cypress-page.example.ts      # Example Cypress page object
│   │       ├── webdriverio-page.example.ts  # Example WebdriverIO page object
│   │       └── api-client.example.ts        # Example API client
│   └── flow-composer/
│       └── SKILL.md                         # Skill 7: compose E2E flows
├── hooks/
│   └── argus-hooks.yaml                     # Agent hook definitions
├── schemas/
│   ├── config.schema.yaml                   # .argus/config.yaml schema definition
│   ├── feature.schema.md                    # Feature file format spec
│   ├── testcase.schema.md                   # Test case file format spec
│   └── flow.schema.md                       # Flow file format spec
└── examples/
    ├── config.example.yaml                  # Example .argus/config.yaml
    ├── login.feature.example.md             # Example feature file
    ├── login.testcase.example.md            # Example test case file
    └── happy-purchase.flow.example.yaml     # Example flow file
```

---

## Task 1: Project Scaffolding & Plugin Metadata

**Files:**
- Create: `package.json`
- Create: `setup`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "argus-skills",
  "version": "0.1.0",
  "description": "Argus — AI-powered QA testing skill pack for coding agents",
  "license": "MIT",
  "keywords": ["claude-code", "cursor", "skills", "testing", "qa", "automation", "playwright", "cypress"],
  "repository": {
    "type": "git",
    "url": "https://github.com/darealvinz/argusQA"
  }
}
```

- [ ] **Step 2: Create setup script**

`setup` — A simple setup script for users who install via git clone.

```bash
#!/bin/bash
# Argus Setup Script
# Run this after cloning: cd ~/.claude/skills/argus && ./setup

echo "Argus — AI-powered QA testing skill pack"
echo "========================================="
echo ""
echo "Skills installed to: $(pwd)/skills/"
echo ""
echo "Available skills:"
for skill_dir in skills/*/; do
  skill_name=$(basename "$skill_dir")
  echo "  - $skill_name"
done
echo ""
echo "To get started, open your project and tell the agent:"
echo "  'Set up Argus for this project'"
echo ""
echo "Setup complete."
```

- [ ] **Step 3: Make setup executable**

Run: `chmod +x setup`

- [ ] **Step 4: Create .gitignore**

```
node_modules/
.DS_Store
Thumbs.db
*.log
```

Note: Do NOT add `.argus/` to gitignore — that directory lives in user projects, not in the skill pack repo.

- [ ] **Step 5: Verify structure**

Run: `cat package.json && cat setup && cat .gitignore`
Expected: All three files present with correct content.

- [ ] **Step 6: Commit**

```bash
git add package.json setup .gitignore
git commit -m "feat: scaffold Argus project structure"
```

---

## Task 2: Config Schema & Example

**Files:**
- Create: `schemas/config.schema.yaml`
- Create: `examples/config.example.yaml`

- [ ] **Step 1: Create config schema definition**

`schemas/config.schema.yaml` — Documents all config fields, types, defaults, and valid values. This is the reference that skills point to when they need to understand config.

```yaml
# Argus Config Schema
# This file documents the structure of .argus/config.yaml
# Skills reference this schema when reading project config.

project:
  name: string          # required — project display name
  id: string            # required — kebab-case identifier

auth:                   # optional — for skills that interact with live apps
  method: enum          # form | cookie | token
  loginUrl: string      # URL path to login page (for form auth)
  credentials:
    username: string    # use ${ENV_VAR} syntax for env var references
    password: string    # use ${ENV_VAR} syntax for env var references

environments:           # required — at least one environment
  <env-name>:           # dev | staging | prod | custom
    url: string         # full base URL

browsers:               # required — at least one browser
  - name: enum          # chrome | firefox | safari | edge
    versions: string[]  # ["latest", "latest-1"]
    priority: enum      # P0 | P1 | P2

devices:                # required — at least one device
  - name: string        # display name (e.g., "Desktop", "iPhone 14")
    viewport:
      width: number     # pixels
      height: number    # pixels
    priority: enum      # P0 | P1 | P2

viewportBreakpoints:    # optional — defaults provided
  mobile: { min: 320, max: 480 }
  tablet: { min: 481, max: 1024 }
  desktop: { min: 1025, max: 1920 }
  largeDesktop: { min: 1921, max: 2560 }

integrations:           # optional
  jira:
    enabled: boolean
    baseUrl: string     # e.g., "https://myteam.atlassian.net"
    projectKey: string  # e.g., "MYAPP"

stack:                  # required
  language: enum        # typescript | javascript | python | java
  web: enum             # playwright | cypress | selenium | none
  mobile: enum          # webdriverio | detox | none
  api: enum             # native | supertest | axios | rest-assured
  testRunner: enum      # vitest | jest | pytest | junit

skills:                 # optional — enable/disable per project
  <skill-name>:
    enabled: boolean
    # additional skill-specific config

conventions:            # optional
  testCaseFormat: string    # default: "TestcaseID - Test Step - Test Data - Expected Result"
  pageObjectPattern: enum   # POM (Page Object Model)
  namingConvention: enum    # kebab-case | camelCase | snake_case

reporting:              # optional
  defaultFormat: enum       # markdown | html | pdf | json
  formats: enum[]           # generate multiple formats at once
  qualityGates:
    passingRate: number     # percentage threshold (default: 95)
    maxCriticalBugs: number # default: 0
    maxMajorBugs: number    # default: 3
    uiMatchThreshold: number # percentage (default: 95)
    accessibilityLevel: enum # A | AA | AAA (default: AA)
```

- [ ] **Step 2: Create example config**

`examples/config.example.yaml` — A fully filled out example users can copy.

```yaml
# .argus/config.yaml — Example configuration
# Copy this to your project root as .argus/config.yaml and customize.

project:
  name: "My E-Commerce App"
  id: "my-ecommerce"

auth:
  method: form
  loginUrl: "/login"
  credentials:
    username: ${APP_TEST_USERNAME}
    password: ${APP_TEST_PASSWORD}

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

stack:
  language: typescript
  web: playwright
  mobile: webdriverio
  api: native
  testRunner: vitest

conventions:
  testCaseFormat: "TestcaseID - Test Step - Test Data - Expected Result"
  pageObjectPattern: "POM"
  namingConvention: "kebab-case"

reporting:
  defaultFormat: markdown
  formats: [markdown, html]
  qualityGates:
    passingRate: 95
    maxCriticalBugs: 0
    maxMajorBugs: 3
    uiMatchThreshold: 95
    accessibilityLevel: "AA"
```

- [ ] **Step 3: Verify files**

Run: `cat schemas/config.schema.yaml | head -20 && cat examples/config.example.yaml | head -20`
Expected: Both files present with correct structure.

- [ ] **Step 4: Commit**

```bash
git add schemas/config.schema.yaml examples/config.example.yaml
git commit -m "feat: add config schema and example config"
```

---

## Task 3: Artifact Format Schemas

**Files:**
- Create: `schemas/feature.schema.md`
- Create: `schemas/testcase.schema.md`
- Create: `schemas/flow.schema.md`

- [ ] **Step 1: Create feature file schema**

`schemas/feature.schema.md` — Defines the format for `.feature.md` files.

```markdown
# Feature File Schema

Feature files use markdown with YAML frontmatter. They are the core artifact that all other skills build upon.

## File naming

`<id>.feature.md` — where `<id>` matches the frontmatter `id` field.

## Frontmatter (YAML)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique kebab-case identifier (e.g., `login`, `add-to-cart`) |
| `tags` | string[] | yes | Categorization tags (e.g., `[auth, entry-point]`) |
| `depends_on` | string[] | yes | Feature IDs that must complete before this feature (empty array if none) |
| `next` | string[] | yes | Feature IDs that can follow this feature (empty array if none) |
| `scenarios` | object[] | yes | List of test scenarios |
| `scenarios[].id` | string | yes | Unique scenario identifier (e.g., `login-success`) |
| `scenarios[].type` | enum | yes | `happy` \| `negative` \| `edge` \| `security` |

## Body Structure

```
# [Feature Name]

## Requirements
- Bullet list of requirements extracted from spec
- Each requirement should be testable

## Scenario: [scenario-id]

### Description
Brief description of what this scenario tests.

### Preconditions
- What must be true before this scenario starts

### Steps
1. Step-by-step actions

### Expected Results
- What should happen after the steps are completed
```

## Example

See `examples/login.feature.example.md`
```

- [ ] **Step 2: Create test case file schema**

`schemas/testcase.schema.md` — Defines the format for `.testcase.md` files.

```markdown
# Test Case File Schema

Test case files contain all test cases for a single feature, organized by testing layer.

## File naming

`<id>.testcase.md` — where `<id>` matches the feature `id`.

## Structure

```
# Test Cases: [Feature Name]

**Feature:** [feature-id]
**Total Cases:** [count]
**Layers:** [list of applicable layers]
**Generated from:** [feature-file-name]

## UI Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-[ID]-001 | ... | ... | ... |

## Functional Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-[ID]-010 | ... | ... | ... |

## API Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-[ID]-020 | ... | ... | ... |

## Security Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-[ID]-030 | ... | ... | ... |

## Data Layer

| TestcaseID | Test Step | Test Data | Expected Result |
|------------|-----------|-----------|-----------------|
| TC-[ID]-040 | ... | ... | ... |
```

## TestcaseID Convention

`TC-[FEATURE-ID]-[NUMBER]` — e.g., `TC-LOGIN-001`, `TC-CHECKOUT-015`

Numbering ranges per layer:
- UI: 001-009
- Functional: 010-019
- API: 020-029
- Security: 030-039
- Data: 040-049

If a layer needs more than 10 cases, continue numbering sequentially.

## Notes
- Not every feature requires all 5 layers. The AI proposes applicable layers; the tester confirms.
- Each row must be self-contained — a tester should be able to execute it without reading other rows.
```

- [ ] **Step 3: Create flow file schema**

`schemas/flow.schema.md` — Defines the format for `.flow.yaml` files.

```markdown
# Flow File Schema

Flow files define end-to-end test flows by chaining scenarios from multiple feature files.

## File naming

`<flow-name>.flow.yaml` — descriptive kebab-case name.

## YAML Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Human-readable flow name |
| `type` | enum | yes | `happy` \| `edge` \| `negative` \| `security` |
| `description` | string | no | What this flow validates |
| `steps` | object[] | yes | Ordered list of feature+scenario pairs |
| `steps[].feature` | string | yes | Feature ID (must match a `.feature.md` file) |
| `steps[].scenario` | string or string[] | yes | Scenario ID(s) from that feature. Array means "run each as a separate test, reusing preceding steps" |
| `browsers` | string[] | no | Override browser list for this flow (defaults to test plan) |
| `devices` | string[] | no | Override device list for this flow (defaults to test plan) |

## Example

```yaml
name: Happy Purchase Flow
type: happy
description: End-to-end purchase from login to payment confirmation
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

## Edge Case Flow (fan-out)

```yaml
name: Payment Failure Flows
type: edge
description: Test various payment failure scenarios
steps:
  - feature: login
    scenario: login-success
  - feature: add-to-cart
    scenario: add-single-item
  - feature: checkout
    scenario: checkout-standard
  - feature: payment
    scenario: [payment-expired-card, payment-timeout, payment-insufficient-funds]
    # Generates 3 separate test runs, reusing the same preceding steps
```

See `examples/happy-purchase.flow.example.yaml`
```

- [ ] **Step 4: Verify files**

Run: `ls schemas/`
Expected: `config.schema.yaml  feature.schema.md  flow.schema.md  testcase.schema.md`

- [ ] **Step 5: Commit**

```bash
git add schemas/
git commit -m "feat: add artifact format schemas (feature, testcase, flow)"
```

---

## Task 4: Example Artifacts

**Files:**
- Create: `examples/login.feature.example.md`
- Create: `examples/login.testcase.example.md`
- Create: `examples/happy-purchase.flow.example.yaml`

- [ ] **Step 1: Create example feature file**

`examples/login.feature.example.md` — A complete example showing the feature file format.

```markdown
---
id: login
tags: [auth, entry-point]
depends_on: []
next: [dashboard, add-to-cart, order-history]
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
- Failed login shows error message "Invalid credentials"
- Account locks after 5 failed attempts
- Password field must be masked
- Login endpoint must use HTTPS

## Scenario: login-success

### Description
Verify that a user with valid credentials can log in successfully.

### Preconditions
- User account exists with known credentials
- User is not currently logged in

### Steps
1. Navigate to /login
2. Enter valid email in email field
3. Enter valid password in password field
4. Click "Sign In" button

### Expected Results
- URL changes to /dashboard
- Welcome message displays user's name
- Auth token is stored in localStorage/cookie
- Token is valid JWT format

## Scenario: login-invalid-credentials

### Description
Verify that invalid credentials show an appropriate error.

### Preconditions
- User is on the login page

### Steps
1. Enter valid email in email field
2. Enter incorrect password in password field
3. Click "Sign In" button

### Expected Results
- Error message "Invalid credentials" is displayed
- URL remains on /login
- No auth token is stored
- Password field is cleared

## Scenario: login-empty-fields

### Description
Verify that empty fields show validation messages.

### Preconditions
- User is on the login page

### Steps
1. Leave email field empty
2. Leave password field empty
3. Click "Sign In" button

### Expected Results
- Validation message "Email is required" appears
- Validation message "Password is required" appears
- No API call is made

## Scenario: login-sql-injection

### Description
Verify that SQL injection attempts are handled safely.

### Preconditions
- User is on the login page

### Steps
1. Enter `' OR 1=1--` in email field
2. Enter any value in password field
3. Click "Sign In" button

### Expected Results
- Error message is displayed (not a SQL error)
- No authentication bypass occurs
- No auth token is stored
- Input is sanitized

## Scenario: login-brute-force

### Description
Verify that repeated failed attempts trigger account protection.

### Preconditions
- User account exists
- No previous failed attempts

### Steps
1. Enter valid email
2. Enter wrong password
3. Click "Sign In"
4. Repeat steps 2-3 four more times (5 total attempts)

### Expected Results
- After 5th failed attempt, account is locked or CAPTCHA is shown
- Subsequent attempts with correct password are blocked
- Failed attempts are logged in audit log

## Scenario: login-spaces-in-username

### Description
Verify that leading/trailing spaces in email are handled.

### Preconditions
- User is on the login page
- User account exists for "user@test.com"

### Steps
1. Enter " user@test.com " (with leading/trailing spaces) in email field
2. Enter valid password
3. Click "Sign In"

### Expected Results
- Email is trimmed and login succeeds, OR
- Validation error indicates invalid email format
- Behavior matches the spec (check with team if not specified)
```

- [ ] **Step 2: Create example test case file**

`examples/login.testcase.example.md` — Shows the test case format with all 5 layers.

```markdown
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
```

- [ ] **Step 3: Create example flow file**

`examples/happy-purchase.flow.example.yaml`

```yaml
name: Happy Purchase Flow
type: happy
description: End-to-end purchase flow from login through payment confirmation
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

- [ ] **Step 4: Verify files**

Run: `ls examples/`
Expected: `config.example.yaml  happy-purchase.flow.example.yaml  login.feature.example.md  login.testcase.example.md`

- [ ] **Step 5: Commit**

```bash
git add examples/
git commit -m "feat: add example artifacts (feature, testcase, flow)"
```

---

## Task 5: Meta Skill — `using-argus`

**Files:**
- Create: `skills/using-argus/SKILL.md`

This is the entry-point skill — loaded on session start, it introduces Argus and guides users to the right skill.

- [ ] **Step 1: Write the using-argus skill**

`skills/using-argus/SKILL.md`

```markdown
---
name: using-argus
description: Use when starting a conversation in a project that has Argus installed — introduces available QA skills and guides setup
---

# Argus — AI-Powered QA Testing Skills

> The 100-eyed watchman for your test automation.

Argus is a skill pack that gives you QA superpowers. Each skill handles a specific part of the testing lifecycle. You control the workflow — invoke skills when you need them.

## First-Time Setup

If the project doesn't have a `.argus/` folder yet, help the user set one up:

1. Create `.argus/` directory in the project root
2. Walk through config interactively — ask one question at a time:
   - Project name and ID
   - Language (TypeScript / JavaScript / Python / Java)
   - Web framework (Playwright / Cypress / Selenium / None)
   - Mobile framework (WebdriverIO / Detox / None)
   - API approach (native / Supertest / Axios / Rest Assured)
   - Test runner (Vitest / Jest / Pytest / JUnit)
   - Browsers to test (Chrome, Firefox, Safari, Edge)
   - Devices and viewports
   - Environments (dev, staging, prod URLs)
   - Jira integration (optional)
3. Generate `.argus/config.yaml` from answers
4. Confirm setup is complete

Reference the config schema at `schemas/config.schema.yaml` for valid values.

## Available Skills

### Planning & Input
| Skill | Invoke when... |
|-------|---------------|
| `test-planner` | You need to define test scope (browsers, devices, environments) |
| `spec-analyzer` | You have a spec or ticket to analyze into a feature file |

### Generation
| Skill | Invoke when... |
|-------|---------------|
| `test-case-creator` | You need test cases generated from a feature file |
| `test-data-generator` | You need realistic test data for your test cases |
| `page-object-generator` | You need automation code (page objects + test specs) |

### Composition
| Skill | Invoke when... |
|-------|---------------|
| `flow-composer` | You need to chain features into E2E flows |
| `suite-composer` | You need to build a test suite (smoke, sanity, regression, full) |

### Verification
| Skill | Invoke when... |
|-------|---------------|
| `ui-verifier` | You need to compare a design image against the live app |
| `accessibility-checker` | You need WCAG compliance checks |

### Execution & Maintenance
| Skill | Invoke when... |
|-------|---------------|
| `test-runner` | You need to execute automation tests |
| `test-maintainer` | You need to check if existing tests are still valid |

### Reporting
| Skill | Invoke when... |
|-------|---------------|
| `bug-reporter` | A test failed and you need to draft a bug ticket |
| `report-generator` | You need a sprint, feature, daily, or release report |

### Integration
| Skill | Invoke when... |
|-------|---------------|
| `jira-connector` | You need to pull a ticket from Jira |
| `exploratory-tester` | You need to explore an existing app to understand its flows |

> **Note:** Skills not in Phase 1 (`suite-composer`, `ui-verifier`, `accessibility-checker`, `test-runner`, `test-maintainer`, `bug-reporter`, `report-generator`, `jira-connector`, `exploratory-tester`, `test-data-generator`) are listed for reference but are not yet available. They are planned for Phase 2 and Phase 3.

## Typical Workflows

**New project:**
test-planner → spec-analyzer → test-case-creator → page-object-generator → flow-composer

**Existing project:**
exploratory-tester → test-planner → spec-analyzer → test-case-creator → page-object-generator

**Quick test cases:**
spec-analyzer → test-case-creator

**Before release:**
suite-composer (regression) → test-runner → report-generator (release readiness)

## Key Principles

1. **Human-in-the-loop** — Every skill pauses for your review. AI proposes, you approve.
2. **Spec is truth** — Tests are written against requirements, not code. If code doesn't match the spec, that's a bug.
3. **Stack-agnostic** — Skills generate code in whatever language/framework your project uses (configured in `.argus/config.yaml`).
4. **Layered testing** — Test cases cover 5 layers: UI, Functional, API, Security, Data. Not every feature needs all 5 — the AI proposes relevant layers, you confirm.

## Artifact Locations

All generated artifacts live in `.argus/`:

```
.argus/
├── config.yaml           ← Project configuration
├── features/             ← Analyzed feature files
├── test-cases/           ← Generated test cases
├── test-data/            ← Generated test data
├── flows/                ← E2E flow definitions
├── suites/               ← Test suite definitions
├── automation/           ← Generated page objects and test specs
│   ├── web/
│   ├── mobile/
│   └── api/
└── reports/              ← All reports
    ├── discovery/
    ├── ui-verification/
    ├── accessibility/
    ├── maintenance/
    └── bugs/
```
```

- [ ] **Step 2: Verify file**

Run: `cat skills/using-argus/SKILL.md | head -5`
Expected: Frontmatter with `name: using-argus`

- [ ] **Step 3: Commit**

```bash
git add skills/using-argus/
git commit -m "feat: add using-argus meta skill"
```

---

## Task 6: Skill — `test-planner`

**Files:**
- Create: `skills/test-planner/SKILL.md`

- [ ] **Step 1: Write the test-planner skill**

Create `skills/test-planner/SKILL.md` with the following content:

````markdown
---
name: test-planner
description: Use when you need to define test scope — browsers, devices, viewports, environments, and test types for a project or feature
---

# Test Planner

Define the testing scope and environment configuration before any test generation begins. The test plan feeds into every downstream skill — page-object-generator uses the browser/device matrix, test-runner uses the environments, ui-verifier uses the viewport boundaries.

## When to Use

- Starting testing on a new project
- Beginning a new sprint or feature
- When the test scope needs to change (new browser, new device, new environment)

## Process

### Step 1: Read Existing Config

Read `.argus/config.yaml` to understand what's already configured:
- Browsers and devices
- Environments
- Viewport breakpoints
- Stack settings

If no config exists, prompt the user to run the `using-argus` setup first.

### Step 2: Gather Scope

Ask the user one question at a time:

1. **What are we testing?** (specific feature, full sprint, or entire project)
2. **Which environments?** (present the configured environments, ask which to include)
3. **Which browsers?** (present configured browsers, ask about priorities)
4. **Which devices?** (present configured devices, ask about priorities)
5. **What test types to include?**
   - Functional (UI + API + DB)
   - Visual verification
   - Accessibility (WCAG level?)
   - Security
   - Cross-browser
   - Responsive
6. **Anything explicitly out of scope?** (e.g., performance, penetration testing)

### Step 3: Generate Test Plan

Create `.argus/test-plan.md` with the following structure:

```markdown
# Test Plan: [Scope Name]

**Created:** [date]
**Scope:** [feature / sprint / project]

## Browser Matrix
| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome  | Latest, Latest-1 | P0 |
| Firefox | Latest | P1 |

## Device Matrix
| Device | Type | Viewport | Priority |
|--------|------|----------|----------|
| Desktop | Chrome/Windows | 1920x1080 | P0 |
| iPhone 14 | Mobile | 390x844 | P0 |

## Viewport Boundaries
| Breakpoint | Min | Max |
|------------|-----|-----|
| Mobile | 320px | 480px |
| Tablet | 481px | 1024px |
| Desktop | 1025px | 1920px |

## Test Environments
| Environment | URL | Purpose |
|-------------|-----|---------|
| Dev | dev.app.com | During development |
| Staging | staging.app.com | Pre-release |

## Test Types Included
- ✅ Functional (UI + API + DB)
- ✅ Visual verification
- ✅ Accessibility (WCAG AA)
- ✅ Security
- ✅ Cross-browser
- ✅ Responsive

## Out of Scope
- Performance / load testing
- Penetration testing
```

### Step 4: Present for Review

Show the generated plan to the user. Wait for approval before saving.

### Step 5: Save

Save to `.argus/test-plan.md`. If a test plan already exists, ask the user whether to overwrite or create a versioned copy.

## Anti-Patterns

- **Don't guess browsers/devices** — always ask. Different projects have different requirements.
- **Don't skip the out-of-scope section** — explicitly stating what's NOT being tested prevents misunderstandings.
- **Don't include environments the user hasn't configured** — only offer what's in `config.yaml`.

## Integration

This plan is read by:
- `page-object-generator` — for browser/device configuration in generated code
- `test-runner` — for which environments and browsers to execute against
- `ui-verifier` — for viewport boundary definitions
- `suite-composer` — for P0/P1/P2 prioritization
- `report-generator` — for coverage breakdown by browser/device
````

- [ ] **Step 2: Verify file**

Run: `cat skills/test-planner/SKILL.md | head -5`
Expected: Frontmatter with `name: test-planner`

- [ ] **Step 3: Commit**

```bash
git add skills/test-planner/
git commit -m "feat: add test-planner skill"
```

---

## Task 7: Skill — `spec-analyzer`

**Files:**
- Create: `skills/spec-analyzer/SKILL.md`

- [ ] **Step 1: Write the spec-analyzer skill**

Create `skills/spec-analyzer/SKILL.md` with the following content:

````markdown
---
name: spec-analyzer
description: Use when you have a spec, ticket, or requirements document to analyze — produces a structured feature file for downstream skills
---

# Spec Analyzer

Read a specification or ticket and produce a structured feature file. The feature file becomes the source of truth for all downstream skills (test-case-creator, page-object-generator, flow-composer).

## When to Use

- User provides a spec document, Jira ticket, or requirements text
- User says "analyze this spec" or "create a feature file for..."
- A new ticket needs to be translated into testable artifacts

## Input Sources

Accept input in any of these forms:
1. **Pasted text** — user pastes spec/requirements directly in chat
2. **Jira ticket** — user provides ticket ID (delegate to `jira-connector` skill to fetch)
3. **File reference** — user points to a document in the repo

## Process

### Step 1: Read and Understand

Read the entire spec carefully. Identify:
- **Feature name** — what is this feature called?
- **Feature ID** — derive a kebab-case ID (e.g., `login`, `add-to-cart`, `checkout`)
- **Core requirements** — what must the feature do?
- **Acceptance criteria** — how do we know it's working?
- **Edge cases mentioned** — any boundary conditions called out?
- **Security requirements** — authentication, authorization, data protection?
- **Dependencies** — does this feature require another feature first? (e.g., login before checkout)
- **Next features** — what features follow this one? (e.g., after login → dashboard, cart)

### Step 2: Identify Scenarios

Categorize scenarios by type:

| Type | What to look for |
|------|-----------------|
| `happy` | The main success path described in the spec |
| `negative` | What happens when things go wrong (invalid input, missing data, unauthorized) |
| `edge` | Boundary conditions (empty fields, max length, special characters, concurrent access) |
| `security` | Injection, XSS, brute force, authentication bypass, data exposure |

**Rules:**
- Every feature must have at least 1 happy-path scenario
- Derive negative scenarios from every input field and every validation rule
- Derive edge cases from data boundaries and unusual states
- Derive security scenarios from any user input or authentication touchpoint

### Step 3: Flag Ambiguities

If the spec is unclear or incomplete, **do not guess**. Instead:
- List specific questions that need answers
- Mark the ambiguous area in the feature file with `⚠️ AMBIGUOUS:`
- Ask the user to clarify before proceeding

Examples of ambiguities to flag:
- "User should see an error" — what error message exactly?
- No mention of what happens on timeout
- No mention of maximum input lengths
- No mention of concurrent access behavior

### Step 4: Generate Feature File

Create the feature file following the schema at `schemas/feature.schema.md`.

Use the example at `examples/login.feature.example.md` as a reference for structure and detail level.

**Frontmatter fields:**
- `id` — kebab-case, unique across the project
- `tags` — categorization (e.g., `[auth, entry-point]`, `[shopping, checkout]`)
- `depends_on` — feature IDs that must complete before this (empty array `[]` if none)
- `next` — feature IDs that can follow this (empty array `[]` if none)
- `scenarios` — list of `{id, type}` objects

**Body sections:**
- `# [Feature Name]` — heading
- `## Requirements` — bullet list of testable requirements
- `## Scenario: [scenario-id]` — one section per scenario, each with Description, Preconditions, Steps, Expected Results

### Step 5: Present for Review

Show the feature file to the user. Highlight:
- Number of scenarios found (by type)
- Any ambiguities flagged
- Dependencies identified
- Suggested `next` features

Wait for user approval before saving.

### Step 6: Save

Save to `.argus/features/<id>.feature.md`. Create the `.argus/features/` directory if it doesn't exist.

## Anti-Patterns

- **Don't invent requirements** — only document what's in the spec. If something seems missing, flag it as a question.
- **Don't merge scenarios** — each scenario tests one specific thing. "Login with valid credentials AND check dashboard" is two scenarios.
- **Don't skip security scenarios** — if the feature handles user input, there are security scenarios.
- **Don't hardcode test data in scenarios** — scenarios describe steps and expected behavior, not specific data values. Test data comes from `test-data-generator`.

## Integration

- **Reads from:** User input (pasted spec), `jira-connector` (ticket data)
- **Produces:** `.argus/features/<id>.feature.md`
- **Consumed by:** `test-case-creator`, `page-object-generator`, `flow-composer`
````

- [ ] **Step 2: Verify file**

Run: `cat skills/spec-analyzer/SKILL.md | head -5`
Expected: Frontmatter with `name: spec-analyzer`

- [ ] **Step 3: Commit**

```bash
git add skills/spec-analyzer/
git commit -m "feat: add spec-analyzer skill"
```

---

## Task 8: Skill — `test-case-creator`

**Files:**
- Create: `skills/test-case-creator/SKILL.md`

- [ ] **Step 1: Write the test-case-creator skill**

Create `skills/test-case-creator/SKILL.md` with the following content:

````markdown
---
name: test-case-creator
description: Use when you need to generate test cases from a feature file — produces comprehensive test cases across UI, Functional, API, Security, and Data layers
---

# Test Case Creator

Generate comprehensive test cases from a feature file. Test cases cover up to 5 testing layers, with the AI proposing which layers are relevant and the tester confirming.

## When to Use

- A feature file exists in `.argus/features/` and needs test cases
- User says "generate test cases for [feature]"

## Process

### Step 1: Read Inputs

1. Read the feature file from `.argus/features/<id>.feature.md`
2. Read the test plan from `.argus/test-plan.md` (if exists) for browser/device context
3. If no feature file exists, suggest running `spec-analyzer` first

### Step 2: Propose Testing Layers

Analyze the feature and propose which layers are relevant:

| Layer | Include when... | Skip when... |
|-------|----------------|--------------|
| **UI Layer** | Feature has a user interface | Pure API endpoint, background job |
| **Functional Layer** | Feature has behavior/logic | Almost never skip this |
| **API Layer** | Feature has API endpoints | Static page with no backend calls |
| **Security Layer** | Feature handles user input or auth | Internal-only, no user input |
| **Data Layer** | Feature reads/writes to DB, creates tokens/sessions | Stateless features |

Present the proposed layers to the user:
```
I'll generate test cases for the Login feature across these layers:
✅ UI Layer — login form has input fields and buttons
✅ Functional Layer — login has behavior (redirect, error handling)
✅ API Layer — login calls POST /api/auth/login
✅ Security Layer — login handles credentials
✅ Data Layer — login creates auth tokens and sessions

Want me to add or remove any layers?
```

Wait for confirmation before proceeding.

### Step 3: Generate Test Cases

For each confirmed layer, generate test cases in this format:

```
| TestcaseID | Test Step | Test Data | Expected Result |
```

**TestcaseID Convention:** `TC-[FEATURE-ID]-[NUMBER]`
- UI: 001-009
- Functional: 010-019
- API: 020-029
- Security: 030-039
- Data: 040-049
- If a layer needs more than 10 cases, continue numbering sequentially.

**What to generate per layer:**

#### UI Layer (001-009)
- Verify every input field is present and has correct type
- Verify every button is present, visible, and has correct label
- Verify password fields mask input
- Verify loading states during async operations
- Verify error message display and styling
- Verify page title and URL
- Verify navigation elements

#### Functional Layer (010-019)
- Happy path — the main success scenario with all verifications
- Every validation rule as a separate test case
- Error handling for every failure mode in the spec
- State changes (redirects, UI updates, data updates)
- Boundary conditions (empty fields, max length)
- Login/logout state transitions

#### API Layer (020-029)
- Response status codes for success and every failure type
- Response body structure and content
- Response headers (Content-Type, CORS, cache)
- Rate limiting behavior
- Request with missing/malformed fields

#### Security Layer (030-039)
- SQL injection in every input field
- XSS in every input field
- Brute force / account lockout
- HTTPS enforcement
- Sensitive data exposure (password in logs, tokens in URL)
- Authentication bypass attempts
- Failed attempt audit logging

#### Data Layer (040-049)
- Token/session creation on success
- Token format validation (JWT structure)
- Token stored in correct location (cookie, localStorage, DB)
- Token expiry is set correctly
- No token created on failure
- Token revocation on logout
- Concurrent session handling
- Refresh token behavior

### Step 4: Quality Checks

Before presenting, verify:
- [ ] Every test case is self-contained (a tester can execute it without reading other cases)
- [ ] Every test case has specific, measurable expected results (not "works correctly")
- [ ] Test data column specifies what kind of data, not hardcoded values
- [ ] No duplicate test cases across layers
- [ ] TestcaseIDs are unique and follow the convention

### Step 5: Present for Review

Show the complete test case file. Summarize:
- Total test cases per layer
- Total test cases overall
- Any layers skipped and why
- Any gaps noticed (areas the spec doesn't cover)

Wait for user approval.

### Step 6: Save

Save to `.argus/test-cases/<id>.testcase.md`. Follow the format in `schemas/testcase.schema.md`.

Reference example: `examples/login.testcase.example.md`

## Anti-Patterns

- **Don't write vague expected results** — "should work" or "displays correctly" is not testable. Be specific: "displays error message 'Invalid credentials'"
- **Don't skip layers without asking** — propose what you think is right, but let the tester decide
- **Don't merge multiple verifications into one test case** — "Login and verify token and check dashboard" is 3 test cases
- **Don't hardcode test data** — use `$username: valid` not `$username: john@test.com`. Actual data comes from `test-data-generator`
- **Don't forget the negative path** — for every happy path, think: what if this fails? what if this is empty? what if this is malicious?

## Integration

- **Reads from:** `.argus/features/<id>.feature.md`, `.argus/test-plan.md`
- **Produces:** `.argus/test-cases/<id>.testcase.md`
- **Consumed by:** `test-data-generator`, `page-object-generator`, `suite-composer`, `report-generator`
````

- [ ] **Step 2: Verify file**

Run: `cat skills/test-case-creator/SKILL.md | head -5`
Expected: Frontmatter with `name: test-case-creator`

- [ ] **Step 3: Commit**

```bash
git add skills/test-case-creator/
git commit -m "feat: add test-case-creator skill"
```

---

## Task 9: Skill — `page-object-generator`

**Files:**
- Create: `skills/page-object-generator/SKILL.md`
- Create: `skills/page-object-generator/examples/playwright-page.example.ts`
- Create: `skills/page-object-generator/examples/cypress-page.example.ts`
- Create: `skills/page-object-generator/examples/webdriverio-page.example.ts`
- Create: `skills/page-object-generator/examples/api-client.example.ts`

- [ ] **Step 1: Write the page-object-generator skill**

`skills/page-object-generator/SKILL.md` — Guides the AI to generate automation code from feature files and test cases.

The skill should instruct the AI to:
1. Read `.argus/config.yaml` for `stack` settings (language, web framework, mobile framework, API approach, test runner)
2. Read the feature file and test cases
3. Read the test plan for browser/device matrix
4. Generate page object classes with:
   - Selectors for all UI elements found in test cases
   - Action methods matching test steps
   - Assertion helpers matching expected results
5. Generate test spec files that:
   - Import the page objects
   - Implement each test case as a test function
   - Use data-driven approach with test data
   - Include cross-browser/device configuration
6. Save to `.argus/automation/<target>/pages/` and `.argus/automation/<target>/specs/`
7. Present for review

Include example output patterns for each supported framework. Reference the example files in `skills/page-object-generator/examples/`.

- [ ] **Step 2: Write Playwright page object example**

`skills/page-object-generator/examples/playwright-page.example.ts`

```typescript
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.locator('button:has-text("Sign In")');
    this.errorMessage = page.locator('.error-message');
    this.welcomeMessage = page.locator('.welcome-msg');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async expectLoginSuccess(userName: string) {
    await expect(this.page).toHaveURL('/dashboard');
    await expect(this.welcomeMessage).toContainText(userName);
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
    await expect(this.page).toHaveURL('/login');
  }
}
```

- [ ] **Step 3: Write Cypress page object example**

`skills/page-object-generator/examples/cypress-page.example.ts`

```typescript
export class LoginPage {
  goto() {
    cy.visit('/login');
  }

  login(email: string, password: string) {
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button').contains('Sign In').click();
  }

  expectLoginSuccess(userName: string) {
    cy.url().should('include', '/dashboard');
    cy.get('.welcome-msg').should('contain', userName);
  }

  expectLoginError(message: string) {
    cy.get('.error-message').should('have.text', message);
    cy.url().should('include', '/login');
  }
}
```

- [ ] **Step 4: Write WebdriverIO page object example**

`skills/page-object-generator/examples/webdriverio-page.example.ts`

```typescript
class LoginPage {
  get emailInput() { return $('#email'); }
  get passwordInput() { return $('#password'); }
  get signInButton() { return $('button=Sign In'); }
  get errorMessage() { return $('.error-message'); }
  get welcomeMessage() { return $('.welcome-msg'); }

  async open() {
    await browser.url('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.signInButton.click();
  }

  async expectLoginSuccess(userName: string) {
    await expect(browser).toHaveUrl(expect.stringContaining('/dashboard'));
    await expect(this.welcomeMessage).toHaveTextContaining(userName);
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
    await expect(browser).toHaveUrl(expect.stringContaining('/login'));
  }
}

export default new LoginPage();
```

- [ ] **Step 5: Write API client example**

`skills/page-object-generator/examples/api-client.example.ts`

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  email: string;
  token: string;
  refreshToken: string;
}

export class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(token: string): Promise<Response> {
    return fetch(`${this.baseUrl}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
}
```

- [ ] **Step 6: Verify files**

Run: `ls skills/page-object-generator/examples/`
Expected: 4 example files present.

- [ ] **Step 7: Commit**

```bash
git add skills/page-object-generator/
git commit -m "feat: add page-object-generator skill with framework examples"
```

---

## Task 10: Skill — `flow-composer`

**Files:**
- Create: `skills/flow-composer/SKILL.md`

- [ ] **Step 1: Write the flow-composer skill**

Create `skills/flow-composer/SKILL.md` with the following content:

````markdown
---
name: flow-composer
description: Use when you need to compose end-to-end test flows by chaining features — builds E2E flows from feature file dependency graphs
---

# Flow Composer

Compose end-to-end test flows by chaining scenarios from multiple feature files. Uses the `depends_on`/`next` metadata in feature frontmatter to build a dependency graph and resolve paths.

## When to Use

- User wants to create an E2E test flow (e.g., "build the purchase flow from login to payment")
- User wants to see all possible flows in the project
- User wants to compose edge case flows across features

## Process

### Step 1: Read Feature Files

Read all feature files from `.argus/features/`. Extract the dependency graph from frontmatter:
- `id` — the node
- `depends_on` — incoming edges
- `next` — outgoing edges
- `scenarios` — available scenarios per feature

### Step 2: Build Dependency Graph

Construct the graph and validate:

```
login (entry-point)
  ├→ dashboard
  ├→ add-to-cart → checkout → payment
  └→ order-history → reorder → payment
```

**Validation checks:**
- **Circular dependencies** → Flag as error: "Feature A depends on B, B depends on A. Please fix the feature files."
- **Missing features** → Flag as gap: "Checkout references 'payment' in `next`, but no payment.feature.md exists."
- **Orphan features** → Warn: "Feature 'search' has no `depends_on` and no other feature lists it in `next`. Is it standalone?"

### Step 3: Determine User Intent

The user can request flows in three ways:

**A) Path resolution:** "Build the flow from login to payment"
- Find all paths from `login` to `payment` in the graph
- If multiple paths exist, present them:
  ```
  Found 2 paths from login to payment:
  1. login → add-to-cart → checkout → payment
  2. login → order-history → reorder → payment
  Which one? (or both?)
  ```

**B) AI-suggested flows:** "Suggest common flows"
- Identify entry points (features with empty `depends_on`)
- Identify exit points (features with empty `next`)
- Propose flows for every entry-to-exit path
- Categorize: happy path flows, edge case flows, security flows

**C) Manual definition:** "Create a flow with these steps: login → search → add-to-cart → checkout"
- Validate that each step has the required `depends_on`/`next` links
- If links are missing, warn but allow (user overrides the graph)

### Step 4: Select Scenarios

For each feature in the flow, ask which scenarios to include:

**Happy path flow:** Pick the `happy` scenario from each feature.

**Edge case flow:** Pick happy scenarios for prerequisite features, then specific edge/negative scenarios for the target feature:
```yaml
steps:
  - feature: login
    scenario: login-success          # happy — just get past login
  - feature: add-to-cart
    scenario: add-single-item        # happy — just get item in cart
  - feature: checkout
    scenario: checkout-standard      # happy — proceed to payment
  - feature: payment
    scenario: [payment-expired-card, payment-timeout]  # edge — test failures here
```

**Fan-out:** When a step's scenario is an array, each scenario becomes a separate test run sharing the same prefix steps.

### Step 5: Generate Flow File

Create the flow file following `schemas/flow.schema.md`:

```yaml
name: Happy Purchase Flow
type: happy
description: End-to-end purchase from login to payment confirmation
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

### Step 6: Present for Review

Show the flow with a visual chain:
```
login (login-success) → add-to-cart (add-single-item) → checkout (checkout-standard) → payment (payment-success)
```

Highlight:
- Number of features in the chain
- Number of test runs (1 for linear, N for fan-out)
- Any warnings about missing links

### Step 7: Save

Save to `.argus/flows/<flow-name>.flow.yaml`.

Reference example: `examples/happy-purchase.flow.example.yaml`

## Anti-Patterns

- **Don't create flows without feature files** — if features don't exist yet, suggest running `spec-analyzer` first
- **Don't auto-resolve ambiguous paths** — if multiple paths exist, present options and let the user choose
- **Don't ignore the dependency graph** — if the user requests a flow that skips a dependency, warn them
- **Don't create monolithic flows** — a 15-step flow is hard to debug. Suggest breaking into smaller sub-flows if the chain is longer than 6-7 features

## Integration

- **Reads from:** `.argus/features/*.feature.md`
- **Produces:** `.argus/flows/<flow-name>.flow.yaml`
- **Consumed by:** `page-object-generator` (generates chained E2E test specs), `suite-composer` (includes flows in test suites), `test-runner` (executes flow-based tests)
````

- [ ] **Step 2: Verify file**

Run: `cat skills/flow-composer/SKILL.md | head -5`
Expected: Frontmatter with `name: flow-composer`

- [ ] **Step 3: Commit**

```bash
git add skills/flow-composer/
git commit -m "feat: add flow-composer skill"
```

---

## Task 11: Agent Hooks

**Files:**
- Create: `hooks/argus-hooks.yaml`

- [ ] **Step 1: Create the hooks definition file**

Create `hooks/argus-hooks.yaml` with the following content:

```yaml
# Argus Agent Hooks
# Automated behaviors that trigger on specific events during the agent session.
# Users can override per project in .argus/config.yaml under the 'hooks' key.

on-session-start:
  description: "Auto-load Argus when project has .argus/ directory"
  trigger: ".argus/ directory exists in project root"
  enabled: true
  actions:
    - load-skill: using-argus
    - display: |
        Argus loaded for project: {config.project.name}
        Stack: {config.stack.language} + {config.stack.web}
        Features: {count .argus/features/*.feature.md}
        Test cases: {count .argus/test-cases/*.testcase.md}
        Flows: {count .argus/flows/*.flow.yaml}

on-before-skill:
  description: "Validate config before any Argus skill runs"
  trigger: "Any Argus skill is about to run"
  enabled: true
  actions:
    - check: ".argus/config.yaml exists"
      on-fail: "No Argus config found. Run 'Set up Argus for this project' first."
    - check: "Required config fields are present for the specific skill"
      on-fail: "List missing fields, ask user to configure"

on-stale-check:
  description: "Warn if upstream artifacts are newer than downstream"
  trigger: "test-case-creator, page-object-generator, or flow-composer is about to run"
  enabled: true
  checks:
    - skill: test-case-creator
      upstream: ".argus/features/{id}.feature.md"
      downstream: ".argus/test-cases/{id}.testcase.md"
    - skill: page-object-generator
      upstream:
        - ".argus/features/{id}.feature.md"
        - ".argus/test-cases/{id}.testcase.md"
      downstream: ".argus/automation/*/pages/{id}.*"
    - skill: flow-composer
      upstream: ".argus/features/*.feature.md"
      downstream: ".argus/flows/{flow-name}.flow.yaml"
  on-stale: "Warn user: upstream was updated since downstream was generated. Suggest regenerating."

on-after-generate:
  description: "Validate output and show summary after artifact generation"
  trigger: "Any Argus skill produces an artifact"
  enabled: true
  actions:
    - validate-schema:
        feature: "schemas/feature.schema.md"
        testcase: "schemas/testcase.schema.md"
        flow: "schemas/flow.schema.md"
      on-fail: "List validation errors, fix before saving"
    - display-summary: true

on-feature-change:
  description: "List downstream artifacts that may need regeneration"
  trigger: "A .feature.md file in .argus/features/ is modified"
  enabled: true
  action: "List all downstream artifacts that reference this feature ID"

on-test-fail:
  description: "Suggest bug reporting after test failures"
  trigger: "test-runner reports failed test cases"
  enabled: true
  auto-suggest: true
  action: |
    List failed test cases with IDs.
    Offer options:
      A) Draft bug reports for all failures (invokes bug-reporter)
      B) Draft bug reports for critical failures only
      C) Skip — review manually

on-flow-gap:
  description: "Suggest filling missing features in flow chains"
  trigger: "flow-composer detects a missing feature in dependency chain"
  enabled: true
  action: |
    Show the gap in the chain.
    Offer options:
      A) Analyze the missing spec (invokes spec-analyzer)
      B) Skip the missing feature and connect directly
      C) Cancel the flow
```

- [ ] **Step 2: Verify file**

Run: `cat hooks/argus-hooks.yaml | head -10`
Expected: YAML header with `on-session-start` hook definition.

- [ ] **Step 3: Commit**

```bash
git add hooks/
git commit -m "feat: add agent hooks for automated workflow guidance"
```

---

## Task 12: README (formerly Task 11)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Create a concise README covering:
- What Argus is (one paragraph)
- Installation (per platform)
- Quick start (3 commands to go from zero to test cases)
- Skill list (table with all 15 skills)
- Phase roadmap (which skills are available now)
- Link to full spec
- Contributing section (placeholder)

Keep it under 150 lines. The spec has all the details — README is just the entry point.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "feat: add README with getting started guide"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Verify complete file structure**

Run: `find . -type f | grep -v '.git/' | sort`

Expected structure:
```
./.claude-plugin/marketplace.json
./.claude-plugin/plugin.json
./.gitignore
./docs/superpowers/plans/2026-03-25-argus-phase1.md
./docs/superpowers/specs/2026-03-24-ai-test-skills-design.md
./examples/config.example.yaml
./examples/happy-purchase.flow.example.yaml
./examples/login.feature.example.md
./examples/login.testcase.example.md
./hooks/argus-hooks.yaml
./package.json
./README.md
./setup
./schemas/config.schema.yaml
./schemas/feature.schema.md
./schemas/flow.schema.md
./schemas/testcase.schema.md
./skills/flow-composer/SKILL.md
./skills/page-object-generator/SKILL.md
./skills/page-object-generator/examples/api-client.example.ts
./skills/page-object-generator/examples/cypress-page.example.ts
./skills/page-object-generator/examples/playwright-page.example.ts
./skills/page-object-generator/examples/webdriverio-page.example.ts
./skills/spec-analyzer/SKILL.md
./skills/test-case-creator/SKILL.md
./skills/test-planner/SKILL.md
./skills/using-argus/SKILL.md
```

- [ ] **Step 3: Verify git log**

Run: `git log --oneline`
Expected: All commits from tasks 1-12 present.
