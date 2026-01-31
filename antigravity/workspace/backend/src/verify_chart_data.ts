import { interpret } from '../../shared/dsl';

interface OHLCVBar {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    symbol: string;
}

// Mock Data (100 bars)
const bars: OHLCVBar[] = Array.from({ length: 100 }, (_, i) => ({
    timestamp: new Date(Date.now() - (100 - i) * 60000).toISOString(),
    open: 100 + Math.sin(i * 0.1) * 10,
    high: 105 + Math.sin(i * 0.1) * 10,
    low: 95 + Math.sin(i * 0.1) * 10,
    close: 102 + Math.sin(i * 0.1) * 10,
    volume: 1000 + Math.random() * 500,
    symbol: 'TEST'
}));

const code = `
debug("Starting Full Verification")

// Test MACD (MemberExpr + Histogram)
let m = macd(close, 12, 26, 9)
plot(m.histogram, "MACD Histogram", "green", "histogram")
plot(m.macd, "MACD Line", "blue", "line")

// Test Bollinger Bands (MemberExpr + Area)
let b = bbands(close, 20, 2)
plot(b.upper, "BB Upper", "red", "line")
plot(b.lower, "BB Lower", "red", "line")

// Test Simple Line
plot(close, "Close Price", "orange")

debug("Verification Ended")
`;

console.log("Running Full Chart Verification...");
try {
    const result = interpret(code, bars);

    if (result.errors.length > 0) {
        console.error("❌ Interpreter Errors:", result.errors);
        process.exit(1);
    }

    console.log(`Generated Overlays: ${result.overlays.length}`);
    result.overlays.forEach(o => {
        console.log(`- Overlay: ${o.name} | Type: ${o.type} | Data Points: ${o.data.length}`);
    });

    if (result.overlays.length === 5) {
        console.log("✅ All Overlays Generated Successfully");
    } else {
        console.log("⚠️ Unexpected Overlay Count (Expected 5)");
    }

} catch (e) {
    console.error("Exec Error:", e);
}
