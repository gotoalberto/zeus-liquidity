"use client"

import { useZeusPrice } from "@/hooks/useZeusPrice"

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatPrice(value: number): string {
  if (value < 0.01) return `$${value.toFixed(6)}`
  return `$${value.toFixed(4)}`
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  isPositive?: boolean
  accent?: "yellow" | "blue" | "green" | "default"
}

function StatCard({ label, value, sub, isPositive, accent = "default" }: StatCardProps) {
  const accentColors = {
    yellow: "#FFE600",
    blue: "#4394f4",
    green: "#22c55e",
    default: "rgba(255,255,255,0.7)",
  }
  const valueColor = accentColors[accent]

  return (
    <div
      className="card-glass p-5 flex flex-col gap-2"
      style={{ minHeight: "110px" }}
    >
      <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--foreground-muted)" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.5rem", color: valueColor, letterSpacing: "0.02em", lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: isPositive === undefined ? "var(--foreground-muted)" : isPositive ? "#22c55e" : "#ef4444" }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export function MarketStats() {
  const { data: priceData, isLoading, error } = useZeusPrice()

  if (error) {
    return (
      <div className="card-glass p-4">
        <p style={{ fontSize: "0.875rem", color: "#ef4444" }}>Failed to load market data</p>
      </div>
    )
  }

  if (isLoading || !priceData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-glass p-5" style={{ minHeight: "110px" }}>
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-28 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
    )
  }

  const isPositive = priceData.priceChange24h >= 0
  const priceChangeText = formatPercentage(priceData.priceChange24h) + " 24h"

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        accent="yellow"
        label="Price (USD)"
        value={formatPrice(priceData.priceUsd)}
        sub={priceChangeText}
        isPositive={isPositive}
      />
      <StatCard
        accent="blue"
        label="Price (ETH)"
        value={priceData.priceEth.toFixed(8)}
        sub="ETH pair"
      />
      <StatCard
        accent="default"
        label="Market Cap"
        value={formatCurrency(priceData.marketCapUsd)}
        sub={`FDV: ${formatCurrency(priceData.fullyDilutedValuation)}`}
      />
      <StatCard
        accent="green"
        label="24h Volume"
        value={formatCurrency(priceData.volume24h)}
        sub={`Updated: ${new Date(priceData.lastUpdated).toLocaleTimeString()}`}
      />
    </div>
  )
}
