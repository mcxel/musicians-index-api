"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// ── DESIGN TOKENS ───────────────────────────────────────
const T = {
  void: "#0D0520", deep: "#150830", card: "#1E0D3E", raised: "#2A1452",
  cyan: "#00E5FF", gold: "#FFB800", pink: "#FF2D78", purple: "#7B2FBE",
  teal: "#00C896", text: "#FFFFFF", text2: "#C8A8E8", text3: "#7A5F9A",
  display: "'Bebas Neue', Impact, sans-serif",
  heading: "'Oswald', 'Arial Narrow', sans-serif",
  body: "'Inter', sans-serif",
};

// ── MAGAZINE JUMP STAR ──────────────────────────────────
function MagazineJumpStar() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 3), 1800);
    return () => clearInterval(t);
  }, []);
  const glowSize = [12, 20, 14][pulse];

  return (
    <Link href="/magazine" style={{ textDecoration: "none" }}>
      <div style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", cursor: "pointer",
        filter: `drop-shadow(0 0 ${glowSize}px ${T.gold})`,
        transition: "filter 0.6s ease",
      }}>
        {/* Star shape via clip-path */}
        <div style={{
          width: 120, height: 120,
          clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          background: `linear-gradient(135deg, ${T.gold}, ${T.pink})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{ fontFamily: T.display, fontSize: 13, color: T.void, lineHeight: 1.1, textAlign: "center", padding: "28px 20px" }}>
            ENTER<br />MAGAZINE
          </span>
        </div>
        <span style={{ fontFamily: T.heading, fontSize: 10, color: T.gold, letterSpacing: 2, marginTop: 8 }}>
          ⚡ TAP TO ENTER
        </span>
      </div>
    </Link>
  );
}

// ── BELT HEADER ─────────────────────────────────────────
function BeltHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <span style={{ color: T.gold, fontSize: 14 }}>⚡</span>
      <span style={{ fontFamily: T.display, fontSize: 20, color: T.gold, letterSpacing: 2 }}>{label}</span>
      {sub && <span style={{ fontFamily: T.heading, fontSize: 11, color: T.text3, letterSpacing: 1 }}>{sub}</span>}
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.gold}66, transparent)` }} />
    </div>
  );
}

// ── NEWS BILLBOARD CARD ──────────────────────────────────
function NewsBillboardCard({ num, headline }: { num: number; headline: string }) {
  return (
    <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 16, alignItems: "flex-start" }}>
      <span style={{ fontFamily: T.display, fontSize: 32, color: T.gold, lineHeight: 1, minWidth: 28 }}>{num}</span>
      <div>
        <div style={{ fontFamily: T.heading, fontSize: 14, color: T.text, marginBottom: 4 }}>{headline}</div>
        <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3, letterSpacing: 1 }}>MUSIC NEWS</div>
      </div>
    </div>
  );
}

// ── SECTION JUMP CHIP ────────────────────────────────────
function JumpChip({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ display: "inline-block", padding: "6px 14px", border: `1px solid rgba(0,229,255,0.4)`, borderRadius: 99, color: T.cyan, fontFamily: T.heading, fontSize: 11, letterSpacing: 1, textDecoration: "none", transition: "all 0.2s" }}>
      {label}
    </Link>
  );
}

// ── LOBBY TILE ───────────────────────────────────────────
function LobbyTile({ rank }: { rank: number }) {
  return (
    <div style={{ position: "relative", background: T.raised, borderRadius: 8, aspectRatio: "1/1", overflow: "hidden", cursor: "pointer", border: `1px solid rgba(0,229,255,0.15)` }}>
      <div style={{ position: "absolute", top: 4, left: 4, background: "#FF2020", color: "#fff", fontFamily: T.heading, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>LIVE</div>
      <div style={{ position: "absolute", bottom: 6, left: 8, fontFamily: T.display, fontSize: 22, color: T.gold, textShadow: `2px 2px 0 ${T.void}` }}>{rank}</div>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
    </div>
  );
}

export default function Homepage() {
  const [time, setTime] = useState("01:14:32:05");
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
      setTime(`${h}:${m}:${s}:${ms}`);
    }, 100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: T.void, minHeight: "100vh", color: T.text, fontFamily: T.body }}>
      
      {/* ── NAV ── */}
      <nav style={{ background: T.deep, borderBottom: `1px solid rgba(255,184,0,0.3)`, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: T.display, fontSize: 9, color: T.cyan, letterSpacing: 3 }}>THE</div>
          <div style={{ fontFamily: T.display, fontSize: 22, color: T.gold, letterSpacing: 2, lineHeight: 1 }}>MUSICIAN&apos;S INDEX</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontFamily: T.heading, fontSize: 12, color: T.text2 }}>ISSUE: <span style={{ color: T.cyan }}>CURRENT WEEK</span></span>
          <span style={{ fontFamily: T.heading, fontSize: 12, color: T.text2 }}>CROWN: <span style={{ background: T.gold, color: T.void, fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>👑 WINNER</span></span>
        </div>
        <div style={{ display: "flex", gap: 16, color: T.text2 }}>
          <Link href="/search" style={{ color: T.text2, textDecoration: "none" }}>🔍</Link>
          <Link href="/notifications" style={{ color: T.text2, textDecoration: "none" }}>🔔</Link>
          <Link href="/dashboard/artist" style={{ color: T.text2, textDecoration: "none" }}>👤</Link>
        </div>
      </nav>

      {/* ── SECTION JUMP RAIL ── */}
      <div style={{ background: T.deep, borderBottom: `1px solid rgba(0,229,255,0.1)`, padding: "10px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <JumpChip href="/magazine" label="📰 MAGAZINE" />
        <JumpChip href="/lobby" label="🔴 LIVE LOBBY" />
        <JumpChip href="/editorial" label="✍️ EDITORIAL" />
        <JumpChip href="#discovery" label="🔍 DISCOVERY" />
        <JumpChip href="#contests" label="🏆 CONTESTS" />
        <JumpChip href="#stations" label="📻 STATIONS" />
        <JumpChip href="/advertise" label="📢 ADVERTISE" />
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>

        {/* ── BELT 0: HERO PORTAL ── */}
        <div style={{ textAlign: "center", padding: "48px 0 32px", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <div style={{ fontFamily: T.display, fontSize: 13, color: T.text3, letterSpacing: 4, marginBottom: 8 }}>WHO TOOK THE CROWN THIS WEEK?</div>
          
          {/* Artist collage grid (3×3) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, maxWidth: 400, margin: "0 auto 32px", borderRadius: 12, overflow: "hidden" }}>
            {[2,6,5,"👑",4,7,3,"👤",6].map((n, i) => (
              <div key={i} style={{ position: "relative", background: i === 4 ? `linear-gradient(135deg, ${T.pink}, ${T.purple})` : T.raised, aspectRatio: i === 4 ? "auto" : "1/1", gridRow: i === 4 ? "span 2" : "auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i === 4 ? 48 : 28 }}>
                {i === 4 ? "👑" : "👤"}
                {i !== 4 && <span style={{ position: "absolute", bottom: 4, left: 6, fontFamily: T.display, fontSize: 20, color: T.gold, textShadow: `2px 2px 0 ${T.void}` }}>{n}</span>}
                {i === 4 && <span style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontFamily: T.display, fontSize: 40, color: T.gold }}>1</span>}
              </div>
            ))}
          </div>

          {/* Magazine Jump Star — primary CTA */}
          <MagazineJumpStar />

          <div style={{ fontFamily: T.display, fontSize: 22, color: T.gold, letterSpacing: 3, marginTop: 24 }}>
            ⚡ WEEKLY CYPHERS! WHO TOOK THE CROWN? ⚡
          </div>
        </div>

        {/* ── BELT 1: LIVE WORLD ── */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <BeltHeader label="LIVE WORLD" sub="ACTIVITY BELT" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: T.card, border: `2px solid ${T.cyan}`, boxShadow: `0 0 12px rgba(0,229,255,0.35)`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ aspectRatio: "16/10", background: `linear-gradient(135deg, ${T.raised}, ${T.deep})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🎤</div>
              <div style={{ padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ background: "#FF2020", color: "#fff", fontFamily: T.heading, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>● LIVE</span>
                <span style={{ fontFamily: T.heading, fontSize: 14, fontWeight: 700 }}>MAIN PREVIEW LOBBY</span>
              </div>
            </div>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontFamily: T.heading, fontSize: 11, color: T.gold, letterSpacing: 1.5, marginBottom: 10 }}>LOBBY WALL</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginBottom: 12 }}>
                {[1,2,3,4,5,6,7,8].map(n => <LobbyTile key={n} rank={n} />)}
              </div>
              <div style={{ textAlign: "center" }}>
                <Link href="/lobby" style={{ display: "inline-block", padding: "8px 20px", background: `linear-gradient(135deg, ${T.pink}, ${T.purple})`, border: `1px solid ${T.pink}`, borderRadius: 8, fontFamily: T.heading, fontSize: 11, color: "#fff", textDecoration: "none", fontWeight: 700, letterSpacing: 1 }}>
                  ⚡ JOIN RANDOM ROOM
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── BELT 2: EDITORIAL ── */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <BeltHeader label="EDITORIAL BELT" sub="CONTENT" />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ aspectRatio: "4/3", background: `linear-gradient(135deg, ${T.raised}, ${T.deep})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎸</div>
              <div style={{ padding: 16 }}>
                <div style={{ background: T.gold, color: T.void, fontFamily: T.heading, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 8 }}>ARTICLE FEATURE</div>
                <div style={{ fontFamily: T.heading, fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>A Deep Dive into Indie Rock</div>
              </div>
            </div>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.pink, letterSpacing: 1.5, marginBottom: 10 }}>● LAST HOUR</div>
              {["Headline 1, breaking news...", "Headline 2, artist release...", "Headline 3, industry update...", "Headline 4, new events..."].map((h, i) => (
                <div key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "7px 0", fontSize: 12, color: T.text2 }}>{h}</div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: T.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎙</div>
                <div style={{ padding: 10 }}>
                  <div style={{ background: T.purple, color: "#fff", fontFamily: T.heading, fontSize: 9, padding: "2px 6px", borderRadius: 3, display: "inline-block", marginBottom: 6 }}>INTERVIEWS</div>
                  <div style={{ fontFamily: T.heading, fontSize: 12, fontWeight: 700 }}>THE INDEX SPEAKS: Interview...</div>
                </div>
              </div>
              <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: T.raised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎤</div>
                <div style={{ padding: 10 }}>
                  <div style={{ background: T.pink, color: "#fff", fontFamily: T.heading, fontSize: 9, padding: "2px 6px", borderRadius: 3, display: "inline-block", marginBottom: 6 }}>STUDIO RECAPS</div>
                  <div style={{ fontFamily: T.heading, fontSize: 12, fontWeight: 700 }}>CYPHER HIGHLIGHTS: Weekly Wrap-Up</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BELT 3: DISCOVERY ── */}
        <div id="discovery" style={{ padding: "32px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <BeltHeader label="DISCOVERY BELT" sub="CURATION" />
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16 }}>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.cyan, letterSpacing: 1.5, marginBottom: 12 }}>GENRE CLUSTER</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[["HIP HOP", T.purple], ["POP", T.teal], ["R&B", T.pink], ["ROCK", "#00A3B5"], ["JAZZ", "#1D9E75"], ["ELECTRONIC", T.purple]].map(([g, c]) => (
                  <div key={g} style={{ clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)", width: 72, height: 80, background: c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 11, color: "#fff", textAlign: "center", cursor: "pointer" }}>{g}</div>
                ))}
              </div>
            </div>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 16, color: T.gold, letterSpacing: 1, marginBottom: 12 }}>TOP 10 CHARTS</div>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                  <span style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 20, color: T.gold, minWidth: 22 }}>{n}</span>
                  <div>
                    <div style={{ fontFamily: T.heading, fontSize: 12, fontWeight: 600, color: n === 1 ? T.cyan : T.text }}>Artist Headline</div>
                    <div style={{ fontSize: 10, color: T.text3 }}>Hip Hop</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: T.raised, border: `1px solid rgba(255,184,0,0.5)`, boxShadow: `0 0 14px rgba(255,184,0,0.3)`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3, letterSpacing: 2 }}>WEEKLY PLAYLISTS</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 28, color: T.gold, letterSpacing: 2, lineHeight: 1.1 }}>INDEX PICKS</div>
              <div style={{ marginTop: "auto", fontFamily: T.heading, fontSize: 11, color: T.cyan, textDecoration: "underline" }}>A-Z Artist Directory →</div>
            </div>
          </div>
        </div>

        {/* ── BELT 4: TRENDS + EVENTS ── */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <BeltHeader label="DISCOVERY BELT" sub="TRENDS & EVENTS" />
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 16 }}>
            <div style={{ background: T.card, border: `1px solid rgba(255,184,0,0.5)`, boxShadow: `0 0 12px rgba(255,184,0,0.3)`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.gold, letterSpacing: 2, marginBottom: 6 }}>WORLD PREMIERES</div>
              <div style={{ fontFamily: T.heading, fontSize: 12, color: T.text2, marginBottom: 10 }}>An upcoming exclusive drop</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 36, color: T.cyan, letterSpacing: 4 }}>{time}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 8 }}>NEW TRACK</div>
            </div>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.gold, letterSpacing: 1.5, marginBottom: 10 }}>EVENT CALENDAR</div>
              {[["Concerts", T.pink], ["Saturday", T.cyan], ["Wednesday", T.gold]].map(([d, c]) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: T.text2 }}>{d}</span>
                </div>
              ))}
            </div>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: T.teal, padding: "4px 10px", fontFamily: T.heading, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.void }}>UNDISCOVERED BOOST</div>
              <div style={{ padding: 12 }}>
                <div style={{ fontFamily: T.heading, fontSize: 14, fontWeight: 700 }}>New Artist of the Day!</div>
                <div style={{ fontSize: 11, color: T.text3 }}>0 viewers → Position #1</div>
              </div>
            </div>
            <div style={{ background: T.raised, border: `1px solid ${T.cyan}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎤</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 18, color: T.cyan, letterSpacing: 1 }}>CYPHER ARENA</div>
              <div style={{ fontSize: 11, color: T.text2 }}>Go to active 1v1 battle rooms</div>
            </div>
          </div>
        </div>

        {/* ── BELT 5: MARKETPLACE ── */}
        <div style={{ padding: "32px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <BeltHeader label="PLATFORM & MARKETPLACE" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr", gap: 16 }}>
            <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: T.gold, padding: "4px 10px", fontFamily: T.heading, fontSize: 10, fontWeight: 700, color: T.void }}>THE STORE</div>
              <div style={{ padding: 16, textAlign: "center", fontSize: 40 }}>👕</div>
              <div style={{ padding: "8px 12px", fontFamily: T.heading, fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 1 }}>FEATURED MERCH</div>
            </div>
            <div style={{ background: T.card, border: `2px solid ${T.cyan}`, boxShadow: `0 0 12px rgba(0,229,255,0.3)`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 22, color: T.cyan, letterSpacing: 1, marginBottom: 8 }}>BOOKING PORTAL</div>
              <div style={{ fontSize: 13, color: T.text2 }}>Venues seeking talent • Submit your set</div>
              <div style={{ marginTop: "auto", fontFamily: T.heading, fontSize: 11, color: T.gold, marginTop: 16 }}>6 venues available this week →</div>
            </div>
            <div style={{ background: T.raised, border: `1px solid rgba(255,184,0,0.5)`, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3, letterSpacing: 1.5, marginBottom: 4 }}>MY ACHIEVEMENTS</div>
              <div style={{ fontSize: 10, color: T.text3, marginBottom: 4 }}>CURRENT SCORE</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 32, color: T.gold }}>850 pts</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${T.raised}, ${T.deep})`, border: `1px solid rgba(255,184,0,0.4)`, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: T.heading, fontSize: 10, color: T.gold, letterSpacing: 2, marginBottom: 8 }}>SPONSOR SPOTLIGHT</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 20, color: T.gold }}>High-end Ad</div>
              <div style={{ fontFamily: T.heading, fontSize: 11, color: T.text3, marginTop: 6 }}>POWERED BY: [RETRO LOGO]</div>
            </div>
          </div>
        </div>

        {/* ── BELT 6: ADVERTISER ── */}
        <div style={{ padding: "32px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontFamily: T.heading, fontSize: 10, color: T.text3, letterSpacing: 1 }}>ADVERTISING</span>
            <div style={{ flex: 1, height: 1, background: `rgba(255,255,255,0.05)` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: T.raised, border: `1px solid rgba(255,184,0,0.4)`, borderRadius: 10, padding: 16, position: "relative" }}>
              <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, color: T.text3, fontFamily: T.heading, background: "rgba(13,5,32,0.8)", padding: "2px 5px", borderRadius: 2 }}>Ad</div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎧</div>
              <div style={{ fontFamily: T.heading, fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 4 }}>Studio Pro Gear</div>
              <div style={{ fontSize: 12, color: T.text2, marginBottom: 10 }}>Professional studio equipment for serious artists.</div>
              <span style={{ background: T.gold, color: T.void, fontFamily: T.heading, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>SHOP NOW</span>
            </div>
            {[["🎵", "Beat Lab", "Exclusive beat packs"], ["🎤", "LiveSound Co", "PA systems for live performers"], ["✨", "Advertise here", "from $9.99/week"]].map(([icon, name, desc]) => (
              <div key={name} style={{ background: name === "Advertise here" ? T.deep : T.raised, border: `1px solid ${name === "Advertise here" ? "rgba(255,184,0,0.2)" : "rgba(255,184,0,0.35)"}`, borderBorderStyle: name === "Advertise here" ? "dashed" : "solid", borderRadius: 10, padding: 14, cursor: "pointer" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: T.heading, fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 11, color: T.text2 }}>{desc}</div>
                {name === "Advertise here" && <Link href="/advertise" style={{ display: "block", marginTop: 8, fontFamily: T.heading, fontSize: 10, color: T.cyan, textDecoration: "underline" }}>See packages</Link>}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.deep, borderTop: `1px solid rgba(0,229,255,0.2)`, display: "flex", zIndex: 100 }}>
        {[["🔴", "LIVE", "/lobby"], ["🎤", "LOBBY", "/lobby/rooms"], ["🔍", "FIND", "/search"], ["📰", "FEED", "/feed"], ["👤", "ME", "/dashboard/artist"]].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", fontFamily: T.heading, fontSize: 9, letterSpacing: 1, color: label === "LIVE" ? T.cyan : T.text3, textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ height: 64 }} />

    </div>
  );
}
