"use client"

import { usePositions } from "@/hooks/usePositions"
import { useZeusPrice, useEthPrice } from "@/hooks/useZeusPrice"
import { PositionCard } from "./PositionCard"
import { useAccount } from "wagmi"

const EmptyState = ({ text, sub }: { text: string; sub?: string }) => (
  <div style={{
    background: "var(--glass-bg)", border: "1px solid var(--glass-border-bright)",
    borderRadius: "1.25rem", padding: "3rem 2rem", textAlign: "center",
    backdropFilter: "blur(12px)",
  }}>
    <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{text}</p>
    {sub && <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{sub}</p>}
  </div>
)

const SkeletonCard = () => (
  <div style={{
    background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
    borderRadius: "1.25rem", padding: "1.5rem",
    display: "flex", flexDirection: "column", gap: "1.25rem",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div className="skeleton" style={{ height: 20, width: 120, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 6 }} />
    </div>
    <div className="skeleton" style={{ height: 68, width: "100%", borderRadius: 12 }} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      <div className="skeleton" style={{ height: 72, borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 72, borderRadius: 12 }} />
    </div>
    <div className="skeleton" style={{ height: 60, width: "100%", borderRadius: 12 }} />
  </div>
)

export function PositionsList() {
  const { isConnected } = useAccount()
  const { data: positions, isLoading, error } = usePositions()
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  if (!isConnected) return <EmptyState text="Connect your wallet" sub="Connect your wallet to view your liquidity positions" />
  if (isLoading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
  if (error) return <EmptyState text="Failed to load positions" sub={(error as Error).message} />
  if (!positions || positions.length === 0) return (
    <EmptyState text="No positions yet" sub="Add liquidity to the ZEUS/ETH pool to start earning fees" />
  )

  const eth = ethPriceUsd ?? 0
  const zeus = priceData?.priceUsd ?? 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {positions.map((position) => (
        <PositionCard
          key={position.tokenId.toString()}
          position={position}
          ethPriceUsd={eth}
          zeusPriceUsd={zeus}
          onCollectFees={(tokenId) => console.log("Collect fees", tokenId)}
          onClosePosition={(tokenId) => console.log("Close position", tokenId)}
        />
      ))}
    </div>
  )
}
