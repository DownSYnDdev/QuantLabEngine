# ANTLR Grammar: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 56 curated sources including ANTLR documentation, grammar examples, and parser generator tutorials. Full report available at: https://notebooklm.google.com/notebook/f9a8b7c6-d5e4-3f2a-1b0c-9d8e7f6a5b4c

---

## Key Concepts
- **Parser Generator**: Generate parsers from grammar definitions
- **LL(*) Parsing**: Adaptive LL parsing with unlimited lookahead
- **Target Languages**: Java, C#, Python, JavaScript, Go, C++, Swift
- **Lexer & Parser**: Separate lexical and syntactic analysis
- **Parse Trees**: Automatic generation of concrete syntax trees
- **Visitors & Listeners**: Two patterns for tree traversal
- **Error Recovery**: Built-in error handling and recovery

---

## API Reference (If Applicable)

### Grammar File Structure (.g4)
```antlr
grammar TradingDSL;

// Parser rules (lowercase)
script: statement+ EOF;

statement
    : declaration
    | assignment
    | ifStatement
    | plotStatement
    ;

declaration: type ID '=' expression ';';
assignment: ID '=' expression ';';

expression
    : expression op=('*'|'/') expression     # MulDiv
    | expression op=('+'|'-') expression     # AddSub
    | functionCall                           # FuncCall
    | ID                                      # Identifier
    | NUMBER                                  # Number
    | '(' expression ')'                      # Parens
    ;

functionCall: ID '(' (expression (',' expression)*)? ')';

// Lexer rules (uppercase)
NUMBER: [0-9]+ ('.' [0-9]+)?;
ID: [a-zA-Z_][a-zA-Z0-9_]*;
WS: [ \t\r\n]+ -> skip;
```

### JavaScript Runtime Usage
```bash
npm install antlr4
```

```javascript
import antlr4 from 'antlr4';
import TradingDSLLexer from './TradingDSLLexer.js';
import TradingDSLParser from './TradingDSLParser.js';
import TradingDSLVisitor from './TradingDSLVisitor.js';

// Parse source code
function parse(sourceCode) {
  const chars = new antlr4.InputStream(sourceCode);
  const lexer = new TradingDSLLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new TradingDSLParser(tokens);
  
  const tree = parser.script(); // Entry rule
  return tree;
}
```

### Visitor Pattern
```javascript
class Interpreter extends TradingDSLVisitor {
  visitDeclaration(ctx) {
    const type = ctx.type().getText();
    const name = ctx.ID().getText();
    const value = this.visit(ctx.expression());
    
    this.symbolTable[name] = { type, value };
    return value;
  }
  
  visitAddSub(ctx) {
    const left = this.visit(ctx.expression(0));
    const right = this.visit(ctx.expression(1));
    const op = ctx.op.text;
    
    return op === '+' ? left + right : left - right;
  }
  
  visitFunctionCall(ctx) {
    const funcName = ctx.ID().getText();
    const args = ctx.expression().map(expr => this.visit(expr));
    
    return this.functions[funcName](...args);
  }
}
```

---

## Usage Patterns

### Building Trading DSL Grammar
```antlr
grammar PineScript;

script: version? (declaration | statement)* EOF;

version: '//@version=' NUMBER;

declaration
    : indicatorDecl
    | strategyDecl
    | inputDecl
    | variableDecl
    ;

indicatorDecl: 'indicator' '(' STRING (',' property)* ')';
inputDecl: ID '=' 'input' '.' inputType '(' args ')';
variableDecl: ID '=' expression;

statement
    : plotStatement
    | ifStatement
    | strategyStatement
    ;

plotStatement: 'plot' '(' expression (',' property)* ')';

ifStatement: 'if' expression block ('else' block)?;

expression
    : expression '[' NUMBER ']'              # HistoricalRef
    | ID '(' (expression (',' expression)*)? ')'  # FunctionCall
    | expression op=('*'|'/') expression     # MulDiv
    | expression op=('+'|'-') expression     # AddSub
    | expression op=('>'|'<'|'>='|'<='|'=='|'!=') expression # Comparison
    | ID                                      # Variable
    | NUMBER                                  # Number
    | 'close' | 'open' | 'high' | 'low' | 'volume'  # BuiltInVar
    ;

// Lexer
NUMBER: [0-9]+ ('.' [0-9]+)?;
STRING: '"' (~["\r\n])* '"';
ID: [a-zA-Z_][a-zA-Z0-9_]*;
COMMENT: '//' ~[\r\n]* -> skip;
WS: [ \t\r\n]+ -> skip;
```

### Generating Parser
```bash
# Download ANTLR
npm install -g antlr4

# Generate JavaScript parser
antlr4 -Dlanguage=JavaScript TradingDSL.g4

# Outputs:
# - TradingDSLLexer.js
# - TradingDSLParser.js
# - TradingDSLVisitor.js
# - TradingDSLListener.js
```

### Implementing Interpreter
```javascript
class DSLInterpreter extends TradingDSLVisitor {
  constructor() {
    super();
    this.variables = new Map();
    this.indicators = new Map();
  }
  
  visitScript(ctx) {
    // Visit all statements
    for (const stmt of ctx.statement()) {
      this.visit(stmt);
    }
  }
  
  visitVariableDecl(ctx) {
    const name = ctx.ID().getText();
    const value = this.visit(ctx.expression());
    this.variables.set(name, value);
  }
  
  visitPlotStatement(ctx) {
    const series = this.visit(ctx.expression());
    const properties = this.extractProperties(ctx.property());
    
    this.outputs.push({
      type: 'plot',
      data: series,
      ...properties
    });
  }
}
```

---

## Constraints & Notes
- **Build Step Required**: Must generate parsers from .g4 files
- **Bundle Size**: Generated parsers can be large (~100-500KB)
- **Learning Curve**: Grammar syntax takes time to master
- **Left Recursion**: Only direct left recursion is supported
- **Error Messages**: Default messages may not be user-friendly
- **Performance**: Slower than hand-written parsers but sufficient for most DSLs

---

## Examples (Optional)

### Complete Trading DSL Example
```antlr
grammar SimpleDSL;

script: statement+ EOF;

statement
    : ID '=' expression ';'                  # Assignment
    | 'when' expression 'do' action ';'      # Rule
    | 'plot' '(' expression ')' ';'          # Plot
    ;

action
    : 'buy' '(' expression ')'
    | 'sell' '(' expression ')'
    ;

expression
    : expression '>' expression              # Greater
    | expression '<' expression              # Less
    | ID '(' expression (',' expression)* ')'  # FuncCall
    | 'close' | 'open' | 'high' | 'low'      # BuiltIn
    | NUMBER                                  # Number
    | ID                                      # Var
    ;

NUMBER: [0-9]+ ('.' [0-9]+)?;
ID: [a-zA-Z_][a-zA-Z0-9_]*;
WS: [ \t\r\n]+ -> skip;
```

Example DSL code:
```
sma20 = sma(close, 20);
sma50 = sma(close, 50);

when sma20 > sma50 do buy(100);
when sma20 < sma50 do sell(100);

plot(sma20);
plot(sma50);
```

---

## Related Files
- `acornjs.md` - Lightweight JavaScript parser alternative
- `esprima.md` - Another JavaScript parser option
- `pine-script.md` - DSL design inspiration
- `monaco-editor.md` - For syntax highlighting integration

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (56 sources)
