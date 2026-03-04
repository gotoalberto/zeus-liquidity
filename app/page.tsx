"use client"

import { useState } from "react"
import { PriceChart } from "@/components/liquidity/PriceChart"
import { MarketStats } from "@/components/ui/MarketStats"
import { PositionsList } from "@/components/positions/PositionsList"
import { AddLiquidityForm } from "@/components/liquidity/AddLiquidityForm"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import Image from "next/image"

const NAV = [["Market","#market"],["Chart","#chart"],["Positions","#positions"],["Add LP","#addlp"]] as const

export default function Home() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const [menuOpen, setMenuOpen] = useState(false)
  const walletLabel = isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : "Connect Wallet"

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* HEADER */}
      <header className="header-zeus sticky top-0 z-50">
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 2rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <a href="/" style={{ display:"flex", alignItems:"center", gap:"0.65rem", textDecoration:"none" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", overflow:"hidden", border:"1.5px solid rgba(255,230,0,0.4)", background:"#1a1f2e", flexShrink:0 }}>
              <Image src="/zeus-avatar-new.png" alt="ZEUS" width={34} height={34} className="object-cover w-full h-full" />
            </div>
            <span style={{ fontFamily:"var(--font-titan-one)", fontSize:"1.05rem", color:"#fff", letterSpacing:"0.04em" }}>Zeus Liquidity</span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(([l,h]) => <a key={h} href={h} className="btn-ghost">{l}</a>)}
            <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-ghost" aria-label="Twitter">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </nav>

          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <button onClick={() => open()} className="btn-primary hidden md:inline-flex" style={{ fontSize:"0.85rem", padding:"0.5rem 1.2rem", minHeight:"2.1rem" }}>{walletLabel}</button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", cursor:"pointer", padding:"0.5rem", display:"flex", flexDirection:"column", gap:5 }} aria-label="Menu">
              {[0,1,2].map(i => <span key={i} style={{ display:"block", width:20, height:1.5, background:"#fff", borderRadius:2, transition:"all 0.2s", transform:i===0&&menuOpen?"rotate(45deg) translateY(6.5px)":i===2&&menuOpen?"rotate(-45deg) translateY(-6.5px)":"none", opacity:i===1&&menuOpen?0:1 }} />)}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background:"rgba(12,15,22,0.98)", borderTop:"1px solid rgba(255,255,255,0.07)", padding:"1rem 2rem 1.5rem" }}>
            <nav style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
              {NAV.map(([l,h]) => <a key={h} href={h} onClick={() => setMenuOpen(false)} className="btn-ghost" style={{ justifyContent:"flex-start", fontSize:"1rem", padding:"0.7rem 0.5rem" }}>{l}</a>)}
              <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"0.5rem 0" }} />
              <button onClick={() => { open(); setMenuOpen(false) }} className="btn-primary" style={{ width:"100%" }}>{walletLabel}</button>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ position:"relative", minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", overflow:"hidden" }}>
        {/* Gradient: right side slightly lighter so white dog is visible */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(110deg, #0c0f16 35%, #0f1520 60%, #141c2e 100%)", zIndex:0 }} />
        {/* Blue haze right */}
        <div style={{ position:"absolute", right:0, top:"10%", width:"50%", height:"80%", background:"radial-gradient(ellipse at right center, rgba(67,148,244,0.09) 0%, transparent 65%)", zIndex:0 }} />
        {/* Yellow glow bottom right */}
        <div style={{ position:"absolute", bottom:0, right:"15%", width:500, height:300, background:"radial-gradient(ellipse, rgba(255,230,0,0.08) 0%, transparent 70%)", zIndex:0 }} />

        <div style={{ maxWidth:1280, margin:"0 auto", padding:"4rem 2rem", width:"100%", position:"relative", zIndex:1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }} className="hero-grid">

            {/* Left */}
            <div style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"rgba(255,230,0,0.08)", border:"1px solid rgba(255,230,0,0.2)", borderRadius:"2rem", padding:"0.3rem 0.9rem", width:"fit-content" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#FFE600", display:"inline-block", boxShadow:"0 0 6px #FFE600" }} />
                <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#FFE600", letterSpacing:"0.1em", textTransform:"uppercase" }}>Uniswap V4 · Ethereum Mainnet</span>
              </div>

              <div>
                <h1 style={{ fontFamily:"var(--font-titan-one)", fontSize:"clamp(2.8rem,5vw,5rem)", color:"#fff", lineHeight:1.05, letterSpacing:"0.01em", margin:0 }}>
                  Earn fees<br />with <span style={{ color:"#FFE600" }}>$ZEUS</span>
                </h1>
                <p style={{ fontSize:"1.05rem", color:"#6a7a8a", lineHeight:1.7, maxWidth:440, margin:"1rem 0 0" }}>
                  Provide liquidity to the ZEUS/ETH pool on Uniswap V4. Manage positions, track performance, and collect trading fees.
                </p>
              </div>

              <div style={{ display:"flex", gap:"2.5rem", flexWrap:"wrap" }}>
                {[{label:"Total Liquidity",value:"$2.4M",color:"#FFE600"},{label:"24h Volume",value:"$180K",color:"#4394f4"},{label:"Est. APR",value:"~42%",color:"#22c55e"}].map(({label,value,color}) => (
                  <div key={label}>
                    <div style={{ fontSize:"0.65rem", color:"#3d4d5c", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.2rem" }}>{label}</div>
                    <div style={{ fontFamily:"var(--font-titan-one)", fontSize:"1.6rem", color, letterSpacing:"0.01em" }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                <a href="#addlp" className="btn-primary" style={{ fontSize:"1rem", padding:"0.85rem 2.25rem" }}>Provide Liquidity</a>
                <a href="#positions" className="btn-outline" style={{ fontSize:"1rem", padding:"0.85rem 2.25rem" }}>My Positions</a>
              </div>

              <button className="ca-box" onClick={() => navigator.clipboard.writeText("0x0f7dC5D02CC1E1f5Ee47854d534D332A1081cCC8")} style={{ width:"fit-content" }}>
                <span style={{ color:"#3d4d5c", fontSize:"0.65rem", textTransform:"uppercase", letterSpacing:"0.08em", flexShrink:0 }}>CA</span>
                <span>0x0f7dC5D02...cCC8</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0 }}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>

            {/* Right: Zeus */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", position:"relative" }}>
              {/* Outer ambient glows */}
              <div style={{ position:"absolute", top:"20%", right:"-10%", width:300, height:300, background:"radial-gradient(circle, rgba(67,148,244,0.12) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />
              <div style={{ position:"absolute", bottom:"-5%", left:"50%", transform:"translateX(-50%)", width:500, height:150, background:"radial-gradient(ellipse, rgba(255,230,0,0.15) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />
              {/* Card */}
              <div style={{
                position:"relative", zIndex:1, width:"100%", maxWidth:400,
                background:"linear-gradient(175deg, rgba(255,255,255,0.09) 0%, rgba(220,235,255,0.04) 60%, rgba(255,230,0,0.03) 100%)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"2.5rem",
                overflow:"hidden",
                padding:"2.5rem 2rem 0",
                boxShadow:"0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}>
                {/* Top shimmer line */}
                <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
                {/* Inner glow */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"50%", background:"radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.07) 0%, transparent 60%)", pointerEvents:"none" }} />
                {/* Bottom yellow glow */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:100, background:"linear-gradient(to top, rgba(255,230,0,0.12), transparent)", pointerEvents:"none" }} />
                <div className="animate-float">
                  <Image src="/zeus-hero-tall.png" alt="Zeus" width={360} height={480} className="object-contain w-full" priority />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", overflow:"hidden", padding:"0.6rem 0", background:"rgba(255,230,0,0.03)" }}>
        <div className="marquee-track">
          {[1,2].map(rep => (
            <div key={rep} style={{ display:"flex", alignItems:"center", padding:"0 2rem", whiteSpace:"nowrap", fontSize:"0.72rem", fontWeight:700, color:"rgba(255,230,0,0.5)", letterSpacing:"0.07em" }}>
              {["$ZEUS / ETH","Uniswap V4","Ethereum Mainnet","LP Rewards Active","0% Tax","LP Burned","earn.pepes.dog"].map((item,i) => (
                <span key={i} style={{ display:"flex", alignItems:"center", gap:"2rem", marginRight:"2rem" }}>
                  {item}<span style={{ opacity:0.2, fontSize:"0.45rem" }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main style={{ maxWidth:1280, margin:"0 auto", padding:"6rem 2rem" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"6rem" }}>

          <section id="market">
            <SectionHeader label="Live Data" title="Market Overview" image="/zeus-sit.png" />
            <MarketStats />
          </section>

          <section id="chart">
            <SectionHeader label="Analytics" title="Price Chart" />
            <div className="card-glass" style={{ padding:"1.5rem" }}>
              <PriceChart />
            </div>
          </section>

          <section id="positions">
            <SectionHeader label="Portfolio" title="Your Positions" image="/pepe-hero.png" />
            <PositionsList />
          </section>

          <section id="addlp">
            <SectionHeader label="Earn Fees" title="Add Liquidity" />
            <div className="card-glass-strong" style={{ padding:"2rem 2.5rem" }}>
              <AddLiquidityForm />
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"3rem 2rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"1.5rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", overflow:"hidden", border:"1.5px solid rgba(255,230,0,0.35)", background:"#1a1f2e" }}>
              <Image src="/zeus-avatar-new.png" alt="ZEUS" width={36} height={36} className="object-cover w-full h-full" />
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-titan-one)", fontSize:"0.95rem", color:"#fff", letterSpacing:"0.04em" }}>Zeus Liquidity</div>
              <div style={{ fontSize:"0.7rem", color:"#3d4d5c" }}>earn.pepes.dog</div>
            </div>
          </div>
          <div style={{ fontSize:"0.78rem", color:"#3d4d5c", textAlign:"center", lineHeight:1.6 }}>
            Built on Uniswap V4 · Ethereum Mainnet<br />
            <span style={{ color:"#4d5d6e" }}>Not financial advice. Use at your own risk.</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <a href="https://twitter.com/thezeustoken" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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

function SectionHeader({ label, title, image }: { label: string; title: string; image?: string }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"2rem", gap:"1rem" }}>
      <div>
        <div style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#FFE600", marginBottom:"0.4rem" }}>{label}</div>
        <h2 style={{ fontFamily:"var(--font-titan-one)", fontSize:"clamp(1.6rem,3vw,2.25rem)", color:"#fff", letterSpacing:"0.02em", lineHeight:1.1, margin:0 }}>{title}</h2>
      </div>
      {image && (
        <div style={{ width:80, opacity:0.85, flexShrink:0 }} className="hidden md:block">
          <Image src={image} alt="" width={70} height={70} className="object-contain w-full" />
        </div>
      )}
    </div>
  )
}
