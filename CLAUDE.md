# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Argus is a skill pack for AI coding agents that provides QA testing superpowers. It is NOT a traditional codebase with source code to compile — it is a collection of **SKILL.md files** that instruct AI agents how to perform QA tasks, plus schemas, examples, and hooks that support those skills.

## Key Commands

```bash
# Export test cases to styled Excel
python scripts/export-testcase.py .argus/test-cases/<feature>.testcase.md [output.xlsx]

# Requires openpyxl
pip install openpyxl
```

There are no build, lint, or test commands. The project is documentation-driven.

## Architecture

**17 skills** organized in a lifecycle flow:

```
PLAN → GENERATE → COMPOSE → EXECUTE → REPORT
```

- **Plan:** test-planner, spec-analyzer
- **Generate:** test-case-creator, page-object-generator, test-data-generator
- **Compose:** flow-composer, suite-composer
- **Execute:** test-runner, test-maintainer
- **Report:** bug-reporter, report-generator, report-exporter
- **Discover/Verify:** exploratory-tester, ui-verifier, accessibility-checker
- **Integrate:** jira-connector
- **Meta:** using-argus (onboarding)

Each skill is a single `skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`) and markdown instructions.

## How Skills Work

Every skill follows: **AI proposes → human reviews → human approves → artifact saved**. Never auto-approve or skip human review.

Skills read/write to the `.argus/` directory in the user's project:

```
.argus/
├── config.yaml        # Project config (stack, browsers, environments, quality gates)
├── features/          # Feature files from spec-analyzer
├── test-cases/        # Test cases from test-case-creator
├── flows/             # E2E flows from flow-composer
├── automation/        # Page objects and specs from page-object-generator
├── reports/           # All reports (discovery/, bugs/, analysis/, etc.)
├── artifacts/         # Exported HTML and Excel files from report-exporter
├── test-data/         # Generated test data
└── suites/            # Test suite definitions
```

## Schemas and Examples

- `schemas/*.schema.md` — define the exact structure for every artifact type (12 schemas)
- `examples/*` — reference implementations showing correct output (14 examples)

When generating any artifact, always follow the matching schema and reference the example.

## Critical Conventions

**No-spec workflow:** If user has no spec, the flow is: explore app (exploratory-tester) → user confirms discovery → generate feature file (spec-analyzer) → then generate test cases. Never generate test cases without an approved feature file.

**Test case ID format:** `TC-[FEATURE-ID]-[NUMBER]` with ranges per layer: UI 001-009, Functional 010-019, API 020-029, Security 030-039, Data 040-049. Continue sequentially if a layer needs more.

**Black box techniques:** test-case-creator applies 6 formal techniques (Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition, Error Guessing, Pairwise). Test cases are tagged with `[EP]`, `[BVA]`, `[DT]`, `[ST]`, `[EG]`, `[PW]`.

**5 testing layers:** UI, Functional, API, Security, Data. AI proposes which layers apply; user confirms before generation.

**report-generator vs report-exporter:** report-generator *creates* report content (sprint/feature/daily/release markdown). report-exporter *converts* existing markdown artifacts into shareable formats (xlsx, html). They don't overlap.

## Hooks

`hooks/argus-hooks.yaml` defines 17 automation hooks that fire on events like session start, skill invocation, test failure, etc. These enable the agent to proactively suggest next steps in the workflow.

## Stack Support

Skills generate artifacts in the user's configured stack: TypeScript/JavaScript/Python/Java, with Playwright/Cypress/Selenium/WebdriverIO, and Vitest/Jest/Pytest/JUnit. The stack is set in `.argus/config.yaml`.
