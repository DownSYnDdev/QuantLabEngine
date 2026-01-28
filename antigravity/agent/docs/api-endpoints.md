# API Endpoints Reference

## Overview

This document provides a comprehensive reference for all QuantLab REST API endpoints. All endpoints require authentication and enforce tenant isolation. The API follows RESTful conventions and returns JSON responses.

## Authentication

All requests require authentication via API key or JWT token:

```
Authorization: Bearer {api_key}
```

## Base URL

```
https://api.quantlab.io/v1
```

## Tenant Management

### Create Tenant
```
POST /admin/tenants
```

**Request:**
```json
{
  "tenantName": "PropFirm ABC",
  "contactEmail": "admin@propfirmabc.com",
  "plan": "enterprise"
}
```

**Response:**
```json
{
  "tenantId": "tenant_001",
  "tenantName": "PropFirm ABC",
  "apiKey": "pk_live_abc123...",
  "createdAt": "2026-01-28T10:00:00Z"
}
```

### Get Tenant
```
GET /admin/tenants/{tenantId}
```

## Account Provisioning

### Create Account
```
POST /tenants/{tenantId}/accounts
```

**Request:**
```json
{
  "accountType": "50k-eval-v1",
  "userId": "user_12345",
  "config": {
    "type": "evaluation",
    "baseCapital": 50000,
    "currency": "USD",
    "stages": [
      {
        "stageNumber": 1,
        "profitTarget": 5000,
        "maxDrawdown": 2500,
        "dailyLossLimit": 2000,
        "minTradingDays": 5
      }
    ]
  }
}
```

**Response:**
```json
{
  "accountId": "acc_50k_001",
  "status": "provisioned",
  "balance": 50000,
  "createdAt": "2026-01-28T10:00:00Z"
}
```

### Get Account
```
GET /tenants/{tenantId}/accounts/{accountId}
```

**Response:**
```json
{
  "accountId": "acc_50k_001",
  "accountType": "50k-eval-v1",
  "userId": "user_12345",
  "status": "active",
  "balance": 52300,
  "equity": 52150,
  "currentStage": 1,
  "tradingDays": 3,
  "openPositions": [
    {
      "symbol": "EURUSD",
      "side": "buy",
      "quantity": 1.0,
      "entryPrice": 1.0850,
      "currentPrice": 1.0865,
      "unrealizedPnL": 150
    }
  ],
  "ruleStatus": {
    "dailyLossLimit": {
      "current": -500,
      "threshold": -2000,
      "status": "compliant"
    },
    "maxDrawdown": {
      "current": 0,
      "threshold": -2500,
      "status": "compliant"
    }
  }
}
```

### Update Account
```
PUT /tenants/{tenantId}/accounts/{accountId}
```

### Delete Account
```
DELETE /tenants/{tenantId}/accounts/{accountId}
```

## User-Account Mapping

### Map User to Account
```
POST /tenants/{tenantId}/users/{userId}/accounts/{accountId}/map
```

### Get User Accounts
```
GET /tenants/{tenantId}/users/{userId}/accounts
```

## Webhook Management

### Register Webhook
```
POST /tenants/{tenantId}/webhooks
```

**Request:**
```json
{
  "url": "https://propfirm.com/webhooks/quantlab",
  "secret": "whsec_abc123...",
  "eventTypes": [
    "rule.violation.*",
    "challenge.milestone",
    "payout.eligible"
  ]
}
```

### Receive Signal (Webhook Endpoint)
```
POST /webhooks/signals
```

**Request:**
```json
{
  "tenantId": "tenant_001",
  "accountId": "acc_50k_001",
  "botId": "bot_456",
  "signalId": "sig_789",
  "symbol": "EURUSD",
  "action": "buy",
  "quantity": 1.0,
  "orderType": "market",
  "timestamp": "2026-01-28T14:30:00Z",
  "signature": "sha256=abc123..."
}
```

**Response:**
```json
{
  "webhookId": "wh_abc123",
  "status": "validated",
  "orderId": "ord_123",
  "estimatedFillTime": "2026-01-28T14:30:01Z"
}
```

## Audit Logs

### Get Account Logs
```
GET /tenants/{tenantId}/accounts/{accountId}/audit-logs
```

**Query Parameters:**
- `startTime` (ISO 8601)
- `endTime` (ISO 8601)
- `eventType` (optional)
- `limit` (default: 100, max: 1000)
- `cursor` (pagination)

### Export Logs
```
POST /tenants/{tenantId}/accounts/{accountId}/audit-logs/export
```

## Events

### Get Events
```
GET /tenants/{tenantId}/events
```

**Query Parameters:**
- `startTime`
- `endTime`
- `eventType`
- `accountId` (optional filter)

## Rate Limiting

All endpoints are rate-limited per tenant:
- **Standard tier**: 1000 requests/minute
- **Enterprise tier**: 10000 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1706454000
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid account configuration",
    "details": [
      {
        "field": "config.stages[0].profitTarget",
        "message": "Must be greater than 0"
      }
    ]
  }
}
```

**Common Error Codes:**
- `AUTHENTICATION_ERROR` - Invalid or missing API key
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Related Documents

- [provisioning-api.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/provisioning-api.md) - Detailed provisioning flow
- [webhook-bots.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/webhook-bots.md) - Webhook signal handling
- [event-contracts.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/event-contracts.md) - Event schemas
- [audit-log.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/audit-log.md) - Audit log API
