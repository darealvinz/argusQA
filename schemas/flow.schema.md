# Flow File Schema

Flow files define end-to-end test flows by chaining scenarios from multiple feature files.

## File naming

`<flow-name>.flow.yaml` — descriptive kebab-case name.

## YAML Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Human-readable flow name |
| `type` | enum | yes | `happy` \| `edge` \| `negative` \| `security` |
| `description` | string | no | What this flow validates |
| `steps` | object[] | yes | Ordered list of feature+scenario pairs |
| `steps[].feature` | string | yes | Feature ID (must match a `.feature.md` file) |
| `steps[].scenario` | string or string[] | yes | Scenario ID(s) from that feature. Array means "run each as a separate test, reusing preceding steps" |
| `browsers` | string[] | no | Override browser list for this flow (defaults to test plan) |
| `devices` | string[] | no | Override device list for this flow (defaults to test plan) |

## Example

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

## Edge Case Flow (fan-out)

```yaml
name: Payment Failure Flows
type: edge
description: Test various payment failure scenarios
steps:
  - feature: login
    scenario: login-success
  - feature: add-to-cart
    scenario: add-single-item
  - feature: checkout
    scenario: checkout-standard
  - feature: payment
    scenario: [payment-expired-card, payment-timeout, payment-insufficient-funds]
    # Generates 3 separate test runs, reusing the same preceding steps
```

See `examples/happy-purchase.flow.example.yaml`
