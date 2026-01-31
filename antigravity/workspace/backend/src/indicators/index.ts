/**
 * Indicator Engine - Main Entry Point
 * 
 * Exports all indicator functions and types
 */

export * from './types';
export { calculateSMA } from './sma';
export { calculateEMA, calculateEMAValues } from './ema';
export { calculateRSI } from './rsi';
export { calculateMACD } from './macd';
export { calculateBollinger } from './bollinger';

import { OHLCVBar } from '../models/ohlcv';
import {
    IndicatorConfig,
    IndicatorOutput,
    SMAConfig,
    EMAConfig,
    RSIConfig,
    MACDConfig,
    BollingerConfig,
} from './types';
import { calculateSMA } from './sma';
import { calculateEMA } from './ema';
import { calculateRSI } from './rsi';
import { calculateMACD } from './macd';
import { calculateBollinger } from './bollinger';

/**
 * Compute an indicator based on configuration
 * 
 * @param bars - OHLCV data bars
 * @param config - Indicator configuration
 * @returns Indicator output
 */
export function computeIndicator(
    bars: OHLCVBar[],
    config: IndicatorConfig
): IndicatorOutput {
    switch (config.type) {
        case 'sma':
            return calculateSMA(bars, config as Omit<SMAConfig, 'type'>);
        case 'ema':
            return calculateEMA(bars, config as Omit<EMAConfig, 'type'>);
        case 'rsi':
            return calculateRSI(bars, config as Omit<RSIConfig, 'type'>);
        case 'macd':
            return calculateMACD(bars, config as Omit<MACDConfig, 'type'>);
        case 'bollinger':
            return calculateBollinger(bars, config as Omit<BollingerConfig, 'type'>);
        default:
            throw new Error(`Unknown indicator type: ${(config as IndicatorConfig).type}`);
    }
}

/**
 * Compute multiple indicators at once
 * 
 * @param bars - OHLCV data bars
 * @param configs - Array of indicator configurations
 * @returns Array of indicator outputs
 */
export function computeIndicators(
    bars: OHLCVBar[],
    configs: IndicatorConfig[]
): IndicatorOutput[] {
    return configs.map(config => computeIndicator(bars, config));
}

/**
 * List of available indicators with metadata
 */
export const AVAILABLE_INDICATORS = [
    {
        type: 'sma',
        name: 'Simple Moving Average',
        description: 'Average price over N periods',
        defaultConfig: { period: 20, source: 'close' },
        outputType: 'line',
    },
    {
        type: 'ema',
        name: 'Exponential Moving Average',
        description: 'Weighted average giving more importance to recent prices',
        defaultConfig: { period: 20, source: 'close' },
        outputType: 'line',
    },
    {
        type: 'rsi',
        name: 'Relative Strength Index',
        description: 'Momentum oscillator measuring speed and magnitude of price changes',
        defaultConfig: { period: 14, source: 'close' },
        outputType: 'line',
    },
    {
        type: 'macd',
        name: 'MACD',
        description: 'Trend-following momentum indicator showing relationship between two EMAs',
        defaultConfig: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, source: 'close' },
        outputType: 'multi-line',
    },
    {
        type: 'bollinger',
        name: 'Bollinger Bands',
        description: 'Volatility bands placed above and below a moving average',
        defaultConfig: { period: 20, stdDev: 2, source: 'close' },
        outputType: 'band',
    },
] as const;
