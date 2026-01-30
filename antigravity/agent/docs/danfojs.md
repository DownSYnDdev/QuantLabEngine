# Danfo.js: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 51 curated sources including official Danfo documentation, TensorFlow blog posts, and DataFrame tutorials. Full report available at: https://notebooklm.google.com/notebook/7f36e42a-a096-4867-bf12-12ad2bfda781

---

## Key Concepts
- **Pandas-like API**: Familiar DataFrame operations for JavaScript developers
- **TensorFlow.js Integration**: Built on TensorFlow.js for GPU acceleration
- **Browser & Node**: Works in both environments
- **Time-Series Focus**: Excellent for financial data manipulation
- **GroupBy Operations**: Aggregation, transformation, filtering
- **CSV/JSON I/O**: Read and write structured data
- **Plotting**: Built-in integration with Plotly.js for visualizations

---

## API Reference (If Applicable)

### Installation
```bash
npm install danfojs-node  # For Node.js
# or
npm install danfojs       # For browser
```

### Core Classes
- **`DataFrame`**: 2D labeled data structure with columns of potentially different types
- **`Series`**: 1D labeled array
- **`danfo.read_csv(url)`**: Load CSV data
- **`danfo.read_json(url)`**: Load JSON data

### DataFrame Methods

#### Data Access
- **`df.head(n)`**: First n rows
- **`df.tail(n)`**: Last n rows
- **`df.loc(rows, columns)`**: Label-based indexing
- **`df.iloc(rows, columns)`**: Integer-based indexing
- **`df.column(name)`**: Get series by name
- **`df.values`**: Get underlying array

#### Data Manipulation
- **`df.drop(columns, axis)`**: Remove columns/rows
- **`df.fillna(value)`**: Fill missing values
- **`df.dropna(axis)`**: Remove rows/columns with NaN
- **`df.query(condition)`**: Filter rows by condition
- **`df.sort_values(column, ascending)`**: Sort by column

#### Aggregation
- **`df.groupby(columns)`**: Group DataFrame
- **`groupby.agg(function)`**: Apply aggregation
- **`df.sum(axis)`, `df.mean(axis)`, `df.std(axis)`**: Column statistics

#### Time Series
- **`df.set_index(column)`**: Set time index
- **`df.shift(periods)`**: Shift data by periods
- **`df.rolling(window)`**: Rolling window operations

---

## Usage Patterns

### Loading and Exploring Data
```javascript
import * as dfd from 'danfojs-node';

const df = await dfd.read_csv('market_data.csv');

// Basic exploration
df.head().print();
df.describe().print();     // Summary statistics
df.dtypes.print();         // Column types
console.log(df.shape);     // [rows, columns]
```

### DataFrame Operations
```javascript
// Select columns
const prices = df.loc({ columns: ['time', 'open', 'close'] });

// Filter rows
const recent = df.query(df['time'].gt('2024-01-01'));

// Add calculated column
df.addColumn('range', df['high'].sub(df['low']));

// Sort
const sorted = df.sort_values('volume', { ascending: false });
```

### GroupBy and Aggregation
```javascript
// Group by symbol and calculate statistics
const grouped = df.groupby(['symbol']);

const aggregated = grouped.agg({
  close: 'mean',
  volume: 'sum',
  high: 'max',
  low: 'min'
});

aggregated.print();
```

### Time-Series Operations
```javascript
// Set datetime index
df.set_index({ column: 'time' });

// Calculate returns
const returns = df['close'].pct_change();
df.addColumn('returns', returns);

// Rolling statistics
const rolling20 = df['close'].rolling({ window: 20 });
const sma20 = rolling20.mean();
const std20 = rolling20.std();

df.addColumn('SMA_20', sma20);
df.addColumn('STD_20', std20);
```

---

## Constraints & Notes
- **TensorFlow Dependency**: Requires TensorFlow.js (~2MB gzipped)
- **Memory Usage**: Large DataFrames can consume significant memory
- **Not All Pandas Features**: Subset of Pandas functionality
- **Async I/O**: File operations are async (use await)
- **Limited Plotting**: Basic charts only; use external library for advanced viz
- **Type Handling**: Some type conversions may be needed for numeric operations

---

## Examples (Optional)

### OHLCV Processing Pipeline
```javascript
import * as dfd from 'danfojs-node';

async function processMarketData(csvPath) {
  // Load data
  const df = await dfd.read_csv(csvPath);
  
  // Parse timestamps
  df['time'] = df['time'].apply((x) => new Date(x));
  
  // Calculate technical indicators
  const close = df['close'];
  df.addColumn('SMA_20', close.rolling({ window: 20 }).mean());
  df.addColumn('SMA_50', close.rolling({ window: 50 }).mean());
  df.addColumn('returns', close.pct_change());
  
  // Filter valid data
  const valid = df.dropna();
  
  // Group by symbol and get latest
  const latest = valid
    .groupby(['symbol'])
    .apply((group) => group.tail(1));
  
  return latest;
}
```

### Backtesting with DataFrames
```javascript
function generateSignals(df) {
  const signals = df.copy();
  
  // Calculate indicators
  const sma20 = df['close'].rolling({ window: 20 }).mean();
  const sma50 = df['close'].rolling({ window: 50 }).mean();
  
  // Generate signals
  signals.addColumn('signal', new dfd.Series([0]).repeat(df.shape[0]));
  
  // Buy when SMA20 crosses above SMA50
  for (let i = 1; i < df.shape[0]; i++) {
    if (sma20.iat(i) > sma50.iat(i) && sma20.iat(i-1) <= sma50.iat(i-1)) {
      signals.set_value(i, 'signal', 1);
    }
    // Sell when SMA20 crosses below SMA50
    else if (sma20.iat(i) < sma50.iat(i) && sma20.iat(i-1) >= sma50.iat(i-1)) {
      signals.set_value(i, 'signal', -1);
    }
  }
  
  return signals;
}
```

---

## Related Files
- `apache-arrow.md` - For efficient data serialization
- `simple-statistics.md` - For additional statistical functions
- `timescaledb.md` - For database storage

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (51 sources)
