# Esprima: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 38 curated sources including Esprima documentation, AST examples, and parsing tutorials. Full report available at: https://notebooklm.google.com/notebook/d7c6b5a4-3e2d-1f0a-9b8c-7e6f5d4a3b2c

---

## Key Concepts
- **ECMAScript Parser**: Standards-compliant JavaScript parser
- **High Performance**: Optimized for speed and accuracy
- **Syntax Validation**: Check JavaScript syntax without execution
- **Token Stream**: Access to detailed token information
- **Comment Attachment**: Optionally attach comments to AST nodes
- **Range & Location**: Precise source position tracking
- **Browser & Node**: Works in all JavaScript environments

---

## API Reference (If Applicable)

### Installation
```bash
npm install esprima
```

### Basic Parsing
```javascript
import esprima from 'esprima';

const ast = esprima.parseScript('const answer = 42;');

console.log(JSON.stringify(ast, null, 2));
// {
//   "type": "Program",
//   "body": [{
//     "type": "VariableDeclaration",
//     "declarations": [...]
//   }],
//   "sourceType": "script"
// }
```

### Parsing Options
```javascript
const options = {
  comment: true,        // Include comments
  loc: true,            // Include line/column location
  range: true,          // Include character range [start, end]
  tokens: true,         // Include token stream
  tolerant: true        // Continue despite errors
};

const result = esprima.parseScript(code, options);

console.log(result.comments);  // Array of comments
console.log(result.tokens);    // Array of tokens
console.log(result.errors);    // Array of errors (if tolerant)
```

### Tokenization
```javascript
import esprima from 'esprima';

const tokens = esprima.tokenize('const x = 42;', { range: true });

// [
//   { type: 'Keyword', value: 'const', range: [0, 5] },
//   { type: 'Identifier', value: 'x', range: [6, 7] },
//   { type: 'Punctuator', value: '=', range: [8, 9] },
//   { type: 'Numeric', value: '42', range: [10, 12] },
//   { type: 'Punctuator', value: ';', range: [12, 13] }
// ]
```

### Syntax Validation
```javascript
function validateSyntax(code) {
  try {
    esprima.parseScript(code);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e.message,
      line: e.lineNumber,
      column: e.column
    };
  }
}

const result = validateSyntax('const x = ;');
// { valid: false, error: 'Unexpected token ;', line: 1, column: 11 }
```

---

## Usage Patterns

### Code Analysis
```javascript
import esprima from 'esprima';

function analyzeCode(code) {
  const ast = esprima.parseScript(code, { loc: true });
  
  const analysis = {
    variables: [],
    functions: [],
    complexity: 0
  };
  
  function walk(node) {
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        analysis.variables.push({
          name: decl.id.name,
          line: decl.loc.start.line
        });
      });
    }
    
    if (node.type === 'FunctionDeclaration') {
      analysis.functions.push({
        name: node.id.name,
        params: node.params.length,
        line: node.loc.start.line
      });
    }
    
    if (node.type === 'IfStatement' || 
        node.type === 'WhileStatement' || 
        node.type === 'ForStatement') {
      analysis.complexity++;
    }
    
    // Recursively walk child nodes
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(walk);
        } else if (node[key].type) {
          walk(node[key]);
        }
      }
    }
  }
  
  walk(ast);
  return analysis;
}
```

### Live Syntax Checking for Editor
```javascript
class SyntaxChecker {
  constructor() {
    this.errors = [];
  }
  
  check(code) {
    this.errors = [];
    
    try {
      esprima.parseScript(code, {
        tolerant: true,
        range: true
      });
    } catch (e) {
      this.errors.push({
        message: e.description,
        line: e.lineNumber,
        column: e.column,
        index: e.index
      });
    }
    
    return this.errors;
  }
  
  getErrorMarkers() {
    return this.errors.map(err => ({
      startLineNumber: err.line,
      startColumn: err.column,
      endLineNumber: err.line,
      endColumn: err.column + 1,
      message: err.message,
      severity: 'error'
    }));
  }
}
```

### Extract String Literals
```javascript
function extractStrings(code) {
  const ast = esprima.parseScript(code, { tolerant: true });
  const strings = [];
  
  function walk(node) {
    if (node.type === 'Literal' && typeof node.value === 'string') {
      strings.push(node.value);
    }
    
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(walk);
        } else if (node[key].type) {
          walk(node[key]);
        }
      }
    }
  }
  
  walk(ast);
  return strings;
}

const code = `
  const greeting = "Hello";
  console.log("World");
`;

console.log(extractStrings(code));
// ['Hello', 'World']
```

---

## Constraints & Notes
- **JavaScript Only**: Parses standard JavaScript/ES2015+
- **No TypeScript**: Use `@typescript-eslint/parser` for TypeScript
- **No JSX**: Use `esprima-jsx` fork for JSX support
- **Tolerant Mode Limitations**: May miss some errors
- **Performance**: Slightly slower than Acorn but more compliant
- **Bundle Size**: ~100KB minified

---

## Examples (Optional)

### Function Signature Extractor
```javascript
function extractFunctionSignatures(code) {
  const ast = esprima.parseScript(code);
  const signatures = [];
  
  function walk(node) {
    if (node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression') {
      
      const params = node.params.map(p => {
        if (p.type === 'Identifier') return p.name;
        if (p.type === 'AssignmentPattern') return `${p.left.name} = default`;
        if (p.type === 'RestElement') return `...${p.argument.name}`;
        return 'unknown';
      });
      
      signatures.push({
        name: node.id ? node.id.name : 'anonymous',
        params,
        isAsync: node.async || false,
        isGenerator: node.generator || false
      });
    }
    
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(walk);
        } else if (node[key].type) {
          walk(node[key]);
        }
      }
    }
  }
  
  walk(ast);
  return signatures;
}
```

### Detect Forbidden Patterns
```javascript
function detectForbiddenPatterns(code, patterns) {
  const ast = esprima.parseScript(code, { loc: true });
  const violations = [];
  
  function walk(node) {
    // Check for eval usage
    if (patterns.includes('eval') && 
        node.type === 'CallExpression' && 
        node.callee.name === 'eval') {
      violations.push({
        pattern: 'eval',
        message: 'eval() is forbidden',
        line: node.loc.start.line
      });
    }
    
    // Check for var usage (prefer const/let)
    if (patterns.includes('var') && 
        node.type === 'VariableDeclaration' && 
        node.kind === 'var') {
      violations.push({
        pattern: 'var',
        message: 'Use const or let instead of var',
        line: node.loc.start.line
      });
    }
    
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(walk);
        } else if (node[key].type) {
          walk(node[key]);
        }
      }
    }
  }
  
  walk(ast);
  return violations;
}
```

---

## Related Files
- `acornjs.md` - Alternative lightweight parser
- `antlr-grammar.md` - For custom DSL parsing
- `monaco-editor.md` - Editor integration
- `pine-script.md` - DSL design reference

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (38 sources)
