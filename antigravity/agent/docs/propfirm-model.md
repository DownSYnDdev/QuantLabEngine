# PropFirm Model and Platform Responsibilities

## Purpose

This document describes how the PropFirm business model maps onto the QuantLab platform, with a clear separation between:

- The **website / business system** (account purchases, payouts, KYC, rules per account type).
- The **QuantLab platform** (simulated trading, account rule enforcement, events, and auditability).

It is also written to support **multi-tenant, white-label licensing** so other propfirms can plug in their own rules without code changes.

---

## High-level architecture

### Website / Business System

The website is the **source of truth** for:

- **Account products and purchases**
  - 25k, 50k, 100k, 150k accounts.
  - Variants: evaluation path, straight-to-funded, or other custom types.
- **Business rules**
  - Payout requirements.
  - Eligibility checks (KYC, payment status, compliance flags).
  - Firm-specific policies (consistency rules, max concurrent accounts, etc.).
- **User lifecycle**
  - Registration, login, KYC, billing, invoices, refunds.
  - Payout requests and dispute handling.
- **Dashboards**
  - Account overview, payout history, invoices, notifications.

The website issues:

- **Dashboard credentials** (for the website itself).
- **QuantLab credentials** (for the trading/simulation platform).

### QuantLab Platform (White-label SaaS)

QuantLab is a **simulated trading and analysis platform** that:

- Provides charting, indicators, DSL, and backtesting.
- Hosts **simulated accounts** that mirror the purchased account types.
- Enforces **runtime rules** defined by the website via configuration:
  - Daily loss limits.
  - Max drawdown.
  - Min trading days.
  - Consistency rules.
  - Order type restrictions.
- Emits **events** for:
  - Challenge milestones (pass/fail).
  - Rule violations.
  - Payout eligibility triggers (from a simulation perspective).
- Maintains **immutable audit logs** for:
  - Orders, fills, PnL.
  - Rule checks and violations.
  - Config versions used for each account.

QuantLab does **not**:

- Handle billing, payments, or refunds.
- Execute real orders on live markets.
- Approve or send payouts.

---

## Account types and variants

Account types are defined as **configs** provisioned by the website into QuantLab.

### Base sizes

- 25k
- 50k
- 100k
- 150k

### Variants

- **Evaluation path**
  - One or more stages (e.g., Stage 1, Stage 2).
  - Each stage has its own:
    - Profit target (as a fraction of base capital).
    - Max drawdown.
    - Daily loss limit.
    - Min trading days.
    - Optional consistency rules.
  - Passing all stages may transition the user to a funded-like simulated account.

- **Straight-to-funded**
  - No evaluation stages.
  - Immediate funded-like simulated account.
  - Typically stricter:
    - Daily loss limits.
    - Consistency requirements.
    - Drawdown rules.

All of these are represented as JSON configs that conform to `agent/docs/account-schema.md` and are stored in:

- `agent/configs/*.json` (e.g., `25k-eval-v1.json`, `50k-straight-v1.json`, etc.).

---

## Responsibilities split: Website vs QuantLab

### Website responsibilities

- **Define and own business rules**:
  - Which account types exist.
  - Pricing, promotions, and bundles.
  - Payout percentages and schedules.
  - Eligibility criteria beyond trading performance (KYC, payment status, bans).

- **Provision accounts into QuantLab**:
  - Call the provisioning API with:
    - Tenant ID.
    - Account config (matching the schema).
    - User-to-account mapping.

- **Business decisions and payouts**:
  - QuantLab is a simulated execution and enforcement engine. Payouts, billing, KYC, and business decisions are the responsibility of the propfirm website. QuantLab exposes APIs and events for the website to consume for payout eligibility and reconciliation.

- **User-facing flows**:
  - Account purchase and upgrades.
  - Payout request forms.
  - Support and dispute resolution.

### QuantLab responsibilities

QuantLab is a simulated execution and enforcement engine. Payouts, billing, KYC, and business decisions are the responsibility of the propfirm website. QuantLab exposes APIs and events for the website to consume for payout eligibility and reconciliation.

- **Simulated trading environment**:
  - Real-time data.
  - Simulated execution engine.
  - Strategy DSL and backtesting.

- **Rule enforcement**:
  - Enforce the rules defined in the account config:
    - Daily loss limit.
    - Max drawdown.
    - Min trading days.
    - Consistency rules.
  - Emit events when rules are violated or milestones are reached.

- **Audit and observability**:
  - Store immutable logs of:
    - Orders, fills, PnL.
    - Rule checks and violations.
    - Config versions used.
  - Provide APIs or exports for the website to pull audit data.

- **Event emission**:
  - `challenge.milestone` (e.g., stage-1-pass, stage-2-pass).
  - `challenge.failed` (rule violation).
  - `payout.eligible` (from a trading/performance perspective).
  - `payout.completed` (if the website reports back completion).
  - `webhook.delivery.*` for algobot executions.

---

## Multi-tenant and white-label model

QuantLab is designed to be licensed to multiple propfirms (tenants).

### Tenant isolation

- Each tenant has:
  - Its own set of account configs.
  - Its own users and accounts.
  - Its own webhook secrets and broker integrations.
- No cross-tenant data leakage:
  - Configs, logs, and events are namespaced by `tenantId`.

### Tenant-specific configs

- Account configs are tenant-aware:
  - Example IDs: `tenantA-25k-eval-v1`, `tenantB-50k-straight-v2`.
- Tenants can:
  - Add new account types.
  - Override rules for existing types.
  - Version their configs over time.

### Licensing model

- QuantLab exposes:
  - A provisioning API for tenants to upload their configs.
  - Documentation and examples (e.g., `sample-account-configs.md`).
  - Optional admin UI for managing account types and rules.

---

## Algobot marketplace and webhooks (high-level)

- QuantLab hosts an **algobot marketplace**:
  - Strategies are defined and tested in QuantLab.
  - Execution for live trading happens **outside** QuantLab via broker webhooks.

- For propfirms:
  - Bots can be approved or curated per tenant.
  - QuantLab sends **signals** via webhooks to the tenant's broker or execution layer.
  - QuantLab still only simulates internally; live execution is the tenant's responsibility.

Details of webhook payloads and event contracts are defined in:

- `agent/docs/event-contracts.md`
- `agent/docs/algobot-marketplace.md`
- `agent/docs/provisioning-api.md`

---

## Acceptance criteria

- The division of responsibilities between website and QuantLab is clear and unambiguous.
- Account types and variants are fully represented as configs, not hardcoded logic.
- The model supports:
  - Multiple tenants.
  - Different rules per tenant.
  - Versioned configs per account type.
- The document is consistent with:
  - `agent/docs/account-schema.md`
  - `agent/docs/sample-account-configs.md`
  - Individual account config files in `agent/configs/`.
