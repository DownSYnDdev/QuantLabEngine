import { OHLCVBar } from '../models/ohlcv';

/**
 * Generate realistic mock OHLCV data for testing
 * Creates smooth price movements with realistic volatility
 */
export function generateMockOHLCV(
    symbol: string,
    count: number = 500,
    startPrice: number = 100,
    volatility: number = 0.02
): OHLCVBar[] {
    const bars: OHLCVBar[] = [];
    let currentPrice = startPrice;
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
        // Calculate timestamp (1 hour bars going back)
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

        // Random walk with trend bias
        const change = (Math.random() - 0.48) * volatility * currentPrice;
        const open = currentPrice;
        const close = open + change;

        // High/low with some wicks
        const wickUp = Math.random() * volatility * currentPrice * 0.5;
        const wickDown = Math.random() * volatility * currentPrice * 0.5;
        const high = Math.max(open, close) + wickUp;
        const low = Math.min(open, close) - wickDown;

        // Volume with some variation
        const baseVolume = 1000000;
        const volume = Math.floor(baseVolume * (0.5 + Math.random()));

        bars.push({
            symbol,
            timestamp: timestamp.toISOString(),
            open: parseFloat(open.toFixed(4)),
            high: parseFloat(high.toFixed(4)),
            low: parseFloat(low.toFixed(4)),
            close: parseFloat(close.toFixed(4)),
            volume,
        });

        currentPrice = close;
    }

    return bars;
}

/**
 * Get starting price for different symbols
 */
export function getSymbolBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
        'EURUSD': 1.0850,
        'GBPUSD': 1.2650,
        'USDJPY': 149.50,
        'BTCUSD': 42500,
        'ETHUSD': 2250,
        'AAPL': 185.50,
        'GOOGL': 142.30,
        'MSFT': 378.90,
        'SPY': 475.20,
        'QQQ': 405.80,
    };

    return basePrices[symbol.toUpperCase()] || 100;
}

/**
 * Get volatility multiplier for different symbols
 */
export function getSymbolVolatility(symbol: string): number {
    const volatilities: Record<string, number> = {
        'EURUSD': 0.005,
        'GBPUSD': 0.006,
        'USDJPY': 0.007,
        'BTCUSD': 0.035,
        'ETHUSD': 0.045,
        'AAPL': 0.015,
        'GOOGL': 0.018,
        'MSFT': 0.014,
        'SPY': 0.010,
        'QQQ': 0.012,
    };

    return volatilities[symbol.toUpperCase()] || 0.02;
}
