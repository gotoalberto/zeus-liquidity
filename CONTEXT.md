# Zeus Liquidity Manager — Build Context

## Current Status
**STEP 4 of 8: COMPLETE** — Moving to Step 5

## What's Built
- ✅ **Step 1**: Next.js 14 project initialized with TypeScript, Tailwind CSS, App Router
- ✅ **Step 1**: Core dependencies installed (wagmi, viem, @reown/appkit, @tanstack/react-query, zustand, Uniswap SDK, lightweight-charts, Radix UI, sonner)
- ✅ **Step 2**: `lib/constants/index.ts` with all contract addresses, ZEUS_DECIMALS=9, pool config
- ✅ **Step 2**: `types/index.ts` with comprehensive TypeScript interfaces
- ✅ **Step 2**: `providers/Web3Provider.tsx` with Reown AppKit + wagmi configuration
- ✅ **Step 2**: Updated `app/layout.tsx` with providers and dark theme
- ✅ **Step 2**: Updated `app/globals.css` with ZEUS branding (#E8A117 gold, #4C82FB blue)
- ✅ **Step 3**: `lib/services/coingecko.ts` — CoinGecko API client with price, OHLC, and ETH price fetching
- ✅ **Step 3**: `hooks/useZeusPrice.ts` — React Query hooks for price data with 60s caching
- ✅ **Step 3**: API routes: `/api/price`, `/api/price/ohlc`, `/api/price/eth` (proxy to avoid CORS)
- ✅ **Step 3**: `components/liquidity/PriceChart.tsx` — TradingView lightweight-charts with timeframe selector
- ✅ **Step 3**: `components/ui/MarketStats.tsx` — Market stats display (price, mcap, volume, 24h change)
- ✅ **Step 3**: Updated `app/page.tsx` with complete UI layout
- ✅ **Step 4**: `lib/uniswap/mcap.ts` — MCAP ↔ Tick conversion with 9-decimal precision
- ✅ **Step 4**: `__tests__/mcap.test.ts` — 17 unit tests validating tick math (all passing)
- ✅ **Step 4**: Updated tsconfig.json target to ES2020 for BigInt support
- ✅ **Step 4**: Vitest configured for testing
- ✅ **Step 4**: Build and tests verification successful

## What's Next
- **Step 5**: Alchemy API integration (`lib/services/alchemy.ts`)
- **Step 5**: Position fetching and decoding (`lib/uniswap/positions.ts`)
- **Step 5**: `hooks/usePositions.ts` for React Query integration
- **Step 5**: `components/positions/PositionCard.tsx` and `PositionsList.tsx`

## Critical Constants
- ZEUS address: 0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8
- ZEUS decimals: **9** (ALWAYS 1e9, never 1e18)
- Pool fee: 3000, tickSpacing: 60
- PositionManager: 0xbD216513d74C8cf14cf4747E6AaA7aE2a94d76Aa
- PoolManager: 0x000000000004444c5dc75cB358380D2e3dE08A90

## Known Issues / Decisions
- npm audit shows 17 vulnerabilities (13 low, 1 moderate, 3 high) - mostly from deprecated dependencies in @uniswap packages
- Will address security issues after core functionality is complete
