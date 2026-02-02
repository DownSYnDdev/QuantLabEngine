/**
 * Trading Module Index
 * Re-exports all trading-related types and functions
 */

// Order types and functions
export {
    OrderType,
    OrderSide,
    OrderStatus,
    TimeInForce,
    Order,
    OrderFill,
    OrderRequest,
    OrderValidationResult,
    validateOrderRequest,
    generateOrderId,
    createOrderFromRequest,
} from './order';

// Position types and functions
export {
    PositionSide,
    Position,
    PositionChange,
    createFlatPosition,
    calculateUnrealizedPnL,
    updatePositionFromFill,
} from './position';

// Portfolio types and functions
export {
    Portfolio,
    PortfolioSnapshot,
    createPortfolio,
    updatePortfolioEquity,
    getOrCreatePosition,
    toPortfolioSnapshot,
    calculateDrawdown,
    hasAvailableMargin,
} from './portfolio';

// Order engine
export {
    OrderEngine,
    OrderEngineConfig,
    SlippageConfig,
    MarketData,
    OrderEngineEvent,
    OrderEngineCallback,
    buyMarket,
    sellMarket,
    buyLimit,
    sellLimit,
} from './orderEngine';
