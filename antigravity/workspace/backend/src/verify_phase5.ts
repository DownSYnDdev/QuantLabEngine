import { interpret } from '../../shared/dsl';
import { OHLCVBar } from '../../shared/dsl/interpreter';

// Mock Data (Linear price for easy math verification)
const bars: OHLCVBar[] = [];
for (let i = 0; i < 50; i++) {
    bars.push({
        symbol: 'TEST',
        timestamp: new Date(2023, 0, 1 + i).toISOString(),
        open: 10 + i,
        high: 15 + i,
        low: 5 + i,
        close: 10 + i, // Linear uptrend: 10, 11, 12, ...
        volume: 1000
    });
}

const code = `
// Test Series Ops
let s = close
let s_shifted = shift(s, 2)
let s_diff = diff(s)
let s_avg = avg(open, close)

// Test Math Ops
let s_log = log(s)
let val_sqrt = sqrt(100)

// Test Indicators
let bb = bbands(close, 20, 2)
let m = macd(close, 12, 26, 9)

on_end() {
    debug("Validating Phase 5 Functions:")
    
    // Check Shift
    debug("Close[10]:", close[10]) // Should be 20
    debug("Shifted[12]:", s_shifted[12]) // Should be close[10] = 20
    
    // Check Diff
    debug("Diff[10]:", s_diff[10]) // Should be 1 (linear trend)
    
    // Check Avg
    debug("Avg[10]:", s_avg[10]) // (20 + 20) / 2 = 20
    
    // Check Math
    debug("Msg Sqrt(100):", val_sqrt) // 10
    debug("Log(Close[10]):", s_log[10]) // log(20) ~ 2.99
    
    // Check Indicators
    debug("BB Upper[20]:", bb.upper[20])
    debug("MACD Hist[40]:", m.histogram[40])
}
`;

console.log("Running Phase 5 Verification...");
try {
    const result = interpret(code, bars);

    if (result.errors.length > 0) {
        console.error("Errors:", result.errors);
    } else {
        console.log("Execution Successful!");
        // We rely on debug output or we can inspect result.variables
        const shifted = result.variables['s_shifted'] as number[];
        if (shifted[12] === 20) console.log("✅ Shift Verified");
        else console.error("❌ Shift Failed", shifted[12]);

        const diff = result.variables['s_diff'] as number[];
        if (diff[10] === 1) console.log("✅ Diff Verified");
        else console.error("❌ Diff Failed", diff[10]);

        const sqrtVal = result.variables['val_sqrt'];
        if (sqrtVal === 10) console.log("✅ Sqrt Verified");
        else console.error("❌ Sqrt Failed", sqrtVal);

        const bb = result.variables['bb'] as any;
        if (bb && bb.upper && bb.upper.length === 50) console.log("✅ BBands Structure Verified");
        else console.error("❌ BBands Failed");

        const m = result.variables['m'] as any;
        if (m && m.histogram && m.histogram.length === 50) console.log("✅ MACD Structure Verified");
        else console.error("❌ MACD Failed");
    }
} catch (e) {
    console.error("Execution Failed:", e);
}
