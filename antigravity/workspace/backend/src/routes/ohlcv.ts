import { Router, Request, Response } from 'express';
import { OHLCVQuerySchema, OHLCVResponse } from '../models/ohlcv';
import { generateMockOHLCV, getSymbolBasePrice, getSymbolVolatility } from '../utils/mockData';

export const ohlcvRouter = Router();

/**
 * GET /api/v1/ohlcv/:symbol
 * Fetch OHLCV candlestick data for a symbol
 */
ohlcvRouter.get('/:symbol', (req: Request, res: Response) => {
    try {
        const symbolParam = req.params.symbol;
        const symbol = (typeof symbolParam === 'string' ? symbolParam : symbolParam[0]).toUpperCase();

        // Validate query parameters
        const queryResult = OHLCVQuerySchema.safeParse(req.query);
        if (!queryResult.success) {
            res.status(400).json({
                error: 'Invalid query parameters',
                details: queryResult.error.errors,
            });
            return;
        }

        const { timeframe, limit } = queryResult.data;

        // Generate mock data
        const basePrice = getSymbolBasePrice(symbol);
        const volatility = getSymbolVolatility(symbol);
        const bars = generateMockOHLCV(symbol, limit, basePrice, volatility);

        const response: OHLCVResponse = {
            symbol,
            timeframe,
            bars,
            count: bars.length,
        };

        res.json(response);
    } catch (error) {
        console.error('OHLCV endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/v1/ohlcv/:symbol/latest
 * Get just the latest bar for a symbol
 */
ohlcvRouter.get('/:symbol/latest', (req: Request, res: Response) => {
    try {
        const symbolParam = req.params.symbol;
        const symbol = (typeof symbolParam === 'string' ? symbolParam : symbolParam[0]).toUpperCase();
        const basePrice = getSymbolBasePrice(symbol);
        const volatility = getSymbolVolatility(symbol);
        const bars = generateMockOHLCV(symbol, 1, basePrice, volatility);

        res.json({
            symbol,
            bar: bars[0],
        });
    } catch (error) {
        console.error('Latest bar endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
