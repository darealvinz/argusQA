---
name: spec-analyzer
description: Analyze spec documents (SRS, wireframes, API contracts, designs) from multiple sources — produces a spec analysis report and then a structured feature file
---

# Spec Analyzer

Read specification documents for a feature and produce a structured feature file. Supports multiple input documents per feature (business, frontend, backend). Always produces a **Spec Analysis Report** first for user review before generating the feature file.

## When to Use

- User has spec documents to analyze (SRS, wireframes, API contracts, designs)
- User says "analyze this spec" or "create a feature file for..."
- User drops documents into `.argus/specs/<feature-name>/`
- A Jira ticket needs to be translated into testable artifacts
- User wants test cases but no spec exists (triggers the No-Spec Flow)

## Input Sources

### Multi-File Input (recommended)

Place spec documents in `.argus/specs/<feature-name>/`:

```
.argus/specs/login-feature/
├── srs.docx              ← Business requirements, user stories
├── wireframe.png         ← UI design, layout, elements
├── ui-spec.docx          ← Frontend element details, states, error messages
├── api-contract.yaml     ← Backend endpoints, request/response schemas
├── flow-diagram.png      ← User flow, state transitions
└── logic.xlsx            ← Business rules, validation logic
```

**Supported file types:**

| Format | How AI Reads It | Best For |
|--------|----------------|----------|
| `.md`, `.txt` | Native text | Requirements, user stories |
| `.docx` | Text extraction | SRS, UI specs, business docs |
| `.pdf` | Text + layout extraction | Formal specs, signed-off docs |
| `.png`, `.jpg` | AI vision analysis | Wireframes, designs, flow diagrams, screenshots |
| `.yaml`, `.json` | Structured data parsing | API contracts, config, data schemas |
| `.xlsx`, `.csv` | Table data extraction | Business rules, validation matrices, test data |

### Single Input (quick mode)

Also accepts:
1. **Pasted text** — user pastes spec/requirements directly in chat
2. **Jira ticket** — user provides ticket ID (delegate to `jira-connector` to fetch)
3. **Single file reference** — user points to one document

### Discovery Report (no-spec flow)

4. **Discovery report** — from `exploratory-tester`, after user confirms

## No-Spec Flow

**If the user asks to analyze a feature but provides no spec documents:**

1. **Ask first:** "Do you have spec documents for this feature? (SRS, wireframes, API contracts, designs — any format). I need specs as the source of truth for generating test cases."
2. **If user says no:**
   - Explain: "Without specs, I can explore the live app to discover what it does, but that discovery is NOT the spec — it's input to help you define one."
   - Suggest: "Want me to explore the app first? I'll generate a discovery report, then you review and confirm before I create the feature file."
3. **If user agrees to exploration:**
   - Invoke `exploratory-tester` → generates discovery report
   - Present discovery report: "Here's what the app does. Does this match what it SHOULD do?"
   - **Wait for user confirmation**
4. **After user confirms:**
   - Proceed to Step 1 using the discovery report as input
   - **The user's confirmed understanding becomes the spec — not the app's behavior**

> **Important:** Discovery tells you what the app DOES. The spec tells you what the app SHOULD DO. These may differ — and that difference is where bugs live.

## Process

### Step 1: Read All Input Documents

**If multi-file input (`specs/<feature-name>/` folder):**
1. List all files in the folder
2. Categorize each file by type:
   - **Business** — SRS, PRD, user stories, business rules (what and why)
   - **Frontend** — wireframes, UI specs, designs, mockups (how it looks)
   - **Backend** — API contracts, data models, logic specs (how it works)
   - **Other** — flow diagrams, test data, reference docs
3. Read each file using the appropriate method (text extraction, AI vision, structured parsing)
4. Extract requirements, elements, endpoints, and rules from each source

**If single input:** Read the one source and categorize what it contains.

### Step 2: Produce Spec Analysis Report

**Before generating any feature file, produce a Spec Analysis Report.** This proves the AI understood the specs correctly.

The report contains:

#### Sources Analyzed
Table listing each file, its type (Business/Frontend/Backend), and what was found (count of requirements, elements, endpoints).

#### Requirements Found (grouped by source)
- **From Business** — business rules, user stories, acceptance criteria
- **From Frontend** — UI elements, states, error messages, layouts
- **From Backend** — API endpoints, status codes, data schemas, validation rules

Each requirement tagged with its source file for traceability.

#### UI Elements Identified
Table of elements found in wireframes/designs:
| Element | Source | Type | Notes |

#### API Endpoints Mapped
Table of endpoints from API contracts:
| Method | Endpoint | Request | Response | Status Codes |

#### Gap Analysis
Cross-reference all sources and flag discrepancies:

| Gap | Found In | Missing From | Action Needed |
|-----|----------|-------------|---------------|

Types of gaps:
- **In Frontend but not Backend** — UI element exists but no API support
- **In Backend but not Frontend** — API endpoint exists but no UI for it
- **In Business but not Frontend/Backend** — Requirement stated but not designed or built
- **In Frontend/Backend but not Business** — Implemented but not in requirements

#### Validation Detail Audit

For **every input field** identified in the spec, check whether these details are defined. Flag anything missing — do not assume values.

| Check | What to Look For |
|-------|-----------------|
| **Required/Optional** | Is the field mandatory? What happens if left empty? |
| **Min length** | Minimum characters allowed (e.g., password min 8) |
| **Max length** | Maximum characters allowed (e.g., username max 50) |
| **Format rules** | Expected pattern — email, phone, URL, date, currency, etc. |
| **Allowed characters** | Alphanumeric only? Special chars allowed? Unicode? |
| **Complexity rules** | Password strength requirements (uppercase, number, symbol) |
| **Default value** | Pre-filled value, if any |
| **Error messages** | Specific message for each validation failure |
| **Whitespace handling** | Trim leading/trailing? Allow spaces in middle? |

Present as a per-field audit table:

```
### Validation Detail Audit

| Field | Required | Min | Max | Format | Allowed Chars | Error Messages | Status |
|-------|----------|-----|-----|--------|--------------|----------------|--------|
| Email | ✅ Yes | ❓ | ❓ | ❓ email format? | ❓ | ❓ | 4 gaps |
| Password | ✅ Yes | ❓ | ❓ | — | ❓ complexity? | ✅ "Invalid credentials" | 3 gaps |
| Username | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ | 6 gaps |
```

**Rules:**
- ✅ = defined in spec, ❓ = not defined (gap)
- Every ❓ becomes a question for the tester
- **Never fill in assumed values.** If the spec says nothing about password max length, flag it as ❓, don't assume 64.
- If the user says "assume X for now," record it as: `⚠️ Assumption (per tester): X` — this carries forward into the feature file and test cases for traceability.

#### Best Practice Gap Analysis

Beyond what's explicitly in the spec, check for common areas that specs frequently miss. These are **not** invented requirements — they are prompts to ask the stakeholder "did you consider this?"

Flag only items relevant to the feature. Don't apply the full list to every feature — use judgment.

| Category | What to Check |
|----------|--------------|
| **Security** | Rate limiting, brute force protection, account lockout threshold and duration, CAPTCHA triggers |
| **Session** | Session timeout duration, concurrent session handling (allow multiple? kick previous?), session token storage (cookie vs localStorage) |
| **Authentication** | Token expiry duration, refresh token behavior, logout (single device or all devices?), password reset flow details |
| **Error Handling** | Error messages for every failure path, generic vs specific errors (security consideration), retry behavior |
| **Loading States** | Loading indicators during async operations, disabled states to prevent double-submit, timeout handling |
| **Empty/Edge States** | Empty state UI (no data), first-time user experience, what happens at 0 items |
| **Accessibility** | Keyboard navigation, screen reader labels, focus management, color contrast |
| **Internationalization** | Unicode support, RTL text handling, date/currency format, translation-ready labels |
| **Data** | Pagination limits, file upload limits (size, type, count), data retention/deletion policy |
| **Audit** | Logging for sensitive actions (login, password change, deletion), failed attempt tracking |
| **Infrastructure** | HTTPS enforcement, CORS policy, API versioning |

Present as a checklist of relevant items:

```
### Best Practice Gap Analysis

Items not covered in the spec that may need stakeholder input:

⚠️ Security
- [ ] Account lockout duration not specified (5 attempts defined, but how long is lockout?)
- [ ] CAPTCHA trigger point not defined

⚠️ Session
- [ ] Concurrent session policy not mentioned — allow multiple logins?
- [ ] Token storage location not specified (cookie vs localStorage)

⚠️ Error Handling
- [ ] No error message defined for rate-limited state (429)
- [ ] Generic "Invalid credentials" vs separate "Email not found" / "Wrong password" — which approach?

✅ Authentication — covered (token expiry 24h defined in SRS)
✅ Data — not applicable for this feature
```

**Rules:**
- Only flag categories relevant to the feature (don't flag "file upload limits" for a login feature)
- Mark categories as ✅ if covered or not applicable
- Each ⚠️ item becomes a question for the tester
- These are **questions, not requirements** — the stakeholder may say "not needed" and that's valid

#### Questions for Tester

Consolidate all questions from three sources into a single prioritized list:

1. **Cross-source gaps** — discrepancies between business/frontend/backend specs
2. **Validation detail gaps** — missing field constraints (from Validation Detail Audit)
3. **Best practice gaps** — common areas the spec doesn't address (from Best Practice Gap Analysis)

Tag each question with its source:

```
1. [Cross-source] Google SSO — wireframe shows button but no backend endpoint. In scope? (Gap #1)
2. [Validation] Email field — max length not specified. What is the limit?
3. [Validation] Password — complexity rules not defined. Required uppercase/number/symbol?
4. [Best Practice] Account lockout — 5 attempts defined, but lockout duration not specified. How long?
5. [Best Practice] Concurrent sessions — can a user be logged in on multiple devices?
```

For each question, the user can respond:
- **Answer** — provide the value → recorded as confirmed requirement
- **Check with stakeholder** — parked, proceed with other parts
- **Assume X** → recorded as `⚠️ Assumption (per tester): X` with traceability

#### Summary
- Total requirements extracted
- Total cross-source gaps found
- Total validation detail gaps found
- Total best practice gaps found
- Total questions needing answers
- Assumptions recorded (if any)

### Step 3: Present Analysis Report for Review

Show the full Spec Analysis Report to the user.

```
I analyzed 4 files in .argus/specs/login-feature/:

  Sources: srs.docx (business), wireframe.png (frontend),
           api-contract.yaml (backend), ui-spec.docx (frontend)

  Found: 11 requirements, 6 UI elements, 2 API endpoints
  Gaps: 4 cross-source gaps found
  Questions: 4 items need your input

[Full report displayed]

Please review:
  1. Are the extracted requirements correct?
  2. For each gap — is it intentional, missing, or out of scope?
  3. Can you answer the questions listed?

After your review, I'll generate the feature file.
```

**Wait for user to review, answer questions, and confirm.**

### Step 4: Identify Scenarios

After user confirms the analysis report, categorize scenarios:

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

### Step 5: Generate Feature File

Create the feature file following the schema at `schemas/feature.schema.md`.

**Frontmatter fields:**
- `id` — kebab-case, unique across the project
- `tags` — categorization (e.g., `[auth, entry-point]`, `[shopping, checkout]`)
- `depends_on` — feature IDs that must complete before this (empty array `[]` if none)
- `next` — feature IDs that can follow this (empty array `[]` if none)
- `scenarios` — list of `{id, type}` objects
- `sources` — list of source files analyzed (for traceability)

**Body sections:**
- `# [Feature Name]` — heading
- `## Requirements` — requirements grouped by source, each tagged `[source: filename]`
- `## UI Elements` — table of elements with selectors (from wireframes/designs)
- `## API Endpoints` — table of endpoints (from API contracts)
- `## Scenario: [scenario-id]` — one section per scenario with Description, Preconditions, Steps, Expected Results

### Step 6: Present Feature File for Review

Show the feature file to the user. Highlight:
- Number of scenarios found (by type)
- Any remaining ambiguities
- Dependencies identified
- Suggested `next` features

**Wait for user approval before saving.**

### Step 7: Save

Save the feature file to `.argus/features/<id>.feature.md`.
Save the analysis report to `.argus/reports/analysis/<id>.analysis.md`.

## Anti-Patterns

- **Don't invent requirements** — only document what's in the specs. If something seems missing, flag it in the gap analysis.
- **Don't skip the analysis report** — always produce the report first. Never jump straight to the feature file.
- **Don't merge scenarios** — each scenario tests one specific thing.
- **Don't skip security scenarios** — if the feature handles user input, there are security scenarios.
- **Don't hardcode test data in scenarios** — scenarios describe steps and expected behavior. Test data comes from `test-data-generator`.
- **Don't ignore gaps** — the gap analysis is where the most valuable findings are. Cross-source discrepancies often reveal real bugs or missing requirements.

## Integration

- **Reads from:**
  - `.argus/specs/<feature-name>/` — multi-file spec documents
  - User input (pasted text, single file)
  - `jira-connector` (ticket data)
  - `exploratory-tester` (discovery report, in no-spec flow)
- **Produces:**
  - `.argus/reports/analysis/<id>.analysis.md` — Spec Analysis Report
  - `.argus/features/<id>.feature.md` — Feature file
- **Consumed by:** `test-case-creator`, `page-object-generator`, `flow-composer`
