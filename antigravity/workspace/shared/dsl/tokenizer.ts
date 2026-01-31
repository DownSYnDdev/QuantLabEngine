/**
 * DSL Token Types
 */
export enum TokenType {
    // Literals
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    IDENTIFIER = 'IDENTIFIER',

    // Keywords
    KEYWORD = 'KEYWORD',

    // Operators
    PLUS = 'PLUS',           // +
    MINUS = 'MINUS',         // -
    MULTIPLY = 'MULTIPLY',   // *
    DIVIDE = 'DIVIDE',       // /
    MODULO = 'MODULO',       // %
    POWER = 'POWER',         // ^

    // Comparison
    EQ = 'EQ',               // ==
    NE = 'NE',               // !=
    LT = 'LT',               // <
    GT = 'GT',               // >
    LE = 'LE',               // <=
    GE = 'GE',               // >=

    // Logical
    AND = 'AND',             // &&
    OR = 'OR',               // ||
    NOT = 'NOT',             // !

    // Assignment
    ASSIGN = 'ASSIGN',       // =
    PLUS_ASSIGN = 'PLUS_ASSIGN',   // +=
    MINUS_ASSIGN = 'MINUS_ASSIGN', // -=
    MUL_ASSIGN = 'MUL_ASSIGN',     // *=
    DIV_ASSIGN = 'DIV_ASSIGN',     // /=
    INCREMENT = 'INCREMENT',       // ++
    DECREMENT = 'DECREMENT',       // --

    // Punctuation
    LPAREN = 'LPAREN',       // (
    RPAREN = 'RPAREN',       // )
    LBRACE = 'LBRACE',       // {
    RBRACE = 'RBRACE',       // }
    LBRACKET = 'LBRACKET',   // [
    RBRACKET = 'RBRACKET',   // ]
    COMMA = 'COMMA',         // ,
    DOT = 'DOT',             // .
    COLON = 'COLON',         // :
    SEMICOLON = 'SEMICOLON', // ;
    NEWLINE = 'NEWLINE',     // \n

    // Special
    EOF = 'EOF',
    COMMENT = 'COMMENT',
}

/**
 * DSL Keywords
 */
export const KEYWORDS = new Set([
    // Declarations
    'indicator',
    'fn',
    'let',
    'const',
    // Control flow
    'if',
    'else',
    'for',
    'while',
    'break',
    'continue',
    'return',
    'in',
    // Event handlers
    'on_bar',
    'on_tick',
    'on_start',
    'on_end',
    'on_order_fill',
    'on_position_change',
    // Literals
    'true',
    'false',
    'null',
    // Logical operators
    'and',
    'or',
    'not',
    // Built-in indicators
    'sma',
    'ema',
    'rsi',
    'macd',
    'bbands',
    'atr',
    // Built-in functions
    'plot',
    'plotBand',
    'plotHistogram',
    'signal',
    'crossover',
    'crossunder',
    'shift',
    'diff',
    'avg',
    'range',
    'symbols',
    'debug',
    'inspect',
]);

/**
 * Token representation
 */
export interface Token {
    type: TokenType;
    value: string | number;
    line: number;
    column: number;
}

/**
 * Tokenizer error
 */
export class TokenizerError extends Error {
    constructor(
        message: string,
        public line: number,
        public column: number
    ) {
        super(`[Line ${line}:${column}] ${message}`);
        this.name = 'TokenizerError';
    }
}

/**
 * DSL Tokenizer
 * Converts source code into a stream of tokens
 */
export class Tokenizer {
    private source: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private tokens: Token[] = [];

    constructor(source: string) {
        this.source = source;
    }

    /**
     * Tokenize the entire source
     */
    tokenize(): Token[] {
        while (!this.isAtEnd()) {
            this.scanToken();
        }

        this.tokens.push({
            type: TokenType.EOF,
            value: '',
            line: this.line,
            column: this.column,
        });

        return this.tokens;
    }

    private isAtEnd(): boolean {
        return this.position >= this.source.length;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source[this.position];
    }

    private peekNext(): string {
        if (this.position + 1 >= this.source.length) return '\0';
        return this.source[this.position + 1];
    }

    private advance(): string {
        const char = this.source[this.position++];
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    private addToken(type: TokenType, value: string | number = ''): void {
        this.tokens.push({
            type,
            value,
            line: this.line,
            column: this.column,
        });
    }

    private scanToken(): void {
        const char = this.advance();

        switch (char) {
            // Single-character tokens
            case '(': this.addToken(TokenType.LPAREN); break;
            case ')': this.addToken(TokenType.RPAREN); break;
            case '{': this.addToken(TokenType.LBRACE); break;
            case '}': this.addToken(TokenType.RBRACE); break;
            case '[': this.addToken(TokenType.LBRACKET); break;
            case ']': this.addToken(TokenType.RBRACKET); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case ':': this.addToken(TokenType.COLON); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '+':
                if (this.peek() === '+') {
                    this.advance();
                    this.addToken(TokenType.INCREMENT);
                } else if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.PLUS_ASSIGN);
                } else {
                    this.addToken(TokenType.PLUS);
                }
                break;
            case '-':
                if (this.peek() === '-') {
                    this.advance();
                    this.addToken(TokenType.DECREMENT);
                } else if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.MINUS_ASSIGN);
                } else {
                    this.addToken(TokenType.MINUS);
                }
                break;
            case '*':
                if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.MUL_ASSIGN);
                } else {
                    this.addToken(TokenType.MULTIPLY);
                }
                break;
            case '^': this.addToken(TokenType.POWER); break;
            case '%': this.addToken(TokenType.MODULO); break;

            // Two-character tokens
            case '=':
                if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.EQ);
                } else {
                    this.addToken(TokenType.ASSIGN);
                }
                break;
            case '!':
                if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.NE);
                } else {
                    this.addToken(TokenType.NOT);
                }
                break;
            case '<':
                if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.LE);
                } else {
                    this.addToken(TokenType.LT);
                }
                break;
            case '>':
                if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.GE);
                } else {
                    this.addToken(TokenType.GT);
                }
                break;
            case '&':
                if (this.peek() === '&') {
                    this.advance();
                    this.addToken(TokenType.AND);
                }
                break;
            case '|':
                if (this.peek() === '|') {
                    this.advance();
                    this.addToken(TokenType.OR);
                }
                break;

            // Comments and division
            case '/':
                if (this.peek() === '/') {
                    // Single-line comment
                    while (this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else if (this.peek() === '=') {
                    this.advance();
                    this.addToken(TokenType.DIV_ASSIGN);
                } else {
                    this.addToken(TokenType.DIVIDE);
                }
                break;

            // Whitespace
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;
            case '\n':
                this.addToken(TokenType.NEWLINE);
                break;

            // String literals
            case '"':
            case "'":
                this.scanString(char);
                break;

            default:
                if (this.isDigit(char)) {
                    this.scanNumber(char);
                } else if (this.isAlpha(char)) {
                    this.scanIdentifier(char);
                } else {
                    throw new TokenizerError(`Unexpected character: ${char}`, this.line, this.column);
                }
        }
    }

    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    private isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            char === '_';
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }

    private scanNumber(firstChar: string): void {
        let value = firstChar;

        while (this.isDigit(this.peek())) {
            value += this.advance();
        }

        // Look for decimal
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            value += this.advance(); // consume '.'
            while (this.isDigit(this.peek())) {
                value += this.advance();
            }
        }

        this.addToken(TokenType.NUMBER, parseFloat(value));
    }

    private scanString(quote: string): void {
        let value = '';

        while (this.peek() !== quote && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                throw new TokenizerError('Unterminated string', this.line, this.column);
            }
            value += this.advance();
        }

        if (this.isAtEnd()) {
            throw new TokenizerError('Unterminated string', this.line, this.column);
        }

        this.advance(); // closing quote
        this.addToken(TokenType.STRING, value);
    }

    private scanIdentifier(firstChar: string): void {
        let value = firstChar;

        while (this.isAlphaNumeric(this.peek())) {
            value += this.advance();
        }

        // Check if keyword
        if (KEYWORDS.has(value.toLowerCase())) {
            this.addToken(TokenType.KEYWORD, value.toLowerCase());
        } else {
            this.addToken(TokenType.IDENTIFIER, value);
        }
    }
}

/**
 * Tokenize DSL source code
 */
export function tokenize(source: string): Token[] {
    const tokenizer = new Tokenizer(source);
    return tokenizer.tokenize();
}
