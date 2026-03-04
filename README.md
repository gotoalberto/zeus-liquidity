# ZEUS Liquidity Manager

A production-grade liquidity management DApp for the ZEUS/ETH pair on Uniswap V4 (Ethereum mainnet).

🚀 **Live Demo**: [earn.pepes.dog](https://earn.pepes.dog)

## 🌟 Key Features

### 💡 MCAP-Based Range Selection (Innovation)
Unlike traditional DEX interfaces that use raw token prices, ZEUS Liquidity Manager lets users define liquidity ranges by **market cap milestones** in USD. This makes it intuitive to set ranges like "provide liquidity from $1M to $10M market cap" instead of dealing with complex tick math.

### ✨ Core Features
- 📊 **Real-time Price Charts** - TradingView lightweight-charts with OHLC data from CoinGecko
- 💰 **Market Statistics** - Live price, market cap, volume, and 24h change
- 🎯 **Smart Range Presets** - Conservative, Moderate, and Aggressive strategies
- 📍 **Position Management** - View all your Uniswap V4 positions with USD values
- 🔄 **Auto-calculation** - Smart amount calculation for balanced liquidity
- 💼 **Portfolio Tracking** - Total value and uncollected fees across all positions
- 🌐 **Wallet Integration** - Connect with MetaMask, WalletConnect, Coinbase Wallet

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Web3**: wagmi v2 + viem + @reown/appkit
- **State**: @tanstack/react-query (TanStack Query v5)
- **Charts**: lightweight-charts (TradingView)
- **Data**: CoinGecko API + Alchemy API
- **Uniswap**: @uniswap/v4-sdk + @uniswap/sdk-core

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Ethereum wallet (MetaMask recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/gotoalberto/zeus-liquidity.git
cd zeus-liquidity

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_CHAIN_ID=1
```

### Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 📖 Project Structure

```
zeus-liquidity/
├── app/                      # Next.js app router
│   ├── api/                  # API routes (CoinGecko proxy)
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Main page
├── components/
│   ├── layout/               # Header, footer
│   ├── liquidity/            # Add liquidity form, range selector, price chart
│   ├── positions/            # Position cards and list
│   └── ui/                   # Reusable UI components
├── hooks/                    # React hooks
│   ├── usePositions.ts       # Fetch user positions
│   └── useZeusPrice.ts       # CoinGecko price data
├── lib/
│   ├── constants/            # Contract addresses, config
│   ├── services/             # API clients (Alchemy, CoinGecko)
│   └── uniswap/              # Uniswap V4 integration
│       ├── mcap.ts           # MCAP ↔ Tick conversion (9 decimals)
│       └── positions.ts      # Position decoding and enrichment
├── types/                    # TypeScript interfaces
└── __tests__/                # Unit tests
```

## 🔑 Critical Implementation Details

### ZEUS Token Decimals
**CRITICAL**: ZEUS token has **9 decimals**, NOT 18. All calculations account for this:

```typescript
const ZEUS_DECIMALS = 9
const ETH_DECIMALS = 18
const DECIMAL_ADJUSTMENT = 10 ** (ZEUS_DECIMALS - ETH_DECIMALS) // 10^-9
```

### MCAP to Tick Conversion
The core innovation is converting market cap (USD) to Uniswap V4 ticks:

```typescript
// 1. Market cap → ZEUS price USD
const zeusUsdPrice = mcapUsd / totalSupply

// 2. ZEUS price USD → ZEUS per ETH
const zeusPerEth = zeusUsdPrice / ethPriceUsd

// 3. Apply decimal adjustment
const priceRatio = zeusPerEth * 10^-9

// 4. Calculate tick
const tick = Math.floor(Math.log(priceRatio) / Math.log(1.0001))

// 5. Round to tickSpacing (60)
const finalTick = Math.round(tick / 60) * 60
```

### Uniswap V4 Pool Configuration
- **Currency0**: ETH (address(0), 18 decimals)
- **Currency1**: ZEUS (9 decimals)
- **Fee Tier**: 0.3% (3000)
- **Tick Spacing**: 60
- **No Hooks**: 0x0000000000000000000000000000000000000000

## 🧪 Testing

The project includes comprehensive unit tests for the MCAP math:

```bash
npm test
```

17 tests covering:
- MCAP → Tick conversion
- Tick → MCAP reverse conversion
- Roundtrip conversions (within 1% tolerance)
- Tick validation
- Preset range calculations
- 9-decimal precision handling

## 📊 Architecture Decisions

### Why MCAP-Based Ranges?
Traditional DEX UIs require users to input raw token prices or tick values, which is:
- **Unintuitive**: "What's a good price range for ZEUS?"
- **Complex**: Requires understanding tick math
- **Error-prone**: Easy to set incorrect ranges

MCAP-based ranges solve this by letting users think in familiar terms:
- "I want to provide liquidity from $1M to $10M market cap"
- "Conservative: 80% to 300% of current market cap"
- **Intuitive** and **user-friendly**

### Why CoinGecko + Alchemy?
- **CoinGecko**: Real-time price, market cap, and OHLC data
- **Alchemy**: Enhanced RPC for position fetching and contract calls
- **Separation of concerns**: Market data vs blockchain state

### Why React Query?
- **Automatic caching**: 60s for prices, reduces API calls
- **Background refetching**: Keeps data fresh
- **Loading states**: Built-in loading/error handling
- **Optimistic updates**: Better UX

## 🔐 Security Considerations

- All environment variables are properly scoped with `NEXT_PUBLIC_` prefix
- API keys are proxied through Next.js API routes (no client exposure)
- Token approval flow with explicit user confirmation
- Slippage protection on all transactions
- No hardcoded private keys or sensitive data

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Configure custom domain (optional): earn.pepes.dog
5. Deploy!

```bash
# Vercel CLI (alternative)
vercel --prod
```

### Environment Variables in Vercel
Set these in the Vercel project settings:
- `NEXT_PUBLIC_COINGECKO_API_KEY`
- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_REOWN_PROJECT_ID`
- `NEXT_PUBLIC_CHAIN_ID=1`

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📧 Contact

- GitHub: [@gotoalberto](https://github.com/gotoalberto)
- Project Link: [https://github.com/gotoalberto/zeus-liquidity](https://github.com/gotoalberto/zeus-liquidity)

---

Built with ❤️ for the ZEUS community
