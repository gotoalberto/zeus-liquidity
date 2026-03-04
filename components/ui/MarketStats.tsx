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
  icon?: string
}

function StatCard({ label, value, sub, subColor, icon }: StatCardProps) {
  return (
    <div className="card-zeus p-5 space-y-2 group">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold font-mono text-foreground group-hover:text-primary transition-colors">
        {value}
      </p>
      {sub && (
        <p className={`text-sm font-medium ${subColor || "text-muted-foreground"}`}>
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
        <p className="text-sm text-destructive">⚠ Failed to load market data</p>
      </div>
    )
  }

  if (isLoading || !priceData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-zeus p-5 space-y-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-28" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
    )
  }

  const priceChangeColor = priceData.priceChange24h >= 0 ? "text-success" : "text-destructive"
  const priceChangeIcon = priceData.priceChange24h >= 0 ? "📈" : "📉"

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon="💰"
        label="Price (USD)"
        value={formatPrice(priceData.priceUsd)}
        sub={`${priceChangeIcon} ${formatPercentage(priceData.priceChange24h)}`}
        subColor={priceChangeColor}
      />
      <StatCard
        icon="⟠"
        label="Price (ETH)"
        value={priceData.priceEth.toFixed(8)}
        sub="ETH"
      />
      <StatCard
        icon="🏛️"
        label="Market Cap"
        value={formatCurrency(priceData.marketCapUsd)}
        sub={`FDV: ${formatCurrency(priceData.fullyDilutedValuation)}`}
      />
      <StatCard
        icon="📊"
        label="24h Volume"
        value={formatCurrency(priceData.volume24h)}
        sub={`Updated: ${new Date(priceData.lastUpdated).toLocaleTimeString()}`}
      />
    </div>
  )
}
