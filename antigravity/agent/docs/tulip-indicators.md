# Tulip Indicators: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 32 curated sources including official Tulip documentation, API references, and implementation guides. Full report available at: https://notebooklm.google.com/notebook/b4d66cd7-889f-4073-85d8-338a4da7f089

---

## Key Concepts
- **C Performance**: Written in ANSI C for maximum speed and portability
- **104 Indicators**: Comprehensive TA library covering momentum, volatility, trend, volume
- **Zero Dependencies**: No external library requirements
- **Thread-Safe**: Can be used in multi-threaded applications
- **Simple API**: Consistent function signatures across all indicators
- **Language Bindings**: Available for Node.js (tulipnode), Python (tulipy), and others
- **Lightweight**: Minimal memory footprint and fast execution

---

## API Reference (If Applicable)

### Core Indicator Categories
**Overlap Studies**: SMA, EMA, DEMA, TEMA, WMA, KAMA, TRIMA
**Momentum Indicators**: RSI, MACD, Stochastic, CCI, MOM, ROC, WILLR
**Volatility Indicators**: ATR, NATR, BBANDS (Bollinger Bands), True Range
**Volume Indicators**: OBV, AD, ADOSC, MFI
**Trend Indicators**: ADX, AROON, DX, MINUS_DI, PLUS_DI

### Function Signature Pattern
```c
int ti_<indicator>_start(TI_REAL const *options);
int ti_<indicator>(int size, 
                   TI_REAL const *const *inputs,
                   TI_REAL const *options, 
                   TI_REAL *const *outputs);
```

### JavaScript (tulipnode) Example
```javascript
const tulind = require('tulind');

// Simple Moving Average
tulind.indicators.sma.indicator(
  [closeData],      // inputs
  [period],         // options
  (err, results) => {
    const smaValues = results[0];
  }
);
```

### Common Indicators

#### SMA (Simple Moving Average)
- **Inputs**: close prices
- **Options**: [period]
- **Outputs**: sma values

#### RSI (Relative Strength Index)
- **Inputs**: close prices
- **Options**: [period]  // typically 14
- **Outputs**: rsi values (0-100)

#### MACD (Moving Average Convergence Divergence)
- **Inputs**: close prices
- **Options**: [short_period, long_period, signal_period]  // typically [12, 26, 9]
- **Outputs**: [macd_line, signal_line, histogram]

#### BBANDS (Bollinger Bands)
- **Inputs**: close prices
- **Options**: [period, stddev]  // typically [20, 2]
- **Outputs**: [lower_band, middle_band, upper_band]

---

## Usage Patterns

### Node.js Integration
```javascript
const tulind = require('tulind');

// Get indicator start index (how many values are consumed)
const smaStart = tulind.indicators.sma.start([20]); // period=20

// Calculate indicator
tulind.indicators.sma.indicator(
  [priceData],
  [20],
  (err, [smaResults]) => {
    if (err) throw err;
    // smaResults.length = priceData.length - smaStart
  }
);
```

### Multi-Output Indicators
```javascript
// MACD returns [macd, signal, histogram]
tulind.indicators.macd.indicator(
  [closeData],
  [12, 26, 9],
  (err, [macdLine, signalLine, histogram]) => {
    // Process three separate arrays
  }
);
```

### Synchronous Alternative (tulind.js)
```javascript
const indicators = require('tulind');

// Some bindings offer synchronous API
const result = indicators.sma.indicator_sync([closeData], [period]);
```

---

## Constraints & Notes
- **Look-back Period**: Each indicator consumes initial values; output array is shorter than input
- **Data Alignment**: Must align indicator outputs with price data indices carefully
- **No NaN Handling**: Ensure input data has no NaN/undefined values
- **Single Precision**: Uses `double` internally but some bindings may use `float`
- **Static Allocation**: C library requires pre-allocated output buffers
- **No Built-in Charting**: Pure calculation library; visualization requires separate library

---

## Examples (Optional)

### Calculate Multiple Indicators
```javascript
const calculateIndicators = async (ohlcv) => {
  const closes = ohlcv.map(bar => bar.close);
  const highs = ohlcv.map(bar => bar.high);
  const lows = ohlcv.map(bar => bar.low);
  
  const [sma20] = await promisify(tulind.indicators.sma.indicator)(
    [closes], [20]
  );
  
  const [rsi] = await promisify(tulind.indicators.rsi.indicator)(
    [closes], [14]
  );
  
  const [macd, signal, histogram] = await promisify(
    tulind.indicators.macd.indicator
  )([closes], [12, 26, 9]);
  
  return { sma20, rsi, macd, signal, histogram };
};
```

### Real-time Indicator Updates
```javascript
// Maintain rolling buffer for efficiency
class IndicatorBuffer {
  constructor(period) {
    this.buffer = [];
    this.period = period;
  }
  
  update(value) {
    this.buffer.push(value);
    if (this.buffer.length > this.period * 2) {
      this.buffer.shift();
    }
    
    if (this.buffer.length >= this.period) {
      // Calculate SMA for latest value
      tulind.indicators.sma.indicator(
        [this.buffer],
        [this.period],
        (err, [result]) => {
          return result[result.length - 1];
        }
      );
    }
  }
}
```

---

## Related Files
- `technicalanalysisjs.md` - Pure JavaScript alternative
- `simple-statistics.md` - For statistical calculations
- `danfojs.md` - For DataFrame-based indicator calculations

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (32 sources)
