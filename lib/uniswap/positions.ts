/**
 * Uniswap V4 Position Management
 *
 * Fetches and decodes user positions from V4 PositionManager
 * Handles ERC721 Transfer events and position info calls
 */

import { encodeFunctionData, decodeFunctionResult, parseAbiItem } from "viem"
import { getLogs, ethCall, alchemyBatchRpcCall } from "@/lib/services/alchemy"
import { UNISWAP_V4_POSITION_MANAGER, ZEUS_TOKEN_ADDRESS, ZEUS_DECIMALS } from "@/lib/constants"
import { PositionInfo, Position } from "@/types"
import { tickToMcap, tickToZeusEthPrice } from "@/lib/uniswap/mcap"

// ============================================================================
// Position Manager ABI (minimal, only what we need)
// ============================================================================

const POSITION_MANAGER_ABI = [
  // Transfer event (ERC721)
  parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"),

  // getPositionInfo function
  parseAbiItem(
    "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
  ),
] as const

// ============================================================================
// Fetch User's Position Token IDs
// ============================================================================

/**
 * Get all position NFT token IDs owned by an address
 * Fetches Transfer events where `to` is the user address
 */
export async function getUserPositionTokenIds(userAddress: string): Promise<bigint[]> {
  try {
    // Get current block
    const currentBlock = await alchemyBatchRpcCall([
      { method: "eth_blockNumber", params: [] },
    ])
    const currentBlockNumber = parseInt(currentBlock[0], 16)

    // Look back ~1 month of blocks (assuming ~12s block time)
    const blocksPerMonth = Math.floor((30 * 24 * 60 * 60) / 12)
    const fromBlock = Math.max(0, currentBlockNumber - blocksPerMonth)

    // Get Transfer events where `to` = userAddress
    // Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    const logs = await getLogs({
      address: UNISWAP_V4_POSITION_MANAGER,
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: "latest",
      topics: [
        // Transfer event signature
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        null, // from (any)
        // to (user address, padded to 32 bytes)
        `0x000000000000000000000000${userAddress.slice(2).toLowerCase()}`,
      ],
    })

    // Extract token IDs from topics[3]
    const tokenIds = logs.map((log) => BigInt(log.topics[3]))

    // Remove duplicates
    const uniqueTokenIds = Array.from(new Set(tokenIds.map((id) => id.toString()))).map(
      (id) => BigInt(id)
    )

    return uniqueTokenIds
  } catch (error) {
    console.error("Failed to fetch user position token IDs:", error)
    return []
  }
}

// ============================================================================
// Fetch Position Info
// ============================================================================

/**
 * Get detailed position information for a token ID
 */
export async function getPositionInfo(tokenId: bigint): Promise<PositionInfo | null> {
  try {
    // Encode positions(tokenId) call
    const data = encodeFunctionData({
      abi: POSITION_MANAGER_ABI,
      functionName: "positions",
      args: [tokenId],
    })

    // Make eth_call
    const result = await ethCall({
      to: UNISWAP_V4_POSITION_MANAGER,
      data,
    })

    // Decode result
    const decoded = decodeFunctionResult({
      abi: POSITION_MANAGER_ABI,
      functionName: "positions",
      data: result as `0x${string}`,
    }) as [bigint, string, string, string, number, number, number, bigint, bigint, bigint, bigint, bigint]

    const [
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    ] = decoded

    return {
      tokenId,
      poolKey: {
        currency0: token0,
        currency1: token1,
        fee,
        tickSpacing: 60,
        hooks: "0x0000000000000000000000000000000000000000",
      },
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    }
  } catch (error) {
    console.error(`Failed to fetch position info for tokenId ${tokenId}:`, error)
    return null
  }
}

// ============================================================================
// Calculate Token Amounts from Liquidity
// ============================================================================

/**
 * Calculate token amounts in a position from liquidity and tick range
 * Simplified calculation for display purposes
 *
 * Note: This is an approximation. For exact amounts, use Uniswap SDK's position.amount0/amount1
 */
export function calculatePositionAmounts(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
  currentTick: number
): { amount0: bigint; amount1: bigint } {
  // Simplified calculation - in production, use Uniswap SDK's Position class
  // For now, we'll use a rough estimate based on tick ranges

  if (liquidity === 0n) {
    return { amount0: 0n, amount1: 0n }
  }

  // If current price is below range: all token1 (ZEUS)
  if (currentTick < tickLower) {
    return {
      amount0: 0n,
      amount1: liquidity, // Simplified
    }
  }

  // If current price is above range: all token0 (ETH)
  if (currentTick >= tickUpper) {
    return {
      amount0: liquidity / 1000000n, // Simplified conversion
      amount1: 0n,
    }
  }

  // If in range: both tokens
  // This is a very rough approximation
  const rangeWidth = tickUpper - tickLower
  const positionInRange = currentTick - tickLower

  const ratio = positionInRange / rangeWidth

  return {
    amount0: (liquidity * BigInt(Math.floor(ratio * 1000))) / 1000000n,
    amount1: (liquidity * BigInt(Math.floor((1 - ratio) * 1000))) / 1000n,
  }
}

// ============================================================================
// Enrich Position with Market Data
// ============================================================================

/**
 * Convert PositionInfo to Position with USD values and market data
 */
export async function enrichPosition(
  positionInfo: PositionInfo,
  currentTick: number,
  ethPriceUsd: number,
  zeusPriceUsd: number,
  totalSupplyRaw: bigint
): Promise<Position> {
  // Calculate token amounts (simplified)
  const { amount0, amount1 } = calculatePositionAmounts(
    positionInfo.liquidity,
    positionInfo.tickLower,
    positionInfo.tickUpper,
    currentTick
  )

  // Calculate USD values
  const amount0Human = Number(amount0) / 10 ** 18 // ETH decimals
  const amount1Human = Number(amount1) / 10 ** ZEUS_DECIMALS // ZEUS decimals

  const totalValueUsd = amount0Human * ethPriceUsd + amount1Human * zeusPriceUsd

  // Calculate MCAP range
  const minMcap = tickToMcap(positionInfo.tickLower, ethPriceUsd, totalSupplyRaw)
  const maxMcap = tickToMcap(positionInfo.tickUpper, ethPriceUsd, totalSupplyRaw)

  // Calculate price range in ETH
  const minPriceEth = tickToZeusEthPrice(positionInfo.tickLower)
  const maxPriceEth = tickToZeusEthPrice(positionInfo.tickUpper)

  // Determine position status
  let status: "in-range" | "out-of-range" | "closed"
  if (positionInfo.liquidity === 0n) {
    status = "closed"
  } else if (currentTick >= positionInfo.tickLower && currentTick < positionInfo.tickUpper) {
    status = "in-range"
  } else {
    status = "out-of-range"
  }

  // Calculate uncollected fees USD value
  const tokensOwed0Human = Number(positionInfo.tokensOwed0) / 10 ** 18
  const tokensOwed1Human = Number(positionInfo.tokensOwed1) / 10 ** ZEUS_DECIMALS
  const uncollectedFeesUsd = tokensOwed0Human * ethPriceUsd + tokensOwed1Human * zeusPriceUsd

  return {
    tokenId: positionInfo.tokenId,
    owner: "", // Will be set by caller
    tickLower: positionInfo.tickLower,
    tickUpper: positionInfo.tickUpper,
    liquidity: positionInfo.liquidity,
    feeGrowthInside0LastX128: positionInfo.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: positionInfo.feeGrowthInside1LastX128,
    tokensOwed0: positionInfo.tokensOwed0,
    tokensOwed1: positionInfo.tokensOwed1,
    amount0,
    amount1,
    totalValueUsd,
    status,
    minMcap,
    maxMcap,
    minPriceEth,
    maxPriceEth,
    uncollectedFeesUsd,
  }
}
