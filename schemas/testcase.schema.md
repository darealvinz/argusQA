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
