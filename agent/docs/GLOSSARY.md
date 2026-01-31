# QuantLabEngine Glossary

## Core Concepts

| Term | Definition |
|------|------------|
| **Tenant** | A proprietary trading firm (prop firm) that white-labels the QuantLab platform. Each tenant has isolated data and configuration. |
| **Account** | A simulated trading account provisioned for a trader. Bound to a specific tenant and account type. |
| **Account Type** | A JSON configuration defining rules, capital, and challenge stages (e.g., `50k-eval-v1`). |
| **Trader** | An end-user who trades on a tenant's platform. |

---

## Trading Concepts

| Term | Definition |
|------|------------|
| **Simulated Execution** | Trades are filled against real-time market data but do not affect real markets. |
| **Evaluation** | A multi-stage challenge where traders must meet profit targets and rule compliance. |
| **Straight-to-Funded** | An account type with no challenge stages; traders start with a simulated funded account. |
| **Daily Loss Limit** | Maximum allowed loss within a single trading day. |
| **Max Drawdown** | Maximum allowed decline from the account's peak equity. |
| **Consistency Rule** | Limits the % of total profit that can come from a single trading day. |

---

## Bot & Webhook Concepts

| Term | Definition |
|------|------------|
| **AlgoBot** | An automated trading strategy that sends signals via webhooks. |
| **Webhook Signal** | A JSON payload sent by an AlgoBot to trigger a simulated trade. |
| **HMAC Signature** | A cryptographic signature used to authenticate webhook requests. |
| **Bot Deployment** | Attaching an AlgoBot to a specific account for live signal execution. |

---

## System Concepts

| Term | Definition |
|------|------------|
| **Rule Enforcement Engine** | The service that validates trading activity against account rules. |
| **Rule Violation** | An event emitted when a rule is breached (e.g., `rule.violation.daily_loss`). |
| **Audit Log** | An immutable record of all trades, rule checks, and violations. |
| **Provisioning API** | The REST API used by tenants to create and manage accounts. |
| **Event Contract** | A standardized JSON schema for events emitted by the platform. |

---

## Infrastructure Concepts

| Term | Definition |
|------|------------|
| **Multi-Tenant** | Architecture where multiple tenants share the platform but have isolated data. |
| **DSL** | Domain-Specific Language for creating custom indicators and strategies. |
| **Sandbox** | An isolated execution environment for DSL code with CPU/memory limits. |
