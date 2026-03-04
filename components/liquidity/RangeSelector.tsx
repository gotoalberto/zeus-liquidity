"use client"

/**
 * RangeSelector Component
 *
 * MCAP-based range selector - THE KEY DIFFERENTIATING FEATURE
 * Users define liquidity ranges by market cap milestones, not raw prices
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
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export function RangeSelector({ onRangeChange }: RangeSelectorProps) {
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  const [minMcap, setMinMcap] = useState<string>("")
  const [maxMcap, setMaxMcap] = useState<string>("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (!priceData || !ethPriceUsd || !minMcap || !maxMcap) return

    try {
      const minMcapNum = parseFloat(minMcap)
      const maxMcapNum = parseFloat(maxMcap)

      if (minMcapNum <= 0 || maxMcapNum <= 0 || minMcapNum >= maxMcapNum) return

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

    const range = getPresetRange(currentMcap, minMultiplier, maxMultiplier, ethPriceUsd, priceData.totalSupply)
    setMinMcap(range.minMcap.toString())
    setMaxMcap(range.maxMcap.toString())
  }

  if (!priceData || !ethPriceUsd) {
    return (
      <div
        className="p-5 rounded-2xl"
        style={{ background: "#d4e8ff", border: "2px solid #000" }}
      >
        <p className="font-bold text-gray-600">Loading market data...</p>
      </div>
    )
  }

  const currentMcap = priceData.marketCapUsd
  const minMcapNum = parseFloat(minMcap) || 0
  const maxMcapNum = parseFloat(maxMcap) || 0
  const isOutOfRange = minMcapNum > 0 && maxMcapNum > 0 && (currentMcap < minMcapNum || currentMcap > maxMcapNum)

  return (
    <div className="space-y-6">
      {/* Current Market Cap */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#f0e64e", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
      >
        <p className="text-xs uppercase tracking-widest mb-1 font-bold text-black/60">Current Market Cap</p>
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-titan-one)" }}>
          {formatCurrency(currentMcap)}
        </p>
      </div>

      {/* Preset Buttons */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-3">Presets</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "conservative" as const, label: "Conservative", range: "80% – 300%" },
            { key: "moderate" as const, label: "Moderate", range: "50% – 1000%" },
            { key: "aggressive" as const, label: "Aggressive", range: "20% – 5000%" },
          ].map(({ key, label, range }) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-3 py-3 rounded-xl text-sm font-bold text-center transition-all hover:-translate-y-0.5"
              style={{
                background: "#d4e8ff",
                border: "2px solid #000",
                boxShadow: "3px 3px 0 #000",
              }}
            >
              {label}
              <span className="block text-xs font-mono text-gray-600 mt-1">{range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MCAP Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Min Market Cap (USD)</label>
          <input
            type="number"
            value={minMcap}
            onChange={(e) => setMinMcap(e.target.value)}
            placeholder="1000000"
            className="input-zeus"
          />
          {minMcapNum > 0 && (
            <p className="text-xs font-bold text-gray-500 font-mono">
              {formatCurrency(minMcapNum)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Max Market Cap (USD)</label>
          <input
            type="number"
            value={maxMcap}
            onChange={(e) => setMaxMcap(e.target.value)}
            placeholder="10000000"
            className="input-zeus"
          />
          {maxMcapNum > 0 && (
            <p className="text-xs font-bold text-gray-500 font-mono">
              {formatCurrency(maxMcapNum)}
            </p>
          )}
        </div>
      </div>

      {/* Validation Warning */}
      {minMcapNum > 0 && maxMcapNum > 0 && minMcapNum >= maxMcapNum && (
        <div
          className="rounded-xl p-3 text-sm font-bold"
          style={{ background: "#ffeeee", border: "2px solid #ff4444", color: "#ff4444" }}
        >
          Min market cap must be less than max market cap
        </div>
      )}

      {/* Out of Range Warning */}
      {isOutOfRange && (
        <div
          className="rounded-xl p-3 text-sm font-bold"
          style={{ background: "#fff3cc", border: "2px solid #ff8800", color: "#885500" }}
        >
          Current price is outside your selected range. Price must move into range to earn fees.
        </div>
      )}

      {/* Advanced Details */}
      {minMcapNum > 0 && maxMcapNum > 0 && minMcapNum < maxMcapNum && (
        <details className="group" open={showAdvanced}>
          <summary
            className="cursor-pointer text-sm font-bold text-gray-500 hover:text-black transition-colors list-none flex items-center gap-2 select-none"
            onClick={(e) => {
              e.preventDefault()
              setShowAdvanced(!showAdvanced)
            }}
          >
            <span className={`transition-transform inline-block ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
            Advanced Details
          </summary>
          <div
            className="mt-3 space-y-2 text-sm rounded-xl p-4"
            style={{ background: "#d4e8ff", border: "2px solid #000" }}
          >
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Tick Range:</span>
              <span className="font-mono text-xs font-bold">
                {mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)} –{" "}
                {mcapToTick(maxMcapNum, ethPriceUsd, priceData.totalSupply)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Price Range (ETH):</span>
              <span className="font-mono text-xs font-bold">
                {tickToZeusEthPrice(mcapToTick(minMcapNum, ethPriceUsd, priceData.totalSupply)).toFixed(8)}{" "}
                –{" "}
                {tickToZeusEthPrice(mcapToTick(maxMcapNum, ethPriceUsd, priceData.totalSupply)).toFixed(8)}
              </span>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
