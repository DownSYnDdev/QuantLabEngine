# Milestone 4: Order Engine, Portfolio State & Strategy Execution

## Objective
Implement a fully functional order engine that supports realistic trading operations, integrate it with the DSL event system, and establish portfolio‑level state management. This milestone enables strategies to place orders, react to fills, and maintain positions — forming the backbone of both live execution and backtesting.

---

## Tasks

### 1. Order Engine Core
- Implement order types:
  - Market
  - Limit
  - Stop
  - Stop‑limit
  - OCO (One‑Cancels‑Other)
  - Bracket orders (entry + TP + SL)
- Define order structure:
  - `id`
  - `symbol`
  - `type`
  - `qty`
  - `price`
  - `status` (open, filled, partial, canceled)
  - `timestamp`
- Implement order routing logic:
  - Validate order parameters
  - Queue orders for evaluation
  - Match orders against incoming ticks/bars

---

### 2. Fill Logic & Execution Model
- Implement fill rules:
  - Market orders fill immediately at best available price
  - Limit orders fill when price crosses limit
  - Stop orders trigger when stop price is hit
  - Partial fills allowed
- Add slippage modeling:
  - Fixed slippage
  - Percentage slippage
  - Volatility‑based slippage (optional)
- Add execution latency simulation (optional)

---

### 3. Portfolio & Position Management
- Implement portfolio state:
  - Cash balance
  - Equity
  - Unrealized PnL
  - Realized PnL
  - Margin (optional)
- Implement position tracking:
  - Long/short positions
  - Average entry price
  - Position size
  - Per‑symbol PnL
- Add portfolio‑level events:
  - `on_position_change(position)`
  - `on_order_fill(order)`

---

### 4. DSL Integration: Order Placement & Events
- Add DSL functions:
  - `buy(symbol, qty)`
  - `sell(symbol, qty)`
  - `limit_buy(symbol, qty, price)`
  - `limit_sell(symbol, qty, price)`
  - `stop_buy(symbol, qty, price)`
  - `stop_sell(symbol, qty, price)`
  - `cancel(order_id)`
- Add strategy‑level functions:
  - `position(symbol)`
  - `portfolio()`
  - `equity()`
  - `cash()`
- Connect DSL events to order engine:
  - `on_tick(symbol)` triggers order evaluation
  - `on_order_fill(order)` triggers strategy callbacks

---

### 5. Event‑Driven Strategy Execution
- Implement event dispatcher for:
  - Tick events
  - Bar events
  - Order fill events
  - Position change events
- Ensure deterministic execution order:
  - Tick → Order evaluation → Fill events → Strategy callbacks → Chart updates

---

### 6. Chart & UI Integration
- Display active orders on chart:
  - Limit lines
  - Stop lines
  - Entry markers
- Display positions:
  - Entry price line
  - PnL labels
- Add strategy panel UI:
  - Active orders
  - Current positions
  - PnL summary
  - Logs from DSL

---

## Deliverables
- Fully functional order engine
- Fill logic with slippage and partial fills
- Portfolio and position management system
- DSL functions for order placement and portfolio access
- Event‑driven strategy execution pipeline
- Chart overlays for orders and positions
- Strategy panel UI

---

## Acceptance Criteria
- Strategies can place orders and receive fills
- Portfolio state updates correctly after each fill
- DSL events fire in correct order
- Orders appear visually on the chart
- Positions and PnL update in real time
- No unsafe or infinite loops in strategy execution
- Order engine integrates cleanly with DSL interpreter

---

## Notes
- This milestone is the foundation for Milestone 5 (Backtesting Engine).
- Focus on correctness and determinism — performance optimization comes later.
- Order engine must be modular so it can be reused for both real‑time and backtesting modes.
