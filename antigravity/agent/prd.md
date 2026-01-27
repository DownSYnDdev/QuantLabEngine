# Product Requirements Document (PRD)
## Project: QuantLab — TradingView‑Like Platform with Algo‑Ready DSL

## 1. Overview
QuantLab is a web-based financial charting, analysis, and algorithmic trading platform inspired by TradingView but designed without its limitations. The system includes real-time data streaming, high-performance charting, technical indicators, a custom scripting language, user accounts, watchlists, and cloud-saved layouts. Unlike Pine Script, the DSL must support both indicator creation and full algorithmic trading logic, including realistic backtesting and event-driven execution.

## 2. Goals
- Deliver a TradingView-class charting platform with real-time data.
- Provide a modern DSL that supports:
  - indicator creation
  - strategy creation
  - algorithmic trading
  - multi-symbol logic
  - event-driven execution
  - tick-level backtesting
- Ensure the DSL is safe, sandboxed, and optimized for performance.
- Provide a scalable backend and cloud-deployable architecture.

## 3. Core Features

### 3.1 Real-Time Market Data
- WebSocket-based streaming.
- Tick-level updates.
- Efficient batching and throttling.
- Multi-symbol subscriptions.

### 3.2 Charting Engine
- WebGL or Canvas rendering.
- Smooth zoom/pan/crosshair.
- Multi-chart layouts.
- Indicator overlays.
- Customizable themes.

### 3.3 Technical Indicators
- Built-in indicators (RSI, MACD, EMA, Bollinger Bands, etc.).
- Modular indicator engine.
- Indicators must be callable from the DSL.

### 3.4 Custom DSL (Indicator + Algo Trading Language)

#### Syntax & Structure
- Simple, readable, Pine-inspired but not Pine-compatible.
- Supports variables, arrays, dictionaries, and custom functions.
- Supports multi-symbol references.

#### Execution Model
- Supports bar-based execution (indicator mode).
- Supports event-driven execution (strategy mode).

#### Event Types
- on_bar(symbol)
- on_tick(symbol)
- on_order_fill(order)
- on_position_change(position)
- on_start()
- on_end()

#### Trading Engine Integration
- Market, limit, stop, OCO, and bracket orders.
- Slippage modeling.
- Partial fills.
- Position sizing.
- Portfolio-level state.

#### Backtesting
- Tick-accurate simulation.
- Bar-based fallback mode.
- Multi-symbol backtesting.
- Deterministic execution.

#### Safety & Sandboxing
- No access to filesystem, network, or OS.
- CPU and memory limits.
- Infinite loop protection.
- Timeouts.

#### Error Handling
- Clear syntax errors.
- Runtime error messages.
- Debugging tools (logs, prints, variable inspection).

### 3.5 User Accounts & Persistence
- Authentication.
- Saved layouts.
- Saved indicators.
- Saved strategies.
- Watchlists.

### 3.6 Watchlists
- Real-time updates.
- Sorting and grouping.
- Multi-symbol monitoring.

### 3.7 PropFirm Account Management
- Config-driven account types and challenge definitions.
- Individual account configs provisioned: 25k, 50k, 100k, 150k (eval + straight-to-funded).
- Schema-validated configurations for:
  - Two challenge variants: Evaluation path and Straight-to-Funded
  - Profit targets, drawdown limits, daily loss limits
  - Trading rules and consistency requirements
  - Staged payout rules and escrow policies
- Runtime constraint enforcement based on provisioned configs.

### 3.8 UI/UX
- Modern, responsive interface.
- Draggable panels.
- Indicator/strategy manager.
- DSL editor with syntax highlighting.

## 4. Non-Functional Requirements

### 4.1 Performance
- 60 FPS chart rendering.
- <100ms real-time update latency.
- Efficient DSL execution.

### 4.2 Security
- Sandboxed DSL.
- Input validation.
- Secure authentication.
- Rate limiting.

### 4.3 Reliability
- Auto-reconnect for WebSockets.
- Graceful degradation.
- Fault-tolerant backtesting engine.

### 4.4 Scalability
- Stateless backend services.
- Containerized deployment.
- CDN for static assets.

## 5. Technical Requirements

### Frontend
- React or Next.js
- WebGL/Canvas rendering
- WebSocket client
- DSL editor

### Backend
- Node.js or Python
- REST + WebSocket APIs
- DSL interpreter engine
- Backtesting engine

### Database
- PostgreSQL
- Redis
- Optional: TimescaleDB

### Infrastructure
- Docker
- Kubernetes
- CI/CD
- Logging & monitoring

## 6. Milestones

1. **Milestone 1 — Project Scaffolding & Core Charting**  
2. **Milestone 2 — Indicator Engine, Overlays & DSL Scaffolding**  
3. **Milestone 3 — Full DSL Interpreter, Multi‑Symbol Support & Event System**  
4. **Milestone 4 — Order Engine, Portfolio State & Strategy Execution**  
5. **Milestone 5 — Tick‑Level Backtesting Engine**  
6. **Milestone 6 — User Accounts, Saved Layouts & Persistence**  
7. **Milestone 7 — Cloud Deployment, Scaling & Monitoring**

## 7. Acceptance Criteria
- DSL supports both indicators and strategies.
- DSL supports event-driven execution.
- Backtesting is tick-accurate.
- Multi-symbol strategies work.
- DSL is fully sandboxed.
- Charts render at 60 FPS.
- Real-time updates <100ms.
- Platform deploys to cloud. 
