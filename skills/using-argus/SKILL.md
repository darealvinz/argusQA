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

Reference the example config at `config/config.example.yaml` for valid values.

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
