/**
 * End-to-End Backtest Integration Test
 * Tests the full backtesting pipeline: DSL strategy -> Order Engine -> Performance Metrics
 */

import { runBacktest, generateMockBars, BacktestResult } from '../../shared/backtesting';

console.log('='.repeat(60));
console.log('End-to-End Backtest Integration Test');
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

// Generate test data
const btcBars = generateMockBars('BTCUSD', 100, 50000, 0.02);

// Test 1: Simple buy-and-hold strategy
test('Simple buy strategy executes', () => {
    const strategy = `
        if close[0] > 0 {
            buy(1)
        }
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 100000,
    });

    // Should produce at least one signal
    return result.signals.length > 0;
});

// Test 2: Strategy generates trades
test('Strategy generates buy signals', () => {
    const strategy = `
        buy(1)
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 100000,
    });

    return result.signals.some(s => s.includes('BUY'));
});

// Test 3: Equity curve is generated
test('Equity curve is generated', () => {
    const strategy = `
        buy(1)
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 100000,
    });

    return result.equityCurve.length > 0;
});

// Test 4: Performance metrics are calculated
test('Performance metrics are calculated', () => {
    const strategy = `
        buy(1)
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 100000,
    });

    return result.metrics !== null &&
        typeof result.metrics.totalBars === 'number';
});

// Test 5: Conditional strategy (moving average crossover concept)
test('Conditional strategy works', () => {
    const strategy = `
        if close[19] > close[0] {
            buy(1)
        }
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 100000,
    });

    // Should complete without errors
    return result.errors.length === 0 ||
        result.errors.every(e => !e.includes('Fatal'));
});

// Test 6: Sell signals work
test('Sell signals are generated', () => {
    const strategy = `
        sell(1)
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 100000,
    });

    return result.signals.some(s => s.includes('SELL'));
});

// Test 7: Multi-symbol data works
test('Multi-symbol data is accepted', () => {
    const ethBars = generateMockBars('ETHUSD', 100, 3000, 0.03);

    const strategy = `
        buy(1)
    `;

    const result = runBacktest(strategy, {
        BTCUSD: btcBars,
        ETHUSD: ethBars,
    }, {
        initialCapital: 100000,
    });

    return result.equityCurve.length > 0;
});

// Test 8: Backtest config is respected
test('Initial capital config is respected', () => {
    const strategy = `
        buy(1)
    `;

    const result = runBacktest(strategy, { BTCUSD: btcBars }, {
        initialCapital: 50000,
    });

    return result.config.initialCapital === 50000;
});

// Summary
console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

// Print sample metrics
const sampleResult = runBacktest('buy(1)', { BTCUSD: btcBars }, { initialCapital: 100000 });
console.log('\nSample Backtest Metrics:');
console.log(`  Total Bars: ${sampleResult.metrics.totalBars}`);
console.log(`  Signals Generated: ${sampleResult.signals.length}`);
console.log(`  Equity Points: ${sampleResult.equityCurve.length}`);
console.log(`  Errors: ${sampleResult.errors.length}`);

if (failed === 0) {
    console.log('\n✅ All E2E Integration tests passed!');
} else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
}
