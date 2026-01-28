# Audit Logging System

## Overview

The Audit Logging System provides immutable, tenant-namespaced logs for all trading activity, rule evaluations, and system events. Logs support reconciliation, dispute resolution, compliance audits, and performance analysis. All logs are write-only with query APIs enforcing tenant isolation.

## Log Schema

**Base Log Entry:**
```json
{
  "logId": "log_xyz789",
  "timestamp": "2026-01-28T14:30:00.123Z",
  "tenantId": "tenant_001",
  "accountId": "acc_50k_001",
  "userId": "user_12345",
  "eventType": "trade.executed",
  "configVersion": "v1.2.0",
  "payload": {
    // Event-specific data
  },
  "metadata": {
    "source": "webhook",
    "ipAddress": "192.168.1.100",
    "correlationId": "corr_abc123"
  }
}
```

## Event Types Logged

### 1. Trade Execution
```json
{
  "eventType": "trade.executed",
  "payload": {
    "orderId": "ord_123",
    "symbol": "EURUSD",
    "side": "buy",
    "quantity": 1.0,
    "price": 1.0850,
    "fillPrice": 1.0851,
    "slippage": 0.0001,
    "commission": 5.0,
    "timestamp": "2026-01-28T14:30:00Z"
  }
}
```

### 2. Rule Violation
```json
{
  "eventType": "rule.violation.daily_loss_limit",
  "payload": {
    "ruleType": "dailyLossLimit",
    "threshold": 2000,
    "actualValue": 2150,
    "currency": "USD",
    "violatedAt": "2026-01-28T14:30:00Z"
  }
}
```

### 3. Account Provisioned
```json
{
  "eventType": "account.provisioned",
  "payload": {
    "accountType": "50k-eval-v1",
    "initialBalance": 50000,
    "currency": "USD",
    "configVersion": "v1.2.0",
    "provisionedAt": "2026-01-28T10:00:00Z"
  }
}
```

### 4. Webhook Received
```json
{
  "eventType": "webhook.received",
  "payload": {
    "webhookId": "wh_abc123",
    "botId": "bot_456",
    "signalId": "sig_789",
    "action": "buy",
    "symbol": "GBPUSD",
    "receivedAt": "2026-01-28T14:29:58Z"
  }
}
```

## Storage Requirements

- **Immutability**: Logs cannot be modified or deleted
- **Retention**: Configurable per tenant (default: 7 years)
- **Namespacing**: All queries must filter by `tenantId`
- **Indexing**: `tenantId`, `accountId`, `eventType`, `timestamp`
- **Compression**: Logs older than 30 days compressed

## Query API

### Get Account Logs
```
GET /api/v1/tenants/{tenantId}/accounts/{accountId}/audit-logs
```

**Query Parameters:**
- `startTime` (ISO 8601)
- `endTime` (ISO 8601)
- `eventType` (optional filter)
- `limit` (max 1000, default 100)
- `cursor` (for pagination)

**Response:**
```json
{
  "logs": [
    {
      "logId": "log_xyz789",
      "timestamp": "2026-01-28T14:30:00.123Z",
      "eventType": "trade.executed",
      "payload": { ... }
    }
  ],
  "nextCursor": "cursor_xyz123",
  "hasMore": true,
  "totalCount": 1500
}
```

### Export Logs
```
POST /api/v1/tenants/{tenantId}/accounts/{accountId}/audit-logs/export
```

**Request:**
```json
{
  "startTime": "2026-01-01T00:00:00Z",
  "endTime": "2026-01-31T23:59:59Z",
  "format": "csv",
  "eventTypes": ["trade.executed", "rule.violation.*"]
}
```

**Response:**
```json
{
  "exportId": "exp_abc123",
  "status": "processing",
  "estimatedCompletionTime": "2026-01-28T15:00:00Z",
  "downloadUrl": null
}
```

## Tenant Isolation

All audit logs enforce strict tenant isolation:
- Queries require `tenantId` in path
- Database-level row security policies
- API authentication validates tenant access
- Cross-tenant access attempts logged and blocked

## Implementation Checklist

- [ ] Design log schema with event type polymorphism
- [ ] Implement write-only log ingestion pipeline
- [ ] Add database indexes for efficient queries
- [ ] Create query API with pagination
- [ ] Implement export functionality (CSV, JSON)
- [ ] Add tenant isolation enforcement
- [ ] Implement log retention policies
- [ ] Add compression for old logs
- [ ] Create monitoring for log volume and latency
- [ ] Build admin tools for log investigation

## Related Documents

- [event-contracts.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/event-contracts.md) - Event schemas logged
- [rule-engine.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/rule-engine.md) - Rule violation logging
- [webhook-bots.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/webhook-bots.md) - Webhook event logging
- [tenant-config.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/tenant-config.md) - Tenant-specific retention policies
