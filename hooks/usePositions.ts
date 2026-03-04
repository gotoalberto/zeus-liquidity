"use client"

/**
 * usePositions Hook
 *
 * Fetches user's Uniswap V4 positions and enriches them with market data
 */

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { Position } from "@/types"
import { getUserPositionTokenIds, getPositionInfo, enrichPosition } from "@/lib/uniswap/positions"
import { useZeusPrice, useEthPrice } from "./useZeusPrice"

export function usePositions() {
  const { address, isConnected } = useAccount()
  const { data: priceData } = useZeusPrice()
  const { data: ethPriceUsd } = useEthPrice()

  return useQuery<Position[]>({
    queryKey: ["positions", address],
    queryFn: async () => {
      if (!address || !priceData || !ethPriceUsd) {
        return []
      }

      try {
        // Get user's position token IDs
        const tokenIds = await getUserPositionTokenIds(address)

        if (tokenIds.length === 0) {
          return []
        }

        // Fetch position info for each token ID
        const positionInfos = await Promise.all(
          tokenIds.map((tokenId) => getPositionInfo(tokenId))
        )

        // Filter out nulls and enrich with market data
        const positions = await Promise.all(
          positionInfos
            .filter((info): info is NonNullable<typeof info> => info !== null)
            .map((info) =>
              enrichPosition(
                info,
                -276000, // TODO: Get current tick from pool state
                ethPriceUsd,
                priceData.priceUsd,
                priceData.totalSupply
              )
            )
        )

        // Set owner on all positions
        return positions.map((pos) => ({ ...pos, owner: address }))
      } catch (error) {
        console.error("Failed to fetch positions:", error)
        return []
      }
    },
    enabled: isConnected && !!address && !!priceData && !!ethPriceUsd,
    staleTime: 60_000, // 60 seconds
    gcTime: 5 * 60_000, // 5 minutes
  })
}

/**
 * Hook to get total portfolio value across all positions
 */
export function usePortfolioValue() {
  const { data: positions, isLoading } = usePositions()

  const totalValueUsd = positions?.reduce((sum, pos) => sum + pos.totalValueUsd, 0) || 0
  const totalFeesUsd = positions?.reduce((sum, pos) => sum + pos.uncollectedFeesUsd, 0) || 0

  return {
    totalValueUsd,
    totalFeesUsd,
    positionCount: positions?.length || 0,
    isLoading,
  }
}
