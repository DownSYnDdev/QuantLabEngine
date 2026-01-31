/**
 * QuantLab DSL - Domain Specific Language for Trading Strategies
 * 
 * This module provides:
 * - Tokenizer: Lexical analysis
 * - Parser: Syntax analysis / AST generation
 * - Interpreter: AST execution with indicator computation
 */

// Core functions
export { tokenize, Tokenizer, TokenType, TokenizerError, KEYWORDS } from './tokenizer';
export type { Token } from './tokenizer';

export { parse, Parser, ParserError } from './parser';

export { interpret, Interpreter, InterpreterError } from './interpreter';
export type { OHLCVBar, OverlayData, InterpreterResult } from './interpreter';

// Re-export AST types
export type {
    ASTNode,
    ASTNodeType,
    Program,
    Statement,
    Expression,
    IndicatorDecl,
    FunctionDecl,
    OnBarBlock,
    OnTickBlock,
    OnStartBlock,
    OnEndBlock,
    OnOrderFillBlock,
    OnPositionChangeBlock,
    VariableDecl,
    Assignment,
    CompoundAssignment,
    IfStatement,
    ForStatement,
    WhileStatement,
    BreakStatement,
    ContinueStatement,
    ReturnStatement,
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
