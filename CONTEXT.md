# Zeus Liquidity Manager — Build Context

## Current Status
**STEP 1 of 8: IN PROGRESS**

## What's Built
- ✅ Next.js 14 project initialized with TypeScript, Tailwind CSS, App Router
- ✅ Core dependencies installed:
  - Web3: wagmi, viem, @reown/appkit
  - State: @tanstack/react-query, zustand
  - Uniswap: @uniswap/v4-sdk, @uniswap/sdk-core
  - Charts: lightweight-charts
  - UI: Radix UI components, sonner (toast notifications)
- ✅ Environment variables configured (.env.local)

## What's Next
- Create constants.ts with contract addresses and ZEUS_DECIMALS=9
- Set up providers (Web3Provider, QueryProvider)
- Configure wagmi with Reown AppKit

## Critical Constants
- ZEUS address: 0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8
- ZEUS decimals: **9** (ALWAYS 1e9, never 1e18)
- Pool fee: 3000, tickSpacing: 60
- PositionManager: 0xbD216513d74C8cf14cf4747E6AaA7aE2a94d76Aa
- PoolManager: 0x000000000004444c5dc75cB358380D2e3dE08A90

## Known Issues / Decisions
- npm audit shows 17 vulnerabilities (13 low, 1 moderate, 3 high) - mostly from deprecated dependencies in @uniswap packages
- Will address security issues after core functionality is complete
