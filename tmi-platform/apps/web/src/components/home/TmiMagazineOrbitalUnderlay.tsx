"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

// ── Bold solid editorial panels — print magazine style ─────────────────────
const PANELS = [
  {
    bg: "#FFD700", headerBg: "#FF1493", headerColor: "rgba(0,0,0,0.6)",
    headline: "WHO TOOK THE CROWN?",
    artistLabel: "COVER PERFORMER", artist: "THIS WEEK'S #1",
    statLine: "LIVE RANKING · UPDATED IN REAL TIME · ALL GENRES",
    tags: [
      { bg: "#00BFFF", c: "#000", text: "CYPHER OPEN NOW" },
      { bg: "#FF1493", c: "#fff", text: "VOTE NOW" },
      { bg: "#000",    c: "#FFD700", text: "4,812 VOTES CAST" },
    ],
    footer: "STREAM & WIN RADIO LIVE · BATTLE TONIGHT 8PM",
    footerBg: "#FFD700", footerColor: "#000",
    href: "/vote",
  },
  {
    bg: "#000", headerBg: "#00FFFF", headerColor: "#000",
    headline: "JOIN FREE. WIN CASH & PRIZES.",
    artistLabel: "FOR FANS", artist: "FREE TO JOIN",
    statLine: "VOTE · TIP · CHEER · EARN REWARDS",
    tags: [
      { bg: "#00FFFF", c: "#000", text: "CREATE ACCOUNT NOW" },
      { bg: "#FF1493", c: "#fff", text: "WIN REAL MONEY" },
      { bg: "#FFD700", c: "#000", text: "NO CREDIT CARD" },
    ],
    footer: "JOIN TODAY — SUPPORT YOUR FAVORITE ARTISTS LIVE",
    footerBg: "#00FFFF", footerColor: "#000",
    href: "/signup",
  },
  {
    bg: "#FF1493", headerBg: "#000", headerColor: "#FF1493",
    headline: "BATTLE NIGHT CHAMPION",
    artistLabel: "REIGNING CHAMP", artist: "THIS WEEK'S WINNER",
    statLine: "LIVE BATTLES · HIP-HOP · R&B · DANCE · COMEDY",
    tags: [{ bg: "#00BFFF", c: "#000", text: "CHALLENGE OPENS 8PM TONIGHT" }],
    footer: "ENTER YOUR SONG · VOTE FOR A WINNER · WIN PRIZES",
    footerBg: "#000", footerColor: "#FF1493",
    href: "/battles/live",
  },
  {
    bg: "#AA2DFF", headerBg: "#000", headerColor: "#AA2DFF",
    headline: "CONCERTS · COMEDY · DANCE",
    artistLabel: "LIVE EVERY DAY", artist: "ALL GENRES",
    statLine: "RAP · R&B · GOSPEL · DJ · COMEDY · DANCE",
    tags: [
      { bg: "#FF1493", c: "#fff", text: "WATCH LIVE NOW" },
      { bg: "#FFD700", c: "#000", text: "BUY TICKETS" },
      { bg: "#00BFFF", c: "#000", text: "FREE SEATS AVAILABLE" },
    ],
    footer: "YOUR FAVORITE ARTISTS PERFORM HERE EVERY NIGHT",
    footerBg: "#AA2DFF", footerColor: "#fff",
    href: "/live",
  },
  {
    bg: "#00BFFF", headerBg: "#000", headerColor: "#00BFFF",
    headline: "WHO'S GOT THE BARS?",
    artistLabel: "OPEN MIC NOW", artist: "DROP IN ANYTIME",
    statLine: "CYPHER ARENA — LIVE AUDIENCE WATCHING",
    tags: [{ bg: "#000", c: "#00BFFF", text: "THEATER SEATS · OPEN ALL DAY" }],
    footer: "WATCH · VOTE · CHEER · WIN XP AND PRIZES",
    footerBg: "#000", footerColor: "#00BFFF",
    href: "/rooms/cypher?autoSeat=1",
  },
  {
    bg: "#000", headerBg: "#FFD700", headerColor: "#000",
    headline: "SUPPORT YOUR FAVORITE ARTISTS",
    artistLabel: "FOR FANS", artist: "TIP · VOTE · FOLLOW",
    statLine: "SEND TIPS LIVE · VOTE THEM TO #1 · WIN TOGETHER",
    tags: [
      { bg: "#FFD700", c: "#000", text: "TIP YOUR ARTIST NOW" },
      { bg: "#FF1493", c: "#fff", text: "FAN CLUB PERKS" },
    ],
    footer: "YOUR SUPPORT MOVES THEM UP THE RANKINGS",
    footerBg: "#FFD700", footerColor: "#000",
    href: "/fan-club",
  },
  {
    bg: "#FFD700", headerBg: "#000", headerColor: "#FFD700",
    headline: "CHALLENGE THE CROWN HOLDER",
    artistLabel: "OPEN CHALLENGE", artist: "ANY SONG. ANY GENRE.",
    statLine: "ARTISTS COMPETE · FANS VOTE · WINNER CROWNED",
    tags: [
      { bg: "#FF1493", c: "#fff", text: "YOUR SONG CAN TAKE THE THRONE" },
      { bg: "#00BFFF", c: "#000", text: "ARENA SEATS 18,500" },
    ],
    footer: "CHALLENGE RUNS ALL DAY · WINNER STAYS · NONSTOP",
    footerBg: "#000", footerColor: "#FFD700",
    href: "/challenge",
  },
  {
    bg: "#000", headerBg: "#FF1493", headerColor: "#fff",
    headline: "STREAM & WIN RADIO",
    artistLabel: "LISTEN + EARN", artist: "FREE TO STREAM",
    statLine: "STREAM MUSIC · EARN XP · WIN CASH PRIZES",
    tags: [
      { bg: "#FF1493", c: "#fff", text: "TUNE IN FREE" },
      { bg: "#FFD700", c: "#000", text: "DAILY PRIZES" },
      { bg: "#00BFFF", c: "#000", text: "NO ADS FOR MEMBERS" },
    ],
    footer: "LISTEN TO MUSIC AND GET PAID — ONLY ON TMI",
    footerBg: "#FF1493", footerColor: "#fff",
    href: "/radio",
  },
];

// ── 10 orbit nodes — weekly crown rankings ─────────────────────────────────
const ORBIT_NODES = [
  { rank: "#1", contextRank: "#1 Global DJ", name: "ASTRA NOVA", genre: "DJ / Turntablist", color: "#FF2DAA", live: true, audienceCount: 1284, countryFlag: "🇺🇸", countryCode: "USA", countryName: "United States", watchHref: "/live/rooms/dj-astra-nova", profileHref: "/artist/astra-nova" },
  { rank: "#2", contextRank: "#2 Rising DJ", name: "PRISM VEX", genre: "EDM DJ", color: "#FFD700", live: true, audienceCount: 943, countryFlag: "🇬🇧", countryCode: "UK", countryName: "United Kingdom", watchHref: "/live/rooms/prism-vex", profileHref: "/artist/prism-vex" },
  { rank: "#3", contextRank: "#3 DJ Battle Champion", name: "ZION FREQ", genre: "Battle DJ", color: "#00FF7F", live: false, audienceCount: 402, countryFlag: "🇨🇦", countryCode: "CAN", countryName: "Canada", watchHref: "/live/rooms/zion-freq", profileHref: "/artist/zion-freq" },
  { rank: "#4", contextRank: "#4 Comedy Challenge", name: "NOVA LAUGH", genre: "Stand-Up Comedy", color: "#00FFFF", live: true, audienceCount: 611, countryFlag: "🇳🇬", countryCode: "NGA", countryName: "Nigeria", watchHref: "/live/rooms/nova-laugh", profileHref: "/artist/nova-laugh" },
  { rank: "#5", contextRank: "#5 DJ Discovery", name: "FLEX KING", genre: "Open Format DJ", color: "#AA2DFF", live: false, audienceCount: 288, countryFlag: "🇦🇺", countryCode: "AUS", countryName: "Australia", watchHref: "/live/rooms/flex-king", profileHref: "/artist/flex-king" },
  { rank: "#6", contextRank: "#6 Producer Showcase", name: "BEAT GRID", genre: "Producer", color: "#FF8C00", live: false, audienceCount: 198, countryFlag: "🇩🇪", countryCode: "DEU", countryName: "Germany", watchHref: "/live/rooms/beat-grid", profileHref: "/artist/beat-grid" },
  { rank: "#7", contextRank: "#7 Dance-Off Challenge", name: "DANCE CREW", genre: "Dance Crew", color: "#E63000", live: true, audienceCount: 859, countryFlag: "🇧🇷", countryCode: "BRA", countryName: "Brazil", watchHref: "/live/rooms/dance-crew", profileHref: "/artist/dance-crew" },
  { rank: "#8", contextRank: "#8 Afrobeat Discovery", name: "LAGOS BURST", genre: "Afrobeat", color: "#FFD700", live: false, audienceCount: 334, countryFlag: "🇳🇬", countryCode: "NGA", countryName: "Nigeria", watchHref: "/live/rooms/lagos-burst", profileHref: "/artist/lagos-burst" },
  { rank: "#9", contextRank: "#9 Spoken Word Arena", name: "CIPHER SOUL", genre: "Spoken Word", color: "#00FFFF", live: false, audienceCount: 147, countryFlag: "🇿🇦", countryCode: "ZAF", countryName: "South Africa", watchHref: "/live/rooms/cipher-soul", profileHref: "/artist/cipher-soul" },
  { rank: "#10", contextRank: "#10 Audience Favorite", name: "MAIN LOBBY", genre: "Multi-Genre", color: "#FF2DAA", live: true, audienceCount: 1532, countryFlag: "🌍", countryCode: "GLB", countryName: "Global", watchHref: "/home/live", profileHref: "/artist/main-lobby" },
];

const WHEEL  = 380;  // px — container size
const CENTER = 190;  // px — center of container
const ORBIT_R = 154; // px — orbit radius (matches reference HTML)
const NODE_W  = 132; // clean-tile width
const NODE_H  = 166; // clean-tile height (portrait-safe metadata layout)

function nodePosition(idx: number): { left: number; top: number } {
  const angle = (idx / ORBIT_NODES.length) * 2 * Math.PI - Math.PI / 2;
  return {
    left: CENTER + ORBIT_R * Math.cos(angle) - NODE_W / 2,
    top:  CENTER + ORBIT_R * Math.sin(angle) - NODE_H / 2,
  };
}

const SPIN = { duration: 38, repeat: Infinity, ease: "linear" as const };

export default function TmiMagazineOrbitalUnderlay() {
  const [direction, setDirection] = useState<1 | -1>(1);

  return (
    <section
      style={{
        position: "relative", width: "100%", overflow: "hidden",
        borderTop: "1px solid rgba(255,215,0,0.12)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#020205",
        minHeight: 420,
      }}
    >
      {/* ── SCROLLING TABLOID UNDERLAY — solid editorial panels ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", overflow: "hidden", pointerEvents: "none" }}>
        <motion.div
          animate={{ x: direction > 0 ? [0, "-50%"] : ["-50%", 0] }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity }}
          style={{ display: "flex", flexShrink: 0 }}
        >
          {[...PANELS, ...PANELS].map((p, i) => (
            <Link
              key={i}
              href={p.href}
              style={{
                textDecoration: "none", display: "flex", flexDirection: "column",
                width: 280, minWidth: 280, flexShrink: 0,
                border: "1px solid #000", overflow: "hidden",
                minHeight: 380, opacity: 0.92,
                willChange: "transform",
              }}
            >
              {/* Header strip */}
              <div style={{ background: p.headerBg, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: p.headerColor, fontWeight: 700, letterSpacing: "0.05em" }}>
                  THE MUSICIAN&apos;S INDEX · VOL.1 · WEEK 25 · $4.99
                </div>
              </div>

              {/* Body */}
              <div style={{ background: p.bg, padding: "14px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  fontFamily: "'Anton','Impact',sans-serif",
                  fontSize: 32,
                  color: p.bg === "#000" ? "#FFD700" : "#000",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {p.headline}
                </div>
                <div style={{ background: "#00BFFF", padding: 8 }}>
                  <div style={{ fontSize: 8, fontWeight: 800, color: "#000" }}>{p.artistLabel}</div>
                  <div style={{ fontFamily: "'Anton','Impact',sans-serif", fontSize: 20, color: "#000" }}>{p.artist}</div>
                </div>
                <div style={{ background: "#000", color: "#fff", padding: "6px 8px", fontSize: 8 }}>
                  {p.statLine}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {p.tags.map((t, ti) => (
                    <div key={ti} style={{ background: t.bg, padding: "3px 8px", fontSize: 8, fontWeight: 800, color: t.c }}>
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: p.footerBg, padding: "5px 12px", fontSize: 8, color: p.footerColor, fontWeight: 700, borderTop: "2px solid #000" }}>
                {p.footer}
              </div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Side vignettes — reduced density to avoid bleed/noise */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(90deg, rgba(5,5,16,0.1) 0%, transparent 18%, transparent 82%, rgba(5,5,16,0.1) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(5,5,16,0.04) 0%, rgba(5,5,16,0.12) 100%)",
      }} />

      {/* ── ORBITAL WHEEL — floats above underlay ── */}
      <div style={{
        position: "relative", zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: 390, paddingTop: 24, paddingBottom: 20,
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 14, fontWeight: 900, color: "#FFD700",
            letterSpacing: "0.08em", textShadow: "0 0 20px rgba(255,215,0,0.6)",
          }}>
            WEEKLY CROWN ORBIT
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>
            TOP RANKED · LIVE NOW · UPDATED IN REAL TIME
          </div>
        </div>

        {/* Wheel container */}
        <div style={{ position: "relative", width: WHEEL, height: WHEEL, maxWidth: "100%" }}>

          {/* SVG track rings */}
          <svg
            viewBox={`0 0 ${WHEEL} ${WHEEL}`}
            width={WHEEL} height={WHEEL}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <circle cx={CENTER} cy={CENTER} r={174} fill="none" stroke="rgba(255,215,0,0.12)" strokeWidth={1} />
            <circle cx={CENTER} cy={CENTER} r={155} fill="none" stroke="rgba(255,45,170,0.15)" strokeWidth={0.8} strokeDasharray="5 9" />
            <circle cx={CENTER} cy={CENTER} r={105} fill="none" stroke="rgba(0,229,255,0.12)" strokeWidth={0.6} strokeDasharray="3 12" />
            {/* Spokes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={CENTER + 85 * Math.cos(rad)} y1={CENTER + 85 * Math.sin(rad)}
                  x2={CENTER + 35 * Math.cos(rad)} y2={CENTER + 35 * Math.sin(rad)}
                  stroke="rgba(255,215,0,0.1)" strokeWidth={0.5}
                />
              );
            })}
            {/* Center dark disk */}
            <circle cx={CENTER} cy={CENTER} r={72} fill="rgba(2,2,5,0.94)" stroke="rgba(0,229,255,0.5)" strokeWidth={1.5} />
            <circle cx={CENTER} cy={CENTER} r={68} fill="none" stroke="rgba(255,215,0,0.18)" strokeWidth={0.5} />
          </svg>

          {/* Rotating orbit ring with 10 artist nodes */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={SPIN}
            style={{ position: "absolute", inset: 0, transformOrigin: "center" }}
          >
            {ORBIT_NODES.map((node, idx) => {
              const { left, top } = nodePosition(idx);
              return (
                <motion.div
                  key={node.rank}
                  animate={{ rotate: -360 }}
                  transition={SPIN}
                  style={{ position: "absolute", left, top, transformOrigin: "center" }}
                >
                  <Link
                    href={node.live ? node.watchHref : node.profileHref}
                    aria-label={node.live ? `Watch ${node.name} live` : `View ${node.name} profile`}
                    style={{
                      display: "block",
                      width: NODE_W,
                      minHeight: NODE_H,
                      borderRadius: 12,
                      overflow: "hidden",
                      textDecoration: "none",
                      border: `1px solid ${node.color}99`,
                      boxShadow: `0 8px 22px ${node.color}33`,
                      background: "linear-gradient(180deg, rgba(8,8,14,0.88) 0%, rgba(6,6,10,0.96) 100%)",
                      padding: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 900,
                        color: node.rank === "#1" ? "#FFD700" : node.rank === "#2" ? "#C0C0C0" : node.rank === "#3" ? "#CD7F32" : "#fff",
                        background: "rgba(0,0,0,0.55)",
                        border: "1px solid rgba(255,255,255,0.16)",
                        borderRadius: 999,
                        padding: "2px 7px",
                        letterSpacing: "0.04em",
                      }}>
                        {node.rank}
                      </span>
                      <span style={{ fontSize: 11, color: "#fff" }}>
                        {node.countryFlag} {node.countryCode}
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "4 / 5",
                        borderRadius: 8,
                        background: `radial-gradient(circle at 50% 38%, ${node.color}66 0%, rgba(12,12,20,0.95) 70%)`,
                        border: "1px solid rgba(255,255,255,0.12)",
                        marginBottom: 8,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        inset: "14% 18%",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        boxShadow: "0 0 0 10px rgba(255,255,255,0.03)",
                      }} />
                    </div>

                    <div style={{
                      borderTop: "1px solid rgba(255,255,255,0.14)",
                      paddingTop: 6,
                      minHeight: "25%",
                    }}>
                      <div style={{ fontSize: 8, color: node.color, fontWeight: 800, marginBottom: 2 }}>{node.contextRank}</div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{node.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <span style={{
                          fontSize: 7,
                          color: "rgba(255,255,255,0.9)",
                          border: `1px solid ${node.color}88`,
                          borderRadius: 999,
                          padding: "1px 6px",
                        }}>
                          {node.genre}
                        </span>
                        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.78)" }}>{node.countryName}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <span style={{ fontSize: 8, color: node.live ? "#61ff8f" : "rgba(210,210,210,0.75)", fontWeight: 800 }}>
                          {node.live ? "● LIVE" : "● OFFLINE"}
                        </span>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.88)" }}>
                          {node.audienceCount.toLocaleString()} watching
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Center hub */}
          <Link href="/signup" style={{ textDecoration: "none", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
            <div style={{
              width: 136, height: 136, borderRadius: "50%",
              background: "rgba(2,2,5,0.96)",
              border: "2px solid rgba(0,229,255,0.6)",
              boxShadow: "0 0 40px rgba(0,229,255,0.25)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              padding: 8,
            }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: 3 }}>
                THE MUSICIAN&apos;S INDEX
              </div>
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 10, fontWeight: 900, color: "#00FFFF",
                lineHeight: 1.2, marginBottom: 3,
              }}>
                JOIN<br />FREE
              </div>
              <div style={{ fontSize: 7, color: "#FFD700", fontWeight: 800, letterSpacing: "0.05em" }}>WIN CASH & PRIZES</div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ marginTop: 5, background: "#FF1493", borderRadius: 999, padding: "2px 10px", fontSize: 7, fontWeight: 900, color: "#fff" }}
              >
                START NOW →
              </motion.div>
            </div>
          </Link>
        </div>
      </div>

      {/* Scroll direction controls */}
      <div style={{ position: "absolute", bottom: 10, right: 12, zIndex: 30, display: "flex", gap: 6 }}>
        <button
          onClick={() => setDirection(-1)}
          style={{
            padding: "4px 10px",
            background: direction === -1 ? "rgba(255,215,0,0.2)" : "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4,
            color: "#FFD700", fontSize: 9, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          ◀ SCROLL
        </button>
        <button
          onClick={() => setDirection(1)}
          style={{
            padding: "4px 10px",
            background: direction === 1 ? "rgba(255,215,0,0.9)" : "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4,
            color: direction === 1 ? "#000" : "#FFD700",
            fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          SCROLL ▶
        </button>
      </div>
    </section>
  );
}
