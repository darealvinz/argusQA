---
name: report-generator
description: Use when you need a test report — generates sprint, feature, daily, or release readiness reports with quality gate evaluation
---

# Report Generator

Generate consolidated test reports that aggregate data from test execution, bug reports, UI verification, and accessibility checks. Four report types serve different audiences and timing.

## When to Use

- End of sprint → Sprint Report
- After testing a feature → Feature Report
- End of day → Daily Report
- Before a release → Release Readiness Report
- User says "generate a report"

## Process

### Step 1: Determine Report Type

Ask the user which report:

| Type | When | Audience |
|------|------|----------|
| **Sprint** | End of sprint | QA team, dev leads, product owners |
| **Feature** | After testing one feature | Developer, QA, product owner |
| **Daily** | End of day | QA team, project manager |
| **Release Readiness** | Before release | QA lead, dev lead, product owner, stakeholders |

### Step 2: Gather Data

Read all relevant artifacts:
- `.argus/test-cases/` — for coverage counts
- `.argus/reports/bugs/` — for bug counts and status
- Test execution results (from `test-runner`)
- `.argus/test-plan.md` — for browser/device matrix
- `.argus/config.yaml` — for quality gate thresholds (release readiness)

For Feature Reports, ask which feature. For Daily Reports, ask what was tested today.

### Step 3: Generate Report

Follow the structure defined in `schemas/report.schema.md` for the selected report type.

**Key sections per type:**

#### Sprint Report
- Summary metrics (features, cases, pass/fail/blocked, bugs)
- Coverage by feature, layer, browser/device
- Bug summary (open critical/major)
- UI verification and accessibility status
- Risks & blockers (auto-generated)
- AI recommendation (go/no-go)

#### Feature Report
- Summary (total cases, pass/fail)
- Cases by layer with details
- Failed case details (expected vs actual)
- UI verification match %
- Accessibility status
- Bugs filed

#### Daily Report
- Today's activity (features, cases, pass/fail, bugs)
- Progress per feature (status, remaining)
- New bugs today
- Tomorrow's plan

#### Release Readiness Report
- Verdict: GO | CONDITIONAL GO | NO GO
- Quality gate evaluation (compare actuals against thresholds from config)
- Failing gates with context
- Risk assessment with mitigation
- AI-generated narrative recommendation
- Sign-off table

### Step 4: Evaluate Quality Gates (Release Readiness only)

Read thresholds from `.argus/config.yaml`:

```yaml
reporting:
  qualityGates:
    passingRate: 95        # minimum pass %
    maxCriticalBugs: 0     # max open critical bugs
    maxMajorBugs: 3        # max open major bugs
    uiMatchThreshold: 95   # minimum UI match %
    accessibilityLevel: "AA"  # required WCAG level
```

Compare each gate against actual data. Generate verdict:
- **GO:** All gates pass
- **CONDITIONAL GO:** Minor gates fail, risks are documented and mitigated
- **NO GO:** Critical gates fail (critical bugs open, pass rate far below threshold)

### Step 5: Present for Review

Show the complete report. The user can:
- Approve and save
- Edit sections (add context, adjust risk assessment)
- Change output format

### Step 6: Save

Save to `.argus/reports/` in the configured format(s):
- Sprint: `.argus/reports/sprint-<number>.report.<ext>`
- Feature: `.argus/reports/<feature-id>.feature-report.<ext>`
- Daily: `.argus/reports/<YYYY-MM-DD>.daily-report.<ext>`
- Release: `.argus/reports/<version>.release-report.<ext>`

Output format from `config.yaml`:
- `reporting.defaultFormat` — primary format
- `reporting.formats` — generate multiple formats at once

## Anti-Patterns

- **Don't fabricate data** — only report what was actually tested/found
- **Don't hide failures** — the report must be honest, even if the numbers are bad
- **Don't skip the quality gate evaluation** — for release readiness, always evaluate every gate
- **Don't auto-approve releases** — present the verdict, the humans decide

## Integration

- **Reads from:** `.argus/test-cases/`, `.argus/reports/bugs/`, test execution results, `.argus/test-plan.md`, `.argus/config.yaml`
- **Produces:** `.argus/reports/<type>.report.<ext>`
- **Consumed by:** Stakeholders, CI/CD dashboards (JSON format)
