"use client"

import { useState } from "react"
import { PriceChart } from "@/components/liquidity/PriceChart"
import { MarketStats } from "@/components/ui/MarketStats"
import { PositionsList } from "@/components/positions/PositionsList"
import { AddLiquidityForm } from "@/components/liquidity/AddLiquidityForm"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import Image from "next/image"

const NAV = [["Market", "#market"], ["Chart", "#chart"], ["Positions", "#positions"], ["Add LP", "#addlp"]] as const
const TICKER = ["$ZEUS", "PEPE'S DOG", "UNISWAP V4", "EARN FEES", "0% TAX", "LP REWARDS", "ETHEREUM", "earn.pepes.dog", "BUY $ZEUS"]

function Ticker({ dark = false }: { dark?: boolean }) {
  const items = Array(24).fill(TICKER).flat()
  return (
    <div className={dark ? "caution-tape-dark" : "caution-tape"}>
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: dark ? "rgba(255,255,255,0.45)" : "rgba(19,12,26,0.8)",
            padding: "0 1.4rem",
          }}>
            {item} <span style={{ opacity: 0.3 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const [menuOpen, setMenuOpen] = useState(false)
  const walletLabel = isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── HEADER ────────────────────────────────── */}
      <header className="header-zeus" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--glass-border-bright)", flexShrink: 0 }}>
              <Image src="/zeus-avatar-new.png" alt="ZEUS" width={32} height={32} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "#fff", letterSpacing: "0.02em" }}>earn.pepes.dog</span>
          </a>

          <nav className="hidden md:flex" style={{ alignItems: "center", gap: "0.1rem" }}>
            {NAV.map(([l, h]) => <a key={h} href={h} className="nav-link">{l}</a>)}
            <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ padding: "0.4rem 0.6rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => open()} className="btn-zeus hidden md:inline-flex" style={{ fontSize: "0.82rem", padding: "0.45rem 1.2rem", minHeight: "2rem" }}>{walletLabel}</button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem", flexDirection: "column", gap: 5 }}>
              {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.2s", transform: i===0&&menuOpen?"rotate(45deg) translateY(7px)":i===2&&menuOpen?"rotate(-45deg) translateY(-7px)":"none", opacity: i===1&&menuOpen?0:1 }}/>)}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: "rgba(19,12,26,0.98)", borderTop: "1px solid var(--glass-border)", padding: "1rem 1.5rem 1.5rem" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
              {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: "1rem", padding: "0.65rem 0.75rem" }}>{l}</a>)}
              <div style={{ height: 1, background: "var(--glass-border)", margin: "0.75rem 0" }} />
              <button onClick={() => { open(); setMenuOpen(false) }} className="btn-zeus" style={{ width: "100%" }}>{walletLabel}</button>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO — 2 column layout (onchain.cc style) ── */}
      <section style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "5rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}>

        {/* Subtle bg glow */}
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "60%", background: "radial-gradient(ellipse, rgba(240,230,78,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "10%", width: "40%", height: "40%", background: "radial-gradient(ellipse, rgba(109,156,244,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}
          className="max-lg:grid-cols-1">

          {/* Left — text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border-bright)", borderRadius: "9999px", padding: "0.3rem 1rem", width: "fit-content", backdropFilter: "blur(12px)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Liquidity Manager
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="hero-title">ZEUS</h1>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2vw, 1.5rem)", color: "var(--text-secondary)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.5rem" }}>
                PEPE'S DOG
              </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.1rem)", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 480 }}>
              Provide liquidity to the ZEUS/ETH pool on Uniswap V4. Set your price range and collect trading fees automatically.
            </p>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {[{ v: "0%", l: "Tax" }, { v: "V4", l: "Uniswap" }, { v: "∞", l: "Upside" }].map(({ v, l }) => (
                <div key={l} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border-bright)", borderRadius: "9999px", padding: "0.4rem 1rem", display: "flex", gap: "0.4rem", alignItems: "center", backdropFilter: "blur(8px)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff" }}>{v}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="#addlp" className="btn-zeus" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>Provide Liquidity</a>
              <a href="#positions" className="btn-outline" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>My Positions</a>
            </div>

            {/* CA */}
            <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")} style={{ width: "fit-content" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>CA</span>
              <span>0x0f7dC5D02...cCC8</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>

          {/* Right — Zeus character */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", position: "relative" }}>
            {/* Glow under character */}
            <div style={{ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)", width: "60%", height: 60, background: "radial-gradient(ellipse, rgba(240,230,78,0.2) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <Image
              src="/zeus-hero-final.png"
              alt="Zeus"
              width={480}
              height={480}
              priority
              unoptimized
              className="animate-wag"
              style={{ objectFit: "contain", width: "100%", maxWidth: 480, height: "auto", filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.5))" }}
            />
          </div>
        </div>
      </section>

      <Ticker />

      {/* ── MARKET STATS ──────────────────────────── */}
      <section id="market" style={{ padding: "5rem 1.5rem", background: "var(--bg-secondary)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Live Data</p>
              <h2 className="section-title">Market Overview</h2>
            </div>
            <div className="hidden md:block" style={{ width: 72, flexShrink: 0 }}>
              <Image src="/zeus-sit-final.png" alt="" width={72} height={72} unoptimized style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }} />
            </div>
          </div>
          <MarketStats />
        </div>
      </section>

      <Ticker dark />

      {/* ── PRICE CHART ───────────────────────────── */}
      <section id="chart" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>$ZEUS / ETH</p>
              <h2 className="section-title">Price Chart</h2>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700, background: "var(--glass-bg)", border: "1px solid var(--glass-border-bright)", borderRadius: "9999px", padding: "0.3rem 0.9rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              MCAP on Y axis
            </span>
          </div>
          <div className="card-zeus" style={{ padding: "1.5rem" }}>
            <PriceChart />
          </div>
        </div>
      </section>

      <Ticker />

      {/* ── PROMO — feature card (onchain.cc highlight style) ── */}
      <section style={{ padding: "5rem 1.5rem", background: "var(--bg-secondary)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="feature-card" style={{ padding: "3rem 3.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", position: "relative", overflow: "hidden" }}>

            {/* accent glow */}
            <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(240,230,78,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Uniswap V4</p>
                <h2 className="section-title">Earn Fees as<br />a ZEUS LP</h2>
              </div>
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 400 }}>
                Set your market cap range, deposit tokens, and collect trading fees automatically — no active management needed.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {[{ v: "0%", l: "Tax" }, { v: "∞", l: "Upside" }, { v: "V4", l: "Uniswap" }].map(({ v, l }) => (
                  <div key={l} className="card-yellow" style={{ padding: "0.65rem 1.2rem", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", lineHeight: 1, color: "rgba(240,230,78,0.9)" }}>{v}</div>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,230,78,0.5)", marginTop: "0.2rem" }}>{l}</div>
                  </div>
                ))}
              </div>
              <a href="#addlp" className="btn-zeus" style={{ width: "fit-content", fontSize: "1rem" }}>Add Liquidity</a>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              <Image src="/zeus-pepe-final.png" alt="Zeus and Pepe" width={460} height={380} unoptimized className="animate-float" style={{ objectFit: "contain", width: "100%", maxWidth: 460, height: "auto", filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))" }} />
            </div>
          </div>
        </div>
      </section>

      <Ticker dark />

      {/* ── POSITIONS ─────────────────────────────── */}
      <section id="positions" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Uniswap V4</p>
              <h2 className="section-title">Your Positions</h2>
            </div>
          </div>
          <PositionsList />
        </div>
      </section>

      <Ticker />

      {/* ── ADD LIQUIDITY ─────────────────────────── */}
      <section id="addlp" style={{ padding: "5rem 1.5rem", background: "var(--bg-secondary)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Uniswap V4 Pool</p>
            <h2 className="section-title">Add Liquidity</h2>
          </div>
          <div className="card-zeus" style={{ padding: "2rem 2.5rem" }}>
            <AddLiquidityForm />
          </div>
        </div>
      </section>

      <Ticker dark />

      {/* ── FOOTER ────────────────────────────────── */}
      <footer style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--glass-border)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", marginBottom: "2rem" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--glass-border-bright)" }}>
                <Image src="/zeus-avatar-new.png" alt="ZEUS" width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "#fff" }}>earn.pepes.dog</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 500 }}>ZEUS Liquidity Manager</div>
              </div>
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem", minHeight: "2rem", gap: "0.4rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter
              </a>
              <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
                CA: 0x0f7d...cCC8
              </button>
            </div>
          </div>

          <div className="divider" />
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1.5rem", lineHeight: 1.6 }}>
            Built on Uniswap V4 · Ethereum Mainnet · Not financial advice. Use at your own risk.
          </p>
        </div>
      </footer>

    </div>
  )
}
