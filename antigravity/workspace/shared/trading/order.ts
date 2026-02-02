/**
 * Order Types and Interfaces
 * Defines the order data structures for the trading engine
 */

/**
 * Order type enumeration
 */
export enum OrderType {
    MARKET = 'MARKET',
    LIMIT = 'LIMIT',
    STOP = 'STOP',
    STOP_LIMIT = 'STOP_LIMIT',
    OCO = 'OCO',           // One-Cancels-Other
    BRACKET = 'BRACKET',   // Entry + TP + SL
}

/**
 * Order side enumeration
 */
export enum OrderSide {
    BUY = 'BUY',
    SELL = 'SELL',
}

/**
 * Order status enumeration
 */
export enum OrderStatus {
    PENDING = 'PENDING',       // Order created but not yet submitted
    OPEN = 'OPEN',             // Order is active and waiting to be filled
    PARTIAL = 'PARTIAL',       // Order is partially filled
    FILLED = 'FILLED',         // Order is completely filled
    CANCELED = 'CANCELED',     // Order was canceled
    REJECTED = 'REJECTED',     // Order was rejected by the engine
    EXPIRED = 'EXPIRED',       // Order expired (time-in-force)
}

/**
 * Time-in-force enumeration
 */
export enum TimeInForce {
    GTC = 'GTC',   // Good Till Canceled
    DAY = 'DAY',   // Day order (expires at market close)
    IOC = 'IOC',   // Immediate or Cancel
    FOK = 'FOK',   // Fill or Kill
}

/**
 * Order interface
 */
export interface Order {
    id: string;
    symbol: string;
    type: OrderType;
    side: OrderSide;
    quantity: number;
    filledQuantity: number;
    price?: number;          // Limit price (for LIMIT, STOP_LIMIT)
    stopPrice?: number;      // Stop trigger price (for STOP, STOP_LIMIT)
    status: OrderStatus;
    timeInForce: TimeInForce;
    createdAt: string;       // ISO timestamp
    updatedAt: string;       // ISO timestamp
    filledAt?: string;       // ISO timestamp of last fill
    averageFilledPrice?: number;
    parentOrderId?: string;  // For OCO/Bracket linked orders
    clientOrderId?: string;  // Client-provided order ID
    tenantId?: string;       // For multi-tenant support
}

/**
 * Order fill event
 */
export interface OrderFill {
    orderId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    price: number;
    timestamp: string;
    slippage?: number;       // Price difference from expected
}

/**
 * Order request (for creating new orders)
 */
export interface OrderRequest {
    symbol: string;
    type: OrderType;
    side: OrderSide;
    quantity: number;
    price?: number;
    stopPrice?: number;
    timeInForce?: TimeInForce;
    clientOrderId?: string;
    // For bracket orders
    takeProfitPrice?: number;
    stopLossPrice?: number;
}

/**
 * Validation result
 */
export interface OrderValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate an order request
 */
export function validateOrderRequest(request: OrderRequest): OrderValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!request.symbol || request.symbol.trim() === '') {
        errors.push('Symbol is required');
    }
    if (!request.type) {
        errors.push('Order type is required');
    }
    if (!request.side) {
        errors.push('Order side is required');
    }
    if (!request.quantity || request.quantity <= 0) {
        errors.push('Quantity must be positive');
    }

    // Type-specific validation
    if (request.type === OrderType.LIMIT || request.type === OrderType.STOP_LIMIT) {
        if (!request.price || request.price <= 0) {
            errors.push('Limit orders require a positive price');
        }
    }

    if (request.type === OrderType.STOP || request.type === OrderType.STOP_LIMIT) {
        if (!request.stopPrice || request.stopPrice <= 0) {
            errors.push('Stop orders require a positive stop price');
        }
    }

    if (request.type === OrderType.BRACKET) {
        if (!request.takeProfitPrice || !request.stopLossPrice) {
            errors.push('Bracket orders require take profit and stop loss prices');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Generate a unique order ID
 */
export function generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a new order from a request
 */
export function createOrderFromRequest(request: OrderRequest): Order {
    const now = new Date().toISOString();
    return {
        id: generateOrderId(),
        symbol: request.symbol,
        type: request.type,
        side: request.side,
        quantity: request.quantity,
        filledQuantity: 0,
        price: request.price,
        stopPrice: request.stopPrice,
        status: OrderStatus.PENDING,
        timeInForce: request.timeInForce || TimeInForce.GTC,
        createdAt: now,
        updatedAt: now,
        clientOrderId: request.clientOrderId,
    };
}
