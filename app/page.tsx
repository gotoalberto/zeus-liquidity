"use client"

import { PriceChart } from "@/components/liquidity/PriceChart"
import { MarketStats } from "@/components/ui/MarketStats"
import { PositionsList } from "@/components/positions/PositionsList"
import { AddLiquidityForm } from "@/components/liquidity/AddLiquidityForm"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import Image from "next/image"

export default function Home() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="header-zeus sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/40 glow-gold animate-pulse-glow">
              <Image
                src="/zeus-pepe-defi.png"
                alt="ZEUS"
                width={40}
                height={40}
                className="object-cover object-top scale-150 translate-y-1"
              />
            </div>
            <div>
              <div className="font-display text-xl gradient-text leading-none" style={{fontFamily:"var(--font-bangers)"}}>
                ZEUS LIQUIDITY
              </div>
              <div className="text-xs text-muted-foreground">
                earn.pepes.dog • Uniswap V4
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#stats" className="text-muted-foreground hover:text-primary transition-colors">Market</a>
            <a href="#chart" className="text-muted-foreground hover:text-primary transition-colors">Chart</a>
            <a href="#positions" className="text-muted-foreground hover:text-primary transition-colors">Positions</a>
            <a href="#add" className="text-muted-foreground hover:text-primary transition-colors">Add LP</a>
          </nav>

          {/* Wallet */}
          <button
            onClick={() => open()}
            className="btn-zeus text-sm px-4 py-2"
            style={{fontFamily:"var(--font-bangers)", fontSize:"1rem", letterSpacing:"0.08em"}}
          >
            {isConnected
              ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
              : "⚡ Connect Wallet"}
          </button>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Hero image */}
        <div className="relative w-full h-[340px] md:h-[420px]">
          <Image
            src="/hero-banner.png"
            alt="Zeus — God of Liquidity"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1
              className="text-6xl md:text-8xl gradient-text text-glow-gold mb-2"
              style={{fontFamily:"var(--font-bangers)", letterSpacing:"0.06em"}}
            >
              ZEUS
            </h1>
            <p
              className="text-2xl md:text-3xl text-white/90 mb-6"
              style={{fontFamily:"var(--font-bangers)", letterSpacing:"0.08em"}}
            >
              GOD OF LIQUIDITY
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#add"
                className="btn-zeus"
                style={{fontFamily:"var(--font-bangers)", fontSize:"1.1rem"}}
              >
                ⚡ PROVIDE LIQUIDITY
              </a>
              <a
                href="https://zeuscoin.vip"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 border border-primary/40 text-primary rounded-lg hover:border-primary hover:bg-primary/10 transition-all text-sm font-semibold"
              >
                🐾 zeuscoin.vip
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ──────────────────────────────────────── */}
      <div className="border-y border-primary/20 bg-card/50 py-2 overflow-hidden">
        <div className="flex items-center gap-8 text-sm font-mono text-muted-foreground px-4">
          <span className="text-primary font-semibold">$ZEUS/ETH</span>
          <span>•</span>
          <span>Uniswap V4</span>
          <span>•</span>
          <span>Ethereum Mainnet</span>
          <span>•</span>
          <span className="text-secondary">LP Rewards Active</span>
          <span>•</span>
          <span>0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-10">
        <div className="space-y-10">

          {/* Market Stats */}
          <section id="stats">
            <h2 className="section-title mb-5">Market Overview</h2>
            <MarketStats />
          </section>

          <hr className="divider-zeus" />

          {/* Price Chart */}
          <section id="chart">
            <h2 className="section-title mb-5">Price Chart</h2>
            <PriceChart />
          </section>

          <hr className="divider-zeus" />

          {/* Zeus + Pepe promo banner */}
          <section className="card-zeus p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden border border-primary/30 animate-float">
              <Image
                src="/zeus-pepe-defi.png"
                alt="Zeus and Pepe providing liquidity"
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3
                className="text-3xl gradient-text mb-2"
                style={{fontFamily:"var(--font-bangers)", letterSpacing:"0.05em"}}
              >
                ZEUS & PEPE: THE OG LP GODS
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Zeus isn't just Pepe's dog — he's the guardian of the swamp's liquidity.
                Provide LP on the ZEUS/ETH pool and earn fees while supporting the most legendary memecoin on Ethereum.
              </p>
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-primary font-mono font-bold text-lg">0%</div>
                  <div className="text-xs text-muted-foreground">Tax</div>
                </div>
                <div className="text-center">
                  <div className="text-secondary font-mono font-bold text-lg">V4</div>
                  <div className="text-xs text-muted-foreground">Uniswap</div>
                </div>
                <div className="text-center">
                  <div className="text-primary font-mono font-bold text-lg">∞</div>
                  <div className="text-xs text-muted-foreground">LP Burned</div>
                </div>
              </div>
            </div>
          </section>

          <hr className="divider-zeus" />

          {/* Positions */}
          <section id="positions">
            <h2 className="section-title mb-5">Your Positions</h2>
            <PositionsList />
          </section>

          <hr className="divider-zeus" />

          {/* Add Liquidity */}
          <section id="add">
            <h2 className="section-title mb-5">Add Liquidity</h2>
            <div className="card-zeus p-6 md:p-8">
              <AddLiquidityForm />
            </div>
          </section>

        </div>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-primary/15 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="text-xl gradient-text"
                style={{fontFamily:"var(--font-bangers)", letterSpacing:"0.05em"}}
              >
                ZEUS LIQUIDITY
              </span>
              <span className="text-muted-foreground text-sm">• earn.pepes.dog</span>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Built on Uniswap V4 • Ethereum Mainnet
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/zeuscoineth_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                𝕏 Twitter
              </a>
              <a
                href="https://zeuscoin.vip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                🐾 zeuscoin.vip
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground/50 font-mono">
            CA: 0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8
          </div>
        </div>
      </footer>

    </div>
  )
}
