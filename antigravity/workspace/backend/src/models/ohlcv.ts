import { z } from 'zod';

/**
 * OHLCV (Open, High, Low, Close, Volume) data bar schema
 * Used for candlestick chart rendering
 */
export const OHLCVBarSchema = z.object({
    symbol: z.string().min(1).max(20),
    timestamp: z.string().datetime(), // ISO 8601 format
    open: z.number().positive(),
    high: z.number().positive(),
    low: z.number().positive(),
    close: z.number().positive(),
    volume: z.number().nonnegative(),
});

export type OHLCVBar = z.infer<typeof OHLCVBarSchema>;

/**
 * OHLCV response schema for API endpoints
 */
export const OHLCVResponseSchema = z.object({
    symbol: z.string(),
    timeframe: z.string(),
    bars: z.array(OHLCVBarSchema),
    count: z.number().int().nonnegative(),
});

export type OHLCVResponse = z.infer<typeof OHLCVResponseSchema>;

/**
 * Query parameters for OHLCV endpoint
 */
export const OHLCVQuerySchema = z.object({
    timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w']).default('1h'),
    limit: z.coerce.number().int().min(1).max(1000).default(500),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
});

export type OHLCVQuery = z.infer<typeof OHLCVQuerySchema>;
