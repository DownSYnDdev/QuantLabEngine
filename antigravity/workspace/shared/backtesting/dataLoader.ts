/**
 * Historical Data Loader
 * Handles loading and aligning historical bar/tick data for backtesting
 */

import { OHLCVBar } from '../dsl/interpreter';
import { TickData } from './types';

/**
 * Data feed interface for backtesting
 */
export interface DataFeed {
    symbols: string[];
    startTime: string;
    endTime: string;
    bars: Map<string, OHLCVBar[]>;
    ticks?: Map<string, TickData[]>;
}

/**
 * Synchronized data point for multi-symbol simulation
 */
export interface SyncedDataPoint {
    timestamp: string;
    bars: Map<string, OHLCVBar | null>;
    ticks?: Map<string, TickData | null>;
}

/**
 * Load and synchronize bar data for multiple symbols
 */
export function loadBarData(
    symbolData: Record<string, OHLCVBar[]>,
    startDate?: string,
    endDate?: string
): DataFeed {
    const symbols = Object.keys(symbolData);
    const bars = new Map<string, OHLCVBar[]>();

    let minTime = '';
    let maxTime = '';

    for (const [symbol, data] of Object.entries(symbolData)) {
        // Filter by date range if provided
        let filtered = data;
        if (startDate) {
            filtered = filtered.filter(b => b.timestamp >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(b => b.timestamp <= endDate);
        }

        // Sort by timestamp
        filtered.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        bars.set(symbol, filtered);

        // Track time range
        if (filtered.length > 0) {
            const first = filtered[0].timestamp;
            const last = filtered[filtered.length - 1].timestamp;
            if (!minTime || first < minTime) minTime = first;
            if (!maxTime || last > maxTime) maxTime = last;
        }
    }

    return {
        symbols,
        startTime: minTime,
        endTime: maxTime,
        bars,
    };
}

/**
 * Create synchronized timeline from multiple symbol data
 */
export function createSyncedTimeline(dataFeed: DataFeed): string[] {
    const timestampSet = new Set<string>();

    for (const bars of dataFeed.bars.values()) {
        for (const bar of bars) {
            timestampSet.add(bar.timestamp);
        }
    }

    return Array.from(timestampSet).sort();
}

/**
 * Get synchronized data point for a specific timestamp
 */
export function getSyncedDataPoint(
    dataFeed: DataFeed,
    timestamp: string,
    indices: Map<string, number>
): SyncedDataPoint {
    const bars = new Map<string, OHLCVBar | null>();

    for (const symbol of dataFeed.symbols) {
        const symbolBars = dataFeed.bars.get(symbol) || [];
        let idx = indices.get(symbol) || 0;

        // Advance index to current timestamp
        while (idx < symbolBars.length && symbolBars[idx].timestamp < timestamp) {
            idx++;
        }
        indices.set(symbol, idx);

        // Check if we have data at this timestamp
        if (idx < symbolBars.length && symbolBars[idx].timestamp === timestamp) {
            bars.set(symbol, symbolBars[idx]);
        } else {
            bars.set(symbol, null);
        }
    }

    return { timestamp, bars };
}

/**
 * Forward-fill missing bars with last known values
 */
export function forwardFillBars(
    timeline: string[],
    dataFeed: DataFeed
): Map<string, Map<string, OHLCVBar>> {
    const result = new Map<string, Map<string, OHLCVBar>>();

    for (const symbol of dataFeed.symbols) {
        const symbolBars = dataFeed.bars.get(symbol) || [];
        const symbolMap = new Map<string, OHLCVBar>();
        let lastBar: OHLCVBar | null = null;
        let barIndex = 0;

        for (const timestamp of timeline) {
            // Find bar at this timestamp
            while (barIndex < symbolBars.length && symbolBars[barIndex].timestamp < timestamp) {
                lastBar = symbolBars[barIndex];
                barIndex++;
            }

            if (barIndex < symbolBars.length && symbolBars[barIndex].timestamp === timestamp) {
                lastBar = symbolBars[barIndex];
                symbolMap.set(timestamp, symbolBars[barIndex]);
            } else if (lastBar) {
                // Forward fill with last known bar
                symbolMap.set(timestamp, {
                    ...lastBar,
                    timestamp,
                    volume: 0, // No volume for forward-filled bars
                });
            }
        }

        result.set(symbol, symbolMap);
    }

    return result;
}

/**
 * Slice bars up to a specific index (for lookback windows)
 */
export function sliceBarsUpTo(
    bars: OHLCVBar[],
    currentIndex: number,
    lookback?: number
): OHLCVBar[] {
    const endIdx = currentIndex + 1;
    const startIdx = lookback ? Math.max(0, endIdx - lookback) : 0;
    return bars.slice(startIdx, endIdx);
}

/**
 * Get current price from bar or tick
 */
export function getCurrentPrice(bar: OHLCVBar | null, tick?: TickData | null): number {
    if (tick) return tick.last;
    return bar?.close || 0;
}

/**
 * Generate mock bar data for testing
 */
export function generateMockBars(
    symbol: string,
    count: number,
    startPrice: number = 100,
    volatility: number = 0.02
): OHLCVBar[] {
    const bars: OHLCVBar[] = [];
    let price = startPrice;
    const baseTime = new Date('2024-01-01T00:00:00Z');

    for (let i = 0; i < count; i++) {
        // Random walk
        const change = (Math.random() - 0.5) * 2 * volatility * price;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

        bars.push({
            symbol,
            timestamp: new Date(baseTime.getTime() + i * 86400000).toISOString(),
            open,
            high,
            low,
            close,
            volume: Math.floor(1000 + Math.random() * 9000),
        });

        price = close;
    }

    return bars;
}
