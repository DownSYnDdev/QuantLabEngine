/**
 * DSL Parser
 * Converts token stream into an AST
 */

import { Token, TokenType, tokenize } from './tokenizer';
import {
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

/**
 * Parser error
 */
export class ParserError extends Error {
    constructor(
        message: string,
        public token: Token
    ) {
        super(`[Line ${token.line}:${token.column}] ${message}`);
        this.name = 'ParserError';
    }
}

/**
 * DSL Parser class
 * Recursive descent parser
 */
export class Parser {
    private tokens: Token[];
    private position: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    /**
     * Parse tokens into AST
     */
    parse(): Program {
        const body: Statement[] = [];
        let indicatorName: string | undefined;

        while (!this.isAtEnd()) {
            // Skip newlines at top level
            if (this.check(TokenType.NEWLINE)) {
                this.advance();
                continue;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                if (stmt.type === 'IndicatorDecl') {
                    indicatorName = (stmt as IndicatorDecl).name;
                }
                body.push(stmt);
            }
        }

        return {
            type: 'Program',
            body,
            indicatorName,
            line: 1,
            column: 1,
        };
    }

    // Token helpers
    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.position];
    }

    private previous(): Token {
        return this.tokens[this.position - 1];
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.position++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private checkKeyword(keyword: string): boolean {
        return this.check(TokenType.KEYWORD) && this.peek().value === keyword;
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new ParserError(message, this.peek());
    }

    // Statement parsing
    private parseStatement(): Statement | null {
        // indicator("name")
        if (this.checkKeyword('indicator')) {
            return this.parseIndicatorDecl();
        }

        // fn name(params) { ... }
        if (this.checkKeyword('fn')) {
            return this.parseFunctionDecl();
        }

        // Event handlers
        if (this.checkKeyword('on_bar')) {
            return this.parseOnBarBlock();
        }
        if (this.checkKeyword('on_tick')) {
            return this.parseOnTickBlock();
        }
        if (this.checkKeyword('on_start')) {
            return this.parseOnStartBlock();
        }
        if (this.checkKeyword('on_end')) {
            return this.parseOnEndBlock();
        }
        if (this.checkKeyword('on_order_fill')) {
            return this.parseOnOrderFillBlock();
        }
        if (this.checkKeyword('on_position_change')) {
            return this.parseOnPositionChangeBlock();
        }

        // Control flow
        if (this.checkKeyword('if')) {
            return this.parseIfStatement();
        }
        if (this.checkKeyword('for')) {
            return this.parseForStatement();
        }
        if (this.checkKeyword('while')) {
            return this.parseWhileStatement();
        }
        if (this.checkKeyword('break')) {
            return this.parseBreakStatement();
        }
        if (this.checkKeyword('continue')) {
            return this.parseContinueStatement();
        }
        if (this.checkKeyword('return')) {
            return this.parseReturnStatement();
        }

        // Variable declarations
        if (this.checkKeyword('let') || this.checkKeyword('const')) {
            return this.parseVariableDecl();
        }

        // Variable assignment or expression
        if (this.check(TokenType.IDENTIFIER)) {
            return this.parseAssignmentOrExpression();
        }

        // Skip unknown tokens
        this.advance();
        return null;
    }

    private parseIndicatorDecl(): IndicatorDecl {
        const token = this.advance(); // consume 'indicator'
        this.consume(TokenType.LPAREN, "Expected '(' after 'indicator'");
        const nameToken = this.consume(TokenType.STRING, "Expected indicator name string");
        this.consume(TokenType.RPAREN, "Expected ')' after indicator name");

        return {
            type: 'IndicatorDecl',
            name: String(nameToken.value),
            line: token.line,
            column: token.column,
        };
    }

    private parseOnBarBlock(): OnBarBlock {
        const token = this.advance(); // consume 'on_bar'
        this.consume(TokenType.LPAREN, "Expected '(' after 'on_bar'");
        const symbolToken = this.consume(TokenType.IDENTIFIER, "Expected symbol parameter");
        this.consume(TokenType.RPAREN, "Expected ')' after parameter");
        this.consume(TokenType.LBRACE, "Expected '{' to start block");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnBarBlock',
            symbol: String(symbolToken.value),
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseOnTickBlock(): OnTickBlock {
        const token = this.advance(); // consume 'on_tick'
        this.consume(TokenType.LPAREN, "Expected '(' after 'on_tick'");
        const symbolToken = this.consume(TokenType.IDENTIFIER, "Expected symbol parameter");
        this.consume(TokenType.RPAREN, "Expected ')' after parameter");
        this.consume(TokenType.LBRACE, "Expected '{' to start block");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnTickBlock',
            symbol: String(symbolToken.value),
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseOnStartBlock(): OnStartBlock {
        const token = this.advance(); // consume 'on_start'
        this.consume(TokenType.LPAREN, "Expected '(' after 'on_start'");
        this.consume(TokenType.RPAREN, "Expected ')' after 'on_start('");
        this.consume(TokenType.LBRACE, "Expected '{' to start block");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnStartBlock',
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseOnEndBlock(): OnEndBlock {
        const token = this.advance(); // consume 'on_end'
        this.consume(TokenType.LPAREN, "Expected '(' after 'on_end'");
        this.consume(TokenType.RPAREN, "Expected ')' after 'on_end('");
        this.consume(TokenType.LBRACE, "Expected '{' to start block");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnEndBlock',
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseOnOrderFillBlock(): OnOrderFillBlock {
        const token = this.advance(); // consume 'on_order_fill'
        this.consume(TokenType.LPAREN, "Expected '(' after 'on_order_fill'");
        const orderParam = this.consume(TokenType.IDENTIFIER, "Expected order parameter");
        this.consume(TokenType.RPAREN, "Expected ')' after parameter");
        this.consume(TokenType.LBRACE, "Expected '{' to start block");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnOrderFillBlock',
            orderParam: String(orderParam.value),
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseOnPositionChangeBlock(): OnPositionChangeBlock {
        const token = this.advance(); // consume 'on_position_change'
        this.consume(TokenType.LPAREN, "Expected '(' after 'on_position_change'");
        const positionParam = this.consume(TokenType.IDENTIFIER, "Expected position parameter");
        this.consume(TokenType.RPAREN, "Expected ')' after parameter");
        this.consume(TokenType.LBRACE, "Expected '{' to start block");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnPositionChangeBlock',
            positionParam: String(positionParam.value),
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseFunctionDecl(): FunctionDecl {
        const token = this.advance(); // consume 'fn'
        const nameToken = this.consume(TokenType.IDENTIFIER, "Expected function name");
        this.consume(TokenType.LPAREN, "Expected '(' after function name");

        const params: string[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                const param = this.consume(TokenType.IDENTIFIER, "Expected parameter name");
                params.push(String(param.value));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expected ')' after parameters");
        this.consume(TokenType.LBRACE, "Expected '{' to start function body");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end function body");

        return {
            type: 'FunctionDecl',
            name: String(nameToken.value),
            params,
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseForStatement(): ForStatement {
        const token = this.advance(); // consume 'for'
        const iterator = this.consume(TokenType.IDENTIFIER, "Expected iterator variable");

        if (!this.checkKeyword('in')) {
            throw new ParserError("Expected 'in' after iterator", this.peek());
        }
        this.advance(); // consume 'in'

        const iterable = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{' to start for body");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end for body");

        return {
            type: 'ForStatement',
            iterator: String(iterator.value),
            iterable,
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseWhileStatement(): WhileStatement {
        const token = this.advance(); // consume 'while'
        const condition = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{' to start while body");

        const body = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}' to end while body");

        return {
            type: 'WhileStatement',
            condition,
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseBreakStatement(): BreakStatement {
        const token = this.advance(); // consume 'break'
        return {
            type: 'BreakStatement',
            line: token.line,
            column: token.column,
        };
    }

    private parseContinueStatement(): ContinueStatement {
        const token = this.advance(); // consume 'continue'
        return {
            type: 'ContinueStatement',
            line: token.line,
            column: token.column,
        };
    }

    private parseReturnStatement(): ReturnStatement {
        const token = this.advance(); // consume 'return'

        // Check if there's a value (not newline, not }, not EOF)
        let value: Expression | undefined;
        if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            value = this.parseExpression();
        }

        return {
            type: 'ReturnStatement',
            value,
            line: token.line,
            column: token.column,
        };
    }

    private parseVariableDecl(): VariableDecl {
        const token = this.advance(); // consume 'let' or 'const'
        const isConst = token.value === 'const';
        const nameToken = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        this.consume(TokenType.ASSIGN, "Expected '=' after variable name");
        const value = this.parseExpression();

        return {
            type: 'VariableDecl',
            name: String(nameToken.value),
            value,
            isConst,
            line: token.line,
            column: token.column,
        };
    }

    private parseBlockBody(): Statement[] {
        const body: Statement[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            if (this.check(TokenType.NEWLINE)) {
                this.advance();
                continue;
            }
            const stmt = this.parseStatement();
            if (stmt) body.push(stmt);
        }
        return body;
    }

    private parseIfStatement(): IfStatement {
        const token = this.advance(); // consume 'if'
        const condition = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{' after condition");

        const consequent = this.parseBlockBody();
        this.consume(TokenType.RBRACE, "Expected '}'");

        let alternate: Statement[] | undefined;
        if (this.checkKeyword('else')) {
            this.advance();
            this.consume(TokenType.LBRACE, "Expected '{' after 'else'");
            alternate = this.parseBlockBody();
            this.consume(TokenType.RBRACE, "Expected '}'");
        }

        return {
            type: 'IfStatement',
            condition,
            consequent,
            alternate,
            line: token.line,
            column: token.column,
        };
    }

    private parseAssignmentOrExpression(): Statement {
        // We need to handle:
        // 1. Assignment: x = ...
        // 2. Compound Assignment: x += ...
        // 3. Expression Statement: x() or obj.method()
        // Note: The caller (parseStatement) already peeked IDENTIFIER.

        // We cannot simply consume valid identifier here because if it is a method call or whatever,
        // we might need it for the expression.

        // Let's Lookahead.
        // Current: Identifier. Next: ?
        // If we advance, we get the name.
        const nameToken = this.advance();
        const name = String(nameToken.value);

        // Check for compound assignments
        if (this.match(TokenType.PLUS_ASSIGN)) {
            const value = this.parseExpression();
            return {
                type: 'CompoundAssignment',
                operator: '+=',
                name,
                value,
                line: nameToken.line,
                column: nameToken.column,
            };
        }
        if (this.match(TokenType.MINUS_ASSIGN)) {
            const value = this.parseExpression();
            return {
                type: 'CompoundAssignment',
                operator: '-=',
                name,
                value,
                line: nameToken.line,
                column: nameToken.column,
            };
        }
        if (this.match(TokenType.MUL_ASSIGN)) {
            const value = this.parseExpression();
            return {
                type: 'CompoundAssignment',
                operator: '*=',
                name,
                value,
                line: nameToken.line,
                column: nameToken.column,
            };
        }
        if (this.match(TokenType.DIV_ASSIGN)) {
            const value = this.parseExpression();
            return {
                type: 'CompoundAssignment',
                operator: '/=',
                name,
                value,
                line: nameToken.line,
                column: nameToken.column,
            };
        }

        // Regular assignment
        if (this.match(TokenType.ASSIGN)) {
            const value = this.parseExpression();
            return {
                type: 'Assignment',
                name,
                value,
                line: nameToken.line,
                column: nameToken.column,
            };
        }

        // Not an assignment. Must be an expression statement starting with this identifier.
        // Reconstruct the Identifier expression
        const identifierExpr: Identifier = {
            type: 'Identifier',
            name: name,
            line: nameToken.line,
            column: nameToken.column
        };

        // Continue parsing as a call, member access, etc.
        const expr = this.finishCall(identifierExpr);

        return {
            type: 'ExpressionStatement',
            expression: expr,
            line: nameToken.line,
            column: nameToken.column
        };
    }

    // Expression parsing (precedence climbing)
    private parseExpression(): Expression {
        return this.parseOr();
    }

    private parseOr(): Expression {
        let left = this.parseAnd();

        while (this.match(TokenType.OR) || this.checkKeyword('or')) {
            if (this.checkKeyword('or')) this.advance();
            const operator = '||';
            const right = this.parseAnd();
            left = {
                type: 'BinaryExpr',
                operator,
                left,
                right,
                line: left.line,
                column: left.column,
            } as BinaryExpr;
        }

        return left;
    }

    private parseAnd(): Expression {
        let left = this.parseEquality();

        while (this.match(TokenType.AND) || this.checkKeyword('and')) {
            if (this.checkKeyword('and')) this.advance();
            const operator = '&&';
            const right = this.parseEquality();
            left = {
                type: 'BinaryExpr',
                operator,
                left,
                right,
                line: left.line,
                column: left.column,
            } as BinaryExpr;
        }

        return left;
    }

    private parseEquality(): Expression {
        let left = this.parseComparison();

        while (this.match(TokenType.EQ, TokenType.NE)) {
            const operator = this.previous().type === TokenType.EQ ? '==' : '!=';
            const right = this.parseComparison();
            left = {
                type: 'BinaryExpr',
                operator,
                left,
                right,
                line: left.line,
                column: left.column,
            } as BinaryExpr;
        }

        return left;
    }

    private parseComparison(): Expression {
        let left = this.parseAdditive();

        while (this.match(TokenType.LT, TokenType.GT, TokenType.LE, TokenType.GE)) {
            let operator: string;
            switch (this.previous().type) {
                case TokenType.LT: operator = '<'; break;
                case TokenType.GT: operator = '>'; break;
                case TokenType.LE: operator = '<='; break;
                case TokenType.GE: operator = '>='; break;
                default: operator = '<';
            }
            const right = this.parseAdditive();
            left = {
                type: 'BinaryExpr',
                operator,
                left,
                right,
                line: left.line,
                column: left.column,
            } as BinaryExpr;
        }

        return left;
    }

    private parseAdditive(): Expression {
        let left = this.parseMultiplicative();

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().type === TokenType.PLUS ? '+' : '-';
            const right = this.parseMultiplicative();
            left = {
                type: 'BinaryExpr',
                operator,
                left,
                right,
                line: left.line,
                column: left.column,
            } as BinaryExpr;
        }

        return left;
    }

    private parseMultiplicative(): Expression {
        let left = this.parseUnary();

        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
            let operator: string;
            switch (this.previous().type) {
                case TokenType.MULTIPLY: operator = '*'; break;
                case TokenType.DIVIDE: operator = '/'; break;
                case TokenType.MODULO: operator = '%'; break;
                default: operator = '*';
            }
            const right = this.parseUnary();
            left = {
                type: 'BinaryExpr',
                operator,
                left,
                right,
                line: left.line,
                column: left.column,
            } as BinaryExpr;
        }

        return left;
    }

    private parseUnary(): Expression {
        if (this.match(TokenType.NOT, TokenType.MINUS) || this.checkKeyword('not')) {
            if (this.checkKeyword('not')) this.advance();
            const operator = this.previous().type === TokenType.MINUS ? '-' : '!';
            const operand = this.parseUnary();
            return {
                type: 'UnaryExpr',
                operator,
                operand,
                line: this.previous().line,
                column: this.previous().column,
            } as UnaryExpr;
        }

        return this.parseCall();
    }

    private parseCall(): Expression {
        let expr = this.parsePrimary();
        return this.finishCall(expr);
    }

    private finishCall(expr: Expression): Expression {
        while (true) {
            if (this.check(TokenType.LPAREN)) {
                this.advance();
                const args: Expression[] = [];

                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(TokenType.COMMA));
                }

                this.consume(TokenType.RPAREN, "Expected ')' after arguments");

                expr = {
                    type: 'CallExpr',
                    callee: (expr as Identifier).name,
                    arguments: args,
                    line: expr.line,
                    column: expr.column,
                } as CallExpr;
            } else if (this.match(TokenType.DOT)) {
                // Member access: obj.property
                const propToken = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'");
                expr = {
                    type: 'MemberExpr',
                    object: expr,
                    property: String(propToken.value),
                    line: expr.line,
                    column: expr.column,
                } as MemberExpr;
            } else if (this.match(TokenType.LBRACKET)) {
                // Index access: arr[index] or dict["key"]
                const index = this.parseExpression();
                this.consume(TokenType.RBRACKET, "Expected ']' after index");
                expr = {
                    type: 'IndexExpr',
                    object: expr,
                    index,
                    line: expr.line,
                    column: expr.column,
                } as IndexExpr;
            } else {
                break;
            }
        }

        return expr;
    }

    private parsePrimary(): Expression {
        const token = this.peek();

        // Number
        if (this.match(TokenType.NUMBER)) {
            return {
                type: 'NumberLiteral',
                value: this.previous().value as number,
                line: token.line,
                column: token.column,
            } as NumberLiteral;
        }

        // String
        if (this.match(TokenType.STRING)) {
            return {
                type: 'StringLiteral',
                value: this.previous().value as string,
                line: token.line,
                column: token.column,
            } as StringLiteral;
        }

        // Boolean
        if (this.checkKeyword('true')) {
            this.advance();
            return {
                type: 'BooleanLiteral',
                value: true,
                line: token.line,
                column: token.column,
            } as BooleanLiteral;
        }
        if (this.checkKeyword('false')) {
            this.advance();
            return {
                type: 'BooleanLiteral',
                value: false,
                line: token.line,
                column: token.column,
            } as BooleanLiteral;
        }

        // Array literal: [1, 2, 3]
        if (this.match(TokenType.LBRACKET)) {
            const elements: Expression[] = [];
            if (!this.check(TokenType.RBRACKET)) {
                do {
                    elements.push(this.parseExpression());
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RBRACKET, "Expected ']' after array elements");
            return {
                type: 'ArrayLiteral',
                elements,
                line: token.line,
                column: token.column,
            } as ArrayLiteral;
        }

        // Dictionary literal: { key: value }
        if (this.match(TokenType.LBRACE)) {
            const entries: { key: string | Expression; value: Expression }[] = [];
            if (!this.check(TokenType.RBRACE)) {
                do {
                    // Skip newlines inside dict
                    while (this.check(TokenType.NEWLINE)) this.advance();

                    let key: string | Expression;
                    if (this.check(TokenType.STRING)) {
                        key = this.parseExpression();
                    } else if (this.check(TokenType.IDENTIFIER)) {
                        key = String(this.advance().value);
                    } else {
                        throw new ParserError("Expected string or identifier as dictionary key", this.peek());
                    }

                    this.consume(TokenType.COLON, "Expected ':' after dictionary key");
                    const value = this.parseExpression();
                    entries.push({ key, value });

                    // Skip newlines after value
                    while (this.check(TokenType.NEWLINE)) this.advance();
                } while (this.match(TokenType.COMMA));
            }
            this.consume(TokenType.RBRACE, "Expected '}' after dictionary entries");
            return {
                type: 'DictLiteral',
                entries,
                line: token.line,
                column: token.column,
            } as DictLiteral;
        }

        // Built-in function keywords
        if (this.check(TokenType.KEYWORD)) {
            const keyword = this.advance();
            return {
                type: 'Identifier',
                name: String(keyword.value),
                line: token.line,
                column: token.column,
            } as Identifier;
        }

        // Identifier
        if (this.match(TokenType.IDENTIFIER)) {
            return {
                type: 'Identifier',
                name: this.previous().value as string,
                line: token.line,
                column: token.column,
            } as Identifier;
        }

        // Parenthesized expression
        if (this.match(TokenType.LPAREN)) {
            const expr = this.parseExpression();
            this.consume(TokenType.RPAREN, "Expected ')'");
            return expr;
        }

        throw new ParserError(`Unexpected token: ${token.type}`, token);
    }
}

/**
 * Parse DSL source code into AST
 */
export function parse(source: string): Program {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    return parser.parse();
}
