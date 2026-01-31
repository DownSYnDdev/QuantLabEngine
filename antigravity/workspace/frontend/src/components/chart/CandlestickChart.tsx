'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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

interface CandlestickChartProps {
    symbol?: string;
    data?: OHLCVBar[];
    overlays?: OverlayData[];
    height?: number;
    onBarsLoaded?: (bars: OHLCVBar[]) => void;
}

/**
 * TradingView Lightweight Charts candlestick component
 * Renders OHLCV data with zoom, pan, crosshair, and indicator overlays
 */
export function CandlestickChart({
    symbol = 'EURUSD',
    data,
    overlays = [],
    height = 500,
    onBarsLoaded,
}: CandlestickChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);
    const overlaySeriesRef = useRef<Map<string, ReturnType<ReturnType<typeof import('lightweight-charts').createChart>['addSeries']>>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [barsData, setBarsData] = useState<OHLCVBar[]>([]);

    // Only render chart on client side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update overlays when they change
    const updateOverlays = useCallback(async (chart: ReturnType<typeof import('lightweight-charts').createChart>, newOverlays: OverlayData[]) => {
        const { LineSeries } = await import('lightweight-charts');

        // Remove old overlay series that are no longer needed
        const currentNames = new Set(newOverlays.map(o => o.name));
        for (const [name, series] of overlaySeriesRef.current) {
            if (!currentNames.has(name)) {
                chart.removeSeries(series);
                overlaySeriesRef.current.delete(name);
            }
        }

        // Add or update overlay series
        for (const overlay of newOverlays) {
            let series = overlaySeriesRef.current.get(overlay.name);

            if (!series) {
                // Create new line series
                series = chart.addSeries(LineSeries, {
                    color: overlay.color,
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: true,
                });
                overlaySeriesRef.current.set(overlay.name, series);
            }

            // Set data
            const lineData = overlay.data.map(d => ({
                time: Math.floor(new Date(d.timestamp).getTime() / 1000) as import('lightweight-charts').Time,
                value: d.value,
            })).filter(d => !isNaN(d.value));

            series.setData(lineData);
        }
    }, []);

    useEffect(() => {
        if (!isMounted || !containerRef.current) return;

        const initChart = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const { createChart, ColorType, CandlestickSeries } = await import('lightweight-charts');

                if (!containerRef.current) return;

                // Create chart instance
                const chart = createChart(containerRef.current, {
                    width: containerRef.current.clientWidth,
                    height,
                    layout: {
                        background: { type: ColorType.Solid, color: '#020617' },
                        textColor: '#94A3B8',
                    },
                    grid: {
                        vertLines: { color: '#1E293B' },
                        horzLines: { color: '#1E293B' },
                    },
                    crosshair: {
                        mode: 1,
                        vertLine: {
                            color: '#475569',
                            width: 1,
                            style: 2,
                            labelBackgroundColor: '#1E293B',
                        },
                        horzLine: {
                            color: '#475569',
                            width: 1,
                            style: 2,
                            labelBackgroundColor: '#1E293B',
                        },
                    },
                    rightPriceScale: {
                        borderColor: '#1E293B',
                    },
                    timeScale: {
                        borderColor: '#1E293B',
                        timeVisible: true,
                        secondsVisible: false,
                    },
                });

                chartRef.current = chart;

                // Add candlestick series
                const candlestickSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#22C55E',
                    downColor: '#EF4444',
                    borderUpColor: '#22C55E',
                    borderDownColor: '#EF4444',
                    wickUpColor: '#22C55E',
                    wickDownColor: '#EF4444',
                });

                // Fetch or use provided data
                let chartData;
                let bars: OHLCVBar[];

                if (data) {
                    bars = data;
                    chartData = data.map((bar) => ({
                        time: Math.floor(new Date(bar.timestamp).getTime() / 1000) as import('lightweight-charts').Time,
                        open: bar.open,
                        high: bar.high,
                        low: bar.low,
                        close: bar.close,
                    }));
                } else {
                    const response = await fetch(
                        `http://localhost:4000/api/v1/ohlcv/${symbol}?limit=500`
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch data: ${response.statusText}`);
                    }

                    const result = await response.json();
                    bars = result.bars;
                    chartData = result.bars.map((bar: OHLCVBar) => ({
                        time: Math.floor(new Date(bar.timestamp).getTime() / 1000) as import('lightweight-charts').Time,
                        open: bar.open,
                        high: bar.high,
                        low: bar.low,
                        close: bar.close,
                    }));
                }

                setBarsData(bars);
                if (onBarsLoaded) {
                    onBarsLoaded(bars);
                }

                candlestickSeries.setData(chartData);
                chart.timeScale().fitContent();

                // Add initial overlays
                if (overlays.length > 0) {
                    await updateOverlays(chart, overlays);
                }

                setIsLoading(false);

                // Handle resize
                const handleResize = () => {
                    if (containerRef.current && chart) {
                        chart.applyOptions({ width: containerRef.current.clientWidth });
                    }
                };

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                };
            } catch (err) {
                console.error('Chart error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load chart');
                setIsLoading(false);
            }
        };

        initChart();

        return () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
            overlaySeriesRef.current.clear();
        };
    }, [isMounted, height, symbol, data, onBarsLoaded, updateOverlays]);

    // Update overlays when they change
    useEffect(() => {
        if (chartRef.current && overlays.length > 0 && barsData.length > 0) {
            updateOverlays(chartRef.current, overlays);
        }
    }, [overlays, barsData, updateOverlays]);

    return (
        <div className="relative w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="text-white font-mono font-semibold text-lg">{symbol}</span>
                <span className="text-slate-500 text-sm">1H</span>
                {overlays.length > 0 && (
                    <div className="flex gap-1 ml-2">
                        {overlays.map((overlay) => (
                            <span
                                key={overlay.name}
                                className="px-2 py-0.5 text-xs rounded"
                                style={{ backgroundColor: overlay.color + '20', color: overlay.color }}
                            >
                                {overlay.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
                    <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 border-slate-600 border-t-green-500 rounded-full animate-spin" />
                        <span>Loading chart...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
                    <div className="text-center p-4">
                        <p className="text-red-400 mb-2">{error}</p>
                        <p className="text-slate-500 text-sm">Make sure the backend is running at localhost:4000</p>
                    </div>
                </div>
            )}

            <div ref={containerRef} style={{ height }} />
        </div>
    );
}
