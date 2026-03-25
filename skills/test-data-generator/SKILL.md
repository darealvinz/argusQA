---
name: test-data-generator
description: Use when you need realistic test data for test cases — generates valid, invalid, edge case, and security data sets per feature
---

# Test Data Generator

Generate structured test data sets from test cases. Produces valid, invalid, edge case, and security data organized by scenario type.

## When to Use

- Test cases exist and need concrete data values
- User says "generate test data for [feature]"
- `page-object-generator` needs data-driven test support

## Process

### Step 1: Read Inputs

1. Read the test case file from `.argus/test-cases/<id>.testcase.md`
2. Read the feature file from `.argus/features/<id>.feature.md` for context
3. If no test cases exist, suggest running `test-case-creator` first

### Step 2: Identify Data Fields

Extract every `$variable` reference from the Test Data column of test cases:
- `$username`, `$password` → fields that need data
- `valid`, `invalid`, `empty` → hints about what kind of data

Group fields by the form/endpoint they belong to.

### Step 3: Generate Data Sets

For each scenario type, generate realistic test data:

**Valid data sets:**
- At least 2 valid data sets (standard user, admin user, etc.)
- Use realistic but obviously fake data
- Vary data across sets (different names, emails, etc.)

**Invalid data sets:**
- One data set per validation rule in the test cases
- Each set should trigger exactly one specific error
- Include the expected error message

**Edge case data sets:**
- Boundary values (min/max length, special characters, unicode)
- Leading/trailing whitespace
- Empty strings vs null vs undefined

**Security data sets:**
- SQL injection strings for every text input
- XSS payloads for every text input
- Include the expected safe behavior

### Step 4: Present for Review

Show the generated data file. Summarize:
- Number of data sets per type
- Fields covered
- Any test cases that need data not generated

Wait for user approval.

### Step 5: Save

Save to `.argus/test-data/<id>.data.json`. Follow the format in `schemas/testdata.schema.md`.

Reference example: `examples/login.data.example.json`

## Anti-Patterns

- **Don't use production data** — always generate fake data
- **Don't use sequential/predictable patterns** — "user1, user2, user3" is not realistic
- **Don't forget the expected error** — every invalid data set needs `expectedError`
- **Don't hardcode environment-specific values** — use relative paths, not full URLs

## Integration

- **Reads from:** `.argus/test-cases/<id>.testcase.md`, `.argus/features/<id>.feature.md`
- **Produces:** `.argus/test-data/<id>.data.json`
- **Consumed by:** `page-object-generator` (data-driven tests), `test-runner` (runtime data)
