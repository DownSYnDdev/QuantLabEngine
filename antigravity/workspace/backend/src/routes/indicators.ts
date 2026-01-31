import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
    computeIndicator,
    computeIndicators,
    AVAILABLE_INDICATORS,
    IndicatorConfigSchema,
} from '../indicators';
import { generateMockOHLCV, getSymbolBasePrice, getSymbolVolatility } from '../utils/mockData';

export const indicatorRouter = Router();

/**
 * Request schema for computing indicators
 */
const ComputeRequestSchema = z.object({
    symbol: z.string().min(1).max(20),
    indicators: z.array(IndicatorConfigSchema).min(1).max(10),
    limit: z.number().int().min(10).max(2000).optional().default(500),
});

/**
 * GET /api/v1/indicators/list
 * Get list of available indicators with default configurations
 */
indicatorRouter.get('/list', (_req: Request, res: Response) => {
    res.json({
        success: true,
        indicators: AVAILABLE_INDICATORS,
    });
});

/**
 * POST /api/v1/indicators/compute
 * Compute one or more indicators for a symbol
 */
indicatorRouter.post('/compute', (req: Request, res: Response) => {
    try {
        const parseResult = ComputeRequestSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                error: 'Invalid request',
                details: parseResult.error.errors,
            });
            return;
        }

        const { symbol, indicators, limit } = parseResult.data;

        // Generate mock OHLCV data
        const basePrice = getSymbolBasePrice(symbol.toUpperCase());
        const volatility = getSymbolVolatility(symbol.toUpperCase());
        const bars = generateMockOHLCV(symbol.toUpperCase(), limit, basePrice, volatility);

        // Compute all requested indicators
        const results = computeIndicators(bars, indicators);

        res.json({
            success: true,
            symbol: symbol.toUpperCase(),
            barCount: bars.length,
            indicators: results,
        });
    } catch (error) {
        console.error('Indicator computation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compute indicators',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/v1/indicators/:symbol/:type
 * Quick endpoint for single indicator with defaults
 */
indicatorRouter.get('/:symbol/:type', (req: Request, res: Response) => {
    try {
        const symbolParam = req.params.symbol;
        const typeParam = req.params.type;

        const symbol = (typeof symbolParam === 'string' ? symbolParam : symbolParam[0]).toUpperCase();
        const type = (typeof typeParam === 'string' ? typeParam : typeParam[0]).toLowerCase();

        // Validate indicator type
        const indicatorInfo = AVAILABLE_INDICATORS.find(i => i.type === type);
        if (!indicatorInfo) {
            res.status(400).json({
                success: false,
                error: `Unknown indicator type: ${type}`,
                available: AVAILABLE_INDICATORS.map(i => i.type),
            });
            return;
        }

        // Get limit from query
        const limit = Math.min(
            Math.max(parseInt(String(req.query.limit)) || 500, 10),
            2000
        );

        // Generate mock data
        const basePrice = getSymbolBasePrice(symbol);
        const volatility = getSymbolVolatility(symbol);
        const bars = generateMockOHLCV(symbol, limit, basePrice, volatility);

        // Create config based on type
        let config;
        switch (type) {
            case 'sma':
                config = {
                    type: 'sma' as const,
                    period: req.query.period ? parseInt(String(req.query.period)) : 20,
                    source: (req.query.source as 'close' | 'open' | 'high' | 'low') || 'close',
                };
                break;
            case 'ema':
                config = {
                    type: 'ema' as const,
                    period: req.query.period ? parseInt(String(req.query.period)) : 20,
                    source: (req.query.source as 'close' | 'open' | 'high' | 'low') || 'close',
                };
                break;
            case 'rsi':
                config = {
                    type: 'rsi' as const,
                    period: req.query.period ? parseInt(String(req.query.period)) : 14,
                    source: (req.query.source as 'close' | 'open' | 'high' | 'low') || 'close',
                };
                break;
            case 'macd':
                config = {
                    type: 'macd' as const,
                    fastPeriod: 12,
                    slowPeriod: 26,
                    signalPeriod: 9,
                    source: (req.query.source as 'close' | 'open' | 'high' | 'low') || 'close',
                };
                break;
            case 'bollinger':
                config = {
                    type: 'bollinger' as const,
                    period: req.query.period ? parseInt(String(req.query.period)) : 20,
                    stdDev: 2,
                    source: (req.query.source as 'close' | 'open' | 'high' | 'low') || 'close',
                };
                break;
            default:
                res.status(400).json({ success: false, error: 'Unknown indicator type' });
                return;
        }

        const result = computeIndicator(bars, config);

        res.json({
            success: true,
            symbol,
            indicator: result,
        });
    } catch (error) {
        console.error('Indicator error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compute indicator',
        });
    }
});
