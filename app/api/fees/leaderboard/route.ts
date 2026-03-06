/**
 * GET /api/fees/leaderboard
 *
 * Top 10 defenders by uncollected fees (USD). 1-hour DB cache.
 *
 * All eth_calls are sent in a single JSON-RPC batch to minimize latency.
 */

import { NextResponse } from "next/server"
import { getDb, ensureSchema } from "@/lib/db"
import { getCurrentPoolTick } from "@/lib/uniswap/positions"
import { getZeusPriceData, getEthPriceUsd } from "@/lib/services/coingecko"
import {
  ZEUS_DECIMALS,
  UNISWAP_V4_POSITION_MANAGER,
  UNISWAP_V4_STATE_VIEW,
  ZEUS_TOKEN_ADDRESS,
  POOL_FEE,
  POOL_TICK_SPACING,
  POOL_HOOKS_ADDRESS,
} from "@/lib/constants"
import { encodeAbiParameters, keccak256 } from "viem"

export const runtime = "nodejs"

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
const V4_LAUNCH_BLOCK = 21355000
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const CHUNK_SIZE = 9999
const PARALLEL = 5

// ── helpers ──────────────────────────────────────────────────────────────────

async function rpcSingle<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(ALCHEMY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function rpcBatch(calls: { method: string; params: unknown[] }[]): Promise<unknown[]> {
  if (calls.length === 0) return []
  const res = await fetch(ALCHEMY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: "2.0", id: i, method: c.method, params: c.params }))),
  })
  const data = await res.json()
  // Sort by id to ensure order
  const sorted = [...data].sort((a: any, b: any) => a.id - b.id)
  return sorted.map((d: any) => d.result ?? null)
}

function computePoolId(): string {
  return keccak256(
    encodeAbiParameters(
      [{ type: "tuple", components: [
        { name: "currency0", type: "address" },
        { name: "currency1", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "tickSpacing", type: "int24" },
        { name: "hooks", type: "address" },
      ]}],
      [{ currency0: ZERO_ADDR as `0x${string}`, currency1: ZEUS_TOKEN_ADDRESS as `0x${string}`, fee: POOL_FEE, tickSpacing: POOL_TICK_SPACING, hooks: POOL_HOOKS_ADDRESS as `0x${string}` }]
    )
  )
}

const encodeInt24 = (v: number) =>
  (v < 0 ? BigInt(v) + (1n << 256n) : BigInt(v)).toString(16).padStart(64, "0")

/** Single-pass Transfer scan → owner→tokenIds map */
async function getOwnerTokenMap(): Promise<Map<string, bigint[]>> {
  const blockHex = await rpcSingle<string>("eth_blockNumber")
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
        rpcSingle<{ topics: string[] }[]>("eth_getLogs", [{
          address: UNISWAP_V4_POSITION_MANAGER,
          fromBlock: `0x${from.toString(16)}`,
          toBlock: `0x${to.toString(16)}`,
          topics: [TRANSFER_TOPIC],
        }])
      )
    )
    for (const logs of results) allLogs.push(...logs)
  }

  // owner → current set of tokenIds
  const holdings = new Map<string, Set<string>>()
  for (const log of allLogs) {
    const from = "0x" + log.topics[1].slice(26).toLowerCase()
    const to   = "0x" + log.topics[2].slice(26).toLowerCase()
    const id   = BigInt(log.topics[3]).toString()
    if (from !== ZERO_ADDR) holdings.get(from)?.delete(id)
    if (to !== ZERO_ADDR) {
      if (!holdings.has(to)) holdings.set(to, new Set())
      holdings.get(to)!.add(id)
    }
  }

  const result = new Map<string, bigint[]>()
  for (const [addr, ids] of holdings) {
    if (ids.size > 0) result.set(addr, [...ids].map(BigInt))
  }
  return result
}

// ── main handler ──────────────────────────────────────────────────────────────

export async function GET() {
  // DB cache check
  if (process.env.DATABASE_URL) {
    try {
      await ensureSchema()
      const db = getDb()
      const row = await db.query(
        `SELECT positions, computed_at FROM zeus_user_positions_cache WHERE address = '__leaderboard__'`
      )
      if (
        row.rows.length > 0 &&
        new Date(row.rows[0].computed_at) > new Date(Date.now() - CACHE_TTL_MS)
      ) {
        return NextResponse.json({ leaderboard: row.rows[0].positions, cached: true })
      }
    } catch {}
  }

  try {
    const poolId = computePoolId()
    const ownerHex = UNISWAP_V4_POSITION_MANAGER.slice(2).toLowerCase().padStart(64, "0")

    const [ownerTokenMap, currentTick, priceData, ethPriceUsd] = await Promise.all([
      getOwnerTokenMap(),
      getCurrentPoolTick(),
      getZeusPriceData(),
      getEthPriceUsd(),
    ])

    const zeusPriceUsd = priceData.priceUsd

    // Flatten all (owner, tokenId) pairs
    const flat: { owner: string; tokenId: bigint }[] = []
    for (const [owner, ids] of ownerTokenMap) {
      for (const tokenId of ids) flat.push({ owner, tokenId })
    }

    if (flat.length === 0) {
      return NextResponse.json({ leaderboard: [], cached: false })
    }

    // Batch 1: getPoolAndPositionInfo + getPositionLiquidity for all tokens (2 calls each)
    const infoCalls = flat.flatMap(({ tokenId }) => {
      const hex = tokenId.toString(16).padStart(64, "0")
      return [
        { method: "eth_call", params: [{ to: UNISWAP_V4_POSITION_MANAGER, data: `0x7ba03aad${hex}` }, "latest"] },
        { method: "eth_call", params: [{ to: UNISWAP_V4_POSITION_MANAGER, data: `0x1efeed33${hex}` }, "latest"] },
      ]
    })

    const infoResults = await rpcBatch(infoCalls)

    // Parse position info (tickLower, tickUpper, liquidity)
    const parsedInfos: ({ tickLower: number; tickUpper: number; liquidity: bigint } | null)[] = flat.map((_, i) => {
      const infoHex = infoResults[i * 2] as string | null
      const liqHex  = infoResults[i * 2 + 1] as string | null
      if (!infoHex || infoHex === "0x") return null

      const hex = infoHex.slice(2)
      const packed = BigInt("0x" + hex.slice(5 * 64, 6 * 64))
      const tickLowerRaw = (packed >> 8n) & 0xFFFFFFn
      const tickUpperRaw = (packed >> 32n) & 0xFFFFFFn
      const tickLower = tickLowerRaw >= 0x800000n ? Number(tickLowerRaw) - 0x1000000 : Number(tickLowerRaw)
      const tickUpper = tickUpperRaw >= 0x800000n ? Number(tickUpperRaw) - 0x1000000 : Number(tickUpperRaw)
      const liquidity = liqHex && liqHex !== "0x" ? BigInt(liqHex) : 0n

      return { tickLower, tickUpper, liquidity }
    })

    // Batch 2: fee calls only for active positions
    // getPositionInfo + getFeeGrowthInside per unique tick range
    const uniqueRanges = new Map<string, { tickLower: number; tickUpper: number }>()
    const activePositions: { idx: number; tickLower: number; tickUpper: number; liquidity: bigint }[] = []

    for (let i = 0; i < flat.length; i++) {
      const info = parsedInfos[i]
      if (!info || info.liquidity === 0n) continue
      activePositions.push({ idx: i, ...info })
      const key = `${info.tickLower}:${info.tickUpper}`
      if (!uniqueRanges.has(key)) uniqueRanges.set(key, info)
    }

    // Build fee batch calls
    // For each active position: getPositionInfo (unique per tokenId+range)
    // For each unique range: getFeeGrowthInside
    const feeBatch: { method: string; params: unknown[] }[] = []

    // posInfo calls (per active position)
    for (const { idx, tickLower, tickUpper } of activePositions) {
      const tokenId = flat[idx].tokenId
      const saltHex = tokenId.toString(16).padStart(64, "0")
      const tl = encodeInt24(tickLower)
      const tu = encodeInt24(tickUpper)
      const data = `0xdacf1d2f${poolId.slice(2)}${ownerHex}${tl}${tu}${saltHex}`
      feeBatch.push({ method: "eth_call", params: [{ to: UNISWAP_V4_STATE_VIEW, data }, "latest"] })
    }

    // feeGrowthInside calls (per unique range)
    const rangeKeys = [...uniqueRanges.keys()]
    for (const key of rangeKeys) {
      const { tickLower, tickUpper } = uniqueRanges.get(key)!
      const tl = encodeInt24(tickLower)
      const tu = encodeInt24(tickUpper)
      const data = `0x53e9c1fb${poolId.slice(2)}${tl}${tu}`
      feeBatch.push({ method: "eth_call", params: [{ to: UNISWAP_V4_STATE_VIEW, data }, "latest"] })
    }

    const feeResults = await rpcBatch(feeBatch)

    const posInfoResults = feeResults.slice(0, activePositions.length)
    const growthResults  = feeResults.slice(activePositions.length)
    const growthByRange = new Map<string, { g0: bigint; g1: bigint }>()
    rangeKeys.forEach((key, i) => {
      const hex = growthResults[i] as string | null
      if (!hex || hex === "0x") return
      const h = hex.slice(2)
      growthByRange.set(key, {
        g0: BigInt("0x" + h.slice(0, 64)),
        g1: BigInt("0x" + h.slice(64, 128)),
      })
    })

    // Calculate fees per owner
    const ownerFees = new Map<string, { feesUsd: number; positions: number }>()
    const Q128 = 2n ** 128n

    activePositions.forEach(({ idx, tickLower, tickUpper, liquidity }, j) => {
      const owner = flat[idx].owner
      const posHex = posInfoResults[j] as string | null
      if (!posHex || posHex === "0x") return

      const ph = posHex.slice(2)
      const feeGrowth0Last = BigInt("0x" + ph.slice(64, 128))
      const feeGrowth1Last = BigInt("0x" + ph.slice(128, 192))

      const key = `${tickLower}:${tickUpper}`
      const growth = growthByRange.get(key)
      if (!growth) return

      const delta0 = (growth.g0 - feeGrowth0Last + Q128 * Q128) % (Q128 * Q128)
      const delta1 = (growth.g1 - feeGrowth1Last + Q128 * Q128) % (Q128 * Q128)
      const tokens0 = (delta0 * liquidity) / Q128
      const tokens1 = (delta1 * liquidity) / Q128

      const feesUsd =
        (Number(tokens0) / 1e18) * ethPriceUsd +
        (Number(tokens1) / 10 ** ZEUS_DECIMALS) * zeusPriceUsd

      const cur = ownerFees.get(owner) ?? { feesUsd: 0, positions: 0 }
      ownerFees.set(owner, { feesUsd: cur.feesUsd + feesUsd, positions: cur.positions + 1 })
    })

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
