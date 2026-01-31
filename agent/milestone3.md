# Milestone 3: Full DSL Interpreter, Multi‑Symbol Support & Event System

## Objective
Transform the DSL from a basic parser into a fully functional scripting language capable of executing indicator logic, multi‑symbol strategies, and event‑driven code. This milestone establishes the core execution model that all future strategy, backtesting, and order‑engine features will rely on.

---

## Tasks

### 1. Complete DSL Grammar & AST Expansion
- Finalize the full grammar specification:
  - Variables, arrays, dictionaries
  - User‑defined functions
  - Control flow (if/else, loops with safety limits)
  - Multi‑symbol references
  - Event blocks
- Expand AST node types:
  - Expression nodes
  - Statement nodes
  - Event handler nodes
  - Function definition nodes
- Add AST validation rules:
  - Type checking
  - Illegal recursion detection
  - Infinite loop prevention

---

### 2. Interpreter Core Implementation
- Implement the interpreter runtime:
  - Execution context
  - Variable scope management
  - Function call stack
  - Built‑in functions (math, series ops, indicator calls)
- Add runtime safety:
  - CPU time limits
  - Memory limits
  - Step counter for loop protection
- Implement error handling:
  - Syntax errors
  - Runtime errors
  - Type errors
  - Helpful debugging messages

---

### 3. Multi‑Symbol Execution Support
- Add symbol registry to interpreter context
- Allow DSL code to reference multiple symbols:
  - `close("AAPL")`
  - `sma("ETHUSD", 20)`
- Implement cross‑symbol state:
  - Shared variables
  - Per‑symbol series
- Ensure deterministic execution order:
  - Alphabetical or timestamp‑based ordering

---

### 4. Event‑Driven Execution Model
- Implement event handlers:
  - `on_start()`
  - `on_end()`
  - `on_bar(symbol)`
  - `on_tick(symbol)`
  - `on_order_fill(order)`
  - `on_position_change(position)`
- Create event dispatcher:
  - Routes incoming events to DSL handlers
  - Maintains per‑symbol execution queues
- Add lifecycle management:
  - Initialize state on start
  - Flush state on end

---

### 5. Built‑In Indicator & Series Functions
- Integrate indicator engine from Milestone 2:
  - SMA, EMA, RSI, MACD, Bollinger Bands
- Add series operations:
  - `series.shift(n)`
  - `series.diff()`
  - `series.avg()`
- Add math utilities:
  - `min()`, `max()`, `abs()`, `round()`
  - `log()`, `exp()`, `sqrt()`

---

### 6. DSL → Chart & Strategy Integration
- Connect interpreter outputs to chart overlays:
  - Line series
  - Multi‑line series
  - Bands
- Add strategy output hooks:
  - Signals (buy/sell)
  - Debug logs
  - Variable inspection
- Ensure real‑time updates flow:
  - Data → Event → Interpreter → Output → Chart

---

---

### 7. Tenant Data Isolation
- Ensure all symbol data requests include `tenantId`.
- Validate that the accessed symbol is in the tenant's `allowedInstruments` list (from `tenant-config.md`).

---

## Deliverables
- Complete DSL grammar
- Full AST implementation
- Fully functional interpreter with safety limits
- Multi‑symbol execution engine
- Event‑driven runtime
- Built‑in indicator and series functions
- Chart integration for DSL‑generated overlays
- Chart integration for DSL‑generated overlays
- Strategy output hooks
- Tenant-scoped data access

---

## Acceptance Criteria
- DSL can run multi‑symbol indicator scripts without errors
- Event handlers execute in correct order and timing
- Interpreter enforces CPU, memory, and loop safety
- DSL can produce overlays and strategy signals
- Errors are clear, descriptive, and non‑fatal
- Errors are clear, descriptive, and non‑fatal
- Chart updates reflect DSL output in real time
- Data access obeys `tenantId` scope

---

## Notes
- This milestone sets the foundation for Milestone 4 (Order Engine) and Milestone 5 (Backtesting Engine).
- Focus on correctness and safety over performance; optimization comes later.
- Interpreter must be modular so future features (orders, backtesting, portfolio logic) can plug in cleanly.
