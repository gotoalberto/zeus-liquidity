/**
 * GET /api/fees/leaderboard
 * Returns top 10 addresses by total fees collected (USD), from zeus_fee_collections.
 */

import { NextResponse } from "next/server"
import { getDb, ensureSchema } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ leaderboard: [] })
  }

  try {
    await ensureSchema()
    const db = getDb()
    const result = await db.query(`
      SELECT
        address,
        SUM(total_usd) AS total_usd,
        COUNT(*) AS collections
      FROM zeus_fee_collections
      GROUP BY address
      ORDER BY total_usd DESC
      LIMIT 10
    `)

    const leaderboard = result.rows.map((r, i) => ({
      rank: i + 1,
      address: r.address,
      totalUsd: Number(r.total_usd),
      collections: Number(r.collections),
    }))

    return NextResponse.json({ leaderboard }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
