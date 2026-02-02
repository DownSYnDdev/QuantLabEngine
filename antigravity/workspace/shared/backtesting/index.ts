/**
 * Backtesting Module Index
 * Re-exports all backtesting-related types and functions
 */

// Types
export {
    TickData,
    BacktestConfig,
    DEFAULT_BACKTEST_CONFIG,
    BacktestContext,
    TradeRecord,
    PerformanceMetrics,
    BacktestResult,
    calculatePerformanceMetrics,
    emptyPerformanceMetrics,
} from './types';

// Data Loader
export {
    DataFeed,
    SyncedDataPoint,
    loadBarData,
    createSyncedTimeline,
    getSyncedDataPoint,
    forwardFillBars,
    sliceBarsUpTo,
    getCurrentPrice,
    generateMockBars,
} from './dataLoader';

// Backtester
export {
    Backtester,
    runBacktest,
} from './backtester';
