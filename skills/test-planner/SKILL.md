---
name: test-planner
description: Use when you need to define test scope — browsers, devices, viewports, environments, and test types for a project or feature
---

# Test Planner

Define the testing scope and environment configuration before any test generation begins. The test plan feeds into every downstream skill — page-object-generator uses the browser/device matrix, test-runner uses the environments, ui-verifier uses the viewport boundaries.

## When to Use

- Starting testing on a new project
- Beginning a new sprint or feature
- When the test scope needs to change (new browser, new device, new environment)

## Process

### Step 1: Read Existing Config

Read `.argus/config.yaml` to understand what's already configured:
- Browsers and devices
- Environments
- Viewport breakpoints
- Stack settings

If no config exists, prompt the user to run the `using-argus` setup first.

### Step 2: Gather Scope

Ask the user one question at a time:

1. **What are we testing?** (specific feature, full sprint, or entire project)
2. **Which environments?** (present the configured environments, ask which to include)
3. **Which browsers?** (present configured browsers, ask about priorities)
4. **Which devices?** (present configured devices, ask about priorities)
5. **What test types to include?**
   - Functional (UI + API + DB)
   - Visual verification
   - Accessibility (WCAG level?)
   - Security
   - Cross-browser
   - Responsive
6. **Anything explicitly out of scope?** (e.g., performance, penetration testing)

### Step 3: Generate Test Plan

Create `.argus/test-plan.md` with the following structure:

```markdown
# Test Plan: [Scope Name]

**Created:** [date]
**Scope:** [feature / sprint / project]

## Browser Matrix
| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome  | Latest, Latest-1 | P0 |
| Firefox | Latest | P1 |

## Device Matrix
| Device | Type | Viewport | Priority |
|--------|------|----------|----------|
| Desktop | Chrome/Windows | 1920x1080 | P0 |
| iPhone 14 | Mobile | 390x844 | P0 |

## Viewport Boundaries
| Breakpoint | Min | Max |
|------------|-----|-----|
| Mobile | 320px | 480px |
| Tablet | 481px | 1024px |
| Desktop | 1025px | 1920px |

## Test Environments
| Environment | URL | Purpose |
|-------------|-----|---------|
| Dev | dev.app.com | During development |
| Staging | staging.app.com | Pre-release |

## Test Types Included
- ✅ Functional (UI + API + DB)
- ✅ Visual verification
- ✅ Accessibility (WCAG AA)
- ✅ Security
- ✅ Cross-browser
- ✅ Responsive

## Out of Scope
- Performance / load testing
- Penetration testing
```

### Step 4: Present for Review

Show the generated plan to the user. Wait for approval before saving.

### Step 5: Save

Save to `.argus/test-plan.md`. If a test plan already exists, ask the user whether to overwrite or create a versioned copy.

## Anti-Patterns

- **Don't guess browsers/devices** — always ask. Different projects have different requirements.
- **Don't skip the out-of-scope section** — explicitly stating what's NOT being tested prevents misunderstandings.
- **Don't include environments the user hasn't configured** — only offer what's in `config.yaml`.

## Integration

This plan is read by:
- `page-object-generator` — for browser/device configuration in generated code
- `test-runner` — for which environments and browsers to execute against
- `ui-verifier` — for viewport boundary definitions
- `suite-composer` — for P0/P1/P2 prioritization
- `report-generator` — for coverage breakdown by browser/device
