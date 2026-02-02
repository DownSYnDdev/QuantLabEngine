/**
 * Backtesting Engine
 * Core simulation loop for strategy backtesting
 */

import { interpret, OHLCVBar, InterpreterResult } from '../dsl/interpreter';
import {
    OrderEngine,
    createPortfolio,
    Portfolio,
    OrderSide,
    OrderType,
    MarketData,
} from '../trading';
import {
    BacktestConfig,
    BacktestResult,
    BacktestContext,
    TradeRecord,
    PerformanceMetrics,
    DEFAULT_BACKTEST_CONFIG,
    calculatePerformanceMetrics,
    emptyPerformanceMetrics,
} from './types';
import {
    DataFeed,
    loadBarData,
    createSyncedTimeline,
    sliceBarsUpTo,
    getCurrentPrice,
} from './dataLoader';

/**
 * Backtester class - runs strategy simulations
 */
export class Backtester {
    private config: BacktestConfig;
    private portfolio!: Portfolio;
    private orderEngine!: OrderEngine;
    private trades: TradeRecord[] = [];
    private equityCurve: { timestamp: string; equity: number }[] = [];
    private signals: string[] = [];
    private errors: string[] = [];
    private peakEquity: number = 0;

    constructor(config: Partial<BacktestConfig> = {}) {
        this.config = { ...DEFAULT_BACKTEST_CONFIG, ...config };
    }

    /**
     * Run a backtest with the given strategy and data
     */
    run(
        strategyCode: string,
        symbolData: Record<string, OHLCVBar[]>
    ): BacktestResult {
        // Initialize
        this.portfolio = createPortfolio(this.config.initialCapital);
        this.orderEngine = new OrderEngine(this.portfolio, {
            slippage: { mode: 'percentage', value: this.config.slippagePercent },
        });
        this.trades = [];
        this.equityCurve = [];
        this.signals = [];
        this.errors = [];
        this.peakEquity = this.config.initialCapital;

        try {
            // Load and synchronize data
            const dataFeed = loadBarData(
                symbolData,
                this.config.startDate || undefined,
                this.config.endDate || undefined
            );

            if (dataFeed.symbols.length === 0) {
                throw new Error('No symbol data provided');
            }

            // Create synchronized timeline
            const timeline = createSyncedTimeline(dataFeed);

            if (timeline.length === 0) {
                throw new Error('No data points in timeline');
            }

            // Primary symbol (first symbol in data)
            const primarySymbol = dataFeed.symbols[0];
            const primaryBars = dataFeed.bars.get(primarySymbol) || [];

            // Register order engine events
            this.orderEngine.onEvent((event) => {
                if (event.type === 'order_filled') {
                    this.handleFill(event.order, event.fill);
                }
            });

            // Simulation loop
            for (let i = 0; i < primaryBars.length; i++) {
                const currentBar = primaryBars[i];
                const timestamp = currentBar.timestamp;

                // Get bars up to current index for interpreter
                const barsUpToNow = sliceBarsUpTo(primaryBars, i);

                // Build data feed for multi-symbol access
                const currentDataFeed: Record<string, OHLCVBar[]> = {};
                for (const [symbol, bars] of dataFeed.bars) {
                    const upToNow = bars.filter(b => b.timestamp <= timestamp);
                    currentDataFeed[symbol] = upToNow;
                }

                // Execute strategy
                const result = interpret(strategyCode, barsUpToNow, currentDataFeed);

                // Collect signals and errors
                this.signals.push(...result.signals);
                this.errors.push(...result.errors);

                // Process trading signals
                this.processSignals(result.signals, currentBar, timestamp);

                // Evaluate pending orders
                const marketData: MarketData = {
                    symbol: primarySymbol,
                    bid: currentBar.close * (1 - this.config.slippagePercent),
                    ask: currentBar.close * (1 + this.config.slippagePercent),
                    last: currentBar.close,
                    timestamp,
                };
                this.orderEngine.processMarketData(marketData);

                // Update portfolio equity
                const currentPrices = new Map<string, number>();
                for (const [symbol, bars] of dataFeed.bars) {
                    const latestBar = bars.filter(b => b.timestamp <= timestamp).pop();
                    if (latestBar) {
                        currentPrices.set(symbol, latestBar.close);
                    }
                }
                this.orderEngine.updateEquity(currentPrices);

                // Record equity
                const currentEquity = this.portfolio.equity;
                this.equityCurve.push({ timestamp, equity: currentEquity });

                // Track peak for drawdown
                if (currentEquity > this.peakEquity) {
                    this.peakEquity = currentEquity;
                }

                // Check max drawdown limit
                const drawdownPercent = (this.peakEquity - currentEquity) / this.peakEquity;
                if (drawdownPercent >= this.config.maxDrawdownPercent) {
                    this.errors.push(`Max drawdown limit reached (${(drawdownPercent * 100).toFixed(2)}%)`);
                    break;
                }
            }

            // Calculate final metrics
            const metrics = calculatePerformanceMetrics(
                this.trades,
                this.equityCurve,
                this.config.initialCapital
            );

            // Generate drawdown curve
            const drawdownCurve = this.generateDrawdownCurve();

            return {
                success: this.errors.length === 0,
                config: this.config,
                metrics,
                trades: this.trades,
                equityCurve: this.equityCurve,
                drawdownCurve,
                signals: this.signals,
                errors: this.errors,
            };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.errors.push(errorMsg);

            return {
                success: false,
                config: this.config,
                metrics: emptyPerformanceMetrics(),
                trades: [],
                equityCurve: [],
                drawdownCurve: [],
                signals: this.signals,
                errors: this.errors,
            };
        }
    }

    /**
     * Process trading signals from DSL execution
     */
    private processSignals(signals: string[], currentBar: OHLCVBar, timestamp: string): void {
        for (const signal of signals) {
            const parts = signal.split(':');
            const action = parts[0];

            if (action === 'BUY') {
                const symbol = parts[1] || currentBar.symbol;
                const quantity = parseFloat(parts[2]) || 1;
                this.orderEngine.submitOrder({
                    symbol,
                    type: OrderType.MARKET,
                    side: OrderSide.BUY,
                    quantity,
                });
            } else if (action === 'SELL') {
                const symbol = parts[1] || currentBar.symbol;
                const quantity = parseFloat(parts[2]) || 1;
                this.orderEngine.submitOrder({
                    symbol,
                    type: OrderType.MARKET,
                    side: OrderSide.SELL,
                    quantity,
                });
            } else if (action === 'CLOSE') {
                // Close existing position
                const symbol = parts[1] || currentBar.symbol;
                const position = this.portfolio.positions.get(symbol);
                if (position && position.quantity > 0) {
                    this.orderEngine.submitOrder({
                        symbol,
                        type: OrderType.MARKET,
                        side: position.side === 'LONG' ? OrderSide.SELL : OrderSide.BUY,
                        quantity: position.quantity,
                    });
                }
            }
        }
    }

    /**
     * Handle order fill events
     */
    private handleFill(order: any, fill: any): void {
        // Create or update trade record
        const existingTrade = this.trades.find(
            t => t.symbol === order.symbol && !t.exitTime
        );

        if (existingTrade) {
            // This is a closing trade
            existingTrade.exitTime = fill.timestamp;
            existingTrade.exitPrice = fill.price;
            existingTrade.pnl =
                (fill.price - existingTrade.entryPrice) *
                existingTrade.quantity *
                (existingTrade.side === 'long' ? 1 : -1);
            existingTrade.pnlPercent = existingTrade.pnl / (existingTrade.entryPrice * existingTrade.quantity);
        } else {
            // This is an opening trade
            this.trades.push({
                id: `TRADE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                symbol: order.symbol,
                side: order.side === OrderSide.BUY ? 'long' : 'short',
                entryTime: fill.timestamp,
                entryPrice: fill.price,
                quantity: fill.quantity,
            });
        }
    }

    /**
     * Generate drawdown curve from equity curve
     */
    private generateDrawdownCurve(): { timestamp: string; drawdown: number }[] {
        const drawdownCurve: { timestamp: string; drawdown: number }[] = [];
        let peak = this.config.initialCapital;

        for (const point of this.equityCurve) {
            if (point.equity > peak) peak = point.equity;
            const drawdown = (peak - point.equity) / peak;
            drawdownCurve.push({ timestamp: point.timestamp, drawdown });
        }

        return drawdownCurve;
    }
}

/**
 * Convenience function to run a quick backtest
 */
export function runBacktest(
    strategyCode: string,
    symbolData: Record<string, OHLCVBar[]>,
    config: Partial<BacktestConfig> = {}
): BacktestResult {
    const backtester = new Backtester(config);
    return backtester.run(strategyCode, symbolData);
}
