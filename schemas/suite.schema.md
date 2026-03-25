# Suite Definition Schema

Suite files define which test cases and flows to include in a test run, filtered by type and priority.

## File naming

`<suite-name>.suite.yaml` — descriptive kebab-case name. For regression suites triggered by a PR, use `regression-pr-<number>.suite.yaml`.

## YAML Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Human-readable suite name |
| `type` | enum | yes | `smoke` \| `sanity` \| `regression` \| `full` |
| `trigger` | string | no | What prompted this suite (e.g., "PR #456: Fix checkout") |
| `generated` | string | yes | ISO date when suite was generated |
| `cases` | number | yes | Total test case count |
| `estimatedTime` | string | yes | Human-readable time estimate |
| `selection` | object[] | yes (smoke/sanity) | Feature + scenario selections |
| `selection[].feature` | string | yes | Feature ID |
| `selection[].scenarios` | string[] or "all" | yes | Scenario IDs to include, or "all" |
| `priority` | object | yes (regression) | P0/P1/P2 categorized selections |
| `priority.P0` | object[] | yes | Must-run test cases |
| `priority.P1` | object[] | yes | Should-run test cases |
| `priority.P2` | object[] | yes | Can-skip test cases |
| `skipReason` | object | no | Features skipped with explanation |
| `flows` | string[] | no | Flow files to include |
| `browsers` | string[] | no | Override browser list (defaults to test plan) |
| `devices` | string[] | no | Override device list (defaults to test plan) |

## Suite Types

| Type | What it tests | Typical size | Typical time |
|------|--------------|-------------|-------------|
| **Smoke** | Core happy paths — is the app alive? | 5-10% of cases | 2-5 min |
| **Sanity** | Fix area + neighbors — does the fix work? | 10-20% of cases | 5-10 min |
| **Regression** | Impact analysis — did anything break? | 20-60% of cases | 10-30 min |
| **Full** | Everything — pre-release verification | 100% of cases | 30-60 min |

## Examples

See `examples/smoke.suite.example.yaml` and `examples/regression-pr-456.suite.example.yaml`
