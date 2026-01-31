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

        // on_bar(symbol) { ... }
        if (this.checkKeyword('on_bar')) {
            return this.parseOnBarBlock();
        }

        // if condition { ... }
        if (this.checkKeyword('if')) {
            return this.parseIfStatement();
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

        const body: Statement[] = [];

        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            if (this.check(TokenType.NEWLINE)) {
                this.advance();
                continue;
            }
            const stmt = this.parseStatement();
            if (stmt) body.push(stmt);
        }

        this.consume(TokenType.RBRACE, "Expected '}' to end block");

        return {
            type: 'OnBarBlock',
            symbol: String(symbolToken.value),
            body,
            line: token.line,
            column: token.column,
        };
    }

    private parseIfStatement(): IfStatement {
        const token = this.advance(); // consume 'if'
        const condition = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{' after condition");

        const consequent: Statement[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            if (this.check(TokenType.NEWLINE)) {
                this.advance();
                continue;
            }
            const stmt = this.parseStatement();
            if (stmt) consequent.push(stmt);
        }

        this.consume(TokenType.RBRACE, "Expected '}'");

        let alternate: Statement[] | undefined;
        if (this.checkKeyword('else')) {
            this.advance();
            this.consume(TokenType.LBRACE, "Expected '{' after 'else'");
            alternate = [];
            while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
                if (this.check(TokenType.NEWLINE)) {
                    this.advance();
                    continue;
                }
                const stmt = this.parseStatement();
                if (stmt) alternate.push(stmt);
            }
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

    private parseAssignmentOrExpression(): VariableDecl {
        const nameToken = this.advance();
        const name = String(nameToken.value);

        this.consume(TokenType.ASSIGN, "Expected '=' after identifier");
        const value = this.parseExpression();

        return {
            type: 'VariableDecl',
            name,
            value,
            line: nameToken.line,
            column: nameToken.column,
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

        while (this.check(TokenType.LPAREN)) {
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
