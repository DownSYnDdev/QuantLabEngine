# Monaco Editor: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 67 curated sources including Monaco Editor documentation, VS Code integration guides, and custom language tutorials. Full report available at: https://notebooklm.google.com/notebook/e1f2d3c4-b5a6-7890-cdef-1234567890ab

---

## Key Concepts
- **VS Code Core**: Powers Visual Studio Code's editor
- **Syntax Highlighting**: TextMate grammar support
- **IntelliSense**: Autocomplete, parameter hints, hover info
- **Custom Languages**: Define new language modes
- **Diagnostics**: Real-time error markers
- **Web Worker**: Language services run in workers for performance
- **Diff Editor**: Built-in side-by-side comparison
- **Minimap**: Code overview navigation

---

## API Reference (If Applicable)

### Installation
```bash
npm install monaco-editor
# or
npm install @monaco-editor/react  # React wrapper
```

### Basic Setup (Vanilla)
```javascript
import * as monaco from 'monaco-editor';

const editor = monaco.editor.create(document.getElementById('container'), {
  value: 'function hello() {\n\tconsole.log("Hello world!");\n}',
  language: 'javascript',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: true },
  scrollBeyondLastLine: false
});
```

### React Integration
```javascript
import Editor from '@monaco-editor/react';

function CodeEditor() {
  const handleEditorChange = (value, event) => {
    console.log('Code changed:', value);
  };
  
  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// Start coding"
      theme="vs-dark"
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        rulers: [80],
        wordWrap: 'on'
      }}
    />
  );
}
```

### Register Custom Language
```javascript
// Register language
monaco.languages.register({ id: 'pinescript' });

// Define tokens
monaco.languages.setMonarchTokensProvider('pinescript', {
  keywords: [
    'if', 'else', 'for', 'while', 'strategy', 'indicator',
    'plot', 'input', 'var', 'const', 'true', 'false'
  ],
  
  builtins: [
    'close', 'open', 'high', 'low', 'volume', 'time',
    'sma', 'ema', 'rsi', 'macd', 'atr'
  ],
  
  operators: [
    '=', '>', '<', '!', '~', '?', ':',
    '==', '<=', '>=', '!=', '&&', '||', '++', '--',
    '+', '-', '*', '/', '&', '|', '^', '%', '<<',
    '>>', '>>>', '+=', '-=', '*=', '/='
  ],
  
  tokenizer: {
    root: [
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@builtins': 'type.identifier',
          '@default': 'identifier'
        }
      }],
      
      [/[{}()\[\]]/, '@brackets'],
      [/[0-9]+(\.[0-9]+)?/, 'number'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string'],
      [/\/\/.*$/, 'comment'],
    ],
    
    string: [
      [/[^\\"]+/, 'string'],
      [/"/, 'string', '@pop']
    ]
  }
});

// Define autocomplete
monaco.languages.registerCompletionItemProvider('pinescript', {
  provideCompletionItems: (model, position) => {
    const suggestions = [
      {
        label: 'sma',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'sma(${1:source}, ${2:length})',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Simple Moving Average'
      },
      {
        label: 'plot',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'plot(${1:series}, "${2:title}", color=${3:color.blue})',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Plot series on chart'
      }
    ];
    
    return { suggestions };
  }
});
```

---

## Usage Patterns

### Real-Time Diagnostics
```javascript
// Set up diagnostics (error markers)
function updateDiagnostics(model, errors) {
  const markers = errors.map(err => ({
    severity: monaco.MarkerSeverity.Error,
    startLineNumber: err.line,
    startColumn: err.column,
    endLineNumber: err.line,
    endColumn: err.column + err.length,
    message: err.message
  }));
  
  monaco.editor.setModelMarkers(model, 'owner', markers);
}

// Validate on change
editor.onDidChangeModelContent(() => {
  const code = editor.getValue();
  const errors = validateCode(code);  // Your validation logic
  updateDiagnostics(editor.getModel(), errors);
});
```

### Custom Theme
```javascript
monaco.editor.defineTheme('tradingview-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'type.identifier', foreground: '4EC9B0' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' }
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#2A2A2A',
    'editorLineNumber.foreground': '#858585'
  }
});

monaco.editor.setTheme('tradingview-dark');
```

### Hover Provider
```javascript
monaco.languages.registerHoverProvider('pinescript', {
  provideHover: (model, position) => {
    const word = model.getWordAtPosition(position);
    if (!word) return;
    
    const docs = {
      sma: {
        value: '**sma**(source, length)\n\nSimple Moving Average',
        isTrusted: true
      },
      rsi: {
        value: '**rsi**(source, length)\n\nRelative Strength Index (0-100)',
        isTrusted: true
      }
    };
    
    const doc = docs[word.word];
    if (doc) {
      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [{ value: doc.value }]
      };
    }
  }
});
```

---

## Constraints & Notes
- **Bundle Size**: ~3-5MB (use webpack plugin to optimize)
- **Worker Setup**: Requires web worker configuration
- **TypeScript Required**: Better experience with TypeScript
- **SSR Challenges**: Client-side only (use dynamic import for Next.js)
- **Performance**: Can lag with very large files (>10,000 lines)

---

## Examples (Optional)

### Next.js Integration
```javascript
// components/CodeEditor.jsx
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }  // Disable server-side rendering
);

export default function CodeEditor({ value, onChange, language = 'javascript' }) {
  return (
    <MonacoEditor
      height="600px"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true
      }}
    />
  );
}
```

### Multi-File Editor
```javascript
class MultiFileEditor {
  constructor(container) {
    this.editor = monaco.editor.create(container, {
      automaticLayout: true
    });
    
    this.models = new Map();
    this.currentFile = null;
  }
  
  addFile(filename, content, language) {
    const uri = monaco.Uri.parse(`file:///${filename}`);
    const model = monaco.editor.createModel(content, language, uri);
    this.models.set(filename, model);
    
    if (!this.currentFile) {
      this.switchTo(filename);
    }
  }
  
  switchTo(filename) {
    const model = this.models.get(filename);
    if (model) {
      this.editor.setModel(model);
      this.currentFile = filename;
    }
  }
  
  getValue(filename) {
    return this.models.get(filename)?.getValue();
  }
}

// Usage
const editor = new MultiFileEditor(document.getElementById('editor'));
editor.addFile('strategy.pine', '// Pine strategy', 'pinescript');
editor.addFile('helpers.js', '// JavaScript helpers', 'javascript');
editor.switchTo('strategy.pine');
```

---

## Related Files
- `acornjs.md` - For AST parsing/validation
- `esprima.md` - Alternative parser
- `antlr-grammar.md` - For language grammar
- `nextjs.md` - Framework integration

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (67 sources)
