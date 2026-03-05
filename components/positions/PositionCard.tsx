"use client"

import { Position } from "@/types"
import { ZEUS_DECIMALS } from "@/lib/constants"

interface PositionCardProps {
  position: Position
  ethPriceUsd: number
  zeusPriceUsd: number
  onCollectFees?: (tokenId: bigint) => void
  onClosePosition?: (tokenId: bigint) => void
}

function fmtUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function fmtToken(amount: bigint, decimals: number, dp = 6): string {
  return (Number(amount) / 10 ** decimals).toFixed(dp)
}

const STATUS = {
  "in-range":    { label: "In Range",     bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.35)",  text: "#4ade80" },
  "out-of-range":{ label: "Out of Range", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.35)", text: "#fbbf24" },
  "closed":      { label: "Closed",       bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)",text: "#94a3b8" },
}

export function PositionCard({ position, ethPriceUsd, zeusPriceUsd, onCollectFees, onClosePosition }: PositionCardProps) {
  const s = STATUS[position.status]

  const ethAmount   = Number(position.amount0) / 1e18
  const zeusAmount  = Number(position.amount1) / 10 ** ZEUS_DECIMALS
  const ethValueUsd  = ethAmount * ethPriceUsd
  const zeusValueUsd = zeusAmount * zeusPriceUsd

  const feesEth   = Number(position.tokensOwed0) / 1e18
  const feesZeus  = Number(position.tokensOwed1) / 10 ** ZEUS_DECIMALS
  const feesEthUsd  = feesEth * ethPriceUsd
  const feesZeusUsd = feesZeus * zeusPriceUsd
  const totalFeesUsd = feesEthUsd + feesZeusUsd
  const hasCollectableFees = totalFeesUsd > 0.001

  // Ensure minMcap < maxMcap for display
  const mcapLow  = Math.min(position.minMcap, position.maxMcap)
  const mcapHigh = Math.max(position.minMcap, position.maxMcap)

  return (
    <div style={{
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border-bright)",
      borderRadius: "1.25rem",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      backdropFilter: "blur(12px)",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace", letterSpacing: "0.02em" }}>
            #{position.tokenId.toString()}
          </span>
          <span style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "0.25rem 0.75rem", borderRadius: "9999px",
            background: s.bg, border: `1px solid ${s.border}`, color: s.text,
          }}>
            {s.label}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff", lineHeight: 1.1 }}>
            {fmtUsd(position.totalValueUsd)}
          </p>
          <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.2rem" }}>
            Total Value
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--glass-border)" }} />

      {/* ── MCAP Range ── */}
      <div style={{
        background: "rgba(240,230,78,0.06)", border: "1px solid rgba(240,230,78,0.18)",
        borderRadius: "0.875rem", padding: "0.875rem 1.125rem",
      }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,230,78,0.5)", marginBottom: "0.5rem" }}>
          Market Cap Range
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", color: "var(--highlight)" }}>
            {fmtUsd(mcapLow)}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>→</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", color: "var(--highlight)" }}>
            {fmtUsd(mcapHigh)}
          </span>
        </div>
      </div>

      {/* ── Token Amounts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {[
          {
            symbol: "ETH",
            amount: ethAmount.toFixed(6),
            usdValue: ethValueUsd,
            accentBg: "rgba(109,156,244,0.08)",
            accentBorder: "rgba(109,156,244,0.2)",
            labelColor: "rgba(109,156,244,0.7)",
            valueColor: "#a8c8ff",
          },
          {
            symbol: "ZEUS",
            amount: zeusAmount.toFixed(4),
            usdValue: zeusValueUsd,
            accentBg: "rgba(240,230,78,0.06)",
            accentBorder: "rgba(240,230,78,0.18)",
            labelColor: "rgba(240,230,78,0.6)",
            valueColor: "var(--highlight)",
          },
        ].map(({ symbol, amount, usdValue, accentBg, accentBorder, labelColor, valueColor }) => (
          <div key={symbol} style={{
            background: accentBg, border: `1px solid ${accentBorder}`,
            borderRadius: "0.875rem", padding: "0.875rem 1rem",
          }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: labelColor, marginBottom: "0.3rem" }}>
              {symbol}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: valueColor, lineHeight: 1.2 }}>
              {amount}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {fmtUsd(usdValue)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Uncollected Fees ── */}
      <div style={{
        background: hasCollectableFees ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hasCollectableFees ? "rgba(34,197,94,0.22)" : "var(--glass-border)"}`,
        borderRadius: "0.875rem", padding: "0.875rem 1.125rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: hasCollectableFees ? "rgba(74,222,128,0.6)" : "var(--text-muted)", marginBottom: "0.35rem" }}>
            Uncollected Fees
          </p>
          {hasCollectableFees ? (
            <>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "#4ade80", lineHeight: 1.1 }}>
                {fmtUsd(totalFeesUsd)}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                {feesEth > 0 && (
                  <span style={{ fontSize: "0.7rem", color: "#a8c8ff" }}>
                    {feesEth.toFixed(6)} ETH <span style={{ color: "var(--text-muted)" }}>({fmtUsd(feesEthUsd)})</span>
                  </span>
                )}
                {feesZeus > 0 && (
                  <span style={{ fontSize: "0.7rem", color: "var(--highlight)" }}>
                    {feesZeus.toFixed(4)} ZEUS <span style={{ color: "var(--text-muted)" }}>({fmtUsd(feesZeusUsd)})</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No fees yet</p>
          )}
        </div>
        {hasCollectableFees && position.status !== "closed" && (
          <button
            onClick={() => onCollectFees?.(position.tokenId)}
            className="btn-zeus"
            style={{ fontSize: "0.82rem", padding: "0.45rem 1.1rem", flexShrink: 0 }}
          >
            Collect
          </button>
        )}
      </div>

      {/* ── Close Button ── */}
      {position.status !== "closed" && (
        <button
          onClick={() => onClosePosition?.(position.tokenId)}
          style={{
            width: "100%", padding: "0.65rem", borderRadius: "0.75rem", cursor: "pointer",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171", fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          Close Position
        </button>
      )}
    </div>
  )
}
