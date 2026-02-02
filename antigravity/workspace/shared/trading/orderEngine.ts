/**
 * Order Engine
 * Handles order lifecycle, matching, and fill generation
 */

import {
    Order,
    OrderType,
    OrderSide,
    OrderStatus,
    OrderFill,
    OrderRequest,
    validateOrderRequest,
    createOrderFromRequest,
    generateOrderId,
} from './order';
import {
    Position,
    PositionChange,
    updatePositionFromFill,
} from './position';
import {
    Portfolio,
    getOrCreatePosition,
    updatePortfolioEquity,
} from './portfolio';

/**
 * Slippage configuration
 */
export interface SlippageConfig {
    mode: 'fixed' | 'percentage' | 'volatility';
    value: number;  // Fixed amount, percentage (0.001 = 0.1%), or volatility multiplier
}

/**
 * Order engine configuration
 */
export interface OrderEngineConfig {
    slippage: SlippageConfig;
    allowPartialFills: boolean;
    maxOpenOrders: number;
}

/**
 * Market data for order evaluation
 */
export interface MarketData {
    symbol: string;
    bid: number;
    ask: number;
    last: number;
    timestamp: string;
}

/**
 * Order engine event types
 */
export type OrderEngineEvent =
    | { type: 'order_created'; order: Order }
    | { type: 'order_filled'; order: Order; fill: OrderFill }
    | { type: 'order_partial'; order: Order; fill: OrderFill }
    | { type: 'order_canceled'; order: Order }
    | { type: 'order_rejected'; order: Order; reason: string }
    | { type: 'position_change'; change: PositionChange };

/**
 * Order engine callback type
 */
export type OrderEngineCallback = (event: OrderEngineEvent) => void;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: OrderEngineConfig = {
    slippage: { mode: 'percentage', value: 0.001 },
    allowPartialFills: true,
    maxOpenOrders: 100,
};

/**
 * Order Engine Class
 */
export class OrderEngine {
    private orders: Map<string, Order> = new Map();
    private openOrders: Set<string> = new Set();
    private portfolio: Portfolio;
    private config: OrderEngineConfig;
    private callbacks: OrderEngineCallback[] = [];

    constructor(portfolio: Portfolio, config: Partial<OrderEngineConfig> = {}) {
        this.portfolio = portfolio;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Register a callback for order events
     */
    onEvent(callback: OrderEngineCallback): void {
        this.callbacks.push(callback);
    }

    /**
     * Emit an event to all registered callbacks
     */
    private emit(event: OrderEngineEvent): void {
        for (const callback of this.callbacks) {
            try {
                callback(event);
            } catch (err) {
                console.error('[OrderEngine] Callback error:', err);
            }
        }
    }

    /**
     * Submit a new order
     */
    submitOrder(request: OrderRequest): Order {
        // Validate the order
        const validation = validateOrderRequest(request);
        if (!validation.valid) {
            const order = createOrderFromRequest(request);
            order.status = OrderStatus.REJECTED;
            this.emit({ type: 'order_rejected', order, reason: validation.errors.join(', ') });
            return order;
        }

        // Check max open orders
        if (this.openOrders.size >= this.config.maxOpenOrders) {
            const order = createOrderFromRequest(request);
            order.status = OrderStatus.REJECTED;
            this.emit({ type: 'order_rejected', order, reason: 'Max open orders limit reached' });
            return order;
        }

        // Create the order
        const order = createOrderFromRequest(request);
        order.status = OrderStatus.OPEN;
        this.orders.set(order.id, order);
        this.openOrders.add(order.id);

        this.emit({ type: 'order_created', order });

        return order;
    }

    /**
     * Cancel an order
     */
    cancelOrder(orderId: string): boolean {
        const order = this.orders.get(orderId);
        if (!order) return false;

        if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.PARTIAL) {
            return false;
        }

        order.status = OrderStatus.CANCELED;
        order.updatedAt = new Date().toISOString();
        this.openOrders.delete(orderId);

        this.emit({ type: 'order_canceled', order });
        return true;
    }

    /**
     * Process market data and evaluate open orders
     */
    processMarketData(marketData: MarketData): OrderFill[] {
        const fills: OrderFill[] = [];

        for (const orderId of this.openOrders) {
            const order = this.orders.get(orderId);
            if (!order || order.symbol !== marketData.symbol) continue;

            const fill = this.evaluateOrder(order, marketData);
            if (fill) {
                fills.push(fill);
                this.applyFill(order, fill);
            }
        }

        return fills;
    }

    /**
     * Evaluate if an order should be filled
     */
    private evaluateOrder(order: Order, marketData: MarketData): OrderFill | null {
        const now = new Date().toISOString();
        let fillPrice: number | null = null;

        switch (order.type) {
            case OrderType.MARKET:
                // Market orders fill immediately
                fillPrice = order.side === OrderSide.BUY ? marketData.ask : marketData.bid;
                break;

            case OrderType.LIMIT:
                if (order.side === OrderSide.BUY && marketData.ask <= (order.price || 0)) {
                    fillPrice = order.price || marketData.ask;
                } else if (order.side === OrderSide.SELL && marketData.bid >= (order.price || 0)) {
                    fillPrice = order.price || marketData.bid;
                }
                break;

            case OrderType.STOP:
                if (order.side === OrderSide.BUY && marketData.last >= (order.stopPrice || 0)) {
                    fillPrice = marketData.ask;
                } else if (order.side === OrderSide.SELL && marketData.last <= (order.stopPrice || 0)) {
                    fillPrice = marketData.bid;
                }
                break;

            case OrderType.STOP_LIMIT:
                if (order.side === OrderSide.BUY && marketData.last >= (order.stopPrice || 0)) {
                    if (marketData.ask <= (order.price || 0)) {
                        fillPrice = order.price || marketData.ask;
                    }
                } else if (order.side === OrderSide.SELL && marketData.last <= (order.stopPrice || 0)) {
                    if (marketData.bid >= (order.price || 0)) {
                        fillPrice = order.price || marketData.bid;
                    }
                }
                break;
        }

        if (fillPrice === null) return null;

        // Apply slippage
        const slippageAmount = this.calculateSlippage(fillPrice, order.side);
        const executionPrice = order.side === OrderSide.BUY
            ? fillPrice + slippageAmount
            : fillPrice - slippageAmount;

        const fillQuantity = order.quantity - order.filledQuantity;

        return {
            orderId: order.id,
            symbol: order.symbol,
            side: order.side,
            quantity: fillQuantity,
            price: executionPrice,
            timestamp: now,
            slippage: slippageAmount,
        };
    }

    /**
     * Calculate slippage based on configuration
     */
    private calculateSlippage(price: number, side: OrderSide): number {
        switch (this.config.slippage.mode) {
            case 'fixed':
                return this.config.slippage.value;
            case 'percentage':
                return price * this.config.slippage.value;
            case 'volatility':
                // Simplified volatility-based slippage
                return price * this.config.slippage.value * Math.random();
            default:
                return 0;
        }
    }

    /**
     * Apply a fill to an order and update portfolio
     */
    private applyFill(order: Order, fill: OrderFill): void {
        // Update order
        order.filledQuantity += fill.quantity;
        order.updatedAt = fill.timestamp;
        order.filledAt = fill.timestamp;

        // Calculate average filled price
        if (order.averageFilledPrice) {
            const prevValue = order.averageFilledPrice * (order.filledQuantity - fill.quantity);
            const newValue = fill.price * fill.quantity;
            order.averageFilledPrice = (prevValue + newValue) / order.filledQuantity;
        } else {
            order.averageFilledPrice = fill.price;
        }

        // Check if fully filled
        if (order.filledQuantity >= order.quantity) {
            order.status = OrderStatus.FILLED;
            this.openOrders.delete(order.id);
            this.emit({ type: 'order_filled', order, fill });
        } else {
            order.status = OrderStatus.PARTIAL;
            this.emit({ type: 'order_partial', order, fill });
        }

        // Update position
        const position = getOrCreatePosition(this.portfolio, order.symbol);
        const { position: updatedPosition, change } = updatePositionFromFill(
            position,
            order.side,
            fill.quantity,
            fill.price
        );

        this.portfolio.positions.set(order.symbol, updatedPosition);
        this.emit({ type: 'position_change', change });

        // Update portfolio cash
        const cashChange = order.side === OrderSide.BUY
            ? -(fill.price * fill.quantity)
            : fill.price * fill.quantity;
        this.portfolio.cash += cashChange;
    }

    /**
     * Get an order by ID
     */
    getOrder(orderId: string): Order | undefined {
        return this.orders.get(orderId);
    }

    /**
     * Get all open orders
     */
    getOpenOrders(): Order[] {
        return Array.from(this.openOrders)
            .map(id => this.orders.get(id))
            .filter((o): o is Order => o !== undefined);
    }

    /**
     * Get all orders for a symbol
     */
    getOrdersBySymbol(symbol: string): Order[] {
        return Array.from(this.orders.values())
            .filter(o => o.symbol === symbol);
    }

    /**
     * Get the current portfolio
     */
    getPortfolio(): Portfolio {
        return this.portfolio;
    }

    /**
     * Update portfolio equity with current prices
     */
    updateEquity(currentPrices: Map<string, number>): void {
        this.portfolio = updatePortfolioEquity(this.portfolio, currentPrices);
    }
}

/**
 * Create a buy order request helper
 */
export function buyMarket(symbol: string, quantity: number): OrderRequest {
    return {
        symbol,
        type: OrderType.MARKET,
        side: OrderSide.BUY,
        quantity,
    };
}

/**
 * Create a sell order request helper
 */
export function sellMarket(symbol: string, quantity: number): OrderRequest {
    return {
        symbol,
        type: OrderType.MARKET,
        side: OrderSide.SELL,
        quantity,
    };
}

/**
 * Create a limit buy order request helper
 */
export function buyLimit(symbol: string, quantity: number, price: number): OrderRequest {
    return {
        symbol,
        type: OrderType.LIMIT,
        side: OrderSide.BUY,
        quantity,
        price,
    };
}

/**
 * Create a limit sell order request helper
 */
export function sellLimit(symbol: string, quantity: number, price: number): OrderRequest {
    return {
        symbol,
        type: OrderType.LIMIT,
        side: OrderSide.SELL,
        quantity,
        price,
    };
}
