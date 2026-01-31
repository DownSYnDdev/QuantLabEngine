/**
 * AST Node Types for the DSL
 */

export type ASTNodeType =
    | 'Program'
    | 'IndicatorDecl'
    | 'FunctionDecl'
    | 'OnBarBlock'
    | 'OnTickBlock'
    | 'OnStartBlock'
    | 'OnEndBlock'
    | 'OnOrderFillBlock'
    | 'OnPositionChangeBlock'
    | 'VariableDecl'
    | 'Assignment'
    | 'CompoundAssignment'
    | 'IfStatement'
    | 'ForStatement'
    | 'WhileStatement'
    | 'BreakStatement'
    | 'ContinueStatement'
    | 'ReturnStatement'
    | 'BinaryExpr'
    | 'UnaryExpr'
    | 'CallExpr'
    | 'MemberExpr'
    | 'IndexExpr'
    | 'Identifier'
    | 'NumberLiteral'
    | 'StringLiteral'
    | 'BooleanLiteral'
    | 'ArrayLiteral'
    | 'DictLiteral'
    | 'ExpressionStatement';

/**
 * Base AST Node
 */
export interface ASTNode {
    type: ASTNodeType;
    line: number;
    column: number;
}

/**
 * Program - Root node containing all declarations
 */
export interface Program extends ASTNode {
    type: 'Program';
    body: Statement[];
    indicatorName?: string;
}

/**
 * Statement types
 */
export type Statement =
    | IndicatorDecl
    | FunctionDecl
    | OnBarBlock
    | OnTickBlock
    | OnStartBlock
    | OnEndBlock
    | OnOrderFillBlock
    | OnPositionChangeBlock
    | VariableDecl
    | Assignment
    | CompoundAssignment
    | IfStatement
    | ForStatement
    | WhileStatement
    | BreakStatement
    | ContinueStatement
    | ContinueStatement
    | ReturnStatement
    | CallExpr
    | ExpressionStatement;

/**
 * Expression statement (expression as statement)
 */
export interface ExpressionStatement extends ASTNode {
    type: 'ExpressionStatement';
    expression: Expression;
}

/**
 * Indicator declaration
 * indicator("My Indicator")
 */
export interface IndicatorDecl extends ASTNode {
    type: 'IndicatorDecl';
    name: string;
}

/**
 * User-defined function declaration
 * fn myFunc(a, b) { return a + b }
 */
export interface FunctionDecl extends ASTNode {
    type: 'FunctionDecl';
    name: string;
    params: string[];
    body: Statement[];
}

/**
 * on_bar block
 * on_bar(symbol) { ... }
 */
export interface OnBarBlock extends ASTNode {
    type: 'OnBarBlock';
    symbol: string;
    body: Statement[];
}

/**
 * on_tick block
 * on_tick(symbol) { ... }
 */
export interface OnTickBlock extends ASTNode {
    type: 'OnTickBlock';
    symbol: string;
    body: Statement[];
}

/**
 * on_start block
 * on_start() { ... }
 */
export interface OnStartBlock extends ASTNode {
    type: 'OnStartBlock';
    body: Statement[];
}

/**
 * on_end block
 * on_end() { ... }
 */
export interface OnEndBlock extends ASTNode {
    type: 'OnEndBlock';
    body: Statement[];
}

/**
 * on_order_fill block (stub for Milestone 4)
 * on_order_fill(order) { ... }
 */
export interface OnOrderFillBlock extends ASTNode {
    type: 'OnOrderFillBlock';
    orderParam: string;
    body: Statement[];
}

/**
 * on_position_change block (stub for Milestone 4)
 * on_position_change(position) { ... }
 */
export interface OnPositionChangeBlock extends ASTNode {
    type: 'OnPositionChangeBlock';
    positionParam: string;
    body: Statement[];
}

/**
 * Variable declaration
 * let x = 10  or  const y = 20
 */
export interface VariableDecl extends ASTNode {
    type: 'VariableDecl';
    name: string;
    value: Expression;
    isConst?: boolean;
}

/**
 * Assignment (to existing variable)
 */
export interface Assignment extends ASTNode {
    type: 'Assignment';
    name: string;
    value: Expression;
}

/**
 * Compound assignment (+=, -=, *=, /=)
 */
export interface CompoundAssignment extends ASTNode {
    type: 'CompoundAssignment';
    operator: '+=' | '-=' | '*=' | '/=';
    name: string;
    value: Expression;
}

/**
 * If statement
 */
export interface IfStatement extends ASTNode {
    type: 'IfStatement';
    condition: Expression;
    consequent: Statement[];
    alternate?: Statement[];
}

/**
 * For statement
 * for i in range(10) { ... }
 * for item in array { ... }
 */
export interface ForStatement extends ASTNode {
    type: 'ForStatement';
    iterator: string;
    iterable: Expression;
    body: Statement[];
}

/**
 * While statement
 * while condition { ... }
 */
export interface WhileStatement extends ASTNode {
    type: 'WhileStatement';
    condition: Expression;
    body: Statement[];
}

/**
 * Break statement
 */
export interface BreakStatement extends ASTNode {
    type: 'BreakStatement';
}

/**
 * Continue statement
 */
export interface ContinueStatement extends ASTNode {
    type: 'ContinueStatement';
}

/**
 * Return statement
 */
export interface ReturnStatement extends ASTNode {
    type: 'ReturnStatement';
    value?: Expression;
}

/**
 * Expression types
 */
export type Expression =
    | BinaryExpr
    | UnaryExpr
    | CallExpr
    | MemberExpr
    | IndexExpr
    | Identifier
    | NumberLiteral
    | StringLiteral
    | BooleanLiteral
    | ArrayLiteral
    | DictLiteral;

/**
 * Binary expression
 * a + b, x > y, etc.
 */
export interface BinaryExpr extends ASTNode {
    type: 'BinaryExpr';
    operator: string;
    left: Expression;
    right: Expression;
}

/**
 * Unary expression
 * !x, -y
 */
export interface UnaryExpr extends ASTNode {
    type: 'UnaryExpr';
    operator: string;
    operand: Expression;
}

/**
 * Function call
 * sma(close, 20)
 */
export interface CallExpr extends ASTNode {
    type: 'CallExpr';
    callee: string;
    arguments: Expression[];
}

/**
 * Member access (dot notation)
 * bar.close
 */
export interface MemberExpr extends ASTNode {
    type: 'MemberExpr';
    object: Expression;
    property: string;
}

/**
 * Index access (bracket notation)
 * series[0], dict["key"]
 */
export interface IndexExpr extends ASTNode {
    type: 'IndexExpr';
    object: Expression;
    index: Expression;
}

/**
 * Identifier
 */
export interface Identifier extends ASTNode {
    type: 'Identifier';
    name: string;
}

/**
 * Number literal
 */
export interface NumberLiteral extends ASTNode {
    type: 'NumberLiteral';
    value: number;
}

/**
 * String literal
 */
export interface StringLiteral extends ASTNode {
    type: 'StringLiteral';
    value: string;
}

/**
 * Boolean literal
 */
export interface BooleanLiteral extends ASTNode {
    type: 'BooleanLiteral';
    value: boolean;
}

/**
 * Array literal
 */
export interface ArrayLiteral extends ASTNode {
    type: 'ArrayLiteral';
    elements: Expression[];
}

/**
 * Dictionary/Object literal
 * { key: value, key2: value2 }
 */
export interface DictLiteral extends ASTNode {
    type: 'DictLiteral';
    entries: { key: string | Expression; value: Expression }[];
}

/**
 * Create AST node helper
 */
export function createNode<T extends ASTNode>(
    type: T['type'],
    line: number,
    column: number,
    props: Omit<T, 'type' | 'line' | 'column'>
): T {
    return {
        type,
        line,
        column,
        ...props,
    } as T;
}
