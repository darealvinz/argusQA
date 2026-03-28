---
name: report-exporter
description: Use when you need to export Argus artifacts to shareable formats — converts test cases to Excel (.xlsx), discovery reports and bug reports to styled HTML
---

# Report Exporter

Export Argus markdown artifacts into presentation-ready files for sharing with stakeholders, team leads, and project managers.

This skill does NOT create report content — that is `report-generator`'s job. This skill only **formats and exports** existing markdown content into shareable file types.

## When to Use

- User says "export", "generate xlsx", "generate html", "share report"
- User wants to send test cases, discovery findings, or bug reports to someone
- After running `test-case-creator`, `exploratory-tester`, or `bug-reporter`

## Export Types

| Type | Source | Output | Format |
|------|--------|--------|--------|
| Test Cases | `.argus/test-cases/<feature>.testcase.md` | `<feature>.testcase.xlsx` | Excel workbook |
| Discovery | `.argus/reports/discovery/discovery-<scope>.report.md` | `<feature>.discovery.html` | Styled HTML |
| Bug Report | `.argus/reports/bugs/BUG-*.report.md` (filtered by feature) | `<feature>.bugreport.html` | Styled HTML |

All outputs are written to `.argus/artifacts/`.

## Process

### Step 1: Determine Export Type

Ask the user what they want to export:

| Option | Input Needed |
|--------|-------------|
| `testcase` | Feature ID (e.g., "cl-final-2025-event-page") |
| `discovery` | Scope or feature ID |
| `bugreport` | Feature ID to filter bugs |
| `all` | Feature ID — exports all available types |

If the user doesn't specify, list what's available in `.argus/` and let them choose.

### Step 2: Locate Source Files

Find the source markdown file(s):

- **Test cases:** Look in `.argus/test-cases/` for `<feature>.testcase.md`
- **Discovery:** Look in `.argus/reports/discovery/` for `discovery-<scope>.report.md`
- **Bug reports:** Look in `.argus/reports/bugs/` for all `BUG-*.report.md` files, then filter by `**Feature:** <feature-id>` in the content

**If source file not found:** Tell the user: "No [type] found for [feature]. Run [skill-name] first to generate the source data."

| Missing Source | Suggest |
|---------------|---------|
| Test cases | Run `test-case-creator` |
| Discovery report | Run `exploratory-tester` |
| Bug reports | Run `bug-reporter` |

### Step 3: Generate the Artifact

Follow the format instructions for each export type below.

### Step 4: Present Output

Tell the user:
- The output file path (e.g., `.argus/artifacts/<feature>.testcase.xlsx`)
- Suggest opening the file: "Open the file in your browser (HTML) or Excel (xlsx) to review."

### Step 5: Confirm or Adjust

Ask: "Does the export look good, or do you want any changes?"

If changes requested, regenerate. If confirmed, suggest next steps:
- "Export another artifact type?"
- "Share with your team"

---

## Export Format: Test Case XLSX

Generate an Excel file using Python + openpyxl. Run the script via Bash tool.

### Sheet 1: Summary

Layout (starting at row 1):

| Row | A | B |
|-----|---|---|
| 1 | **Feature** | `<feature-id>` |
| 2 | **Export Date** | `<YYYY-MM-DD>` |
| 3 | **Generated From** | `<source .testcase.md filename>` |
| 4 | *(empty row)* | |
| 5 | **Total Test Cases** | `<count>` |
| 6 | *(empty row)* | |
| 7 | **Priority** | **Count** |
| 8 | High | `<count>` |
| 9 | Medium | `<count>` |
| 10 | Low | `<count>` |
| 11 | *(empty row)* | |
| 12 | **Type** | **Count** |
| 13 | Positive | `<count>` |
| 14 | Negative | `<count>` |
| 15 | *(empty row)* | |
| 16 | **Status** | **Count** |
| 17 | Pass | `<count>` |
| 18 | Fail | `<count>` |
| 19 | Not Run | `<count>` |

**Styling:**
- Column A labels: bold, font size 11
- Column B values: font size 11
- Row 1 (Feature): blue fill (#2563EB), white text, bold
- Row 7, 12, 16 (section headers): light gray fill (#F1F5F9), bold
- Column A width: 20, Column B width: 40

### Sheet 2: Test Cases

9 columns:

| Column | Header | Width |
|--------|--------|-------|
| A | ID | 18 |
| B | Test Case Title | 45 |
| C | Type | 12 |
| D | Test Data | 25 |
| E | Steps | 50 |
| F | Expected Result | 50 |
| G | Priority | 12 |
| H | Known Bug / Notes | 30 |
| I | Status | 12 |

**Styling:**
- Header row: blue fill (#2563EB), white bold text, auto-filter enabled, frozen row
- All cells: text wrap enabled, top-aligned, font size 10
- Rows with "Known Bug / Notes" content: yellow fill (#FEF3C7) on column H

**Data mapping from source `.testcase.md`:**

The source markdown has tables with 4 columns: `TestcaseID | Test Step | Test Data | Expected Result`

Map to the 9-column xlsx format:
- **ID** → TestcaseID from source
- **Test Case Title** → Derive a short title from the Test Step (first meaningful phrase)
- **Type** → Determine from section context: if under "### Positive" header → "Positive", if under "### Negative" → "Negative"
- **Test Data** → Test Data from source (use "—" if empty)
- **Steps** → Full Test Step from source
- **Expected Result** → Expected Result from source
- **Priority** → Infer from test content: login/purchase/security = High, navigation/display = Medium, cosmetic/trivial = Low. Use judgment.
- **Known Bug / Notes** → If test step text contains "KNOWN BUG:" extract that note, otherwise leave blank
- **Status** → Leave blank (not executed yet)

**Python script pattern:**

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# -- Sheet 1: Summary --
ws_summary = wb.active
ws_summary.title = "Summary"
# ... populate summary data ...

# -- Sheet 2: Test Cases --
ws_cases = wb.create_sheet("Test Cases")
# ... populate test case rows ...

wb.save(".argus/artifacts/<feature>.testcase.xlsx")
```

Run this script using the Bash tool: `python -c "<script>"`

If the script is too long for inline execution, write it to a temp file first:
1. Write script to `.argus/artifacts/_export_temp.py`
2. Run: `python .argus/artifacts/_export_temp.py`
3. Delete: `rm .argus/artifacts/_export_temp.py`

---

## Export Format: Discovery Report HTML

Generate a self-contained HTML file with inline CSS.

### Design Language

- **Header:** Blue gradient (`linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)`)
- **Brand label:** "Argus QA — Discovery Report"
- **Meta cards:** Pages Found, UI Elements, API Calls, Max Depth, Date
- **Status badge:** "COMPLETE" (green) or "PARTIAL" (amber) from frontmatter `status`

### Sections

1. **Summary** — icon: clipboard, bg: light blue. Render the summary paragraph with key terms in `<strong>`.
2. **Pages Discovered** — icon: page, bg: blue. Table: #, Page, URL, Notes.
3. **UI Elements** — one section per page. Icon: target, bg: pink. Table: Element, Selector, Type, Interactive, Notes. Use color-coded tags for Type (input=yellow, link=blue, button=pink, image=green, dropdown=purple, display=gray, iframe=orange, dialog=red) and Interactive (Yes=green, No=gray).
4. **API Calls Observed** — icon: globe, bg: green. Table: Method, Endpoint, Status, Type, Notes. Color-code status (200=green, 204=blue, 4xx=red).
5. **Behaviors Noted** — icon: lightning, bg: amber. List of behavior items with bold title and description paragraph.
6. **Destructive Actions Found** — icon: stop, bg: red. Table: Action, Location, Why Flagged. Red tags on action names.
7. **Questions for Tester** — icon: question, bg: purple. Numbered purple circles with question text.

### Footer

`Generated by Argus QA — report-exporter • <YYYY-MM-DD>`

### Reference

Use `.argus/artifacts/discovery-cl-final-2025.html` as the exact reference for CSS and HTML structure. Replicate that styling for all discovery exports.

---

## Export Format: Bug Report HTML

Generate a self-contained HTML file consolidating ALL bugs for a feature.

### Design Language

- **Header:** Red gradient (`linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)`)
- **Brand label:** "Argus QA — Bug Report"
- **Meta cards:** Critical count, Major count, Minor count, Trivial count, Date
- **Status badge:** "OPEN" (white semi-transparent)

### Sections

1. **Severity Distribution Bar** — proportional colored bar (red=critical, amber=major, blue=minor, gray=trivial) with legend below.
2. **Bug Cards** — one per bug, all expanded by default, collapsible on click. Each card has:
   - Left border color by severity (red/amber/blue/gray)
   - Header row: BUG-ID (monospace), title, severity badge
   - Detail grid (2x2): Feature, Test Case, Found By, Environment
   - Description paragraph
   - Steps to Reproduce (numbered list with blue circle step numbers)
   - Expected Result (green box with green border)
   - Actual Result (red box with red border)
   - Evidence (monospace code block, gray background)

### JavaScript

Include a `toggleBug(header)` function that toggles `.collapsed` class on the bug body and rotates the arrow icon.

### Footer

`Generated by Argus QA — report-exporter • <YYYY-MM-DD>`

### Reference

Use `.argus/artifacts/demo-bugreport.html` as the exact reference for CSS and HTML structure.

---

## Anti-Patterns

- Don't generate content — only format what already exists in `.argus/`
- Don't modify source markdown files
- Don't skip user confirmation before finalizing output
- Don't hardcode feature names — always derive from the source file
- Don't create artifacts for sources that don't exist — warn and suggest the right skill

## Integration

- **Reads from:** `.argus/test-cases/`, `.argus/reports/discovery/`, `.argus/reports/bugs/`
- **Produces:** `.argus/artifacts/`
- **Consumed by:** Stakeholders, team leads, project managers (shareable artifacts)
