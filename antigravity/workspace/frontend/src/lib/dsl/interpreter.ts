/**
 * DSL Interpreter
 * Executes AST and produces indicator outputs
 */

import { parse } from './parser';
import {
    Program,
    Statement,
    Expression,
    OnBarBlock,
    VariableDecl,
    IfStatement,
    BinaryExpr,
    UnaryExpr,
    CallExpr,
    Identifier,
    NumberLiteral,
    StringLiteral,
    BooleanLiteral,
} from './ast';

/**
 * OHLCV bar type (matching backend)
 */
export interface OHLCVBar {
    symbol: string;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/**
 * Overlay data returned from DSL execution
 */
export interface OverlayData {
    name: string;
    type: 'line' | 'multi-line' | 'band';
    color: string;
    data: { timestamp: string; value: number }[];
}

/**
 * Interpreter result
 */
export interface InterpreterResult {
    success: boolean;
    overlays: OverlayData[];
    signals: string[];
    errors: string[];
    variables: Record<string, unknown>;
}

/**
 * Interpreter error
 */
export class InterpreterError extends Error {
    constructor(
        message: string,
        public line: number,
        public column: number
    ) {
        super(`[Line ${line}:${column}] ${message}`);
        this.name = 'InterpreterError';
    }
}

/**
 * Built-in indicator functions
 * Note: Using 'any' for flexibility with DSL argument passing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BUILTIN_INDICATORS: Record<string, (bars: OHLCVBar[], ...args: any[]) => number[]> = {
    /**
     * Simple Moving Average
     */
    sma: (bars: OHLCVBar[], source = 'close', period = 20): number[] => {
        const prices = bars.map(b => b[source as keyof OHLCVBar] as number);
        const result: number[] = [];

        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                result.push(NaN);
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += prices[i - j];
                }
                result.push(sum / period);
            }
        }

        return result;
    },

    /**
     * Exponential Moving Average
     */
    ema: (bars: OHLCVBar[], source = 'close', period = 20): number[] => {
        const prices = bars.map(b => b[source as keyof OHLCVBar] as number);
        const result: number[] = [];
        const k = 2 / (period + 1);

        // Seed with SMA
        let sum = 0;
        for (let i = 0; i < period && i < prices.length; i++) {
            sum += prices[i];
            result.push(NaN);
        }

        if (prices.length < period) return result;

        let ema = sum / period;
        result[period - 1] = ema;

        for (let i = period; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
            result.push(ema);
        }

        return result;
    },

    /**
     * Relative Strength Index
     */
    rsi: (bars: OHLCVBar[], source = 'close', period = 14): number[] => {
        const prices = bars.map(b => b[source as keyof OHLCVBar] as number);
        const result: number[] = [];

        if (prices.length < period + 1) {
            return prices.map(() => NaN);
        }

        // Calculate price changes
        const changes: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        const gains = changes.map(c => (c > 0 ? c : 0));
        const losses = changes.map(c => (c < 0 ? Math.abs(c) : 0));

        // First average
        let avgGain = 0;
        let avgLoss = 0;
        for (let i = 0; i < period; i++) {
            avgGain += gains[i];
            avgLoss += losses[i];
        }
        avgGain /= period;
        avgLoss /= period;

        // Fill NaN for initial period
        for (let i = 0; i <= period; i++) {
            result.push(NaN);
        }

        // First RSI
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result[period] = 100 - (100 / (1 + rs));

        // Remaining
        for (let i = period; i < changes.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            result.push(100 - (100 / (1 + rs)));
        }

        return result;
    },
};

/**
 * Built-in helper functions
 * Note: Using 'any' for flexibility with DSL argument passing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BUILTIN_HELPERS: Record<string, (...args: any[]) => any> = {
    /**
     * Crossover detection
     */
    crossover: (series1: number[], series2: number[]): boolean => {
        if (!series1 || !series2 || series1.length < 2 || series2.length < 2) return false;
        const prev1 = series1[series1.length - 2];
        const curr1 = series1[series1.length - 1];
        const prev2 = series2[series2.length - 2];
        const curr2 = series2[series2.length - 1];
        return prev1 <= prev2 && curr1 > curr2;
    },

    /**
     * Crossunder detection
     */
    crossunder: (series1: number[], series2: number[]): boolean => {
        if (!series1 || !series2 || series1.length < 2 || series2.length < 2) return false;
        const prev1 = series1[series1.length - 2];
        const curr1 = series1[series1.length - 1];
        const prev2 = series2[series2.length - 2];
        const curr2 = series2[series2.length - 1];
        return prev1 >= prev2 && curr1 < curr2;
    },

    /**
     * Absolute value
     */
    abs: (x: number): number => Math.abs(x),

    /**
     * Maximum
     */
    max: (...values: number[]): number => Math.max(...values),

    /**
     * Minimum  
     */
    min: (...values: number[]): number => Math.min(...values),

    /**
     * Round
     */
    round: (x: number): number => Math.round(x),
};

/**
 * DSL Interpreter class
 */
export class Interpreter {
    private bars: OHLCVBar[] = [];
    private variables: Record<string, unknown> = {};
    private overlays: OverlayData[] = [];
    private signals: string[] = [];
    private errors: string[] = [];

    /**
     * Execute DSL code with OHLCV data
     */
    execute(source: string, bars: OHLCVBar[]): InterpreterResult {
        this.bars = bars;
        this.variables = {};
        this.overlays = [];
        this.signals = [];
        this.errors = [];

        // Set up built-in variables
        this.variables['close'] = bars.map(b => b.close);
        this.variables['open'] = bars.map(b => b.open);
        this.variables['high'] = bars.map(b => b.high);
        this.variables['low'] = bars.map(b => b.low);
        this.variables['volume'] = bars.map(b => b.volume);

        try {
            const ast = parse(source);
            this.executeProgram(ast);
        } catch (error) {
            if (error instanceof Error) {
                this.errors.push(error.message);
            }
        }

        return {
            success: this.errors.length === 0,
            overlays: this.overlays,
            signals: this.signals,
            errors: this.errors,
            variables: this.variables,
        };
    }

    private executeProgram(program: Program): void {
        for (const stmt of program.body) {
            this.executeStatement(stmt);
        }
    }

    private executeStatement(stmt: Statement): void {
        switch (stmt.type) {
            case 'IndicatorDecl':
                // Just metadata, nothing to execute
                break;

            case 'OnBarBlock':
                this.executeOnBar(stmt as OnBarBlock);
                break;

            case 'VariableDecl':
                this.executeVariableDecl(stmt as VariableDecl);
                break;

            case 'IfStatement':
                this.executeIfStatement(stmt as IfStatement);
                break;
        }
    }

    private executeOnBar(block: OnBarBlock): void {
        // Execute all statements in the on_bar block
        for (const stmt of block.body) {
            this.executeStatement(stmt);
        }
    }

    private executeVariableDecl(decl: VariableDecl): void {
        const value = this.evaluateExpression(decl.value);
        this.variables[decl.name] = value;

        // If it's a series (array of numbers), create an overlay
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'number') {
            const data = value
                .map((v, i) => ({
                    timestamp: this.bars[i]?.timestamp || '',
                    value: v as number,
                }))
                .filter(d => !isNaN(d.value));

            if (data.length > 0) {
                this.overlays.push({
                    name: decl.name,
                    type: 'line',
                    color: this.getColorForVariable(decl.name),
                    data,
                });
            }
        }
    }

    private executeIfStatement(stmt: IfStatement): void {
        const condition = this.evaluateExpression(stmt.condition);

        if (condition) {
            for (const s of stmt.consequent) {
                this.executeStatement(s);
            }
        } else if (stmt.alternate) {
            for (const s of stmt.alternate) {
                this.executeStatement(s);
            }
        }
    }

    private evaluateExpression(expr: Expression): unknown {
        switch (expr.type) {
            case 'NumberLiteral':
                return (expr as NumberLiteral).value;

            case 'StringLiteral':
                return (expr as StringLiteral).value;

            case 'BooleanLiteral':
                return (expr as BooleanLiteral).value;

            case 'Identifier':
                return this.variables[(expr as Identifier).name];

            case 'BinaryExpr':
                return this.evaluateBinaryExpr(expr as BinaryExpr);

            case 'UnaryExpr':
                return this.evaluateUnaryExpr(expr as UnaryExpr);

            case 'CallExpr':
                return this.evaluateCallExpr(expr as CallExpr);

            default:
                return undefined;
        }
    }

    private evaluateBinaryExpr(expr: BinaryExpr): unknown {
        const left = this.evaluateExpression(expr.left) as number;
        const right = this.evaluateExpression(expr.right) as number;

        switch (expr.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '==': return left === right;
            case '!=': return left !== right;
            case '&&': return left && right;
            case '||': return left || right;
            default: return undefined;
        }
    }

    private evaluateUnaryExpr(expr: UnaryExpr): unknown {
        const operand = this.evaluateExpression(expr.operand);

        switch (expr.operator) {
            case '-': return -(operand as number);
            case '!': return !operand;
            default: return undefined;
        }
    }

    private evaluateCallExpr(expr: CallExpr): unknown {
        const { callee, arguments: args } = expr as CallExpr;
        const evaluatedArgs = args.map(a => this.evaluateExpression(a));

        // Check built-in indicators
        if (BUILTIN_INDICATORS[callee]) {
            return BUILTIN_INDICATORS[callee](this.bars, ...evaluatedArgs);
        }

        // Check built-in helpers
        if (BUILTIN_HELPERS[callee]) {
            return BUILTIN_HELPERS[callee](...evaluatedArgs);
        }

        // Check for plot function
        if (callee === 'plot') {
            const [series, title, color] = evaluatedArgs;
            if (Array.isArray(series)) {
                const name = (title as string) || 'Plot';
                const lineColor = (color as string) || '#22C55E';
                const data = (series as number[])
                    .map((v, i) => ({
                        timestamp: this.bars[i]?.timestamp || '',
                        value: v,
                    }))
                    .filter(d => !isNaN(d.value));

                this.overlays.push({
                    name,
                    type: 'line',
                    color: lineColor,
                    data,
                });
            }
            return undefined;
        }

        // Check for signal function
        if (callee === 'signal') {
            const [type, symbol] = evaluatedArgs;
            this.signals.push(`${type}:${symbol}`);
            return undefined;
        }

        this.errors.push(`Unknown function: ${callee}`);
        return undefined;
    }

    private getColorForVariable(name: string): string {
        // Generate consistent color based on variable name
        const colors = [
            '#3B82F6', // Blue
            '#F59E0B', // Amber
            '#8B5CF6', // Purple
            '#22C55E', // Green
            '#EF4444', // Red
            '#EC4899', // Pink
            '#14B8A6', // Teal
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = (hash * 31 + name.charCodeAt(i)) % colors.length;
        }

        return colors[Math.abs(hash)];
    }
}

/**
 * Execute DSL code and return results
 */
export function interpret(source: string, bars: OHLCVBar[]): InterpreterResult {
    const interpreter = new Interpreter();
    return interpreter.execute(source, bars);
}

// Re-export for convenience
export { parse } from './parser';
export { tokenize } from './tokenizer';
