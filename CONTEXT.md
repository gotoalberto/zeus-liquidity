# Zeus Liquidity Manager — Build Context

## Current Status
**STEP 2 of 8: COMPLETE** — Moving to Step 3

## What's Built
- ✅ **Step 1**: Next.js 14 project initialized with TypeScript, Tailwind CSS, App Router
- ✅ **Step 1**: Core dependencies installed (wagmi, viem, @reown/appkit, @tanstack/react-query, zustand, Uniswap SDK, lightweight-charts, Radix UI, sonner)
- ✅ **Step 2**: `lib/constants/index.ts` with all contract addresses, ZEUS_DECIMALS=9, pool config
- ✅ **Step 2**: `types/index.ts` with comprehensive TypeScript interfaces
- ✅ **Step 2**: `providers/Web3Provider.tsx` with Reown AppKit + wagmi configuration
- ✅ **Step 2**: Updated `app/layout.tsx` with providers and dark theme
- ✅ **Step 2**: Updated `app/globals.css` with ZEUS branding (#E8A117 gold, #4C82FB blue)
- ✅ **Step 2**: Build verification successful

## What's Next
- **Step 3**: CoinGecko API client and integration
- **Step 3**: Price chart with lightweight-charts
- **Step 3**: Market stats display (price, mcap, volume, 24h change)

## Critical Constants
- ZEUS address: 0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8
- ZEUS decimals: **9** (ALWAYS 1e9, never 1e18)
- Pool fee: 3000, tickSpacing: 60
- PositionManager: 0xbD216513d74C8cf14cf4747E6AaA7aE2a94d76Aa
- PoolManager: 0x000000000004444c5dc75cB358380D2e3dE08A90

## Known Issues / Decisions
- npm audit shows 17 vulnerabilities (13 low, 1 moderate, 3 high) - mostly from deprecated dependencies in @uniswap packages
- Will address security issues after core functionality is complete
