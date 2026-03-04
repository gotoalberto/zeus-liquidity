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
    "in-range": { label: "In Range", className: "badge-inrange" },
    "out-of-range": { label: "Out of Range", className: "badge-outrange" },
    closed: { label: "Closed", className: "badge-closed" },
  }

  const config = statusConfig[position.status]

  return (
    <div className="card-glass p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)" }}>
            #{position.tokenId.toString()}
          </span>
          <span className={config.className}>{config.label}</span>
        </div>
        <div className="text-right">
          <p style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.5rem", color: "#fff", letterSpacing: "0.02em" }}>
            {formatCurrency(position.totalValueUsd)}
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--foreground-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Value</p>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* MCAP Range */}
      <div style={{ background: "rgba(255,230,0,0.08)", border: "1px solid rgba(255,230,0,0.2)", borderRadius: "0.75rem", padding: "0.875rem 1rem" }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,230,0,0.6)", marginBottom: "0.4rem" }}>
          Market Cap Range
        </p>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.1rem", color: "#FFE600" }}>
            {formatCurrency(position.minMcap)}
          </span>
          <span style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>→</span>
          <span style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.1rem", color: "#FFE600" }}>
            {formatCurrency(position.maxMcap)}
          </span>
        </div>
      </div>

      {/* Token Amounts */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { symbol: "ETH", amount: formatTokenAmount(position.amount0, 18, 6) },
          { symbol: "ZEUS", amount: formatTokenAmount(position.amount1, ZEUS_DECIMALS, 4) },
        ].map(({ symbol, amount }) => (
          <div key={symbol} style={{ background: "rgba(67,148,244,0.08)", border: "1px solid rgba(67,148,244,0.2)", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(67,148,244,0.7)", marginBottom: "0.3rem" }}>{symbol}</p>
            <p style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.1rem", color: "#4394f4" }}>{amount}</p>
          </div>
        ))}
      </div>

      {/* Uncollected Fees */}
      {position.uncollectedFeesUsd > 0.01 && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "0.75rem", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(34,197,94,0.6)", marginBottom: "0.3rem" }}>Uncollected Fees</p>
            <p style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.25rem", color: "#22c55e" }}>
              {formatCurrency(position.uncollectedFeesUsd)}
            </p>
          </div>
          <button
            onClick={() => onCollectFees?.(position.tokenId)}
            className="btn-primary"
            style={{ fontSize: "0.875rem", padding: "0.5rem 1.25rem" }}
          >
            Collect
          </button>
        </div>
      )}

      {/* Advanced Details */}
      <details className="group">
        <summary style={{ cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground-muted)", listStyle: "none", display: "flex", alignItems: "center", gap: "0.4rem", userSelect: "none" }}
          className="hover:text-white transition-colors">
          <span className="group-open:rotate-90 transition-transform inline-block" style={{ fontSize: "0.6rem" }}>▶</span>
          Advanced Details
        </summary>
        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.5rem", padding: "0.75rem 1rem", border: "1px solid var(--border)" }}>
          {[
            { label: "Price Range (ETH)", value: `${position.minPriceEth.toFixed(8)} – ${position.maxPriceEth.toFixed(8)}` },
            { label: "Tick Range", value: `${position.tickLower} – ${position.tickUpper}` },
            { label: "Liquidity", value: position.liquidity.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span style={{ color: "var(--foreground-muted)", fontWeight: 600 }}>{label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#fff" }}>{value}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Action Buttons */}
      {position.status !== "closed" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onClosePosition?.(position.tokenId)}
            className="btn-outline flex-1"
            style={{ fontSize: "0.875rem", padding: "0.6rem 1rem", borderColor: "rgba(239,68,68,0.4)", color: "#ef4444" }}
          >
            Close Position
          </button>
        </div>
      )}
    </div>
  )
}
