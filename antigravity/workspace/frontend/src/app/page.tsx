'use client';

import { useState, useCallback } from 'react';
import { CandlestickChart } from '@/components/chart/CandlestickChart';
import { DSLEditor } from '@/components/editor/DSLEditor';
import { Maximize2, Minimize2 } from 'lucide-react';

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'AAPL', 'SPY'];

interface OHLCVBar {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OverlayData {
  name: string;
  type: 'line' | 'multi-line' | 'band';
  color: string;
  data: { timestamp: string; value: number }[];
}

export default function HomePage() {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [showEditor, setShowEditor] = useState(true);
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const [bars, setBars] = useState<OHLCVBar[]>([]);
  const [dslErrors, setDslErrors] = useState<string[]>([]);

  const handleBarsLoaded = useCallback((loadedBars: OHLCVBar[]) => {
    setBars(loadedBars);
  }, []);

  const handleExecuteDSL = useCallback(async (code: string) => {
    if (bars.length === 0) {
      console.log('Waiting for chart data...');
      return;
    }

    try {
      // Dynamic import to avoid SSR issues
      const { interpret } = await import('@/lib/dsl');
      const result = interpret(code, bars);

      if (result.success) {
        setOverlays(result.overlays);
        setDslErrors([]);
        console.log('DSL executed:', result.overlays.length, 'overlays created');
      } else {
        setDslErrors(result.errors);
        console.error('DSL errors:', result.errors);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setDslErrors([errorMsg]);
      console.error('DSL execution error:', error);
    }
  }, [bars]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white font-mono">
            Trading Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analyze markets and build strategies
          </p>
        </div>

        {/* Symbol selector */}
        <div className="flex items-center gap-2">
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => {
                setSelectedSymbol(symbol);
                setOverlays([]); // Clear overlays when switching symbols
              }}
              className={`
                px-3 py-1.5 text-sm font-mono rounded-lg transition-colors cursor-pointer
                ${selectedSymbol === symbol
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Chart section */}
        <div className={showEditor ? 'col-span-8' : 'col-span-12'}>
          <div className="relative">
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="absolute top-4 right-4 z-20 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={showEditor ? 'Expand chart' : 'Show editor'}
            >
              {showEditor ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <CandlestickChart
              symbol={selectedSymbol}
              height={600}
              overlays={overlays}
              onBarsLoaded={handleBarsLoaded}
            />
          </div>
        </div>

        {/* Editor section */}
        {showEditor && (
          <div className="col-span-4">
            <div className="h-[600px] flex flex-col">
              <DSLEditor
                onExecute={handleExecuteDSL}
              />
              {dslErrors.length > 0 && (
                <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm font-mono">
                    {dslErrors.join('\n')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {bars.length > 0 ? (
          <>
            <StatCard label="Open" value={bars[bars.length - 1].open.toFixed(4)} change={`${bars.length} bars`} />
            <StatCard label="High" value={bars[bars.length - 1].high.toFixed(4)} change="24h" />
            <StatCard label="Low" value={bars[bars.length - 1].low.toFixed(4)} change="24h" />
            <StatCard label="Close" value={bars[bars.length - 1].close.toFixed(4)} change={overlays.length > 0 ? `${overlays.length} indicators` : 'No indicators'} />
          </>
        ) : (
          <>
            <StatCard label="Open" value="--" change="Loading..." />
            <StatCard label="High" value="--" change="Loading..." />
            <StatCard label="Low" value="--" change="Loading..." />
            <StatCard label="Close" value="--" change="Loading..." />
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="text-white text-xl font-mono mt-1">{value}</div>
      <div
        className={`text-sm mt-1 ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-slate-500'
          }`}
      >
        {change}
      </div>
    </div>
  );
}
