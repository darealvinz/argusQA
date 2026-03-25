---
name: ui-verifier
description: Compare design images against live implementation for visual verification
---

# UI Verifier

Compare any design image (Figma export, wireframe, screenshot, hand-drawn sketch) against the actual implementation to find visual discrepancies.

## Prerequisites

- `.argus/config.yaml` must exist
- For quantitative checks: Playwright browser must be available (DOM/CSS inspection)
- For screenshot-only comparison: AI vision capabilities required

## Input

The user provides:
1. **Design image** — any visual reference (Figma export, Adobe XD, Sketch, wireframe, screenshot)
2. **Implementation** — one of:
   - Live app URL (preferred — enables DOM/CSS inspection)
   - Screenshot of the implementation
3. **Feature ID** (optional) — links the report to an existing feature file
4. **Viewport** (optional) — specific viewport to test (defaults to config desktop viewport)

## Comparison Methodology

### Qualitative Checks (AI Vision)

AI vision analyzes both images for:
- **Element presence** — Are all design elements present in the implementation?
- **Layout structure** — Does the arrangement match?
- **Visual hierarchy** — Is the emphasis correct (primary CTA dominant, secondary elements subdued)?
- **Content correctness** — Do labels, headings, and copy match?

### Quantitative Checks (DOM/CSS Inspection)

When a live URL is provided, Playwright inspects computed CSS styles for:
- **Colors** — Background, text, border colors (hex values)
- **Spacing** — Margins, paddings (px)
- **Typography** — Font sizes, font families, font weights
- **Dimensions** — Width, height, border-radius
- **Layout** — Flexbox/grid properties, alignment

### Tolerance

Read from `.argus/config.yaml` under `uiVerification`:

```yaml
uiVerification:
  spacingTolerance: 2       # pixels
  fontSizeTolerance: 1      # pixels
  colorMatch: exact          # exact | close (close allows ±5 on each RGB channel)
```

Default: 2px spacing tolerance, 1px font size tolerance, exact color match.

## Process

### Step 1: Analyze Design Image
Use AI vision to identify:
- All UI elements (buttons, inputs, labels, images, icons, etc.)
- Layout structure (grid, centered, sidebar, etc.)
- Color scheme (primary, secondary, accent, background)
- Typography hierarchy

### Step 2: Capture Implementation
- If URL provided: navigate via Playwright, take screenshot at specified viewport
- If screenshot provided: use the provided image directly

### Step 3: Element Presence Check
Compare design elements against implementation:
- ✅ Present — element found in both
- ❌ Missing — element in design but not in implementation
- ⚠️ Different — element exists but differs significantly
- ⚠️ Extra — element in implementation but not in design

### Step 4: Quantitative Comparison (URL only)
For each identified element, inspect computed CSS:
1. Query the element in the DOM
2. Get computed styles (`getComputedStyle`)
3. Compare against design values
4. Flag mismatches outside tolerance

### Step 5: Cross-Reference with Spec
If a feature file exists for this feature:
- Check if elements in the design are documented in the spec
- Flag elements in the design that aren't in the spec ("Missing from spec")

### Step 6: Generate Report
Compile findings into a UI verification report following `schemas/ui-verification.schema.md`.

## Dynamic Content Handling

Users can mark regions as dynamic to exclude from comparison:

```
User: "Ignore the user avatar and the timestamp in the header"
```

These regions are listed in the report but excluded from match percentage calculation.

## Output

Save report to: `.argus/reports/ui-verification/<feature-id>.ui-verification.md`

Reference example: `examples/login.ui-verification.example.md`
Reference schema: `schemas/ui-verification.schema.md`

## After Verification

Present findings to the user:

```
UI Verification complete. Match: 92%.

Found:
- 2 color/spacing mismatches
- 1 missing element
- 1 extra element not in design

Want me to:
  A) File bugs for the mismatches → invokes bug-reporter
  B) Check accessibility on this page too → invokes accessibility-checker
  C) Done — I'll review the report
```

## Limitations

- **Not pixel-perfect diffing** — This is AI-assisted comparison, not automated visual regression testing. Use tools like Percy/Chromatic for pixel-level diffing.
- **Design interpretation** — AI may misinterpret ambiguous design elements. Always review the report.
- **Responsive** — Each verification run covers one viewport. Run multiple times for responsive checks.
- **Not Figma-specific** — Works with any visual input. No Figma API integration required.

## Human-in-the-Loop

- **Before verification:** Confirm design image and target URL/viewport with user
- **Dynamic regions:** Ask user to identify dynamic content areas before comparison
- **After verification:** Present full report. User decides which mismatches are bugs vs intentional differences
