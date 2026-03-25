---
name: flow-composer
description: Use when you need to compose end-to-end test flows by chaining features — builds E2E flows from feature file dependency graphs
---

# Flow Composer

Compose end-to-end test flows by chaining scenarios from multiple feature files. Uses the `depends_on`/`next` metadata in feature frontmatter to build a dependency graph and resolve paths.

## When to Use

- User wants to create an E2E test flow (e.g., "build the purchase flow from login to payment")
- User wants to see all possible flows in the project
- User wants to compose edge case flows across features

## Process

### Step 1: Read Feature Files

Read all feature files from `.argus/features/`. Extract the dependency graph from frontmatter:
- `id` — the node
- `depends_on` — incoming edges
- `next` — outgoing edges
- `scenarios` — available scenarios per feature

### Step 2: Build Dependency Graph

Construct the graph and validate:

```
login (entry-point)
  ├→ dashboard
  ├→ add-to-cart → checkout → payment
  └→ order-history → reorder → payment
```

**Validation checks:**
- **Circular dependencies** → Flag as error: "Feature A depends on B, B depends on A. Please fix the feature files."
- **Missing features** → Flag as gap: "Checkout references 'payment' in `next`, but no payment.feature.md exists."
- **Orphan features** → Warn: "Feature 'search' has no `depends_on` and no other feature lists it in `next`. Is it standalone?"

### Step 3: Determine User Intent

The user can request flows in three ways:

**A) Path resolution:** "Build the flow from login to payment"
- Find all paths from `login` to `payment` in the graph
- If multiple paths exist, present them:
  ```
  Found 2 paths from login to payment:
  1. login → add-to-cart → checkout → payment
  2. login → order-history → reorder → payment
  Which one? (or both?)
  ```

**B) AI-suggested flows:** "Suggest common flows"
- Identify entry points (features with empty `depends_on`)
- Identify exit points (features with empty `next`)
- Propose flows for every entry-to-exit path
- Categorize: happy path flows, edge case flows, security flows

**C) Manual definition:** "Create a flow with these steps: login → search → add-to-cart → checkout"
- Validate that each step has the required `depends_on`/`next` links
- If links are missing, warn but allow (user overrides the graph)

### Step 4: Select Scenarios

For each feature in the flow, ask which scenarios to include:

**Happy path flow:** Pick the `happy` scenario from each feature.

**Edge case flow:** Pick happy scenarios for prerequisite features, then specific edge/negative scenarios for the target feature:
```yaml
steps:
  - feature: login
    scenario: login-success          # happy — just get past login
  - feature: add-to-cart
    scenario: add-single-item        # happy — just get item in cart
  - feature: checkout
    scenario: checkout-standard      # happy — proceed to payment
  - feature: payment
    scenario: [payment-expired-card, payment-timeout]  # edge — test failures here
```

**Fan-out:** When a step's scenario is an array, each scenario becomes a separate test run sharing the same prefix steps.

### Step 5: Generate Flow File

Create the flow file following `schemas/flow.schema.md`:

```yaml
name: Happy Purchase Flow
type: happy
description: End-to-end purchase from login to payment confirmation
steps:
  - feature: login
    scenario: login-success
  - feature: add-to-cart
    scenario: add-single-item
  - feature: checkout
    scenario: checkout-standard
  - feature: payment
    scenario: payment-success
```

### Step 6: Present for Review

Show the flow with a visual chain:
```
login (login-success) → add-to-cart (add-single-item) → checkout (checkout-standard) → payment (payment-success)
```

Highlight:
- Number of features in the chain
- Number of test runs (1 for linear, N for fan-out)
- Any warnings about missing links

### Step 7: Save

Save to `.argus/flows/<flow-name>.flow.yaml`.

Reference example: `examples/happy-purchase.flow.example.yaml`

## Anti-Patterns

- **Don't create flows without feature files** — if features don't exist yet, suggest running `spec-analyzer` first
- **Don't auto-resolve ambiguous paths** — if multiple paths exist, present options and let the user choose
- **Don't ignore the dependency graph** — if the user requests a flow that skips a dependency, warn them
- **Don't create monolithic flows** — a 15-step flow is hard to debug. Suggest breaking into smaller sub-flows if the chain is longer than 6-7 features

## Integration

- **Reads from:** `.argus/features/*.feature.md`
- **Produces:** `.argus/flows/<flow-name>.flow.yaml`
- **Consumed by:** `page-object-generator` (generates chained E2E test specs), `suite-composer` (includes flows in test suites), `test-runner` (executes flow-based tests)
