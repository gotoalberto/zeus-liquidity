/**
 * GET /api/fees/leaderboard
 *
 * Returns top 10 active defenders ordered by uncollected fees (USD).
 * Cached in DB for 1 hour.
 *
 * Strategy (single pass, no redundant RPC calls):
 *  1. Scan all ERC721 Transfer events → build owner→tokenIds map in one pass
 *  2. Batch-fetch position info for all tokenIds at once
 *  3. Batch-fetch fees for all active positions at once
 *  4. Sum per owner, sort, top 10
 */

import { NextResponse } from "next/server"
import { getDb, ensureSchema } from "@/lib/db"
import { getCurrentPoolTick, getV4PositionInfo, getPositionFees } from "@/lib/uniswap/positions"
import { getZeusPriceData, getEthPriceUsd } from "@/lib/services/coingecko"
import { ZEUS_DECIMALS, UNISWAP_V4_POSITION_MANAGER } from "@/lib/constants"

export const runtime = "nodejs"

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
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

/** Single-pass scan: returns map of owner → Set<tokenId string> */
async function getOwnerTokenMap(): Promise<Map<string, Set<string>>> {
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

  const holdings = new Map<string, Set<string>>()

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

  // Remove owners with no tokens left
  for (const [addr, ids] of holdings) {
    if (ids.size === 0) holdings.delete(addr)
  }

  return holdings
}

export async function GET() {
  // Check DB cache
  if (process.env.DATABASE_URL) {
    try {
      await ensureSchema()
      const db = getDb()
      const lb = await db.query(
        `SELECT positions, computed_at FROM zeus_user_positions_cache WHERE address = '__leaderboard__'`
      )
      if (
        lb.rows.length > 0 &&
        new Date(lb.rows[0].computed_at) > new Date(Date.now() - CACHE_TTL_MS)
      ) {
        return NextResponse.json({ leaderboard: lb.rows[0].positions, cached: true })
      }
    } catch {}
  }

  try {
    const [ownerTokenMap, currentTick, priceData, ethPriceUsd] = await Promise.all([
      getOwnerTokenMap(),
      getCurrentPoolTick(),
      getZeusPriceData(),
      getEthPriceUsd(),
    ])

    const zeusPriceUsd = priceData.priceUsd

    // Flatten all tokenIds with their owner
    const allTokens: { owner: string; tokenId: bigint }[] = []
    for (const [owner, ids] of ownerTokenMap) {
      for (const id of ids) {
        allTokens.push({ owner, tokenId: BigInt(id) })
      }
    }

    // Batch-fetch position info for all tokens in parallel
    const infos = await Promise.all(
      allTokens.map(({ tokenId }) => getV4PositionInfo(tokenId))
    )

    // Fetch fees only for active positions (liquidity > 0)
    const feeResults = await Promise.all(
      allTokens.map(async ({ tokenId }, i) => {
        const info = infos[i]
        if (!info || info.liquidity === 0n) return 0
        const { tokensOwed0, tokensOwed1 } = await getPositionFees(
          tokenId, info.tickLower, info.tickUpper, info.liquidity
        )
        return (Number(tokensOwed0) / 1e18) * ethPriceUsd +
               (Number(tokensOwed1) / 10 ** ZEUS_DECIMALS) * zeusPriceUsd
      })
    )

    // Aggregate per owner
    const ownerFees = new Map<string, { feesUsd: number; positions: number }>()
    for (let i = 0; i < allTokens.length; i++) {
      const { owner } = allTokens[i]
      const info = infos[i]
      if (!info || info.liquidity === 0n) continue
      const cur = ownerFees.get(owner) ?? { feesUsd: 0, positions: 0 }
      ownerFees.set(owner, {
        feesUsd: cur.feesUsd + feeResults[i],
        positions: cur.positions + 1,
      })
    }

    const leaderboard = [...ownerFees.entries()]
      .sort((a, b) => b[1].feesUsd - a[1].feesUsd)
      .slice(0, 10)
      .map(([address, { feesUsd, positions }], i) => ({
        rank: i + 1,
        address,
        uncollectedFeesUsd: feesUsd,
        positionCount: positions,
      }))

    // Persist cache
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

    return NextResponse.json({ leaderboard, cached: false })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to build leaderboard" }, { status: 500 })
  }
}
