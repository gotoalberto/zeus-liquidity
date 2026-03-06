/**
 * GET /api/fees/leaderboard
 *
 * Returns top 10 active defenders ordered by uncollected fees (USD).
 * Strategy:
 *  1. Scan ERC721 Transfer events on V4 PositionManager to find all current owners
 *  2. For each owner, fetch their positions and sum uncollectedFeesUsd
 *  3. Sort desc, return top 10
 *
 * Cached in DB for 5 minutes to avoid hammering Alchemy.
 */

import { NextResponse } from "next/server"
import { getDb, ensureSchema } from "@/lib/db"
import {
  getUserPositionTokenIds,
  getCurrentPoolTick,
  getV4PositionInfo,
  getPositionFees,
} from "@/lib/uniswap/positions"
import { getZeusPriceData, getEthPriceUsd } from "@/lib/services/coingecko"
import { ZEUS_DECIMALS, UNISWAP_V4_POSITION_MANAGER } from "@/lib/constants"

export const runtime = "nodejs"

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
const V4_LAUNCH_BLOCK = 21355000
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const CHUNK_SIZE = 9999
const PARALLEL = 5

async function rpcCall<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(ALCHEMY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

/** Fetch all unique current owners of V4 PositionManager NFTs */
async function getAllOwners(): Promise<string[]> {
  const blockHex = await rpcCall<string>("eth_blockNumber")
  const currentBlock = parseInt(blockHex, 16)

  const chunks: { from: number; to: number }[] = []
  for (let start = V4_LAUNCH_BLOCK; start <= currentBlock; start += CHUNK_SIZE) {
    chunks.push({ from: start, to: Math.min(start + CHUNK_SIZE - 1, currentBlock) })
  }

  const allLogs: { topics: string[] }[] = []
  for (let i = 0; i < chunks.length; i += PARALLEL) {
    const batch = chunks.slice(i, i + PARALLEL)
    const results = await Promise.all(
      batch.map(({ from, to }) =>
        rpcCall<{ topics: string[] }[]>("eth_getLogs", [{
          address: UNISWAP_V4_POSITION_MANAGER,
          fromBlock: `0x${from.toString(16)}`,
          toBlock: `0x${to.toString(16)}`,
          topics: [TRANSFER_TOPIC],
        }])
      )
    )
    for (const logs of results) allLogs.push(...logs)
  }

  // Track net holdings: received - sent. Include mints (from=0x0).
  const holdings = new Map<string, Set<string>>() // owner → Set<tokenId>

  for (const log of allLogs) {
    const from = "0x" + log.topics[1].slice(26).toLowerCase()
    const to   = "0x" + log.topics[2].slice(26).toLowerCase()
    const id   = BigInt(log.topics[3]).toString()

    if (from !== ZERO_ADDR) {
      holdings.get(from)?.delete(id)
    }
    if (to !== ZERO_ADDR) {
      if (!holdings.has(to)) holdings.set(to, new Set())
      holdings.get(to)!.add(id)
    }
  }

  return [...holdings.entries()]
    .filter(([, ids]) => ids.size > 0)
    .map(([addr]) => addr)
}

export async function GET() {
  // Check DB cache
  if (process.env.DATABASE_URL) {
    try {
      await ensureSchema()
      const db = getDb()
      const cached = await db.query(
        `SELECT positions, computed_at FROM zeus_positions_cache ORDER BY computed_at DESC LIMIT 1`
      )
      // Reuse a dedicated leaderboard cache key via zeus_user_positions_cache
      const lb = await db.query(
        `SELECT positions, computed_at FROM zeus_user_positions_cache WHERE address = '__leaderboard__'`
      )
      if (
        lb.rows.length > 0 &&
        new Date(lb.rows[0].computed_at) > new Date(Date.now() - CACHE_TTL_MS)
      ) {
        return NextResponse.json({ leaderboard: lb.rows[0].positions })
      }
    } catch {}
  }

  try {
    const [owners, currentTick, priceData, ethPriceUsd] = await Promise.all([
      getAllOwners(),
      getCurrentPoolTick(),
      getZeusPriceData(),
      getEthPriceUsd(),
    ])

    const zeusPriceUsd = priceData.priceUsd

    // For each owner, sum uncollected fees across their positions
    const entries = await Promise.all(
      owners.map(async (owner) => {
        try {
          const tokenEntries = await getUserPositionTokenIds(owner)
          if (tokenEntries.length === 0) return null

          const infos = await Promise.all(
            tokenEntries.map(({ tokenId }) => getV4PositionInfo(tokenId))
          )

          let uncollectedFeesUsd = 0
          let positionCount = 0

          await Promise.all(
            infos.map(async (info, i) => {
              if (!info || info.liquidity === 0n) return
              positionCount++
              const { tokensOwed0, tokensOwed1 } = await getPositionFees(
                tokenEntries[i].tokenId,
                info.tickLower,
                info.tickUpper,
                info.liquidity
              )
              uncollectedFeesUsd +=
                (Number(tokensOwed0) / 1e18) * ethPriceUsd +
                (Number(tokensOwed1) / 10 ** ZEUS_DECIMALS) * zeusPriceUsd
            })
          )

          if (positionCount === 0) return null
          return { address: owner, uncollectedFeesUsd, positionCount }
        } catch {
          return null
        }
      })
    )

    const leaderboard = entries
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .sort((a, b) => b.uncollectedFeesUsd - a.uncollectedFeesUsd)
      .slice(0, 10)
      .map((e, i) => ({
        rank: i + 1,
        address: e.address,
        uncollectedFeesUsd: e.uncollectedFeesUsd,
        positionCount: e.positionCount,
      }))

    // Cache in DB
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb()
        await db.query(
          `INSERT INTO zeus_user_positions_cache (address, positions, computed_at)
           VALUES ('__leaderboard__', $1, NOW())
           ON CONFLICT (address) DO UPDATE
           SET positions = EXCLUDED.positions, computed_at = EXCLUDED.computed_at`,
          [JSON.stringify(leaderboard)]
        )
      } catch {}
    }

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to build leaderboard" }, { status: 500 })
  }
}
