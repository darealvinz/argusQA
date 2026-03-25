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
