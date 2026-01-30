---
name: finance
description: Financial Mathematics & Quantitative Analysis for Quantlab.
---

# Skill: Financial Mathematics

## Overview
Implements core financial mathematics, technical indicators, and quantitative analysis models for the Quantlab engine.

## 🎯 Capabilities

### 1. Technical Indicators
- **Trend**: SMA, EMA, WMA, MACD, Bollinger Bands, Parabolic SAR.
- **Momentum**: RSI, Stochastic, CCI, ROC.
- **Volume**: OBV, VWAP, Chaikin Oscillator.
- **Volatility**: ATR, Standard Deviation, Keltner Channels.

### 2. Quantitative Models
- **Risk Metrics**: Sharpe Ratio, Sortino Ratio, Max Drawdown, Beta, Alpha.
- **Pricing Models**: Black-Scholes (Options), Binomial Trees.
- **Optimization**: Mean-Variance Optimization (MVO), Kelly Criterion.

### 3. Time Series Analysis
- **Resampling**: Converting tick -> 1s -> 1m -> 1h bars.
- **Alignment**: Handling missing data points and market holidays.
- **Stationarity**: Augmented Dickey-Fuller tests.

## 🛠 Implementation Guidelines

### Efficient Calculation
- Use **incremental algorithms** where possible (e.g., online variance) to avoid re-scanning the entire window history.
- Use `numpy` or `pandas` (if Python) for vectorized operations on historical blocks.
- Use circular buffers for real-time streaming data.

### Example: Online Welford's Algorithm (Variance)
```python
def update(existingAggregate, newValue):
    (count, mean, M2) = existingAggregate
    count += 1
    delta = newValue - mean
    mean += delta / count
    delta2 = newValue - mean
    M2 += delta * delta2
    return (count, mean, M2)
```

## 📚 References
- [TAlib Documentation](https://ta-lib.org/)
- [Pandas Financial Analysis](https://pandas.pydata.org/)
