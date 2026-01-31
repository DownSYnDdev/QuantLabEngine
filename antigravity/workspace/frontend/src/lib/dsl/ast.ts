/**
 * AST Node Types for the DSL
 */

export type ASTNodeType =
    | 'Program'
    | 'IndicatorDecl'
    | 'OnBarBlock'
    | 'VariableDecl'
    | 'Assignment'
    | 'IfStatement'
    | 'ReturnStatement'
    | 'BinaryExpr'
    | 'UnaryExpr'
    | 'CallExpr'
    | 'MemberExpr'
    | 'Identifier'
    | 'NumberLiteral'
    | 'StringLiteral'
    | 'BooleanLiteral'
    | 'ArrayLiteral';

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
    | OnBarBlock
    | VariableDecl
    | Assignment
    | IfStatement
    | ReturnStatement
    | ExpressionStatement;

/**
 * Expression statement (expression as statement)
 */
export interface ExpressionStatement extends ASTNode {
    type: 'VariableDecl'; // Reusing for expression statements
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
 * on_bar block
 * on_bar(symbol) { ... }
 */
export interface OnBarBlock extends ASTNode {
    type: 'OnBarBlock';
    symbol: string;
    body: Statement[];
}

/**
 * Variable declaration
 * sma_val = sma(close, 20)
 */
export interface VariableDecl extends ASTNode {
    type: 'VariableDecl';
    name: string;
    value: Expression;
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
 * If statement
 */
export interface IfStatement extends ASTNode {
    type: 'IfStatement';
    condition: Expression;
    consequent: Statement[];
    alternate?: Statement[];
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
    | Identifier
    | NumberLiteral
    | StringLiteral
    | BooleanLiteral
    | ArrayLiteral;

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
 * Member access
 * bar.close, series[0]
 */
export interface MemberExpr extends ASTNode {
    type: 'MemberExpr';
    object: Expression;
    property: Expression;
    computed: boolean; // true for [], false for .
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
