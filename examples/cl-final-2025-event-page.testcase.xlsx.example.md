# Example: Test Case XLSX Export

**Source:** `.argus/test-cases/cl-final-2025-event-page.testcase.md`
**Output:** `.argus/artifacts/cl-final-2025-event-page.testcase.xlsx`

## Sheet 1: Summary

| Field | Value |
|-------|-------|
| Feature | cl-final-2025-event-page |
| Export Date | 2026-03-28 |
| Generated From | cl-final-2025-event-page.testcase.md |
| Total Test Cases | 62 |
| High Priority | 24 |
| Medium Priority | 26 |
| Low Priority | 12 |
| Positive | 49 |
| Negative | 13 |
| Pass | 0 |
| Fail | 0 |
| Not Run | 62 |

## Sheet 2: Test Cases (first 3 rows)

| ID | Test Case Title | Type | Test Data | Steps | Expected Result | Priority | Known Bug / Notes | Status |
|----|----------------|------|-----------|-------|-----------------|----------|-------------------|--------|
| TC-CLPAGE-001 | Page title is correct | Positive | — | Navigate to /champions-league/champions-league-final-2025 and verify page title | Page title is "Champions League Final 2025..." | High | | |
| TC-CLPAGE-002 | H1 heading is displayed | Positive | — | Verify H1 heading is displayed | H1 text is "Champions League Final 2025 Tickets" | High | | |
| TC-CLPAGE-003 | Event date badge shows correct date | Positive | — | Verify event date badge shows correct date | Date badge displays "2025", "31", "May" | Medium | | |
