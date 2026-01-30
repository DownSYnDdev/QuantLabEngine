# TimescaleDB: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 62 curated sources including TimescaleDB documentation, time-series optimization guides, and PostgreSQL extensions. Full report available at: https://notebooklm.google.com/notebook/d8a92f31-7b45-4c8e-9d12-4f5e9a6c8d73

---

## Key Concepts
- **PostgreSQL Extension**: Full SQL compatibility with time-series optimizations
- **Hypertables**: Automatically partitioned tables by time
- **Continuous Aggregates**: Materialized views that auto-update
- **Data Retention**: Automated data lifecycle policies
- **Compression**: 10-20x compression for historical data
- **Time-Series Functions**: Specialized functions for OHLCV and metrics
- **High Ingest Rate**: Optimized for millions of inserts/second

---

## API Reference (If Applicable)

### Setup
```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertable
CREATE TABLE market_data (
  time TIMESTAMPTZ NOT NULL,
  symbol TEXT NOT NULL,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  volume BIGINT
);

SELECT create_hypertable('market_data', 'time');
CREATE INDEX ON market_data (symbol, time DESC);
```

### Continuous Aggregates
```sql
-- 1-minute OHLCV aggregate
CREATE MATERIALIZED VIEW market_data_1m
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 minute', time) AS time,
  symbol,
  FIRST(open, time) AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, time) AS close,
  SUM(volume) AS volume
FROM market_data
GROUP BY time_bucket('1 minute', time), symbol;

-- Auto-refresh policy
SELECT add_continuous_aggregate_policy('market_data_1m',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute'
);
```

### Data Retention
```sql
-- Drop data older than 1 year
SELECT add_retention_policy('market_data', INTERVAL '1 year');

-- Compress data older than 7 days
ALTER TABLE market_data SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'symbol'
);

SELECT add_compression_policy('market_data', INTERVAL '7 days');
```

---

## Usage Patterns

### Inserting Tick Data
```javascript
import { Pool } from 'pg';

const pool = new Pool({ /* connection config */ });

async function insertTick(symbol, price, volume) {
  await pool.query(
    `INSERT INTO market_data (time, symbol, close, volume)
     VALUES (NOW(), $1, $2, $3)`,
    [symbol, price, volume]
  );
}

// Batch insert for performance
async function insertBatch(ticks) {
  const values = ticks.map((t, i) => 
    `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`
  ).join(',');
  
  const params = ticks.flatMap(t => [t.time, t.symbol, t.price, t.volume]);
  
  await pool.query(
    `INSERT INTO market_data (time, symbol, close, volume) VALUES ${values}`,
    params
  );
}
```

### Querying Time-Series Data
```sql
-- Get latest price for each symbol
SELECT DISTINCT ON (symbol)
  symbol,
  time,
  close AS price
FROM market_data
ORDER BY symbol, time DESC;

-- Get OHLCV for date range
SELECT
  time_bucket('1 day', time) AS day,
  FIRST(open, time) AS open,
  MAX(high) AS high,
  MIN(low) AS low,
  LAST(close, time) AS close,
  SUM(volume) AS volume
FROM market_data
WHERE symbol = 'AAPL'
  AND time >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

### Technical Indicators with SQL
```sql
-- Simple Moving Average
SELECT
  time,
  close,
  AVG(close) OVER (
    ORDER BY time
    ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
  ) AS sma_20
FROM market_data
WHERE symbol = 'AAPL'
ORDER BY time DESC
LIMIT 100;

-- Bollinger Bands
WITH stats AS (
  SELECT
    time,
    close,
    AVG(close) OVER w AS sma,
    STDDEV(close) OVER w AS std
  FROM market_data
  WHERE symbol = 'AAPL'
  WINDOW w AS (ORDER BY time ROWS BETWEEN 19 PRECEDING AND CURRENT ROW)
)
SELECT
  time,
  close,
  sma,
  sma + (2 * std) AS upper_band,
  sma - (2 * std) AS lower_band
FROM stats
ORDER BY time DESC;
```

---

## Constraints & Notes
- **PostgreSQL Required**: Must run PostgreSQL 12+
- **RAM Usage**: Aggressive caching can use significant memory
- **Compression Latency**: Compressed chunks are read-only
- **Query Planning**: Complex queries may need tuning
- **Replication**: Different setup than vanilla PostgreSQL
- **Backup Strategy**: Use TimescaleDB-specific backup tools for best results

---

## Examples (Optional)

### Real-Time Market Data Pipeline
```javascript
import { Pool } from 'pg';
import WebSocket from 'ws';

const pool = new Pool({
  host: 'localhost',
  database: 'quantlab',
  user: 'trader',
  password: 'password'
});

const ws = new WebSocket('wss://market-feed.example.com');

ws.on('message', async (data) => {
  const tick = JSON.parse(data);
  
  await pool.query(
    `INSERT INTO market_data (time, symbol, close, volume)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (time, symbol) DO UPDATE
     SET close = EXCLUDED.close, volume = EXCLUDED.volume`,
    [tick.time, tick.symbol, tick.price, tick.volume]
  );
});
```

### Backtesting Query
```javascript
async function getHistoricalData(symbol, startDate, endDate, interval) {
  const result = await pool.query(`
    SELECT
      time_bucket($1, time) AS bucket,
      FIRST(open, time) AS open,
      MAX(high) AS high,
      MIN(low) AS low,
      LAST(close, time) AS close,
      SUM(volume) AS volume
    FROM market_data
    WHERE symbol = $2
      AND time >= $3
      AND time <= $4
    GROUP BY bucket
    ORDER BY bucket
  `, [interval, symbol, startDate, endDate]);
  
  return result.rows;
}

// Usage
const data = await getHistoricalData('AAPL', '1 hour', '2024-01-01', '2024-12-31');
```

---

## Related Files
- `apache-arrow.md` - For efficient data transfer from DB
- `danfojs.md` - For processing query results
- `simple-statistics.md` - For additional calculations

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (62 sources)
