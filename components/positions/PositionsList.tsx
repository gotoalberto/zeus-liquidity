"use client"

import { usePositions, usePortfolioValue } from "@/hooks/usePositions"
import { PositionCard } from "./PositionCard"
import { useAccount } from "wagmi"

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

const emptyState = (text: string, sub?: string) => (
  <div className="card-zeus p-8 text-center">
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{text}</p>
      {sub && <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{sub}</p>}
    </div>
  </div>
)

export function PositionsList() {
  const { isConnected } = useAccount()
  const { data: positions, isLoading, error } = usePositions()
  const { totalValueUsd, totalFeesUsd, positionCount } = usePortfolioValue()

  if (!isConnected) return emptyState("Connect your wallet", "Connect your wallet to view your liquidity positions")

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="card-zeus p-6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-7 w-32" />
              </div>
            ))}
          </div>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="card-zeus p-6" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-20 w-full" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="skeleton h-16 w-full" />
              <div className="skeleton h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) return emptyState("Failed to load positions", (error as Error).message)

  if (!positions || positions.length === 0) return emptyState("No positions yet", "Add liquidity to the ZEUS/ETH pool to start earning fees")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Portfolio Summary */}
      <div className="card-zeus p-6" style={{ position: "sticky", top: 80, zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "1.5rem" }} className="md:grid-cols-3">
          {[
            { label: "Total Portfolio Value", value: formatCurrency(totalValueUsd), color: "#fff" },
            { label: "Uncollected Fees", value: formatCurrency(totalFeesUsd), color: "#22c55e" },
            { label: "Active Positions", value: String(positionCount), color: "#4394f4" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.3rem" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color, letterSpacing: "0.01em" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Position Cards */}
      {positions.map((position) => (
        <PositionCard
          key={position.tokenId.toString()}
          position={position}
          onCollectFees={(tokenId) => console.log("Collect fees for position", tokenId)}
          onClosePosition={(tokenId) => console.log("Close position", tokenId)}
        />
      ))}
    </div>
  )
}
