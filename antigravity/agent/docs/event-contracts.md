QuantLab Event Contracts
Version: 1.0.0
Scope: Internal event layer for simulation engine, rule engine, webhook bots, audit logging, and tenant‑aware integrations.
QuantLab uses an event‑driven architecture. Every significant state change emits a structured event that is:
- JSON‑serializable
- Tenant‑scoped
- Versioned
- Logged in the audit‑log system
- Consumed by internal skills and external dashboards
All events share a common envelope.

1. Event Envelope (Shared Schema)
{
  "eventType": "string",
  "tenantId": "string",
  "accountId": "string",
  "timestamp": "2026-01-30T12:00:00Z",
  "meta": {
    "configVersion": "1.0.0",
    "ruleEngineVersion": "1.0.0",
    "schemaVersion": "1.0.0"
  },
  "data": {}
}


Envelope Rules
- tenantId is mandatory
- timestamp must be ISO 8601 UTC
- meta.configVersion must match the account’s active config
- data contains event‑specific fields

2. Account Lifecycle Events

2.1 account.provisioned
Emitted when a new account is created.
Schema
{
  "data": {
    "accountType": "string",
    "configVersion": "string",
    "userId": "string"
  }
}


Example
{
  "eventType": "account.provisioned",
  "tenantId": "tenantA",
  "accountId": "25k-eval-v1",
  "timestamp": "2026-01-30T12:00:00Z",
  "meta": { "configVersion": "1.0.0" },
  "data": {
    "accountType": "25k-eval",
    "configVersion": "1.0.0",
    "userId": "12345"
  }
}



2.2 account.updated
Emitted when metadata or config version changes.
Schema
{
  "data": {
    "changes": {
      "configVersion": "string",
      "status": "string"
    }
  }
}



3. Webhook Bot Execution Events

3.1 webhook.received
Emitted when a webhook signal arrives.
Schema
{
  "data": {
    "botId": "string",
    "rawPayload": {},
    "ip": "string"
  }
}



3.2 webhook.validated
Emitted after signature + schema validation succeeds.
Schema
{
  "data": {
    "botId": "string",
    "validatedPayload": {}
  }
}



3.3 webhook.rejected
Emitted when validation fails.
Schema
{
  "data": {
    "botId": "string",
    "reason": "string"
  }
}



3.4 webhook.trade_executed
Emitted when a validated signal results in a simulated trade.
Schema
{
  "data": {
    "symbol": "string",
    "side": "buy | sell",
    "size": "number",
    "price": "number",
    "executionId": "string"
  }
}


Example
{
  "eventType": "webhook.trade_executed",
  "tenantId": "tenantA",
  "accountId": "25k-eval-v1",
  "timestamp": "2026-01-30T12:05:00Z",
  "meta": { "configVersion": "1.0.0" },
  "data": {
    "symbol": "EURUSD",
    "side": "buy",
    "size": 1.0,
    "price": 1.0842,
    "executionId": "exec_123"
  }
}



4. Rule Violation Events
These events are emitted by the rule engine and consumed by:
- Audit log
- API /violations endpoint
- Dashboard UI
- Internal monitoring
All rule violations share this base schema:
{
  "data": {
    "value": "number",
    "limit": "number",
    "details": {}
  }
}



4.1 rule.violation.daily_loss
Triggered when daily loss exceeds limit.
Schema Additions
{
  "data": {
    "value": "number",
    "limit": "number",
    "details": {
      "day": "2026-01-30",
      "closedProfit": "number",
      "floatingProfit": "number"
    }
  }
}



4.2 rule.violation.max_loss
Triggered when total loss exceeds max loss.
Schema Additions
{
  "data": {
    "value": "number",
    "limit": "number",
    "details": {
      "initialEquity": "number",
      "currentEquity": "number"
    }
  }
}


4.3 rule.violation.drawdown
Triggered when equity drawdown exceeds threshold.
Schema Additions
{
  "data": {
    "value": "number",
    "limit": "number",
    "details": {
      "highWaterMark": "number",
      "peakEquity": "number"
    }
  }
}


4.4 rule.violation.instrument
Triggered when a bot trades an instrument not allowed by config.
Schema Additions
{
  "data": {
    "value": "string",
    "limit": ["string"],
    "details": {
      "symbol": "string",
      "allowedlist": ["string"]
    }
  }
}



4.5 rule.violation.consistency
Triggered when consistency rules fail (e.g., too few trading days).
Schema Additions
{
  "data": {
    "value": "number",
    "limit": "number",
    "details": {
      "minDays": "number",
      "actualDays": "number",
      "maxProfitDay": "number",
      "totalProfit": "number"
    }
  }
}



5. Audit Log Events
Audit log entries are not separate event types —
they are the persisted form of all events in this file.
Every event is written to:
/audit/{tenantId}/{accountId}/{YYYY}/{MM}/{DD}/events.jsonl


Audit log schema is identical to the event envelope.

6. Schema Versioning
- schemaVersion increments when event structure changes
- Backward‑compatible changes do not require a new version
- Breaking changes require a new major version

7. Changelog
1.0.0 — Initial release covering:
- Account lifecycle
- Webhook bot pipeline
- Rule violations
- Audit‑log integration
