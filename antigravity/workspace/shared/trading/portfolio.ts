/**
 * Portfolio State Management
 * Tracks cash, equity, and aggregate PnL
 */

import { Position, PositionSide, calculateUnrealizedPnL } from './position';

/**
 * Portfolio interface
 */
export interface Portfolio {
    cash: number;
    equity: number;             // Cash + unrealized PnL
    unrealizedPnL: number;
    realizedPnL: number;
    margin: number;             // Used margin (optional)
    availableMargin: number;    // Free margin
    positions: Map<string, Position>;
    updatedAt: string;
    tenantId?: string;
}

/**
 * Portfolio snapshot (for serialization)
 */
export interface PortfolioSnapshot {
    cash: number;
    equity: number;
    unrealizedPnL: number;
    realizedPnL: number;
    margin: number;
    availableMargin: number;
    positions: Array<Position>;
    updatedAt: string;
}

/**
 * Create a new portfolio with initial capital
 */
export function createPortfolio(initialCapital: number): Portfolio {
    return {
        cash: initialCapital,
        equity: initialCapital,
        unrealizedPnL: 0,
        realizedPnL: 0,
        margin: 0,
        availableMargin: initialCapital,
        positions: new Map(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Update portfolio equity based on current prices
 */
export function updatePortfolioEquity(
    portfolio: Portfolio,
    currentPrices: Map<string, number>
): Portfolio {
    let totalUnrealizedPnL = 0;
    let totalRealizedPnL = 0;

    for (const [symbol, position] of portfolio.positions) {
        const currentPrice = currentPrices.get(symbol);
        if (currentPrice && position.side !== PositionSide.FLAT) {
            position.unrealizedPnL = calculateUnrealizedPnL(position, currentPrice);
        }
        totalUnrealizedPnL += position.unrealizedPnL;
        totalRealizedPnL += position.realizedPnL;
    }

    return {
        ...portfolio,
        unrealizedPnL: totalUnrealizedPnL,
        realizedPnL: totalRealizedPnL,
        equity: portfolio.cash + totalUnrealizedPnL,
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Get or create position for a symbol
 */
export function getOrCreatePosition(portfolio: Portfolio, symbol: string): Position {
    let position = portfolio.positions.get(symbol);
    if (!position) {
        const now = new Date().toISOString();
        position = {
            symbol,
            side: PositionSide.FLAT,
            quantity: 0,
            averageEntryPrice: 0,
            unrealizedPnL: 0,
            realizedPnL: 0,
            openedAt: now,
            updatedAt: now,
        };
        portfolio.positions.set(symbol, position);
    }
    return position;
}

/**
 * Convert portfolio to a serializable snapshot
 */
export function toPortfolioSnapshot(portfolio: Portfolio): PortfolioSnapshot {
    return {
        cash: portfolio.cash,
        equity: portfolio.equity,
        unrealizedPnL: portfolio.unrealizedPnL,
        realizedPnL: portfolio.realizedPnL,
        margin: portfolio.margin,
        availableMargin: portfolio.availableMargin,
        positions: Array.from(portfolio.positions.values()),
        updatedAt: portfolio.updatedAt,
    };
}

/**
 * Calculate drawdown from peak equity
 */
export function calculateDrawdown(currentEquity: number, peakEquity: number): number {
    if (peakEquity <= 0) return 0;
    return Math.max(0, (peakEquity - currentEquity) / peakEquity);
}

/**
 * Check if portfolio meets margin requirements
 */
export function hasAvailableMargin(portfolio: Portfolio, requiredMargin: number): boolean {
    return portfolio.availableMargin >= requiredMargin;
}
