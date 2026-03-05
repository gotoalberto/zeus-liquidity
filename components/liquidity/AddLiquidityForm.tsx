"use client"

/**
 * AddLiquidityForm Component
 *
 * Complete add liquidity form with:
 * - MCAP-based range selector
 * - Token amount inputs (ETH + ZEUS, or single token when out of range)
 * - Auto-calculation of amounts based on current price
 * - Slippage tolerance selector
 * - Two-step: Approve ZEUS → Add Liquidity (multicall)
 *
 * Out-of-range single-token behavior (Uniswap V4):
 *   Pool: currency0 = ETH (18 dec), currency1 = ZEUS (9 dec)
 *   minTick (from minMcap) is numerically > maxTick (from maxMcap)
 *   - currentTick < tickLower → mcap below range → ETH only
 *   - currentTick > tickUpper → mcap above range → ZEUS only
 *   - otherwise → both
 */

import { useState, useEffect } from "react"
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { parseUnits, formatUnits, erc20Abi, maxUint256, parseEther, encodeAbiParameters, encodePacked } from "viem"
import { RangeSelector } from "./RangeSelector"
import { PriceRange } from "@/types"
import {
  ZEUS_TOKEN_ADDRESS,
  ZEUS_DECIMALS,
  DEFAULT_SLIPPAGE_TOLERANCE,
  UNISWAP_V4_POSITION_MANAGER,
  POOL_FEE,
  POOL_TICK_SPACING,
  POOL_HOOKS_ADDRESS,
  CHAIN_ID,
} from "@/lib/constants"
import { useZeusPrice, useEthPrice } from "@/hooks/useZeusPrice"
import { mcapToTick } from "@/lib/uniswap/mcap"
import { toast } from "sonner"

// Uniswap V4 PositionManager — modifyLiquidities is the correct entry point
const POSITION_MANAGER_ABI = [
  {
    name: "modifyLiquidities",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "unlockData", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [],
  },
] as const

// Actions.sol constants
// MINT_POSITION_FROM_DELTAS (0x05): computes liquidity automatically from token amounts + current sqrtPrice
// No need to calculate liquidity offchain — the contract uses getLiquidityForAmounts internally
const ACTIONS = {
  MINT_POSITION_FROM_DELTAS: 0x05,
  SETTLE_PAIR: 0x0d,
} as const

/**
 * Encode unlockData for MINT_POSITION_FROM_DELTAS + SETTLE_PAIR
 *
 * MINT_POSITION_FROM_DELTAS params: (poolKey, tickLower, tickUpper, amount0Max, amount1Max, minLiquidity, recipient, hookData)
 * - amount0Max / amount1Max: max tokens to spend (slippage cap)
 * - minLiquidity: min liquidity to receive (set to 0 for no lower bound)
 * - The contract reads current sqrtPrice and calls getLiquidityForAmounts internally
 *
 * SETTLE_PAIR params: (currency0, currency1) — contract reads full debt automatically
 *
 * unlockData = abi.encode(bytes actions, bytes[] params)
 */
function encodeMintUnlockData({
  currency0, currency1, fee, tickSpacing, hooks,
  tickLower, tickUpper, amount0Max, amount1Max, recipient,
}: {
  currency0: `0x${string}`; currency1: `0x${string}`; fee: number
  tickSpacing: number; hooks: `0x${string}`; tickLower: number; tickUpper: number
  amount0Max: bigint; amount1Max: bigint; recipient: `0x${string}`
}): `0x${string}` {
  // actions: [MINT_POSITION_FROM_DELTAS, SETTLE_PAIR] packed as bytes
  const actions = encodePacked(
    ["uint8", "uint8"],
    [ACTIONS.MINT_POSITION_FROM_DELTAS, ACTIONS.SETTLE_PAIR]
  )

  // params[0]: MINT_POSITION_FROM_DELTAS params
  const mintParams = encodeAbiParameters(
    [
      { type: "tuple", components: [
        { name: "currency0", type: "address" },
        { name: "currency1", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "tickSpacing", type: "int24" },
        { name: "hooks", type: "address" },
      ]},
      { type: "int24" },   // tickLower
      { type: "int24" },   // tickUpper
      { type: "uint128" }, // amount0Max
      { type: "uint128" }, // amount1Max
      { type: "uint128" }, // minLiquidity (0 = no lower bound)
      { type: "address" }, // recipient
      { type: "bytes" },   // hookData
    ],
    [{ currency0, currency1, fee, tickSpacing, hooks }, tickLower, tickUpper, amount0Max, amount1Max, 0n, recipient, "0x"]
  )

  // params[1]: SETTLE_PAIR params
  const settleParams = encodeAbiParameters(
    [{ type: "address" }, { type: "address" }],
    [currency0, currency1]
  )

  // unlockData = abi.encode(actions, params)
  return encodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes[]" }],
    [actions, [mintParams, settleParams]]
  )
}

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000" as const

export function AddLiquidityForm() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  // Balances
  const { data: ethBalance } = useBalance({ address })

  const { data: zeusBalanceRaw } = useReadContract({
    address: ZEUS_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Check current ZEUS allowance for position manager
  const { data: zeusAllowance, refetch: refetchAllowance } = useReadContract({
    address: ZEUS_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, UNISWAP_V4_POSITION_MANAGER as `0x${string}`] : undefined,
    query: { enabled: !!address },
  })

  // Write contract hooks
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract()
  const { writeContract: writeMint, data: mintTxHash, isPending: isMinting } = useWriteContract()

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintTxHash })

  // Form state
  const [selectedRange, setSelectedRange] = useState<PriceRange | null>(null)
  const [ethAmount, setEthAmount] = useState<string>("")
  const [zeusAmount, setZeusAmount] = useState<string>("")
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE_TOLERANCE)
  const [customSlippage, setCustomSlippage] = useState<string>("")

  // Approval success effect
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("ZEUS approved!")
      refetchAllowance()
    }
  }, [isApproveSuccess, refetchAllowance])

  // Mint success effect
  useEffect(() => {
    if (isMintSuccess) {
      toast.success("Liquidity added successfully!")
      setEthAmount("")
      setZeusAmount("")
    }
  }, [isMintSuccess])

  // Determine which tokens are needed based on current price vs range
  // Pool: currency0 = ETH (18 dec), currency1 = ZEUS (9 dec)
  // minTick (from minMcap) is numerically > maxTick (from maxMcap) — inverted because higher mcap = lower ZEUS-per-ETH = lower tick
  const currentTick = priceData && ethPriceUsd
    ? mcapToTick(priceData.marketCapUsd, ethPriceUsd, priceData.totalSupply)
    : null

  const tickLower = selectedRange ? Math.min(selectedRange.minTick, selectedRange.maxTick) : null
  const tickUpper = selectedRange ? Math.max(selectedRange.minTick, selectedRange.maxTick) : null

  // In this pool higher tick = lower mcap (more ZEUS per ETH = cheaper ZEUS)
  // tickUpper (numerically higher) corresponds to lower mcap bound
  // tickLower (numerically lower) corresponds to higher mcap bound
  // currentTick > tickUpper → mcap below range → ZEUS only (currency1, cheaper side)
  // currentTick < tickLower → mcap above range → ETH only (currency0, expensive side)
  const isMcapBelowRange = selectedRange && currentTick !== null && tickUpper !== null && currentTick > tickUpper
  const isMcapAboveRange = selectedRange && currentTick !== null && tickLower !== null && currentTick < tickLower

  const needsZeus = !selectedRange || currentTick === null || !isMcapAboveRange
  const needsEth = !selectedRange || currentTick === null || !isMcapBelowRange

  // Auto-calculate ZEUS amount based on ETH when both needed
  useEffect(() => {
    if (!needsZeus || !needsEth) return
    if (!ethAmount || !priceData || ethAmount === "") {
      setZeusAmount("")
      return
    }
    try {
      const ethAmountNum = parseFloat(ethAmount)
      if (ethAmountNum <= 0) { setZeusAmount(""); return }
      const ethValueUsd = ethAmountNum * (ethPriceUsd || 0)
      const zeusAmountNum = ethValueUsd / priceData.priceUsd
      setZeusAmount(zeusAmountNum.toFixed(4))
    } catch { /* ignore */ }
  }, [ethAmount, priceData, ethPriceUsd, needsZeus, needsEth])

  // Clear irrelevant amounts when range changes
  useEffect(() => {
    if (isMcapBelowRange) setEthAmount("")
    else if (isMcapAboveRange) setZeusAmount("")
  }, [isMcapBelowRange, isMcapAboveRange])

  const ethAmountNum = parseFloat(ethAmount) || 0
  const zeusAmountNum = parseFloat(zeusAmount) || 0
  const ethBalanceNum = ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) : 0
  const zeusBalanceNum = zeusBalanceRaw ? parseFloat(formatUnits(zeusBalanceRaw, ZEUS_DECIMALS)) : 0

  const hasInsufficientEth = needsEth && ethAmountNum > ethBalanceNum && ethAmountNum > 0
  const hasInsufficientZeus = needsZeus && zeusAmountNum > zeusBalanceNum && zeusAmountNum > 0
  const ethAmountValid = !needsEth || ethAmountNum > 0
  const zeusAmountValid = !needsZeus || zeusAmountNum > 0
  const isFormValid = selectedRange && ethAmountValid && zeusAmountValid && !hasInsufficientEth && !hasInsufficientZeus

  // Check if ZEUS is already approved (allowance >= zeusAmount)
  const zeusAmountRaw = zeusAmountNum > 0 ? parseUnits(zeusAmount || "0", ZEUS_DECIMALS) : 0n
  const isZeusApproved = !needsZeus || (zeusAllowance !== undefined && zeusAllowance >= zeusAmountRaw)
  const isWrongChain = chainId !== CHAIN_ID

  const totalValueUsd = priceData && ethPriceUsd
    ? (needsEth ? ethAmountNum * ethPriceUsd : 0) + (needsZeus ? zeusAmountNum * priceData.priceUsd : 0)
    : 0

  const handleApprove = () => {
    if (!address || !zeusAmount) return
    writeApprove({
      address: ZEUS_TOKEN_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [UNISWAP_V4_POSITION_MANAGER as `0x${string}`, maxUint256],
    })
  }

  const handleAddLiquidity = () => {
    if (!address || !selectedRange || !isFormValid) return
    if (isWrongChain) { toast.error("Switch to Ethereum Mainnet"); return }

    const tLower = Math.min(selectedRange.minTick, selectedRange.maxTick)
    const tUpper = Math.max(selectedRange.minTick, selectedRange.maxTick)

    const ethAmountRaw = needsEth && ethAmountNum > 0 ? parseEther(ethAmountNum.toFixed(18)) : 0n
    const zeusAmountRawBig = needsZeus && zeusAmountNum > 0 ? parseUnits(zeusAmountNum.toFixed(ZEUS_DECIMALS), ZEUS_DECIMALS) : 0n

    // Apply slippage: amount0Max and amount1Max are the max the user is willing to spend
    // We pass the full amounts (no slippage reduction) as max — the contract takes only what it needs
    // The liquidity field uses type(uint128).max to let the contract compute the actual liquidity
    const amount0Max = ethAmountRaw
    const amount1Max = zeusAmountRawBig

    const unlockData = encodeMintUnlockData({
      currency0: ETH_ADDRESS,
      currency1: ZEUS_TOKEN_ADDRESS as `0x${string}`,
      fee: POOL_FEE,
      tickSpacing: POOL_TICK_SPACING,
      hooks: POOL_HOOKS_ADDRESS as `0x${string}`,
      tickLower: tLower,
      tickUpper: tUpper,
      amount0Max,
      amount1Max,
      recipient: address,
    })

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)

    writeMint({
      address: UNISWAP_V4_POSITION_MANAGER as `0x${string}`,
      abi: POSITION_MANAGER_ABI,
      functionName: "modifyLiquidities",
      value: ethAmountRaw,
      args: [unlockData, deadline],
    }, {
      onError: (err) => toast.error(`Transaction failed: ${err.message.slice(0, 80)}`),
    })
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

  const isLoading = isApproving || isApproveConfirming || isMinting || isMintConfirming

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Wrong chain warning */}
      {isWrongChain && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "0.75rem", padding: "0.875rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#f87171" }}>
          Switch to Ethereum Mainnet to add liquidity.
        </div>
      )}

      {/* Range Selector */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>Select Range</p>
        <RangeSelector onRangeChange={setSelectedRange} />
      </div>

      <div className="divider" />

      {/* Out-of-range notice */}
      {isMcapBelowRange && (
        <div style={{ background: "rgba(109,156,244,0.08)", border: "1px solid rgba(109,156,244,0.25)", borderRadius: "0.75rem", padding: "0.875rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#a8c8ff" }}>
          Market cap is below your range. Deposit <strong>ZEUS only</strong> — ETH will be added automatically when price enters range.
        </div>
      )}
      {isMcapAboveRange && (
        <div style={{ background: "rgba(109,156,244,0.08)", border: "1px solid rgba(109,156,244,0.25)", borderRadius: "0.75rem", padding: "0.875rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#a8c8ff" }}>
          Market cap is above your range. Deposit <strong>ETH only</strong> — ZEUS will be added automatically when price enters range.
        </div>
      )}

      {/* Amount Inputs */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>Deposit Amounts</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {needsEth && (
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
                  onChange={(e) => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setEthAmount(v) }}
                  placeholder="0.0"
                  min="0"
                  step="0.01"
                  className={`input-zeus ${hasInsufficientEth ? "error" : ""}`}
                  style={{ fontSize: "1.1rem", paddingRight: "3.5rem" }}
                />
                <button
                  onClick={() => setEthAmount((ethBalanceNum * 0.99).toFixed(6))}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", padding: "0.2rem 0.5rem", background: "rgba(67,148,244,0.15)", border: "1px solid rgba(67,148,244,0.3)", color: "#a8c8ff", fontSize: "0.65rem", borderRadius: "9999px", fontWeight: 700, cursor: "pointer" }}
                >
                  MAX
                </button>
              </div>
              {hasInsufficientEth && <p style={{ fontSize: "0.72rem", color: "#f87171" }}>Insufficient ETH balance</p>}
            </div>
          )}

          {needsZeus && (
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
                  onChange={(e) => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setZeusAmount(v) }}
                  placeholder="0.0"
                  min="0"
                  step="0.01"
                  className={`input-zeus ${hasInsufficientZeus ? "error" : ""}`}
                  style={{ fontSize: "1.1rem", paddingRight: "3.5rem" }}
                />
                <button
                  onClick={() => setZeusAmount(zeusBalanceNum.toFixed(4))}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", padding: "0.2rem 0.5rem", background: "rgba(67,148,244,0.15)", border: "1px solid rgba(67,148,244,0.3)", color: "#a8c8ff", fontSize: "0.65rem", borderRadius: "9999px", fontWeight: 700, cursor: "pointer" }}
                >
                  MAX
                </button>
              </div>
              {hasInsufficientZeus && <p style={{ fontSize: "0.72rem", color: "#f87171" }}>Insufficient ZEUS balance</p>}
            </div>
          )}

          {totalValueUsd > 0 && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "0.75rem", padding: "1rem" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "rgba(74,222,128,0.6)", marginBottom: "0.3rem" }}>Total Value</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "#4ade80" }}>
                ${totalValueUsd.toFixed(2)}
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
                color: slippage === value && !customSlippage ? "var(--highlight)" : "var(--text-secondary)",
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
        {needsZeus && !isZeusApproved ? (
          <button
            onClick={handleApprove}
            disabled={!isFormValid || isLoading || isWrongChain}
            className="btn-zeus"
            style={{ width: "100%", fontSize: "1rem", padding: "0.9rem" }}
          >
            {isApproving || isApproveConfirming ? "Approving ZEUS..." : "Approve ZEUS"}
          </button>
        ) : (
          <button
            onClick={handleAddLiquidity}
            disabled={!isFormValid || isLoading || isWrongChain}
            className="btn-zeus"
            style={{ width: "100%", fontSize: "1rem", padding: "0.9rem" }}
          >
            {isMinting || isMintConfirming ? "Adding Liquidity..." : "Add Liquidity"}
          </button>
        )}

        {/* Tx hashes */}
        {approveTxHash && (
          <a href={`https://etherscan.io/tx/${approveTxHash}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.72rem", textAlign: "center", color: "#a8c8ff", fontFamily: "monospace" }}>
            Approval tx: {approveTxHash.slice(0, 10)}...
          </a>
        )}
        {mintTxHash && (
          <a href={`https://etherscan.io/tx/${mintTxHash}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.72rem", textAlign: "center", color: "#a8c8ff", fontFamily: "monospace" }}>
            Mint tx: {mintTxHash.slice(0, 10)}...
          </a>
        )}

        {!isFormValid && !isLoading && (
          <p style={{ fontSize: "0.72rem", textAlign: "center", fontWeight: 600, color: "var(--text-muted)" }}>
            {!selectedRange ? "Select a price range above" : !ethAmountValid || !zeusAmountValid ? "Enter token amounts" : hasInsufficientEth || hasInsufficientZeus ? "Insufficient balance" : "Fill all fields"}
          </p>
        )}
      </div>
    </div>
  )
}
