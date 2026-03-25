---
name: accessibility-checker
description: Check WCAG compliance using axe-core automated checks and AI vision analysis
---

# Accessibility Checker

Verify WCAG compliance using a combination of automated tooling (axe-core via Playwright) and AI vision analysis for checks that automation cannot perform.

## Prerequisites

- `.argus/config.yaml` must exist
- For full checks: Playwright browser must be available (runs axe-core, inspects DOM)
- For screenshot-only: AI vision capabilities required (limited checks)

## Input

The user provides one of:
1. **Page URL** (preferred) — enables full axe-core + DOM inspection + AI vision checks
2. **Screenshot** — limited to AI vision checks only (flagged in report)
3. **Feature ID** (optional) — links the report to an existing feature file

## WCAG Level

Read from `.argus/config.yaml`:

```yaml
accessibility:
  wcagLevel: AA            # A | AA | AAA
  ignoreRules: []          # axe-core rule IDs to skip
```

Default: WCAG AA.

## Process

### Step 1: Determine Input Type
- URL → full automated + visual checks
- Screenshot → visual checks only, flag limitations

### Step 2: Automated Checks — axe-core (URL only)
1. Navigate to the page via Playwright
2. Inject and run axe-core with configured WCAG level
3. Collect all violations with impact level, affected elements, and WCAG criteria
4. Filter out any rules in `ignoreRules` config

### Step 3: Visual Checks — AI Vision
AI vision analyzes the page (screenshot or live capture) for:
- **Focus indicators** — Are focus rings visible on interactive elements?
- **Logical reading order** — Does content flow make sense visually?
- **Touch target sizing** — Are interactive elements ≥44x44px (WCAG AA)?
- **Text over images** — Is text readable when overlaid on images?
- **Motion/animation** — Are there animations that could cause issues (no pause, auto-playing)?

### Step 4: Color Contrast Analysis
- **URL mode:** Extract exact color values from computed CSS styles. Calculate contrast ratios mathematically.
- **Screenshot mode:** AI estimates colors (flagged as approximate). Exact ratios not available.

Required ratios (WCAG AA):
- Normal text (< 18px or < 14px bold): 4.5:1
- Large text (≥ 18px or ≥ 14px bold): 3:1
- UI components and graphical objects: 3:1

### Step 5: Heading Hierarchy
Inspect DOM for heading elements (h1–h6). Check:
- No skipped levels (e.g., h1 → h3)
- Logical nesting
- Single h1 per page (recommended, not required)

### Step 6: Form Accessibility
For each form field, check:
- Associated `<label>` element (via `for` attribute)
- `aria-label` or `aria-labelledby` if no visible label
- Required field indication (visual + programmatic)
- Error message association (`aria-describedby`)

### Step 7: Keyboard Navigation (URL only)
Test via Playwright keyboard interaction:
- Tab order follows visual order
- All interactive elements are focusable
- Enter/Space activates buttons and links
- Escape closes modals/dropdowns
- Arrow keys work in menus/tabs

### Step 8: Dynamic Content (URL only)
Test via Playwright interaction:
- Modals: `role="dialog"`, focus trap, escape to close
- Dropdowns: `role="listbox"` or `role="menu"`, keyboard navigable
- Toasts/alerts: `role="alert"` or `aria-live` region
- Tabs: `role="tablist"`, arrow key navigation
- Accordions: `aria-expanded` state management

### Step 9: Generate Report
Compile findings following `schemas/accessibility.schema.md`.

## Screenshot-Only Limitations

When only a screenshot is provided, the report clearly flags:

| Check | Available | Notes |
|-------|-----------|-------|
| axe-core automated | ❌ Skipped | Requires DOM access |
| Color contrast | ⚠️ Approximate | AI estimation, not computed |
| Heading hierarchy | ❌ Skipped | Requires DOM |
| Form accessibility | ⚠️ Partial | Visual checks only, no ARIA |
| Keyboard navigation | ❌ Skipped | Requires interaction |
| Dynamic content | ❌ Skipped | Requires interaction |
| Visual checks (AI) | ✅ Full | Focus indicators, layout, touch targets |

## Output

Save report to: `.argus/reports/accessibility/<feature-id>.accessibility.md`

Reference example: `examples/login.accessibility.example.md`
Reference schema: `schemas/accessibility.schema.md`

## After Checking

Present findings to the user:

```
Accessibility check complete. WCAG AA: FAIL (4 issues).

Critical:
- Color contrast on forgot password link (2.6:1, needs 4.5:1)

Serious:
- Remember me checkbox has no label
- Show password button has no accessible name

Want me to:
  A) File bugs for accessibility violations → invokes bug-reporter
  B) Check UI design match too → invokes ui-verifier
  C) Done — I'll review the report
```

## Human-in-the-Loop

- **Before checking:** Confirm URL/screenshot and WCAG level with user
- **After checking:** Present full report. User decides which issues to fix, file as bugs, or accept as known limitations
- **Screenshot-only:** Warn user that results are limited and recommend URL access for comprehensive checks
