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

function CautionTape({ dark = false }: { dark?: boolean }) {
  const items = Array(20).fill(TICKER_ITEMS).flat()
  return (
    <div className={dark ? "caution-tape-dark" : "caution-tape"}>
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: dark ? "var(--yellow)" : "var(--black)",
            padding: "0 1.5rem",
          }}>
            {item} <span style={{ opacity: 0.4 }}>✦</span>
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
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--black)", background: "#fff", flexShrink: 0 }}>
              <Image src="/zeus-avatar-new.png" alt="ZEUS" width={38} height={38} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#fff", letterSpacing: "0.04em" }}>earn.pepes.dog</span>
          </a>

          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden md:flex">
            {NAV.map(([l, h]) => <a key={h} href={h} className="nav-link">{l}</a>)}
            <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="nav-link" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => open()} className="btn-zeus hidden md:inline-flex" style={{ fontSize: "0.85rem", padding: "0.45rem 1.2rem", minHeight: "2.2rem" }}>{walletLabel}</button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", display: "flex", flexDirection: "column", gap: 5 }} aria-label="Menu">
              {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.2s", transform: i === 0 && menuOpen ? "rotate(45deg) translateY(7px)" : i === 2 && menuOpen ? "rotate(-45deg) translateY(-7px)" : "none", opacity: i === 1 && menuOpen ? 0 : 1 }} />)}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: "rgba(36,100,196,0.98)", borderTop: "2px solid var(--black)", padding: "1rem 1.5rem 1.5rem" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setMenuOpen(false)} className="nav-link" style={{ fontSize: "1rem", padding: "0.65rem 0.5rem" }}>{l}</a>)}
              <div style={{ height: 2, background: "rgba(255,255,255,0.2)", margin: "0.5rem 0" }} />
              <button onClick={() => { open(); setMenuOpen(false) }} className="btn-zeus" style={{ width: "100%" }}>{walletLabel}</button>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "5rem 1.5rem 4rem" }}>

        {/* Floating characters — desktop only */}
        <div className="hidden lg:block" style={{ position: "absolute", left: "2%", top: "15%", width: 180, zIndex: 2 }}>
          <Image src="/zeus-sit-new.png" alt="" width={180} height={180} className="animate-float" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(3px 5px 0 rgba(0,0,0,0.3))" }} />
        </div>
        <div className="hidden lg:block" style={{ position: "absolute", left: "7%", bottom: "8%", width: 160, zIndex: 2 }}>
          <Image src="/zeus-walk-new.png" alt="" width={160} height={160} className="animate-float-alt" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(3px 5px 0 rgba(0,0,0,0.3))" }} />
        </div>
        <div className="hidden lg:block" style={{ position: "absolute", right: "3%", top: "12%", width: 170, zIndex: 2 }}>
          <Image src="/zeus-walk-new.png" alt="" width={170} height={170} className="animate-float" style={{ objectFit: "contain", width: "100%", height: "auto", transform: "scaleX(-1)", filter: "drop-shadow(3px 5px 0 rgba(0,0,0,0.3))" }} />
        </div>
        <div className="hidden lg:block" style={{ position: "absolute", right: "7%", bottom: "8%", width: 155, zIndex: 2 }}>
          <Image src="/pepe-new.png" alt="" width={155} height={155} className="animate-float-alt" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(3px 5px 0 rgba(0,0,0,0.3))" }} />
        </div>

        {/* Center content */}
        <div style={{ textAlign: "center", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>

          {/* Sub-label */}
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "#fff", letterSpacing: "0.15em", textTransform: "uppercase", textShadow: "2px 2px 0 var(--black)", background: "rgba(0,0,0,0.15)", borderRadius: "2rem", padding: "0.3rem 1.2rem", border: "2px solid rgba(255,255,255,0.3)" }}>
            Liquidity Manager
          </div>

          {/* Main title */}
          <h1 className="hero-title">ZEUS</h1>

          {/* Subtitle */}
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 3vw, 2rem)", color: "#fff", letterSpacing: "0.08em", textShadow: "2px 2px 0 rgba(0,0,0,0.4)", marginTop: "-0.5rem" }}>
            PEPE'S DOG
          </p>

          {/* Zeus hero image */}
          <div style={{ width: "clamp(180px, 25vw, 300px)", margin: "0.5rem 0", background: "transparent" }}>
            <Image src="/zeus-hero-new.png" alt="Zeus" width={300} height={300} priority unoptimized className="animate-wag" style={{ objectFit: "contain", width: "100%", height: "auto", filter: "drop-shadow(4px 8px 0 rgba(0,0,0,0.4))" }} />
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#addlp" className="btn-zeus" style={{ fontSize: "1.1rem", padding: "0.8rem 2.5rem" }}>Provide Liquidity</a>
            <a href="#positions" className="btn-blue" style={{ fontSize: "1.1rem", padding: "0.8rem 2.5rem" }}>My Positions</a>
          </div>

          {/* CA */}
          <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
            <span style={{ color: "#aaa", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>CA</span>
            <span>0x0f7dC5D02...cCC8</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
        </div>
      </section>

      <CautionTape />

      {/* ── MARKET STATS ──────────────────────────── */}
      <section id="market" className="section-white" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <h2 className="section-title">Market Overview</h2>
            <div style={{ width: 90, flexShrink: 0 }} className="hidden md:block">
              <Image src="/zeus-sit-new.png" alt="" width={90} height={90} style={{ objectFit: "contain", width: "100%", height: "auto" }} />
            </div>
          </div>
          <MarketStats />
        </div>
      </section>

      <CautionTape dark />

      {/* ── PRICE CHART ───────────────────────────── */}
      <section id="chart" style={{ padding: "4rem 1.5rem", background: "var(--blue-light)", borderTop: "3px solid var(--black)", borderBottom: "3px solid var(--black)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <h2 className="section-title">Price Chart</h2>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", background: "var(--yellow)", border: "2px solid var(--black)", borderRadius: "1rem", padding: "0.3rem 0.8rem", boxShadow: "2px 2px 0 var(--black)" }}>
              MCAP on Y axis
            </div>
          </div>
          <div className="card-zeus" style={{ padding: "1.5rem" }}>
            <PriceChart />
          </div>
        </div>
      </section>

      <CautionTape />

      {/* ── ZEUS + PEPE PROMO ─────────────────────── */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--blue)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>Earn Fees as<br />a ZEUS LP</h2>
              <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#000", lineHeight: 1.6, background: "rgba(255,255,255,0.6)", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "2px solid rgba(0,0,0,0.1)" }}>
                Provide liquidity to the ZEUS/ETH pool on Uniswap V4. Set your price range, deposit tokens, and collect trading fees automatically.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {[{ v: "0%", l: "Tax" }, { v: "∞", l: "Upside" }, { v: "V4", l: "Uniswap" }].map(({ v, l }) => (
                  <div key={l} className="card-yellow" style={{ padding: "0.75rem 1.5rem", textAlign: "center", borderRadius: "1rem" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
              <a href="#addlp" className="btn-zeus" style={{ width: "fit-content", fontSize: "1.1rem" }}>Add Liquidity</a>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Image src="/zeus-pepe-together.png" alt="Zeus and Pepe" width={480} height={320} style={{ objectFit: "contain", width: "100%", maxWidth: 480, height: "auto", filter: "drop-shadow(4px 8px 0 rgba(0,0,0,0.3))" }} className="animate-float" />
            </div>
          </div>
        </div>
      </section>

      <CautionTape dark />

      {/* ── POSITIONS ─────────────────────────────── */}
      <section id="positions" className="section-white" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <h2 className="section-title">Your Positions</h2>
            <div style={{ width: 85, flexShrink: 0 }} className="hidden md:block">
              <Image src="/pepe-hero.png" alt="" width={85} height={85} style={{ objectFit: "contain", width: "100%", height: "auto", }} />
            </div>
          </div>
          <PositionsList />
        </div>
      </section>

      <CautionTape />

      {/* ── ADD LIQUIDITY ─────────────────────────── */}
      <section id="addlp" style={{ padding: "4rem 1.5rem", background: "var(--blue-light)", borderTop: "3px solid var(--black)", borderBottom: "3px solid var(--black)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 className="section-title" style={{ marginBottom: "2rem", textAlign: "center" }}>Add Liquidity</h2>
          <div className="card-zeus" style={{ padding: "2rem 2.5rem" }}>
            <AddLiquidityForm />
          </div>
        </div>
      </section>

      <CautionTape dark />

      {/* ── FOOTER ────────────────────────────────── */}
      <footer style={{ background: "var(--blue-dark)", borderTop: "3px solid var(--black)", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--yellow)", background: "#fff" }}>
              <Image src="/zeus-avatar-new.png" alt="ZEUS" width={40} height={40} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff" }}>earn.pepes.dog</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>ZEUS Liquidity Manager</div>
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, fontWeight: 500 }}>
            Built on Uniswap V4 · Ethereum Mainnet<br />
            Not financial advice. Use at your own risk.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-zeus" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem", minHeight: "2rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Twitter
            </a>
            <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")}>
              CA: 0x0f7d...cCC8
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}
