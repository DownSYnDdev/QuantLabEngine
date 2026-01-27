# QuantLab Roadmap

## Overview
This roadmap outlines the full development sequence for QuantLab, from initial scaffolding to cloud deployment. Each milestone builds on the previous one and corresponds directly to the milestone files in the /agent folder.

---

## Phase 1 — Foundation & Core Engine

### Milestone 1 — Project Scaffolding & Core Charting
- Set up project structure, frontend, backend, and charting engine.
- Implement OHLCV schema, mock data, and basic WebGL/Canvas rendering.
- Establish UI layout and DSL integration hooks.

### Milestone 2 — Indicator Engine, Overlays & DSL Scaffolding
- Build modular indicator engine (SMA, EMA, RSI, MACD, Bollinger).
- Add overlay rendering system.
- Implement DSL tokenizer, parser, and AST generator.
- Connect DSL output to chart overlays.

### Milestone 3 — Full DSL Interpreter, Multi‑Symbol Support & Event System
- Complete DSL grammar and AST.
- Implement interpreter runtime, safety limits, and error handling.
- Add multi‑symbol execution and event-driven model.
- Integrate interpreter with chart and strategy outputs.

---

## Phase 2 — Trading Engine & Simulation

### Milestone 4 — Order Engine, Portfolio State & Strategy Execution
- Implement market, limit, stop, OCO, and bracket orders.
- Add fill logic, slippage, and partial fills.
- Build portfolio and position management.
- Connect DSL functions to order engine and event callbacks.

### Milestone 5 — Tick‑Level Backtesting Engine
- Implement deterministic simulation loop.
- Add tick and bar data loaders with caching.
- Integrate order engine and portfolio system into backtester.
- Provide performance metrics, equity curves, and trade visualization.

---

## Phase 3 — User System & Persistence

### Milestone 6 — User Accounts, Saved Layouts & Persistence
- Implement authentication (JWT/OAuth2).
- Add saved layouts, saved indicators, saved strategies, and watchlists.
- Integrate PostgreSQL + Redis.
- Build UI for managing user data and preferences.

---

## Phase 4 — Deployment & Scaling

### Milestone 7 — Cloud Deployment, Scaling & Monitoring
- Containerize all services with Docker.
- Deploy to Kubernetes with autoscaling.
- Add API gateway, SSL, CI/CD, logging, metrics, and alerting.
- Configure production database, caching, and environment variables.

---

## Phase 5 — PropFirm Challenge System

### Milestone 8 — PropFirm Account Types & Challenge Engine
- Implement config-driven account type system.
- Individual account configs provisioned: 25k, 50k, 100k, 150k (eval + straight-to-funded).
- Build challenge evaluation engine with runtime constraint enforcement.
- Add payout calculator and escrow policy management.
- Integrate account provisioning API for tenant-specific configs.

---

## Optional Future Milestones (Post‑Launch)

### Milestone 9 — Marketplace (Optional)
- User‑shared indicators and strategies.
- Rating system, tagging, and discovery.

### Milestone 9 — Social Features (Optional)
- Public profiles.
- Strategy sharing.
- Commenting and collaboration.

### Milestone 10 — Broker Integration (Optional)
- Paper trading first.
- Real broker APIs (Alpaca, Interactive Brokers, etc.).

### Milestone 11 — Mobile App (Optional)
- iOS/Android companion app.
- Real-time alerts and charting.

---

## Notes
- This roadmap is intentionally modular so the agent can work milestone-by-milestone.
- Each milestone corresponds to a dedicated milestoneX.md file for detailed execution.
- The roadmap should remain stable unless new features are added to the PRD.