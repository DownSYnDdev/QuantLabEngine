import { interpret } from '../../shared/dsl';
import { OHLCVBar } from '../../shared/dsl/interpreter';

// Mock Data
const bars: OHLCVBar[] = [
    { symbol: 'AAPL', timestamp: '2023-01-01', open: 150, high: 155, low: 148, close: 152, volume: 1000 },
    { symbol: 'AAPL', timestamp: '2023-01-02', open: 152, high: 158, low: 151, close: 156, volume: 1200 },
    { symbol: 'AAPL', timestamp: '2023-01-03', open: 156, high: 160, low: 154, close: 158, volume: 1100 }
];

const code = `
let bar_count_check = 0
let sum_close = 0

on_start() {
    debug("Starting Strategy")
    bar_count_check = 0
}

on_bar(sym) {
    debug("Processing", sym, "at index:", bar_index)
    bar_count_check += 1
    // Access current close using bar_index
    let current_close = close[bar_index]
    sum_close += current_close
    debug("Current Close:", current_close)
}

on_end() {
    debug("Finished. Processed bars:", bar_count_check)
    debug("Total Close Sum:", sum_close)
}
`;

console.log("Running Event Verification...");
try {
    const result = interpret(code, bars);

    if (result.errors.length > 0) {
        console.error("Errors:", result.errors);
    } else {
        console.log("Execution Successful!");
        console.log("Variables:", JSON.stringify(result.variables, null, 2));
    }
} catch (e) {
    console.error("Execution Failed:", e);
}
