/**
 * Models Module Verification Script
 * Tests layout, strategy, and watchlist operations
 */

import {
    createLayout,
    getLayout,
    listLayouts,
    updateLayout,
    deleteLayout,
    clearLayouts,
    createStrategy,
    getStrategy,
    listStrategies,
    updateStrategy,
    deleteStrategy,
    sanitizeDSLCode,
    clearStrategies,
    createWatchlist,
    getWatchlist,
    listWatchlists,
    addSymbolToWatchlist,
    removeSymbolFromWatchlist,
    deleteWatchlist,
    clearWatchlists,
} from '../../shared/models';

console.log('='.repeat(60));
console.log('Models Module Verification');
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

// Clear all storage before tests
clearLayouts();
clearStrategies();
clearWatchlists();

const userId = 'user-123';
const tenantId = 'tenant-1';

// === LAYOUT TESTS ===

test('Create layout', () => {
    const layout = createLayout(userId, tenantId, {
        name: 'My Layout',
        panels: [{ id: 'p1', type: 'chart', position: { x: 0, y: 0 }, size: { width: 800, height: 600 } }],
    });
    return layout.id.startsWith('layout-') && layout.name === 'My Layout';
});

test('Get layout', () => {
    const layout = createLayout(userId, tenantId, { name: 'Test', panels: [] });
    const retrieved = getLayout(layout.id, userId);
    return retrieved?.id === layout.id;
});

test('List layouts', () => {
    const layouts = listLayouts(userId);
    return layouts.length >= 2;
});

test('Update layout', () => {
    const layout = createLayout(userId, tenantId, { name: 'Old Name', panels: [] });
    const updated = updateLayout(layout.id, userId, { name: 'New Name' });
    return updated?.name === 'New Name';
});

test('Delete layout', () => {
    const layout = createLayout(userId, tenantId, { name: 'ToDelete', panels: [] });
    const deleted = deleteLayout(layout.id, userId);
    return deleted && getLayout(layout.id, userId) === null;
});

// === STRATEGY TESTS ===

test('DSL code sanitization - valid code', () => {
    const result = sanitizeDSLCode('if close > sma(20) { buy(1) }');
    return result.valid && result.errors.length === 0;
});

test('DSL code sanitization - dangerous code', () => {
    const result = sanitizeDSLCode('eval("dangerous")');
    return !result.valid && result.errors.length > 0;
});

test('Create strategy', () => {
    const result = createStrategy(userId, tenantId, {
        name: 'SMA Crossover',
        type: 'strategy',
        code: 'if sma(20) > sma(50) { buy(1) }',
        tags: ['sma', 'crossover'],
    });
    return 'id' in result && result.name === 'SMA Crossover';
});

test('Get strategy', () => {
    const strategy = createStrategy(userId, tenantId, {
        name: 'Test Strategy',
        type: 'indicator',
        code: 'plot(sma(20))',
    });
    if ('error' in strategy) return false;
    const retrieved = getStrategy(strategy.id, userId);
    return retrieved?.id === strategy.id;
});

test('List strategies by type', () => {
    const indicators = listStrategies(userId, 'indicator');
    return indicators.every(s => s.type === 'indicator');
});

test('Update strategy increments version', () => {
    const strategy = createStrategy(userId, tenantId, {
        name: 'Versioned',
        type: 'strategy',
        code: 'buy(1)',
    });
    if ('error' in strategy) return false;
    const updated = updateStrategy(strategy.id, userId, { code: 'sell(1)' });
    return 'metadata' in (updated || {}) && (updated as any).metadata.version === 2;
});

test('Delete strategy', () => {
    const strategy = createStrategy(userId, tenantId, {
        name: 'ToDelete',
        type: 'strategy',
        code: 'buy(1)',
    });
    if ('error' in strategy) return false;
    const deleted = deleteStrategy(strategy.id, userId);
    return deleted && getStrategy(strategy.id, userId) === null;
});

// === WATCHLIST TESTS ===

test('Create watchlist', () => {
    const watchlist = createWatchlist(userId, tenantId, {
        name: 'Tech Stocks',
        symbols: ['AAPL', 'GOOGL', 'MSFT'],
    });
    return watchlist.id.startsWith('watchlist-') && watchlist.symbols.length === 3;
});

test('Get watchlist', () => {
    const watchlist = createWatchlist(userId, tenantId, { name: 'Test' });
    const retrieved = getWatchlist(watchlist.id, userId);
    return retrieved?.id === watchlist.id;
});

test('Add symbol to watchlist', () => {
    const watchlist = createWatchlist(userId, tenantId, { name: 'Crypto', symbols: ['BTC'] });
    const updated = addSymbolToWatchlist(watchlist.id, userId, 'ETH', 'Ethereum');
    return updated?.symbols.length === 2 && updated.symbols[1].symbol === 'ETH';
});

test('Remove symbol from watchlist', () => {
    const watchlist = createWatchlist(userId, tenantId, { name: 'Forex', symbols: ['EURUSD', 'GBPUSD'] });
    const updated = removeSymbolFromWatchlist(watchlist.id, userId, 'EURUSD');
    return updated?.symbols.length === 1;
});

test('List watchlists', () => {
    const watchlists = listWatchlists(userId);
    return watchlists.length >= 3;
});

test('Delete watchlist', () => {
    const watchlist = createWatchlist(userId, tenantId, { name: 'ToDelete' });
    const deleted = deleteWatchlist(watchlist.id, userId);
    return deleted && getWatchlist(watchlist.id, userId) === null;
});

// Summary
console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('✅ All Models tests passed!');
} else {
    console.log('❌ Some tests failed');
    process.exit(1);
}
