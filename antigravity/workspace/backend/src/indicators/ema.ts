import { OHLCVBar } from '../models/ohlcv';
import { EMAConfig, SingleLineOutput, PriceSource } from './types';

/**
 * Get price value from OHLCV bar based on source
 */
function getPrice(bar: OHLCVBar, source: PriceSource = 'close'): number {
    return bar[source];
}

/**
 * Calculate Exponential Moving Average
 * 
 * EMA = Price(t) × k + EMA(y) × (1 − k)
 * where k = 2 / (N + 1), N = period
 * 
 * First EMA value is seeded with SMA
 * 
 * @param bars - OHLCV data bars
 * @param config - EMA configuration
 * @returns SingleLineOutput with EMA values
 */
export function calculateEMA(
    bars: OHLCVBar[],
    config: Omit<EMAConfig, 'type'>
): SingleLineOutput {
    const { period, source = 'close' } = config;
    const data: { timestamp: string; value: number }[] = [];

    if (bars.length < period) {
        return {
            type: 'line',
            name: `EMA(${period})`,
            color: '#F59E0B', // Amber
            data: [],
        };
    }

    // Smoothing factor
    const k = 2 / (period + 1);

    // Seed EMA with SMA of first 'period' bars
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += getPrice(bars[i], source);
    }
    let ema = sum / period;

    data.push({
        timestamp: bars[period - 1].timestamp,
        value: ema,
    });

    // Calculate EMA for remaining bars
    for (let i = period; i < bars.length; i++) {
        const price = getPrice(bars[i], source);
        ema = price * k + ema * (1 - k);
        data.push({
            timestamp: bars[i].timestamp,
            value: ema,
        });
    }

    return {
        type: 'line',
        name: `EMA(${period})`,
        color: '#F59E0B',
        data,
    };
}

/**
 * Internal EMA calculation returning raw values (for MACD)
 */
export function calculateEMAValues(
    prices: number[],
    period: number
): number[] {
    if (prices.length < period) return [];

    const k = 2 / (period + 1);
    const result: number[] = [];

    // Seed with SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += prices[i];
    }
    let ema = sum / period;

    // Fill initial values with NaN (insufficient data)
    for (let i = 0; i < period - 1; i++) {
        result.push(NaN);
    }
    result.push(ema);

    // Calculate remaining
    for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
        result.push(ema);
    }

    return result;
}
