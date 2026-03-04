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
      <div className="bg-card rounded-lg border border-border p-6">
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
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Current Market Cap</p>
        <p className="text-2xl font-bold font-mono">{formatCurrency(currentMcap)}</p>
      </div>

      {/* Preset Buttons */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">Presets</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyPreset("conservative")}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors"
          >
            Conservative
            <span className="block text-xs text-muted-foreground mt-1">80% - 300%</span>
          </button>
          <button
            onClick={() => applyPreset("moderate")}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors"
          >
            Moderate
            <span className="block text-xs text-muted-foreground mt-1">50% - 1000%</span>
          </button>
          <button
            onClick={() => applyPreset("aggressive")}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors"
          >
            Aggressive
            <span className="block text-xs text-muted-foreground mt-1">20% - 5000%</span>
          </button>
        </div>
      </div>

      {/* MCAP Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Min Market Cap (USD)</label>
          <input
            type="number"
            value={minMcap}
            onChange={(e) => setMinMcap(e.target.value)}
            placeholder="1000000"
            className="w-full px-4 py-2 bg-input border border-border rounded-lg font-mono focus:outline-none focus:border-primary"
          />
          {minMcapNum > 0 && (
            <p className="text-xs text-muted-foreground">
              ≈ {formatCurrency(minMcapNum)} (
              {(minMcapNum / priceData.circulatingSupply).toFixed(6)} ZEUS/USD)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Max Market Cap (USD)</label>
          <input
            type="number"
            value={maxMcap}
            onChange={(e) => setMaxMcap(e.target.value)}
            placeholder="10000000"
            className="w-full px-4 py-2 bg-input border border-border rounded-lg font-mono focus:outline-none focus:border-primary"
          />
          {maxMcapNum > 0 && (
            <p className="text-xs text-muted-foreground">
              ≈ {formatCurrency(maxMcapNum)} (
              {(maxMcapNum / priceData.circulatingSupply).toFixed(6)} ZEUS/USD)
            </p>
          )}
        </div>
      </div>

      {/* Validation Warning */}
      {minMcapNum > 0 && maxMcapNum > 0 && minMcapNum >= maxMcapNum && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
          Min market cap must be less than max market cap
        </div>
      )}

      {/* Out of Range Warning */}
      {isOutOfRange && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-sm text-warning">
          ⚠️ Current price is outside your selected range. You'll need price to move into range to
          start earning fees.
        </div>
      )}

      {/* Advanced Details */}
      {minMcapNum > 0 && maxMcapNum > 0 && minMcapNum < maxMcapNum && (
        <details className="group" open={showAdvanced}>
          <summary
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault()
              setShowAdvanced(!showAdvanced)
            }}
          >
            <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
            Advanced Details
          </summary>
          <div className="mt-3 space-y-2 text-sm bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tick Range:</span>
              <span className="font-mono">
                {mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)} -{" "}
                {mcapToTick(maxMcapNum, ethPriceUsd, priceData.totalSupply)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Range (ETH):</span>
              <span className="font-mono">
                {tickToZeusEthPrice(
                  mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)
                ).toFixed(8)}{" "}
                -{" "}
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
