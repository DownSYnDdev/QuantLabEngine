# Milestone 2: Indicators, Overlays & DSL Interpreter Scaffolding

## Objective
Extend the charting engine with indicator and overlay support, implement the first functional components of the DSL interpreter, and establish the data flow between DSL outputs and chart rendering.

---

## Tasks

### 1. Indicator Engine Foundation
- Create a modular indicator engine in `/workspace/backend/indicator-engine`
- Implement built‑in indicators:
  - Simple Moving Average (SMA)
  - Exponential Moving Average (EMA)
  - Relative Strength Index (RSI)
  - MACD (12/26/9)
  - Bollinger Bands
- Define a standard interface:
  - `input: OHLCV[]`
  - `output: series[]`
  - `config: object`
- Ensure indicators can be computed efficiently for large datasets.

---

### 2. Overlay Rendering System
- Extend charting engine to support:
  - Line overlays (SMA, EMA)
  - Multi‑line overlays (MACD)
  - Band overlays (Bollinger)
- Implement a rendering pipeline for:
  - Indicator layers
  - Overlay stacking order
  - Color and style configuration
- Add performance optimizations for multi‑indicator rendering.

---

### 3. DSL Interpreter Scaffolding
- Implement the first functional components of the DSL engine:
  - Tokenizer
  - Parser
  - AST generator
- Support basic syntax:
  - Variable declarations
  - Arithmetic expressions
  - Function calls
  - `on_bar(symbol)` block
- Implement a stub interpreter that:
  - Executes AST nodes
  - Returns indicator values
  - Integrates with the indicator engine

---

### 4. DSL → Chart Integration
- Create a data pipeline:
  - DSL code → AST → Interpreter → Indicator output → Chart overlay
- Implement error handling:
  - Syntax errors
  - Runtime errors
  - Type mismatches
- Add debugging utilities:
  - Console logs
  - Variable inspection

---

### 5. UI Enhancements
- Add indicator manager UI:
  - Add/remove indicators
  - Configure indicator parameters
- Add DSL editor improvements:
  - Syntax highlighting for DSL keywords
  - Error markers
  - Auto‑formatting (optional)

---

### 6. Rule Engine Integration
- Ensure `OHLCV` structures are compatible with Rule Engine checks.
- Add `Equity` and `FloatingPL` fields to the data feed model to support rule validation.

---

## Deliverables
- Fully functional indicator engine
- Overlay rendering system integrated with chart
- DSL tokenizer, parser, and AST generator
- Stub interpreter capable of producing indicator values
- DSL‑driven overlays rendered on chart
- Indicator manager UI
- Rule-compatible data models

---

## Acceptance Criteria
- Indicators render correctly and update smoothly
- DSL code can define simple indicators using `on_bar(symbol)`
- AST and interpreter handle basic expressions without errors
- Chart overlays reflect DSL output in real time
- UI allows adding/removing/configuring indicators
- Data models support `rule-engine.md` requirements

---

## Notes
- This milestone lays the groundwork for Milestone 3 (full DSL interpreter) and Milestone 4 (backtesting engine).
- Focus on modularity: indicator engine, DSL engine, and chart overlays should be loosely coupled.
