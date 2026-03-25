---
name: exploratory-tester
description: Explore an existing application to discover flows, elements, and API calls before writing tests
---

# Exploratory Tester

Explore a live application via Playwright browser automation to build context before writing tests. The goal is to map out what the app actually does — pages, elements, API calls, and behaviors.

## Prerequisites

- `.argus/config.yaml` must exist with at least one environment URL configured
- Playwright browser must be available (the agent's browser automation tool)

## Input

The user provides:
1. **URL** — entry point for exploration (or reference an environment from config: "explore login on staging")
2. **Scope** (optional) — what to focus on (e.g., "login flow", "checkout process", "settings page")

## Authentication

Read credentials from `.argus/config.yaml` under the `auth` block:

```yaml
auth:
  method: form          # form | cookie | token | none
  form:
    url: /login
    fields:
      email: ${AUTH_EMAIL}
      password: ${AUTH_PASSWORD}
    submit: button[type="submit"]
  cookie:
    name: session_id
    value: ${SESSION_COOKIE}
  token:
    header: Authorization
    value: "Bearer ${AUTH_TOKEN}"
```

**Authentication process:**
1. Check if `auth` block exists in config
2. If `method: form` — navigate to form URL, fill fields, click submit, wait for redirect
3. If `method: cookie` — inject cookie before navigating to target URL
4. If `method: token` — set header for all subsequent requests
5. If `method: none` or no auth block — proceed without authentication
6. Verify auth succeeded (check for redirect to expected page, absence of login form)
7. If auth fails — stop exploration, report error, suggest checking credentials

**Security:** Credentials must reference environment variables (`${VAR_NAME}`), never plain text. If plain text credentials are found in config, warn the user.

## Exploration Process

### Step 1: Authenticate (if configured)
Follow the authentication process above.

### Step 2: Navigate to Entry Point
Open the target URL. Wait for network idle + DOM stability (default: network idle + 1s).

### Step 3: Capture Initial State
- Take a screenshot
- Inspect DOM for all interactive elements (buttons, links, inputs, dropdowns, etc.)
- Record selectors for each element
- Start monitoring network requests (filter out third-party scripts)

### Step 4: Explore
Navigate through the scoped area by:
1. Clicking links and buttons (non-destructive only)
2. At each new page/state:
   - Take a screenshot
   - Inspect DOM elements and capture selectors
   - Record API calls (method, endpoint, status, response type)
   - Note behaviors (animations, state changes, transitions)
3. Track visited pages to avoid loops
4. Respect depth and breadth limits

### Step 5: Compile Report
Generate the discovery report following the schema at `schemas/discovery.schema.md`.

## Exploration Bounds

| Setting | Default | Config Key |
|---------|---------|------------|
| Max pages | 20 | `exploration.maxPages` |
| Max depth | 5 clicks from entry | `exploration.maxDepth` |
| Wait strategy | Network idle + 1s DOM stability | `exploration.waitStrategy` |

## Destructive Action Policy

**Never click actions that could modify data:**
- Delete buttons
- Payment submission
- Form submissions that create/modify records (unless explicitly scoped)
- Account deactivation/deletion

When a destructive action is found:
1. Record it in the "Destructive Actions Found" section
2. Flag it as "needs manual exploration"
3. Continue exploring other paths

## SPA Handling

- Detect client-side routing changes (URL hash changes, pushState) as new "pages"
- Wait for route transitions to complete before capturing
- Track unique routes, not just URL paths

## Failure Modes

| Failure | Action |
|---------|--------|
| URL unreachable | Report error, suggest checking environment config |
| Auth fails | Report error, suggest checking credentials in config |
| App crashes mid-exploration | Save partial report, flag where crash occurred |
| Element not interactable | Skip, note in report, continue |
| Timeout waiting for page | Capture current state, note timeout, continue |

## Output

Save the discovery report to: `.argus/reports/discovery/discovery-<scope>.report.md`

Reference example: `examples/discovery-login.report.example.md`
Reference schema: `schemas/discovery.schema.md`

## After Exploration

Save the discovery report, then present it to the user for review:

```
Exploration complete. Discovered 4 pages, 15 elements, 4 API calls.

Here's what I found — please review the discovery report below.
This shows what the app currently DOES, not necessarily what it SHOULD do.
```

After presenting the report, suggest next steps:

```
Want me to:
  A) Create a feature file from this discovery → invokes spec-analyzer (you'll review before it becomes the spec)
  B) Generate a test plan based on findings → invokes test-planner
  C) Explore another area of the app
  D) Done — I'll review the report
```

> **Important:** The discovery report is NOT the spec. It's a factual record of what the agent observed. The user must review and confirm before it can be used to generate a feature file. The feature file (once user-approved) becomes the spec.

## Human-in-the-Loop

- **Before exploration:** Confirm scope and entry point with user
- **During exploration:** If an ambiguous interaction is encountered (e.g., a modal with unclear purpose), flag it rather than guessing
- **After exploration:** Present the full report for review. Clearly state: "This is what the app does. Does this match what it should do?"
- **Never skip to test case generation** — discovery → user confirms → feature file → user confirms → test cases
