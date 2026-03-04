"use client"

/**
 * PriceChart Component
 *
 * Displays ZEUS price chart using TradingView lightweight-charts
 * Features: OHLC candlesticks, volume, timeframe selector
 */

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, type IChartApi } from "lightweight-charts"
import { useZeusOHLC } from "@/hooks/useZeusPrice"
import { ChartTimeframe, OHLCData } from "@/types"

const TIMEFRAMES: ChartTimeframe[] = [
  { label: "1D", value: "1d", days: 1 },
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
]

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<any | null>(null)

  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>(TIMEFRAMES[1]) // Default: 7D

  const { data: ohlcData, isLoading, error } = useZeusOHLC(selectedTimeframe.days)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "#1E2030" },
        horzLines: { color: "#1E2030" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: "#1E2030",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#1E2030",
      },
    })

    chartRef.current = chart

    // Add candlestick series using v5 API
    const candlestickSeries = chart.addSeries({
      type: "Candlestick",
      upColor: "#10B981",
      downColor: "#EF4444",
      borderUpColor: "#10B981",
      borderDownColor: "#EF4444",
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    } as any)

    candlestickSeriesRef.current = candlestickSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!ohlcData || !candlestickSeriesRef.current) return

    // Convert OHLC data to lightweight-charts format
    const chartData = ohlcData.map((candle: OHLCData) => ({
      time: Math.floor(candle.timestamp / 1000) as any, // Convert to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))

    candlestickSeriesRef.current.setData(chartData)

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [ohlcData])

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load chart</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe.value === tf.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-[400px] bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading chart...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
