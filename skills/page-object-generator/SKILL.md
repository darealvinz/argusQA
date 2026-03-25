---
name: page-object-generator
description: Use when you have a feature file and test cases ready — generates page object classes and test spec files for the configured automation framework
---

# Page Object Generator

Read the feature file, test cases, and test plan, then generate framework-specific page object classes and test spec files. The generated code maps directly to the test cases produced by `test-case-creator` and uses the browser/device matrix from `test-planner`.

## When to Use

- Test cases have been created by `test-case-creator` and are ready for automation
- A test plan with browser/device matrix exists
- You need to scaffold automation code for a specific feature
- Regenerating automation code after a feature changes

## Supported Frameworks

| Target | Framework | Language |
|--------|-----------|----------|
| Web | Playwright | TypeScript |
| Web | Cypress | TypeScript |
| Web | WebdriverIO | TypeScript |
| Mobile | WebdriverIO (Appium) | TypeScript |
| API | Native `fetch` | TypeScript |

## Process

### Step 1: Read Config

Read `.argus/config.yaml`. Extract from the `stack` section:
- `language` — target language for generated code
- `web_framework` — `playwright`, `cypress`, or `webdriverio`
- `mobile_framework` — `webdriverio` (Appium) or none
- `api_approach` — `fetch` or none
- `test_runner` — `playwright`, `jest`, `mocha`, or `cypress`

If no config exists, tell the user to run the `using-argus` setup first.

### Step 2: Read Feature File and Test Cases

Read the feature file from `.argus/features/<id>.feature.md`:
- Identify every UI element mentioned in steps and expected results
- Identify every action performed (fill, click, select, navigate, submit)
- Identify every assertion made (URL check, text check, visibility, value)

**If no feature file exists for this feature — STOP.** Tell the user: "No feature file found for `<id>`. Run `spec-analyzer` first to create one."

Read the test cases from `.argus/test-cases/<id>.testcase.md`:
- Map each test case to its scenario
- Note the test data placeholders used
- Note preconditions and teardown requirements

**If no test case file exists — STOP.** Tell the user: "No test cases found for `<id>`. Run `test-case-creator` first to generate them."

### Step 3: Read Test Plan

Read `.argus/test-plan.md`:
- Extract the browser matrix (browsers, versions, priority)
- Extract the device matrix (devices, viewports, priority)
- Extract the environment URLs

**If no test plan exists:** Use browser/device configuration from `.argus/config.yaml` as fallback. Warn the user: "No test plan found. Using config defaults for browser/device matrix. Run `test-planner` to define a full matrix."

Use this to configure cross-browser/device parameters in the generated spec files.

### Step 4: Generate Page Object Classes

For each page or screen involved in the feature, generate a page object class.

Each page object must include:

**Selectors** — one property per UI element found in the test cases:
- Prefer `id` selectors (`#element-id`) over class or text selectors
- Use accessible role selectors when no ID is available
- Use text-based selectors only as a last resort

**Action methods** — one method per distinct user action:
- Method names should be verb-noun (e.g., `login`, `submitForm`, `selectOption`)
- Accept only the parameters that vary between test cases
- Encapsulate the full sequence of interactions for that action

**Assertion helpers** — one method per distinct expected outcome:
- Method names should be `expect`-prefixed (e.g., `expectLoginSuccess`, `expectErrorMessage`)
- Accept the expected values as parameters
- Encapsulate all assertions for that outcome in one call

Use the example files in `skills/page-object-generator/examples/` as the reference for structure and style:
- Playwright: `playwright-page.example.ts`
- Cypress: `cypress-page.example.ts`
- WebdriverIO: `webdriverio-page.example.ts`
- API: `api-client.example.ts`

### Step 5: Generate Test Spec Files

Generate one spec file per feature. Each spec file must:

- Import the relevant page objects
- Import test data from `.argus/test-data/<id>.data.json` (or use inline fixtures if no data file exists yet)
- Implement each test case as an individual test function
- Name test functions using the test case ID (e.g., `TC-LOGIN-001`)
- Use a data-driven approach: loop over test data sets where the same steps apply to multiple inputs
- Include cross-browser/device configuration derived from the test plan matrix

### Step 6: Save Files

Save generated files to:
- Page objects: `.argus/automation/<target>/pages/<FeatureName>Page.ts`
- Test specs: `.argus/automation/<target>/specs/<feature-id>.spec.ts`

Where `<target>` is `web`, `mobile`, or `api`.

Create the directories if they do not exist.

### Step 7: Present for Review

Show the generated files to the user. Summarize:
- Number of page object classes generated
- Number of test functions generated
- Selectors used and their type (ID, role, text)
- Any selectors that could not be derived from the test cases (flag these for manual review)
- Cross-browser/device configurations included

Wait for user approval before saving.

## Anti-Patterns

- **Don't duplicate selectors** — if two page objects use the same element, extract it to a shared base class or helper.
- **Don't put assertions in action methods** — keep actions (what the user does) separate from assertions (what we verify). This makes failures easier to diagnose.
- **Don't hardcode test data** — page object methods accept parameters; test data lives in the data files, not in the page objects or spec logic.
- **Don't generate selectors you can't verify** — if the test cases don't mention a selector clearly, flag it with a `// TODO: verify selector` comment rather than guessing.
- **Don't skip the cross-browser config** — even if only one browser is P0, scaffold the config for all browsers in the matrix so it can be activated without code changes.

## Integration

- **Reads from:**
  - `.argus/config.yaml` — framework and language settings
  - `.argus/features/<id>.feature.md` — UI elements and actions (from `spec-analyzer`)
  - `.argus/test-cases/<id>.cases.md` — test cases (from `test-case-creator`)
  - `.argus/test-plan.md` — browser/device matrix (from `test-planner`)
  - `.argus/test-data/<id>.data.json` — test data (from `test-data-generator`)
- **Produces:**
  - `.argus/automation/<target>/pages/<FeatureName>Page.ts`
  - `.argus/automation/<target>/specs/<feature-id>.spec.ts`
- **Consumed by:** `test-runner`, `suite-composer`, `report-generator`
