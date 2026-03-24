# Feature File Schema

Feature files use markdown with YAML frontmatter. They are the core artifact that all other skills build upon.

## File naming

`<id>.feature.md` — where `<id>` matches the frontmatter `id` field.

## Frontmatter (YAML)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique kebab-case identifier (e.g., `login`, `add-to-cart`) |
| `tags` | string[] | yes | Categorization tags (e.g., `[auth, entry-point]`) |
| `depends_on` | string[] | yes | Feature IDs that must complete before this feature (empty array if none) |
| `next` | string[] | yes | Feature IDs that can follow this feature (empty array if none) |
| `scenarios` | object[] | yes | List of test scenarios |
| `scenarios[].id` | string | yes | Unique scenario identifier (e.g., `login-success`) |
| `scenarios[].type` | enum | yes | `happy` \| `negative` \| `edge` \| `security` |

## Body Structure

```
# [Feature Name]

## Requirements
- Bullet list of requirements extracted from spec
- Each requirement should be testable

## Scenario: [scenario-id]

### Description
Brief description of what this scenario tests.

### Preconditions
- What must be true before this scenario starts

### Steps
1. Step-by-step actions

### Expected Results
- What should happen after the steps are completed
```

## Example

See `examples/login.feature.example.md`
