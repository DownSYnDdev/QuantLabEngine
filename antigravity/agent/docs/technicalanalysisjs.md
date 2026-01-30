# TechnicalAnalysis.js: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 33 curated sources including NPM documentation, GitHub examples, and implementation guides. Full report available at: https://notebooklm.google.com/notebook/84b9a978-c2cb-47f8-abcd-5b4941dc12d0

---

## Key Concepts
- **Pure JavaScript**: No C dependencies, runs in browser and Node.js
- **TypeScript Support**: Written in TypeScript with full type definitions
- **Candlestick Patterns**: Built-in pattern recognition (Doji, Hammer, Engulfing, etc.)
- **Comprehensive Indicators**: 40+ technical indicators covering all major categories
- **Streaming Capable**: Can process data incrementally for real-time applications
- **NPM Package**: `technicalindicators` - actively maintained
- **Object-Oriented API**: Uses classes for each indicator

---

## API Reference (If Applicable)

### Installation
```bash
npm install technicalindicators
```

### Core Indicator Classes
**Trend**: SMA, EMA, WMA, VWMA, MACD, ADX, Ichimoku
**Momentum**: RSI, Stochastic, CCI, Williams %R, ROC, MFI
**Volatility**: BollingerBands, ATR, Keltner Channels
**Volume**: OBV, VWAP, ForceIndex
**Patterns**: CandlestickPattern recognition

### Basic Usage Pattern
```javascript
import { SMA, RSI, MACD } from 'technicalindicators';

// Simple Moving Average
const sma = new SMA({
  period: 20,
  values: closePrices
});
const result = sma.getResult();

// Or static method
const smaValues = SMA.calculate({
  period: 20,
  values: closePrices
});
```

### Common Indicators

#### SMA (Simple Moving Average)
```javascript
import { SMA } from 'technicalindicators';
const smaInput = {
  period: 20,
  values: [/* close prices */]
};
const sma = SMA.calculate(smaInput);
```

#### RSI (Relative Strength Index)
```javascript
import { RSI } from 'technicalindicators';
const rsi = RSI.calculate({
  period: 14,
  values: closePrices
});
```

#### MACD
```javascript
import { MACD } from 'technicalindicators';
const macd = MACD.calculate({
  values: closePrices,
  fastPeriod: 12,
  slowPeriod: 26,
  signalPeriod: 9,
  SimpleMAOscillator: false,
  SimpleMASignal: false
});
// Returns: [{ MACD, signal, histogram }, ...]
```

#### Bollinger Bands
```javascript
import { BollingerBands } from 'technicalindicators';
const bands = BollingerBands.calculate({
  period: 20,
  values: closePrices,
  stdDev: 2
});
// Returns: [{ upper, middle, lower, pb }, ...]
```

---

## Usage Patterns

### Streaming/Incremental Updates
```javascript
const rsi = new RSI({ period: 14, values: [] });

// Add new values incrementally
priceStream.on('data', (price) => {
  const nextRSI = rsi.nextValue(price);
  if (nextRSI) {
    console.log('Latest RSI:', nextRSI);
  }
});
```

### Candlestick Pattern Recognition
```javascript
import {
  bullishengulfingpattern,
  bearishengulfingpattern,
  doji,
  hammer,
  shootingstar
} from 'technicalindicators';

const candles = [
  { open: 100, high: 105, low: 99, close: 103 },
  // more candles...
];

const isBullish = bullishengulfingpattern({ open: opens, high: highs, low: lows, close: closes });
```

### Multiple Indicators
```javascript
import { SMA, EMA, RSI, MACD } from 'technicalindicators';

const indicators = {
  sma20: SMA.calculate({ period: 20, values: closes }),
  ema12: EMA.calculate({ period: 12, values: closes }),
  rsi14: RSI.calculate({ period: 14, values: closes }),
  macd: MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  })
};
```

---

## Constraints & Notes
- **Array Alignment**: Indicator outputs are shorter than inputs due to warm-up period
- **No Built-in Charts**: Pure calculation library
- **Performance**: Slower than C-based libraries (Tulip) but acceptable for most use cases
- **Pattern Recognition Limitations**: Candlestick patterns require full OHLC data
- **Memory Usage**: Class-based approach retains calculation state
- **Browser Compatibility**: Works well with bundlers (Webpack, Rollup, Vite)

---

## Examples (Optional)

### Real-Time Indicator Dashboard
```javascript
class IndicatorDashboard {
  constructor() {
    this.rsi = new RSI({ period: 14, values: [] });
    this.sma = new SMA({ period: 20, values: [] });
  }
  
  update(price) {
    return {
      rsi: this.rsi.nextValue(price),
      sma: this.sma.nextValue(price),
      timestamp: Date.now()
    };
  }
}

const dashboard = new IndicatorDashboard();
ws.onmessage = (event) => {
  const indicators = dashboard.update(event.data.price);
  updateUI(indicators);
};
```

### Backtesting with Indicators
```javascript
import { SMA, RSI } from 'technicalindicators';

function backtest(ohlcv) {
  const closes = ohlcv.map(bar => bar.close);
  
  const sma20 = SMA.calculate({ period: 20, values: closes });
  const sma50 = SMA.calculate({ period: 50, values: closes });
  const rsi = RSI.calculate({ period: 14, values: closes });
  
  const signals = [];
  for (let i = 50; i < closes.length; i++) {
    const idx20 = i - (closes.length - sma20.length);
    const idx50 = i - (closes.length - sma50.length);
    
    if (sma20[idx20] > sma50[idx50] && rsi[i - 14] < 30) {
      signals.push({ time: ohlcv[i].time, action: 'BUY' });
    }
  }
  return signals;
}
```

---

## Related Files
- `tulip-indicators.md` - C-based alternative for better performance
- `simple-statistics.md` - For statistical calculations
- `pine-script.md` - Conceptual DSL reference

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (33 sources)
