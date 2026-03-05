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

const TICKER_ITEMS = ["$ZEUS", "PEPE'S DOG", "UNISWAP V4", "EARN FEES", "0% TAX", "LP REWARDS", "$ZEUS", "ETHEREUM", "earn.pepes.dog", "BUY $ZEUS"]

function Ticker() {
  const items = Array(20).fill(TICKER_ITEMS).flat()
  return (
    <div className="caution-tape">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#0a0f1e",
            padding: "0 1.5rem",
          }}>
            {item} <span style={{ opacity: 0.35 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function TickerDark() {
  const items = Array(20).fill(TICKER_ITEMS).flat()
  return (
    <div className="caution-tape-dark">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.55)",
            padding: "0 1.5rem",
          }}>
            {item} <span style={{ color: "rgba(67,148,244,0.5)" }}>✦</span>
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
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── HEADER ────────────────────────────────── */}
      <header className="header-zeus" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(240,230,78,0.4)", background: "rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <Image src="/zeus-avatar-new.png" alt="ZEUS" width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff", letterSpacing: "0.04em" }}>earn.pepes.dog</span>
          </a>

          <nav className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
            {NAV.map(([l, h]) => <a key={h} href={h} className="nav-link">{l}</a>)}
            <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="nav-link" aria-label="Twitter" style={{ padding: "0.4rem 0.6rem" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => open()} className="btn-zeus hidden md:inline-flex" style={{ fontSize: "0.8rem", padding: "0.45rem 1.2rem", minHeight: "2.1rem" }}>{walletLabel}</button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", display: "flex", flexDirection: "column", gap: 5 }} aria-label="Menu">
              {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.2s", transform: i === 0 && menuOpen ? "rotate(45deg) translateY(7px)" : i === 2 && menuOpen ? "rotate(-45deg) translateY(-7px)" : "none", opacity: i === 1 && menuOpen ? 0 : 1 }} />)}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: "rgba(10, 15, 30, 0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem 1.5rem" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: "1rem", padding: "0.65rem 0.75rem" }}>{l}</a>)}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0.75rem 0" }} />
              <button onClick={() => { open(); setMenuOpen(false) }} className="btn-zeus" style={{ width: "100%" }}>{walletLabel}</button>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "5rem 1.5rem 4rem" }}>

        {/* Background radial glow */}
        <div className="hero-glow" />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 80%, rgba(67,148,244,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Floating characters — desktop */}
        <div className="hidden lg:block" style={{ position: "absolute", left: "3%", top: "10%", width: 190, zIndex: 2 }}>
          <Image src="/zeus-sit-new.png" alt="" width={190} height={190} className="animate-float" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 8px 24px rgba(67,148,244,0.25))" }} />
        </div>
        <div className="hidden lg:block" style={{ position: "absolute", left: "8%", bottom: "6%", width: 165, zIndex: 2 }}>
          <Image src="/zeus-stand-new.png" alt="" width={165} height={165} className="animate-float-alt" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 8px 24px rgba(67,148,244,0.2))" }} />
        </div>
        <div className="hidden lg:block" style={{ position: "absolute", right: "3%", top: "10%", width: 175, zIndex: 2 }}>
          <Image src="/zeus-walk-new.png" alt="" width={175} height={175} className="animate-float" style={{ objectFit: "contain", width: "100%", height: "auto", transform: "scaleX(-1)", filter: "drop-shadow(0 8px 24px rgba(67,148,244,0.2))" }} />
        </div>
        <div className="hidden lg:block" style={{ position: "absolute", right: "8%", bottom: "6%", width: 160, zIndex: 2 }}>
          <Image src="/pepe-stand-new.png" alt="" width={160} height={160} className="animate-float-alt" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 8px 20px rgba(67,148,244,0.2))" }} />
        </div>

        {/* Center content */}
        <div style={{ textAlign: "center", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(67,148,244,0.1)",
            border: "1px solid rgba(67,148,244,0.3)",
            borderRadius: "9999px",
            padding: "0.35rem 1.1rem",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Liquidity Manager
            </span>
          </div>

          {/* Main title */}
          <h1 className="hero-title">ZEUS</h1>

          {/* Subtitle */}
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.1rem, 2.5vw, 1.7rem)", color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "-0.5rem" }}>
            PEPE'S DOG
          </p>

          {/* Zeus hero image */}
          <div style={{ width: "clamp(200px, 28vw, 340px)", margin: "0.25rem 0" }}>
            <Image src="/zeus-hero-v2.png" alt="Zeus" width={340} height={340} priority unoptimized className="animate-wag" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 16px 50px rgba(67,148,244,0.4))" }} />
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#addlp" className="btn-zeus" style={{ fontSize: "1rem", padding: "0.8rem 2.2rem" }}>Provide Liquidity</a>
            <a href="#positions" className="btn-outline" style={{ fontSize: "1rem", padding: "0.8rem 2.2rem" }}>My Positions</a>
          </div>

          {/* CA */}
          <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
            <span style={{ color: "rgba(240,230,78,0.5)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>CA</span>
            <span>0x0f7dC5D02...cCC8</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
        </div>
      </section>

      <Ticker />

      {/* ── MARKET STATS ──────────────────────────── */}
      <section id="market" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Live Data</p>
              <h2 className="section-title">Market Overview</h2>
            </div>
            <div className="hidden md:block" style={{ width: 80, flexShrink: 0 }}>
              <Image src="/zeus-sit-new.png" alt="" width={80} height={80} style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(67,148,244,0.3))" }} />
            </div>
          </div>
          <MarketStats />
        </div>
      </section>

      <TickerDark />

      {/* ── PRICE CHART ───────────────────────────── */}
      <section id="chart" className="section-glass" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>$ZEUS / ETH</p>
              <h2 className="section-title">Price Chart</h2>
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              background: "rgba(240,230,78,0.1)",
              border: "1px solid rgba(240,230,78,0.25)",
              borderRadius: "9999px",
              padding: "0.3rem 0.9rem",
              color: "var(--yellow)",
              letterSpacing: "0.08em",
            }}>
              MCAP on Y axis
            </div>
          </div>
          <div className="card-zeus" style={{ padding: "1.5rem" }}>
            <PriceChart />
          </div>
        </div>
      </section>

      <Ticker />

      {/* ── ZEUS + PEPE PROMO ─────────────────────── */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Gradient feature card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(67,148,244,0.15) 0%, rgba(45,111,207,0.1) 50%, rgba(240,230,78,0.05) 100%)",
            border: "1px solid rgba(67,148,244,0.25)",
            borderRadius: "1.5rem",
            padding: "3rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3rem",
            alignItems: "center",
            backdropFilter: "blur(12px)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Accent glow */}
            <div style={{ position: "absolute", top: "-40%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(240,230,78,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative" }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Uniswap V4</p>
                <h2 className="section-title" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}>Earn Fees as<br />a ZEUS LP</h2>
              </div>
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 420 }}>
                Provide liquidity to the ZEUS/ETH pool on Uniswap V4. Set your price range, deposit tokens, and collect trading fees automatically.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {[{ v: "0%", l: "Tax" }, { v: "∞", l: "Upside" }, { v: "V4", l: "Uniswap" }].map(({ v, l }) => (
                  <div key={l} className="card-yellow" style={{ padding: "0.75rem 1.25rem", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", lineHeight: 1, color: "var(--yellow)" }}>{v}</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,230,78,0.6)", marginTop: "0.2rem" }}>{l}</div>
                  </div>
                ))}
              </div>
              <a href="#addlp" className="btn-zeus" style={{ width: "fit-content", fontSize: "1rem" }}>Add Liquidity</a>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              <Image src="/zeus-pepe-promo.png" alt="Zeus and Pepe" width={460} height={300} style={{ objectFit: "contain", width: "100%", maxWidth: 460, height: "auto", filter: "drop-shadow(0 16px 40px rgba(67,148,244,0.25))" }} className="animate-float" />
            </div>
          </div>
        </div>
      </section>

      <TickerDark />

      {/* ── POSITIONS ─────────────────────────────── */}
      <section id="positions" className="section-glass" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Uniswap V4</p>
              <h2 className="section-title">Your Positions</h2>
            </div>
            <div className="hidden md:block" style={{ width: 75, flexShrink: 0 }}>
              <Image src="/pepe-stand-new.png" alt="" width={75} height={75} style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(67,148,244,0.3))" }} />
            </div>
          </div>
          <PositionsList />
        </div>
      </section>

      <Ticker />

      {/* ── ADD LIQUIDITY ─────────────────────────── */}
      <section id="addlp" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Uniswap V4 Pool</p>
            <h2 className="section-title">Add Liquidity</h2>
          </div>
          <div className="card-zeus" style={{ padding: "2rem 2.5rem" }}>
            <AddLiquidityForm />
          </div>
        </div>
      </section>

      <TickerDark />

      {/* ── FOOTER ────────────────────────────────── */}
      <footer style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", marginBottom: "2rem" }}>

            <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(240,230,78,0.3)", background: "rgba(255,255,255,0.05)" }}>
                <Image src="/zeus-avatar-new.png" alt="ZEUS" width={38} height={38} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "#fff" }}>earn.pepes.dog</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 500 }}>ZEUS Liquidity Manager</div>
              </div>
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize: "0.82rem", padding: "0.45rem 1.1rem", minHeight: "2.1rem", gap: "0.4rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Twitter
              </a>
              <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
                CA: 0x0f7d...cCC8
              </button>
            </div>
          </div>

          <div className="divider" />

          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1.5rem", lineHeight: 1.6, fontWeight: 500 }}>
            Built on Uniswap V4 · Ethereum Mainnet · Not financial advice. Use at your own risk.
          </p>
        </div>
      </footer>

    </div>
  )
}
