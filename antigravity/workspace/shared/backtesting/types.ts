/**
 * Backtesting Engine Types
 * Core types and interfaces for the backtesting engine
 */

import { OHLCVBar } from '../dsl/interpreter';
import { Portfolio, Position } from '../trading';
import { Order, OrderFill } from '../trading/order';

/**
 * Tick data (for tick-level simulation)
 */
export interface TickData {
    symbol: string;
    timestamp: string;
    bid: number;
    ask: number;
    last: number;
    volume: number;
}

/**
 * Backtest configuration
 */
export interface BacktestConfig {
    // Time range
    startDate: string;
    endDate: string;

    // Capital
    initialCapital: number;

    // Execution
    slippagePercent: number;
    commissionPerTrade: number;

    // Safety
    maxDrawdownPercent: number;
    maxPositionSize: number;

    // Simulation mode
    mode: 'bar' | 'tick';
}

/**
 * Default backtest configuration
 */
export const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
    startDate: '',
    endDate: '',
    initialCapital: 100000,
    slippagePercent: 0.001,
    commissionPerTrade: 0,
    maxDrawdownPercent: 0.20,
    maxPositionSize: 0.25,
    mode: 'bar',
};

/**
 * Backtest context - current state during simulation
 */
export interface BacktestContext {
    currentTime: string;
    currentBarIndex: number;
    symbols: string[];
    portfolio: Portfolio;
    openOrders: Order[];
    fills: OrderFill[];
    isRunning: boolean;
}

/**
 * Trade record for performance tracking
 */
export interface TradeRecord {
    id: string;
    symbol: string;
    side: 'long' | 'short';
    entryTime: string;
    entryPrice: number;
    exitTime?: string;
    exitPrice?: number;
    quantity: number;
    pnl?: number;
    pnlPercent?: number;
    holdingPeriodBars?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    // Returns
    totalReturn: number;
    totalReturnPercent: number;
    annualizedReturn: number;

    // Risk
    maxDrawdown: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    sortinoRatio: number;

    // Trading
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;

    // Time
    startDate: string;
    endDate: string;
    totalBars: number;
}

/**
 * Backtest result
 */
export interface BacktestResult {
    success: boolean;
    config: BacktestConfig;
    metrics: PerformanceMetrics;
    trades: TradeRecord[];
    equityCurve: { timestamp: string; equity: number }[];
    drawdownCurve: { timestamp: string; drawdown: number }[];
    signals: string[];
    errors: string[];
}

/**
 * Calculate performance metrics from trades and equity curve
 */
export function calculatePerformanceMetrics(
    trades: TradeRecord[],
    equityCurve: { timestamp: string; equity: number }[],
    initialCapital: number
): PerformanceMetrics {
    const completeTrades = trades.filter(t => t.exitTime !== undefined);

    // Returns
    const finalEquity = equityCurve[equityCurve.length - 1]?.equity || initialCapital;
    const totalReturn = finalEquity - initialCapital;
    const totalReturnPercent = totalReturn / initialCapital;

    // Calculate max drawdown
    let peak = initialCapital;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    for (const point of equityCurve) {
        if (point.equity > peak) peak = point.equity;
        const drawdown = peak - point.equity;
        const drawdownPct = drawdown / peak;
        if (drawdownPct > maxDrawdownPercent) {
            maxDrawdown = drawdown;
            maxDrawdownPercent = drawdownPct;
        }
    }

    // Win/Loss analysis
    const winningTrades = completeTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = completeTrades.filter(t => (t.pnl || 0) < 0);

    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));

    const winRate = completeTrades.length > 0
        ? winningTrades.length / completeTrades.length
        : 0;

    const avgWin = winningTrades.length > 0
        ? totalWins / winningTrades.length
        : 0;

    const avgLoss = losingTrades.length > 0
        ? totalLosses / losingTrades.length
        : 0;

    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    // Simplified Sharpe (would need daily returns for proper calculation)
    const returns = equityCurve.map((p, i) =>
        i === 0 ? 0 : (p.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity
    );
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    // Simplified Sortino (only downside deviation)
    const negativeReturns = returns.filter(r => r < 0);
    const downsideDev = negativeReturns.length > 0
        ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length)
        : 0;
    const sortinoRatio = downsideDev > 0 ? (avgReturn / downsideDev) * Math.sqrt(252) : 0;

    // Annualized return (simplified)
    const totalBars = equityCurve.length;
    const yearsApprox = totalBars / 252; // Assuming daily bars
    const annualizedReturn = yearsApprox > 0
        ? Math.pow(1 + totalReturnPercent, 1 / yearsApprox) - 1
        : 0;

    return {
        totalReturn,
        totalReturnPercent,
        annualizedReturn,
        maxDrawdown,
        maxDrawdownPercent,
        sharpeRatio,
        sortinoRatio,
        totalTrades: completeTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
        startDate: equityCurve[0]?.timestamp || '',
        endDate: equityCurve[equityCurve.length - 1]?.timestamp || '',
        totalBars,
    };
}

/**
 * Generate empty performance metrics
 */
export function emptyPerformanceMetrics(): PerformanceMetrics {
    return {
        totalReturn: 0,
        totalReturnPercent: 0,
        annualizedReturn: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        startDate: '',
        endDate: '',
        totalBars: 0,
    };
}
