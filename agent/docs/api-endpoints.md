QuantLab API Endpoints
Version: 1.0.0
Scope: Public API surface for prop‑firm websites, tenant dashboards, and automation systems.
Audience: External integrators, internal agents, and white‑label partners.
QuantLab exposes a minimal, stable API surface focused on:
- Account provisioning
- Account state retrieval
- Rule‑violation visibility
- Audit‑log access
- Bot registration
- Tenant‑aware operations
- Config version tracking
All endpoints are tenant‑scoped, versioned, and stateless.

1. Authentication
QuantLab uses HMAC‑SHA256 signatures for all external API calls.
Headers
|  |  | 
| X-Tenant-ID | tenantA | 
| X-Timestamp |  | 
| X-Signature |  | 


Signature Formula
signature = HMAC_SHA256(secret, timestamp + body)



2. Base URL
/api/v1/tenants/{tenantId}



3. Endpoints

3.1 GET /accounts/{accountId} — Get Account State
Retrieve the full state of a trading account.
URL
GET /api/v1/tenants/{tenantId}/accounts/{accountId}


Response
{
  "accountId": "25k-eval-v1",
  "tenantId": "tenantA",
  "configVersion": "1.0.0",
  "balance": 25000,
  "equity": 24920.5,
  "openPositions": [],
  "metrics": {
    "dailyLoss": 80,
    "maxLoss": 120,
    "drawdown": 0.03
  },
  "ruleEngineVersion": "1.0.0",
  "status": "active",
  "createdAt": "2026-01-30T12:00:00Z"
}


Notes
- Pulls from the simulation engine’s latest snapshot
- Includes rule‑engine metrics
- Tenant isolation enforced at query level

3.2 GET /accounts/{accountId}/violations — Get Rule Violations
Returns all rule violations for an account.
URL
GET /api/v1/tenants/{tenantId}/accounts/{accountId}/violations


Response
{
  "accountId": "25k-eval-v1",
  "violations": [
    {
      "event": "rule.violation.daily_loss",
      "value": 520,
      "limit": 500,
      "timestamp": "2026-01-30T14:22:00Z"
    }
  ]
}


Notes
- Data sourced from audit log + rule engine
- Empty list means fully compliant

3.3 GET /accounts/{accountId}/audit-logs — Get Audit Logs
Retrieve audit‑log entries for an account.
URL
GET /api/v1/tenants/{tenantId}/accounts/{accountId}/audit-logs


Query Params
|  |  | 
| limit |  | 
| cursor |  | 
| eventType |  | 


Response
{
  "logs": [
    {
      "event": "account.provisioned",
      "timestamp": "2026-01-30T12:00:00Z",
      "data": { "configVersion": "1.0.0" }
    },
    {
      "event": "webhook.trade_executed",
      "timestamp": "2026-01-30T12:05:00Z",
      "data": { "symbol": "EURUSD", "size": 1.0 }
    }
  ],
  "nextCursor": "abc123"
}



3.4 POST /accounts — Create Account
Provision a new trading account for a tenant.
URL
POST /api/v1/tenants/{tenantId}/accounts


Request
{
  "accountType": "25k-eval",
  "configVersion": "1.0.0",
  "userId": "12345"
}


Response
{
  "accountId": "25k-eval-v1",
  "status": "provisioned",
  "configVersion": "1.0.0"
}


Notes
- Triggers account.provisioned event
- Validates config version
- Applies tenant overrides

3.5 POST /accounts/{accountId} — Update Account
Update account metadata or config version.
URL
POST /api/v1/tenants/{tenantId}/accounts/{accountId}


Request
{
  "configVersion": "1.0.1",
  "status": "paused"
}


Response
{
  "accountId": "25k-eval-v1",
  "updated": true
}


Notes
- Cannot modify balance/equity
- Triggers account.updated event

3.6 POST /bots/register — Register a Bot
Used by the prop‑firm website to register a bot for webhook execution.
URL
POST /api/v1/tenants/{tenantId}/bots/register


Request
{
  "botId": "my-eurusd-bot",
  "webhookUrl": "https://example.com/webhook",
  "description": "EURUSD breakout strategy"
}


Response
{
  "botId": "my-eurusd-bot",
  "status": "registered"
}


Notes
- Bot metadata stored in marketplace registry
- Used by webhook‑bot execution pipeline

4. Error Codes
|  |  | 
| 400 |  | 
| 401 |  | 
| 403 |  | 
| 404 |  | 
| 409 |  | 
| 429 |  | 
| 500 |  | 



5. Versioning
- All endpoints are under /api/v1/
- Breaking changes require /api/v2/
- Config versions are independent of API versions

6. Tenant Isolation
- Every request must include X-Tenant-ID
- Accounts, bots, configs, and logs are namespaced per tenant
- No cross‑tenant visibility

7. Event Integration Points
These endpoints interact with:
- Rule Engine
- Violations surfaced via /violations
- Webhook Bot Pipeline
- Bot registration
- Trade execution events
- Audit Log System
- All state changes logged
- Provisioning API
- Account creation and config validation

8. Changelog
1.0.0 — Initial release for white‑label prop‑firm integration.
