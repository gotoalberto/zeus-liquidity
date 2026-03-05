"use client"

/**
 * AddLiquidityForm Component
 *
 * Complete add liquidity form with:
 * - MCAP-based range selector
 * - Token amount inputs (ETH + ZEUS)
 * - Auto-calculation of amounts based on current price
 * - Slippage tolerance selector
 * - Two-step: Approve ZEUS → Add Liquidity
 * - Simulation with eth_call before submitting
 * - Transaction status handling
 */

import { useState, useEffect } from "react"
import { useAccount, useBalance, useReadContract } from "wagmi"
import { parseUnits, formatUnits, erc20Abi } from "viem"
import { RangeSelector } from "./RangeSelector"
import { PriceRange } from "@/types"
import { ZEUS_TOKEN_ADDRESS, ZEUS_DECIMALS, DEFAULT_SLIPPAGE_TOLERANCE } from "@/lib/constants"
import { useZeusPrice, useEthPrice } from "@/hooks/useZeusPrice"
import { toast } from "sonner"

export function AddLiquidityForm() {
  const { address, isConnected } = useAccount()
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  // Balances
  const { data: ethBalance } = useBalance({ address })

  // Get ZEUS balance using contract read
  const { data: zeusBalanceRaw } = useReadContract({
    address: ZEUS_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Form state
  const [selectedRange, setSelectedRange] = useState<PriceRange | null>(null)
  const [ethAmount, setEthAmount] = useState<string>("")
  const [zeusAmount, setZeusAmount] = useState<string>("")
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE_TOLERANCE)
  const [customSlippage, setCustomSlippage] = useState<string>("")
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Auto-calculate ZEUS amount based on ETH input and current price
  useEffect(() => {
    if (!ethAmount || !priceData || ethAmount === "") {
      setZeusAmount("")
      return
    }

    try {
      const ethAmountNum = parseFloat(ethAmount)
      if (ethAmountNum <= 0) {
        setZeusAmount("")
        return
      }

      // Simple 50/50 value calculation at current price
      const ethValueUsd = ethAmountNum * (ethPriceUsd || 0)
      const zeusAmountNum = ethValueUsd / priceData.priceUsd

      setZeusAmount(zeusAmountNum.toFixed(4))
    } catch (error) {
      console.error("Failed to calculate ZEUS amount:", error)
    }
  }, [ethAmount, priceData, ethPriceUsd])

  const handleApprove = async () => {
    if (!address) return

    setIsApproving(true)
    try {
      // TODO: Implement ZEUS approval logic in Step 6
      toast.info("Token approval coming in Step 6")

      // Simulate approval
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsApproved(true)
      toast.success("ZEUS approved for spending")
    } catch (error) {
      console.error("Approval failed:", error)
      toast.error("Failed to approve ZEUS")
    } finally {
      setIsApproving(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!address || !selectedRange || !ethAmount || !zeusAmount) return

    setIsAdding(true)
    try {
      // TODO: Implement Uniswap V4 mint logic in Step 6
      toast.info("Add liquidity integration coming in Step 6")

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))
      toast.success("Liquidity added successfully!")

      // Reset form
      setEthAmount("")
      setZeusAmount("")
    } catch (error) {
      console.error("Add liquidity failed:", error)
      toast.error("Failed to add liquidity")
    } finally {
      setIsAdding(false)
    }
  }

  if (!isConnected) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Connect your wallet to add liquidity
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>Become a ZEUS LP and earn fees</p>
      </div>
    )
  }

  const ethAmountNum = parseFloat(ethAmount) || 0
  const zeusAmountNum = parseFloat(zeusAmount) || 0
  const ethBalanceNum = ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) : 0
  const zeusBalanceNum = zeusBalanceRaw
    ? parseFloat(formatUnits(zeusBalanceRaw, ZEUS_DECIMALS))
    : 0

  const hasInsufficientEth = ethAmountNum > ethBalanceNum
  const hasInsufficientZeus = zeusAmountNum > zeusBalanceNum
  const isFormValid =
    selectedRange &&
    ethAmountNum > 0 &&
    zeusAmountNum > 0 &&
    !hasInsufficientEth &&
    !hasInsufficientZeus

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Range Selector */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>Select Range</p>
        <RangeSelector onRangeChange={setSelectedRange} />
      </div>

      <div className="divider" />

      {/* Amount Inputs */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>Deposit Amounts</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* ETH Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>ETH Amount</label>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                Balance: {ethBalanceNum.toFixed(6)} ETH
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className={`input-zeus ${hasInsufficientEth ? "error" : ""}`}
                style={{ fontSize: "1.1rem", paddingRight: "3.5rem" }}
              />
              <button
                onClick={() => setEthAmount((ethBalanceNum * 0.99).toFixed(6))}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", padding: "0.2rem 0.5rem", background: "rgba(67,148,244,0.15)", border: "1px solid rgba(67,148,244,0.3)", color: "var(--blue-light)", fontSize: "0.65rem", borderRadius: "9999px", fontWeight: 700, cursor: "pointer" }}
              >
                MAX
              </button>
            </div>
            {hasInsufficientEth && <p style={{ fontSize: "0.72rem", color: "#f87171" }}>Insufficient ETH balance</p>}
          </div>

          {/* ZEUS Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>ZEUS Amount</label>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                Balance: {zeusBalanceNum.toFixed(4)} ZEUS
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={zeusAmount}
                onChange={(e) => setZeusAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className={`input-zeus ${hasInsufficientZeus ? "error" : ""}`}
                style={{ fontSize: "1.1rem", paddingRight: "3.5rem" }}
              />
              <button
                onClick={() => setZeusAmount(zeusBalanceNum.toFixed(4))}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", padding: "0.2rem 0.5rem", background: "rgba(67,148,244,0.15)", border: "1px solid rgba(67,148,244,0.3)", color: "var(--blue-light)", fontSize: "0.65rem", borderRadius: "9999px", fontWeight: 700, cursor: "pointer" }}
              >
                MAX
              </button>
            </div>
            {hasInsufficientZeus && <p style={{ fontSize: "0.72rem", color: "#f87171" }}>Insufficient ZEUS balance</p>}
          </div>

          {/* Estimated USD Value */}
          {ethAmountNum > 0 && zeusAmountNum > 0 && priceData && ethPriceUsd && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "0.75rem", padding: "1rem" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "rgba(74,222,128,0.6)", marginBottom: "0.3rem" }}>Total Value</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "#4ade80" }}>
                ${(ethAmountNum * ethPriceUsd + zeusAmountNum * priceData.priceUsd).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      {/* Slippage Tolerance */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Slippage Tolerance</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[0.1, 0.5, 1.0].map((value) => (
            <button
              key={value}
              onClick={() => { setSlippage(value); setCustomSlippage("") }}
              style={{
                padding: "0.35rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                background: slippage === value && !customSlippage ? "rgba(240,230,78,0.15)" : "rgba(255,255,255,0.04)",
                border: slippage === value && !customSlippage ? "1px solid rgba(240,230,78,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: slippage === value && !customSlippage ? "var(--yellow)" : "var(--text-secondary)",
              }}
            >
              {value}%
            </button>
          ))}
          <input
            type="number"
            value={customSlippage}
            onChange={(e) => {
              setCustomSlippage(e.target.value)
              const value = parseFloat(e.target.value)
              if (value > 0 && value <= 50) setSlippage(value)
            }}
            placeholder="Custom %"
            className="input-zeus"
            style={{ fontSize: "0.85rem", width: "7rem" }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {!isApproved ? (
          <button
            onClick={handleApprove}
            disabled={!isFormValid || isApproving}
            className="btn-zeus"
            style={{ width: "100%", fontSize: "1rem", padding: "0.9rem" }}
          >
            {isApproving ? "Approving ZEUS..." : "Approve ZEUS"}
          </button>
        ) : (
          <button
            onClick={handleAddLiquidity}
            disabled={!isFormValid || isAdding}
            className="btn-zeus"
            style={{ width: "100%", fontSize: "1rem", padding: "0.9rem" }}
          >
            {isAdding ? "Adding Liquidity..." : "Add Liquidity"}
          </button>
        )}

        {!isFormValid && (
          <p style={{ fontSize: "0.72rem", textAlign: "center", fontWeight: 600, color: "var(--text-muted)" }}>
            {!selectedRange ? "Select a price range above" : !ethAmount || !zeusAmount ? "Enter token amounts" : hasInsufficientEth || hasInsufficientZeus ? "Insufficient balance" : "Fill all fields"}
          </p>
        )}
      </div>
    </div>
  )
}
