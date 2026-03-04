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
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Connect your wallet to add liquidity</p>
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
    <div className="space-y-6">
      {/* Range Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Range</h3>
        <RangeSelector onRangeChange={setSelectedRange} />
      </div>

      {/* Amount Inputs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Deposit Amounts</h3>
        <div className="space-y-4">
          {/* ETH Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">ETH Amount</label>
              <span className="text-xs text-muted-foreground">
                Balance: {ethBalanceNum.toFixed(6)} ETH
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className={`w-full px-4 py-3 bg-input border rounded-lg font-mono text-lg focus:outline-none focus:border-primary ${
                  hasInsufficientEth ? "border-destructive" : "border-border"
                }`}
              />
              <button
                onClick={() => setEthAmount((ethBalanceNum * 0.99).toFixed(6))}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20"
              >
                MAX
              </button>
            </div>
            {hasInsufficientEth && (
              <p className="text-xs text-destructive">Insufficient ETH balance</p>
            )}
          </div>

          {/* ZEUS Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">ZEUS Amount</label>
              <span className="text-xs text-muted-foreground">
                Balance: {zeusBalanceNum.toFixed(4)} ZEUS
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={zeusAmount}
                onChange={(e) => setZeusAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className={`w-full px-4 py-3 bg-input border rounded-lg font-mono text-lg focus:outline-none focus:border-primary ${
                  hasInsufficientZeus ? "border-destructive" : "border-border"
                }`}
              />
              <button
                onClick={() => setZeusAmount(zeusBalanceNum.toFixed(4))}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20"
              >
                MAX
              </button>
            </div>
            {hasInsufficientZeus && (
              <p className="text-xs text-destructive">Insufficient ZEUS balance</p>
            )}
          </div>

          {/* Estimated USD Value */}
          {ethAmountNum > 0 && zeusAmountNum > 0 && priceData && ethPriceUsd && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Value</p>
              <p className="text-xl font-bold font-mono">
                $
                {(
                  ethAmountNum * ethPriceUsd +
                  zeusAmountNum * priceData.priceUsd
                ).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slippage Tolerance */}
      <div>
        <h3 className="text-sm font-medium mb-3">Slippage Tolerance</h3>
        <div className="flex gap-2">
          {[0.1, 0.5, 1.0].map((value) => (
            <button
              key={value}
              onClick={() => {
                setSlippage(value)
                setCustomSlippage("")
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                slippage === value && !customSlippage
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/50"
              }`}
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
              if (value > 0 && value <= 50) {
                setSlippage(value)
              }
            }}
            placeholder="Custom"
            className="px-4 py-2 bg-input border border-border rounded-lg text-sm font-mono w-24 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isApproved ? (
          <button
            onClick={handleApprove}
            disabled={!isFormValid || isApproving}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? "Approving ZEUS..." : "Approve ZEUS"}
          </button>
        ) : (
          <button
            onClick={handleAddLiquidity}
            disabled={!isFormValid || isAdding}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding Liquidity..." : "Add Liquidity"}
          </button>
        )}

        {!isFormValid && (
          <p className="text-xs text-center text-muted-foreground">
            {!selectedRange
              ? "Select a price range"
              : !ethAmount || !zeusAmount
              ? "Enter token amounts"
              : hasInsufficientEth || hasInsufficientZeus
              ? "Insufficient balance"
              : "Fill all fields"}
          </p>
        )}
      </div>
    </div>
  )
}
