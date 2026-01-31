import { OHLCVBar } from '../models/ohlcv';
import { BollingerConfig, BandOutput, PriceSource } from './types';

/**
 * Get price value from OHLCV bar based on source
 */
function getPrice(bar: OHLCVBar, source: PriceSource = 'close'): number {
    return bar[source];
}

/**
 * Calculate standard deviation
 */
function stdDev(values: number[], mean: number): number {
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate Bollinger Bands
 * 
 * Middle Band = SMA over N periods
 * Upper Band = Middle Band + (K × σ)
 * Lower Band = Middle Band - (K × σ)
 * 
 * where K = standard deviation multiplier, σ = standard deviation
 * 
 * Default: Period=20, StdDev=2
 * 
 * @param bars - OHLCV data bars
 * @param config - Bollinger Bands configuration
 * @returns BandOutput with upper, middle, and lower bands
 */
export function calculateBollinger(
    bars: OHLCVBar[],
    config: Omit<BollingerConfig, 'type'>
): BandOutput {
    const { period = 20, stdDev: stdDevMultiplier = 2, source = 'close' } = config;

    const name = `BB(${period},${stdDevMultiplier})`;

    if (bars.length < period) {
        return {
            type: 'band',
            name,
            upper: { color: '#94A3B8', data: [] },
            middle: { color: '#3B82F6', data: [] },
            lower: { color: '#94A3B8', data: [] },
        };
    }

    const upperData: { timestamp: string; value: number }[] = [];
    const middleData: { timestamp: string; value: number }[] = [];
    const lowerData: { timestamp: string; value: number }[] = [];

    // Calculate for each bar starting from period
    for (let i = period - 1; i < bars.length; i++) {
        // Get window of prices
        const window: number[] = [];
        for (let j = i - period + 1; j <= i; j++) {
            window.push(getPrice(bars[j], source));
        }

        // Calculate SMA (middle band)
        const sma = window.reduce((a, b) => a + b, 0) / period;

        // Calculate standard deviation
        const sd = stdDev(window, sma);

        // Calculate bands
        const upper = sma + stdDevMultiplier * sd;
        const lower = sma - stdDevMultiplier * sd;

        const timestamp = bars[i].timestamp;

        upperData.push({ timestamp, value: upper });
        middleData.push({ timestamp, value: sma });
        lowerData.push({ timestamp, value: lower });
    }

    return {
        type: 'band',
        name,
        upper: { color: '#94A3B8', data: upperData },
        middle: { color: '#3B82F6', data: middleData },
        lower: { color: '#94A3B8', data: lowerData },
    };
}
