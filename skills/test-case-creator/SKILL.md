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
3. **If no feature file exists — STOP.** Do not generate test cases without a feature file. Instead:
   - Tell the user: "No feature file found for this feature. I need an approved feature file before generating test cases."
   - Suggest: "Do you have a spec or ticket? I can analyze it with `spec-analyzer` to create the feature file first."
   - If no spec exists either, guide the user through the No-Spec Flow in `spec-analyzer` (explore → discover → user confirms → feature file → then test cases)

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

### Step 3: Apply Black Box Testing Techniques

Before generating test cases, analyze the feature and determine which black box techniques to apply. Present the techniques to the user:

```
I'll apply these testing techniques for the Login feature:
✅ Equivalence Partitioning — email and password input classes
✅ Boundary Value Analysis — password length min/max
✅ Decision Table — login conditions (valid/invalid email × valid/invalid password)
✅ State Transition — logged out → logged in → session expired
✅ Error Guessing — common mistakes (spaces in email, copy-paste password)
⬚ Pairwise Testing — not needed (only 2 input fields)

Want me to adjust?
```

Wait for confirmation before proceeding.

#### Technique Reference

**1. Equivalence Partitioning (EP)**

Divide each input into valid and invalid classes. Test one value from each class.

| Input | Valid Classes | Invalid Classes |
|-------|-------------|-----------------|
| Email | registered email, unregistered email | empty, no @ symbol, no domain, special chars only |
| Password | correct password | empty, wrong password, expired password |
| Quantity | 1-99 | 0, -1, 100, non-numeric, decimal |

**Rule:** At minimum, test 1 value from each valid class and 1 from each invalid class.

**2. Boundary Value Analysis (BVA)**

For any input with limits (length, range, count), test at the boundaries:

| Boundary | Test Values |
|----------|-------------|
| Min | min, min-1 |
| Max | max, max+1 |
| Special | 0, 1, empty |

Example for password (min: 8, max: 64):
- 7 chars (below min — reject)
- 8 chars (at min — accept)
- 64 chars (at max — accept)
- 65 chars (above max — reject)

**Rule:** Always test both sides of every boundary. If no explicit limits exist in the spec, flag it as a gap in Questions for Tester.

**3. Decision Table Testing**

For features with multiple conditions that combine to produce different outcomes, build a decision table:

| Rule | Condition 1 | Condition 2 | Condition 3 | Action |
|------|------------|------------|------------|--------|
| R1 | T | T | T | Success |
| R2 | T | T | F | Error X |
| R3 | T | F | T | Error Y |
| R4 | T | F | F | Error Z |
| ... | | | | |

Example — Login:

| Rule | Valid Email? | Valid Password? | Account Active? | Result |
|------|------------|----------------|-----------------|--------|
| R1 | Yes | Yes | Yes | Login success, redirect |
| R2 | Yes | Yes | No | "Account suspended" error |
| R3 | Yes | No | Yes | "Invalid credentials" error |
| R4 | Yes | No | No | "Invalid credentials" error |
| R5 | No | Yes | — | "Invalid credentials" error |
| R6 | No | No | — | "Invalid credentials" error |

**Rule:** Each row in the decision table becomes a test case. Collapse rows with identical outcomes if they don't add value.

**4. State Transition Testing**

Map the states a feature can be in and the transitions between them. Test both valid and invalid transitions.

```
[Logged Out] --valid login--> [Logged In] --logout--> [Logged Out]
[Logged Out] --invalid login--> [Logged Out] (error shown)
[Logged In] --session expires--> [Session Expired] --any action--> [Logged Out]
[Logged Out] --access protected page--> [Redirected to Login]
```

Generate test cases for:
- Every valid transition (happy paths)
- Every invalid transition (e.g., accessing admin page as regular user)
- Terminal states (what happens at the end?)
- Loops (can user get stuck in a state?)

**5. Error Guessing**

Based on testing experience, anticipate common mistakes developers make:

| Category | Common Errors to Test |
|----------|----------------------|
| Whitespace | Leading/trailing spaces in input, tab characters, newlines |
| Copy-paste | Pasting password with hidden chars, pasting formatted text |
| Double submit | Clicking submit twice quickly, pressing Enter + clicking button |
| Back button | Submitting form, pressing back, resubmitting |
| Special chars | Unicode, emoji, RTL text, extremely long strings |
| Concurrency | Two tabs, same action simultaneously |
| Network | Slow connection, connection drops mid-submit |
| Browser | Autofill interference, password managers, incognito mode |

**Rule:** Pick the 3-5 most relevant error guesses per feature. Don't exhaustively test all — focus on what's likely to break.

**6. Pairwise / Combinatorial Testing**

When a feature has 3+ independent parameters, test all pairs of values rather than all combinations.

Example — Search with filters (category, sort, page size):

| # | Category | Sort | Page Size |
|---|----------|------|-----------|
| 1 | Electronics | Price asc | 10 |
| 2 | Electronics | Date desc | 50 |
| 3 | Books | Price asc | 50 |
| 4 | Books | Date desc | 10 |

**Rule:** Use pairwise only when full combinatorial would produce too many cases (3+ params × 3+ values each). For 2 params, just test all combinations.

---

### Step 4: Generate Test Cases

For each confirmed layer, generate test cases using the techniques identified in Step 3.

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

**Tag each test case with the technique that produced it** in the Test Step column using a prefix:

- `[EP]` — Equivalence Partitioning
- `[BVA]` — Boundary Value Analysis
- `[DT]` — Decision Table
- `[ST]` — State Transition
- `[EG]` — Error Guessing
- `[PW]` — Pairwise Testing

Example: `[BVA] Enter password with 7 characters (below minimum)`

If a test case doesn't come from a specific technique (e.g., basic UI presence checks), no tag is needed.

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
Apply these techniques systematically:
- **EP:** Identify all input partitions, test one valid and one invalid from each class
- **BVA:** For every field with limits (length, range, count), test at and around each boundary
- **DT:** For any logic with 2+ conditions, build a decision table and generate one case per rule
- **ST:** Map all states and transitions, test every valid path and key invalid transitions
- **EG:** Add 3-5 experience-based error guesses (double submit, back button, whitespace, etc.)
- Happy path — the main success scenario with all verifications
- Every validation rule as a separate test case
- Error handling for every failure mode in the spec

#### API Layer (020-029)
- **EP:** Valid/invalid request body partitions
- **BVA:** Payload size limits, pagination boundaries, rate limit thresholds
- Response status codes for success and every failure type
- Response body structure and content
- Response headers (Content-Type, CORS, cache)
- Rate limiting behavior
- Request with missing/malformed fields

#### Security Layer (030-039)
- **EP:** Categories of injection (SQL, XSS, command injection) as separate input classes
- **EG:** Common attack patterns developers miss
- SQL injection in every input field
- XSS in every input field
- Brute force / account lockout
- HTTPS enforcement
- Sensitive data exposure (password in logs, tokens in URL)
- Authentication bypass attempts
- Failed attempt audit logging

#### Data Layer (040-049)
- **ST:** Token lifecycle states (created → active → expired → revoked)
- **BVA:** Token expiry boundaries (at expiry time, 1 second before, 1 second after)
- Token/session creation on success
- Token format validation (JWT structure)
- Token stored in correct location (cookie, localStorage, DB)
- Token expiry is set correctly
- No token created on failure
- Token revocation on logout
- Concurrent session handling
- Refresh token behavior

### Step 5: Quality Checks

Before presenting, verify:
- [ ] Every test case is self-contained (a tester can execute it without reading other cases)
- [ ] Every test case has specific, measurable expected results (not "works correctly")
- [ ] Test data column specifies what kind of data, not hardcoded values
- [ ] No duplicate test cases across layers
- [ ] TestcaseIDs are unique and follow the convention
- [ ] Technique tags are applied where applicable (`[EP]`, `[BVA]`, `[DT]`, `[ST]`, `[EG]`, `[PW]`)
- [ ] All equivalence classes (valid + invalid) are covered
- [ ] All boundaries have both sides tested (at limit and beyond limit)
- [ ] Decision tables cover all condition combinations that produce different outcomes

### Step 6: Present for Review

Show the complete test case file. Summarize:
- Total test cases per layer
- Total test cases overall
- Techniques applied and how many cases each produced
- Any layers skipped and why
- Any gaps noticed (areas the spec doesn't cover)

Example summary:
```
Generated 48 test cases across 4 layers:
- UI Layer: 8 cases
- Functional Layer: 22 cases (EP: 6, BVA: 5, DT: 4, ST: 3, EG: 4)
- API Layer: 10 cases (EP: 3, BVA: 2, other: 5)
- Security Layer: 8 cases (EP: 3, EG: 5)

Gaps found:
- Spec doesn't define max password length → tested with 64 chars (assumed)
- No mention of account lockout threshold → flagged as question
```

Wait for user approval.

### Step 7: Save

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
