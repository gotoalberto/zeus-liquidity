"use client"

/**
 * PositionCard Component
 *
 * Displays individual position with:
 * - Token ID
 * - MCAP range (primary display)
 * - Price range (collapsible detail)
 * - Status badge (in-range / out-of-range / closed)
 * - Token amounts (ETH + ZEUS with 9 decimals)
 * - Total value in USD
 * - Uncollected fees
 * - Action buttons (Collect Fees / Close Position)
 */

import { Position } from "@/types"
import { ZEUS_DECIMALS } from "@/lib/constants"

interface PositionCardProps {
  position: Position
  onCollectFees?: (tokenId: bigint) => void
  onClosePosition?: (tokenId: bigint) => void
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatTokenAmount(amount: bigint, decimals: number, maxDecimals: number = 4): string {
  const human = Number(amount) / 10 ** decimals
  return human.toFixed(maxDecimals)
}

export function PositionCard({ position, onCollectFees, onClosePosition }: PositionCardProps) {
  const statusConfig = {
    "in-range": {
      label: "In Range",
      bgColor: "bg-success/10",
      textColor: "text-success",
      borderColor: "border-success/20",
    },
    "out-of-range": {
      label: "Out of Range",
      bgColor: "bg-warning/10",
      textColor: "text-warning",
      borderColor: "border-warning/20",
    },
    closed: {
      label: "Closed",
      bgColor: "bg-muted",
      textColor: "text-muted-foreground",
      borderColor: "border-muted",
    },
  }

  const config = statusConfig[position.status]

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold font-mono">#{position.tokenId.toString()}</h3>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
          >
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono">{formatCurrency(position.totalValueUsd)}</p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>
      </div>

      {/* MCAP Range (Primary Display) */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Cap Range</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-mono">{formatCurrency(position.minMcap)}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-lg font-bold font-mono">{formatCurrency(position.maxMcap)}</span>
        </div>
      </div>

      {/* Token Amounts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ETH Amount</p>
          <p className="text-lg font-bold font-mono">
            {formatTokenAmount(position.amount0, 18, 6)} ETH
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ZEUS Amount</p>
          <p className="text-lg font-bold font-mono">
            {formatTokenAmount(position.amount1, ZEUS_DECIMALS, 4)} ZEUS
          </p>
        </div>
      </div>

      {/* Uncollected Fees */}
      {position.uncollectedFeesUsd > 0.01 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Uncollected Fees</p>
              <p className="text-lg font-bold font-mono text-primary">
                {formatCurrency(position.uncollectedFeesUsd)}
              </p>
            </div>
            <button
              onClick={() => onCollectFees?.(position.tokenId)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Collect
            </button>
          </div>
        </div>
      )}

      {/* Price Range (Collapsible Detail) */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
          <span className="group-open:rotate-90 transition-transform">▶</span>
          Advanced Details
        </summary>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price Range (ETH):</span>
            <span className="font-mono">
              {position.minPriceEth.toFixed(8)} - {position.maxPriceEth.toFixed(8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tick Range:</span>
            <span className="font-mono">
              {position.tickLower} - {position.tickUpper}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Liquidity:</span>
            <span className="font-mono">{position.liquidity.toString()}</span>
          </div>
        </div>
      </details>

      {/* Action Buttons */}
      {position.status !== "closed" && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onClosePosition?.(position.tokenId)}
            className="flex-1 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg font-medium hover:bg-destructive/20 transition-colors"
          >
            Close Position
          </button>
        </div>
      )}
    </div>
  )
}
