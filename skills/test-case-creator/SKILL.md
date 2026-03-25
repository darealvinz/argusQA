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
