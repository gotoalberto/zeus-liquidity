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
  subColor?: string
  variant?: "yellow" | "blue" | "white" | "green"
}

function StatCard({ label, value, sub, subColor, variant = "white" }: StatCardProps) {
  const bgMap = {
    yellow: { background: "#f0e64e", color: "#000" },
    blue: { background: "#1a6fd4", color: "#fff" },
    white: { background: "#ffffff", color: "#000" },
    green: { background: "#3bff8a", color: "#000" },
  }
  const style = bgMap[variant]

  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: style.background,
        color: style.color,
        border: "3px solid #000",
        boxShadow: "5px 5px 0 #000",
      }}
    >
      <p
        className="text-xs uppercase tracking-widest font-bold mb-2 opacity-70"
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-titan-one)", letterSpacing: "0.02em" }}
      >
        {value}
      </p>
      {sub && (
        <p className={`text-sm font-bold mt-1 ${subColor || "opacity-70"}`}>
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
      <div className="card-zeus p-4">
        <p className="text-sm font-bold text-destructive">Failed to load market data</p>
      </div>
    )
  }

  if (isLoading || !priceData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl" style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-28 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
    )
  }

  const isPositive = priceData.priceChange24h >= 0
  const priceChangeText = `${isPositive ? "+" : ""}${formatPercentage(priceData.priceChange24h)} 24h`

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        variant="yellow"
        label="Price (USD)"
        value={formatPrice(priceData.priceUsd)}
        sub={priceChangeText}
        subColor={isPositive ? "text-green-700" : "text-red-600"}
      />
      <StatCard
        variant="blue"
        label="Price (ETH)"
        value={priceData.priceEth.toFixed(8)}
        sub="ETH"
      />
      <StatCard
        variant="white"
        label="Market Cap"
        value={formatCurrency(priceData.marketCapUsd)}
        sub={`FDV: ${formatCurrency(priceData.fullyDilutedValuation)}`}
      />
      <StatCard
        variant="green"
        label="24h Volume"
        value={formatCurrency(priceData.volume24h)}
        sub={`Updated: ${new Date(priceData.lastUpdated).toLocaleTimeString()}`}
      />
    </div>
  )
}
