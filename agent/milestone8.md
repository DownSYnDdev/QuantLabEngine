# Milestone 8: White-Label Prop-Firm Integration Layer

## Objective
Implement the comprehensive integration layer that allows third-party prop firms (Tenants) to use the QuantLab engine as their backend. This layer handles account provisioning, rule enforcement, bot execution, and audit logging in a secure, multi-tenant environment.

## 1. Account Provisioning
**Status**: [ ] Pending
**Goal**: Enable programmatic creation of trading accounts based on defined configurations.
- **Reference**: [account-schema.md](./docs/account-schema.md)
- **Reference**: [provisioning-api.md](./docs/provisioning-api.md)
- **Tasks**:
  - [ ] Implement `POST /accounts` endpoint.
  - [ ] Implement configuration validation logic.
  - [ ] Support "Instant Funding" and "Evaluation" models.

## 2. Rule Enforcement Engine
**Status**: [ ] Pending
**Goal**: Real-time validation of trading rules (Drawdown, Daily Loss, etc.).
- **Reference**: [rule-engine.md](./docs/rule-engine.md)
- **Tasks**:
  - [ ] Implement `check-daily-loss` logic.
  - [ ] Implement `check-max-loss` logic.
  - [ ] Implement `check-drawdown` logic.
  - [ ] Implement `check-consistency` logic.
  - [ ] Emit `rule.violation` events on breach.

## 3. Webhook Bot Pipeline
**Status**: [ ] Pending
**Goal**: Allow external algorithmic bots to execute trades via secure webhooks.
- **Reference**: [webhook-bots.md](./docs/webhook-bots.md)
- **Tasks**:
  - [ ] Implement HMAC signature validation.
  - [ ] Implement Rate Limiting (Token Bucket).
  - [ ] Implement Signal Ingestion & normalization.
  - [ ] connect triggers to `execute-simulated-trade` skill.

## 4. Audit Logging System
**Status**: [ ] Pending
**Goal**: Immutable system of record for all actions.
- **Reference**: [audit-log.md](./docs/audit-log.md)
- **Tasks**:
  - [ ] Implement structured JSON logging.
  - [ ] Enforce tenant isolation in storage paths.
  - [ ] Implement `GET /audit-logs` query API.

## 5. Multi-Tenant Support
**Status**: [ ] Pending
**Goal**: Logical and physical isolation of tenant data.
- **Reference**: [tenant-config.md](./docs/tenant-config.md)
- **Tasks**:
  - [ ] Implement Tenant Config loading.
  - [ ] Enforce `tenantId` check on all API calls.
  - [ ] Apply branding settings to responses.

## 6. API & Events
**Status**: [ ] Pending
**Goal**: standardized interface for the Prop-Firm Website.
- **Reference**: [api-endpoints.md](./docs/api-endpoints.md)
- **Reference**: [event-contracts.md](./docs/event-contracts.md)
- **Tasks**:
  - [ ] Expose all documented endpoints.
  - [ ] Emit all documented events.
