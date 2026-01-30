---
name: Financial Data Fundamentals
description: Provides foundational knowledge and code generation for handling OHLCV data, indicators, market structure, and financial data processing.
---

# Skill: Financial Data Fundamentals

## Description
Provides foundational knowledge and code generation for handling OHLCV data, indicators, market structure, and financial data processing.

## Capabilities
- explain_market_concepts
- generate_indicator_code
- process_ohlcv
- design_data_pipeline
- validate_financial_inputs

## Inputs
### explain_market_concepts
- topic (string)

### generate_indicator_code
- indicator_name (string)
- formula (string)

### process_ohlcv
- data_format (string)
- requirements (string)

### design_data_pipeline
- sources (array of strings)
- goals (string)

### validate_financial_inputs
- fields (array of strings)

## Outputs
- explanation (string)
- code (string)
- pipeline (string)
- notes (string)

## Usage Example
{
  "action": "generate_indicator_code",
  "indicator_name": "RSI",
  "formula": "Relative Strength Index over N periods"
}

## Notes
This skill does not fetch live market data; it focuses on processing and logic.
