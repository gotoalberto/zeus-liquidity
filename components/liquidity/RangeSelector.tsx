"use client"

/**
 * RangeSelector Component
 *
 * MCAP-based range selector - THE KEY DIFFERENTIATING FEATURE
 * Users define liquidity ranges by market cap milestones, not raw prices
 *
 * Features:
 * - Min/Max MCAP inputs (USD)
 * - Preset buttons (Conservative / Moderate / Aggressive)
 * - Displays equivalent prices in ETH and USD
 * - Shows tick values in collapsible "Advanced" section
 * - Validates range (tickLower < tickUpper)
 * - Shows warning if current price is outside range
 */

import { useState, useEffect } from "react"
import { PriceRange } from "@/types"
import { mcapToTick, tickToMcap, tickToZeusEthPrice, getPresetRange } from "@/lib/uniswap/mcap"
import { MCAP_RANGE_PRESETS } from "@/lib/constants"
import { useZeusPrice, useEthPrice } from "@/hooks/useZeusPrice"

interface RangeSelectorProps {
  onRangeChange: (range: PriceRange) => void
}

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

export function RangeSelector({ onRangeChange }: RangeSelectorProps) {
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  const [minMcap, setMinMcap] = useState<string>("")
  const [maxMcap, setMaxMcap] = useState<string>("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate range whenever inputs change
  useEffect(() => {
    if (!priceData || !ethPriceUsd || !minMcap || !maxMcap) return

    try {
      const minMcapNum = parseFloat(minMcap)
      const maxMcapNum = parseFloat(maxMcap)

      if (minMcapNum <= 0 || maxMcapNum <= 0 || minMcapNum >= maxMcapNum) {
        return
      }

      const minTick = mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)
      const maxTick = mcapToTick(maxMcapNum, ethPriceUsd, priceData.totalSupply)

      const minPriceEth = tickToZeusEthPrice(minTick)
      const maxPriceEth = tickToZeusEthPrice(maxTick)

      const range: PriceRange = {
        minMcap: minMcapNum,
        maxMcap: maxMcapNum,
        minTick,
        maxTick,
        minPriceEth,
        maxPriceEth,
        minPriceUsd: minMcapNum / (priceData.circulatingSupply || 1),
        maxPriceUsd: maxMcapNum / (priceData.circulatingSupply || 1),
      }

      onRangeChange(range)
    } catch (error) {
      console.error("Failed to calculate range:", error)
    }
  }, [minMcap, maxMcap, priceData, ethPriceUsd, onRangeChange])

  const applyPreset = (preset: keyof typeof MCAP_RANGE_PRESETS) => {
    if (!priceData || !ethPriceUsd) return

    const { minMultiplier, maxMultiplier } = MCAP_RANGE_PRESETS[preset]
    const currentMcap = priceData.marketCapUsd

    const range = getPresetRange(
      currentMcap,
      minMultiplier,
      maxMultiplier,
      ethPriceUsd,
      priceData.totalSupply
    )

    setMinMcap(range.minMcap.toString())
    setMaxMcap(range.maxMcap.toString())
  }

  if (!priceData || !ethPriceUsd) {
    return (
      <div className="card-zeus p-6">
        <p className="text-muted-foreground">Loading market data...</p>
      </div>
    )
  }

  const currentMcap = priceData.marketCapUsd
  const minMcapNum = parseFloat(minMcap) || 0
  const maxMcapNum = parseFloat(maxMcap) || 0
  const isOutOfRange =
    minMcapNum > 0 && maxMcapNum > 0 && (currentMcap < minMcapNum || currentMcap > maxMcapNum)

  return (
    <div className="space-y-6">
      {/* Current Market Cap */}
      <div className="bg-primary/8 border border-primary/25 rounded-xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Current Market Cap</p>
        <p className="text-2xl font-bold font-mono text-primary">{formatCurrency(currentMcap)}</p>
      </div>

      {/* Preset Buttons */}
      <div>
        <p className="text-sm text-muted-foreground mb-3 font-semibold uppercase tracking-widest text-xs">Presets</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "conservative" as const, label: "Conservative", range: "80% – 300%" },
            { key: "moderate" as const, label: "Moderate", range: "50% – 1000%" },
            { key: "aggressive" as const, label: "Aggressive", range: "20% – 5000%" },
          ].map(({ key, label, range }) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-3 py-3 bg-muted/30 border border-border rounded-xl text-sm font-semibold hover:border-primary/50 hover:bg-primary/8 transition-all text-center"
            >
              {label}
              <span className="block text-xs text-muted-foreground mt-1 font-mono">{range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MCAP Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Min Market Cap (USD)</label>
          <input
            type="number"
            value={minMcap}
            onChange={(e) => setMinMcap(e.target.value)}
            placeholder="1000000"
            className="input-zeus"
          />
          {minMcapNum > 0 && (
            <p className="text-xs text-muted-foreground font-mono">
              ≈ {formatCurrency(minMcapNum)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Max Market Cap (USD)</label>
          <input
            type="number"
            value={maxMcap}
            onChange={(e) => setMaxMcap(e.target.value)}
            placeholder="10000000"
            className="input-zeus"
          />
          {maxMcapNum > 0 && (
            <p className="text-xs text-muted-foreground font-mono">
              ≈ {formatCurrency(maxMcapNum)}
            </p>
          )}
        </div>
      </div>

      {/* Validation Warning */}
      {minMcapNum > 0 && maxMcapNum > 0 && minMcapNum >= maxMcapNum && (
        <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-3 text-sm text-destructive">
          ✗ Min market cap must be less than max market cap
        </div>
      )}

      {/* Out of Range Warning */}
      {isOutOfRange && (
        <div className="bg-warning/10 border border-warning/25 rounded-xl p-3 text-sm text-warning">
          ⚠ Current price is outside your selected range. Price must move into range to earn fees.
        </div>
      )}

      {/* Advanced Details */}
      {minMcapNum > 0 && maxMcapNum > 0 && minMcapNum < maxMcapNum && (
        <details className="group" open={showAdvanced}>
          <summary
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary transition-colors list-none flex items-center gap-2 select-none"
            onClick={(e) => {
              e.preventDefault()
              setShowAdvanced(!showAdvanced)
            }}
          >
            <span className={`transition-transform inline-block ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
            Advanced Details
          </summary>
          <div className="mt-3 space-y-2 text-sm bg-muted/20 rounded-xl p-4 border border-border/40">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tick Range:</span>
              <span className="font-mono text-xs">
                {mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)} –{" "}
                {mcapToTick(maxMcapNum, ethPriceUsd, priceData.totalSupply)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Range (ETH):</span>
              <span className="font-mono text-xs">
                {tickToZeusEthPrice(
                  mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)
                ).toFixed(8)}{" "}
                –{" "}
                {tickToZeusEthPrice(
                  mcapToTick(maxMcapNum, ethPriceUsd, priceData.totalSupply)
                ).toFixed(8)}
              </span>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
