"use client";
import Link from "next/link";
import { useState } from "react";

const T = {
  void: "#0D0520", deep: "#150830", card: "#1E0D3E", raised: "#2A1452",
  cyan: "#00E5FF", gold: "#FFB800", pink: "#FF2D78", purple: "#7B2FBE",
  teal: "#00C896", amber: "#FF8C00", text: "#FFFFFF", text2: "#C8A8E8",
  text3: "#7A5F9A", display: "'Bebas Neue', Impact, sans-serif",
  heading: "'Oswald', sans-serif", body: "'Inter', sans-serif",
};

function WorldNav({ active }: { active: number }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[1,2,3,4].map(n => (
        <Link key={n} href={n === 1 ? "/" : n === 2 ? "/editorial" : n === 3 ? "/lobby" : "/advertise"} style={{
          width: 32, height: 32, borderRadius: "50%",
          background: n === active ? T.gold : T.raised,
          border: `2px solid ${n === active ? T.gold : "rgba(255,255,255,0.2)"}`,
          color: n === active ? T.void : T.text2,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.display, fontSize: 14, textDecoration: "none",
          boxShadow: n === active ? `0 0 12px ${T.gold}` : "none",
        }}>{n}</Link>
      ))}
    </div>
  );
}

function SectionHeader({ label, sub, color = T.gold }: { label: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: color, padding: "8px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontFamily: T.display, fontSize: 18, color: T.void, letterSpacing: 2 }}>{label}</span>
      {sub && <span style={{ fontFamily: T.heading, fontSize: 11, color: "rgba(0,0,0,0.6)", letterSpacing: 1 }}>{sub}</span>}
    </div>
  );
}

function PlacementSlot({ label, sub, icon = "📦", cta = "PLACE YOUR PRODUCT HERE", color = T.cyan }: any) {
  return (
    <div style={{ background: T.card, border: `2px dashed ${color}44`, borderRadius: 8, padding: 14, textAlign: "center", cursor: "pointer", position: "relative" }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: T.heading, fontSize: 11, color, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: T.text3, marginBottom: 8 }}>{sub}</div>}
      <div style={{ fontFamily: T.heading, fontSize: 9, color: T.text3, letterSpacing: 0.5, border: `1px dashed ${color}44`, padding: "3px 8px", borderRadius: 4 }}>{cta}</div>
    </div>
  );
}

function StatBox({ label, value, sub, color = T.cyan }: any) {
  return (
    <div style={{ background: T.card, border: `1px solid ${color}44`, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: T.heading, fontSize: 9, color: T.text3, letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.display, fontSize: 26, color, letterSpacing: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: T.text3 }}>{sub}</div>}
    </div>
  );
}

export default function Home4Advertisers() {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div style={{ background: T.void, minHeight: "100vh", color: T.text, fontFamily: T.body }}>

      {/* ── NAV ── */}
      <nav style={{ background: T.deep, borderBottom: `1px solid rgba(255,184,0,0.3)`, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: T.display, fontSize: 9, color: T.cyan, letterSpacing: 3 }}>THE</div>
          <div style={{ fontFamily: T.display, fontSize: 22, color: T.gold, letterSpacing: 2, lineHeight: 1 }}>MUSICIAN&apos;S INDEX</div>
        </div>
        <div style={{ fontFamily: T.heading, fontSize: 11, color: T.amber, letterSpacing: 2, textAlign: "center" }}>
          <div>ADVERTISERS &amp; SPONSORS WORLD</div>
          <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1 }}>ISSUE: CURRENT WEEK</div>
        </div>
        <WorldNav active={4} />
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>

        {/* ══ BELT 1: PREMIUM ADS SPOTLIGHT ══ */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="ADVERTISERS & SPONSORS WORLD | PREMIUM ADS SPOTLIGHT" color={T.amber} />

          {/* Hero Sponsor Billboard */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            
            {/* Main Billboard */}
            <div style={{ background: `linear-gradient(135deg, ${T.raised}, ${T.void})`, border: `2px solid ${T.amber}`, boxShadow: `0 0 20px rgba(255,140,0,0.3)`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: T.amber, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: T.heading, fontSize: 10, color: T.void, fontWeight: 700, letterSpacing: 1 }}>Sponsor Spotlight</span>
              </div>
              <div style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontFamily: T.heading, fontSize: 11, color: T.text3, letterSpacing: 1.5, marginBottom: 8 }}>YOUR BRAND HERE</div>
                <div style={{ fontFamily: T.display, fontSize: 28, color: T.gold, letterSpacing: 2, marginBottom: 8 }}>FEATURED CAMPAIGNS</div>
                <div style={{ aspectRatio: "16/9", background: T.deep, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px dashed ${T.amber}44` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 36 }}>🚗</div>
                    <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3 }}>Luxury C218 ad.</div>
                  </div>
                </div>
                <Link href="/advertise/packages" style={{ display: "block", padding: "8px", background: T.amber, color: T.void, borderRadius: 6, fontFamily: T.heading, fontSize: 11, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>
                  GET STARTED HERE
                </Link>
              </div>
            </div>

            {/* Sponsored Artist Pre-roll */}
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.3)`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: T.cyan, padding: "6px 12px" }}>
                <span style={{ fontFamily: T.heading, fontSize: 10, color: T.void, fontWeight: 700, letterSpacing: 1 }}>SPONSORED ARTIST PRE-ROLL</span>
              </div>
              <div style={{ padding: 16, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.raised, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2px solid ${T.cyan}` }}>👤</div>
                <div style={{ fontFamily: T.display, fontSize: 16, color: T.cyan, marginBottom: 4 }}>ARTIST NAME</div>
                <div style={{ fontSize: 11, color: T.text2, marginBottom: 12 }}>Artist Profile Sponsored By</div>
                <div style={{ background: T.raised, borderRadius: 6, padding: "6px 10px", fontFamily: T.heading, fontSize: 10, color: T.gold }}>📺 VIDEO PRE-ROLL SLOT</div>
              </div>
            </div>

            {/* Brand Takeover + Interactive */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: T.card, border: `1px solid rgba(255,45,120,0.4)`, borderRadius: 10, padding: 14, flex: 1 }}>
                <div style={{ fontFamily: T.heading, fontSize: 10, color: T.pink, letterSpacing: 1.5, marginBottom: 8 }}>BRAND TAKEOVER BANNER</div>
                <div style={{ background: T.raised, borderRadius: 6, padding: 10, textAlign: "center", border: `1px dashed ${T.pink}44` }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📣</div>
                  <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3 }}>Full-width homepage takeover — premium slot</div>
                </div>
              </div>
              <div style={{ background: T.card, border: `1px solid rgba(255,184,0,0.3)`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: T.heading, fontSize: 10, color: T.gold, letterSpacing: 1.5, marginBottom: 8 }}>INTERACTIVE AD CARD</div>
                <div style={{ background: T.raised, borderRadius: 6, padding: 10, textAlign: "center", border: `1px dashed ${T.gold}44` }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>⌚</div>
                  <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3 }}>Clickable interactive product card</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BELT 2: ADVERTISING MARKETPLACE ══ */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="ADVERTISING MARKETPLACE" color={T.pink} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            
            {/* Left column — buy/build */}
            <div style={{ background: T.card, border: `1px solid rgba(255,45,120,0.3)`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["buy", "build", "target"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "6px 4px", background: activeTab === tab ? T.pink : T.raised, border: `1px solid ${activeTab === tab ? T.pink : "rgba(255,255,255,0.1)"}`, borderRadius: 6, fontFamily: T.heading, fontSize: 10, color: activeTab === tab ? "#fff" : T.text2, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" as const }}>
                    {tab === "buy" ? "Buy Ad" : tab === "build" ? "Campaign" : "Target"}
                  </button>
                ))}
              </div>
              {activeTab === "buy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["Homepage Banner", "$199.99/wk"], ["Article Inline", "$24.99/wk"], ["Live Overlay", "$99.99/show"], ["Game Lobby", "$79.99/wk"]].map(([slot, price]) => (
                    <div key={slot} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.raised, borderRadius: 6 }}>
                      <span style={{ fontFamily: T.heading, fontSize: 12, color: T.text }}>{slot}</span>
                      <span style={{ fontFamily: T.display, fontSize: 14, color: T.gold }}>{price}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "build" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input placeholder="Campaign Name" style={{ width: "100%", padding: "8px 12px", background: T.raised, border: `1px solid rgba(0,229,255,0.3)`, borderRadius: 6, color: "#fff", fontSize: 13, boxSizing: "border-box" as const }} />
                  <input placeholder="Daily Budget ($)" style={{ width: "100%", padding: "8px 12px", background: T.raised, border: `1px solid rgba(0,229,255,0.3)`, borderRadius: 6, color: "#fff", fontSize: 13, boxSizing: "border-box" as const }} />
                  <button style={{ padding: "10px", background: T.pink, color: "#fff", border: "none", borderRadius: 6, fontFamily: T.heading, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>LAUNCH NEW EFFORT</button>
                </div>
              )}
              {activeTab === "target" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["All Music Fans", "Hip Hop / Trap", "R&B / Soul", "Live Show Watchers", "Contest Voters"].map(seg => (
                    <div key={seg} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: T.raised, borderRadius: 6 }}>
                      <span style={{ fontFamily: T.heading, fontSize: 11, color: T.text }}>{seg}</span>
                      <span style={{ fontFamily: T.heading, fontSize: 9, color: T.cyan, border: `1px solid ${T.cyan}44`, padding: "2px 8px", borderRadius: 99 }}>SELECT</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column — sponsorship types */}
            <div style={{ background: T.card, border: `1px solid rgba(255,45,120,0.3)`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontFamily: T.heading, fontSize: 12, color: T.pink, letterSpacing: 1.5, marginBottom: 14 }}>WOULD YOU LIKE TO SEE YOUR ITEM HERE?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["🎤 Event Sponsorships", "SIGN IN / CREATE ACCOUNT"], ["⚡ Cypher Sponsorships", "SIGN IN / CREATE ACCOUNT"], ["📡 Livestream Sponsorships", "SIGN IN / CREATE ACCOUNT"], ["📰 Issue Sponsorships", "SIGN IN / CREATE ACCOUNT"]].map(([label, cta]) => (
                  <div key={label} style={{ background: T.raised, border: `1px dashed rgba(255,45,120,0.4)`, borderRadius: 8, padding: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{label.split(" ")[0]}</div>
                    <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text, marginBottom: 6 }}>{label.slice(3)}</div>
                    <Link href="/register?role=advertiser" style={{ display: "block", fontSize: 8, fontFamily: T.heading, color: T.pink, textDecoration: "none", letterSpacing: 0.5, border: `1px solid ${T.pink}44`, borderRadius: 4, padding: "2px 4px" }}>{cta}</Link>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: T.pink, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: T.heading, fontSize: 10, color: "#fff", fontWeight: 700 }}>JOIN US TO PLUG YOUR PRODUCT</div>
                  <div style={{ fontFamily: T.heading, fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Sign In / Create an Account</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BELT 3: INVENTORY & PLACEMENTS ══ */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="INVENTORY & PLACEMENTS (Blueprinted)" color="#4A90D9" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            <PlacementSlot label="HOMEPAGE BANNER SLOTS" sub="$199.99/wk" icon="🏠" color={T.cyan} />
            <PlacementSlot label="ARTICLE PAGE ADS" sub="$24.99/wk" icon="📄" color={T.cyan} />
            <PlacementSlot label="ARTIST PROFILE ADS" sub="$59.99/wk" icon="👤" color={T.cyan} />
            <PlacementSlot label="LIVE ROOM OVERLAYS" sub="$99.99/show" icon="🔴" color={T.pink} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            <PlacementSlot label="VIDEO PRE-ROLL" sub="$79.99/show" icon="▶️" color={T.gold} cta="PLACE YOUR PRODUCT HERE" />
            <PlacementSlot label="VIDEO MID-ROLL" sub="$49.99/break" icon="⏸️" color={T.gold} />
            <PlacementSlot label="SPONSORED CARDS" sub="$29.99/wk" icon="🃏" color={T.purple} />
            <PlacementSlot label="SPONSOR BELTS" sub="$149.99/wk" icon="🎯" color={T.purple} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <PlacementSlot label="NEWSLETTER ADS" sub="$39.99/issue" icon="📧" color={T.teal} />
            <PlacementSlot label="PUSH NOTIFICATION ADS" sub="$19.99/blast" icon="🔔" color={T.teal} />
            <PlacementSlot label="EMAIL ADS" sub="$24.99/send" icon="📨" color={T.teal} />
            <PlacementSlot label="STORE PLACEMENT ADS" sub="$34.99/wk" icon="🛍️" color={T.amber} />
          </div>
        </div>

        {/* ══ BELT 4: ANALYTICS & PERFORMANCE ══ */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="ANALYTICS & PERFORMANCE" color={T.teal} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
            <StatBox label="IMPRESSIONS" value="1.2M+" color={T.cyan} />
            <StatBox label="CLICKS" value="35K+" color={T.gold} />
            <StatBox label="ENGAGEMENT" value="12%" color={T.pink} />
            <StatBox label="WATCH TIME (AVG.)" value="1:45" color={T.purple} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
            <StatBox label="CONVERSIONS" value="SALES" color={T.teal} />
            <StatBox label="ROI" value="150% Avg." color={T.amber} />
            <StatBox label="AUDIENCE DEMOGRAPHICS" value="Profile→" color={T.cyan} />
            <StatBox label="HEATMAPS" value="TOP PERFORMING" color={T.gold} />
          </div>

          {/* Mini chart bars */}
          <div style={{ background: T.card, border: `1px solid rgba(0,200,150,0.3)`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: T.heading, fontSize: 10, color: T.teal, letterSpacing: 1.5, marginBottom: 12 }}>PERFORMANCE TREND — THIS WEEK</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
              {[45, 62, 38, 78, 55, 88, 70].map((h, i) => (
                <div key={i} style={{ flex: 1, background: `linear-gradient(to top, ${T.teal}, ${T.cyan})`, height: `${h}%`, borderRadius: "3px 3px 0 0", opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
                <div key={d} style={{ flex: 1, textAlign: "center", fontFamily: T.heading, fontSize: 8, color: T.text3 }}>{d}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ BELT 5: DEALS & CONTRACTS ══ */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="DEALS & CONTRACTS | CONTRACTS & PAYMENT DASHBOARD" color={T.purple} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { icon: "🤝", label: "BRAND DEALS", desc: "Full brand partnership agreements", color: T.gold },
              { icon: "🏪", label: "SPONSORSHIP OFFERS", desc: "Local and regional sponsor packages", color: T.cyan },
              { icon: "🎤", label: "ARTIST PARTNERSHIPS", desc: "Co-branded artist campaigns", color: T.pink },
              { icon: "🏟️", label: "VENUE PARTNERSHIPS", desc: "Venue sponsor placement deals", color: T.teal },
              { icon: "🏆", label: "EVENT SPONSORS", desc: "Contest and cypher title sponsors", color: T.amber },
              { icon: "📋", label: "CONTRACT MANAGER", desc: "VIEW ACTIVE DEALS", color: T.purple },
            ].map(({ icon, label, desc, color }) => (
              <div key={label} style={{ background: T.card, border: `1px solid ${color}44`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: T.heading, fontSize: 11, color, letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment tracking strip */}
          <div style={{ background: T.card, border: `1px solid rgba(123,47,190,0.4)`, borderRadius: 10, padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontFamily: T.display, fontSize: 18, color: T.purple, letterSpacing: 2, whiteSpace: "nowrap" as const }}>PAYMENT TRACKING</div>
            <div style={{ flex: 1, height: 1, background: `rgba(123,47,190,0.3)` }} />
            <div style={{ fontFamily: T.display, fontSize: 18, color: T.purple, letterSpacing: 2, whiteSpace: "nowrap" as const }}>REVENUE SHARE</div>
            <div style={{ flex: 1, height: 1, background: `rgba(123,47,190,0.3)` }} />
            <Link href="/admin/finance/profit" style={{ padding: "8px 16px", background: T.purple, color: "#fff", borderRadius: 6, fontFamily: T.heading, fontSize: 11, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>BIG ACE APPROVE</Link>
          </div>
        </div>

        {/* ══ JOIN CTA ══ */}
        <div style={{ background: `linear-gradient(135deg, ${T.raised}, ${T.deep})`, border: `2px solid ${T.amber}`, boxShadow: `0 0 24px rgba(255,140,0,0.25)`, borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: T.display, fontSize: 42, color: T.gold, letterSpacing: 3, marginBottom: 8 }}>JOIN THE INDEX</div>
          <div style={{ fontFamily: T.heading, fontSize: 14, color: T.text2, marginBottom: 24 }}>
            Reach thousands of music fans from $9.99/week. Local stores — sponsor local artists. Artists promote your brand. Community discovers your business.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register?role=advertiser" style={{ padding: "12px 28px", background: T.amber, color: T.void, borderRadius: 8, fontFamily: T.heading, fontSize: 13, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>START AS ADVERTISER</Link>
            <Link href="/register?role=sponsor" style={{ padding: "12px 28px", border: `2px solid ${T.gold}`, color: T.gold, borderRadius: 8, fontFamily: T.heading, fontSize: 13, letterSpacing: 1, textDecoration: "none" }}>BECOME A SPONSOR</Link>
            <Link href="/sponsors/local" style={{ padding: "12px 28px", border: `2px solid ${T.teal}`, color: T.teal, borderRadius: 8, fontFamily: T.heading, fontSize: 13, letterSpacing: 1, textDecoration: "none" }}>LOCAL BUSINESS SUPPORT</Link>
          </div>
        </div>

      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.deep, borderTop: `1px solid rgba(255,140,0,0.2)`, display: "flex", zIndex: 100 }}>
        {[["🏠","HOME","/"], ["📰","MAGAZINE","/editorial"], ["🔴","LIVE","/lobby"], ["📢","ADS","/advertise"], ["👤","ME","/dashboard/artist"]].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", fontFamily: T.heading, fontSize: 9, letterSpacing: 1, color: label === "ADS" ? T.amber : T.text3, textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ height: 64 }} />
    </div>
  );
}
