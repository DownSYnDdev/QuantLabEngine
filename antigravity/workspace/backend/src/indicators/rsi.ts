import { OHLCVBar } from '../models/ohlcv';
import { RSIConfig, SingleLineOutput, PriceSource } from './types';

/**
 * Get price value from OHLCV bar based on source
 */
function getPrice(bar: OHLCVBar, source: PriceSource = 'close'): number {
    return bar[source];
}

/**
 * Calculate Relative Strength Index
 * 
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss over N periods
 * 
 * Uses Wilder's smoothing method (exponential)
 * 
 * @param bars - OHLCV data bars
 * @param config - RSI configuration
 * @returns SingleLineOutput with RSI values (0-100)
 */
export function calculateRSI(
    bars: OHLCVBar[],
    config: Omit<RSIConfig, 'type'>
): SingleLineOutput {
    const { period = 14, source = 'close' } = config;
    const data: { timestamp: string; value: number }[] = [];

    if (bars.length < period + 1) {
        return {
            type: 'line',
            name: `RSI(${period})`,
            color: '#8B5CF6', // Purple
            data: [],
        };
    }

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < bars.length; i++) {
        changes.push(getPrice(bars[i], source) - getPrice(bars[i - 1], source));
    }

    // Separate gains and losses
    const gains = changes.map(c => (c > 0 ? c : 0));
    const losses = changes.map(c => (c < 0 ? Math.abs(c) : 0));

    // Calculate first average gain/loss (SMA over period)
    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 0; i < period; i++) {
        avgGain += gains[i];
        avgLoss += losses[i];
    }
    avgGain /= period;
    avgLoss /= period;

    // First RSI
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = 100 - (100 / (1 + rs));

    data.push({
        timestamp: bars[period].timestamp,
        value: rsi,
    });

    // Calculate remaining RSI using Wilder's smoothing
    for (let i = period; i < changes.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi = 100 - (100 / (1 + rs));

        data.push({
            timestamp: bars[i + 1].timestamp,
            value: rsi,
        });
    }

    return {
        type: 'line',
        name: `RSI(${period})`,
        color: '#8B5CF6',
        data,
    };
}
