/**
 * DSL Client Library
 * Client-side DSL execution and API integration
 */

// Re-export from local dsl module
export { interpret, Interpreter, InterpreterError } from './dsl';
export type { OHLCVBar, OverlayData, InterpreterResult } from './dsl';

/**
 * Fetch OHLCV data from backend
 */
export async function fetchOHLCVData(
    symbol: string,
    limit: number = 500
): Promise<import('./dsl').OHLCVBar[]> {
    const response = await fetch(
        `http://localhost:4000/api/v1/ohlcv/${symbol}?limit=${limit}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch OHLCV data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.bars;
}

/**
 * Execute DSL code with OHLCV data
 */
export async function executeDSL(
    source: string,
    symbol: string
): Promise<import('./dsl').InterpreterResult> {
    const { interpret } = await import('./dsl');
    const bars = await fetchOHLCVData(symbol);
    return interpret(source, bars);
}

/**
 * Validate DSL syntax (returns errors if any)
 */
export function validateDSL(source: string): string[] {
    try {
        const { parse } = require('./dsl');
        parse(source);
        return [];
    } catch (error) {
        if (error instanceof Error) {
            return [error.message];
        }
        return ['Unknown syntax error'];
    }
}
