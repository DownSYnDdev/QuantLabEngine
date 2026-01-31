/**
 * DSL Interpreter
 * Executes AST and produces indicator outputs
 */

import { parse } from './parser';
import {
    Program,
    Statement,
    Expression,
    FunctionDecl,
    OnBarBlock,
    OnTickBlock,
    OnStartBlock,
    OnEndBlock,
    VariableDecl,
    Assignment, // Added
    CompoundAssignment,
    IfStatement,
    ForStatement,
    WhileStatement,
    BreakStatement, // Added
    ContinueStatement, // Added
    ReturnStatement,
    ExpressionStatement, // Added
    BinaryExpr,
    UnaryExpr,
    CallExpr,
    MemberExpr,
    IndexExpr,
    Identifier,
    NumberLiteral,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteral,
    DictLiteral,
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
// Helper to resolve series and parameters for indicators
// Supports signatures: (series, period), ("source", period), (period) -> defaults to close
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveSeriesAndParams(bars: OHLCVBar[], args: any[]): { series: number[], rest: any[] } {
    const first = args[0];

    // Case 1: Series passed as first arg (number array)
    if (Array.isArray(first)) {
        return { series: first, rest: args.slice(1) };
    }

    // Case 2: Source string passed ("open", "close", "high", "low", "volume")
    if (typeof first === 'string' && ['open', 'high', 'low', 'close', 'volume'].includes(first)) {
        const source = first as keyof OHLCVBar;
        const series = bars.map(b => b[source] as number);
        return { series, rest: args.slice(1) };
    }

    // Case 3: Number passed (implies default source="close", first arg is period/length)
    // Or anything else (default to close)
    const series = bars.map(b => b.close);
    return { series, rest: args };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BUILTIN_INDICATORS: Record<string, (bars: OHLCVBar[], ...args: any[]) => number[]> = {
    /**
     * Simple Moving Average
     * usage: sma(20), sma('close', 20), sma(custom_series, 20)
     */
    sma: (bars: OHLCVBar[], ...args: any[]): number[] => {
        const { series: prices, rest } = resolveSeriesAndParams(bars, args);
        const period = (rest[0] as number) || 20;
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
    ema: (bars: OHLCVBar[], ...args: any[]): number[] => {
        const { series: prices, rest } = resolveSeriesAndParams(bars, args);
        const period = (rest[0] as number) || 20;
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
        // Correct EMA seed should be at period-1
        // The loop above pushed NaN for 0..period-1.
        // Wait, loop: i from 0 to period (exclusive). Pushes `period` NaNs?
        // i=0..19 (20 items).
        // Actual EMA calculation usually starts at index `period-1` with SMA.
        // My logic: `result` has `period` NaNs?
        // Let's check previous logic.
        // Previous: result.push(NaN) for i < period. (i=0..19). Then set result[period-1] = ema?
        // Let's stick to safe logic.

        // Reset result
        if (result.length > 0) result.length = 0; // Clear NaNs for clean logic

        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                result.push(NaN); // Wait for enough data
            } else if (i === period - 1) {
                // First EMA point is SMA
                let s = 0;
                for (let j = 0; j < period; j++) s += prices[i - j];
                result.push(s / period);
            } else {
                const prev = result[result.length - 1]; // Previous EMA
                // EMA = Price(t) * k + EMA(y) * (1 - k)
                let val = prices[i] * k + prev * (1 - k);
                // Handle NaN propagation if series has gaps? Assuming clean series.
                if (isNaN(prev)) val = prices[i]; // Fallback? SMA init handles it.
                result.push(val);
            }
        }

        return result;
    },

    /**
     * Relative Strength Index
     */
    rsi: (bars: OHLCVBar[], ...args: any[]): number[] => {
        const { series: prices, rest } = resolveSeriesAndParams(bars, args);
        const period = (rest[0] as number) || 14;
        const result: number[] = [];

        if (prices.length < period + 1) {
            return prices.map(() => NaN);
        }

        // Calculate price changes
        const changes: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }
        // Align changes with prices: changes[0] corresponds to prices[1].
        // result[0] is NaN (price[0] has no change).
        result.push(NaN); // For index 0

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

        // Fill NaN for initial period (already pushed 1 for index 0, need period-1 more?)
        // Total alignment: we need result[period] to be the first RSI value.
        // i=0..period-1 (period items) in changes correspond to prices[1..period].
        // So we need to fill NaNs up to period.
        while (result.length < period) result.push(NaN);

        // First RSI
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs))); // This is at index `period`.

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
 * Runtime limits for safety
 */
interface RuntimeLimits {
    maxIterations: number;
    maxCallDepth: number;
    maxExecutionTime: number; // ms
}

const DEFAULT_LIMITS: RuntimeLimits = {
    maxIterations: 10000,
    maxCallDepth: 100,
    maxExecutionTime: 5000,
};

/**
 * Variable scope for proper scoping
 */
class Scope {
    private values: Record<string, unknown> = {};
    private constants: Set<string> = new Set();

    constructor(private parent?: Scope) { }

    get(name: string): unknown {
        if (name in this.values) {
            return this.values[name];
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        return undefined;
    }

    set(name: string, value: unknown, isConst = false): void {
        if (this.constants.has(name)) {
            throw new Error(`Cannot reassign constant '${name}'`);
        }
        this.values[name] = value;
        if (isConst) {
            this.constants.add(name);
        }
    }

    has(name: string): boolean {
        if (name in this.values) return true;
        if (this.parent) return this.parent.has(name);
        return false;
    }

    // For compound assignment, update existing variable
    update(name: string, value: unknown): void {
        if (name in this.values) {
            if (this.constants.has(name)) {
                throw new Error(`Cannot reassign constant '${name}'`);
            }
            this.values[name] = value;
        } else if (this.parent) {
            this.parent.update(name, value);
        } else {
            this.values[name] = value;
        }
    }

    getAll(): Record<string, unknown> {
        const result = this.parent ? this.parent.getAll() : {};
        return { ...result, ...this.values };
    }
}

/**
 * Sentinel for break/continue/return control flow
 */
class BreakSignal extends Error { constructor() { super('break'); } }
class ContinueSignal extends Error { constructor() { super('continue'); } }
class ReturnSignal extends Error {
    constructor(public value: unknown) { super('return'); }
}

/**
 * DSL Interpreter class
 */
export class Interpreter {
    private bars: OHLCVBar[] = [];
    private dataFeed: Record<string, OHLCVBar[]> = {};
    private scope: Scope = new Scope();
    private userFunctions: Map<string, FunctionDecl> = new Map();
    private overlays: OverlayData[] = [];
    private signals: string[] = [];
    private errors: string[] = [];
    private limits: RuntimeLimits = DEFAULT_LIMITS;
    private iterationCount = 0;
    private callDepth = 0;
    private startTime = 0;

    /**
     * Execute DSL code with OHLCV data
     */
    execute(source: string, bars: OHLCVBar[], dataFeed: Record<string, OHLCVBar[]> = {}, limits?: Partial<RuntimeLimits>): InterpreterResult {
        this.bars = bars;
        this.dataFeed = dataFeed;
        this.scope = new Scope();
        this.userFunctions = new Map();
        this.overlays = [];
        this.signals = [];
        this.errors = [];
        this.limits = { ...DEFAULT_LIMITS, ...limits };
        this.iterationCount = 0;
        this.callDepth = 0;
        this.startTime = Date.now();

        // Set up built-in variables
        this.scope.set('close', bars.map(b => b.close));
        this.scope.set('open', bars.map(b => b.open));
        this.scope.set('high', bars.map(b => b.high));
        this.scope.set('low', bars.map(b => b.low));
        this.scope.set('volume', bars.map(b => b.volume));
        this.scope.set('bar_count', bars.length);

        try {
            const ast = parse(source);
            this.executeProgram(ast);

            // Check for Event Handlers and Run Loop
            if (this.userFunctions.has('on_start') || this.userFunctions.has('on_bar') || this.userFunctions.has('on_end')) {
                this.runEventLoop();
            }

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
            variables: this.scope.getAll(),
        };
    }

    private runEventLoop() {
        // on_start
        if (this.userFunctions.has('on_start')) {
            this.callUserFunction('on_start', []);
        }

        // on_bar
        const onBar = this.userFunctions.get('on_bar');
        if (onBar) {
            const expectsArgs = onBar.params.length > 0;

            for (let i = 0; i < this.bars.length; i++) {
                this.scope.set('bar_index', i);

                // Check runtime limits
                this.checkIterationLimit();

                // Call handler
                const sym = this.bars[i].symbol || 'Main';
                this.callUserFunction('on_bar', expectsArgs ? [sym] : []);
            }
        }

        if (this.userFunctions.has('on_end')) {
            this.callUserFunction('on_end', []);
        }
    }

    private checkLimits(): void {
        if (Date.now() - this.startTime > this.limits.maxExecutionTime) {
            throw new InterpreterError('Execution time limit exceeded', 0, 0);
        }
    }

    private checkIterationLimit(): void {
        this.iterationCount++;
        if (this.iterationCount > this.limits.maxIterations) {
            throw new InterpreterError('Iteration limit exceeded (possible infinite loop)', 0, 0);
        }
        this.checkLimits();
    }

    private executeProgram(program: Program): void {
        for (const stmt of program.body) {
            this.executeStatement(stmt);
        }
    }

    private executeStatement(stmt: Statement): void {
        this.checkLimits();
        try {
            switch (stmt.type) {
                case 'IndicatorDecl':
                    // Just metadata, nothing to execute
                    break;

                case 'FunctionDecl':
                    this.executeFunctionDecl(stmt as FunctionDecl);
                    break;

                case 'OnBarBlock':
                    this.executeOnBar(stmt as OnBarBlock);
                    break;

                case 'OnStartBlock':
                    this.registerHandler('on_start', (stmt as OnStartBlock).body);
                    break;
                case 'OnEndBlock':
                    this.registerHandler('on_end', (stmt as OnEndBlock).body);
                    break;

                case 'OnTickBlock':
                case 'OnOrderFillBlock':
                case 'OnPositionChangeBlock':
                    // Ignore for now or register if needed
                    break;

                case 'VariableDecl':
                    this.executeVariableDecl(stmt as VariableDecl);
                    break;

                case 'Assignment':
                    this.executeAssignment(stmt as unknown as VariableDecl); // Reusing VariableDecl structure for Assignment if similar, but Assignment AST node might be different. 
                    this.executeAssignment(stmt as Assignment);
                    break;

                case 'CompoundAssignment':
                    this.executeCompoundAssignment(stmt as CompoundAssignment);
                    break;

                case 'IfStatement':
                    this.executeIfStatement(stmt as IfStatement);
                    break;

                case 'ForStatement':
                    this.executeForStatement(stmt as ForStatement);
                    break;

                case 'WhileStatement':
                    this.executeWhileStatement(stmt as WhileStatement);
                    break;

                case 'BreakStatement':
                    throw new BreakSignal();

                case 'ContinueStatement':
                    throw new ContinueSignal();

                case 'ReturnStatement':
                    this.executeReturnStatement(stmt as ReturnStatement);
                    break;

                case 'ExpressionStatement':
                    this.evaluateExpression((stmt as ExpressionStatement).expression);
                    break;

                // CallExpr is now wrapped in ExpressionStatement usually, but keep as fallback if AST is constructed manually
                case 'CallExpr':
                    this.evaluateExpression(stmt as CallExpr);
                    break;
            }
        } catch (error) {
            if (error instanceof BreakSignal || error instanceof ContinueSignal || error instanceof ReturnSignal) {
                throw error;
            }
            if (error instanceof InterpreterError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new InterpreterError(error.message, stmt.line || 0, stmt.column || 0);
            }
        }
    }

    private executeBlock(statements: Statement[], newScope: boolean = true): void {
        const previousScope = this.scope;
        if (newScope) {
            this.scope = new Scope(previousScope);
        }

        try {
            for (const stmt of statements) {
                this.executeStatement(stmt);
            }
        } finally {
            if (newScope) {
                this.scope = previousScope;
            }
        }
    }

    private executeFunctionDecl(decl: FunctionDecl): void {
        this.userFunctions.set(decl.name, decl);
    }

    private registerHandler(name: string, body: any[], params: string[] = []): void {
        this.userFunctions.set(name, {
            type: 'FunctionDecl',
            name,
            params,
            body,
            line: 0,
            column: 0
        } as FunctionDecl);
    }

    private executeOnBar(block: OnBarBlock): void {
        this.registerHandler('on_bar', block.body, [block.symbol]);
    }

    private executeVariableDecl(decl: VariableDecl): void {
        const value = this.evaluateExpression(decl.value);
        this.scope.set(decl.name, value);

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

    private executeAssignment(stmt: { name: string, value: Expression }): void {
        const value = this.evaluateExpression(stmt.value);
        this.scope.update(stmt.name, value);
    }

    private executeCompoundAssignment(stmt: CompoundAssignment): void {
        const value = this.evaluateExpression(stmt.value);
        const current = this.scope.get(stmt.name) as number;

        // Only works for numbers for now
        if (typeof current !== 'number' || typeof value !== 'number') {
            throw new Error(`Compound assignment only supported for numbers`);
        }

        let newValue: number;
        switch (stmt.operator) {
            case '+=': newValue = current + value; break;
            case '-=': newValue = current - value; break;
            case '*=': newValue = current * value; break;
            case '/=': newValue = current / value; break;
            default: throw new Error(`Unknown compound operator ${stmt.operator}`);
        }

        this.scope.update(stmt.name, newValue);
    }

    private executeReturnStatement(stmt: ReturnStatement): void {
        const value = stmt.value ? this.evaluateExpression(stmt.value) : undefined;
        throw new ReturnSignal(value);
    }

    private executeIfStatement(stmt: IfStatement): void {
        const condition = this.evaluateExpression(stmt.condition);

        if (condition) {
            this.executeBlock(stmt.consequent, true);
        } else if (stmt.alternate) {
            this.executeBlock(stmt.alternate, true);
        }
    }

    private executeForStatement(stmt: ForStatement): void {
        const iterable = this.evaluateExpression(stmt.iterable);

        // Handle array iteration
        if (Array.isArray(iterable)) {
            // Only create one scope for the loop setup if needed, but usually loop body has its own scope per iteration
            // Ideally:
            // for item in array { ... }

            for (const item of iterable) {
                this.checkIterationLimit();

                // Create iteration scope
                const previousScope = this.scope;
                this.scope = new Scope(previousScope);

                try {
                    this.scope.set(stmt.iterator, item);
                    this.executeBlock(stmt.body, false); // Don't create EXTRA scope inside executeBlock, we just made one
                } catch (error) {
                    if (error instanceof BreakSignal) {
                        this.scope = previousScope; // Restore scope before breaking
                        break;
                    }
                    if (error instanceof ContinueSignal) {
                        this.scope = previousScope; // Restore scope before continuing
                        continue;
                    }
                    throw error;
                } finally {
                    this.scope = previousScope;
                }
            }
        } else if (typeof iterable === 'number') {
            // range(N) -> 0..N-1
            // or if it's just a number, iterate N times? Python 'range' returns a list/generator.
            // Our 'range' built-in should return an array.
            // If user passed a number directly: for i in 10 { ... } -> maybe treat as range(10)?
            // For safety, let's only support arrays for now.
            throw new InterpreterError('For loop iterable must be an array', stmt.line || 0, stmt.column || 0);
        } else {
            throw new InterpreterError(`Cannot iterate over type: ${typeof iterable}`, stmt.line || 0, stmt.column || 0);
        }
    }

    private executeWhileStatement(stmt: WhileStatement): void {
        while (true) {
            this.checkIterationLimit();

            const condition = this.evaluateExpression(stmt.condition);
            if (!condition) break;

            try {
                this.executeBlock(stmt.body, true);
            } catch (error) {
                if (error instanceof BreakSignal) break;
                if (error instanceof ContinueSignal) continue;
                throw error;
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

            case 'ArrayLiteral': {
                const elements = (expr as ArrayLiteral).elements.map(e => this.evaluateExpression(e));
                return elements;
            }

            case 'DictLiteral': {
                const result: Record<string, unknown> = {};
                for (const entry of (expr as DictLiteral).entries) {
                    const key = typeof entry.key === 'string' ? entry.key : String(this.evaluateExpression(entry.key));
                    const value = this.evaluateExpression(entry.value);
                    result[key] = value;
                }
                return result;
            }

            case 'Identifier':
                const name = (expr as Identifier).name;
                // Special: 'close' et al are in scope
                if (this.scope.has(name)) {
                    return this.scope.get(name);
                }
                throw new InterpreterError(`Undefined variable '${name}'`, expr.line, expr.column);

            case 'BinaryExpr':
                return this.evaluateBinaryExpr(expr as BinaryExpr);

            case 'UnaryExpr':
                return this.evaluateUnaryExpr(expr as UnaryExpr);

            case 'CallExpr':
                return this.evaluateCallExpr(expr as CallExpr);

            case 'MemberExpr': {
                const obj = this.evaluateExpression((expr as MemberExpr).object);
                const prop = (expr as MemberExpr).property;
                if (obj && typeof obj === 'object') {
                    // Allow accessing properties of objects (dictionaries)
                    return (obj as Record<string, unknown>)[prop];
                }
                throw new InterpreterError(`Cannot access property '${prop}' of non-object`, expr.line, expr.column);
            }

            case 'IndexExpr': {
                const obj = this.evaluateExpression((expr as IndexExpr).object);
                const index = this.evaluateExpression((expr as IndexExpr).index);

                if (Array.isArray(obj)) {
                    if (typeof index !== 'number') {
                        throw new InterpreterError('Array index must be a number', expr.line, expr.column);
                    }
                    // Handle negative indices like Python
                    const i = index < 0 ? obj.length + index : index;
                    return obj[i];
                } else if (obj && typeof obj === 'object') {
                    const key = String(index);
                    return (obj as Record<string, unknown>)[key];
                }
                throw new InterpreterError('Example: Index access only supported for arrays and dictionaries', expr.line, expr.column);
            }

            default:
                return undefined;
        }
    }

    private evaluateBinaryExpr(expr: BinaryExpr): unknown {
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);

        // Handle string concatenation
        if (expr.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
            return String(left) + String(right);
        }

        // Handle Series (Array) Arithmetic
        if (Array.isArray(left) || Array.isArray(right)) {
            return this.evaluateSeriesOp(left, right, expr.operator);
        }

        // Scalar Logic
        const lNum = left as number;
        const rNum = right as number;

        switch (expr.operator) {
            case '+': return lNum + rNum;
            case '-': return lNum - rNum;
            case '*': return lNum * rNum;
            case '/': return lNum / rNum;
            case '%': return lNum % rNum;
            case '<': return lNum < rNum;
            case '>': return lNum > rNum;
            case '<=': return lNum <= rNum;
            case '>=': return lNum >= rNum;
            case '==': return left === right;
            case '!=': return left !== right;
            case '&&': return !!left && !!right;
            case '||': return !!left || !!right;
            default: return undefined;
        }
    }

    private evaluateSeriesOp(left: any, right: any, op: string): any[] {
        const lArr = Array.isArray(left) ? left as any[] : null;
        const rArr = Array.isArray(right) ? right as any[] : null;
        const length = lArr ? lArr.length : (rArr ? rArr.length : 0);
        const result: any[] = [];

        for (let i = 0; i < length; i++) {
            const lVal = lArr ? lArr[i] : left;
            const rVal = rArr ? rArr[i] : right;

            // Just use JS operators on values, assuming they are numbers/booleans
            let val: any;
            switch (op) {
                case '+': val = lVal + rVal; break;
                case '-': val = lVal - rVal; break;
                case '*': val = lVal * rVal; break;
                case '/': val = lVal / rVal; break;
                case '%': val = lVal % rVal; break;
                case '<': val = lVal < rVal; break;
                case '>': val = lVal > rVal; break;
                case '<=': val = lVal <= rVal; break;
                case '>=': val = lVal >= rVal; break;
                case '==': val = lVal === rVal; break;
                case '!=': val = lVal !== rVal; break;
                case '&&': val = !!lVal && !!rVal; break;
                case '||': val = !!lVal || !!rVal; break;
                default: val = undefined;
            }
            result.push(val);
        }
        return result;
    }

    private evaluateUnaryExpr(expr: UnaryExpr): unknown {
        const operand = this.evaluateExpression(expr.operand);

        if (Array.isArray(operand)) {
            if (expr.operator === '-') {
                return (operand as number[]).map(v => -v);
            }
            if (expr.operator === '!') {
                return (operand as any[]).map(v => !v);
            }
        }

        switch (expr.operator) {
            case '-': return -(operand as number);
            case '!': return !operand;
            default: return undefined;
        }
    }

    private evaluateCallExpr(expr: CallExpr): unknown {
        const { callee, arguments: args } = expr as CallExpr;
        this.callDepth++;
        if (this.callDepth > this.limits.maxCallDepth) {
            throw new InterpreterError('Maximum call depth exceeded', expr.line, expr.column);
        }

        try {
            const evaluatedArgs = args.map(a => this.evaluateExpression(a));

            // Check User Functions
            if (this.userFunctions.has(callee)) {
                return this.callUserFunction(callee, evaluatedArgs);
            }

            // Check built-in indicators
            if (BUILTIN_INDICATORS[callee]) {
                const result = BUILTIN_INDICATORS[callee](this.bars, ...evaluatedArgs);
                return result;
            }

            // Check security function
            if (callee === 'security') {
                const symbol = evaluatedArgs[0] as string;
                if (!symbol || typeof symbol !== 'string') {
                    throw new InterpreterError('security() requires a symbol string', expr.line, expr.column);
                }

                // Check if symbol exists in dataFeed
                const data = this.dataFeed[symbol];
                if (!data) {
                    throw new InterpreterError(`Symbol '${symbol}' not found in data feed`, expr.line, expr.column);
                }

                return {
                    open: data.map(b => b.open),
                    high: data.map(b => b.high),
                    low: data.map(b => b.low),
                    close: data.map(b => b.close),
                    volume: data.map(b => b.volume)
                };
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

            // Check debug/log
            if (callee === 'debug' || callee === 'log') {
                console.log(`DSL [${callee}]:`, ...evaluatedArgs);
                return undefined;
            }

            throw new InterpreterError(`Unknown function: ${callee}`, expr.line, expr.column);
        } finally {
            this.callDepth--;
        }
    }

    private callUserFunction(name: string, args: unknown[]): unknown {
        const funcDecl = this.userFunctions.get(name);
        if (!funcDecl) return undefined;

        // Create scope
        const previousScope = this.scope;
        this.scope = new Scope(previousScope); // Lexical scope would need to capture definition scope, but dynamic scope is easier for now. 
        // Or if we want globals access, new Scope(globalScope?).
        // For simple DSL, let's use new Scope() with access to globals via closure?
        // Actually, best practice: user functions shouldn't access caller's locals, but global scope.
        // But implementing proper closure support is complex.
        // Let's assume dynamic scope (access to caller's scope via parent) or flat scope? 
        // If I pass 'previousScope', it is dynamic/lexical hybrid.
        // Let's create a scope that points to 'global' scope?
        // But we don't track 'global' explicitly.

        // Let's just use a new scope that inherits from current (Dynamic Scoping) for simplicity in this Milestone.
        // It allows functions to see variables defined where they are called.

        try {
            // Bind arguments
            funcDecl.params.forEach((paramName, i) => {
                this.scope.set(paramName, args[i]);
            });

            this.executeBlock(funcDecl.body, false); // Scope already created
        } catch (error) {
            if (error instanceof ReturnSignal) {
                return error.value;
            }
            throw error;
        } finally {
            this.scope = previousScope;
        }
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
export function interpret(
    source: string,
    bars: OHLCVBar[],
    dataFeed: Record<string, OHLCVBar[]> = {},
    limits?: Partial<RuntimeLimits>
): InterpreterResult {
    const interpreter = new Interpreter();
    return interpreter.execute(source, bars, dataFeed, limits);
}

// Re-export for convenience
export { parse } from './parser';
export { tokenize } from './tokenizer';
