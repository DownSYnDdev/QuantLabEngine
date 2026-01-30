# Simple-statistics: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 75 curated sources including official documentation, API references, and statistical computing guides. Full report available at: https://notebooklm.google.com/notebook/e0631f86-0c71-4c32-aea5-1861dfc1570b

---

## Key Concepts
- **Zero Dependencies**: Pure JavaScript with no external libraries
- **Browser & Node**: Works in all environments
- **Descriptive Statistics**: Mean, median, mode, variance, standard deviation
- **Distributions**: Normal, binomial, Poisson distributions
- **Regression**: Linear regression, r-squared, correlation
- **Sampling**: Random sampling, shuffling, quantiles
- **Tree-Shakeable**: ES modules for optimal bundle size
- **Functional API**: Pure functions, no classes or state

---

## API Reference (If Applicable)

### Core Statistical Functions

#### Central Tendency
- **`mean(data)`**: Arithmetic mean
- **`median(data)`**: Middle value
- **`mode(data)`**: Most frequent value
- **`geometricMean(data)`**: Geometric mean
- **`harmonicMean(data)`**: Harmonic mean
- **`rootMeanSquare(data)`**: RMS value

#### Dispersion
- **`variance(data)`**: Population variance
- **`sampleVariance(data)`**: Sample variance
- **`standardDeviation(data)`**: Population std dev
- **`sampleStandardDeviation(data)`**: Sample std dev
- **`medianAbsoluteDeviation(data)`**: MAD
- **`interquartileRange(data)`**: IQR

#### Distribution
- **`min(data)`, `max(data)`**: Extrema
- **`extent(data)`**: [min, max]
- **`sum(data)`**: Total
- **`quantile(data, p)`**: p-th quantile (0-1)
- **`quantileRank(data, value)`**: Percentile rank

#### Regression
- **`linearRegression(data)`**: Returns {m, b} for y = mx + b
- **`linearRegressionLine(mb)`**: Returns prediction function
- **`rSquared(data, line)`**: Coefficient of determination
- **`sampleCorrelation(x, y)`**: Pearson correlation

#### Sampling
- **`sample(data, n, replacement)`**: Random sample
- **`shuffle(data)`**: Fisher-Yates shuffle
- **`shuffleInPlace(data)`**: In-place shuffle

---

## Usage Patterns

### Basic Statistics
```javascript
import { mean, median, standardDeviation, quantile } from 'simple-statistics';

const prices = [100, 102, 101, 105, 103, 107];

const avg = mean(prices);                    // 103
const mid = median(prices);                  // 102.5
const std = standardDeviation(prices);       // ~2.45
const p95 = quantile(prices, 0.95);         // 106.5
```

### Rolling Statistics
```javascript
import { mean, sampleStandardDeviation } from 'simple-statistics';

function rollingStats(data, window) {
  const results = [];
  for (let i = window - 1; i < data.length; i++) {
    const slice = data.slice(i - window + 1, i + 1);
    results.push({
      mean: mean(slice),
      std: sampleStandardDeviation(slice)
    });
  }
  return results;
}

const rolling20 = rollingStats(prices, 20);
```

### Linear Regression
```javascript
import {
  linearRegression,
  linearRegressionLine,
  rSquared
} from 'simple-statistics';

const data = [[0, 1], [1, 2], [2, 3], [3, 4]]; // [x, y] pairs

const mb = linearRegression(data);    // {m: 1, b: 1}
const line = linearRegressionLine(mb);
const r2 = rSquared(data, line);      // 1.0 (perfect fit)

// Predict
const prediction = line(5);            // 6
```

### Correlation Analysis
```javascript
import { sampleCorrelation } from 'simple-statistics';

const returns1 = [0.01, -0.02, 0.03, 0.01];
const returns2 = [0.02, -0.01, 0.04, 0.00];

const corr = sampleCorrelation(returns1, returns2);  // ~0.87
```

---

## Constraints & Notes
- **No Time Series Functions**: No autocorrelation, ARIMA, etc.
- **Limited Distributions**: Only basic distributions (normal, Poisson, binomial)
- **No Matrix Operations**: For advanced linear algebra, use math.js
- **Immutable Data**: Functions don't modify input arrays (except `shuffleInPlace`)
- **NaN Handling**: Most functions don't handle NaN gracefully - filter first
- **Performance**: Optimized for correctness over speed; vectorize with TypedArrays for large datasets

---

## Examples (Optional)

### Bollinger Bands Calculation
```javascript
import { mean, sampleStandardDeviation } from 'simple-statistics';

function bollingerBands(prices, period, stdDev = 2) {
  const results = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const sma = mean(slice);
    const std = sampleStandardDeviation(slice);
    
    results.push({
      upper: sma + (stdDev * std),
      middle: sma,
      lower: sma - (stdDev * std)
    });
  }
  
  return results;
}
```

### Z-Score Normalization
```javascript
import { mean, standardDeviation } from 'simple-statistics';

function zScore(data) {
  const μ = mean(data);
  const σ = standardDeviation(data);
  return data.map(x => (x - μ) / σ);
}

const normalized = zScore([1, 2, 3, 4, 5]);
```

### Percentile Bands
```javascript
import { quantile } from 'simple-statistics';

function percentileBands(prices, window) {
  const results = [];
  
  for (let i = window - 1; i < prices.length; i++) {
    const slice = prices.slice(i - window + 1, i + 1);
    results.push({
      p25: quantile(slice, 0.25),
      p50: quantile(slice, 0.50),
      p75: quantile(slice, 0.75)
    });
  }
  
  return results;
}
```

---

## Related Files
- `tulip-indicators.md` - For technical indicators
- `danfojs.md` - For DataFrame-based statistics
- `technicalanalysisjs.md` - For trading indicators

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (75 sources)
