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
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="flex items-center justify-between" style={{ height: "64px" }}>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,230,0,0.4)", flexShrink: 0 }}>
                <Image src="/zeus-avatar-new.png" alt="ZEUS" width={34} height={34} className="object-cover w-full h-full" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  color: "#fff",
                  letterSpacing: "0.03em",
                }}
              >
                Zeus Liquidity
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[["Market", "#market"], ["Chart", "#chart"], ["Positions", "#positions"], ["Add LP", "#addlp"]].map(([label, href]) => (
                <a key={href} href={href} className="btn-ghost">
                  {label}
                </a>
              ))}
              <a
                href="https://twitter.com/thezeustoken"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                aria-label="X / Twitter"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </nav>

            {/* Right: Connect */}
            <div className="flex items-center gap-3">
              <button onClick={() => open()} className="btn-primary hidden sm:inline-flex" style={{ fontSize: "0.875rem", padding: "0.55rem 1.25rem" }}>
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
              </button>
              {/* Hamburger */}
              <button className="md:hidden p-2 flex flex-col gap-1.5" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                {[0, 1, 2].map(i => (
                  <span key={i} className="block w-5 h-0.5 bg-white transition-all" style={{
                    transform: i === 0 && menuOpen ? "rotate(45deg) translateY(8px)" : i === 2 && menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
                    opacity: i === 1 && menuOpen ? 0 : 1,
                  }} />
                ))}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "rgba(13,17,23,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem 1.5rem" }}>
            <nav className="flex flex-col gap-1">
              {[["Market", "#market"], ["Chart", "#chart"], ["Positions", "#positions"], ["Add LP", "#addlp"]].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="btn-ghost" style={{ justifyContent: "flex-start", fontSize: "1rem", padding: "0.75rem" }}>
                  {label}
                </a>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0.5rem 0" }} />
              <button onClick={() => { open(); setMenuOpen(false) }} className="btn-primary w-full mt-1">
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.5rem 3rem", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center" }}>

        {/* Glow decorations */}
        <div className="glow-blue" style={{ top: "-100px", left: "-100px" }} />
        <div className="glow-yellow" style={{ bottom: "0", right: "-50px" }} />

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">

          {/* Left: content */}
          <div className="flex flex-col gap-6">
            {/* Tag */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,230,0,0.1)", border: "1px solid rgba(255,230,0,0.25)", borderRadius: "2rem", padding: "0.3rem 0.9rem", width: "fit-content" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFE600", display: "inline-block", boxShadow: "0 0 6px #FFE600" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFE600", letterSpacing: "0.08em", textTransform: "uppercase" }}>Uniswap V4 — Ethereum</span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="hero-title">
                Earn fees<br />
                with <span style={{ color: "#FFE600" }}>$ZEUS</span>
              </h1>
              <p style={{ marginTop: "1.25rem", fontSize: "1.15rem", color: "var(--foreground-muted)", lineHeight: 1.65, maxWidth: "480px" }}>
                Provide liquidity to the ZEUS/ETH pool on Uniswap V4 and earn trading fees. Manage your positions, track performance, and optimize your range.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Total Liquidity", value: "$2.4M" },
                { label: "24h Volume", value: "$180K" },
                { label: "LP APR", value: "42%" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff", letterSpacing: "0.02em" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a href="#addlp" className="btn-primary" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
                Provide Liquidity
              </a>
              <a href="#positions" className="btn-outline" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
                My Positions
              </a>
            </div>

            {/* CA */}
            <div>
              <div className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
                <span style={{ color: "var(--foreground-subtle)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>CA</span>
                <span>0x0f7dC5D02...cCC8</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </div>
            </div>
          </div>

          {/* Right: Zeus image */}
          <div className="flex justify-center lg:justify-end items-end relative" style={{ minHeight: "420px" }}>
            {/* Glow under image */}
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "300px", height: "200px", background: "radial-gradient(ellipse, rgba(255,230,0,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div className="animate-float" style={{ position: "relative", zIndex: 1, maxWidth: "400px", width: "100%" }}>
              <Image
                src="/zeus-hero-tall.png"
                alt="Zeus"
                width={400}
                height={533}
                className="object-contain w-full"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,230,0,0.06)", overflow: "hidden", padding: "0.6rem 0" }}>
        <div className="marquee-track">
          {[1, 2].map((rep) => (
            <div key={rep} className="flex items-center gap-8 px-8 whitespace-nowrap" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFE600", letterSpacing: "0.05em" }}>
              {["$ZEUS / ETH", "Uniswap V4", "Ethereum Mainnet", "LP Rewards Active", "0% Tax", "LP Burned", "earn.pepes.dog"].map((item, i) => (
                <span key={i} className="flex items-center gap-8">
                  {item}
                  <span style={{ opacity: 0.3, fontSize: "0.6rem" }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>

          {/* MARKET OVERVIEW */}
          <section id="market">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <div className="section-label mb-2">Live Data</div>
                <h2 className="section-title">Market Overview</h2>
              </div>
              <div style={{ width: 80, opacity: 0.6 }} className="hidden md:block">
                <Image src="/zeus-sit.png" alt="" width={80} height={80} className="object-contain w-full" />
              </div>
            </div>
            <MarketStats />
          </section>

          {/* PRICE CHART */}
          <section id="chart">
            <div className="mb-8">
              <div className="section-label mb-2">Analytics</div>
              <h2 className="section-title">Price Chart</h2>
            </div>
            <div className="card-glass" style={{ padding: "1.5rem" }}>
              <PriceChart />
            </div>
          </section>

          {/* YOUR POSITIONS */}
          <section id="positions">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <div className="section-label mb-2">Portfolio</div>
                <h2 className="section-title">Your Positions</h2>
              </div>
              <div style={{ width: 80, opacity: 0.6 }} className="hidden md:block">
                <Image src="/pepe-hero.png" alt="" width={80} height={80} className="object-contain w-full" />
              </div>
            </div>
            <PositionsList />
          </section>

          {/* ADD LIQUIDITY */}
          <section id="addlp">
            <div className="mb-8">
              <div className="section-label mb-2">Earn Fees</div>
              <h2 className="section-title">Add Liquidity</h2>
            </div>
            <div className="card-glass-strong" style={{ padding: "2rem 2.5rem" }}>
              <AddLiquidityForm />
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3rem 1.5rem", marginTop: "2rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,230,0,0.4)" }}>
                <Image src="/zeus-avatar-new.png" alt="ZEUS" width={36} height={36} className="object-cover w-full h-full" />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff", letterSpacing: "0.03em" }}>Zeus Liquidity</div>
                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>earn.pepes.dog</div>
              </div>
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--foreground-subtle)", textAlign: "center" }}>
              Built on Uniswap V4 — Ethereum Mainnet<br />
              <span style={{ color: "var(--foreground-muted)" }}>Not financial advice. Provide liquidity at your own risk.</span>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-ghost" aria-label="X / Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
              <div className="ca-box">
                CA: 0x0f7d...cCC8
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
