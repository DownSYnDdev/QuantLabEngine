'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Save, RotateCcw } from 'lucide-react';

interface DSLEditorProps {
    initialCode?: string;
    onCodeChange?: (code: string) => void;
    onExecute?: (code: string) => void;
}

const DEFAULT_CODE = `// QuantLab DSL - Strategy Editor
// Define your trading strategy here

// Simple Moving Average Example
indicator("SMA Crossover")

// Calculate moving averages
// sma(source, period) - source is 'close', 'open', 'high', or 'low'
sma_fast = sma("close", 10)
sma_slow = sma("close", 20)

// Calculate RSI
rsi_14 = rsi("close", 14)

// Entry logic
on_bar(symbol) {
  if crossover(sma_fast, sma_slow) {
    signal("BUY", symbol)
  }
  if crossunder(sma_fast, sma_slow) {
    signal("SELL", symbol)
  }
}
`;

/**
 * DSL Editor component with syntax highlighting (Monaco placeholder)
 * Full Monaco integration will be added in later milestones
 */
export function DSLEditor({
    initialCode = DEFAULT_CODE,
    onCodeChange,
    onExecute,
}: DSLEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [isExecuting, setIsExecuting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        onCodeChange?.(newCode);
    };

    const handleExecute = async () => {
        setIsExecuting(true);
        try {
            onExecute?.(code);
            // Simulate execution delay
            await new Promise((resolve) => setTimeout(resolve, 500));
        } finally {
            setIsExecuting(false);
        }
    };

    const handleReset = () => {
        setCode(DEFAULT_CODE);
        onCodeChange?.(DEFAULT_CODE);
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [code]);

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-300">
                        Strategy Editor
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                        DSL v0.1
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                    <button
                        onClick={() => console.log('Save clicked')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                        <Save size={14} />
                        Save
                    </button>
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Play size={14} />
                        {isExecuting ? 'Running...' : 'Run'}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900 border-r border-slate-800 text-right text-slate-600 font-mono text-sm pt-4 pr-2 select-none overflow-hidden">
                    {code.split('\n').map((_, i) => (
                        <div key={i} className="leading-6">
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Code textarea */}
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="w-full h-full bg-transparent text-slate-200 font-mono text-sm leading-6 p-4 pl-14 resize-none focus:outline-none"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
                <span>Lines: {code.split('\n').length}</span>
                <span>QuantLab DSL</span>
            </div>
        </div>
    );
}
