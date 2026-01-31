# Agent Goals

## Primary Objective
Build **QuantLabEngine**: A white-label simulated trading platform for proprietary trading firms.

## Core Capabilities

### 1. White-Label Platform
- Multi-tenant architecture with strict data isolation
- Configurable branding per tenant (prop firm)
- Account provisioning via REST API

### 2. Simulated Execution Engine
- Real-time market data streaming
- High-performance WebGL charting
- Tick-level trade simulation with slippage modeling
- Portfolio state and position tracking

### 3. AlgoBot Integration
- Webhook-based signal ingestion from external bots
- HMAC signature validation for security
- Rate-limited execution pipeline
- Bots offered as premium add-ons via tenant marketplace

### 4. Rule Enforcement
- Real-time Daily Loss, Max Drawdown, Consistency checks
- Immediate rule violation events
- Configurable rules per account type

### 5. Audit & Compliance
- Immutable audit logs for all trades and violations
- Tenant-scoped query API
- Retention policies per tenant configuration

## Guiding Principles
- Modularity: Components must be loosely coupled.
- Scalability: Stateless services, horizontal scaling.
- Security: Sandboxed DSL, encrypted secrets, zero external access from user code.
- Documentation: All features documented before implementation.
