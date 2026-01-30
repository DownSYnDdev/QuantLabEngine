# Technical Architecture Document (TAD)
## Project: QuantLab — TradingView‑Like Platform with Algo‑Ready DSL

## 1. System Overview
QuantLab is a modular, scalable, cloud‑deployable platform for real‑time charting, technical analysis, and algorithmic trading. The system consists of a modern frontend, a microservice‑friendly backend, a custom DSL engine, a backtesting engine, and real‑time data infrastructure. All components must be designed for low latency, high throughput, and safe execution of user‑generated code.

---

## 2. High‑Level Architecture

### 2.1 Core Components
- **Frontend Application**
  - React or Next.js
  - WebGL/Canvas charting engine
  - DSL editor with syntax highlighting
  - WebSocket client for real‑time data

- **Backend Services**
  - REST API service
  - WebSocket streaming service
  - DSL interpreter service
  - Backtesting engine
  - Order simulation engine
  - User account service
  - Persistence service

- **Data Layer**
  - PostgreSQL (relational data)
  - Redis (caching + real‑time state)
  - Optional: TimescaleDB (time‑series optimization)

- **Infrastructure**
  - Dockerized services
  - Kubernetes orchestration
  - Load balancer + API gateway
  - Logging + monitoring stack

---

## 3. Frontend Architecture

### 3.1 Framework
- React or Next.js
- Component‑based architecture
- State management via Zustand, Redux, or equivalent

### 3.2 Charting Engine
- WebGL preferred for performance
- Canvas fallback for compatibility
- Rendering pipeline:
  - Data normalization
  - GPU‑accelerated drawing
  - Layered rendering (candles, indicators, overlays)
  - Event handlers (zoom, pan, crosshair)

### 3.3 DSL Editor
- Syntax highlighting
- Auto‑completion
- Error markers
- Integration with backend for:
  - Parsing
  - Execution
  - Backtesting

### 3.4 Real‑Time Data Client
- WebSocket connection manager
- Auto‑reconnect
- Heartbeat/ping system
- Subscription manager for multiple symbols

---

## 4. Backend Architecture

### 4.1 API Gateway
- Routes REST and WebSocket traffic
- Handles authentication
- Rate limiting
- Request validation

### 4.2 REST API Service
- User management
- Watchlists
- Saved layouts
- Saved indicators/strategies
- Backtest requests
- DSL validation

### 4.3 WebSocket Streaming Service
- Real‑time tick and bar data
- Multi‑symbol subscriptions
- Efficient batching
- Backpressure handling

### 4.4 DSL Interpreter Service
- Parses DSL code
- Generates AST
- Executes code in sandbox
- Supports:
  - indicator mode
  - strategy mode
  - event‑driven mode
- Enforces CPU, memory, and time limits

### 4.5 Backtesting Engine
- Tick‑level simulation
- Bar‑level fallback
- Multi‑symbol support
- Deterministic execution
- Slippage + partial fills
- Portfolio‑level accounting

### 4.6 Order Simulation Engine
- Market, limit, stop, OCO, bracket orders
- Fill logic
- Slippage modeling
- Position tracking
- Event callbacks to DSL

---

## 5. DSL Architecture

### 5.1 Language Design
- Pine‑inspired but not Pine‑compatible
- Clean, readable syntax
- Supports:
  - variables
  - arrays
  - dictionaries
  - custom functions
  - multi‑symbol references

### 5.2 Parser
- Grammar defined in EBNF
- Lexer + parser generated automatically
- Produces AST nodes:
  - expressions
  - statements
  - event handlers
  - order instructions

### 5.3 AST
- Strongly typed node definitions
- Optimized for fast interpretation
- Supports:
  - arithmetic
  - logical operations
  - function calls
  - event blocks

### 5.4 Interpreter
- Executes AST in a sandbox
- Supports:
  - bar‑based execution
  - tick‑based execution
  - event‑driven execution
- Maintains:
  - variable scope
  - symbol state
  - portfolio state

### 5.5 Sandbox
- No filesystem access
- No network access
- CPU time limits
- Memory limits
- Infinite loop detection
- Execution timeout

### 5.6 Event System
Supported events:
- on_start()
- on_end()
- on_tick(symbol)
- on_bar(symbol)
- on_order_fill(order)
- on_position_change(position)

### 5.7 Order Engine Integration
- DSL can submit orders
- Engine simulates fills
- Events fed back into DSL

---

## 6. Data Architecture

### 6.1 PostgreSQL
Stores:
- users
- watchlists
- saved layouts
- saved indicators/strategies
- backtest results
- audit logs

### 6.2 Redis
Stores:
- real‑time symbol state
- tick buffers
- WebSocket subscription state
- rate limiting counters

### 6.3 TimescaleDB (optional)
Stores:
- historical OHLCV data
- tick data
- backtest datasets

---

## 7. Infrastructure Architecture

### 7.1 Containerization
- All services run in Docker containers
- Shared base images for consistency

### 7.2 Kubernetes
- Deployment objects for each service
- Horizontal Pod Autoscaling
- ConfigMaps + Secrets
- Ingress controller

### 7.3 CI/CD
- Automated builds
- Automated tests
- Automated deployments to staging
- Manual approval for production

### 7.4 Logging & Monitoring
- Centralized logs (ELK or Loki)
- Metrics (Prometheus)
- Dashboards (Grafana)
- Alerts for:
  - latency spikes
  - failed deployments
  - DSL sandbox violations

---

## 8. Security Architecture

### 8.1 Authentication
- JWT or OAuth2
- Refresh tokens
- Secure password hashing

### 8.2 Authorization
- Role‑based access control
- API rate limits
- Per‑user resource quotas

### 8.3 DSL Sandboxing
- CPU, memory, and time limits
- No external access
- Safe standard library
- Execution isolation

### 8.4 Data Security
- Encrypted connections
- Encrypted secrets
- Audit logging

---

## 9. Performance Requirements
- Chart rendering: 60 FPS
- Real‑time update latency: <100ms
- DSL execution: <5ms per tick
- Backtesting:
  - 1M ticks processed in <2 seconds
- WebSocket throughput:
  - 10K messages/sec per node

---

## 10. Deployment Environments
- **Local development**
- **Staging cluster**
- **Production cluster**
- **Optional: multi‑region deployment**

---

## 11. Acceptance Criteria
- All components deploy successfully to Kubernetes.
- DSL supports indicators, strategies, and event‑driven logic.
- Backtesting engine is tick‑accurate and deterministic.
- Multi‑symbol strategies run without performance degradation.
- Real‑time updates remain under 100ms latency.
- Charts render at 60 FPS.
- System passes security audits.
