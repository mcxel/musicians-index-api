"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePresenceEngine } from "@/lib/live/presenceEngine";

// ─── Design tokens (matches reference: tmi_complete_all_four_dashboards_v2.html)
const C = {
  bg:    "#050815",
  panel: "rgba(8,14,38,.95)",
  red:   "#E63000",
  orange:"#FF6B00",
  amber: "#FF8C00",
  gold:  "#FFD700",
  green: "#00FF7F",
  cyan:  "#00E5FF",
  dim:   "rgba(255,140,0,.4)",
};

const ORBIT_NODES = [
  { emoji: "🎤", label: "Fan Theater",  href: "/fan/theater",        color: "#FF2DAA" },
  { emoji: "⚔️", label: "Battle Arena", href: "/rooms/battle/battle4",color: "#FFD700" },
  { emoji: "⚡", label: "Nova Cipher",  href: "/rooms/cypher",        color: "#00E5FF" },
  { emoji: "🎶", label: "World Concert",href: "/rooms/world-concert", color: "#00FF7F" },
  { emoji: "💃", label: "Dance Party",  href: "/rooms/world-dance-party", color: "#AA2DFF" },
  { emoji: "🎸", label: "Monday Stage", href: "/rooms/monday-stage",  color: "#FF6B00" },
  { emoji: "🎭", label: "Theater Hub",  href: "/live/lobby",          color: "#FF2DAA" },
  { emoji: "🎮", label: "Dirty Dozens", href: "/rooms/dirty-dozens",  color: "#00FFFF" },
];

const CHALLENGE_LINES = [
  "CHALLENGE YOUR SONG HERE",
  "SONG FOR SONG · WORK FOR WORK",
  "VIDEO FOR VIDEO · CROWD VOTES LIVE",
  "USE WHAT YOU HAVE RIGHT NOW",
];

function orbitPos(i: number, total: number, r: number) {
  const a = ((i / total) * 360 - 90) * (Math.PI / 180);
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
}

function PlatformPulse() {
  const presence = usePresenceEngine("fan-theater", 12000, "community");
  const watching = presence.watching;
  const liveRooms = 8;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", padding: "6px 0", fontFamily: "'Exo 2', sans-serif" }}>
      {[
        { label: "ONLINE",      value: watching.toLocaleString(), color: C.green },
        { label: "LIVE ROOMS",  value: liveRooms.toString(),      color: C.cyan  },
        { label: "GLOBAL",      value: "LIVE",                    color: C.red   },
      ].map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
          <span style={{ fontSize: 11, fontWeight: 900, color: s.color }}>{s.value}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: ".12em" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home1CoverPage() {
  const [chalIdx, setChalIdx] = useState(0);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [joinedName, setJoinedName] = useState<string | null>(null);
  const presence = usePresenceEngine("fan-theater", 8000, "community");
  const joinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotate orbit slowly with a pause
  useEffect(() => {
    let stopped = false;
    const spin = () => {
      if (stopped) return;
      setOrbitAngle(a => a + 36);
      setTimeout(spin, 3200);
    };
    const t = setTimeout(spin, 2000);
    return () => { stopped = true; clearTimeout(t); };
  }, []);

  // Challenge line rotator
  useEffect(() => {
    const id = setInterval(() => setChalIdx(i => (i + 1) % CHALLENGE_LINES.length), 2600);
    return () => clearInterval(id);
  }, []);

  // Show joined name briefly
  useEffect(() => {
    if (presence.joinedRecently.length > 0) {
      setJoinedName(presence.joinedRecently[0] ?? null);
      if (joinTimer.current) clearTimeout(joinTimer.current);
      joinTimer.current = setTimeout(() => setJoinedName(null), 2500);
    }
  }, [presence.joinedRecently]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: "#fff", fontFamily: "'Exo 2', sans-serif", overflowX: "hidden", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes h1Flicker { 0%,93%,100%{opacity:1} 94%,99%{opacity:.5} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      `}</style>

      {/* ── HEADER BAR ── */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.red}44`, padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: C.red, fontSize: 13, letterSpacing: ".08em", animation: "h1Flicker 4s ease-in-out infinite", textTransform: "uppercase" }}>
          THE MUSICIAN&apos;S INDEX
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <motion.div animate={{ opacity: [1,0,1] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ fontSize: 8, color: C.green, fontWeight: 700, letterSpacing: ".1em" }}>LIVE</span>
          <span style={{ fontSize: 8, color: C.dim, marginLeft: 8 }}>{new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Link href="/auth/signin" style={navBtn(C.red)}>LOGIN</Link>
          <Link href="/auth/signup" style={navBtn(C.green)}>JOIN FREE</Link>
        </div>
      </div>

      {/* ── PLATFORM PULSE ── */}
      <PlatformPulse />

      {/* ── ARTIST SPOTLIGHT: BIG KAZHDOG ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ background: C.panel, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: "14px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: ".15em", marginBottom: 4 }}>ARTIST SPOTLIGHT</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: C.gold }}>Big KazhDog</div>
            <div style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>HIP-HOP · BIG KASH RECORDS</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/rooms/fan-theater?artist=big-kazhdog" style={pill("📡 WATCH", C.cyan, "rgba(0,229,255,.15)")} />
            <Link href="/battles/new?challenge=big-kazhdog" style={pill("⚔️ CHALLENGE", C.red, "rgba(230,48,0,.15)")} />
            <div style={{ background: C.panel, border: `1px solid ${C.gold}55`, borderRadius: 6, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 8, color: C.dim }}>RANK</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 900, color: C.gold }}>#1</div>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.cyan}44`, borderRadius: 6, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 8, color: C.dim }}>WATCHING</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: C.cyan }}>{presence.watching}</div>
            </div>
          </div>
        </div>

        {/* ── CHALLENGE BANNER ── */}
        <div style={{ background: "linear-gradient(92deg, rgba(255,215,0,.18), rgba(255,45,170,.22))", border: `1px solid ${C.gold}55`, borderRadius: 8, padding: "10px 16px", marginBottom: 12, textAlign: "center", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div key={chalIdx} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.3 }}>
              <Link href="/battles/new" style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, fontWeight: 900, color: "#fff7d5", textTransform: "uppercase", letterSpacing: ".12em" }}>
                  {CHALLENGE_LINES[chalIdx]}
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── JOINED NOTICE ── */}
        <AnimatePresence>
          {joinedName && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", fontSize: 10, color: C.cyan, marginBottom: 8 }}>
              + {joinedName} just joined the platform
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ORBIT WHEEL ── */}
        <div style={{ position: "relative", width: "min(680px, 100%)", margin: "0 auto 16px", aspectRatio: "1" }}>
          {/* Ring */}
          <div style={{ position: "absolute", inset: "10%", borderRadius: "50%", border: `2px solid ${C.gold}22`, boxShadow: `inset 0 0 60px rgba(0,0,0,.8), 0 0 30px ${C.gold}08` }} />

          {/* Center hub */}
          <Link href="/fan/theater" style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            width: "clamp(120px,18vw,180px)", height: "clamp(120px,18vw,180px)", borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, rgba(43,255,210,.3), rgba(0,0,0,.8))`,
            border: `2px solid ${C.cyan}66`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", textDecoration: "none", zIndex: 10,
            boxShadow: `inset 0 0 30px rgba(0,0,0,.9), 0 0 24px ${C.cyan}33`,
            animation: "centerPulse 2.6s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "clamp(24px,4vw,36px)" }}>🎤</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 700, color: C.green, marginTop: 4, textAlign: "center", lineHeight: 1.2 }}>BIG KAZHDOG</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".08em" }}>ENTER LIVE</span>
          </Link>

          {/* Orbit nodes */}
          {ORBIT_NODES.map((node, i) => {
            const pos = orbitPos(i, ORBIT_NODES.length, 39);
            return (
              <Link key={node.label} href={node.href} style={{
                position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`,
                transform: "translate(-50%,-50%)",
                width: "clamp(60px,9vw,88px)", height: "clamp(60px,9vw,88px)",
                borderRadius: 12, textDecoration: "none", zIndex: 9,
                background: `linear-gradient(145deg, ${node.color}22, #050815)`,
                border: `1px solid ${node.color}55`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                boxShadow: `0 4px 16px rgba(0,0,0,.6)`,
                transition: "transform .2s, box-shadow .2s",
              }}>
                <span style={{ fontSize: "clamp(18px,3vw,26px)" }}>{node.emoji}</span>
                <span style={{ fontSize: 7, color: node.color, fontWeight: 700, textAlign: "center", letterSpacing: ".04em", textTransform: "uppercase", lineHeight: 1.2 }}>{node.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── CTA GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
          {[
            { label: "🔴 GO PUBLIC NOW",    href: "/performer/studio",    color: C.cyan    },
            { label: "🎤 ENTER LIVE ARENA", href: "/fan/theater",          color: C.red     },
            { label: "⚔️ CHALLENGE SONG",   href: "/battles/new",          color: "#FF2DAA" },
            { label: "📰 MAGAZINE",          href: "/magazine",             color: C.gold    },
            { label: "🤝 SPONSOR",          href: "/hub/sponsor",          color: C.amber   },
            { label: "📢 ADVERTISE",         href: "/hub/advertiser",       color: "#9B59B6" },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{
              background: `${a.color}18`, border: `1px solid ${a.color}55`,
              borderRadius: 8, padding: "10px 8px", textAlign: "center",
              fontFamily: "'Exo 2', sans-serif", fontSize: 10, fontWeight: 900,
              color: a.color, textDecoration: "none", letterSpacing: ".06em",
              textTransform: "uppercase", display: "block",
            }}>
              {a.label}
            </Link>
          ))}
        </div>

        {/* ── LIVE TICKER ── */}
        <div style={{ overflow: "hidden", borderTop: `1px solid ${C.red}33`, borderBottom: `1px solid ${C.red}22`, height: 24, display: "flex", alignItems: "center", marginBottom: 16 }}>
          <div style={{ animation: "mcTicker 20s linear infinite", whiteSpace: "nowrap", fontSize: 9, color: C.gold, letterSpacing: ".12em" }}>
            &nbsp;&nbsp;&nbsp;&nbsp;
            🔴 BIG KAZHDOG — THUNDER ZONE — LIVE NOW &nbsp;·&nbsp;
            🎤 OPEN MIC STARTING SOON &nbsp;·&nbsp;
            ⚔️ BATTLE ARENA OPEN &nbsp;·&nbsp;
            ⚡ NOVA CIPHER ACTIVE &nbsp;·&nbsp;
            🌍 TMI — THE SCENE IS LIVE &nbsp;·&nbsp;
            👑 WEEKLY CROWN VOTE OPEN &nbsp;·&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* ── STAT BADGES ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", paddingBottom: 32 }}>
          {[
            { label: "VOTING LIVE",     color: "#FF2DAA", bg: "rgba(255,45,170,.15)" },
            { label: "CROWN UPDATING",  color: C.red,     bg: "rgba(230,48,0,.15)"   },
            { label: "BIG KAZHDOG #1",  color: C.gold,    bg: "rgba(255,215,0,.15)"  },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.color}66`, borderRadius: 5, padding: "5px 14px", fontSize: 10, fontWeight: 800, color: b.color, letterSpacing: ".1em" }}>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes centerPulse {
          0%,100% { box-shadow: 0 22px 38px rgba(0,0,0,.56); }
          50% { box-shadow: 0 22px 38px rgba(0,0,0,.56), 0 0 28px ${C.cyan}44; }
        }
        @keyframes mcTicker { from{transform:translateX(110%)} to{transform:translateX(-110%)} }
      `}</style>
    </div>
  );
}

function navBtn(color: string): React.CSSProperties {
  return { background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 4, padding: "5px 12px", fontSize: 9, fontWeight: 800, color, textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase" };
}

function pill(label: string, color: string, bg: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${color}55`, borderRadius: 6, padding: "7px 14px", fontSize: 10, fontWeight: 800, color, textDecoration: "none", letterSpacing: ".06em", textTransform: "uppercase" };
}
