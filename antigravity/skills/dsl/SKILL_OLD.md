---
name: DSL / Scripting Engine Development
description: Designs and implements a custom domain-specific language (DSL) for financial indicators, algorithmic trading strategies, and backtesting.
---

# Skill: DSL / Scripting Engine Development

## Description
This skill designs and implements a custom domain-specific language (DSL) for financial indicators, algorithmic trading strategies, and backtesting. The DSL must support both bar-based and event-driven execution, multi-symbol logic, tick-level simulation, and a fully sandboxed runtime environment. The language should be simple, expressive, secure, and optimized for real-time and historical market data processing.

## Capabilities
- design_language_syntax
- generate_parser
- generate_ast
- implement_interpreter
- sandbox_execution
- design_execution_model
- implement_event_handlers
- implement_order_engine
- implement_backtester
- implement_sandbox_limits
- design_multi_symbol_support
- implement_debugging_tools

## Inputs

### design_language_syntax
- goals (string): High-level purpose of the language.
- examples (array of strings): Sample syntax patterns or desired expressions.

### generate_parser
- grammar (string): Formal grammar definition for the language.

### generate_ast
- grammar (string): Grammar used to generate the AST structure.

### implement_interpreter
- ast_spec (string): AST node definitions.
- execution_rules (string): How each node should behave at runtime.

### sandbox_execution
- code (string): User-submitted DSL code.
- constraints (string): Safety requirements and restrictions.

### design_execution_model
- modes (array): Supported execution modes (e.g., ["bar", "tick", "event"]).
- requirements (string): Behavioral expectations for each mode.

### implement_event_handlers
- events (array): Supported events (e.g., ["on_tick", "on_bar", "on_fill", "on_start", "on_end"]).
- requirements (string): Expected behavior for each event type.

### implement_order_engine
- order_types (array): Supported order types (e.g., ["market", "limit", "stop", "oco", "bracket"]).
- requirements (string): Execution rules, slippage, partial fills, etc.

### implement_backtester
- mode (string): "tick" or "bar".
- requirements (string): Backtesting accuracy, determinism, and performance expectations.

### implement_sandbox_limits
- cpu_limit_ms (number): Max CPU time allowed.
- memory_limit_mb (number): Max memory allowed.
- timeout_ms (number): Max execution time before termination.

### design_multi_symbol_support
- symbols (array): Symbols the DSL must support simultaneously.
- requirements (string): Cross-symbol logic, shared state, and event routing.

### implement_debugging_tools
- features (array): Debugging capabilities (e.g., ["logs", "variable_inspection", "error_messages"]).

## Outputs
- grammar (string): Final grammar definition.
- parser_code (string): Parser implementation.
- ast_spec (string): AST node definitions.
- interpreter_code (string): Interpreter implementation.
- execution_model_spec (string): Execution model design.
- event_handler_code (string): Event-driven logic implementation.
- order_engine_code (string): Order engine implementation.
- backtester_code (string): Backtesting engine implementation.
- sandbox_config (string): Sandbox safety configuration.
- multi_symbol_spec (string): Multi-symbol architecture.
- debugging_tools_code (string): Debugging utilities.
- notes (string): Additional considerations or constraints.

## Usage Example
{
  "action": "design_execution_model",
  "modes": ["bar", "tick", "event"],
  "requirements": "Support indicator mode, strategy mode, and event-driven algo trading."
}

## Notes
- The DSL must support both indicator logic and full algorithmic trading logic.
- The DSL must support event-driven execution and tick-level backtesting.
- The DSL must be fully sandboxed with CPU, memory, and time limits.
- The DSL must support multi-symbol strategies and cross-symbol state.
- The DSL must provide clear debugging tools and error messages.
