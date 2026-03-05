/**
 * PostgreSQL connection pool for server-side caching
 * Used by /api/apr to cache APR computation results
 */

import { Pool } from "pg"

let pool: Pool | null = null

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("rds.amazonaws.com")
        ? { rejectUnauthorized: false }
        : undefined,
    })
  }
  return pool
}

/**
 * Ensure the zeus_apr_cache table exists
 */
export async function ensureSchema(): Promise<void> {
  const db = getDb()
  await db.query(`
    CREATE TABLE IF NOT EXISTS zeus_apr_cache (
      id SERIAL PRIMARY KEY,
      apr NUMERIC NOT NULL,
      volume_24h_usd NUMERIC NOT NULL,
      tvl_usd NUMERIC NOT NULL,
      computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS zeus_positions_cache (
      id SERIAL PRIMARY KEY,
      positions JSONB NOT NULL,
      computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}
