"use client"

/**
 * PositionsList Component
 *
 * Displays all user positions with:
 * - Summary stats (total value, total fees, position count)
 * - List of position cards
 * - Empty state when no positions
 * - Loading state
 * - Error handling
 */

import { usePositions, usePortfolioValue } from "@/hooks/usePositions"
import { PositionCard } from "./PositionCard"
import { useAccount } from "wagmi"

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

export function PositionsList() {
  const { isConnected } = useAccount()
  const { data: positions, isLoading, error } = usePositions()
  const { totalValueUsd, totalFeesUsd, positionCount } = usePortfolioValue()

  // Not connected state
  if (!isConnected) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-lg font-medium">Connect your wallet</p>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view your liquidity positions
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Summary Skeleton */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Position Cards Skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card rounded-lg border border-destructive/20 p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-lg font-medium text-destructive">Failed to load positions</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!positions || positions.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-lg font-medium">No positions yet</p>
          <p className="text-sm text-muted-foreground">
            Add liquidity to the ZEUS/ETH pool to start earning fees
          </p>
        </div>
      </div>
    )
  }

  // Positions list
  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="bg-card rounded-lg border border-border p-6 sticky top-20 z-10 backdrop-blur-sm bg-card/95">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Portfolio Value
            </p>
            <p className="text-2xl font-bold font-mono">{formatCurrency(totalValueUsd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Uncollected Fees
            </p>
            <p className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(totalFeesUsd)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Active Positions
            </p>
            <p className="text-2xl font-bold font-mono">{positionCount}</p>
          </div>
        </div>
      </div>

      {/* Position Cards */}
      <div className="space-y-4">
        {positions.map((position) => (
          <PositionCard
            key={position.tokenId.toString()}
            position={position}
            onCollectFees={(tokenId) => {
              console.log("Collect fees for position", tokenId)
              // Will implement in Step 7
            }}
            onClosePosition={(tokenId) => {
              console.log("Close position", tokenId)
              // Will implement in Step 7
            }}
          />
        ))}
      </div>
    </div>
  )
}
