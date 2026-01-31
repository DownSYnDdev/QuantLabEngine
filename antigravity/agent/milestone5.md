## Milestone 5: Tick‑Level Backtesting Engine & Simulation Loop

### Objective
Build a high‑performance, deterministic backtesting engine capable of simulating strategies at tick‑level granularity. This milestone connects the DSL interpreter, order engine, and portfolio system into a unified simulation environment that can replay historical data, evaluate strategies, and produce accurate performance metrics.

---

## Tasks

### 1. Backtesting Engine Core
- Implement a simulation loop that processes:
  - Tick data (preferred)
  - Bar data (fallback)
- Define the backtest context:
  - Current timestamp
  - Active symbol set
  - Portfolio state
  - Open orders
  - DSL interpreter instance
- Ensure deterministic execution:
  - Fixed ordering of events
  - Reproducible results for identical inputs

---

## 2. Historical Data Loader
- Implement data ingestion for:
  - Tick data (bid/ask or last trade)
  - OHLCV bar data
- Add data normalization:
  - Timestamp alignment
  - Missing data handling
  - Multi‑symbol synchronization
- Add caching for performance:
  - Pre‑loaded datasets
  - In‑memory buffers

---

## 3. Simulation Loop & Event Dispatch
- For each tick:
  - Update symbol state
  - Trigger `on_tick(symbol)`
  - Evaluate open orders
  - Trigger `on_order_fill(order)`
  - Update portfolio state
  - Trigger `on_position_change(position)`
- For each bar close:
  - Trigger `on_bar(symbol)`
- Ensure correct ordering:
  - Tick → Order evaluation → Fill events → DSL callbacks → Portfolio update

---

## 4. Order Engine Integration
- Connect the order engine from Milestone 4 to the backtester:
  - Market orders fill immediately at simulated price
  - Limit/stop orders fill based on tick movement
  - Partial fills allowed
- Add slippage models:
  - Fixed slippage
  - Percentage slippage
  - Volatility‑based slippage (optional)
- Add execution latency simulation (optional)

---

## 5. Portfolio Accounting & Metrics
- Track:
  - Cash
  - Equity
  - Unrealized PnL
  - Realized PnL
  - Drawdown
  - Exposure
- Implement performance metrics:
  - Sharpe ratio
  - Sortino ratio
  - Max drawdown
  - Win rate
  - Profit factor
  - Average trade duration
- Store results in a structured format for UI display.

---

## 6. DSL Integration
- Allow DSL strategies to:
  - Place orders during backtests
  - Access historical series
  - Query portfolio state
  - Log debug information
- Ensure DSL event handlers run in the correct order:
  - `on_start()` before simulation
  - `on_end()` after simulation
- Add DSL debugging tools:
  - Step‑through mode (optional)
  - Variable inspection
  - Execution logs

---

## 7. Backtest UI & Visualization
- Add UI components:
  - Backtest configuration panel
  - Date range selector
  - Symbol selector
  - Parameter inputs
- Add results visualization:
  - Equity curve
  - Drawdown chart
  - Trade markers on chart
  - Order history table
  - Performance metrics panel

---

---

### 8. Rule Engine Integration
- Simulate rule checks on every tick/bar (Daily Loss, Max Loss).
- Track "Rule Violation" events in the backtest result.
- Stop simulation immediately upon hard breach (e.g., Max Loss).

---

## Deliverables
- Fully functional tick‑level backtesting engine
- Historical data loader with caching
- Deterministic simulation loop
- Integrated order engine and portfolio system
- DSL‑driven strategy execution in backtest mode
- Performance metrics and results visualization
- Performance metrics and results visualization
- Backtest configuration UI
- Rule violation reports

---

## Acceptance Criteria
- Backtests run deterministically with identical inputs
- Strategies can place orders and receive fills during simulation
- Portfolio state updates correctly on every tick
- Portfolio state updates correctly on every tick
- Performance metrics are accurate and consistent
- Rule violations are correctly detected and reported
- UI displays equity curve, drawdown, trades, and metrics
- Backtests complete within reasonable time (e.g., 1M ticks < 2 seconds on modern hardware)

---

## Notes
- This milestone completes the core of the QuantLab engine.
- Future milestones (user system, cloud deployment) build on this foundation.
- Performance optimization can be deferred until after correctness is validated.
