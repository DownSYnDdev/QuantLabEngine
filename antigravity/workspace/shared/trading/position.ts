/**
 * Position Types and Interfaces
 * Defines position tracking for the trading engine
 */

import { OrderSide } from './order';

/**
 * Position side enumeration
 */
export enum PositionSide {
    LONG = 'LONG',
    SHORT = 'SHORT',
    FLAT = 'FLAT',
}

/**
 * Position interface
 */
export interface Position {
    symbol: string;
    side: PositionSide;
    quantity: number;
    averageEntryPrice: number;
    unrealizedPnL: number;
    realizedPnL: number;
    openedAt: string;        // ISO timestamp
    updatedAt: string;       // ISO timestamp
    tenantId?: string;
}

/**
 * Position change event
 */
export interface PositionChange {
    symbol: string;
    previousSide: PositionSide;
    newSide: PositionSide;
    previousQuantity: number;
    newQuantity: number;
    pnlDelta: number;
    timestamp: string;
}

/**
 * Create an empty (flat) position for a symbol
 */
export function createFlatPosition(symbol: string): Position {
    const now = new Date().toISOString();
    return {
        symbol,
        side: PositionSide.FLAT,
        quantity: 0,
        averageEntryPrice: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        openedAt: now,
        updatedAt: now,
    };
}

/**
 * Calculate unrealized PnL for a position
 */
export function calculateUnrealizedPnL(position: Position, currentPrice: number): number {
    if (position.side === PositionSide.FLAT || position.quantity === 0) {
        return 0;
    }

    const priceDiff = currentPrice - position.averageEntryPrice;
    const multiplier = position.side === PositionSide.LONG ? 1 : -1;
    return priceDiff * position.quantity * multiplier;
}

/**
 * Update position after a fill
 */
export function updatePositionFromFill(
    position: Position,
    fillSide: OrderSide,
    fillQuantity: number,
    fillPrice: number
): { position: Position; change: PositionChange } {
    const now = new Date().toISOString();
    const previousSide = position.side;
    const previousQuantity = position.quantity;

    let newPosition = { ...position, updatedAt: now };
    let pnlDelta = 0;

    // Determine if we're increasing, decreasing, or reversing the position
    const isLongFill = fillSide === OrderSide.BUY;
    const isLongPosition = position.side === PositionSide.LONG;
    const isFlat = position.side === PositionSide.FLAT;

    if (isFlat) {
        // Opening a new position
        newPosition.side = isLongFill ? PositionSide.LONG : PositionSide.SHORT;
        newPosition.quantity = fillQuantity;
        newPosition.averageEntryPrice = fillPrice;
        newPosition.openedAt = now;
    } else if ((isLongPosition && isLongFill) || (!isLongPosition && !isLongFill)) {
        // Adding to existing position
        const totalCost = position.averageEntryPrice * position.quantity + fillPrice * fillQuantity;
        newPosition.quantity = position.quantity + fillQuantity;
        newPosition.averageEntryPrice = totalCost / newPosition.quantity;
    } else {
        // Reducing or reversing position
        if (fillQuantity < position.quantity) {
            // Partial close
            pnlDelta = calculatePnLForClose(position, fillQuantity, fillPrice);
            newPosition.quantity = position.quantity - fillQuantity;
            newPosition.realizedPnL += pnlDelta;
        } else if (fillQuantity === position.quantity) {
            // Full close
            pnlDelta = calculatePnLForClose(position, fillQuantity, fillPrice);
            newPosition.side = PositionSide.FLAT;
            newPosition.quantity = 0;
            newPosition.averageEntryPrice = 0;
            newPosition.realizedPnL += pnlDelta;
        } else {
            // Reversal (close + open opposite)
            const closeQuantity = position.quantity;
            const openQuantity = fillQuantity - closeQuantity;
            pnlDelta = calculatePnLForClose(position, closeQuantity, fillPrice);

            newPosition.side = isLongFill ? PositionSide.LONG : PositionSide.SHORT;
            newPosition.quantity = openQuantity;
            newPosition.averageEntryPrice = fillPrice;
            newPosition.realizedPnL += pnlDelta;
            newPosition.openedAt = now;
        }
    }

    const change: PositionChange = {
        symbol: position.symbol,
        previousSide,
        newSide: newPosition.side,
        previousQuantity,
        newQuantity: newPosition.quantity,
        pnlDelta,
        timestamp: now,
    };

    return { position: newPosition, change };
}

/**
 * Calculate PnL for closing a position
 */
function calculatePnLForClose(position: Position, closeQuantity: number, closePrice: number): number {
    const priceDiff = closePrice - position.averageEntryPrice;
    const multiplier = position.side === PositionSide.LONG ? 1 : -1;
    return priceDiff * closeQuantity * multiplier;
}
