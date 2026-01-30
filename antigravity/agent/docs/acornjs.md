# Acorn.js: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 41 curated sources including Acorn documentation, AST specifications, and parser plugin examples. Full report available at: https://notebooklm.google.com/notebook/c8d7b6a5-4e3d-2f1a-0b9c-8e7f6d5a4b3c

---

## Key Concepts
- **Lightweight Parser**: Small, fast JavaScript parser (~50KB)
- **ESTree Compliant**: Outputs standard AST format
- **Pluggable**: Extensible plugin system
- **ECMAScript Support**: ES2020+ features
- **Stream Parsing**: Can parse incrementally
- **Source Locations**: Optional location tracking
- **Tolerant Mode**: Continues parsing despite errors

---

## API Reference (If Applicable)

### Installation
```bash
npm install acorn
```

### Basic Parsing
```javascript
import { parse } from 'acorn';

const ast = parse('const x = 42;', {
  ecmaVersion: 2020,
  sourceType: 'module',
  locations: true
});

console.log(ast);
// {
//   type: 'Program',
//   body: [{ type: 'VariableDeclaration', ... }],
//   sourceType: 'module'
// }
```

### Options
- **`ecmaVersion`**: 3, 5, 6-2024, 'latest'
- **`sourceType`**: 'script' | 'module'
- **`locations`**: Include line/column info
- **`ranges`**: Include character ranges
- **`onComment`**: Callback for comments
- **`allowReturnOutsideFunction`**: Relaxed parsing

### Walking the AST
```javascript
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';

const ast = parse(code);

walkSimple(ast, {
  VariableDeclaration(node) {
    console.log('Found variable:', node.declarations[0].id.name);
  },
  
  FunctionDeclaration(node) {
    console.log('Found function:', node.id.name);
  },
  
  CallExpression(node) {
    if (node.callee.type === 'Identifier') {
      console.log('Function call:', node.callee.name);
    }
  }
});
```

### Tokenizing
```javascript
import { tokenizer } from 'acorn';

const tokens = [];
const tokenizeCode = tokenizer('const x = 42;');

for (let token of tokenizeCode) {
  tokens.push(token);
}

// [
//   { type: { label: 'const' }, value: 'const', start: 0, end: 5 },
//   { type: { label: 'name' }, value: 'x', start: 6, end: 7 },
//   ...
// ]
```

---

## Usage Patterns

### Custom DSL Parser
```javascript
import { Parser } from 'acorn';

// Extend Acorn for custom syntax
const TradingDSLParser = Parser.extend((BaseParser) => {
  return class extends BaseParser {
    // Parse historical reference: close[5]
    parseExprSubscripts(refDestructuringErrors, maybeAsyncArrow) {
      const base = super.parseExprSubscripts(refDestructuringErrors, maybeAsyncArrow);
      
      if (this.eat(tt.bracketL)) {
        const index = this.parseExpression();
        this.expect(tt.bracketR);
        
        return {
          type: 'HistoricalReference',
          base,
          index
        };
      }
      
      return base;
    }
  };
});

const ast = TradingDSLParser.parse('close[5] > close[10]');
```

### Analyzing Trading Strategies
```javascript
import { parse } from 'acorn';
import { simple as walk } from 'acorn-walk';

function analyzeStrategy(code) {
  const ast = parse(code, { ecmaVersion: 2020 });
  const analysis = {
    indicators: new Set(),
    conditions: [],
    trades: []
  };
  
  walk(ast, {
    CallExpression(node) {
      const funcName = node.callee.name;
      
      // Detect indicator functions
      if (['sma', 'ema', 'rsi', 'macd'].includes(funcName)) {
        analysis.indicators.add(funcName);
      }
      
      // Detect trade actions
      if (['buy', 'sell', 'close'].includes(funcName)) {
        analysis.trades.push({
          action: funcName,
          args: node.arguments.length
        });
      }
    },
    
    IfStatement(node) {
      analysis.conditions.push({
        type: 'if',
        loc: node.loc
      });
    }
  });
  
  return analysis;
}
```

### Code Transformation
```javascript
import { parse } from 'acorn';
import { generate } from 'escodegen';
import { simple as walk } from 'acorn-walk';

function transformStrategy(code) {
  const ast = parse(code, { ecmaVersion: 2020 });
  
  // Transform historical references: close[5] -> series.at(close, 5)
  walk(ast, {
    MemberExpression(node) {
      if (node.computed && node.object.name === 'close') {
        // Transform to function call
        Object.assign(node, {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'series' },
            property: { type: 'Identifier', name: 'at' }
          },
          arguments: [
            { type: 'Identifier', name: 'close' },
            node.property
          ]
        });
      }
    }
  });
  
  return generate(ast);
}
```

---

## Constraints & Notes
- **JavaScript Only**: Parses JavaScript/ECMAScript syntax
- **No Type Checking**: Purely syntactic analysis
- **Custom Syntax**: Requires parser extension via plugins
- **Error Handling**: Throws on syntax errors (unless tolerant mode)
- **Performance**: Very fast for small to medium scripts
- **Bundle Size**: ~50KB (smaller than Babel parser)

---

## Examples (Optional)

### Syntax Validator for Trading DSL
```javascript
import { parse } from 'acorn';

class DSLValidator {
  validate(code) {
    try {
      const ast = parse(code, {
        ecmaVersion: 2020,
        allowReturnOutsideFunction: false
      });
      
      const errors = [];
      
      walk(ast, {
        // Ensure no forbidden constructs
        ForStatement(node) {
          errors.push({
            message: 'For loops not allowed in strategies',
            loc: node.loc
          });
        },
        
        WhileStatement(node) {
          errors.push({
            message: 'While loops not allowed',
            loc: node.loc
          });
        }
      });
      
      return { valid: errors.length === 0, errors };
      
    } catch (e) {
      return {
        valid: false,
        errors: [{ message: e.message, loc: e.loc }]
      };
    }
  }
}
```

### Extract Function Dependencies
```javascript
function extractDependencies(code) {
  const ast = parse(code, { ecmaVersion: 2020 });
  const deps = new Set();
  
  walk(ast, {
    CallExpression(node) {
      if (node.callee.type === 'Identifier') {
        deps.add(node.callee.name);
      }
    }
  });
  
  return Array.from(deps);
}

const code = `
  const sma20 = sma(close, 20);
  const rsi = rsi(close, 14);
  if (crossover(sma20, close)) buy();
`;

console.log(extractDependencies(code));
// ['sma', 'rsi', 'crossover', 'buy']
```

---

## Related Files
- `antlr-grammar.md` - For custom grammar definition
- `esprima.md` - Alternative JavaScript parser
- `monaco-editor.md` - For editor integration
- `pine-script.md` - DSL design reference

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (41 sources)
