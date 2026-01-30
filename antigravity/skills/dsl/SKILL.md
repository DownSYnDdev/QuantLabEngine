---
name: dsl
description: Custom DSL / Scripting Engine Development for Quantlab.
---

# Skill: DSL / Scripting Engine Development

## Overview
Designs and implements a custom domain-specific language (DSL) for financial indicators, algorithmic trading strategies, and backtesting in Quantlab. This skill provides concrete implementation strategies rather than just API definitions.

## 🎯 Capabilities

### 1. Grammar & Parsing (ANTLR4)
- **Grammar Definition**: Define syntax in `.g4` files (lexer/parser).
- **AST Generation**: Transform parse trees into a typed Abstract Syntax Tree.
- **Error Handling**: Custom error listeners for user-friendly syntax errors.

### 2. Execution Engine
- **Interpreter**: Tree-walking or bytecode interpreter for strategy execution.
- **Sandboxing**: Restricted environment to prevent unauthorized system access.
- **Resource Limits**: CPU/Memory quotas to prevent infinite loops.

### 3. Financial Primitives
- **Series Handling**: Native support for OHLCV time-series data.
- **Indicators**: Built-in functions for SMA, EMA, RSI, etc.
- **Order Management**: Syntax for `buy()`, `sell()`, `close()`.

## 🛠 implementation Steps

### Phase 1: Grammar Design
Define the grammar in `grammar/Quantlab.g4`:
```antlr
grammar Quantlab;
strategy: statement+;
statement: assignment | functionCall | ifBlock;
assignment: ID '=' expression ';';
// ...
```

### Phase 2: Parser Generation
Use `antlr4ts` or Python `antlr4-python3-runtime` to generate lexer/parser.
`antlr4 -Dlanguage=Python3 -visitor -no-listener grammar/Quantlab.g4`

### Phase 3: Runtime
Implement the `StrategyContext` class that holds:
- `MarketData`: Access to historical/real-time bars.
- `Portfolio`: Current holdings and cash.
- `Broker`: Interface to execute orders.

## 🧪 Testing
- **Unit Tests**: Test individual grammar rules.
- **Integration Tests**: Run full strategies against known mock data.
- **Fuzz Testing**: Feed random strings to ensuring parser robustness.

## 📚 References
- [ANTLR4 Mega Tutorial](https://github.com/antlr/antlr4/blob/master/doc/index.md)
- [Building a Custom Scripting Language](https://craftinginterpreters.com/)
