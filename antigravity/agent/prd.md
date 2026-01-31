# Product Requirements Document (PRD)
## Project: QuantLab — White-Label Prop-Firm Trading Engine

## 1. Overview
QuantLab is a high-performance, chart-centric simulated trading platform designed to be white-labeled by proprietary trading firms. It provides a "TradingView-like" experience for traders while offering a robust backend for firms to manage evaluation accounts, enforce trading rules, and ingest algorithmic signals via webhooks.

## 2. Goals
- **Trader Experience**: A premium, responsive charting and manual trading interface.
- **Prop-Firm Backend**: A secure, multi-tenant engine for account provisioning and rule enforcement.
- **Algo Integration**: Seamless support for external bots via secure webhooks.
- **Safety**: Strict isolation between tenants and immutable audit logging for all events.

## 3. Core Features

### 3.1 Real-Time Market Data
- WebSocket-based streaming (tick-level).
- Multi-symbol subscriptions.
- Efficient batching for high-frequency updates.

### 3.2 Charting Engine
- Professional-grade rendering (WebGL/Canvas).
- Multi-chart layouts & synchronized crosshairs.
- 50+ Built-in indicators (RSI, MACD, etc.).
- Custom DSL for user-defined indicators.

### 3.3 Trading Engine (Simulated)
- **Order Types**: Market, Limit, Stop, Stop-Limit, OCO, Bracket.
- **Execution Modeling**: Configurable slippage, partial fills, and latency.
- **Position Management**: Real-time equity, margin, and PnL tracking.

### 3.4 White-Label Prop-Firm Integration
This is the core differentiator. QuantLab acts as the diverse execution layer for multiple prop firms.

#### A. Multi-Tenant Architecture
- **Isolation**: strict data separation by `tenantId`.
- **Configuration**: Tenant-specific JSON configs for branding, assets, and rules.
- **Secrets**: Secure storage for per-tenant webhook keys and API credentials.

#### B. Account Provisioning API
- **Endpoint**: `POST /tenants/{tenantId}/accounts`
- **Schema**: Validates against `account-schema.md`.
- **Versioning**: Supports upgrading configs without breaking active accounts.

#### C. Rule Enforcement Engine
- **Runtime Checks**: Monitors Equity, Drawdown, Daily Loss on every tick.
- **Violations**: Emits `rule.violation` events immediately upon breach.
- **Configuration**: Rules are defined in the JSON account config, not hardcoded.

#### D. Webhook Bot Pipeline
- **Ingestion**: Authenticated endpoint for Algo signals (`POST /webhooks/signals`).
- **Validation**: HMAC signature verification + timestamp replay protection.
- **Execution**: Converts valid signals into internal simulated orders.

#### E. Audit Logging
- **Immutability**: Write-once, read-many logs for all trade and rule events.
- **Querying**: Tenant-scoped API for dispute resolution.

## 4. Non-Functional Requirements
- **Performance**: <100ms simulator latency, 60fps charting.
- **Scalability**: Horizontal scaling of simulator nodes (stateless design).
- **Security**: Zero access to host OS from DSL or Webhooks.

## 5. Technology Stack
- **Frontend**: Next.js, WebGL/Canvas, WebSocket.
- **Backend**: Node.js/Python (Event Loop architecture).
- **Data**: PostgreSQL (Persistence), Redis (Hot State/PubSub).
- **Infra**: Docker, Kubernetes.

## 6. Milestones
1. **Foundation & Charting**: Core UI and Data feed.
2. **Indicators & DSL**: Custom script support.
3. **DSL Interpreter**: Event-driven script execution.
4. **Order Engine**: Simulated execution & Portfolio state.
5. **Backtesting**: Historic simulation.
6. **User System**: Auth & Persistence.
7. **Cloud Deployment**: Production infra.
8. **White-Label Integration**: Multi-tenancy, Rules, Webhooks, Audit.

## 7. Acceptance Criteria
- System supports multiple distinct tenants with unique branding.
- Rule engine correctly fails accounts upon simulated breaches.
- Webhook signals trigger trades within <200ms.
- Audit logs are retrievable and accurate.
