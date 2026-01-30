# TradingView Lightweight Charts: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 42 curated sources including official documentation, tutorials, and community examples. Full report available at: https://notebooklm.google.com/notebook/f2ce555e-0ff4-4384-a3da-b545e9894a84

---

## Key Concepts
- **Lightweight Performance**: Minimal footprint (~60KB gzipped) optimized for rendering large datasets
- **Canvas-based**: Uses HTML5Canvas instead of SVG for high-performance rendering
- **Series Types**: Candlestick, Bar, Line, Area, Histogram, Baseline
- **Time/Price Scales**: Customizable scales with automatic formatting and zoom capabilities
- **Real-time Updates**: Efficient data conflation for streaming tick data
- **Plugin Architecture**: Extensible with primitives for custom drawings and overlays

---

## API Reference (If Applicable)

### Core Classes
- **`createChart(container, options)`**: Initialize chart instance
- **`chart.addCandlestickSeries(options)`**: Add candlestick series
- **`chart.addLineSeries(options)`**: Add line overlay
- **`series.setData(data)`**: Set initial dataset
- **`series.update(bar)`**: Update latest bar or add new bar
- **`chart.timeScale()`**: Access time scale API
- **`chart.priceScale()`**: Access price scale API

### Data Format
```javascript
const data = [
  { time: 1642425600, open: 100, high: 105, low: 98, close: 102 },
  // Unix timestamps or YYYY-MM-DD strings
];
```

### Essential Options
- **`width`, `height`**: Chart dimensions
- **`layout.backgroundColor`**: Chart background  
- **`layout.textColor`**: Text and labels color
- **`grid.vertLines.color`**, **`grid.horzLines.color`**: Grid styling
- **`timeScale.timeVisible`**, **`timeScale.secondsVisible`**: Time display
- **`crosshair.mode`**: Crosshair behavior (normal/magnet)

---

## Usage Patterns

### Basic Setup
```javascript
import { createChart } from 'lightweight-charts';

const chart = createChart(document.getElementById('chart'), {
  width: 800,
  height: 400,
});

const candlestickSeries = chart.addCandlestickSeries();
candlestickSeries.setData(ohlcData);
```

### Real-time Updates
```javascript
// Update latest bar
candlestickSeries.update({
  time: currentTime,
  open: tick.open,
  high: Math.max(tick.high, lastBar.high),
  low: Math.min(tick.low, lastBar.low),
  close: tick.close
});
```

### Custom Price Formatting
```javascript
chart.applyOptions({
  localization: {
    priceFormatter: (price) => '$' + price.toFixed(2)
  }
});
```

### Multiple Series/Overlays
```javascript
const mainSeries = chart.addCandlestickSeries();
const volumeSeries = chart.addHistogramSeries({
  priceScaleId: 'volume',
  priceFormat: { type: 'volume' }
});
const smaLine = chart.addLineSeries({ color: 'blue' });
```

---

## Constraints & Notes
- **No built-in indicators**: Must calculate indicators separately (use Tulip or TechnicalAnalysis.js)
- **Time data must be sorted**: Data must be in chronological order
- **Limited drawing tools**: Requires custom primitives for advanced annotations
- **Single time zone per chart**: Cannot mix time zones in one instance
- **Mobile touch optimization**: Provides good touch support but customization is limited
- **Performance**: Can handle 10k+ bars smoothly; use data decimation for larger datasets

---

## Examples (Optional)

### Responsive Chart
```javascript
const chart = createChart(container, { autoSize: true });

// Or manual resize
window.addEventListener('resize', () => {
  chart.resize(container.clientWidth, container.clientHeight);
});
```

### Custom Crosshair Sync
```javascript
chart.subscribeCrosshairMove((param) => {
  if (param.time) {
    const price = param.seriesData.get(candlestickSeries);
    console.log('Price:', price.close);
  }
});
```

---

## Related Files
- `tulip-indicators.md` - For calculating technical indicators
- `d3js.md` - For advanced custom overlays
- `nextjs-app-router.md` - For framework integration

---

## Revision History
- Created: 2026-01-26
- Source: Not BookLM Deep Research (42 sources)
