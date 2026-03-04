/**
 * ZEUS Liquidity Manager — Main Page
 *
 * Features:
 * - Price chart with TradingView lightweight-charts
 * - Market statistics (price, mcap, volume, 24h change)
 * - Add liquidity form (coming in Step 6)
 * - Positions list (coming in Step 5)
 */

import { PriceChart } from "@/components/liquidity/PriceChart"
import { MarketStats } from "@/components/ui/MarketStats"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              ZEUS Liquidity Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Uniswap V4 • ZEUS/ETH
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet connect button will go here (Step 2) */}
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Market Stats */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
            <MarketStats />
          </section>

          {/* Price Chart */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Price Chart</h2>
            <PriceChart />
          </section>

          {/* Coming Soon Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Liquidity Form Placeholder */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Add Liquidity</h2>
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">
                  Add liquidity form coming in Step 6
                </p>
              </div>
            </section>

            {/* Positions List Placeholder */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Your Positions</h2>
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">
                  Positions list coming in Step 5
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            ZEUS Liquidity Manager • Built on Uniswap V4 • Ethereum Mainnet
          </p>
        </div>
      </footer>
    </div>
  )
}
