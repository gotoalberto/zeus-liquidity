"use client"

/**
 * MarketStats Component
 *
 * Displays current ZEUS market statistics:
 * - Price (USD & ETH)
 * - Market cap
 * - 24h volume
 * - 24h price change
 */

import { useZeusPrice } from "@/hooks/useZeusPrice"

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatPrice(value: number): string {
  if (value < 0.01) {
    return `$${value.toFixed(6)}`
  }
  return `$${value.toFixed(4)}`
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function MarketStats() {
  const { data: priceData, isLoading, error } = useZeusPrice()

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <p className="text-sm text-destructive">Failed to load market data</p>
      </div>
    )
  }

  if (isLoading || !priceData) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const priceChangeColor =
    priceData.priceChange24h >= 0 ? "text-success" : "text-destructive"

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Price USD */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Price (USD)
          </p>
          <p className="text-2xl font-bold font-mono">
            {formatPrice(priceData.priceUsd)}
          </p>
          <p className={`text-sm font-medium ${priceChangeColor}`}>
            {formatPercentage(priceData.priceChange24h)}
          </p>
        </div>

        {/* Price ETH */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Price (ETH)
          </p>
          <p className="text-2xl font-bold font-mono">
            {priceData.priceEth.toFixed(8)}
          </p>
          <p className="text-xs text-muted-foreground">ETH</p>
        </div>

        {/* Market Cap */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Market Cap
          </p>
          <p className="text-2xl font-bold font-mono">
            {formatCurrency(priceData.marketCapUsd)}
          </p>
          <p className="text-xs text-muted-foreground">
            FDV: {formatCurrency(priceData.fullyDilutedValuation)}
          </p>
        </div>

        {/* 24h Volume */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            24h Volume
          </p>
          <p className="text-2xl font-bold font-mono">
            {formatCurrency(priceData.volume24h)}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}
