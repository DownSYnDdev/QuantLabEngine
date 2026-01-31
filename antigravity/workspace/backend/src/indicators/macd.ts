import { OHLCVBar } from '../models/ohlcv';
import { MACDConfig, MultiLineOutput, PriceSource } from './types';
import { calculateEMAValues } from './ema';

/**
 * Get price value from OHLCV bar based on source
 */
function getPrice(bar: OHLCVBar, source: PriceSource = 'close'): number {
    return bar[source];
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * 
 * MACD Line = Fast EMA - Slow EMA
 * Signal Line = EMA of MACD Line
 * Histogram = MACD Line - Signal Line
 * 
 * Default: Fast=12, Slow=26, Signal=9
 * 
 * @param bars - OHLCV data bars
 * @param config - MACD configuration
 * @returns MultiLineOutput with MACD, Signal, and Histogram
 */
export function calculateMACD(
    bars: OHLCVBar[],
    config: Omit<MACDConfig, 'type'>
): MultiLineOutput {
    const {
        fastPeriod = 12,
        slowPeriod = 26,
        signalPeriod = 9,
        source = 'close',
    } = config;

    const name = `MACD(${fastPeriod},${slowPeriod},${signalPeriod})`;

    if (bars.length < slowPeriod + signalPeriod) {
        return {
            type: 'multi-line',
            name,
            lines: [
                { key: 'macd', color: '#3B82F6', data: [] },
                { key: 'signal', color: '#F59E0B', data: [] },
                { key: 'histogram', color: '#6B7280', data: [] },
            ],
        };
    }

    // Extract prices
    const prices = bars.map(bar => getPrice(bar, source));

    // Calculate Fast and Slow EMAs
    const fastEMA = calculateEMAValues(prices, fastPeriod);
    const slowEMA = calculateEMAValues(prices, slowPeriod);

    // MACD Line = Fast EMA - Slow EMA
    const macdLine: number[] = [];
    for (let i = 0; i < prices.length; i++) {
        if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
            macdLine.push(NaN);
        } else {
            macdLine.push(fastEMA[i] - slowEMA[i]);
        }
    }

    // Filter out NaN values for signal line calculation
    const validMacdStart = macdLine.findIndex(v => !isNaN(v));
    const validMacd = macdLine.slice(validMacdStart).filter(v => !isNaN(v));

    // Signal Line = EMA of MACD Line
    const signalValues = calculateEMAValues(validMacd, signalPeriod);

    // Build output data
    const macdData: { timestamp: string; value: number }[] = [];
    const signalData: { timestamp: string; value: number }[] = [];
    const histogramData: { timestamp: string; value: number }[] = [];

    let signalIdx = 0;
    for (let i = validMacdStart; i < bars.length; i++) {
        const macdValue = macdLine[i];
        if (!isNaN(macdValue)) {
            macdData.push({
                timestamp: bars[i].timestamp,
                value: macdValue,
            });

            const signalValue = signalValues[signalIdx];
            if (!isNaN(signalValue)) {
                signalData.push({
                    timestamp: bars[i].timestamp,
                    value: signalValue,
                });
                histogramData.push({
                    timestamp: bars[i].timestamp,
                    value: macdValue - signalValue,
                });
            }
            signalIdx++;
        }
    }

    return {
        type: 'multi-line',
        name,
        lines: [
            { key: 'macd', color: '#3B82F6', data: macdData },
            { key: 'signal', color: '#F59E0B', data: signalData },
            { key: 'histogram', color: '#6B7280', data: histogramData },
        ],
    };
}
