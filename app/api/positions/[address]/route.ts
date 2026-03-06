/**
 * GET /api/positions/[address]
 *
 * Returns V4 positions for a specific address with 5-minute DB cache.
 * All bigint fields are serialized as decimal strings.
 */

import { NextRequest, NextResponse } from "next/server"
import { isAddress } from "viem"
import { getDb, ensureSchema } from "@/lib/db"
import {
  getUserPositionTokenIds,
  getCurrentPoolTick,
  getV4PositionInfo,
  buildPosition,
  serializePosition,
} from "@/lib/uniswap/positions"
import { getZeusPriceData, getEthPriceUsd } from "@/lib/services/coingecko"

export const runtime = "nodejs"

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 404 })
  }

  const normalizedAddress = address.toLowerCase()
  const forceRefresh = req.nextUrl.searchParams.get("refresh") === "1"

  // Check DB cache first (skip if ?refresh=1)
  if (process.env.DATABASE_URL && !forceRefresh) {
    try {
      await ensureSchema()
      const db = getDb()
      const cached = await db.query(
        `SELECT positions, computed_at FROM zeus_user_positions_cache WHERE address = $1`,
        [normalizedAddress]
      )
      if (
        cached.rows.length > 0 &&
        new Date(cached.rows[0].computed_at) > new Date(Date.now() - CACHE_TTL_MS)
      ) {
        return NextResponse.json({
          positions: cached.rows[0].positions,
          cachedAt: cached.rows[0].computed_at,
          cached: true,
        })
      }
    } catch (err) {
      console.error("Cache read error:", err)
    }
  }

  try {
    // Fetch price data and chain data in parallel
    const [priceData, ethPriceUsd, tokenIds, currentTick] = await Promise.all([
      getZeusPriceData(),
      getEthPriceUsd(),
      getUserPositionTokenIds(address),
      getCurrentPoolTick(),
    ])

    const zeusPriceUsd = priceData.priceUsd
    const totalSupplyRaw = priceData.totalSupply

    // Fetch info for each tokenId in parallel
    const positionInfos = await Promise.all(
      tokenIds.map((tokenId) => getV4PositionInfo(tokenId).then((info) => ({ tokenId, info })))
    )

    // Build full positions (includes fee calculation)
    const positions = await Promise.all(
      positionInfos
        .filter(({ info }) => info !== null)
        .map(({ tokenId, info }) =>
          buildPosition(
            tokenId,
            info!.tickLower,
            info!.tickUpper,
            info!.liquidity,
            currentTick,
            ethPriceUsd,
            zeusPriceUsd,
            totalSupplyRaw,
            address
          )
        )
    )

    const serialized = positions.map(serializePosition)

    // Persist to DB cache
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb()
        await db.query(
          `INSERT INTO zeus_user_positions_cache (address, positions, computed_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (address) DO UPDATE
           SET positions = EXCLUDED.positions, computed_at = EXCLUDED.computed_at`,
          [normalizedAddress, JSON.stringify(serialized)]
        )
      } catch (err) {
        console.error("Cache write error:", err)
      }
    }

    return NextResponse.json({
      positions: serialized,
      cachedAt: new Date().toISOString(),
      cached: false,
    })
  } catch (error) {
    console.error("Positions [address] API error:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}
