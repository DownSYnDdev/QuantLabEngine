# Technical Architecture Document (TAD)
## Project: QuantLabEngine — White-Label Prop-Firm Simulated Trading Platform

## 1. System Overview
QuantLabEngine is a modular, scalable, cloud-deployable platform for real-time charting, simulated trading, and algorithmic signal execution. Designed as a white-label backend for proprietary trading firms, it provides multi-tenant isolation, rule enforcement, webhook-based algo-bot integration, and immutable audit logging.

---

## 2. High-Level Architecture

### 2.1 Core Components
- **Frontend Application**
  - Next.js
  - WebGL/Canvas charting engine
  - DSL editor with syntax highlighting
  - WebSocket client for real-time data
  - Tenant-aware branding

- **Backend Services**
  - REST API Gateway
  - WebSocket Streaming Service
  - DSL Interpreter Service
  - Backtesting Engine
  - Order Simulation Engine
  - **Rule Enforcement Engine** (NEW)
  - **Webhook Ingestion Service** (NEW)
  - **Audit Logging Service** (NEW)
  - User Account Service
  - Persistence Service

- **Data Layer**
  - PostgreSQL (relational data, tenant-isolated)
  - Redis (caching, session state, rate limiting)
  - Optional: TimescaleDB (time-series optimization)

- **Infrastructure**
  - Dockerized services
  - Kubernetes orchestration
  - Load balancer + API gateway
  - Logging + monitoring stack (Prometheus, Grafana, Loki)

---

## 3. Multi-Tenant Architecture

### 3.1 Tenant Isolation
- All data namespaced by `tenantId`.
- PostgreSQL Row-Level Security (RLS) or application-level enforcement.
- Separate encryption keys per tenant (optional).

### 3.2 Tenant Configuration
- Loaded from `agent/configs/tenants/{tenantId}.json`.
- Includes: branding, allowed account types, webhook secrets, data provider keys.

### 3.3 API Authentication
- Each tenant receives a unique API key.
- All requests validated against `tenantId` claim.

---

## 4. Webhook Bot Pipeline

### 4.1 Signal Flow
```
External Bot → POST /webhooks/signals → Validate HMAC → Rate Limit Check → Map to Account → Simulate Trade → Emit Events
```

### 4.2 Components
- **Ingestion Endpoint**: Receives JSON signals.
- **HMAC Validator**: Verifies `X-Signature` header.
- **Rate Limiter**: Token bucket per account (default: 10 req/min).
- **Order Router**: Forwards valid signals to Order Simulation Engine.

### 4.3 Events Emitted
- `webhook.received`
- `webhook.validated`
- `webhook.rejected`
- `webhook.trade_executed`

---

## 5. Rule Enforcement Engine

### 5.1 Rule Types
- **Daily Loss Limit**: Checks equity change within trading day.
- **Max Drawdown**: Checks trailing high-water mark.
- **Consistency Rule**: Checks for single-day dominance.
- **Trading Hours**: Validates signal timestamps.
- **Instrument Allowlist**: Validates symbols against tenant config.

### 5.2 Enforcement Points
- On every simulated fill.
- On periodic checkpoint (e.g., every 5 minutes).
- On daily reset.

### 5.3 Violation Handling
- Emit `rule.violation.*` event immediately.
- Write to immutable audit log.
- Optionally disable account or reject pending orders.

---

## 6. Audit Logging System

### 6.1 Log Structure
- `tenantId`, `accountId`, `eventType`, `timestamp`, `payload`, `hash`.
- Append-only storage (write-once).

### 6.2 Query API
- `GET /tenants/{tenantId}/accounts/{accountId}/audit-logs`
- Filter by: `startTime`, `endTime`, `eventType`.

### 6.3 Retention
- Configurable per account type (default: 90 days).

---

## 7. Frontend Architecture
- React/Next.js
- Component-based architecture
- State management via Zustand or Redux
- WebGL charting with Canvas fallback
- DSL editor with Monaco

---

## 8. Backend Services Detail

### 8.1 API Gateway
- Routes REST and WebSocket traffic
- Handles authentication (JWT/API Key)
- Rate limiting, request validation

### 8.2 Order Simulation Engine
- Market, Limit, Stop, OCO, Bracket orders
- Slippage modeling, partial fills
- Position tracking, portfolio state

### 8.3 DSL Interpreter
- Sandboxed execution (CPU/memory limits)
- Event-driven model (on_bar, on_tick, on_fill)

### 8.4 Backtesting Engine
- Tick-level simulation
- Deterministic execution
- Multi-symbol support

---

## 9. Data Architecture

### 9.1 PostgreSQL
- Users, Accounts, Trades, Audit Logs, Configs
- Tenant-scoped via `tenant_id` column

### 9.2 Redis
- Real-time symbol state
- WebSocket subscription state
- Rate limiting counters

---

## 10. Infrastructure

### 10.1 Containerization
- All services in Docker
- Multi-stage builds, minimal base images

### 10.2 Kubernetes
- Deployments, Services, ConfigMaps, Secrets
- Horizontal Pod Autoscaling

### 10.3 CI/CD
- GitHub Actions or GitLab CI
- Automated tests, linting, deploys

### 10.4 Observability
- Prometheus metrics
- Grafana dashboards
- Loki or ELK for logs

---

## 11. Security

### 11.1 Authentication
- JWT or OAuth2, refresh tokens
- Secure password hashing (Argon2)

### 11.2 Authorization
- Role-based access control
- Tenant-scoped API keys

### 11.3 DSL Sandboxing
- CPU, memory, time limits
- No external access

### 11.4 Webhook Security
- HMAC signature validation
- Replay protection via timestamp

---

## 12. Performance Requirements
- Chart rendering: 60 FPS
- Real-time latency: <100ms
- DSL execution: <5ms per tick
- Backtesting: 1M ticks < 2 seconds

---

## 13. Deployment Environments
- Local development
- Staging cluster
- Production cluster
