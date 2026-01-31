import { interpret } from '../../shared/dsl';
import { OHLCVBar } from '../../shared/dsl/interpreter';

// Mock Data
const aapl: OHLCVBar[] = [
    { symbol: 'AAPL', timestamp: '2023-01-01', open: 150, high: 155, low: 148, close: 152, volume: 1000 },
    { symbol: 'AAPL', timestamp: '2023-01-02', open: 152, high: 158, low: 151, close: 156, volume: 1200 },
    { symbol: 'AAPL', timestamp: '2023-01-03', open: 156, high: 160, low: 154, close: 158, volume: 1100 }
];

const spy: OHLCVBar[] = [
    { symbol: 'SPY', timestamp: '2023-01-01', open: 400, high: 405, low: 395, close: 402, volume: 5000 },
    { symbol: 'SPY', timestamp: '2023-01-02', open: 402, high: 408, low: 398, close: 406, volume: 6000 },
    // SPY has same length for this test
    { symbol: 'SPY', timestamp: '2023-01-03', open: 406, high: 410, low: 400, close: 404, volume: 5500 }
];

const feed = {
    'AAPL': aapl,
    'SPY': spy
};

// DSL Code
// Calculate relative strength (AAPL / SPY) and SMA of it.
const code = `
let s_spy = security("SPY")
let spread = close - s_spy.close
let ratio = close / s_spy.close

// Test generic SMA on external series
let spy_sma = sma(s_spy.close, 2)

debug("AAPL Close:", close)
debug("SPY Close:", s_spy.close)
debug("Spread (AAPL-SPY):", spread)
debug("Ratio (AAPL/SPY):", ratio)
debug("SPY SMA(2):", spy_sma)
`;

console.log("Running Multi-Symbol Verification...");
try {
    const result = interpret(code, aapl, feed);

    // Validate results manually
    // index 0: 152 - 402 = -250
    // index 1: 156 - 406 = -250
    // index 2: 158 - 404 = -246

    // SMA(2) of SPY:
    // 0: NaN
    // 1: (402+406)/2 = 404
    // 2: (406+404)/2 = 405

    /* Expected debug output logic needs manual check or console inspection */

    if (result.errors.length > 0) {
        console.error("Errors:", result.errors);
    } else {
        console.log("Execution Successful!");
        console.log("Variables:", JSON.stringify(result.variables, null, 2));
    }
} catch (e) {
    console.error("Execution Failed:", e);
}
