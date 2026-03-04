"use client"

import { useState } from "react"
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative overflow-x-hidden">

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
                  src="/zeus-avatar.png"
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

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {[["Market", "#market"], ["Chart", "#chart"], ["Positions", "#positions"], ["Add LP", "#addlp"]].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-white font-bold text-sm hover:text-yellow-300 transition-colors"
                  style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
                >
                  {label}
                </a>
              ))}
              {/* X (Twitter) icon */}
              <a
                href="https://twitter.com/thezeustoken"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-300 transition-colors"
                aria-label="X / Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </nav>

            {/* Right: Wallet + Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => open()}
                className="btn-zeus hidden sm:inline-flex"
                style={{ fontFamily: "var(--font-titan-one)", fontSize: "0.95rem" }}
              >
                {isConnected
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Connect Wallet"}
              </button>

              {/* Hamburger (mobile) */}
              <button
                className="md:hidden flex flex-col gap-1.5 p-2"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span
                  className="block w-6 h-0.5 bg-white transition-transform"
                  style={{
                    boxShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                    transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
                  }}
                />
                <span
                  className="block w-6 h-0.5 bg-white transition-opacity"
                  style={{
                    boxShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                    opacity: menuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block w-6 h-0.5 bg-white transition-transform"
                  style={{
                    boxShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                    transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div
            className="md:hidden"
            style={{
              background: "rgba(75, 191, 224, 0.97)",
              borderTop: "3px solid #000",
              padding: "1.5rem 1.25rem",
            }}
          >
            <nav className="flex flex-col gap-4">
              {[["Market", "#market"], ["Chart", "#chart"], ["Positions", "#positions"], ["Add LP", "#addlp"]].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white font-bold text-lg"
                  style={{
                    fontFamily: "var(--font-titan-one)",
                    textShadow: "2px 2px 0 #000",
                    WebkitTextStroke: "1px #000",
                  }}
                >
                  {label}
                </a>
              ))}
              <a
                href="https://twitter.com/thezeustoken"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-bold text-lg flex items-center gap-2"
                style={{ fontFamily: "var(--font-titan-one)", textShadow: "2px 2px 0 #000" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow on X
              </a>
              <button
                onClick={() => { open(); setMenuOpen(false) }}
                className="btn-zeus w-full mt-2"
                style={{ fontFamily: "var(--font-titan-one)" }}
              >
                {isConnected
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Connect Wallet"}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* HERO — pepes.dog style */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "80vh" }}>
        {/* Decorative characters — desktop only, absolute positioned */}
        <div className="absolute left-0 bottom-0 w-40 md:w-56 z-10 hidden sm:block pointer-events-none">
          <Image src="/zeus-outfit-1.png" alt="" width={224} height={224} className="object-contain w-full h-full" />
        </div>
        <div className="absolute right-0 top-1/4 w-32 md:w-44 z-10 hidden sm:block pointer-events-none">
          <Image src="/zeus-outfit-2.png" alt="" width={176} height={176} className="object-contain w-full h-full" />
        </div>
        <div className="absolute left-1/4 top-4 w-24 md:w-36 z-10 hidden lg:block pointer-events-none">
          <Image src="/zeus-outfit-3.png" alt="" width={144} height={144} className="object-contain w-full h-full" />
        </div>
        <div className="absolute right-0 bottom-0 w-32 md:w-44 z-10 hidden sm:block pointer-events-none">
          <Image src="/pepe-defi.png" alt="" width={176} height={176} className="object-contain w-full h-full" />
        </div>
        <div className="absolute left-0 top-1/4 w-24 md:w-36 z-10 hidden lg:block pointer-events-none">
          <Image src="/pepe-outfit-1.png" alt="" width={144} height={144} className="object-contain w-full h-full" />
        </div>

        {/* Central content */}
        <div className="relative z-20 text-center px-4 flex flex-col items-center">
          <h1 className="hero-title">ZEUS</h1>
          <p
            className="text-white font-bold mt-1 mb-2"
            style={{
              fontFamily: "var(--font-titan-one)",
              fontSize: "clamp(1.2rem, 4vw, 2rem)",
              WebkitTextStroke: "2px #000",
              textShadow: "3px 3px 0 #000",
            }}
          >
            PEPE'S DOG
          </p>
          <p
            className="text-white font-bold mb-8 max-w-sm"
            style={{
              fontFamily: "var(--font-titan-one)",
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              textShadow: "2px 2px 0 #000",
              WebkitTextStroke: "0.5px #000",
            }}
          >
            Provide liquidity. Earn fees.
          </p>
          <a
            href="#addlp"
            className="btn-zeus"
            style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.15rem", padding: "0.8rem 2.5rem" }}
          >
            Provide Liquidity
          </a>
        </div>

        {/* Zeus hero center — bottom center, large */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ width: "clamp(180px, 25vw, 320px)" }}>
          <Image src="/hero-zeus-center.png" alt="Zeus" width={320} height={320} className="object-contain w-full h-full" />
        </div>
      </section>

      {/* TICKER */}
      <div
        className="overflow-hidden py-2 md:py-3 relative z-10"
        style={{ background: "#FFE600", borderTop: "3px solid #000", borderBottom: "3px solid #000" }}
      >
        <div className="marquee-track">
          {[1, 2].map((rep) => (
            <div
              key={rep}
              className="flex items-center gap-6 px-8 font-bold text-black text-xs md:text-sm whitespace-nowrap"
              style={{ fontFamily: "var(--font-titan-one)" }}
            >
              {["$ZEUS / ETH", "Uniswap V4", "Ethereum Mainnet", "LP Rewards Active", "0% Tax", "LP Burned", "$ZEUS / ETH", "earn.pepes.dog"].map(
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
                src="/zeus-avatar.png"
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
            <div className="flex items-center gap-4">
              <a
                href="https://earn.pepes.dog"
                className="text-white font-bold text-sm hover:text-yellow-300 transition-colors"
                style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
              >
                earn.pepes.dog
              </a>
              <a
                href="https://twitter.com/thezeustoken"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-300 transition-colors"
                aria-label="X / Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
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
