"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

// ── Bold solid editorial panels — print magazine style ─────────────────────
const PANELS = [
  {
    bg: "#FFD700", headerBg: "#FF1493", headerColor: "rgba(0,0,0,0.6)",
    headline: "WHO TOOK THE CROWN?",
    artistLabel: "COVER PERFORMER", artist: "BIG ACE",
    statLine: "RANK · DJ BLEND · 41 CYPHER WINS",
    tags: [
      { bg: "#00BFFF", c: "#000", text: "CYPHER OPEN" },
      { bg: "#FF1493", c: "#fff", text: "VOTE NOW" },
      { bg: "#000",    c: "#FFD700", text: "4,812 VOTES" },
    ],
    footer: "STREAM & WIN RADIO LIVE · BATTLE TONIGHT 8PM",
    footerBg: "#FFD700", footerColor: "#000",
    href: "/vote",
  },
  {
    bg: "#FF1493", headerBg: "#000", headerColor: "#FF1493",
    headline: "BATTLE NIGHT CHAMPION",
    artistLabel: "REIGNING CHAMP", artist: "WAVETEK",
    statLine: "47 WINS · HIP-HOP · UNDEFEATED",
    tags: [{ bg: "#00BFFF", c: "#000", text: "CHALLENGE OPENS 8PM TONIGHT" }],
    footer: "JOIN THE BATTLE · ENTER YOUR SONG · WIN TONIGHT",
    footerBg: "#000", footerColor: "#FF1493",
    href: "/battles/live",
  },
  {
    bg: "#00BFFF", headerBg: "#000", headerColor: "#00BFFF",
    headline: "WHO'S GOT THE BARS?",
    artistLabel: "ON THE MIC NOW", artist: "NOVA CIPHER",
    statLine: "CYPHER ARENA — 841 WATCHING LIVE",
    tags: [{ bg: "#000", c: "#00BFFF", text: "THEATER SEATS 2,730 · DROP IN ANYTIME" }],
    footer: "OPEN MIC ALL DAY · ROTATE THROUGH · WIN XP",
    footerBg: "#000", footerColor: "#00BFFF",
    href: "/rooms/cypher?autoSeat=1",
  },
  {
    bg: "#000", headerBg: "#FFD700", headerColor: "#000",
    headline: "CHALLENGE THE CROWN HOLDER",
    artistLabel: "DEFENDING TITLE", artist: "BEAT THE BEAT",
    statLine: "WAVETEK · 841 VOTES · RUNNING NOW",
    tags: [
      { bg: "#FF1493", c: "#fff", text: "YOUR SONG CAN TAKE THE THRONE" },
      { bg: "#00BFFF", c: "#000", text: "ARENA SEATS 18,500" },
    ],
    footer: "CHALLENGE RUNS ALL DAY · WINNER STAYS · NONSTOP",
    footerBg: "#FFD700", footerColor: "#000",
    href: "/challenge",
  },
];

// ── 10 orbit nodes — weekly crown rankings ─────────────────────────────────
const ORBIT_NODES = [
  { rank: "#1",  name: "ASTRA NOVA",    genre: "R&B",      color: "#FF2DAA", live: true  },
  { rank: "#2",  name: "PRISM VEX",     genre: "EDM",      color: "#FFD700", live: false },
  { rank: "#3",  name: "ZION FREQ",     genre: "Gospel",   color: "#00FF7F", live: false },
  { rank: "#4",  name: "FLEX KING",     genre: "Dance",    color: "#00FFFF", live: false },
  { rank: "#5",  name: "SONG CHALL.",   genre: "Hip-Hop",  color: "#AA2DFF", live: false },
  { rank: "#6",  name: "MAIN LOBBY",    genre: "Various",  color: "#FF8C00", live: false },
  { rank: "#7",  name: "BATTLE FLOOR",  genre: "LIVE",     color: "#E63000", live: true  },
  { rank: "#8",  name: "LAGOS BURST",   genre: "Afrobeat", color: "#FFD700", live: false },
  { rank: "#9",  name: "NOVA LAUGH",    genre: "Comedy",   color: "#00FFFF", live: false },
  { rank: "#10", name: "DANCE CREW",    genre: "Dance",    color: "#FF2DAA", live: false },
];

const WHEEL  = 380;  // px — container size
const CENTER = 190;  // px — center of container
const ORBIT_R = 154; // px — orbit radius (matches reference HTML)
const NODE_W  = 84;  // approx node width
const NODE_H  = 44;  // approx node height

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
                  <div style={{
                    background: `${node.color}22`,
                    border: `1.5px solid ${node.color}`,
                    borderRadius: 6, padding: "5px 8px",
                    textAlign: "center", minWidth: NODE_W,
                  }}>
                    <div style={{ fontSize: 8, color: node.color, fontWeight: 800 }}>
                      {node.rank}
                      {node.live && (
                        <span style={{
                          display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                          background: "#FF2020", marginLeft: 4, verticalAlign: "middle",
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{node.name}</div>
                    <div style={{ fontSize: 7, color: node.live ? node.color : "rgba(255,255,255,0.5)" }}>
                      {node.genre}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Center hub */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 136, height: 136, borderRadius: "50%",
            background: "rgba(2,2,5,0.96)",
            border: "2px solid rgba(0,229,255,0.6)",
            boxShadow: "0 0 40px rgba(0,229,255,0.15)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", textAlign: "center",
          }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 2 }}>
              HOME 1/6
            </div>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11, fontWeight: 900, color: "#FF2DAA",
              lineHeight: 1.2, marginBottom: 2,
            }}>
              ASTRA<br />NOVA
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>R&amp;B · LIVE NOW</div>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#FF2020", marginTop: 4 }}
            />
          </div>
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
