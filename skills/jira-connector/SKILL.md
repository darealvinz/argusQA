---
name: jira-connector
description: Use when you need to pull a ticket from Jira or push a bug report to Jira — handles Jira REST API integration
---

# Jira Connector

Integrate with Jira to pull ticket data for spec analysis and push bug reports from test results. Acts as the bridge between Argus and Jira.

## When to Use

- User says "pull ticket LOGIN-123" or "get the spec from Jira"
- `bug-reporter` wants to push a bug to Jira
- User wants to sync test results with Jira

## Prerequisites

Jira must be configured in `.argus/config.yaml`:

```yaml
integrations:
  jira:
    enabled: true
    baseUrl: "https://myteam.atlassian.net"
    projectKey: "MYAPP"
```

Authentication uses environment variables:
- `JIRA_EMAIL` — Jira account email
- `JIRA_API_TOKEN` — Jira API token (generated from Atlassian account settings)

If not configured, guide the user through setup.

## Capabilities

### Pull Ticket

Fetch a Jira ticket and extract structured data for `spec-analyzer`:

1. **Input:** Ticket ID (e.g., `LOGIN-123`)
2. **API call:** `GET /rest/api/3/issue/{ticketId}`
3. **Extract:**
   - Summary (title)
   - Description (convert Atlassian Document Format to markdown)
   - Acceptance criteria (from description or custom field)
   - Attachments (list URLs)
   - Linked issues (blocks, is-blocked-by, relates-to)
   - Labels and components
   - Priority and status
4. **Output:** Structured data passed to `spec-analyzer` for feature file generation

### Push Bug Report

Create a Jira issue from an Argus bug report:

1. **Input:** Bug report from `.argus/reports/bugs/BUG-<NUMBER>.report.md`
2. **Map fields:**
   - Title → Summary
   - Description → Description (convert markdown to Atlassian Document Format)
   - Severity → Priority (Critical=Highest, Major=High, Minor=Medium, Trivial=Low)
   - Feature → Component (if component exists in Jira)
   - TestcaseID → Label
   - Evidence → Attachments
3. **API call:** `POST /rest/api/3/issue`
4. **Output:** Created issue key (e.g., `MYAPP-456`)
5. **Update local bug report** with Jira issue key

### Sync Status

Check the status of previously pushed bugs:

1. **Input:** Bug report with Jira issue key
2. **API call:** `GET /rest/api/3/issue/{issueKey}`
3. **Output:** Current status (Open, In Progress, Resolved, Closed)

## Error Handling

- **401 Unauthorized:** "Jira authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN environment variables."
- **404 Not Found:** "Ticket [ID] not found. Check the ticket ID and project key."
- **403 Forbidden:** "No permission to access [ID]. Check your Jira project permissions."
- **Network error:** "Cannot reach Jira at [baseUrl]. Check the URL and your network connection."

## Anti-Patterns

- **Don't store credentials in config** — always use environment variables
- **Don't push to Jira without review** — always show the draft first
- **Don't assume Jira field mappings** — different Jira projects have different custom fields. Ask if unsure.
- **Don't silently fail** — always surface API errors to the user

## Integration

- **Reads from:** `.argus/config.yaml` (Jira settings), `.argus/reports/bugs/` (bug reports to push)
- **Produces:** Structured ticket data (for `spec-analyzer`), Jira issue keys (for bug reports)
- **Consumed by:** `spec-analyzer` (ticket data), `bug-reporter` (push destination), `report-generator` (Jira links in reports)
