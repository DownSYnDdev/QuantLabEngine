/**
 * OHLCV (Open, High, Low, Close, Volume) data bar
 * Used for candlestick chart rendering
 */
export interface OHLCVBar {
    symbol: string;
    timestamp: string; // ISO 8601 format
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/**
 * OHLCV response from API
 */
export interface OHLCVResponse {
    symbol: string;
    timeframe: string;
    bars: OHLCVBar[];
    count: number;
}

/**
 * Chart timeframe options
 */
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

/**
 * Query parameters for fetching OHLCV data
 */
export interface OHLCVQuery {
    timeframe?: Timeframe;
    limit?: number;
    from?: string;
    to?: string;
}
