# QuantLab Roadmap

## Overview
This roadmap outlines the full development sequence for QuantLab, from initial scaffolding to cloud deployment. Each milestone builds on the previous one and corresponds directly to the milestone files in the /agent folder.

> [!IMPORTANT]
> All milestones assume QuantLab provides simulated execution only; business logic and payouts are external.

---

## Phase 1 — Foundation & Core Engine

### Milestone 1 — Project Scaffolding & Core Charting
- Set up project structure, frontend, backend, and charting engine.
- Implement OHLCV schema, mock data, and basic WebGL/Canvas rendering.
- Establish UI layout and DSL integration hooks.
- **Integration**: Tenant-aware config loading.

### Milestone 2 — Indicator Engine, Overlays & DSL Scaffolding
- Build modular indicator engine (SMA, EMA, RSI, MACD, Bollinger).
- Add overlay rendering system.
- Implement DSL tokenizer, parser, and AST generator.
- **Integration**: Rule-compatible data models.

### Milestone 3 — Full DSL Interpreter, Multi‑Symbol Support & Event System
- Complete DSL grammar and AST.
- Implement interpreter runtime, safety limits, and error handling.
- **Integration**: Tenant-scoped symbol access.

---

## Phase 2 — Trading Engine & Simulation

### Milestone 4 — Order Engine, Portfolio State & Strategy Execution
- Implement market, limit, stop, OCO, and bracket orders.
- Build portfolio and position management.
- **Integration**: Webhook signal ingestion & Rule-validated order flow.

### Milestone 5 — Tick‑Level Backtesting Engine
- Implement deterministic simulation loop.
- Add tick and bar data loaders with caching.
- **Integration**: Simulation stops on Rule Violations (e.g., Max Loss).

---

## Phase 3 — User System & Persistence

### Milestone 6 — User Accounts, Saved Layouts & Persistence
- Implement authentication (JWT/OAuth2).
- Add saved layouts, saved indicators, saved strategies.
- **Integration**: Tenant-isolated database schema.

---

## Phase 4 — Deployment & Scaling

### Milestone 7 — Cloud Deployment, Scaling & Monitoring
- Containerize all services with Docker.
- Deploy to Kubernetes with autoscaling.
- **Integration**: Deploy Custom Rule Executor service.

---

## Phase 5 — PropFirm Challenge System

### Milestone 8 — White-Label Prop-Firm Integration Layer
**The Unification Layer**
- **Account Provisioning**: API for creating accounts from defined schemas.
- **Rule Engine**: Real-time enforcement of Drawdown, Daily Loss, and Consistency rules.
- **Webhook Bots**: Secure pipeline for executing trades from external algo sources.
- **Audit Logging**: Immutable, tenant-scoped record of every event.
- **Multi-Tenancy**: Full logical isolation of data and configuration.

---

## Future Milestones (Post-Launch)
- **Marketplace**: Sharing community indicators.
- **Social**: User profiles and commenting.
- **Broker Integration**: Live trading support (e.g., Alpaca).