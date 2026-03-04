"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, CandlestickSeries, type IChartApi } from "lightweight-charts"
import { useZeusOHLC, useZeusPrice } from "@/hooks/useZeusPrice"
import { ChartTimeframe, OHLCData } from "@/types"

const TIMEFRAMES: ChartTimeframe[] = [
  { label: "1D", value: "1d", days: 1 },
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
]

function formatMcap(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<any | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>(TIMEFRAMES[1])

  const { data: ohlcData, isLoading, error } = useZeusOHLC(selectedTimeframe.days)
  const { data: priceData } = useZeusPrice()

  // circulating supply for MCAP calculation
  const circulatingSupply = priceData?.circulatingSupply ?? 0

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#000",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(0,0,0,0.07)" },
        horzLines: { color: "rgba(0,0,0,0.07)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: "rgba(0,0,0,0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(0,0,0,0.2)",
        visible: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        minimumWidth: 90,
      },
      localization: {
        priceFormatter: (price: number) => formatMcap(price),
      },
      crosshair: {
        vertLine: { color: "rgba(0,0,0,0.3)", width: 1, style: 3 },
        horzLine: { color: "rgba(0,0,0,0.3)", width: 1, style: 3 },
      },
    })

    chartRef.current = chart

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    candlestickSeriesRef.current = candlestickSeries

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
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

    // Multiply price by circulating supply to get MCAP
    const supply = circulatingSupply || 1
    const chartData = ohlcData.map((candle: OHLCData) => ({
      time: Math.floor(candle.timestamp / 1000) as any,
      open: candle.open * supply,
      high: candle.high * supply,
      low: candle.low * supply,
      close: candle.close * supply,
    }))

    candlestickSeriesRef.current.setData(chartData)

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [ohlcData, circulatingSupply])

  if (error) {
    return (
      <div style={{ width: "100%", height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--red)", fontWeight: 700, marginBottom: "0.5rem" }}>Failed to load chart</p>
          <button onClick={() => window.location.reload()} style={{ fontSize: "0.875rem", color: "#666", background: "none", border: "none", cursor: "pointer" }}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Timeframe Selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setSelectedTimeframe(tf)}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.8rem",
              padding: "0.3rem 0.8rem",
              borderRadius: "0.4rem",
              border: "2px solid var(--black)",
              cursor: "pointer",
              transition: "all 0.1s",
              background: selectedTimeframe.value === tf.value ? "var(--yellow)" : "#f5f5f5",
              color: "var(--black)",
              boxShadow: selectedTimeframe.value === tf.value ? "2px 2px 0 var(--black)" : "1px 1px 0 var(--black)",
            }}
          >
            {tf.label}
          </button>
        ))}
        <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: 600, marginLeft: "0.5rem" }}>
          Market Cap (USD)
        </span>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", width: "100%", height: 400, borderRadius: "0.75rem", overflow: "hidden", border: "2px solid rgba(0,0,0,0.1)" }}>
        {isLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666", fontSize: "0.875rem", fontWeight: 600 }}>
              <div style={{ width: 16, height: 16, border: "3px solid var(--black)", borderTopColor: "var(--yellow)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading chart...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
