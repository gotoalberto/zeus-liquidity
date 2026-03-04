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
    <div className="min-h-screen relative overflow-x-hidden">

      {/* Decorative lightning bolts scattered like zeuscoin.vip */}
      <Image
        src="/deco-lightning.png"
        alt=""
        width={60}
        height={80}
        className="deco-lightning animate-float"
        style={{ top: "120px", right: "5%", transform: "rotate(15deg)", animationDelay: "0s" }}
        aria-hidden
      />
      <Image
        src="/deco-lightning.png"
        alt=""
        width={40}
        height={55}
        className="deco-lightning animate-float"
        style={{ top: "300px", left: "3%", transform: "rotate(-10deg)", animationDelay: "1s" }}
        aria-hidden
      />
      <Image
        src="/deco-lightning.png"
        alt=""
        width={50}
        height={68}
        className="deco-lightning animate-float"
        style={{ top: "700px", right: "8%", transform: "rotate(5deg)", animationDelay: "2s" }}
        aria-hidden
      />
      <Image
        src="/deco-lightning.png"
        alt=""
        width={35}
        height={48}
        className="deco-lightning animate-float"
        style={{ top: "1100px", left: "2%", transform: "rotate(-20deg)", animationDelay: "0.5s" }}
        aria-hidden
      />

      {/* HEADER */}
      <header className="header-zeus sticky top-0 z-50">
        <div style={{ maxWidth: "87.5rem", margin: "0 auto", padding: "0 1.25rem" }}>
          <div className="flex items-center justify-between py-3">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
              >
                <Image
                  src="/zeus-avatar-v4.png"
                  alt="ZEUS"
                  width={44}
                  height={44}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div
                  className="text-xl leading-none text-white"
                  style={{
                    fontFamily: "var(--font-titan-one)",
                    WebkitTextStroke: "2px #000",
                    textShadow: "2px 2px 0 #000",
                  }}
                >
                  ZEUS LIQUIDITY
                </div>
                <div className="text-xs font-bold text-white/80" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}>
                  earn.pepes.dog — Uniswap V4
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {["Market", "Chart", "Positions", "Add LP"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "")}`}
                  className="text-white font-bold text-sm hover:text-primary transition-colors"
                  style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Wallet */}
            <button
              onClick={() => open()}
              className="btn-zeus"
              style={{ fontFamily: "var(--font-titan-one)", fontSize: "0.95rem" }}
            >
              {isConnected
                ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                : "Connect Wallet"}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative" style={{ minHeight: "520px" }}>
        <div className="relative w-full" style={{ height: "520px" }}>
          <Image
            src="/hero-banner-v5.png"
            alt="Zeus — God of Liquidity"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Bottom gradient to blend with page bg */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(67,148,244,0) 30%, #4394f4 100%)" }}
          />
          {/* Hero tagline */}
          <div className="absolute bottom-16 left-0 right-0 text-center px-4">
            <p
              className="text-white font-bold text-xl md:text-2xl mb-6"
              style={{
                fontFamily: "var(--font-titan-one)",
                textShadow: "3px 3px 0 #000",
                WebkitTextStroke: "1px #000",
              }}
            >
              Provide liquidity. Earn fees. Rule the swamp.
            </p>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <a
                href="#addlp"
                className="btn-zeus"
                style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.15rem", padding: "0.8rem 2.5rem" }}
              >
                Provide Liquidity
              </a>
              <a
                href="https://zeuscoin.vip"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blue"
                style={{ fontFamily: "var(--font-titan-one)", fontSize: "1rem" }}
              >
                zeuscoin.vip
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER STRIP — yellow tape like zeuscoin.vip */}
      <div
        className="overflow-hidden py-3 relative z-10"
        style={{ background: "#f0e64e", borderTop: "3px solid #000", borderBottom: "3px solid #000" }}
      >
        <div className="marquee-track">
          {[1, 2].map((rep) => (
            <div
              key={rep}
              className="flex items-center gap-6 px-8 font-bold text-black text-sm whitespace-nowrap"
              style={{ fontFamily: "var(--font-titan-one)" }}
            >
              {["$ZEUS / ETH", "Uniswap V4", "Ethereum Mainnet", "LP Rewards Active", "0% Tax", "LP Burned", "$ZEUS / ETH", "earn.pepes.dog", "God of Liquidity", "DeFi"].map(
                (item, i) => (
                  <span key={i} className="flex items-center gap-6">
                    {item}
                    <span className="opacity-40">|</span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "76.875rem", margin: "0 auto", padding: "3.5rem 1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>

          {/* MARKET OVERVIEW */}
          <section id="market">
            <h2 className="section-title mb-6">Market Overview</h2>
            <MarketStats />
          </section>

          {/* PRICE CHART */}
          <section id="chart">
            <h2 className="section-title mb-6">Price Chart</h2>
            <PriceChart />
          </section>

          {/* ZEUS & PEPE PROMO */}
          <section className="card-zeus p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 animate-float">
              <Image
                src="/zeus-pepe-defi-v5.png"
                alt="Zeus and Pepe providing liquidity"
                width={200}
                height={200}
                className="rounded-2xl"
                style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000" }}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3
                className="text-3xl md:text-4xl mb-3 text-black"
                style={{
                  fontFamily: "var(--font-titan-one)",
                  WebkitTextStroke: "2px #000",
                  color: "#f0e64e",
                  textShadow: "3px 3px 0 #000",
                }}
              >
                Zeus and Pepe — The OG LP Gods
              </h3>
              <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium">
                Zeus is not just Pepe&apos;s dog — he is the guardian of the swamp&apos;s liquidity.
                Provide LP on the ZEUS/ETH pool and earn fees while supporting the most legendary memecoin on Ethereum.
              </p>
              <div className="flex gap-4 justify-center md:justify-start flex-wrap">
                <div
                  className="px-5 py-3 text-center"
                  style={{ background: "#f0e64e", border: "3px solid #000", borderRadius: "1rem", boxShadow: "4px 4px 0 #000", minWidth: "80px" }}
                >
                  <div style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.6rem" }}>0%</div>
                  <div className="text-xs font-bold mt-1">Tax</div>
                </div>
                <div
                  className="px-5 py-3 text-center text-white"
                  style={{ background: "#1a6fd4", border: "3px solid #000", borderRadius: "1rem", boxShadow: "4px 4px 0 #000", minWidth: "80px" }}
                >
                  <div style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.6rem" }}>V4</div>
                  <div className="text-xs font-bold mt-1 text-white/80">Uniswap</div>
                </div>
                <div
                  className="px-5 py-3 text-center"
                  style={{ background: "#3bff8a", border: "3px solid #000", borderRadius: "1rem", boxShadow: "4px 4px 0 #000", minWidth: "80px" }}
                >
                  <div style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.6rem" }}>LP</div>
                  <div className="text-xs font-bold mt-1">Burned</div>
                </div>
              </div>
            </div>
          </section>

          {/* YOUR POSITIONS */}
          <section id="positions">
            <h2 className="section-title mb-6">Your Positions</h2>
            <PositionsList />
          </section>

          {/* ADD LIQUIDITY */}
          <section id="addlp">
            <h2 className="section-title mb-6">Add Liquidity</h2>
            <div className="card-zeus p-6 md:p-8">
              <AddLiquidityForm />
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "3px solid #000",
          background: "#1a6fd4",
          marginTop: "2rem",
          padding: "2.5rem 1.25rem",
        }}
      >
        <div style={{ maxWidth: "76.875rem", margin: "0 auto" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="flex items-center gap-3">
              <Image
                src="/zeus-avatar-v4.png"
                alt="ZEUS"
                width={48}
                height={48}
                className="rounded-full"
                style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
              />
              <span
                className="text-2xl text-white"
                style={{
                  fontFamily: "var(--font-titan-one)",
                  WebkitTextStroke: "1.5px #000",
                  textShadow: "2px 2px 0 #000",
                }}
              >
                ZEUS LIQUIDITY
              </span>
            </div>

            <div
              className="text-white font-bold text-sm text-center"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
            >
              Built on Uniswap V4 — Ethereum Mainnet
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://x.com/zeuscoineth_"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-zeus"
                style={{ fontFamily: "var(--font-titan-one)", fontSize: "0.9rem", padding: "0.5rem 1.2rem" }}
              >
                X / Twitter
              </a>
              <a
                href="https://zeuscoin.vip"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-zeus"
                style={{ fontFamily: "var(--font-titan-one)", fontSize: "0.9rem", padding: "0.5rem 1.2rem" }}
              >
                zeuscoin.vip
              </a>
            </div>
          </div>

          {/* CA row */}
          <div className="mt-6 flex justify-center">
            <div className="ca-box">
              CA: 0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
