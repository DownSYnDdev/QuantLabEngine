import { OHLCVBar } from '../models/ohlcv';
import { SMAConfig, SingleLineOutput, PriceSource } from './types';

/**
 * Get price value from OHLCV bar based on source
 */
function getPrice(bar: OHLCVBar, source: PriceSource = 'close'): number {
    return bar[source];
}

/**
 * Calculate Simple Moving Average
 * 
 * SMA = Sum of prices over N periods / N
 * 
 * @param bars - OHLCV data bars
 * @param config - SMA configuration
 * @returns SingleLineOutput with SMA values
 */
export function calculateSMA(
    bars: OHLCVBar[],
    config: Omit<SMAConfig, 'type'>
): SingleLineOutput {
    const { period, source = 'close' } = config;
    const data: { timestamp: string; value: number }[] = [];

    // Need at least 'period' bars to calculate first SMA
    if (bars.length < period) {
        return {
            type: 'line',
            name: `SMA(${period})`,
            color: '#3B82F6', // Blue
            data: [],
        };
    }

    // Calculate SMA using sliding window
    let sum = 0;

    // Initialize first window
    for (let i = 0; i < period; i++) {
        sum += getPrice(bars[i], source);
    }

    // First SMA value
    data.push({
        timestamp: bars[period - 1].timestamp,
        value: sum / period,
    });

    // Slide window for remaining bars
    for (let i = period; i < bars.length; i++) {
        sum = sum - getPrice(bars[i - period], source) + getPrice(bars[i], source);
        data.push({
            timestamp: bars[i].timestamp,
            value: sum / period,
        });
    }

    return {
        type: 'line',
        name: `SMA(${period})`,
        color: '#3B82F6',
        data,
    };
}
