import { z } from 'zod';

/**
 * Indicator types supported by the engine
 */
export type IndicatorType = 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger';

/**
 * Price source for indicator calculations
 */
export type PriceSource = 'open' | 'high' | 'low' | 'close';

/**
 * Base indicator configuration
 */
export interface BaseIndicatorConfig {
    type: IndicatorType;
    source?: PriceSource;
}

/**
 * SMA configuration
 */
export interface SMAConfig extends BaseIndicatorConfig {
    type: 'sma';
    period: number;
}

/**
 * EMA configuration
 */
export interface EMAConfig extends BaseIndicatorConfig {
    type: 'ema';
    period: number;
}

/**
 * RSI configuration
 */
export interface RSIConfig extends BaseIndicatorConfig {
    type: 'rsi';
    period: number;
}

/**
 * MACD configuration
 */
export interface MACDConfig extends BaseIndicatorConfig {
    type: 'macd';
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
}

/**
 * Bollinger Bands configuration
 */
export interface BollingerConfig extends BaseIndicatorConfig {
    type: 'bollinger';
    period: number;
    stdDev: number;
}

/**
 * Union of all indicator configs
 */
export type IndicatorConfig = SMAConfig | EMAConfig | RSIConfig | MACDConfig | BollingerConfig;

/**
 * Single indicator data point
 */
export interface IndicatorPoint {
    timestamp: string;
    value: number;
}

/**
 * Multi-line indicator data (for MACD, Bollinger)
 */
export interface MultiLineIndicatorPoint {
    timestamp: string;
    values: Record<string, number>;
}

/**
 * Indicator output - single line
 */
export interface SingleLineOutput {
    type: 'line';
    name: string;
    color: string;
    data: IndicatorPoint[];
}

/**
 * Indicator output - multiple lines
 */
export interface MultiLineOutput {
    type: 'multi-line';
    name: string;
    lines: {
        key: string;
        color: string;
        data: IndicatorPoint[];
    }[];
}

/**
 * Indicator output - band (upper, middle, lower)
 */
export interface BandOutput {
    type: 'band';
    name: string;
    upper: { color: string; data: IndicatorPoint[] };
    middle: { color: string; data: IndicatorPoint[] };
    lower: { color: string; data: IndicatorPoint[] };
}

/**
 * Union of all indicator outputs
 */
export type IndicatorOutput = SingleLineOutput | MultiLineOutput | BandOutput;

/**
 * Zod schemas for validation
 */
export const IndicatorConfigSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('sma'),
        period: z.number().int().min(1).max(500),
        source: z.enum(['open', 'high', 'low', 'close']).optional().default('close'),
    }),
    z.object({
        type: z.literal('ema'),
        period: z.number().int().min(1).max(500),
        source: z.enum(['open', 'high', 'low', 'close']).optional().default('close'),
    }),
    z.object({
        type: z.literal('rsi'),
        period: z.number().int().min(1).max(100).default(14),
        source: z.enum(['open', 'high', 'low', 'close']).optional().default('close'),
    }),
    z.object({
        type: z.literal('macd'),
        fastPeriod: z.number().int().min(1).max(100).default(12),
        slowPeriod: z.number().int().min(1).max(100).default(26),
        signalPeriod: z.number().int().min(1).max(100).default(9),
        source: z.enum(['open', 'high', 'low', 'close']).optional().default('close'),
    }),
    z.object({
        type: z.literal('bollinger'),
        period: z.number().int().min(1).max(500).default(20),
        stdDev: z.number().min(0.1).max(5).default(2),
        source: z.enum(['open', 'high', 'low', 'close']).optional().default('close'),
    }),
]);
