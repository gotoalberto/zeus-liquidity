"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createChart, ColorType, CandlestickSeries, type IChartApi, type ISeriesApi } from "lightweight-charts"
import { useZeusOHLC, useZeusPrice } from "@/hooks/useZeusPrice"
import { useEthPrice } from "@/hooks/useZeusPrice"
import { tickToMcap } from "@/lib/uniswap/mcap"

interface V4Position {
  tickLower: number
  tickUpper: number
  liquidity: string
}

function formatMcap(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

const TIMEFRAMES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
] as const

export function LiquidityDepthChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [days, setDays] = useState(7)

  const { data: ohlcData, isLoading: chartLoading } = useZeusOHLC(days)
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  const circulatingSupply = priceData?.circulatingSupply ?? 0
  const totalSupplyRaw = priceData?.totalSupply ?? 0n

  const { data: positionsData, isLoading: posLoading } = useQuery<{ positions: V4Position[] }>({
    queryKey: ["all-positions"],
    queryFn: async () => {
      const res = await fetch("/api/positions/all")
      if (!res.ok) throw new Error("Failed to fetch positions")
      return res.json()
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // Build chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.5)",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        visible: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        minimumWidth: 90,
      },
      localization: {
        priceFormatter: (price: number) => formatMcap(price),
      },
      crosshair: {
        vertLine: { color: "rgba(67,148,244,0.5)", width: 1, style: 3 },
        horzLine: { color: "rgba(67,148,244,0.5)", width: 1, style: 3 },
      },
    })

    chartRef.current = chart

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })
    candlestickSeriesRef.current = series

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
        drawOverlay()
      }
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [])

  // Load candle data
  useEffect(() => {
    if (!ohlcData || !candlestickSeriesRef.current) return
    const supply = circulatingSupply || 1
    const chartData = ohlcData.map((candle: any) => ({
      time: Math.floor(candle.timestamp / 1000) as any,
      open: candle.open * supply,
      high: candle.high * supply,
      low: candle.low * supply,
      close: candle.close * supply,
    }))
    candlestickSeriesRef.current.setData(chartData)
    if (chartRef.current) chartRef.current.timeScale().fitContent()
  }, [ohlcData, circulatingSupply])

  function drawOverlay() {
    if (!overlayRef.current || !chartRef.current || !positionsData?.positions || !ethPriceUsd || !totalSupplyRaw) return
    const canvas = overlayRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = chartContainerRef.current!.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const priceScale = chartRef.current.priceScale("right")
    const timeScale = chartRef.current.timeScale()

    // Get the visible price range from coordinate conversion
    // Use the series to convert price → y coordinate
    const series = candlestickSeriesRef.current
    if (!series) return

    for (const pos of positionsData.positions) {
      if (pos.tickLower >= pos.tickUpper) continue
      try {
        const mcapLower = tickToMcap(pos.tickLower, ethPriceUsd, totalSupplyRaw)
        const mcapUpper = tickToMcap(pos.tickUpper, ethPriceUsd, totalSupplyRaw)

        const yUpper = series.priceToCoordinate(mcapUpper)
        const yLower = series.priceToCoordinate(mcapLower)

        if (yUpper === null || yLower === null) continue

        const top = Math.min(yUpper, yLower)
        const bottom = Math.max(yUpper, yLower)
        const height = bottom - top

        if (height < 2) continue

        const currentMcap = priceData?.marketCapUsd ?? 0
        const inRange = currentMcap >= mcapLower && currentMcap <= mcapUpper
        const alpha = 0.18
        const color = inRange ? `rgba(240,230,78,${alpha})` : `rgba(67,148,244,${alpha})`
        const border = inRange ? `rgba(240,230,78,0.45)` : `rgba(67,148,244,0.35)`

        ctx.fillStyle = color
        ctx.fillRect(0, top, canvas.width - 90, height)

        // Draw top/bottom border lines
        ctx.strokeStyle = border
        ctx.lineWidth = 1
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        ctx.moveTo(0, top)
        ctx.lineTo(canvas.width - 90, top)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, bottom)
        ctx.lineTo(canvas.width - 90, bottom)
        ctx.stroke()
        ctx.setLineDash([])
      } catch {
        // ignore positions with invalid ticks
      }
    }
  }

  // Redraw overlay when positions or price data changes
  useEffect(() => {
    drawOverlay()
  }, [positionsData, ethPriceUsd, totalSupplyRaw, ohlcData, priceData])

  // Also redraw overlay after chart renders new data (subscribe to visible range changes)
  useEffect(() => {
    if (!chartRef.current) return
    const sub = chartRef.current.timeScale().subscribeVisibleTimeRangeChange(() => drawOverlay())
    return () => chartRef.current?.timeScale().unsubscribeVisibleTimeRangeChange(sub as any)
  }, [positionsData, ethPriceUsd, totalSupplyRaw, priceData])

  const isLoading = chartLoading || posLoading
  const posCount = positionsData?.positions?.length ?? 0

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Market Cap (USD)
          </span>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setDays(tf.days)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.78rem",
                padding: "0.3rem 0.85rem",
                borderRadius: "9999px",
                border: days === tf.days ? "1px solid rgba(240,230,78,0.5)" : "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                background: days === tf.days ? "rgba(240,230,78,0.15)" : "rgba(255,255,255,0.04)",
                color: days === tf.days ? "#f0e64e" : "rgba(255,255,255,0.5)",
                transition: "all 0.15s",
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
        {posCount > 0 && (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(240,230,78,0.5)", border: "1px solid rgba(240,230,78,0.7)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Active range</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(67,148,244,0.4)", border: "1px solid rgba(67,148,244,0.6)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Defense walls</span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
              {posCount} defender{posCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Chart container */}
      <div style={{ position: "relative", width: "100%", height: 420, borderRadius: "0.75rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        {isLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,15,30,0.8)", backdropFilter: "blur(8px)", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", fontWeight: 600 }}>
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "var(--yellow)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
        <canvas
          ref={overlayRef}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}
