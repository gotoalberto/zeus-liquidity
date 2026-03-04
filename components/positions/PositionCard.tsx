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
      label: "In Range",
      className: "badge-inrange",
    },
    "out-of-range": {
      label: "Out of Range",
      className: "badge-outrange",
    },
    closed: {
      label: "Closed",
      className: "badge-closed",
    },
  }

  const config = statusConfig[position.status]

  return (
    <div className="card-zeus p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-500 font-mono">
            #{position.tokenId.toString()}
          </span>
          <span className={config.className}>{config.label}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
            {formatCurrency(position.totalValueUsd)}
          </p>
          <p className="text-xs font-bold text-gray-500">Total Value</p>
        </div>
      </div>

      <hr className="divider-zeus" style={{ margin: "0" }} />

      {/* MCAP Range */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#f0e64e", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
      >
        <p className="text-xs uppercase tracking-widest mb-2 font-bold text-black/60">
          Market Cap Range
        </p>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
            {formatCurrency(position.minMcap)}
          </span>
          <span className="text-xl font-bold">→</span>
          <span className="text-lg font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
            {formatCurrency(position.maxMcap)}
          </span>
        </div>
      </div>

      {/* Token Amounts */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl p-3"
          style={{ background: "#d4e8ff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
        >
          <p className="text-xs font-bold text-gray-600 mb-1">ETH</p>
          <p className="text-lg font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
            {formatTokenAmount(position.amount0, 18, 6)}
          </p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "#d4e8ff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
        >
          <p className="text-xs font-bold text-gray-600 mb-1">ZEUS</p>
          <p className="text-lg font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
            {formatTokenAmount(position.amount1, ZEUS_DECIMALS, 4)}
          </p>
        </div>
      </div>

      {/* Uncollected Fees */}
      {position.uncollectedFeesUsd > 0.01 && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: "#3bff8a", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
        >
          <div>
            <p className="text-xs font-bold text-black/60">Uncollected Fees</p>
            <p className="text-xl font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
              {formatCurrency(position.uncollectedFeesUsd)}
            </p>
          </div>
          <button
            onClick={() => onCollectFees?.(position.tokenId)}
            className="btn-zeus"
            style={{ fontFamily: "var(--font-titan-one)", fontSize: "0.95rem", padding: "0.5rem 1.5rem" }}
          >
            Collect
          </button>
        </div>
      )}

      {/* Advanced Details */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-bold text-gray-500 hover:text-black transition-colors list-none flex items-center gap-2 select-none">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          Advanced Details
        </summary>
        <div
          className="mt-3 space-y-2 text-sm rounded-xl p-3"
          style={{ background: "#d4e8ff", border: "2px solid #000" }}
        >
          <div className="flex justify-between">
            <span className="font-bold text-gray-600">Price Range (ETH):</span>
            <span className="font-mono text-xs font-bold">
              {position.minPriceEth.toFixed(8)} – {position.maxPriceEth.toFixed(8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-600">Tick Range:</span>
            <span className="font-mono text-xs font-bold">
              {position.tickLower} – {position.tickUpper}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-600">Liquidity:</span>
            <span className="font-mono text-xs font-bold">{position.liquidity.toString()}</span>
          </div>
        </div>
      </details>

      {/* Action Buttons */}
      {position.status !== "closed" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onClosePosition?.(position.tokenId)}
            className="flex-1 px-4 py-2.5 font-bold text-sm rounded-2xl transition-all"
            style={{
              background: "#fff",
              border: "2px solid #ff4444",
              color: "#ff4444",
              boxShadow: "3px 3px 0 #ff4444",
              fontFamily: "var(--font-titan-one)",
            }}
          >
            Close Position
          </button>
        </div>
      )}
    </div>
  )
}
