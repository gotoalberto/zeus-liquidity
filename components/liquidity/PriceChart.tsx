"use client"

/**
 * PriceChart Component
 *
 * Displays ZEUS price chart using TradingView lightweight-charts
 * Features: OHLC candlesticks, volume, timeframe selector
 */

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, CandlestickSeries, type IChartApi } from "lightweight-charts"
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
        textColor: "#8b9ab0",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
        visible: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        mode: 0,
        minimumWidth: 80,
      },
      localization: {
        priceFormatter: (price: number) => {
          if (price < 0.000001) return price.toExponential(2)
          if (price < 0.0001) return price.toFixed(8)
          if (price < 0.01) return price.toFixed(6)
          return price.toFixed(4)
        },
      },
      crosshair: {
        vertLine: { color: "rgba(255,230,0,0.3)", width: 1, style: 3 },
        horzLine: { color: "rgba(255,230,0,0.3)", width: 1, style: 3 },
      },
    })

    chartRef.current = chart

    // Add candlestick series using v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#EF4444",
      borderUpColor: "#10B981",
      borderDownColor: "#EF4444",
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    })

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
            style={{
              padding: "0.3rem 0.75rem",
              borderRadius: "0.4rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              border: "1px solid",
              transition: "all 0.15s ease",
              cursor: "pointer",
              background: selectedTimeframe.value === tf.value ? "#FFE600" : "rgba(255,255,255,0.05)",
              color: selectedTimeframe.value === tf.value ? "#000" : "rgba(255,255,255,0.5)",
              borderColor: selectedTimeframe.value === tf.value ? "#FFE600" : "rgba(255,255,255,0.1)",
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div style={{ position: "relative", width: "100%", height: 400, borderRadius: "0.75rem", overflow: "visible", border: "1px solid rgba(255,255,255,0.08)" }}>
        {isLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(13,17,23,0.7)", backdropFilter: "blur(4px)", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
              <div style={{ width: 16, height: 16, border: "2px solid #FFE600", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading chart...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
