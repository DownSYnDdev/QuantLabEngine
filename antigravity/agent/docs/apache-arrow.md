# Apache Arrow: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 45 curated sources including Apache Arrow documentation, columnar format specifications, and performance benchmarks. Full report available at: https://notebooklm.google.com/notebook/c7e890a2-54fc-49b9-a143-c0e3d8a5f612

---

## Key Concepts
- **Columnar Memory Format**: Zero-copy data sharing between languages and processes
- **Language Agnostic**: Standardized format across C++, Java, Python, JavaScript, Rust, Go
- **IPC (Inter-Process Communication)**: Efficient data transfer without serialization overhead
- **Zero-Copy Reads**: Direct memory access without deserialization
- **Flight Protocol**: gRPC-based framework for high-throughput data transfer
- **Parquet Integration**: Fast reading/writing of Parquet files
- **Streaming**: Support for streaming large datasets

---

## API Reference (If Applicable)

### Installation
```bash
npm install apache-arrow
```

### Core Classes
- **`Table`**: Immutable columnar data structure
- **`RecordBatch`**: Contiguous chunk of columnar data
- **`Vector`**: Single column of typed data
- **`Schema`**: Defines table structure and types
- **`Builder`**: Constructs vectors incrementally

### Table Operations
```javascript
import { Table, tableFromArrays } from 'apache-arrow';

// Create from arrays
const table = tableFromArrays({
  time: [1000, 2000, 3000],
  price: [100.5, 101.2, 99.8],
  volume: [1000, 1500, 2000]
});

// Access data
console.log(table.numRows);           // 3
console.log(table.schema.fields);     // Field definitions
const priceColumn = table.getChild('price');
```

### Reading/Writing Files
```javascript
import { tableFromIPC, tableToIPC } from 'apache-arrow';
import { readFileSync, writeFileSync } from 'fs';

// Write Arrow IPC file
const bytes = tableToIPC(table);
writeFileSync('data.arrow', bytes);

// Read Arrow IPC file
const buffer = readFileSync('data.arrow');
const loadedTable = tableFromIPC(buffer);
```

### Streaming
```javascript
import { RecordBatchReader, RecordBatchStreamWriter } from 'apache-arrow';

// Stream writer
const writer = RecordBatchStreamWriter.writeAll(table);
const stream = writer.toNodeStream();

// Stream reader
const reader = await RecordBatchReader.from(stream);
for await (const batch of reader) {
  console.log(batch.numRows);
}
```

---

## Usage Patterns

### High-Performance OHLCV Storage
```javascript
import { Table, tableFromArrays, Type } from 'apache-arrow';

function createOHLCVTable(data) {
  return tableFromArrays({
    time: data.map(d => d.time),
    open: new Float64Array(data.map(d => d.open)),
    high: new Float64Array(data.map(d => d.high)),
    low: new Float64Array(data.map(d => d.low)),
    close: new Float64Array(data.map(d => d.close)),
    volume: new Uint32Array(data.map(d => d.volume))
  });
}

const table = createOHLCVTable(marketData);

// Zero-copy access
const closePrices = table.getChild('close').toArray();
```

### Time-Series Filtering
```javascript
import { Table, predicate } from 'apache-arrow';

// Filter rows efficiently
const filtered = table.filter(
  predicate.and(
    predicate.col('time').gteq(startTime),
    predicate.col('time').lteq(endTime)
  )
);

// Column selection
const subset = filtered.select(['time', 'close', 'volume']);
```

### Cross-Platform Data Exchange
```javascript
// Server (Python) -> Client (JavaScript)
// Python creates Arrow table, sends over HTTP/WebSocket
// JavaScript receives and uses directly without parsing

async function fetchMarketData(symbol) {
  const response = await fetch(`/api/data/${symbol}`);
  const arrayBuffer = await response.arrayBuffer();
  const table = tableFromIPC(new Uint8Array(arrayBuffer));
  
  // Immediate access, no JSON parsing
  return table;
}
```

---

## Constraints & Notes
- **Size**: ~200KB minimum (add only if handling large datasets)
- **Learning Curve**: More complex than plain JSON
- **Browser Support**: Works well in modern browsers
- **Memory Efficiency**: Most beneficial for >10,000 rows
- **Schema Required**: Must define types upfront
- **Immutability**: Tables are immutable after creation
- **Limited Transformation**: Use with Danfo.js or other libraries for complex operations

---

## Examples (Optional)

### WebSocket Market Data Streaming
```javascript
import { RecordBatchStreamWriter, RecordBatchReader } from 'apache-arrow';

// Server: Stream market data
class MarketDataStream {
  constructor() {
    this.writer = RecordBatchStreamWriter.writeAll(schema);
  }
  
  sendBatch(batch) {
    const bytes = this.writer.toUint8Array();
    ws.send(bytes);
  }
}

// Client: Receive and process
ws.onmessage = async (event) => {
  const buffer = await event.data.arrayBuffer();
  const reader = await RecordBatchReader.from(buffer);
  
  for await (const batch of reader) {
    updateChart(batch);
  }
};
```

### Efficient Backtesting Data
```javascript
import { Table, tableFromArrays } from 'apache-arrow';

class BacktestEngine {
  constructor(historicalData) {
    // Store as Arrow table for fast iteration
    this.data = tableFromArrays({
      time: historicalData.time,
      open: new Float64Array(historicalData.open),
      high: new Float64Array(historicalData.high),
      low: new Float64Array(historicalData.low),
      close: new Float64Array(historicalData.close),
      volume: new Uint32Array(historicalData.volume)
    });
  }
  
  run(strategy) {
    // Direct typed array access - very fast
    const closes = this.data.getChild('close').toArray();
    const volumes = this.data.getChild('volume').toArray();
    
    for (let i = 0; i < this.data.numRows; i++) {
      strategy.onBar(i, closes[i], volumes[i]);
    }
  }
}
```

---

## Related Files
- `danfojs.md` - For DataFrame operations on Arrow tables
- `timescaledb.md` - Database integration
- `tradingview-lightweight-charts.md` - Rendering Arrow data

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (45 sources)
