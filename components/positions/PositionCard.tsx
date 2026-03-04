"use client"

import { Position } from "@/types"
import { ZEUS_DECIMALS } from "@/lib/constants"

interface PositionCardProps {
  position: Position
  onCollectFees?: (tokenId: bigint) => void
  onClosePosition?: (tokenId: bigint) => void
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatTokenAmount(amount: bigint, decimals: number, maxDecimals: number = 4): string {
  const human = Number(amount) / 10 ** decimals
  return human.toFixed(maxDecimals)
}

export function PositionCard({ position, onCollectFees, onClosePosition }: PositionCardProps) {
  const statusConfig = {
    "in-range": {
      label: "⚡ In Range",
      className: "badge-inrange",
    },
    "out-of-range": {
      label: "⚠ Out of Range",
      className: "badge-outrange",
    },
    closed: {
      label: "✗ Closed",
      className: "badge-closed",
    },
  }

  const config = statusConfig[position.status]

  return (
    <div className="card-zeus p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm font-mono">
            #{position.tokenId.toString()}
          </span>
          <span className={config.className}>{config.label}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(position.totalValueUsd)}
          </p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>
      </div>

      <hr className="divider-zeus" style={{margin:"0"}} />

      {/* MCAP Range */}
      <div className="bg-muted/30 rounded-xl p-4 border border-primary/15">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
          Market Cap Range
        </p>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold font-mono text-primary">
            {formatCurrency(position.minMcap)}
          </span>
          <span className="text-primary/60 text-lg">→</span>
          <span className="text-lg font-bold font-mono text-primary">
            {formatCurrency(position.maxMcap)}
          </span>
        </div>
      </div>

      {/* Token Amounts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">⟠ ETH</p>
          <p className="text-lg font-bold font-mono">
            {formatTokenAmount(position.amount0, 18, 6)}
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">⚡ ZEUS</p>
          <p className="text-lg font-bold font-mono">
            {formatTokenAmount(position.amount1, ZEUS_DECIMALS, 4)}
          </p>
        </div>
      </div>

      {/* Uncollected Fees */}
      {position.uncollectedFeesUsd > 0.01 && (
        <div className="bg-primary/8 border border-primary/25 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Uncollected Fees</p>
            <p className="text-xl font-bold font-mono text-primary">
              {formatCurrency(position.uncollectedFeesUsd)}
            </p>
          </div>
          <button
            onClick={() => onCollectFees?.(position.tokenId)}
            className="btn-zeus px-4 py-2 text-sm"
            style={{fontFamily:"var(--font-bangers)", fontSize:"0.95rem", letterSpacing:"0.06em"}}
          >
            COLLECT
          </button>
        </div>
      )}

      {/* Advanced Details */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors list-none flex items-center gap-2 select-none">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          Advanced Details
        </summary>
        <div className="mt-3 space-y-2 text-sm bg-muted/20 rounded-lg p-3 border border-border/40">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price Range (ETH):</span>
            <span className="font-mono text-xs">
              {position.minPriceEth.toFixed(8)} – {position.maxPriceEth.toFixed(8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tick Range:</span>
            <span className="font-mono text-xs">
              {position.tickLower} – {position.tickUpper}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Liquidity:</span>
            <span className="font-mono text-xs">{position.liquidity.toString()}</span>
          </div>
        </div>
      </details>

      {/* Action Buttons */}
      {position.status !== "closed" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onClosePosition?.(position.tokenId)}
            className="flex-1 px-4 py-2.5 bg-destructive/10 text-destructive border border-destructive/25 rounded-lg font-semibold text-sm hover:bg-destructive/20 transition-colors"
          >
            Close Position
          </button>
        </div>
      )}
    </div>
  )
}
