"use client"

import { useState } from "react"
import { PriceChart } from "@/components/liquidity/PriceChart"
import { MarketStats } from "@/components/ui/MarketStats"
import { PositionsList } from "@/components/positions/PositionsList"
import { AddLiquidityForm } from "@/components/liquidity/AddLiquidityForm"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import Image from "next/image"

const NAV_LINKS = [["Market", "#market"], ["Chart", "#chart"], ["Positions", "#positions"], ["Add LP", "#addlp"]] as const

export default function Home() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* ── HEADER ─────────────────────────────────── */}
      <header className="header-zeus sticky top-0 z-50">
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,230,0,0.35)", flexShrink: 0 }}>
                <Image src="/zeus-avatar-new.png" alt="ZEUS" width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <span style={{ fontFamily: "var(--font-titan-one)", fontSize: "1rem", color: "#fff", letterSpacing: "0.04em" }}>
                Zeus Liquidity
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(([label, href]) => (
                <a key={href} href={href} className="btn-ghost">{label}</a>
              ))}
              <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-ghost" aria-label="Twitter">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </nav>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button onClick={() => open()} className="btn-primary" style={{ display: "none" }} id="wallet-btn-desktop">
                {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : "Connect Wallet"}
              </button>
              <button
                onClick={() => open()}
                className="btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.5rem 1.1rem", minHeight: "2.25rem" }}
              >
                {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : "Connect Wallet"}
              </button>
              {/* Hamburger */}
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", display: "flex", flexDirection: "column", gap: 5 }}
                aria-label="Menu"
              >
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    display: "block", width: 20, height: 1.5, background: "#fff", borderRadius: 2, transition: "all 0.2s",
                    transform: i === 0 && menuOpen ? "rotate(45deg) translateY(6.5px)" : i === 2 && menuOpen ? "rotate(-45deg) translateY(-6.5px)" : "none",
                    opacity: i === 1 && menuOpen ? 0 : 1,
                  }} />
                ))}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "rgba(12,15,22,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "1rem 1.5rem 1.5rem" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {NAV_LINKS.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="btn-ghost" style={{ justifyContent: "flex-start", fontSize: "1rem", padding: "0.7rem 0.5rem" }}>
                  {label}
                </a>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0.5rem 0" }} />
              <button onClick={() => { open(); setMenuOpen(false) }} className="btn-primary" style={{ width: "100%" }}>
                {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : "Connect Wallet"}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem 1.5rem 2rem", minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }} className="hero-grid">

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Tag */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,230,0,0.08)", border: "1px solid rgba(255,230,0,0.22)", borderRadius: "2rem", padding: "0.28rem 0.85rem", width: "fit-content" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFE600", display: "inline-block", boxShadow: "0 0 5px #FFE600" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#FFE600", letterSpacing: "0.09em", textTransform: "uppercase" }}>Uniswap V4 · Ethereum</span>
            </div>

            {/* Heading */}
            <div>
              <h1 style={{ fontFamily: "var(--font-titan-one)", fontSize: "clamp(2.8rem,6vw,5.5rem)", color: "#fff", lineHeight: 1.05, letterSpacing: "0.02em", margin: 0 }}>
                Earn fees<br />
                with <span style={{ color: "#FFE600" }}>$ZEUS</span>
              </h1>
              <p style={{ marginTop: "1.1rem", fontSize: "1.1rem", color: "var(--foreground-muted)", lineHeight: 1.6, maxWidth: 460 }}>
                Provide liquidity to the ZEUS/ETH pool on Uniswap V4. Manage your positions, track performance, and collect trading fees.
              </p>
            </div>

            {/* Live stats */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              {[
                { label: "Total Liquidity", value: "$2.4M", color: "#FFE600" },
                { label: "24h Volume", value: "$180K", color: "#4394f4" },
                { label: "LP APR (est.)", value: "~42%", color: "#22c55e" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.7rem", color: "var(--foreground-muted)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-titan-one)", fontSize: "1.45rem", color, letterSpacing: "0.02em" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="#addlp" className="btn-primary" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
                Provide Liquidity
              </a>
              <a href="#positions" className="btn-outline" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
                My Positions
              </a>
            </div>

            {/* CA */}
            <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
              <span style={{ color: "var(--foreground-subtle)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.09em" }}>CA</span>
              <span>0x0f7dC5D02...cCC8</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>

          {/* Right: Zeus */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", position: "relative", minHeight: 480 }}>
            {/* Ambient glow */}
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 320, height: 220, background: "radial-gradient(ellipse, rgba(255,230,0,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
            {/* Blue glow top */}
            <div style={{ position: "absolute", top: 40, right: 0, width: 200, height: 200, background: "radial-gradient(circle, rgba(67,148,244,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div className="animate-float" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 380 }}>
              <Image src="/zeus-hero-tall.png" alt="Zeus" width={380} height={507} className="object-contain w-full" priority />
            </div>
          </div>

        </div>
      </section>

      {/* ── TICKER ────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", padding: "0.55rem 0", background: "rgba(255,230,0,0.04)" }}>
        <div className="marquee-track">
          {[1,2].map(rep => (
            <div key={rep} style={{ display: "flex", alignItems: "center", gap: "2rem", padding: "0 2rem", whiteSpace: "nowrap", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,230,0,0.7)", letterSpacing: "0.06em" }}>
              {["$ZEUS / ETH","Uniswap V4","Ethereum Mainnet","LP Rewards Active","0% Tax","LP Burned","earn.pepes.dog"].map((item, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                  {item}
                  <span style={{ opacity: 0.25, fontSize: "0.45rem" }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────── */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>

          {/* MARKET OVERVIEW */}
          <section id="market">
            <SectionHeader label="Live Data" title="Market Overview" image="/zeus-sit.png" />
            <MarketStats />
          </section>

          {/* PRICE CHART */}
          <section id="chart">
            <SectionHeader label="Analytics" title="Price Chart" />
            <div className="card-glass" style={{ padding: "1.25rem" }}>
              <PriceChart />
            </div>
          </section>

          {/* POSITIONS */}
          <section id="positions">
            <SectionHeader label="Portfolio" title="Your Positions" image="/pepe-hero.png" />
            <PositionsList />
          </section>

          {/* ADD LIQUIDITY */}
          <section id="addlp">
            <SectionHeader label="Earn Fees" title="Add Liquidity" />
            <div className="card-glass-strong" style={{ padding: "2rem 2.5rem" }}>
              <AddLiquidityForm />
            </div>
          </section>

        </div>
      </main>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2.5rem 1.5rem", marginTop: "2rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,230,0,0.3)" }}>
                <Image src="/zeus-avatar-new.png" alt="ZEUS" width={34} height={34} className="object-cover w-full h-full" />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-titan-one)", fontSize: "0.95rem", color: "#fff", letterSpacing: "0.04em" }}>Zeus Liquidity</div>
                <div style={{ fontSize: "0.7rem", color: "var(--foreground-muted)" }}>earn.pepes.dog</div>
              </div>
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--foreground-subtle)", textAlign: "center" }}>
              Built on Uniswap V4 · Ethereum Mainnet<br />
              <span style={{ color: "var(--foreground-muted)" }}>Not financial advice. Provide liquidity at your own risk.</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </a>
              <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
                CA: 0x0f7d...cCC8
              </button>
            </div>

          </div>
        </div>
      </footer>

    </div>
  )
}

/* ── Section Header ───────────────────────────────── */
function SectionHeader({ label, title, image }: { label: string; title: string; image?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", gap: "1rem" }}>
      <div>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FFE600", marginBottom: "0.35rem" }}>
          {label}
        </div>
        <h2 style={{ fontFamily: "var(--font-titan-one)", fontSize: "clamp(1.5rem,3vw,2.25rem)", color: "#fff", letterSpacing: "0.02em", lineHeight: 1.1, margin: 0 }}>
          {title}
        </h2>
      </div>
      {image && (
        <div style={{ width: 72, opacity: 0.55, flexShrink: 0 }} className="hidden md:block">
          <Image src={image} alt="" width={72} height={72} className="object-contain w-full" />
        </div>
      )}
    </div>
  )
}
