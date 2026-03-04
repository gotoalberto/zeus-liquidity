"use client"

import { useZeusPrice } from "@/hooks/useZeusPrice"

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatPrice(value: number): string {
  if (value < 0.000001) return `$${value.toExponential(3)}`
  if (value < 0.0001) return `$${value.toFixed(9)}`
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
  const accentBg = { yellow: "#f0e64e", blue: "#4394f4", green: "#22c55e", default: "#fff" }
  const accentText = { yellow: "#000", blue: "#fff", green: "#fff", default: "#000" }

  return (
    <div className="card-zeus" style={{ padding: "1.25rem 1.5rem", minHeight: 110 }}>
      <div style={{ background: accentBg[accent], border: "2px solid var(--black)", borderRadius: "0.5rem", padding: "0.2rem 0.6rem", display: "inline-block", marginBottom: "0.6rem", boxShadow: "2px 2px 0 var(--black)" }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accentText[accent] }}>{label}</p>
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "#000", letterSpacing: "0.01em", lineHeight: 1, marginBottom: "0.35rem" }}>{value}</p>
      {sub && (
        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: isPositive === undefined ? "#666" : isPositive ? "#22c55e" : "#ef4444" }}>{sub}</p>
      )}
    </div>
  )
}

export function MarketStats() {
  const { data: priceData, isLoading, error } = useZeusPrice()

  if (error) {
    return (
      <div className="card-zeus" style={{ padding: "1rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#ef4444", fontWeight: 700 }}>Failed to load market data</p>
      </div>
    )
  }

  if (isLoading || !priceData) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-zeus" style={{ padding: "1.25rem 1.5rem", minHeight: 110 }}>
            <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: 110, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: 60 }} />
          </div>
        ))}
      </div>
    )
  }

  const isPositive = priceData.priceChange24h >= 0
  const priceChangeText = formatPercentage(priceData.priceChange24h) + " 24h"

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
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
        value={priceData.priceEth < 0.000001 ? priceData.priceEth.toExponential(3) : priceData.priceEth.toFixed(10)}
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
