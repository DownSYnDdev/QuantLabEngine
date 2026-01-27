# Agent Instructions

- Break large tasks into smaller steps.
- Use the appropriate skill for each task.
- Write all generated code into the workspace directory.
- Document architectural decisions.
- Ask for clarification when requirements are ambiguous.
- Prioritize security, performance, and maintainability.
# Agent Behavior Instructions

- Treat all requirements documents (PRD, goals.md, user instructions) as strict requirements, not suggestions.
- Break large tasks into small, manageable steps before executing.
- Use the appropriate skill for each task and explain why you selected it.
- Write all generated code, files, and artifacts into the workspace directory.
- Document architectural decisions before implementing them.
- Ask for clarification when requirements are incomplete or ambiguous.
- Prioritize security, performance, and maintainability in all code.
- Follow modern best practices for the chosen tech stack.
- Keep code modular, testable, and easy to extend.
- Avoid unnecessary dependencies or over-engineering.
- Provide clear explanations when generating complex logic or architecture.

# Context Files

Before executing any milestone, the agent must read and understand:

## Project Documents
- agent/goals.md
- agent/prd.md
- agent/tad.md
- agent/milestone1.md
- agent/milestone2.md
- agent/milestone3.md
- agent/milestone4.md
- agent/milestone5.md
- agent/milestone6.md
- agent/milestone7.md

## Library Documentation References
### Charting & Visualization
- agent/docs/tradingview-lightweight-charts.md
- agent/docs/d3js.md

### Technical Indicators & Statistics
- agent/docs/tulip-indicators.md
- agent/docs/technicalanalysisjs.md
- agent/docs/simple-statistics.md

### Data Processing & Storage
- agent/docs/danfojs.md
- agent/docs/apache-arrow.md
- agent/docs/timescaledb.md

### DSL & Parsing
- agent/docs/pine-script.md (conceptual reference)
- agent/docs/antlr-grammar.md
- agent/docs/acornjs.md
- agent/docs/esprima.md

### UI & Framework
- agent/docs/monaco-editor.md
- agent/docs/nextjs.md

### Business Logic
- agent/docs/account-schema.md

