/**
 * DSL Trading Functions Verification Script
 * Tests the buy, sell, order, and close functions in the DSL interpreter
 */

import { interpret } from '../../shared/dsl';

// Mock bar data
interface OHLCVBar {
    symbol: string;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

function createMockBars(symbol: string, count: number): OHLCVBar[] {
    const bars: OHLCVBar[] = [];
    for (let i = 0; i < count; i++) {
        bars.push({
            symbol,
            timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
            open: 100 + i,
            high: 102 + i,
            low: 99 + i,
            close: 101 + i,
            volume: 1000 + i * 10,
        });
    }
    return bars;
}

console.log('='.repeat(60));
console.log('DSL Trading Functions Verification');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

function test(name: string, fn: () => boolean): void {
    try {
        if (fn()) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.log(`❌ ${name}`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ ${name} - Error: ${err}`);
        failed++;
    }
}

// Test 1: Simple buy() with quantity only
test('buy(quantity) generates signal', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('buy(1)', bars);
    return result.success &&
        result.signals.some(s => s.includes('BUY:BTCUSD:1'));
});

// Test 2: buy() with symbol and quantity
test('buy(symbol, quantity) generates signal', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('buy("ETHUSD", 10)', bars);
    return result.success &&
        result.signals.some(s => s.includes('BUY:ETHUSD:10'));
});

// Test 3: Simple sell()
test('sell(quantity) generates signal', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('sell(5)', bars);
    return result.success &&
        result.signals.some(s => s.includes('SELL:BTCUSD:5'));
});

// Test 4: sell() with symbol
test('sell(symbol, quantity) generates signal', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('sell("SOLUSD", 100)', bars);
    return result.success &&
        result.signals.some(s => s.includes('SELL:SOLUSD:100'));
});

// Test 5: order() function
test('order(symbol, side, quantity) generates signal', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('order("BTCUSD", "buy", 2)', bars);
    return result.success &&
        result.signals.some(s => s.includes('ORDER:BUY:BTCUSD:2'));
});

// Test 6: order() with type
test('order() with limit type', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('order("BTCUSD", "sell", 1, "LIMIT", 50000)', bars);
    return result.success &&
        result.signals.some(s => s.includes('ORDER:SELL:BTCUSD:1'));
});

// Test 7: close() function
test('close(symbol) generates signal', () => {
    const bars = createMockBars('BTCUSD', 10);
    const result = interpret('close("BTCUSD")', bars);
    return result.success &&
        result.signals.some(s => s.includes('CLOSE:BTCUSD'));
});

// Test 8: close() without symbol defaults to bar symbol
test('close() defaults to current symbol', () => {
    const bars = createMockBars('ETHUSD', 10);
    const result = interpret('close()', bars);
    return result.success &&
        result.signals.some(s => s.includes('CLOSE:ETHUSD'));
});

// Test 9: Trading logic in strategy
test('Conditional buy/sell in strategy', () => {
    const bars = createMockBars('BTCUSD', 20);
    const code = `
        if close[19] > 110 {
            buy(1)
        } else {
            sell(1)
        }
    `;
    const result = interpret(code, bars);
    return result.success && result.signals.length > 0;
});

// Test 10: Multiple orders
test('Multiple orders generate multiple signals', () => {
    const bars = createMockBars('BTCUSD', 10);
    const code = `
        buy("BTCUSD", 1)
        buy("ETHUSD", 10)
        sell("SOLUSD", 5)
    `;
    const result = interpret(code, bars);
    return result.success && result.signals.length === 3;
});

// Summary
console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('✅ All DSL Trading Function tests passed!');
} else {
    console.log('❌ Some tests failed');
    process.exit(1);
}
