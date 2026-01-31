# Audit Logging System
Version: 1.0.0
Scope: Defines the schema, storage, retrieval, and retention policies for the QuantLab Audit Log.

The Audit Log is the immutable system of record for all state changes, rule violations, and trade executions. It is the primary source of truth for:
- Prop-firm dashboards
- Trader dispute resolution
- Compliance reporting

## 1. Log Schema
All audit logs follow the common event envelope defined in `event-contracts.md`.

```json
{
  "eventType": "string",
  "tenantId": "string",
  "accountId": "string",
  "timestamp": "ISO 8601 UTC",
  "meta": {
    "configVersion": "1.0.0",
    "ruleEngineVersion": "1.0.0",
    "schemaVersion": "1.0.0",
    "traceId": "string"
  },
  "data": { ... }
}
```

## 2. Tenant Isolation
Audit logs are physically isolated by tenant and account ID to ensure data sovereignty and simplify access control.
**Storage Structure**:
`/audit-data/{tenantId}/{accountId}/{YYYY}/{MM}/{DD}/events.jsonl`

## 3. Retention Policies
- **Hot Storage** (Immediate Access): 90 days (configurable via `usage-config`).
- **Cold Storage** (Archive): 7 years (for compliance).
- **Purging**: Data older than the retention period is automatically deleted or archived to Glacier storage.

## 4. Versioning
- **Schema Version**: Tracks changes to the JSON structure.
- **Config Version**: Tracks the business rules active at the time of the event.
- **Rule Engine Version**: Tracks the version of the logic used to evaluate the event.

## 5. Query API
**Endpoint**: `GET /api/v1/tenants/{tenantId}/accounts/{accountId}/audit-logs`

### Parameters
| Name | Type | Description |
| :--- | :--- | :--- |
| `limit` | integer | Max records to return (default: 50). |
| `cursor` | string | Pagination cursor. |
| `startTime` | string | ISO 8601 start time. |
| `endTime` | string | ISO 8601 end time. |
| `eventType` | string | Filter by event type (e.g., `rule.violation.*`). |

### Response
```json
{
  "logs": [ ... ],
  "nextCursor": "string"
}
```
