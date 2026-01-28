# Milestone 8 — White-Label PropFirm Integration Layer

## Objective
Implement a clean, production-ready integration layer so QuantLab can be licensed as a white‑label simulated trading engine for propfirms. QuantLab will provide simulated accounts, rule enforcement, auditability, and event emission. All business, payout, and KYC responsibilities remain with the propfirm website.

## Deliverables
- **Provisioning API** for tenant account configs and user→account mapping.
- **Rule Enforcement Engine** that enforces runtime constraints from configs.
- **Webhook Bot Execution Pipeline** to receive, validate, and execute bot signals as simulated trades.
- **Audit Logging System** with immutable, tenant‑namespaced logs and query API.
- **Event Contracts** for challenge milestones, rule violations, and webhook deliveries.
- **Multi‑Tenant Support** including tenant config storage, namespacing, and secrets management.
- **Documentation**: provisioning API, event contracts, webhook payloads, tenant config examples, and admin guidance.
- **Acceptance Tests and Simulations** validating config provisioning, rule enforcement, webhook flows, and audit exports.

## Scope and Boundaries
- **QuantLab provides**: simulated execution, rule enforcement, audit logs, event emission, and APIs for the website to consume.
- **QuantLab does not provide**: payouts, billing, KYC, dispute resolution, or live order execution.

## Tasks
1. **API and Provisioning**
   - Implement `POST /api/v1/tenants/{tenantId}/accounts` to accept account configs.
   - Implement `GET /api/v1/tenants/{tenantId}/accounts/{accountId}` to return account state.
   - Implement config validation pipeline using `agent/docs/account-schema.md`.
   - Add versioning support for configs.

2. **Rule Engine**
   - Load rules from provisioned config at account creation.
   - Evaluate rules on every simulated fill and on periodic checkpoints.
   - Emit `rule.violation.*` events and write to audit log.

3. **Webhook Bot Pipeline**
   - Implement authenticated webhook receiver.
   - Validate payload schema and signature.
   - Map incoming signals to account context and simulate trade execution.
   - Emit `webhook.received`, `webhook.validated`, `webhook.trade_executed` events.

4. **Audit Logging**
   - Define immutable log schema: timestamp, tenantId, accountId, eventType, payload, configVersion.
   - Implement write and query APIs with tenant isolation.
   - Ensure logs are exportable for website reconciliation.

5. **Event Contracts**
   - Publish `event-contracts.md` with JSON schemas for:
     - `challenge.milestone`
     - `challenge.failed`
     - `payout.eligible` (simulation only)
     - `webhook.delivery.*`
     - `rule.violation.*`

6. **Multi‑Tenant**
   - Namespace all data by `tenantId`.
   - Store tenant secrets and webhook secrets securely.
   - Provide tenant admin endpoints for config management.

7. **Docs and Examples**
   - `agent/docs/provisioning-api.md`
   - `agent/docs/event-contracts.md`
   - `agent/docs/webhook-bots.md`
   - `agent/docs/tenant-config.md`
   - Provide sample tenant configs in `agent/configs/tenants/`.

8. **Testing and Validation**
   - Add unit tests for rule checks.
   - Add integration tests for provisioning → simulate → audit → event flow.
   - Run simulation scenarios using existing `simulate-provisioning.py`.

## Acceptance Criteria
- Website can provision an account config and receive a `provisioned` response.
- Rule violations are detected and emitted as events within 1s of the triggering fill.
- Webhook signals are authenticated, validated, and result in simulated fills recorded in audit logs.
- Audit logs are queryable and exportable per tenant.
- No payout or billing logic exists in QuantLab codebase or docs.
