# API Endpoints Reference
Version: 1.1.0

## Overview
Comprehensive reference for QuantLab REST API endpoints. Start here for integration.

## Base URL
`https://api.quantlab.io/v1`

## Authentication
`Authorization: Bearer <metrics-api-key>`

## 1. Account Management

### POST Create Account
Provisions a new trading account for a user.
- **Endpoint**: `POST /tenants/{tenantId}/accounts`
- **Body**:
  ```json
  {
    "userId": "user_123",
    "configId": "25k-eval-v1",
    "meta": { "campaign": "summer_promo" }
  }
  ```
- **Response**: `201 Created` with `{ "accountId": "acc_xyz", "status": "provisioned" }`

### POST Update Account
Updates account details or triggers manual state transitions.
- **Endpoint**: `POST /tenants/{tenantId}/accounts/{accountId}`
- **Body**:
  ```json
  {
    "action": "update_meta", // or "reset", "disable"
    "data": { "meta": { "tag": "vip" } }
  }
  ```

### GET Account State
Retrieves full account state: balance, equity, open positions, and rule check statuses.
- **Endpoint**: `GET /tenants/{tenantId}/accounts/{accountId}`
- **Response**:
  ```json
  {
    "balance": 25050.00,
    "equity": 25100.00,
    "openPositions": [...],
    "metrics": { "dailyLoss": -50.00 }
  }
  ```

## 2. Rule Violations & Events

### GET Rule Violations
Retrieves a list of active or effective rule violations for an account.
- **Endpoint**: `GET /tenants/{tenantId}/accounts/{accountId}/violations`
- **Response**:
  ```json
  [
    {
      "rule": "daily_loss",
      "timestamp": "2026-01-30T14:00:00Z",
      "details": { "limit": 1000, "actual": 1200 }
    }
  ]
  ```

### GET Audit Logs
Retrieves the immutable audit trail.
- **Endpoint**: `GET /tenants/{tenantId}/accounts/{accountId}/audit-logs`
- **Params**: `startTime`, `endTime`, `limit`
- **Response**: Array of signed audit events.

## 3. Bot & Webhook Management

### POST Register Bot
Registers an algorithmic trading bot (webhook source) for a tenant.
- **Endpoint**: `POST /tenants/{tenantId}/bots`
- **Body**:
  ```json
  {
    "botName": "TrendMaster V1",
    "description": "Scalping bot",
    "webhookSecret": "optional_custom_secret"
  }
  ```
- **Response**: `{ "botId": "bot_999", "webhookUrl": "...", "secret": "..." }`

## 4. Configuration Management

### POST Upload Config
Uploads a new JSON configuration version.
- **Endpoint**: `POST /tenants/{tenantId}/configs`
- **Body**: JSON Config Object (Schema: account-schema.md)
- **Response**: `{ "configId": "25k-eval-v2", "validationResults": "passed" }`
