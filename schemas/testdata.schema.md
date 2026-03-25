# Test Data File Schema

Test data files contain structured data sets for test cases, organized by scenario type.

## File naming

`<feature-id>.data.json` — where `<feature-id>` matches the feature `id`.

## JSON Structure

```json
{
  "featureId": "string — matches the feature ID",
  "generatedFrom": "string — testcase file that was input",
  "dataSets": {
    "valid": [
      {
        "name": "string — descriptive name (e.g., 'standard-user')",
        "description": "string — what this data set tests",
        "data": {
          "fieldName": "value"
        }
      }
    ],
    "invalid": [
      {
        "name": "string — descriptive name (e.g., 'empty-email')",
        "description": "string — what validation this triggers",
        "data": {
          "fieldName": "value"
        },
        "expectedError": "string — expected error message"
      }
    ],
    "edge": [
      {
        "name": "string — descriptive name (e.g., 'max-length-email')",
        "description": "string — boundary condition being tested",
        "data": {
          "fieldName": "value"
        }
      }
    ],
    "security": [
      {
        "name": "string — descriptive name (e.g., 'sql-injection')",
        "description": "string — attack vector being tested",
        "data": {
          "fieldName": "value"
        },
        "expectedBehavior": "string — how the app should handle this"
      }
    ]
  }
}
```

## Notes
- Data sets align with scenario types in feature files (valid=happy, invalid=negative, edge=edge, security=security)
- Each data set should be self-contained — a tester can use it without referencing other data sets
- Use realistic but fake data (not production data)
- For sensitive fields, use obviously fake values (e.g., "test@example.com", "P@ssword123")
