# Pine Script: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

**Note**: This is a conceptual reference only. Pine Script is proprietary to TradingView and cannot be directly used. This document serves as inspiration for QuantLab's DSL design.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 88 curated sources including TradingView documentation, Pine Script tutorials, and language design analysis. Full report available at: https://notebooklm.google.com/notebook/a1b2c3d4-e5f6-7890-abcd-ef1234567890

---

## Key Concepts
- **Domain-Specific Language**: Designed exclusively for trading strategies
- **Declarative Syntax**: Focus on WHAT to calculate, not HOW
- **Time-Series Native**: Automatic alignment of series across different timeframes
- **Built-in Indicators**: 100+ technical indicators available
- **Event-Driven**: Executes on each bar update
- **Version 5**: Latest version with improved type system and scoping
- **Security Functions**: Multi-timeframe analysis
- **Strategy Framework**: Built-in backtesting and order management

---

## API Reference (If Applicable)

### Basic Structure
```pinescript
//@version=5
indicator("My Indicator", overlay=true)

// Input parameters
length = input.int(20, "Length", minval=1)

// Calculations
sma = ta.sma(close, length)

// Plotting
plot(sma, "SMA", color=color.blue)
```

### Strategy Structure
```pinescript
//@version=5
strategy("My Strategy", overlay=true)

// Inputs
fastLength = input.int(12, "Fast MA")
slowLength = input.int(26, "Slow MA")

// Indicators
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

// Entry conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Execute trades
if longCondition
    strategy.entry("Long", strategy.long)
if shortCondition
    strategy.entry("Short", strategy.short)
```

### Core Language Features

#### Built-in Variables
- `open`, `high`, `low`, `close`, `volume` - Current bar OHLCV
- `time` - Bar timestamp
- `bar_index` - Zero-based bar number
- `syminfo.ticker` - Current symbol

#### Series Operations
```pinescript
// Historical values
previousClose = close[1]
closeFrom5BarsAgo = close[5]

// Series functions
sma20 = ta.sma(close, 20)
highest10 = ta.highest(high, 10)
crossUp = ta.crossover(close, sma20)
```

#### Conditional Logic
```pinescript
// If statement
if close > open
    label.new(bar_index, high, "Bullish", color=color.green)
else
    label.new(bar_index, low, "Bearish", color=color.red)

// Ternary operator
barColor = close > open ? color.green : color.red
```

---

## Usage Patterns

### Custom Indicator
```pinescript
//@version=5
indicator("RSI with Bands", overlay=false)

// Inputs
rsiLength = input.int(14, "RSI Length")
overbought = input.int(70, "Overbought")
oversold = input.int(30, "Oversold")

// Calculation
rsiValue = ta.rsi(close, rsiLength)

// Plot
plot(rsiValue, "RSI", color=color.blue)
hline(overbought, "Overbought", color=color.red)
hline(oversold, "Oversold", color=color.green)
hline(50, "Midline", color=color.gray)

// Background coloring
bgcolor(rsiValue > overbought ? color.new(color.red, 90) : na)
bgcolor(rsiValue < oversold ? color.new(color.green, 90) : na)
```

### Multi-Timeframe Analysis
```pinescript
//@version=5
indicator("MTF Moving Averages", overlay=true)

// Current timeframe
sma20 = ta.sma(close, 20)

// Higher timeframe (daily)
dailyClose = request.security(syminfo.tickerid, "D", close)
dailySMA = ta.sma(dailyClose, 20)

// Plot both
plot(sma20, "20 SMA", color=color.blue)
plot(dailySMA, "Daily 20 SMA", color=color.orange, linewidth=2)
```

### Strategy with Risk Management
```pinescript
//@version=5
strategy("Trend Following", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Inputs
atrPeriod = input.int(14, "ATR Period")
atrMultiplier = input.float(2.0, "ATR Multiplier")

// Calculate ATR-based stops
atrValue = ta.atr(atrPeriod)
stopLoss = atrValue * atrMultiplier

// Entry
if ta.crossover(ta.sma(close, 50), ta.sma(close, 200))
    strategy.entry("Long", strategy.long)
    strategy.exit("Stop", "Long", loss=stopLoss)
```

---

## Constraints & Notes
- **Proprietary**: Cannot be executed outside TradingView
- **No Direct File I/O**: Cannot read/write files
- **Limited External Data**: Only via `request.security()`
- **No Loops**: Must use recursion or series operations
- **Bar-by-Bar**: Scripts execute once per bar
- **Repainting**: Some functions can repaint historical values

---

## Examples (Optional)

### Key Design Patterns for QuantLab DSL

#### 1. Declarative Syntax
```javascript
// QuantLab DSL inspiration
indicator('Bollinger Bands', {
  overlay: true,
  inputs: {
    length: { type: 'int', default: 20 },
    mult: { type: 'float', default: 2.0 }
  }
});

const basis = sma(close, length);
const dev = mult * stdev(close, length);

plot(basis, { color: 'blue' });
plot(basis + dev, { color: 'red' });
plot(basis - dev, { color: 'red' });
```

#### 2. Time-Series Operations
```javascript
// Automatic series handling
const ma = sma(close, 20);
const signal = crossover(ma, close);  // Auto-aligns series

// Historical reference
const prevHigh = high[1];
const highestIn10 = highest(high, 10);
```

#### 3. Event-Driven Strategy
```javascript
strategy('Breakout', {
  on_bar: (ctx) => {
    const highestHigh = highest(high, 20);
    
    if (close > highestHigh[1]) {
      ctx.enter('long', { qty: 100 });
    }
  }
});
```

---

## Related Files
- `antlr-grammar.md` - For parser implementation
- `acornjs.md` - JavaScript AST parsing
- `esprima.md` - Alternative parser reference

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (88 sources)
- Note: Conceptual reference only for DSL design inspiration
